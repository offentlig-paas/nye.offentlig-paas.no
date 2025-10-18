import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  getEvent,
  getAllEvents,
  getStatus,
  resolveEventStats,
} from '@/lib/events/helpers'
import { eventRegistrationService } from '@/domains/event-registration'
import { eventFeedbackService } from '@/domains/event-feedback/service'
import { getEventParticipantInfo } from '@/lib/sanity/event-participant-info'
import type {
  EventWithDynamicData,
  EventDynamicStats,
} from '@/lib/events/types'
import { Status } from '@/lib/events/types'

export async function enrichEventWithDynamicData(
  eventSlug: string,
  options: {
    includeUserRegistration?: boolean
    userId?: string
    includeParticipants?: boolean
  } = {}
): Promise<EventWithDynamicData> {
  const event = getEvent(eventSlug)

  if (!event) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Event not found',
    })
  }

  // Single query for registrations
  const registrations =
    await eventRegistrationService.getEventRegistrations(eventSlug)

  // Query feedback summary with 30s cache
  const feedbackSummary =
    await eventFeedbackService.getFeedbackSummary(eventSlug)

  // Use unified resolver for stats (handles legacy fallback)
  const dynamicStats = resolveEventStats(event, registrations, feedbackSummary)

  const enrichedEvent: EventWithDynamicData = {
    ...event,
    dynamicStats,
  }

  if (options.includeUserRegistration && options.userId) {
    const userRegistration = registrations.find(
      r => r.slackUserId === options.userId
    )
    enrichedEvent.userRegistration = userRegistration
      ? {
          _id: userRegistration._id,
          status: userRegistration.status,
          attendanceType: userRegistration.attendanceType,
          attendingSocialEvent: userRegistration.attendingSocialEvent,
          comments: userRegistration.comments,
          dietary: userRegistration.dietary,
          registeredAt: userRegistration.registeredAt,
        }
      : null
  }

  const eventStatus = getStatus(event)
  const activeRegistrations = registrations.filter(
    r => r.status === 'confirmed' || r.status === 'attended'
  )
  const isUserRegistered = options.userId
    ? activeRegistrations.some(r => r.slackUserId === options.userId)
    : false

  if (
    options.includeParticipants &&
    (eventStatus === Status.Current ||
      eventStatus === Status.Upcoming ||
      isUserRegistered)
  ) {
    enrichedEvent.participants = activeRegistrations
      .slice(0, 12)
      .map(registration => ({
        name: registration.name,
        slackUserId: registration.slackUserId,
      }))
  }

  if (
    eventStatus === Status.Current ||
    eventStatus === Status.Upcoming ||
    isUserRegistered
  ) {
    const participantInfo = await getEventParticipantInfo(eventSlug)
    if (participantInfo) {
      enrichedEvent.participantInfo = participantInfo
    }
  }

  return enrichedEvent
}

export const eventRouter = router({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const session = ctx.session
      const userId = session?.user?.slackId

      return await enrichEventWithDynamicData(input.slug, {
        includeUserRegistration: !!userId,
        userId,
        includeParticipants: true,
      })
    }),

  list: publicProcedure.query(async () => {
    const allEvents = getAllEvents()

    const enrichedEvents = await Promise.all(
      allEvents.map(async event => {
        try {
          return await enrichEventWithDynamicData(event.slug)
        } catch (error) {
          console.error(`Failed to enrich event ${event.slug}:`, error)
          // Fallback to using resolveEventStats with empty arrays
          const dynamicStats: EventDynamicStats = resolveEventStats(event, [], {
            eventSlug: event.slug,
            totalResponses: 0,
            averageEventRating: 0,
            ratingDistribution: [],
            talkSummaries: [],
            topicSuggestions: [],
            eventComments: [],
          })
          return {
            ...event,
            dynamicStats,
          }
        }
      })
    )

    return enrichedEvents
  }),

  userRegistration: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        })
      }

      const registrations =
        await eventRegistrationService.getEventRegistrations(input.slug)
      const userRegistration = registrations.find(
        r => r.slackUserId === ctx.user.slackId
      )

      return {
        registration: userRegistration || null,
      }
    }),
})
