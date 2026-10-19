import { stripMarkdown } from '@/lib/markdown'
import {
  router,
  protectedProcedure,
  createSurveyAccessMiddleware,
} from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'
import {
  getAccessibleSurveys,
  getExportColumns,
  getProjectForSurvey,
  getSurvey,
} from '@/lib/surveys/helpers'
import { compareWaves } from '@/lib/surveys/comparison'
import { getFrozenAggregates, loadWaveResults } from '@/lib/surveys/frozen'
import { aggregateSurveyResults } from '@/lib/surveys/aggregation'
import { aggregatedToCsv, toCsv } from '@/lib/surveys/csv'
import { getAppUrl } from '@/server/lib/environment'
import { getSlackUsersForMember } from '@/lib/members-slack'
import { members, findMemberByName, canonicalOrgName } from '@/data/members'
import { SurveyStatus, type SurveyDefinition } from '@/lib/surveys/types'

const repository = new SurveyResponseRepository()

function resolveOrganization(
  response: {
    answers: { questionId: string; value?: string }[]
    organizationOverride?: { memberName: string }
  },
  orgQid: string
): string {
  const org =
    response.organizationOverride?.memberName ||
    response.answers.find(a => a.questionId === orgQid)?.value
  return org === undefined ? 'Ukjent' : canonicalOrgName(org)
}

const surveyAccessForSlug = createSurveyAccessMiddleware(
  (input: unknown) => (input as { slug: string }).slug
)

const adminSurveyProcedure = protectedProcedure.use(surveyAccessForSlug)

function getOrgQuestionId(survey: SurveyDefinition): string {
  return survey.organizationQuestionId ?? 'q1-org'
}

async function getRespondedOrgNames(
  surveySlug: string,
  orgQid: string
): Promise<Set<string>> {
  const allResponses = await repository.findBySurvey(surveySlug)
  const responded = new Set<string>()
  for (const r of allResponses) {
    responded.add(resolveOrganization(r, orgQid).toLowerCase().trim())
  }
  return responded
}

export const adminSurveyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const surveys = getAccessibleSurveys(ctx.user)

    const withCounts = await Promise.all(
      surveys.map(async (survey: SurveyDefinition) => {
        const orgQid = getOrgQuestionId(survey)
        const [responseCount, orgCount] = await Promise.all([
          // Pilot surveys have no real answers yet; count the pilot ones.
          repository.countBySurvey(
            survey.slug,
            survey.status === SurveyStatus.Pilot
          ),
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

    // Survey data lists oldest first; show newest first.
    return withCounts.reverse()
  }),

  getOverview: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx }) => {
      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const [
        responseCount,
        pilotCount,
        dailyCounts,
        latestResponse,
        allResponses,
      ] = await Promise.all([
        repository.countBySurvey(survey.slug),
        repository.countBySurvey(survey.slug, true),
        repository.getDailyResponseCounts(survey.slug),
        repository.getLatestResponseDate(survey.slug),
        repository.findBySurvey(survey.slug),
      ])

      const memberCount = (await import('@/data/members')).members.length

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
        if (findMemberByName(org)) respondedMemberCount++
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
      // Nearest-rank percentile on the sorted list.
      const percentile = (p: number) =>
        durations.length > 0
          ? durations[
              Math.min(
                durations.length - 1,
                Math.ceil((p / 100) * durations.length) - 1
              )
            ]!
          : null

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
        pilotCount,
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
          p10Seconds: percentile(10),
          p90Seconds: percentile(90),
          count: durations.length,
        },
      }
    }),

  /** Pilot URL with token. Server-side only; never in a public bundle. */
  getPilotLink: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx }) => {
      if (ctx.survey.status !== SurveyStatus.Pilot) return null
      const token = process.env.SURVEY_PILOT_TOKEN
      const project = getProjectForSurvey(ctx.survey.slug)
      if (!token || !project) return { url: null }
      return {
        url: `${getAppUrl().url}/forskning/${project.slug}/undersokelse?pilot=${encodeURIComponent(token)}`,
      }
    }),

  getFreeText: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx }) => {
      if (ctx.surveyRole !== 'owner' && ctx.surveyRole !== 'researcher') {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      const { survey } = ctx
      const sensitiveIds = new Set(survey.sensitiveQuestionIds ?? [])
      const responses = await repository.findBySurvey(survey.slug)
      return survey.sections.flatMap(section =>
        section.questions
          .filter(
            q =>
              (q.type === 'text' || q.type === 'textarea') &&
              !sensitiveIds.has(q.id)
          )
          .map(q => {
            const answers = responses
              .map(r => r.answers.find(a => a.questionId === q.id)?.value)
              .filter((v): v is string => typeof v === 'string' && !!v.trim())
              .map(v => v.trim())
            // Fisher-Yates, so order never reveals submission order.
            for (let i = answers.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1))
              ;[answers[i], answers[j]] = [answers[j]!, answers[i]!]
            }
            return { id: q.id, title: q.title, answers }
          })
      )
    }),

  getComparison: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx }) => {
      if (ctx.surveyRole !== 'owner' && ctx.surveyRole !== 'researcher') {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      const { comparesTo } = ctx.survey
      if (!comparesTo) throw new TRPCError({ code: 'NOT_FOUND' })
      const fetch = (slug: string) => repository.findBySurvey(slug)
      const [current, previous] = await Promise.all([
        loadWaveResults(ctx.survey.slug, fetch),
        loadWaveResults(comparesTo.slug, fetch, { preferFrozen: true }),
      ])
      if (!current || !previous) throw new TRPCError({ code: 'NOT_FOUND' })
      return {
        previousTitle:
          getSurvey(comparesTo.slug)?.title ??
          getFrozenAggregates(comparesTo.slug)?.title ??
          comparesTo.slug,
        previousTotal: previous.totalResponses,
        currentTotal: current.totalResponses,
        questions: compareWaves(current, previous, comparesTo.questionMap),
      }
    }),

  getOrganizations: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx }) => {
      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const allResponses = await repository.findBySurvey(survey.slug)

      const orgCounts = new Map<string, number>()
      for (const r of allResponses) {
        const org = resolveOrganization(r, orgQid)
        orgCounts.set(org, (orgCounts.get(org) ?? 0) + 1)
      }

      const orgBreakdown = Array.from(orgCounts.entries())
        .map(([organization, count]) => ({
          organization,
          count,
          isMember: Boolean(findMemberByName(organization)),
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
        pilot: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.surveyRole !== 'owner' && !input.pilot) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Forskere har ikke tilgang til individuelle besvarelser',
        })
      }

      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const sensitiveIds = new Set(survey.sensitiveQuestionIds ?? [])

      const [result, pilotCount] = await Promise.all([
        repository.findBySurveyPaginated(
          survey.slug,
          input.offset,
          input.limit,
          input.pilot
        ),
        repository.countBySurvey(survey.slug, true),
      ])

      return {
        responses: result.responses.map(r => {
          const org = resolveOrganization(r, orgQid)
          return {
            id: r._id,
            submittedAt: r.submittedAt,
            organization: org,
            isMember: Boolean(findMemberByName(org)),
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
        showPilotTab: survey.status === SurveyStatus.Pilot || pilotCount > 0,
        offset: input.offset,
        limit: input.limit,
      }
    }),

  exportCsv: adminSurveyProcedure
    .input(z.object({ slug: z.string(), pilot: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      if (ctx.surveyRole !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Forskere har ikke tilgang til CSV-eksport',
        })
      }

      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)
      const responses = await repository.findBySurvey(survey.slug, input.pilot)

      const columns = getExportColumns(survey)

      const headers = [
        'Tidspunkt',
        'Organisasjon',
        'Organisasjon (original)',
        'Enhet',
        'Kilde',
        ...columns.map(c => stripMarkdown(c.header)),
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
          ...columns.map(({ question: q }) => {
            const answer = q && answerMap.get(q.id)
            if (!answer) return ''
            const val = answer.arrayValue
              ? answer.arrayValue.join('; ')
              : (answer.value ?? '')
            return answer.otherText ? `${val} (${answer.otherText})` : val
          }),
        ]
      })

      return {
        csv: toCsv([headers, ...rows]),
        filename: `${survey.slug}-${input.pilot ? 'pilot-' : ''}responses.csv`,
      }
    }),

  exportAggregatedCsv: adminSurveyProcedure
    .input(z.object({ slug: z.string(), pilot: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      const responses = await repository.findBySurvey(
        ctx.survey.slug,
        input.pilot
      )
      return {
        csv: aggregatedToCsv(aggregateSurveyResults(ctx.survey, responses)),
        filename: `${ctx.survey.slug}-${input.pilot ? 'pilot-' : ''}aggregert.csv`,
      }
    }),

  deletePilotResponses: adminSurveyProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx }) => {
      if (ctx.surveyRole !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun eiere av undersøkelsen kan slette pilotsvar',
        })
      }
      if (ctx.survey.status !== SurveyStatus.Pilot) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Pilotsvar kan bare slettes mens undersøkelsen er i pilot',
        })
      }
      const deleted = await repository.deletePilotBySurvey(ctx.survey.slug)
      return { deleted }
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
      if (ctx.surveyRole !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun eiere av undersøkelsen kan koble organisasjoner',
        })
      }

      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)

      const member = findMemberByName(input.memberName)
      if (!member) {
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
        memberName: member.name,
        originalValue,
        overriddenBy: adminName,
        overriddenAt: new Date().toISOString(),
      })

      return { success: true }
    }),

  getNonRespondingContacts: adminSurveyProcedure
    .input(
      z.object({
        slug: z.string(),
        memberName: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { survey } = ctx
      const orgQid = getOrgQuestionId(survey)

      const member = findMemberByName(input.memberName)
      if (!member) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `"${input.memberName}" er ikke et gyldig medlemsnavn`,
        })
      }

      const respondedOrgs = await getRespondedOrgNames(survey.slug, orgQid)

      if (respondedOrgs.has(member.name.toLowerCase().trim())) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Denne organisasjonen har allerede svart på undersøkelsen',
        })
      }

      const result = await getSlackUsersForMember(member.name)
      if (!result) {
        return { users: [], userCount: 0 }
      }

      return {
        users: result.member.users.map(u => ({
          realName: u.realName,
          title: u.title ?? '',
          slackId: u.id,
        })),
        userCount: result.member.userCount,
      }
    }),
})
