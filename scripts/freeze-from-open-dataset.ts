/**
 * Freeze a closed survey's results from its published open dataset, so the
 * results page, the frozen aggregates and the open dataset show the same
 * numbers. This is the default way to close a survey; freeze-survey-
 * aggregates.ts (Sanity) is the fallback when no open dataset exists.
 *
 * Two dataset formats are read, picked by the header:
 *
 * - Per-option tables (columns table,measure,value,n,unit,question_id, as in
 *   open-data/state-of-ai-agents/2026/respondent-level-aggregates.csv v1.2):
 *   see fromOptionTables. Hidden cells are handled as below.
 * - Aggregate table (columns column,question,answer,n, as in
 *   open-data/state-of-platforms/2026/state-of-platforms-2026-aggregate.csv):
 *   counts are copied. An `n` of "<3" or "suppressed" (secondary
 *   suppression) was hidden by the dataset; it is written as a suppressed
 *   option with count 0 and no «Andre» bucket, because the table gives no
 *   total for the hidden cells and we do not invent one. A hidden
 *   "(no answer)" makes n the visible count of the question's showIf gate,
 *   or else the sum of visible answers, flagged nIsLowerBound. Visible counts
 *   are already 3 or more, so suppressSmallBuckets changes nothing. n per
 *   question is the total minus "(no answer)", and "other" is the «Annet»
 *   option.
 *
 * Questions come from the survey's own definition. A wave with no definition
 * (State of Platforms 2026) uses the questionMap of the survey that
 * compares to it, and is written with the previous wave's question ids.
 *
 * Usage: pnpm tsx scripts/freeze-from-open-dataset.ts <slug> <dataset.csv>
 *          [--organizations <n>] [--title <title>] [--out <dir>]
 * --organizations and --title default to the current frozen file's values.
 * With --out it writes only the JSON to <dir> (dry run).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { aggregatesDir, writeAggregatesIndex } from './aggregates-index'
import { surveys } from '../src/data/surveys'
import {
  suppressSmallBuckets,
  type AggregatedOption,
  type AggregatedQuestion,
  type AggregatedSurveyResults,
} from '../src/lib/surveys/aggregation'
import {
  getFrozenAggregates,
  type FrozenAggregates,
} from '../src/lib/surveys/frozen'
import { isScale, storedAverage } from '../src/lib/surveys/likert'
import type {
  CheckboxQuestion,
  RadioQuestion,
  SurveyDefinition,
} from '../src/lib/surveys/types'

const MIN_BUCKET = 3

/** Cells the dataset hid: "<3", or "suppressed" (secondary suppression). */
const isHidden = (n: string) => n === '<3' || n === 'suppressed'

/** Labels for values an open dataset recoded into groups of its own. */
const RECODED_LABELS: Record<string, string> = {
  practitioner: 'Utvikler / plattform',
  'technical-leadership': 'Teknisk leder / teamleder',
  'organizational-leadership': 'IT-leder / leder',
  'other-tool': 'Andre verktøy',
  'code-review-ai': 'KI-verktøy for kodegjennomgang',
  'internal-platform': 'Intern plattform',
  'open-source': 'Open source-verktøy',
}

type ChoiceQuestion = RadioQuestion | CheckboxQuestion
interface Target {
  sections: { id: string; title: string; questions: ChoiceQuestion[] }[]
  /** Question id in this definition → id written to the frozen file. */
  idFor: (id: string) => string
  survey?: SurveyDefinition
}

/** Minimal RFC 4180 parser: quoted fields, "" escapes, newlines in quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') ((field += '"'), i++)
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') (row.push(field), (field = ''))
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      ;(row.push(field), rows.push(row), (row = []), (field = ''))
    } else field += c
  }
  if (field || row.length) (row.push(field), rows.push(row))
  return rows
}

/** Dataset header → question title: drops a trailing " (Q5b)" tag. */
export const columnTitle = (header: string) =>
  header.replace(/ \(Q\w+\)$/, '').trim()

const isChoice = (q: { type: string }): q is ChoiceQuestion =>
  q.type === 'radio' || q.type === 'checkbox'

/** Public, charted choice questions of a survey, or of the wave mapped to it. */
export function resolveTarget(slug: string, all = surveys): Target {
  const survey = all.find(s => s.slug === slug)
  if (survey) {
    const hide = new Set([
      ...(survey.sensitiveQuestionIds ?? []),
      survey.organizationQuestionId ?? 'q1-org',
    ])
    return {
      survey,
      idFor: id => id,
      sections: survey.sections.map(s => ({
        id: s.id,
        title: s.title,
        questions: s.questions
          .filter(isChoice)
          .filter(q => q.visualization !== 'hidden' && !hide.has(q.id)),
      })),
    }
  }
  const next = all.find(s => s.comparesTo?.slug === slug)
  if (!next) throw new Error(`${slug}: no survey definition or comparesTo`)
  const map = next.comparesTo!.questionMap
  const questions = next.sections
    .flatMap(s => s.questions)
    .filter(q => q.id in map)
  const notChoice = questions.find(q => !isChoice(q))
  if (notChoice)
    throw new Error(`${notChoice.id}: only radio/checkbox can be mapped`)
  return {
    idFor: id => map[id]!,
    sections: [
      {
        id: 'core',
        title: 'Kjernespørsmål',
        questions: questions as ChoiceQuestion[],
      },
    ],
  }
}

/**
 * Per-option tables (state-of-ai-agents/2026/respondent-level-aggregates.csv
 * v1.2): one row per option, keyed by question_id. A question's "survey
 * option values" table wins; a question without one falls back to its other
 * table (v1.1 original codes/bands/categories). Survey options missing from
 * a table count 0. A table with values the survey does not have was recoded
 * by the dataset (role groups, tool categories): then only the published
 * values are shown, labelled by RECODED_LABELS.
 */
function fromOptionTables(
  rows: string[][],
  target: Target
): AggregatedSurveyResults {
  const [, ...data] = rows
  const tableFor = new Map<string, string>()
  for (const [table = '', , , , , id] of data) {
    if (!id) continue
    if (!tableFor.has(id) || table.endsWith(', survey option values'))
      tableFor.set(id, table)
  }
  const total = Math.max(...data.map(r => Number(r[3]) || 0))
  const sections = target.sections.map(section => ({
    id: section.id,
    title: section.title,
    questions: section.questions.flatMap(q => {
      const table = tableFor.get(q.id)
      if (!table) {
        console.warn(`${q.id}: not in the open dataset, left out`)
        return []
      }
      const counts = new Map<string, number>()
      const hidden = new Set<string>()
      let n = 0
      let empty = 0
      for (const [t, value = '', count = '', rowN = ''] of data) {
        if (t !== table || value === '(no answer)') continue
        if (value === '(empty)') {
          if (isHidden(count)) throw new Error(`${q.id}: hidden (empty)`)
          empty = Number(count)
          continue
        }
        n = Number(rowN)
        if (isHidden(count)) hidden.add(value)
        else counts.set(value, Number(count))
      }
      const published = new Set([...counts.keys(), ...hidden])
      const known = new Set(q.options.map(o => o.value))
      const extra = [...published].filter(v => !known.has(v))
      const shown = extra.length
        ? [
            ...q.options.filter(o => published.has(o.value)),
            ...extra.map(v => ({ label: RECODED_LABELS[v] ?? v, value: v })),
          ]
        : q.options
      return [buildQuestion(q, target, shown, counts, hidden, n - empty)]
    }),
  }))
  return { surveySlug: '', totalResponses: total, sections }
}

/**
 * Copies counts. A hidden cell becomes a suppressed option with count 0 and
 * no «Andre» bucket: the dataset gives no total for it and we do not invent
 * one. Visible counts are 3 or more, so suppressSmallBuckets changes nothing.
 */
function buildQuestion(
  q: ChoiceQuestion,
  target: Target,
  shown: { label: string; value: string; scale?: false }[],
  counts: Map<string, number>,
  hidden: Set<string>,
  responseCount: number
): AggregatedQuestion {
  const options: AggregatedOption[] = shown.map(o => {
    const count = counts.get(o.value) ?? 0
    return {
      label: o.label,
      value: o.value,
      ...(o.scale === false && { scale: false as const }),
      count,
      percentage:
        responseCount > 0 ? Math.round((count / responseCount) * 100) : 0,
      ...(hidden.has(o.value) && { suppressed: true as const }),
    }
  })
  const safe = suppressSmallBuckets(options, responseCount, MIN_BUCKET)
  const average = isScale(q) ? storedAverage(options, safe) : undefined
  return {
    id: target.idFor(q.id),
    title: q.title,
    type: q.type,
    visualization: (isScale(q)
      ? q.visualization
      : 'bar') as AggregatedQuestion['visualization'],
    responseCount,
    options: safe,
    ...(average !== undefined && { average }),
  }
}

function fromAggregateTable(
  rows: string[][],
  target: Target
): AggregatedSurveyResults {
  const [, ...data] = rows
  const total = Number(data.find(r => r[1] === 'responses')?.[3])
  if (!total) throw new Error('aggregate table has no "responses" row')
  const all = target.sections.flatMap(s => s.questions)
  const entriesFor = (q: ChoiceQuestion) =>
    data.filter(r => columnTitle(r[1] ?? '') === q.title)
  /**
   * Respondents shown q: the visible count of its single gating answer set,
   * or undefined when there is no such gate or a gating cell is hidden.
   */
  const gateCount = (q: ChoiceQuestion) => {
    const [cond, ...more] = q.showIf ?? []
    const gate = all.find(g => g.id === cond?.questionId)
    if (!cond?.anyOf || more.length || !gate) return undefined
    let sum = 0
    for (const [, , answer = '', n = ''] of entriesFor(gate)) {
      if (!cond.anyOf.includes(answer)) continue
      if (isHidden(n)) return undefined
      sum += Number(n)
    }
    return sum
  }
  const sections = target.sections.map(section => ({
    id: section.id,
    title: section.title,
    questions: section.questions.map(q => {
      const entries = entriesFor(q)
      if (entries.length === 0)
        throw new Error(`${q.id}: no rows for "${q.title}"`)
      const values = q.options.map(o => o.value)
      const counts = new Map<string, number>()
      const hidden = new Set<string>()
      let noAnswer: number | undefined = 0
      for (const [, , answer = '', n = ''] of entries) {
        if (answer === '(no answer)') {
          noAnswer = isHidden(n) ? undefined : Number(n)
          continue
        }
        const value =
          answer === 'other' && values.includes('Annet') ? 'Annet' : answer
        if (!values.includes(value))
          throw new Error(`${q.id}: "${answer}" is not an option`)
        if (isHidden(n)) hidden.add(value)
        else counts.set(value, Number(n))
      }
      if (noAnswer !== undefined)
        return buildQuestion(
          q,
          target,
          q.options,
          counts,
          hidden,
          total - noAnswer
        )
      // Hidden "(no answer)": n is the gate's count when the question has
      // one; otherwise only the visible answers are known (a lower bound).
      const gated = gateCount(q)
      const visible = [...counts.values()].reduce((a, b) => a + b, 0)
      const question = buildQuestion(
        q,
        target,
        q.options,
        counts,
        hidden,
        gated ?? visible
      )
      return gated === undefined
        ? { ...question, nIsLowerBound: true as const }
        : question
    }),
  }))
  return { surveySlug: '', totalResponses: total, sections }
}

export function aggregateOpenDataset(
  text: string,
  slug: string,
  meta: { title: string; uniqueOrganizations?: number },
  all = surveys
): FrozenAggregates {
  const rows = parseCsv(text).filter(r => r.some(Boolean))
  const target = resolveTarget(slug, all)
  const header = rows[0]?.join(',')
  const results =
    header === 'column,question,answer,n'
      ? fromAggregateTable(rows, target)
      : header === 'table,measure,value,n,unit,question_id'
        ? fromOptionTables(rows, target)
        : (() => {
            throw new Error(`${slug}: unknown dataset header "${header}"`)
          })()
  return {
    ...results,
    surveySlug: slug,
    title: meta.title,
    frozenAt: new Date().toISOString().slice(0, 10),
    ...(meta.uniqueOrganizations !== undefined && {
      uniqueOrganizations: meta.uniqueOrganizations,
    }),
  }
}

if (process.argv[1]?.endsWith('freeze-from-open-dataset.ts')) {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: 'string' },
      organizations: { type: 'string' },
      title: { type: 'string' },
    },
  })
  const [slug, csvPath] = positionals
  if (!slug || !csvPath)
    throw new Error(
      'Usage: freeze-from-open-dataset.ts <slug> <dataset.csv> [--organizations <n>] [--title <title>] [--out <dir>]'
    )
  const current = getFrozenAggregates(slug)
  const title =
    values.title ?? surveys.find(s => s.slug === slug)?.title ?? current?.title
  if (!title) throw new Error(`${slug}: pass --title`)
  const result = aggregateOpenDataset(readFileSync(csvPath, 'utf-8'), slug, {
    title,
    uniqueOrganizations: values.organizations
      ? Number(values.organizations)
      : current?.uniqueOrganizations,
  })
  const dst = join(values.out ?? aggregatesDir, `${slug}.json`)
  if (values.out) mkdirSync(values.out, { recursive: true })
  writeFileSync(dst, JSON.stringify(result, null, 2) + '\n')
  console.log(`Wrote ${dst} (${result.totalResponses} responses)`)
  if (!values.out) writeAggregatesIndex()
}
