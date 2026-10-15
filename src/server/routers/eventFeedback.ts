import { router, protectedProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { eventFeedbackService } from '@/domains/event-feedback/service'
import type { CreateEventFeedbackInput } from '@/domains/event-feedback/types'
import { revalidatePath } from 'next/cache'
import { eventRegistrationService } from '@/domains/event-registration/service'
import { getEvent, getStatus } from '@/lib/events/helpers'
import { Status } from '@/lib/events/types'
import { TRPCError } from '@trpc/server'

const talkRatingSchema = z.object({
  talkTitle: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

const topicSuggestionSchema = z.object({
  topic: z.string(),
  willingToPresent: z.boolean(),
})

const submitFeedbackSchema = z.object({
  slug: z.string(),
  talkRatings: z.array(talkRatingSchema),
  eventRating: z.number().min(1).max(5),
  eventComment: z.string().optional(),
  topicSuggestions: z.array(topicSuggestionSchema).optional(),
  isPublic: z.boolean().optional(),
})

export const eventFeedbackRouter = router({
  getSummary: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await eventFeedbackService.getFeedbackSummary(input.slug)
    }),

  getPublicReviews: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await eventFeedbackService.getPublicFeedback(input.slug)
    }),

  submit: protectedProcedure
    .input(submitFeedbackSchema)
    .mutation(async ({ input, ctx }) => {
      const { slug, ...feedbackData } = input

      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        })
      }

      const event = getEvent(slug)
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fagdag ikke funnet',
        })
      }

      if (getStatus(event) === Status.Upcoming) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kan ikke gi tilbakemelding før fagdagen har startet',
        })
      }

      const registrations = await eventRegistrationService.getUserRegistrations(
        ctx.user.slackId
      )

      const registration = registrations.find(r => r.eventSlug === slug)

      if (
        !registration ||
        (registration.status !== 'attended' &&
          registration.status !== 'confirmed')
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Du må være påmeldt og ha deltatt for å gi tilbakemelding',
        })
      }

      if (registration.status === 'confirmed' && registration._id) {
        await eventRegistrationService.markAsAttended(registration._id)
      }

      const feedbackInput: CreateEventFeedbackInput = {
        eventSlug: slug,
        slackUserId: ctx.user.slackId,
        name: ctx.user.name || 'Ukjent',
        email: ctx.user.email || '',
        talkRatings: feedbackData.talkRatings || [],
        eventRating: feedbackData.eventRating,
        eventComment: feedbackData.eventComment,
        topicSuggestions: feedbackData.topicSuggestions || [],
        isPublic: feedbackData.isPublic,
        metadata: {
          submissionSource: 'web',
        },
      }

      const feedback = await eventFeedbackService.submitFeedback(feedbackInput)

      revalidatePath(`/fagdag/${slug}`)
      revalidatePath('/profil')

      return {
        message: 'Tilbakemelding mottatt!',
        feedback,
      }
    }),

  hasFeedback: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        })
      }

      return await eventFeedbackService.hasFeedback(
        input.slug,
        ctx.user.slackId
      )
    }),

  getUserFeedback: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        })
      }

      const feedback = await eventFeedbackService.getUserFeedback(
        input.slug,
        ctx.user.slackId
      )

      return feedback
    }),
})
