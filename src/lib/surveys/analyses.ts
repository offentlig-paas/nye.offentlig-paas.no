import 'server-only'
import { canonicalOrgName } from '@/data/members'
import type { SurveyResponse } from '@/domains/survey-response/types'
import {
  aggregateSurveyResults,
  suppressSmallBuckets,
  type AggregatedOption,
  type AggregatedSurveyResults,
} from './aggregation'
import { contingencyTest, groupDisagreementTest, mcnemarExact } from './stats'
import type {
  CheckboxQuestion,
  RadioQuestion,
  SurveyDefinition,
  SurveyQuestion,
} from './types'

/**
 * Analyses that need raw answers with organization identity. They run on the
 * server and return per-question aggregates only, never rows or org names.
 */

const UNKNOWN = 'Ukjent'
const TIE = 'uavklart'

export function resolveOrganization(
  response: Pick<SurveyResponse, 'answers' | 'organizationOverride'>,
  orgQid: string
): string {
  const org =
    response.organizationOverride?.memberName ||
    response.answers.find(a => a.questionId === orgQid)?.value
  return org === undefined ? UNKNOWN : canonicalOrgName(org)
}

const orgQuestionId = (s: SurveyDefinition) =>
  s.organizationQuestionId ?? 'q1-org'

/** Responses grouped by organization; each unknown org stands alone. */
function groupByOrg(survey: SurveyDefinition, responses: SurveyResponse[]) {
  const groups = new Map<string, SurveyResponse[]>()
  for (const r of responses) {
    const org = resolveOrganization(r, orgQuestionId(survey))
    const key = org === UNKNOWN ? `_${r._id}` : org.toLowerCase().trim()
    groups.set(key, [...(groups.get(key) ?? []), r])
  }
  return groups
}

const allQuestions = (s: SurveyDefinition) =>
  s.sections.flatMap(sec => sec.questions)

type Choice = RadioQuestion | CheckboxQuestion
const isChoice = (q: SurveyQuestion): q is Choice =>
  q.type === 'radio' || q.type === 'checkbox'
const shown = (s: SurveyDefinition, q: SurveyQuestion) =>
  q.visualization !== 'hidden' && !(s.sensitiveQuestionIds ?? []).includes(q.id)

/**
 * One synthetic response per organization: majority vote for single choice
 * (ties become "uavklart"), union for multiple choice, first answer otherwise.
 */
function toOrgResponses(survey: SurveyDefinition, responses: SurveyResponse[]) {
  const types = new Map(allQuestions(survey).map(q => [q.id, q.type]))
  const out: SurveyResponse[] = []
  for (const [key, group] of groupByOrg(survey, responses)) {
    const byQ = new Map<string, SurveyResponse['answers']>()
    for (const r of group)
      for (const a of r.answers)
        byQ.set(a.questionId, [...(byQ.get(a.questionId) ?? []), a])
    const answers: SurveyResponse['answers'] = []
    for (const [qid, list] of byQ) {
      const type = types.get(qid)
      if (type === 'radio') {
        const counts = new Map<string, number>()
        for (const a of list)
          if (a.value) counts.set(a.value, (counts.get(a.value) ?? 0) + 1)
        const top = Math.max(...counts.values())
        const winners = [...counts].filter(([, c]) => c === top)
        answers.push({
          questionId: qid,
          value: winners.length === 1 ? winners[0]![0] : TIE,
        })
      } else if (type === 'checkbox' || type === 'matrix') {
        answers.push({
          questionId: qid,
          arrayValue: [...new Set(list.flatMap(a => a.arrayValue ?? []))],
        })
      } else answers.push(list[0]!)
    }
    out.push({ ...group[0]!, _id: key, answers })
  }
  return out
}

/** Results with one vote per organization instead of per respondent. */
export function aggregateByOrganization(
  survey: SurveyDefinition,
  responses: SurveyResponse[]
): AggregatedSurveyResults {
  const orgResponses = toOrgResponses(survey, responses)
  const results = aggregateSurveyResults(survey, orgResponses)
  const radios = new Set(
    allQuestions(survey)
      .filter(q => q.type === 'radio')
      .map(q => q.id)
  )
  for (const q of results.sections.flatMap(s => s.questions)) {
    if (!radios.has(q.id)) continue
    const ties = orgResponses.filter(r =>
      r.answers.some(a => a.questionId === q.id && a.value === TIE)
    ).length
    if (ties === 0) continue
    // The aggregator counts unknown values as "other"; move them back out.
    const other = q.options.find(o => o.value === 'other')
    if (other) other.count -= ties
    q.options.push({
      label: 'Uavklart (like mange stemmer)',
      value: TIE,
      count: ties,
      percentage: Math.round((ties / Math.max(1, q.responseCount)) * 100),
    })
  }
  return results
}

const MIN_MULTI_ORGS = 5

export interface AgreementRow {
  id: string
  title: string
  orgs: number
  observed: number
  nullMean: number
  nullInterval: [number, number]
  p: number
}

/** Within-org disagreement vs. chance, per single-choice question. */
export function withinOrgAgreement(
  survey: SurveyDefinition,
  responses: SurveyResponse[]
): AgreementRow[] {
  const groups = [...groupByOrg(survey, responses).entries()].filter(
    ([k]) => !k.startsWith('_')
  )
  return allQuestions(survey)
    .filter(q => q.type === 'radio' && shown(survey, q))
    .flatMap(q => {
      const values: string[] = []
      const multi: number[][] = []
      for (const [, group] of groups) {
        const idx: number[] = []
        for (const r of group) {
          const v = r.answers.find(a => a.questionId === q.id)?.value
          if (!v) continue
          idx.push(values.length)
          values.push(v)
        }
        if (idx.length >= 2) multi.push(idx)
      }
      if (multi.length < MIN_MULTI_ORGS) return []
      return [
        {
          id: q.id,
          title: q.title,
          orgs: multi.length,
          ...groupDisagreementTest(values, multi),
        },
      ]
    })
}

const MIN_SEGMENT = 10
const MIN_CELL = 3

interface SegmentTable {
  id: string
  title: string
  type: 'radio' | 'checkbox'
  segments: { label: string; n: number; options: AggregatedOption[] }[]
  /** Only for single choice; multiple-choice answers are not independent. */
  test: { p: number; cramersV: number; method: 'chi2' | 'fisher' } | null
}

export interface SegmentBreakdown {
  id: string
  title: string
  /** Number of tests, for the Bonferroni threshold 0.05 / tests. */
  tests: number
  questions: SegmentTable[]
}

/** Every choice question broken down by each segment question. */
export function segmentBreakdowns(
  survey: SurveyDefinition,
  responses: SurveyResponse[]
): SegmentBreakdown[] {
  const questions = allQuestions(survey)
  return (survey.segmentQuestionIds ?? []).flatMap(segId => {
    const seg = questions.find(q => q.id === segId)
    if (!seg || seg.type !== 'radio') return []
    const answerOf = (r: SurveyResponse, qid: string) =>
      r.answers.find(a => a.questionId === qid)
    const groups = seg.options
      .map(o => ({
        label: o.label,
        rs: responses.filter(r => answerOf(r, segId)?.value === o.value),
      }))
      .filter(g => g.rs.length >= MIN_SEGMENT)
    if (groups.length < 2) return []

    const tables = questions
      .filter((q): q is Choice => isChoice(q) && q.id !== segId)
      .filter(q => shown(survey, q))
      .flatMap(q => {
        const segments = groups.map(g => {
          const answered = g.rs.filter(r => answerOf(r, q.id))
          const raw = q.options.map(o => {
            const count = answered.filter(r => {
              const a = answerOf(r, q.id)!
              return (a.arrayValue ?? [a.value]).includes(o.value)
            }).length
            return { label: o.label, value: o.value, count }
          })
          return { label: g.label, n: answered.length, raw }
        })
        const kept = segments.filter(s => s.n >= MIN_SEGMENT)
        if (kept.length < 2) return []
        const t =
          q.type === 'radio'
            ? contingencyTest(kept.map(s => s.raw.map(o => o.count)))
            : null
        return [
          {
            id: q.id,
            title: q.title,
            type: q.type,
            segments: kept.map(s => ({
              label: s.label,
              n: s.n,
              options: suppressSmallBuckets(
                s.raw.map(o => ({
                  ...o,
                  percentage: Math.round((o.count / s.n) * 100),
                })),
                s.n,
                MIN_CELL
              ),
            })),
            test:
              t && t.test !== 'none'
                ? { p: t.p, cramersV: t.cramersV, method: t.test }
                : null,
          },
        ]
      })
    return [
      {
        id: seg.id,
        title: seg.title,
        tests: tables.filter(t => t.test).length,
        questions: tables,
      },
    ]
  })
}

const MIN_PANEL = 5

interface PanelQuestion {
  id: string
  title: string
  pairs: number
  /** Ordinal scale: movement along the scale, with a sign test (exact McNemar). */
  scale?: { up: number; same: number; down: number; p: number }
  /** Other questions: per option, orgs that started or stopped choosing it. */
  options?: {
    label: string
    before: number
    after: number
    gained: number
    lost: number
    p: number
    significant: boolean
  }[]
}

export interface PanelResult {
  returning: number
  newOrgs: number
  questions: PanelQuestion[]
}

/** Same organizations in both waves, compared at org level. */
export function panelAnalysis(
  current: SurveyDefinition,
  currentResponses: SurveyResponse[],
  previous: SurveyDefinition,
  previousResponses: SurveyResponse[],
  questionMap: Record<string, string>
): PanelResult | null {
  const byOrg = (s: SurveyDefinition, rs: SurveyResponse[]) =>
    new Map(
      toOrgResponses(s, rs)
        .filter(r => !r._id.startsWith('_'))
        .map(r => [r._id, r] as const)
    )
  const cur = byOrg(current, currentResponses)
  const prev = byOrg(previous, previousResponses)
  const keys = [...cur.keys()].filter(k => prev.has(k))
  if (keys.length < MIN_PANEL) return null

  const values = (r: SurveyResponse, qid: string) => {
    const a = r.answers.find(x => x.questionId === qid)
    return a ? (a.arrayValue ?? (a.value ? [a.value] : [])) : null
  }
  const curQs = new Map(allQuestions(current).map(q => [q.id, q]))
  const questions = Object.entries(questionMap).flatMap<PanelQuestion>(
    ([cid, pid]) => {
      const q = curQs.get(cid)
      if (!q || !isChoice(q)) return []
      const pairs = keys.flatMap(k => {
        const a = values(prev.get(k)!, pid)
        const b = values(cur.get(k)!, cid)
        return a && b && a.length && b.length ? [[a, b] as const] : []
      })
      if (pairs.length < MIN_PANEL) return []
      const base = { id: cid, title: q.title, pairs: pairs.length }
      if (
        q.type === 'radio' &&
        (q.visualization === 'ordinal' || q.visualization === 'diverging')
      ) {
        const scale = q.options.filter(o => o.scale !== false).map(o => o.value)
        let up = 0
        let same = 0
        let down = 0
        for (const [a, b] of pairs) {
          const i = scale.indexOf(a[0]!)
          const j = scale.indexOf(b[0]!)
          if (i < 0 || j < 0) continue
          if (j > i) up++
          else if (j < i) down++
          else same++
        }
        return [
          { ...base, scale: { up, same, down, p: mcnemarExact(up, down) } },
        ]
      }
      const options = q.options.map(o => {
        const before = pairs.filter(([a]) => a.includes(o.value)).length
        const after = pairs.filter(([, b]) => b.includes(o.value)).length
        const gained = pairs.filter(
          ([a, b]) => !a.includes(o.value) && b.includes(o.value)
        ).length
        const lost = pairs.filter(
          ([a, b]) => a.includes(o.value) && !b.includes(o.value)
        ).length
        return {
          label: o.label,
          before,
          after,
          gained,
          lost,
          p: mcnemarExact(gained, lost),
          significant: false,
        }
      })
      for (const o of options) o.significant = o.p * options.length < 0.05
      return [{ ...base, options }]
    }
  )
  return {
    returning: keys.length,
    newOrgs: cur.size - keys.length,
    questions,
  }
}
