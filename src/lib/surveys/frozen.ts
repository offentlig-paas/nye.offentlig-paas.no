import {
  aggregateSurveyResults,
  type AggregatedSurveyResults,
} from './aggregation'
import { getSurvey } from './helpers'
import type { SurveyResponse } from '@/domains/survey-response/types'
import aggregates from '@/data/surveys/aggregates'

/**
 * Aggregated results kept in the repo, so results and comparisons survive
 * after raw responses are deleted. Counts only, small groups suppressed.
 */
export interface FrozenAggregates extends AggregatedSurveyResults {
  title: string
  frozenAt: string
  uniqueOrganizations?: number
}

/** Every <slug>.json in src/data/surveys/aggregates, via its generated index. */
const registry = aggregates as Record<string, FrozenAggregates>

export function getFrozenAggregates(slug: string): FrozenAggregates | null {
  return registry[slug] ?? null
}

/**
 * Results for one wave: frozen aggregates when raw responses are gone, or
 * always with `preferFrozen` (a previous wave that is never re-queried).
 */
export async function loadWaveResults(
  slug: string,
  fetchResponses: (slug: string) => Promise<SurveyResponse[]>,
  { preferFrozen = false } = {}
): Promise<AggregatedSurveyResults | null> {
  const frozen = getFrozenAggregates(slug)
  const survey = getSurvey(slug)
  if (frozen && (preferFrozen || !survey)) return frozen
  if (!survey) return null
  const responses = await fetchResponses(slug)
  if (frozen && responses.length === 0) return frozen
  return aggregateSurveyResults(survey, responses)
}
