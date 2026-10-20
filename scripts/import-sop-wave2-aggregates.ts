/**
 * Turn the State of Platforms wave 2 (2026) response CSV into frozen
 * aggregates for the questions mapped in state-of-platforms-2027's
 * comparesTo.questionMap. Only counts per option are written; free text is
 * folded into «Annet» and small groups are suppressed.
 *
 * Usage: pnpm tsx scripts/import-sop-wave2-aggregates.ts <path/to/state-of-platforms-2026.csv>
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { aggregatesDir, writeAggregatesIndex } from './aggregates-index'
import { join } from 'node:path'
import { stateOfPlatforms2027 } from '../src/data/surveys/state-of-platforms-2027'
import {
  suppressSmallBuckets,
  type AggregatedSurveyResults,
} from '../src/lib/surveys/aggregation'
import type { FrozenAggregates } from '../src/lib/surveys/frozen'
import { storedAverage } from '../src/lib/surveys/likert'
import type { SurveyAnswer, SurveyDefinition } from '../src/lib/surveys/types'
import { getVisibleQuestionIds } from '../src/lib/surveys/helpers'

const MIN_BUCKET = 3

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

/** Options found in a ", "-joined checkbox answer; leftovers become «Annet». */
function splitChoices(answer: string, values: string[]): string[] {
  const parts = answer.split(', ').map(p => p.trim())
  const byLength = [...values].sort((a, b) => b.length - a.length)
  const found = new Set<string>()
  for (let i = 0; i < parts.length;) {
    const opt = byLength.find(
      v => parts.slice(i, i + v.split(', ').length).join(', ') === v
    )
    found.add(opt ?? 'Annet')
    i += opt ? opt.split(', ').length : 1
  }
  return [...found]
}

/** Distinct non-empty values in the «Organisasjon» column, case-insensitive. */
function countOrganizations(header: string[], data: string[][]): number {
  const col = header.indexOf('Organisasjon')
  if (col < 0) return 0
  return new Set(
    data.map(r => (r[col] ?? '').trim().toLowerCase()).filter(Boolean)
  ).size
}

export function aggregateCsv(
  rows: string[][],
  survey: SurveyDefinition,
  meta: { slug: string; title: string },
  minBucket = MIN_BUCKET
): FrozenAggregates {
  const [header, ...data] = rows
  const choiceQuestions = survey.sections
    .flatMap(s => s.questions)
    .filter(q => q.type === 'radio' || q.type === 'checkbox')
  const columns = new Map(
    choiceQuestions.map(q => [q.id, header!.indexOf(q.title)])
  )

  // Read each row as wave 3 answers, so n uses the same show/hide rules.
  const answerRows = data.map(r => {
    const answers = new Map<string, SurveyAnswer>()
    for (const q of choiceQuestions) {
      const answer = (r[columns.get(q.id)!] ?? '').trim()
      if (columns.get(q.id)! < 0 || !answer) continue
      const values = q.options.map(o => o.value)
      const value =
        q.type === 'checkbox'
          ? splitChoices(answer, values)
          : values.includes(answer)
            ? answer
            : 'Annet'
      answers.set(q.id, { questionId: q.id, value })
    }
    return answers
  })

  const out: AggregatedSurveyResults['sections'][number]['questions'] = []
  for (const [curId, prevId] of Object.entries(
    survey.comparesTo?.questionMap ?? {}
  )) {
    const q = choiceQuestions.find(q => q.id === curId)
    if (!q)
      throw new Error(`${curId}: only radio/checkbox questions can be mapped`)
    if (columns.get(curId)! < 0)
      throw new Error(`${curId}: no CSV column titled "${q.title}"`)
    const values = q.options.map(o => o.value)
    const counts = new Map<string, number>()
    let n = 0
    for (const answers of answerRows) {
      if (!getVisibleQuestionIds(survey.sections, answers).has(curId)) continue
      n++
      const answer = answers.get(curId)?.value ?? []
      for (const v of Array.isArray(answer) ? answer : [answer]) {
        if (!values.includes(v)) {
          throw new Error(`${curId}: "${v}" is not an option; do not map it`)
        }
        counts.set(v, (counts.get(v) ?? 0) + 1)
      }
    }
    const options = q.options.map(o => {
      const count = counts.get(o.value) ?? 0
      return {
        label: o.label,
        value: o.value,
        count,
        percentage: n > 0 ? Math.round((count / n) * 100) : 0,
      }
    })
    const diverging = q.visualization === 'diverging'
    const safe = suppressSmallBuckets(options, n, minBucket)
    const average = diverging ? storedAverage(options, safe) : undefined
    out.push({
      id: prevId,
      title: q.title,
      type: q.type,
      visualization: diverging ? 'diverging' : 'bar',
      responseCount: n,
      options: safe,
      ...(average !== undefined && { average }),
    })
  }

  return {
    surveySlug: meta.slug,
    title: meta.title,
    frozenAt: new Date().toISOString().slice(0, 10),
    totalResponses: data.length,
    uniqueOrganizations: countOrganizations(header!, data),
    sections: [{ id: 'core', title: 'Kjernespørsmål', questions: out }],
  }
}

if (process.argv[1]?.endsWith('import-sop-wave2-aggregates.ts')) {
  const csvPath = process.argv[2]
  if (!csvPath) throw new Error('Usage: import-sop-wave2-aggregates.ts <csv>')
  const result = aggregateCsv(
    parseCsv(readFileSync(csvPath, 'utf-8')),
    stateOfPlatforms2027,
    {
      slug: 'state-of-platforms-2026',
      title: 'Plattformundersøkelsen i offentlig sektor, runde 2',
    }
  )
  const dst = join(aggregatesDir, 'state-of-platforms-2026.json')
  writeFileSync(dst, JSON.stringify(result, null, 2) + '\n')
  writeAggregatesIndex()
  console.log(`Wrote ${dst}`)
}
