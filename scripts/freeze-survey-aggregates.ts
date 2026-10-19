/**
 * Freeze a closed survey's results before its raw responses are deleted.
 *
 * Reads the real (non-pilot) responses from Sanity, aggregates them the same
 * way as the results page, drops free text, typeahead (organization names)
 * and sensitive questions, merges groups smaller than 3, and writes
 * src/data/surveys/aggregates/<slug>.json. Then register the file in
 * src/lib/surveys/frozen.ts and commit it. Run it only after the survey has
 * closed and the open datasets are generated.
 *
 * Usage: pnpm tsx --conditions=react-server --env-file=.env.local scripts/freeze-survey-aggregates.ts <slug>
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getSurvey } from '@/lib/surveys/helpers'
import { aggregateSurveyResults } from '@/lib/surveys/aggregation'
import type { FrozenAggregates } from '@/lib/surveys/frozen'
import { likertAverage } from '@/lib/surveys/likert'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'

const slug = process.argv[2]
const survey = slug && getSurvey(slug)
if (!survey) throw new Error(`Usage: freeze-survey-aggregates.ts <slug>`)

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
  if (q.visualization !== 'diverging') continue
  const average = likertAverage(rawById.get(q.id)!.options)
  if (average !== null) q.average = average
}

const frozen: FrozenAggregates = {
  ...results,
  title: survey.title,
  frozenAt: new Date().toISOString().slice(0, 10),
  uniqueOrganizations,
}

const dst = join(
  import.meta.dirname,
  '..',
  `src/data/surveys/aggregates/${survey.slug}.json`
)
writeFileSync(dst, JSON.stringify(frozen, null, 2) + '\n')
console.log(`Wrote ${dst} (${responses.length} responses)`)
