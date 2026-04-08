import {
  router,
  protectedProcedure,
  createSurveyAccessMiddleware,
} from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'
import { getAccessibleSurveys } from '@/lib/surveys/helpers'
import { members } from '@/data/members'
import type { SurveyDefinition } from '@/lib/surveys/types'

const repository = new SurveyResponseRepository()

function getMemberNameSet(): Set<string> {
  return new Set(members.map(m => m.name.toLowerCase().trim()))
}

function getMemberNames(): string[] {
  return members.map(m => m.name)
}

function resolveOrganization(
  response: {
    answers: { questionId: string; value?: string }[]
    organizationOverride?: { memberName: string }
  },
  orgQid: string
): string {
  if (response.organizationOverride?.memberName) {
    return response.organizationOverride.memberName
  }
  return response.answers.find(a => a.questionId === orgQid)?.value ?? 'Ukjent'
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
  if (/^\s*[=+\-@\t\r]/.test(s)) {
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
      const [responseCount, dailyCounts, latestResponse, allResponses] =
        await Promise.all([
          repository.countBySurvey(survey.slug),
          repository.getDailyResponseCounts(survey.slug),
          repository.getLatestResponseDate(survey.slug),
          repository.findBySurvey(survey.slug),
        ])

      const memberCount = (await import('@/data/members')).members.length
      const memberNames = getMemberNameSet()

      const uniqueResolvedOrgs = new Set<string>()
      const deviceBreakdown = new Map<string, number>()
      const durations: number[] = []

      for (const r of allResponses) {
        const org = resolveOrganization(r, orgQid)
        uniqueResolvedOrgs.add(org.toLowerCase().trim())

        const device = r.metadata?.deviceCategory ?? 'unknown'
        deviceBreakdown.set(device, (deviceBreakdown.get(device) ?? 0) + 1)

        if (r.metadata?.durationSeconds && r.metadata.durationSeconds > 0) {
          durations.push(r.metadata.durationSeconds)
        }
      }

      let respondedMemberCount = 0
      for (const org of uniqueResolvedOrgs) {
        if (memberNames.has(org)) respondedMemberCount++
      }

      const totalQuestions = survey.sections.reduce(
        (acc, s) => acc + s.questions.length,
        0
      )

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
        orgCount: uniqueResolvedOrgs.size,
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
      const allResponses = await repository.findBySurvey(survey.slug)

      const memberNames = getMemberNameSet()

      const orgCounts = new Map<string, number>()
      for (const r of allResponses) {
        const org = resolveOrganization(r, orgQid)
        orgCounts.set(org, (orgCounts.get(org) ?? 0) + 1)
      }

      const orgBreakdown = Array.from(orgCounts.entries())
        .map(([organization, count]) => ({
          organization,
          count,
          isMember: memberNames.has(organization.toLowerCase().trim()),
        }))
        .sort((a, b) => b.count - a.count)

      const respondedOrgs = new Set(
        orgBreakdown.map(o => o.organization.toLowerCase().trim())
      )

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
        orgBreakdown,
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
          const org = resolveOrganization(r, orgQid)
          return {
            id: r._id,
            submittedAt: r.submittedAt,
            organization: org,
            isMember: memberNames.has(org.toLowerCase().trim()),
            deviceCategory: r.metadata?.deviceCategory ?? 'unknown',
            durationSeconds: r.metadata?.durationSeconds,
            answers: r.answers.filter(a => !sensitiveIds.has(a.questionId)),
            organizationOverride: r.organizationOverride
              ? {
                  memberName: r.organizationOverride.memberName,
                  originalValue: r.organizationOverride.originalValue,
                }
              : undefined,
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
        'Organisasjon (original)',
        'Enhet',
        'Kilde',
        ...exportableQuestions.map(q => q.title),
      ]

      const rows = responses.map(r => {
        const answerMap = new Map(r.answers.map(a => [a.questionId, a]))
        const rawOrg = r.answers.find(a => a.questionId === orgQid)?.value ?? ''
        const resolvedOrg = resolveOrganization(r, orgQid)

        return [
          r.submittedAt,
          resolvedOrg,
          r.organizationOverride ? rawOrg : '',
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

  linkOrganization: adminSurveyProcedure
    .input(
      z.object({
        slug: z.string(),
        responseId: z.string(),
        memberName: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun administratorer kan koble organisasjoner',
        })
      }

      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)

      const validMembers = getMemberNames()
      if (!validMembers.includes(input.memberName)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `"${input.memberName}" er ikke et gyldig medlemsnavn`,
        })
      }

      const response = await repository.findById(input.responseId)
      if (!response || response.surveySlug !== survey.slug) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Besvarelsen ble ikke funnet',
        })
      }

      const originalValue =
        response.answers.find(a => a.questionId === orgQid)?.value ?? 'Ukjent'

      const adminName = ctx.user?.name ?? ctx.user?.email ?? 'unknown'

      await repository.setOrganizationOverride(input.responseId, {
        memberName: input.memberName,
        originalValue,
        overriddenBy: adminName,
        overriddenAt: new Date().toISOString(),
      })

      return { success: true }
    }),
})
