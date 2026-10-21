/**
 * Fallback: freeze a closed survey from Sanity when it has no open dataset.
 * Prefer freeze-from-open-dataset.ts, so the results page shows the same
 * numbers as the published dataset.
 *
 * Freeze a closed survey's results before its raw responses are deleted.
 *
 * Reads the real (non-pilot) responses from Sanity, aggregates them the same
 * way as the results page, drops free text, typeahead (organization names)
 * and sensitive questions, merges groups smaller than 3, and writes
 * src/data/surveys/aggregates/<slug>.json and regenerates the index there.
 * With `--out <dir>` it writes only the JSON to <dir> (dry run). Run it only
 * after the survey has closed and the open datasets are generated.
 *
 * Usage: pnpm tsx --conditions=react-server --env-file=.env.local scripts/freeze-survey-aggregates.ts <slug> [--out <dir>]
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { aggregatesDir, writeAggregatesIndex } from './aggregates-index'
import { getSurvey } from '@/lib/surveys/helpers'
import { aggregateSurveyResults } from '@/lib/surveys/aggregation'
import type { FrozenAggregates } from '@/lib/surveys/frozen'
import { isScale, storedAverage } from '@/lib/surveys/likert'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { out: { type: 'string' } },
})
const slug = positionals[0]
const survey = slug && getSurvey(slug)
if (!survey)
  throw new Error(`Usage: freeze-survey-aggregates.ts <slug> [--out <dir>]`)

const repository = new SurveyResponseRepository()
const orgQid = survey.organizationQuestionId ?? 'q1-org'
const [responses, uniqueOrganizations] = await Promise.all([
  repository.findBySurvey(survey.slug),
  repository.countUniqueOrganizations(survey.slug, orgQid),
])
if (responses.length === 0) throw new Error(`${slug}: no responses to freeze`)

const typeahead = survey.sections
  .flatMap(s => s.questions)
  .filter(q => q.type === 'typeahead')
  .map(q => q.id)

const excludeQuestionIds = new Set([orgQid, ...typeahead])
const results = aggregateSurveyResults(survey, responses, {
  excludeQuestionIds,
  minBucketSize: 3,
})
// Store the Likert mean from unsuppressed counts so comparisons keep it.
const raw = aggregateSurveyResults(survey, responses, { excludeQuestionIds })
const rawById = new Map(
  raw.sections.flatMap(s => s.questions).map(q => [q.id, q])
)
for (const q of results.sections.flatMap(s => s.questions)) {
  if (!isScale(q)) continue
  const average = storedAverage(rawById.get(q.id)!.options, q.options)
  if (average !== undefined) q.average = average
}

const frozen: FrozenAggregates = {
  ...results,
  title: survey.title,
  ...(survey.waveLabel !== undefined && { waveLabel: survey.waveLabel }),
  frozenAt: new Date().toISOString().slice(0, 10),
  uniqueOrganizations,
}

const dst = join(values.out ?? aggregatesDir, `${survey.slug}.json`)
if (values.out) mkdirSync(values.out, { recursive: true })
writeFileSync(dst, JSON.stringify(frozen, null, 2) + '\n')
console.log(`Wrote ${dst} (${responses.length} responses)`)
if (!values.out) writeAggregatesIndex()
