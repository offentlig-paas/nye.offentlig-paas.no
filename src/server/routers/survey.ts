import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { getSurvey } from '@/lib/surveys/helpers'
import { SurveyStatus } from '@/lib/surveys/types'
import { surveyResponseService } from '@/domains/survey-response/service'
import { TRPCError } from '@trpc/server'

const surveyAnswerSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  otherText: z.string().optional(),
})

const submitSurveySchema = z.object({
  surveySlug: z.string(),
  answers: z.array(surveyAnswerSchema),
  honeypot: z.string().optional(),
  durationSeconds: z.number().int().min(0).optional(),
})

export const surveyRouter = router({
  submit: publicProcedure
    .input(submitSurveySchema)
    .mutation(async ({ input, ctx }) => {
      if (input.honeypot) {
        return { success: true }
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

      const userAgent = ctx.headers.get('user-agent') ?? undefined
      const ip =
        ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        ctx.headers.get('x-real-ip') ??
        undefined

      await surveyResponseService.submitResponse(survey, input.answers, {
        userAgent,
        ip,
        durationSeconds: input.durationSeconds,
      })

      return { success: true }
    }),

  getResponseCount: publicProcedure
    .input(z.object({ surveySlug: z.string() }))
    .query(async ({ input }) => {
      return await surveyResponseService.getResponseCount(input.surveySlug)
    }),
})
