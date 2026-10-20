/**
 * Freeze a closed survey's results from its published open dataset, so the
 * results page, the frozen aggregates and the open dataset show the same
 * numbers. This is the default way to close a survey; freeze-survey-
 * aggregates.ts (Sanity) is the fallback when no open dataset exists.
 *
 * Two dataset formats are read, picked by the header:
 *
 * - Row level (one response per row, as in
 *   open-data/state-of-ai-agents/2026/ai-agents-2026-anonymous.csv): column
 *   headers are question titles (a trailing " (Q5b)" tag is ignored), cells
 *   are option values, checkbox answers are ";"-joined. The rows are fed to
 *   the same aggregateSurveyResults as the live page, with groups below 3
 *   merged by suppressSmallBuckets. Values the dataset recoded (e.g. role
 *   groups, merged size bands) are kept as published: they become options of
 *   their own, and form options the dataset no longer has are dropped.
 *   Questions the dataset left out are left out here too.
 * - Aggregate table (columns column,question,answer,n, as in
 *   open-data/state-of-platforms/2026/state-of-platforms-2026-aggregate.csv):
 *   counts are copied. An `n` of "<3" was hidden by the dataset; it is
 *   written as a suppressed option with no count and no «Andre» bucket,
 *   because the hidden total cannot be derived from the table. Visible counts
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
  aggregateSurveyResults,
  suppressSmallBuckets,
  type AggregatedOption,
  type AggregatedQuestion,
  type AggregatedSurveyResults,
} from '../src/lib/surveys/aggregation'
import type { SurveyResponse } from '../src/domains/survey-response/types'
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

/** Labels for values an open dataset recoded into groups of its own. */
const RECODED_LABELS: Record<string, string> = {
  practitioner: 'Utvikler / plattform',
  'technical-leadership': 'Teknisk leder / teamleder',
  'organizational-leadership': 'IT-leder / leder',
  '1-200': '1–200',
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

function fromRows(
  rows: string[][],
  survey: SurveyDefinition,
  target: Target
): AggregatedSurveyResults {
  const [header, ...data] = rows
  const cols = header!.map(columnTitle)
  const included = target.sections.flatMap(s => s.questions)
  const columns = new Map<string, number>()
  for (const q of included) {
    const col = cols.indexOf(q.title)
    if (col >= 0) columns.set(q.id, col)
    else console.warn(`${q.id}: not in the open dataset, left out`)
  }
  const split = (q: ChoiceQuestion, cell: string) =>
    q.type === 'checkbox' ? cell.split(';').filter(Boolean) : [cell]

  // Keep recoded values as published: options of their own.
  const recoded = new Map<string, ChoiceQuestion>()
  for (const q of included) {
    const col = columns.get(q.id)
    if (col === undefined) continue
    const seen = new Set(data.flatMap(r => split(q, (r[col] ?? '').trim())))
    const known = new Set(q.options.map(o => o.value))
    const extra = [...seen].filter(v => v && !known.has(v))
    if (extra.length === 0) continue
    recoded.set(q.id, {
      ...q,
      options: [
        ...q.options.filter(o => seen.has(o.value)),
        ...extra.map(v => ({ label: RECODED_LABELS[v] ?? v, value: v })),
      ],
    })
  }
  const asPublished: SurveyDefinition = {
    ...survey,
    sections: survey.sections.map(s => ({
      ...s,
      questions: s.questions.map(q => recoded.get(q.id) ?? q),
    })),
  }

  const responses: SurveyResponse[] = data.map((r, i) => ({
    _id: String(i),
    surveySlug: survey.slug,
    surveyVersion: survey.version,
    submittedAt: '',
    answers: [...columns].flatMap(([id, col]): SurveyResponse['answers'] => {
      const q = included.find(q => q.id === id)!
      const cell = (r[col] ?? '').trim()
      if (!cell) return []
      return q.type === 'checkbox'
        ? [{ questionId: id, arrayValue: split(q, cell) }]
        : [{ questionId: id, value: cell }]
    }),
  }))

  const keep = new Set(columns.keys())
  const excludeQuestionIds = new Set(
    survey.sections
      .flatMap(s => s.questions)
      .map(q => q.id)
      .filter(id => !keep.has(id))
  )
  const results = aggregateSurveyResults(asPublished, responses, {
    excludeQuestionIds,
    minBucketSize: MIN_BUCKET,
  })
  // Store the Likert mean from unsuppressed counts so comparisons keep it.
  const raw = aggregateSurveyResults(asPublished, responses, {
    excludeQuestionIds,
  })
  const rawById = new Map(
    raw.sections.flatMap(s => s.questions).map(q => [q.id, q])
  )
  for (const q of results.sections.flatMap(s => s.questions)) {
    if (!isScale(q)) continue
    const average = storedAverage(rawById.get(q.id)!.options, q.options)
    if (average !== undefined) q.average = average
  }
  return results
}

function fromAggregateTable(
  rows: string[][],
  target: Target
): AggregatedSurveyResults {
  const [, ...data] = rows
  const total = Number(data.find(r => r[1] === 'responses')?.[3])
  if (!total) throw new Error('aggregate table has no "responses" row')
  const sections = target.sections.map(section => ({
    id: section.id,
    title: section.title,
    questions: section.questions.map(q => {
      const entries = data.filter(r => columnTitle(r[1] ?? '') === q.title)
      if (entries.length === 0)
        throw new Error(`${q.id}: no rows for "${q.title}"`)
      const values = q.options.map(o => o.value)
      const counts = new Map<string, number>()
      const hidden = new Set<string>()
      let noAnswer = 0
      for (const [, , answer = '', n = ''] of entries) {
        if (answer === '(no answer)') {
          if (n === '<3') throw new Error(`${q.id}: "(no answer)" is hidden`)
          noAnswer = Number(n)
          continue
        }
        const value =
          answer === 'other' && values.includes('Annet') ? 'Annet' : answer
        if (!values.includes(value))
          throw new Error(`${q.id}: "${answer}" is not an option`)
        if (n === '<3') hidden.add(value)
        else counts.set(value, Number(n))
      }
      const responseCount = total - noAnswer
      const options: AggregatedOption[] = q.options.map(o => {
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
  const isTable = rows[0]?.join(',') === 'column,question,answer,n'
  if (!isTable && !target.survey)
    throw new Error(`${slug}: a row-level dataset needs a survey definition`)
  const results = isTable
    ? fromAggregateTable(rows, target)
    : fromRows(rows, target.survey!, target)
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
