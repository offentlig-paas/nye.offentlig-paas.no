import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { getSurvey } from '@/lib/surveys/helpers'
import { SurveyStatus } from '@/lib/surveys/types'
import { surveyResponseService } from '@/domains/survey-response/service'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'
import { aggregateSurveyResults } from '@/lib/surveys/aggregation'
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
      const survey = getSurvey(input.surveySlug)
      if (!survey || survey.status === SurveyStatus.Draft) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Undersøkelsen finnes ikke',
        })
      }
      return await surveyResponseService.getResponseCount(survey.slug)
    }),

  getAggregatedResults: publicProcedure
    .input(z.object({ surveySlug: z.string() }))
    .query(async ({ input }) => {
      const survey = getSurvey(input.surveySlug)
      if (!survey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Undersøkelsen finnes ikke',
        })
      }

      if (!survey.resultsConfig?.published) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resultater er ikke publisert',
        })
      }

      const repository = new SurveyResponseRepository()
      const orgQid = survey.organizationQuestionId ?? 'q1-org'

      const responses = await repository.findBySurvey(survey.slug)

      const minResponses = survey.resultsConfig.minResponses ?? 10
      if (responses.length < minResponses) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Ikke nok svar til å publisere resultater ennå (minimum ${minResponses})`,
        })
      }

      const uniqueOrgs = new Set<string>()
      for (const r of responses) {
        const org =
          r.organizationOverride?.memberName ??
          r.answers.find(a => a.questionId === orgQid)?.value
        if (typeof org === 'string' && org) {
          uniqueOrgs.add(org.toLowerCase().trim())
        }
      }

      const excludeFromPublic = new Set<string>()
      excludeFromPublic.add(orgQid)
      for (const section of survey.sections) {
        for (const q of section.questions) {
          if (q.type === 'typeahead') excludeFromPublic.add(q.id)
        }
      }

      const minBucketSize = survey.resultsConfig.minBucketSize ?? 3

      const aggregated = aggregateSurveyResults(survey, responses, {
        excludeQuestionIds: excludeFromPublic,
        minBucketSize,
      })

      return {
        ...aggregated,
        uniqueOrganizations: uniqueOrgs.size,
        heroText: survey.resultsConfig.heroText,
        methodologyNote: survey.resultsConfig.methodologyNote,
      }
    }),
})
