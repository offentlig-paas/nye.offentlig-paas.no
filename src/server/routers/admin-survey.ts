import {
  router,
  protectedProcedure,
  createSurveyAccessMiddleware,
} from '../trpc'
import { z } from 'zod'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'
import { getAccessibleSurveys } from '@/lib/surveys/helpers'
import { members } from '@/data/members'
import type { SurveyDefinition } from '@/lib/surveys/types'

const repository = new SurveyResponseRepository()

function getMemberNameSet(): Set<string> {
  return new Set(members.map(m => m.name.toLowerCase().trim()))
}

function countRespondedMembers(
  orgBreakdown: { organization: string }[]
): number {
  const memberNames = getMemberNameSet()
  let count = 0
  for (const o of orgBreakdown) {
    if (memberNames.has(o.organization.toLowerCase().trim())) count++
  }
  return count
}

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
      const [
        responseCount,
        orgCount,
        dailyCounts,
        latestResponse,
        allResponses,
        orgBreakdown,
      ] = await Promise.all([
        repository.countBySurvey(survey.slug),
        repository.countUniqueOrganizations(survey.slug, orgQid),
        repository.getDailyResponseCounts(survey.slug),
        repository.getLatestResponseDate(survey.slug),
        repository.findBySurvey(survey.slug),
        repository.getOrganizationBreakdown(survey.slug, orgQid),
      ])

      const memberCount = (await import('@/data/members')).members.length
      const respondedMemberCount = countRespondedMembers(orgBreakdown)

      const totalQuestions = survey.sections.reduce(
        (acc, s) => acc + s.questions.length,
        0
      )

      const deviceBreakdown = new Map<string, number>()
      const durations: number[] = []

      for (const r of allResponses) {
        const device = r.metadata?.deviceCategory ?? 'unknown'
        deviceBreakdown.set(device, (deviceBreakdown.get(device) ?? 0) + 1)

        if (r.metadata?.durationSeconds && r.metadata.durationSeconds > 0) {
          durations.push(r.metadata.durationSeconds)
        }
      }

      durations.sort((a, b) => a - b)
      const medianDuration =
        durations.length > 0
          ? durations.length % 2 === 1
            ? durations[Math.floor(durations.length / 2)]!
            : Math.round(
                (durations[durations.length / 2 - 1]! +
                  durations[durations.length / 2]!) /
                  2
              )
          : null
      const avgDuration =
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : null
      const minDuration = durations.length > 0 ? durations[0]! : null
      const maxDuration =
        durations.length > 0 ? durations[durations.length - 1]! : null

      return {
        survey: {
          slug: survey.slug,
          title: survey.title,
          status: survey.status,
          version: survey.version,
          description: survey.description,
          sectionCount: survey.sections.length,
          questionCount: totalQuestions,
        },
        responseCount,
        orgCount,
        respondedMemberCount,
        memberCount,
        dailyCounts,
        latestResponse,
        deviceBreakdown: Array.from(deviceBreakdown.entries())
          .map(([device, count]) => ({ device, count }))
          .sort((a, b) => b.count - a.count),
        durationStats: {
          medianSeconds: medianDuration,
          avgSeconds: avgDuration,
          minSeconds: minDuration,
          maxSeconds: maxDuration,
          count: durations.length,
        },
      }
    }),

  getOrganizations: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx }) => {
      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const orgBreakdown = await repository.getOrganizationBreakdown(
        survey.slug,
        orgQid
      )

      const memberNames = getMemberNameSet()

      const respondedOrgs = new Set(
        orgBreakdown.map(o => o.organization.toLowerCase().trim())
      )

      const orgBreakdownWithMembership = orgBreakdown.map(o => ({
        ...o,
        isMember: memberNames.has(o.organization.toLowerCase().trim()),
      }))

      const membersByType = new Map<
        string,
        {
          total: number
          responded: number
          names: { name: string; responded: boolean }[]
        }
      >()

      for (const member of members) {
        const type = member.type
        const entry = membersByType.get(type) ?? {
          total: 0,
          responded: 0,
          names: [],
        }
        const responded = respondedOrgs.has(member.name.toLowerCase().trim())
        entry.total++
        if (responded) entry.responded++
        entry.names.push({ name: member.name, responded })
        membersByType.set(type, entry)
      }

      const sectorBreakdown = Array.from(membersByType.entries())
        .map(([type, data]) => ({
          type,
          total: data.total,
          responded: data.responded,
          percentage:
            data.total > 0
              ? Math.round((data.responded / data.total) * 100)
              : 0,
          organizations: data.names.sort((a, b) => {
            if (a.responded !== b.responded) return a.responded ? -1 : 1
            return a.name.localeCompare(b.name, 'nb')
          }),
        }))
        .sort((a, b) => b.responded - a.responded)

      const totalMembers = members.length
      const respondedMembers = Array.from(membersByType.values()).reduce(
        (acc, d) => acc + d.responded,
        0
      )

      return {
        orgBreakdown: orgBreakdownWithMembership,
        sectorBreakdown,
        totalMembers,
        respondedMembers,
        memberResponseRate:
          totalMembers > 0
            ? Math.round((respondedMembers / totalMembers) * 100)
            : 0,
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
      const memberNames = getMemberNameSet()

      const result = await repository.findBySurveyPaginated(
        survey.slug,
        input.offset,
        input.limit
      )

      return {
        responses: result.responses.map(r => {
          const org =
            r.answers.find(a => a.questionId === orgQid)?.value ?? 'Ukjent'
          return {
            id: r._id,
            submittedAt: r.submittedAt,
            organization: org,
            isMember: memberNames.has(org.toLowerCase().trim()),
            deviceCategory: r.metadata?.deviceCategory ?? 'unknown',
            durationSeconds: r.metadata?.durationSeconds,
            answers: r.answers.filter(a => !sensitiveIds.has(a.questionId)),
          }
        }),
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
