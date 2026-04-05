import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { getEvent, isCallForPapersOpen } from '@/lib/events/helpers'
import { talkSubmissionService } from '@/domains/talk-submission'
import type { TalkFormat } from '@/domains/talk-submission/types'
import { TalkFormatDisplay } from '@/domains/talk-submission/types'
import { revalidatePath } from 'next/cache'
import { TRPCError } from '@trpc/server'

const talkFormatValues = Object.keys(TalkFormatDisplay) as [
  TalkFormat,
  ...TalkFormat[],
]

const submitSchema = z.object({
  slug: z.string(),
  title: z.string().min(1).max(200),
  abstract: z.string().min(1).max(5000),
  format: z.enum(talkFormatValues),
  duration: z.string().optional(),
  speakerBio: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  organisation: z.string().optional(),
})

export const talkSubmissionRouter = router({
  submit: protectedProcedure
    .input(submitSchema)
    .mutation(async ({ input, ctx }) => {
      const { slug, ...submissionData } = input

      if (!ctx.user.email || !ctx.user.name) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'E-post og navn er påkrevd',
        })
      }

      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Slack-ID ikke funnet i sesjon',
        })
      }

      const event = getEvent(slug)
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fagdag ikke funnet',
        })
      }

      if (!isCallForPapersOpen(event)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Foredragsforslag er ikke åpent for denne fagdagen',
        })
      }

      const submission = await talkSubmissionService.submitTalk({
        eventSlug: slug,
        title: submissionData.title,
        abstract: submissionData.abstract,
        format: submissionData.format,
        duration: submissionData.duration,
        speakerName: ctx.user.name,
        speakerEmail: ctx.user.email,
        speakerSlackId: ctx.user.slackId,
        speakerOrganisation:
          submissionData.organisation || ctx.user.statusText || 'Ikke oppgitt',
        speakerBio: submissionData.speakerBio,
        notes: submissionData.notes,
      })

      revalidatePath(`/fagdag/${slug}`)

      return {
        message: 'Foredragsforslag sendt inn!',
        submission,
      }
    }),

  getUserSubmissions: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Slack-ID ikke funnet i sesjon',
        })
      }

      return await talkSubmissionService.getUserSubmissions(
        input.slug,
        ctx.user.slackId
      )
    }),

  withdraw: protectedProcedure
    .input(z.object({ slug: z.string(), submissionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Slack-ID ikke funnet i sesjon',
        })
      }

      try {
        const submission = await talkSubmissionService.withdrawSubmission(
          input.submissionId,
          ctx.user.slackId,
          input.slug
        )

        revalidatePath(`/fagdag/${input.slug}`)

        return {
          message: 'Foredragsforslag trukket tilbake',
          submission,
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Not authorized')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Du kan kun trekke tilbake dine egne forslag',
            })
          }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke trekke tilbake forslaget',
        })
      }
    }),
})
