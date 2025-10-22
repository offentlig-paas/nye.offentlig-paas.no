import {
  router,
  protectedProcedure,
  createEventAccessMiddleware,
} from '../trpc'
import { z } from 'zod'
import { eventRegistrationService } from '@/domains/event-registration'
import { eventFeedbackService } from '@/domains/event-feedback/service'
import { TRPCError } from '@trpc/server'
import {
  archiveChannel,
  createChannel,
  findChannelByName,
  generateChannelName,
  inviteUsersToChannel,
} from '@/lib/slack/channels'
import { extractSlackIds } from '@/lib/slack/utils'
import { USER_GROUPS, buildInvitationMessage } from '@/lib/slack/types'
import { EventRegistrationRepository } from '@/domains/event-registration/repository'
import type { SlackUser } from '@/lib/events/types'
import { sendBulkDirectMessages } from '@/lib/slack/messaging'
import { formatDateShort } from '@/lib/formatDate'
import { getEventParticipantInfo } from '@/lib/sanity/event-participant-info'
import { enrichEventWithDynamicData } from './event'
import {
  getAllEvents,
  getDetailedEventInfoFromSlug,
} from '@/lib/events/helpers'
import { getUniqueCleanedOrganizations } from '@/lib/organization-utils'
import {
  getEventPhotos,
  updateEventPhoto,
  deleteEventPhoto,
  reorderEventPhotos,
} from '@/lib/sanity/event-photos'
import { shouldBlockMessaging } from '../lib/environment'
import {
  buildReminderMessage,
  buildFeedbackRequestMessage,
  filterRegistrationsByStatus,
  extractUserIds,
} from '../lib/slack-message-builder'

const registrationRepository = new EventRegistrationRepository()

const eventAccessForSlug = createEventAccessMiddleware(
  (input: unknown) => (input as { slug: string }).slug
)

const adminEventProcedure = protectedProcedure.use(eventAccessForSlug)

export const adminRouter = router({
  registrations: router({
    delete: adminEventProcedure
      .input(z.object({ slug: z.string(), id: z.string() }))
      .mutation(async ({ input }) => {
        await eventRegistrationService.deleteRegistration(input.id)

        return { message: 'Påmelding slettet' }
      }),

    updateStatus: adminEventProcedure
      .input(
        z.object({
          slug: z.string(),
          id: z.string(),
          status: z.enum([
            'confirmed',
            'waitlist',
            'cancelled',
            'attended',
            'no-show',
          ] as const),
        })
      )
      .mutation(async ({ input }) => {
        const updatedRegistration =
          await eventRegistrationService.updateRegistrationStatus(
            input.id,
            input.status
          )

        return {
          registration: updatedRegistration,
          message: 'Status oppdatert',
        }
      }),

    bulkUpdateStatus: adminEventProcedure
      .input(
        z.object({
          slug: z.string(),
          ids: z.array(z.string()),
          status: z.enum([
            'confirmed',
            'waitlist',
            'cancelled',
            'attended',
            'no-show',
          ] as const),
        })
      )
      .mutation(async ({ input }) => {
        if (input.ids.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'IDs må være en ikke-tom array',
          })
        }

        const updatedRegistrations =
          await eventRegistrationService.bulkUpdateStatus(
            input.ids,
            input.status
          )

        return {
          registrations: updatedRegistrations,
          message: `${updatedRegistrations.length} påmeldinger oppdatert`,
        }
      }),
  }),

  feedback: router({
    getAll: adminEventProcedure
      .input(
        z.object({
          slug: z.string(),
          format: z.enum(['summary', 'all']).optional(),
        })
      )
      .query(async ({ input }) => {
        if (input.format === 'summary') {
          return await eventFeedbackService.getFeedbackSummary(input.slug)
        }

        return await eventFeedbackService.getEventFeedback(input.slug)
      }),

    delete: adminEventProcedure
      .input(z.object({ slug: z.string(), feedbackId: z.string() }))
      .mutation(async ({ input }) => {
        const deleted = await eventFeedbackService.deleteFeedback(
          input.feedbackId
        )

        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Feedback not found',
          })
        }

        return { message: 'Feedback deleted successfully' }
      }),
  }),

  slackChannel: router({
    getStatus: adminEventProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx }) => {
        const channelName = generateChannelName(new Date(ctx.event.start))
        const channel = await findChannelByName(channelName)

        return {
          exists: channel !== null,
          channel: channel || null,
        }
      }),

    manage: adminEventProcedure
      .input(
        z.object({
          slug: z.string(),
          action: z.enum(['create', 'add-members', 'archive']),
          userGroups: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const event = ctx.event

        if (input.action === 'archive') {
          if (!event.slackChannel?.id) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'No channel to archive',
            })
          }

          const result = await archiveChannel(event.slackChannel.id)

          if (!result.success) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to archive channel',
            })
          }

          return { success: true }
        }

        if (input.action === 'create' || input.action === 'add-members') {
          if (
            input.action === 'add-members' &&
            (!input.userGroups || input.userGroups.length === 0)
          ) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'User groups are required for add-members action',
            })
          }

          const channelName = generateChannelName(new Date(event.start))
          let channelId = event.slackChannel?.id

          if (!channelId) {
            const channel = await createChannel(channelName)
            if (!channel) {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create channel',
              })
            }
            channelId = channel.id
          }

          if (input.userGroups && input.userGroups.length > 0) {
            let slackIds: string[] = []

            if (input.userGroups.includes(USER_GROUPS.ORGANIZERS)) {
              const organizerIds = extractSlackIds(event.organizers)
              slackIds.push(...organizerIds)
            }

            if (input.userGroups.includes(USER_GROUPS.SPEAKERS)) {
              const speakers = event.schedule
                .filter(
                  (item): item is typeof item & { speakers: SlackUser[] } =>
                    item.speakers !== undefined && item.speakers.length > 0
                )
                .flatMap(item => item.speakers)
              const speakerIds = extractSlackIds(speakers)
              slackIds.push(...speakerIds)
            }

            if (input.userGroups.includes(USER_GROUPS.ATTENDEES)) {
              const registrations = await registrationRepository.findMany({
                eventSlug: input.slug,
              })
              const attendeeIds = extractSlackIds(registrations)
              slackIds.push(...attendeeIds)
            }

            slackIds = [...new Set(slackIds)]

            if (slackIds.length === 0) {
              return {
                success: true,
                channelId,
                channelName,
                invited: 0,
                failed: 0,
                alreadyInChannel: 0,
                message: 'Ingen brukere funnet å invitere',
              }
            }

            const result = await inviteUsersToChannel(channelId, slackIds, {
              batchSize: 100,
              delayBetweenBatches: 1000,
              continueOnError: true,
            })

            const message = buildInvitationMessage(
              result.invited,
              result.failed,
              result.alreadyInChannel
            )

            return {
              success: true,
              channelId,
              channelName,
              invited: result.invited,
              failed: result.failed,
              alreadyInChannel: result.alreadyInChannel,
              totalProcessed: slackIds.length,
              errors: result.errors.slice(0, 10),
              message,
            }
          }

          return {
            success: true,
            channelId,
            channelName,
            invited: 0,
            failed: 0,
            alreadyInChannel: 0,
          }
        }

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid action',
        })
      }),
  }),

  participantInfo: router({
    get: adminEventProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getEventParticipantInfo } = await import(
          '@/lib/sanity/event-participant-info'
        )
        const participantInfo = await getEventParticipantInfo(input.slug)
        return participantInfo || {}
      }),

    update: adminEventProcedure
      .input(
        z.object({
          slug: z.string(),
          streamingUrl: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { upsertEventParticipantInfo } = await import(
          '@/lib/sanity/event-participant-info'
        )
        const result = await upsertEventParticipantInfo(input.slug, {
          streamingUrl: input.streamingUrl,
          notes: input.notes,
        })

        if (!result) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update participant info',
          })
        }

        return result
      }),
  }),

  nudgeSpeakersBulk: adminEventProcedure
    .input(
      z.object({
        slug: z.string(),
        onlyWithoutAttachments: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (shouldBlockMessaging()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot send speaker nudges in development environment',
        })
      }

      const { getAllEventAttachments } = await import(
        '@/lib/events/attachment-helpers'
      )
      const { extractSlackUserId } = await import('@/lib/slack/utils')
      const { sendBulkDirectMessages } = await import('@/lib/slack/messaging')
      const { formatDateLong } = await import('@/lib/formatDate')

      const talksWithSpeakers = ctx.event.schedule.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      if (talksWithSpeakers.length === 0) {
        return {
          success: true,
          sent: 0,
          failed: 0,
          message: 'No talks with speakers found',
        }
      }

      const allAttachments = await getAllEventAttachments(input.slug)

      // Merge attachments into talks for consistent logic with UI
      const talksWithAttachments = talksWithSpeakers.map(talk => {
        const attachments = allAttachments.get(talk.title)
        return attachments ? { ...talk, attachments } : talk
      })

      const speakerTalksMap = new Map()

      for (const talk of talksWithAttachments) {
        const hasAttachments = !!(
          talk.attachments && talk.attachments.length > 0
        )

        if (input.onlyWithoutAttachments && hasAttachments) {
          continue
        }

        for (const speaker of talk.speakers || []) {
          if (!speaker.url) continue

          const speakerId = extractSlackUserId(speaker.url)
          if (!speakerId) continue

          if (!speakerTalksMap.has(speakerId)) {
            speakerTalksMap.set(speakerId, {
              speakerId,
              talks: [],
            })
          }

          speakerTalksMap.get(speakerId)!.talks.push({
            title: talk.title,
            time: talk.time,
            hasAttachments,
          })
        }
      }

      if (speakerTalksMap.size === 0) {
        return {
          success: true,
          sent: 0,
          failed: 0,
          message: input.onlyWithoutAttachments
            ? 'All speakers have uploaded presentations'
            : 'No speakers to notify',
        }
      }

      const eventDate = formatDateLong(ctx.event.start)
      const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://offentlig-paas.no'
      const profileUrl = `${baseUrl}/profil`

      const organizerNames = ctx.event.organizers
        .map(org => org.name.split(' ')[0])
        .join(', ')
        .replace(/,([^,]*)$/, ' og$1')

      const speakerMessages: Array<{ speakerId: string; message: string }> = []

      for (const [speakerId, speakerTalks] of speakerTalksMap.entries()) {
        const multipleTalks = speakerTalks.talks.length > 1
        const allHaveAttachments = speakerTalks.talks.every(
          (t: { hasAttachments: boolean }) => t.hasAttachments
        )
        const someHaveAttachments = speakerTalks.talks.some(
          (t: { hasAttachments: boolean }) => t.hasAttachments
        )

        let talksList = ''
        if (multipleTalks) {
          talksList = speakerTalks.talks
            .map(
              (t: { title: string; time: string }) =>
                `\n• "${t.title}" - ${t.time}`
            )
            .join('')
        } else {
          const talk = speakerTalks.talks[0]!
          talksList = `"${talk.title}"\n📅 ${talk.time}`
        }

        let attachmentNote = ''
        if (allHaveAttachments) {
          attachmentNote =
            '\n✅ Vi ser at du allerede har lastet opp presentasjon, takk!'
        } else if (someHaveAttachments && multipleTalks) {
          attachmentNote = `\n📊 Vi ser at du har lastet opp presentasjon for noen foredrag. Husk å laste opp for de andre også på ${profileUrl}`
        } else {
          attachmentNote = `\n📊 Hvis du har en presentasjon kan du laste den opp på ${profileUrl}`
        }

        const message = multipleTalks
          ? `Hei! 👋

Påminnelse om at du holder ${speakerTalks.talks.length} foredrag på ${ctx.event.title} ${eventDate}:${talksList}

📍 ${ctx.event.location}${attachmentNote}

Mvh ${organizerNames}`
          : `Hei! 👋

Påminnelse om at du holder foredraget ${talksList} på ${ctx.event.title} ${eventDate}.

📍 ${ctx.event.location}${attachmentNote}

Mvh ${organizerNames}`

        speakerMessages.push({ speakerId, message })
      }

      const results = await Promise.all(
        speakerMessages.map(({ speakerId, message }) =>
          sendBulkDirectMessages([speakerId], message)
        )
      )

      const totalSent = results.reduce((sum, r) => sum + r.sent, 0)
      const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)

      return {
        success: true,
        sent: totalSent,
        failed: totalFailed,
        speakerIds: speakerMessages.map(sm => sm.speakerId),
      }
    }),

  sendReminder: adminEventProcedure
    .input(
      z.object({
        slug: z.string(),
        message: z.string(),
        statusFilter: z.string().optional(),
        testMode: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (shouldBlockMessaging(input.testMode)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot send reminders in development environment',
        })
      }

      const participantInfo = await getEventParticipantInfo(input.slug)
      const event = {
        ...ctx.event,
        participantInfo: participantInfo || undefined,
      }

      const payload = buildReminderMessage(event, input.message, input.slug)

      let userIds: string[]

      if (input.testMode) {
        if (!ctx.user.slackId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Slack ID not found for current user',
          })
        }
        userIds = [ctx.user.slackId]
      } else {
        const registrations =
          await eventRegistrationService.getEventRegistrations(input.slug)

        const filteredRegistrations = filterRegistrationsByStatus(
          registrations,
          input.statusFilter
        )

        userIds = extractUserIds(filteredRegistrations)

        if (userIds.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No registered users with Slack IDs found',
          })
        }
      }

      const result = await sendBulkDirectMessages(userIds, payload, {
        batchSize: 50,
        delayBetweenBatches: 1000,
      })

      const responseMessage = input.testMode
        ? 'Test-påminnelse sendt til deg'
        : `Påminnelse sendt til ${result.sent} av ${userIds.length} deltakere`

      return {
        message: responseMessage,
        sent: result.sent,
        failed: result.failed,
        total: userIds.length,
        results: result.results,
      }
    }),

  sendFeedbackRequest: adminEventProcedure
    .input(
      z.object({
        slug: z.string(),
        message: z.string(),
        testMode: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Allow test mode even in development (sends only to current user)
      if (!input.testMode && shouldBlockMessaging(input.testMode)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot send feedback requests in development environment',
        })
      }

      const payload = buildFeedbackRequestMessage(
        ctx.event,
        input.message,
        input.slug
      )

      let userIds: string[]

      if (input.testMode) {
        if (!ctx.user.slackId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Slack ID not found for current user',
          })
        }
        userIds = [ctx.user.slackId]
      } else {
        const registrations =
          await eventRegistrationService.getEventRegistrations(input.slug)

        // Only send to users who attended
        const filteredRegistrations = filterRegistrationsByStatus(
          registrations,
          'attended'
        )

        const allUserIds = extractUserIds(filteredRegistrations)

        // Filter out users who already submitted feedback (optimized: single query)
        const allFeedback = await eventFeedbackService.getEventFeedback(
          input.slug
        )
        const userIdsWithFeedback = new Set(
          allFeedback.map(fb => fb.slackUserId)
        )
        const userIdsWithoutFeedback = allUserIds.filter(
          userId => !userIdsWithFeedback.has(userId)
        )

        userIds = userIdsWithoutFeedback

        if (userIds.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No attended users without feedback found',
          })
        }
      }

      const result = await sendBulkDirectMessages(userIds, payload, {
        batchSize: 50,
        delayBetweenBatches: 1000,
      })

      const responseMessage = input.testMode
        ? 'Test-forespørsel sendt til deg'
        : `Tilbakemeldingsforespørsel sendt til ${result.sent} av ${userIds.length} deltakere`

      return {
        message: responseMessage,
        sent: result.sent,
        failed: result.failed,
        total: userIds.length,
        results: result.results,
      }
    }),

  events: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        })
      }

      const allEvents = getAllEvents()

      // Use enrichEventWithDynamicData for each event
      const enrichedEvents = await Promise.all(
        allEvents.map(async event => {
          try {
            return await enrichEventWithDynamicData(event.slug)
          } catch (error) {
            console.error(`Failed to enrich event ${event.slug}:`, error)
            // Return minimal data on error
            return {
              ...event,
              dynamicStats: {
                registrations: {
                  total: event.stats?.registrations || 0,
                  confirmed: 0,
                  attended: 0,
                  cancelled: 0,
                  pending: 0,
                  waitlist: 0,
                  organizations: event.stats?.organisations || 0,
                  physicalCount: 0,
                  digitalCount: 0,
                  socialEventCount: 0,
                  participants: event.stats?.participants || 0,
                },
                feedback: {
                  averageRating: event.stats?.feedback?.averageRating || 0,
                  totalResponses: event.stats?.feedback?.respondents || 0,
                  hasLegacyData: !!event.stats,
                  historicalComments: event.stats?.feedback?.comments || [],
                  historicalFeedbackUrl: event.stats?.feedback?.url,
                },
              },
            }
          }
        })
      )

      const eventsWithStats = enrichedEvents.map(event => {
        const organizerCount = event.organizers?.length || 0
        const scheduleItemCount = event.schedule?.length || 0
        const hasRecording = !!event.recordingUrl
        const hasCallForPapers = !!event.callForPapersUrl

        return {
          slug: event.slug,
          title: event.title,
          date: formatDateShort(event.start),
          startDate: event.start.toISOString(),
          location: event.location,
          audience: event.audience,
          totalRegistrations: event.dynamicStats.registrations.total,
          uniqueOrganisations: event.dynamicStats.registrations.organizations,
          organizerCount,
          scheduleItemCount,
          hasRecording,
          hasCallForPapers,
          feedbackRating: event.dynamicStats.feedback.averageRating,
          feedbackRespondents: event.dynamicStats.feedback.totalResponses,
          price: event.price,
          // Keep legacy stats for backward compatibility if needed
          statsRegistrations: event.stats?.registrations,
          statsParticipants: event.stats?.participants,
          statsOrganisations: event.stats?.organisations,
        }
      })

      const events = eventsWithStats.sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })

      const totalRegistrations = events.reduce(
        (sum, e) => sum + e.totalRegistrations,
        0
      )
      const uniqueOrganisations = events.reduce(
        (sum, e) => sum + e.uniqueOrganisations,
        0
      )

      return {
        events,
        totalStats: {
          totalRegistrations,
          uniqueOrganisations,
          totalEvents: events.length,
        },
      }
    }),

    getDetails: adminEventProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input, ctx }) => {
        // Use enrichEventWithDynamicData for consistency
        const enrichedEvent = await enrichEventWithDynamicData(input.slug)

        const registrations =
          await eventRegistrationService.getEventRegistrations(input.slug)
        const eventInfo = getDetailedEventInfoFromSlug(input.slug)
        const eventRegistrations = registrations || []

        const uniqueOrganisations = getUniqueCleanedOrganizations(
          eventRegistrations.map(r => r.organisation)
        ).size

        const channelName = generateChannelName(new Date(ctx.event.start))
        const slackChannel = await findChannelByName(channelName)

        // Fetch attachments and merge into schedule
        const { getAllEventAttachments } = await import(
          '@/lib/events/attachment-helpers'
        )
        const attachmentsMap = await getAllEventAttachments(input.slug)
        const scheduleWithAttachments = ctx.event.schedule.map(item => {
          const attachments = attachmentsMap.get(item.title)
          return attachments ? { ...item, attachments } : item
        })

        return {
          title: eventInfo.title,
          date: eventInfo.date,
          location: eventInfo.location,
          ingress: ctx.event.ingress,
          description: ctx.event.description,
          audience: ctx.event.audience,
          price: ctx.event.price,
          startTime: ctx.event.start.toISOString(),
          endTime: ctx.event.end.toISOString(),
          registrationUrl: ctx.event.registrationUrl,
          callForPapersUrl: ctx.event.callForPapersUrl,
          recordingUrl: ctx.event.recordingUrl,
          organizers: ctx.event.organizers,
          schedule: scheduleWithAttachments,
          eventStats: ctx.event.stats,
          registration: ctx.event.registration,
          slackChannel,
          registrations: eventRegistrations.map(reg => ({
            _id: reg._id,
            name: reg.name,
            email: reg.email,
            organisation: reg.organisation,
            slackUserId: reg.slackUserId,
            dietary: reg.dietary,
            comments: reg.comments,
            attendanceType: reg.attendanceType,
            attendingSocialEvent: reg.attendingSocialEvent,
            registeredAt: reg.registeredAt.toISOString(),
            status: reg.status,
          })),
          stats: {
            totalRegistrations: eventRegistrations.length,
            uniqueOrganisations,
            statusBreakdown: {
              confirmed: enrichedEvent.dynamicStats.registrations.confirmed,
              attended: enrichedEvent.dynamicStats.registrations.attended,
              cancelled: enrichedEvent.dynamicStats.registrations.cancelled,
              pending: enrichedEvent.dynamicStats.registrations.pending,
            },
            activeRegistrations:
              enrichedEvent.dynamicStats.registrations.confirmed +
              enrichedEvent.dynamicStats.registrations.attended,
            feedbackSummary: {
              averageEventRating:
                enrichedEvent.dynamicStats.feedback.averageRating,
              totalResponses:
                enrichedEvent.dynamicStats.feedback.totalResponses,
            },
          },
        }
      }),
  }),

  photos: router({
    list: adminEventProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const photos = await getEventPhotos(input.slug)
        return photos
      }),

    update: adminEventProcedure
      .input(
        z.object({
          slug: z.string(),
          photoId: z.string(),
          caption: z.string().optional(),
          speakers: z.array(z.string()).optional(),
          order: z.number().optional(),
          featured: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { photoId, caption, speakers, order, featured } = input
        const updated = await updateEventPhoto(photoId, {
          caption,
          speakers,
          order,
          featured,
        })
        return updated
      }),

    delete: adminEventProcedure
      .input(z.object({ slug: z.string(), photoId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteEventPhoto(input.photoId)
        return { success: true }
      }),

    reorder: adminEventProcedure
      .input(z.object({ slug: z.string(), photoIds: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        await reorderEventPhotos(input.photoIds)
        return { success: true }
      }),
  }),
})
