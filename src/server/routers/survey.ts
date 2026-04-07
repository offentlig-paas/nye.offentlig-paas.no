import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { getSurvey } from '@/lib/surveys/helpers'
import { SurveyStatus } from '@/lib/surveys/types'
import { surveyResponseService } from '@/domains/survey-response/service'
import { TRPCError } from '@trpc/server'

const MAX_STRING_LENGTH = 10_000
const MAX_OTHER_TEXT_LENGTH = 500
const MAX_ANSWERS = 200
const MAX_ID_LENGTH = 200

const surveyAnswerSchema = z.object({
  questionId: z.string().min(1).max(MAX_ID_LENGTH),
  value: z.union([
    z.string().max(MAX_STRING_LENGTH),
    z.array(z.string().max(MAX_STRING_LENGTH)).max(MAX_ANSWERS),
  ]),
  otherText: z.string().max(MAX_OTHER_TEXT_LENGTH).optional(),
})

const submitSurveySchema = z.object({
  surveySlug: z.string().min(1).max(MAX_ID_LENGTH),
  surveyVersion: z.number().int().min(1),
  submissionId: z.string().uuid(),
  answers: z.array(surveyAnswerSchema).max(MAX_ANSWERS),
  honeypot: z.string().optional(),
  durationSeconds: z.number().int().min(0).max(86_400).optional(),
})

export const surveyRouter = router({
  submit: publicProcedure
    .input(submitSurveySchema)
    .mutation(async ({ input, ctx }) => {
      if (input.honeypot) {
        return { success: true, honeypot: true }
      }

      const survey = getSurvey(input.surveySlug)
      if (!survey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Undersøkelsen finnes ikke',
        })
      }

      if (survey.status !== SurveyStatus.Open) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Undersøkelsen er ikke åpen for svar',
        })
      }

      if (input.surveyVersion !== survey.version) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Undersøkelsen har blitt oppdatert. Last inn siden på nytt.',
        })
      }

      const userAgent = ctx.headers.get('user-agent') ?? undefined
      const ip =
        ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        ctx.headers.get('x-real-ip') ??
        undefined

      await surveyResponseService.submitResponse(
        survey,
        input.answers,
        {
          userAgent,
          ip,
          durationSeconds: input.durationSeconds,
        },
        input.submissionId
      )

      return { success: true }
    }),

  getResponseCount: publicProcedure
    .input(z.object({ surveySlug: z.string() }))
    .query(async ({ input }) => {
      return await surveyResponseService.getResponseCount(input.surveySlug)
    }),
})
