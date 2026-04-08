import {
  router,
  protectedProcedure,
  createSurveyAccessMiddleware,
} from '../trpc'
import { z } from 'zod'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'
import { getAccessibleSurveys } from '@/lib/surveys/helpers'
import type { SurveyDefinition } from '@/lib/surveys/types'

const repository = new SurveyResponseRepository()

const surveyAccessForSlug = createSurveyAccessMiddleware(
  (input: unknown) => (input as { slug: string }).slug
)

const adminSurveyProcedure = protectedProcedure.use(surveyAccessForSlug)

function getOrgQuestionId(survey: SurveyDefinition): string {
  return survey.organizationQuestionId ?? 'q1-org'
}

function sanitizeCsvCell(value: string): string {
  const s = value.replace(/"/g, '""')
  if (/^[=+\-@\t\r]/.test(s)) {
    return `'${s}`
  }
  return s
}

export const adminSurveyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const surveys = getAccessibleSurveys(ctx.user)

    const withCounts = await Promise.all(
      surveys.map(async (survey: SurveyDefinition) => {
        const orgQid = getOrgQuestionId(survey)
        const [responseCount, orgCount] = await Promise.all([
          repository.countBySurvey(survey.slug),
          repository.countUniqueOrganizations(survey.slug, orgQid),
        ])
        return {
          slug: survey.slug,
          title: survey.title,
          status: survey.status,
          version: survey.version,
          responseCount,
          orgCount,
        }
      })
    )

    return withCounts
  }),

  getOverview: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx }) => {
      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const [responseCount, orgCount, orgBreakdown, dailyCounts] =
        await Promise.all([
          repository.countBySurvey(survey.slug),
          repository.countUniqueOrganizations(survey.slug, orgQid),
          repository.getOrganizationBreakdown(survey.slug, orgQid),
          repository.getDailyResponseCounts(survey.slug),
        ])

      return {
        survey: {
          slug: survey.slug,
          title: survey.title,
          status: survey.status,
          version: survey.version,
          description: survey.description,
          sectionCount: survey.sections.length,
          questionCount: survey.sections.reduce(
            (acc, s) => acc + s.questions.length,
            0
          ),
        },
        responseCount,
        orgCount,
        orgBreakdown,
        dailyCounts,
      }
    }),

  getResponses: adminSurveyProcedure
    .input(
      z.object({
        slug: z.string(),
        offset: z.number().int().min(0).default(0),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const sensitiveIds = new Set(survey.sensitiveQuestionIds ?? [])

      const result = await repository.findBySurveyPaginated(
        survey.slug,
        input.offset,
        input.limit
      )

      return {
        responses: result.responses.map(r => ({
          id: r._id,
          submittedAt: r.submittedAt,
          organization:
            r.answers.find(a => a.questionId === orgQid)?.value ?? 'Ukjent',
          deviceCategory: r.metadata?.deviceCategory ?? 'unknown',
          durationSeconds: r.metadata?.durationSeconds,
          answers: r.answers.filter(a => !sensitiveIds.has(a.questionId)),
        })),
        total: result.total,
        offset: input.offset,
        limit: input.limit,
      }
    }),

  exportCsv: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx }) => {
      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const sensitiveIds = new Set(survey.sensitiveQuestionIds ?? [])
      const responses = await repository.findBySurvey(survey.slug)

      const exportableQuestions = survey.sections
        .flatMap(s => s.questions)
        .filter(q => !sensitiveIds.has(q.id))

      const headers = [
        'Tidspunkt',
        'Organisasjon',
        'Enhet',
        'Kilde',
        ...exportableQuestions.map(q => q.title),
      ]

      const rows = responses.map(r => {
        const answerMap = new Map(r.answers.map(a => [a.questionId, a]))

        return [
          r.submittedAt,
          r.answers.find(a => a.questionId === orgQid)?.value ?? '',
          r.metadata?.deviceCategory ?? '',
          r.metadata?.submissionSource ?? '',
          ...exportableQuestions.map(q => {
            const answer = answerMap.get(q.id)
            if (!answer) return ''
            const val = answer.arrayValue
              ? answer.arrayValue.join('; ')
              : (answer.value ?? '')
            return answer.otherText ? `${val} (${answer.otherText})` : val
          }),
        ]
      })

      const csvContent = [
        headers.map(h => `"${sanitizeCsvCell(h)}"`).join(','),
        ...rows.map(row =>
          row.map(cell => `"${sanitizeCsvCell(String(cell))}"`).join(',')
        ),
      ].join('\n')

      return { csv: csvContent, filename: `${survey.slug}-responses.csv` }
    }),
})
