import {
  aggregateSurveyResults,
  type AggregatedSurveyResults,
} from './aggregation'
import { getSurvey } from './helpers'
import { SurveyStatus, type SurveyDefinition } from './types'
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
 * A closed survey with frozen aggregates is served from them (made from its
 * open dataset), never from Sanity. Open surveys return null: aggregate live.
 */
export function getClosedSurveyFrozen(
  survey: Pick<SurveyDefinition, 'slug' | 'status'>
): FrozenAggregates | null {
  return survey.status === SurveyStatus.Closed
    ? getFrozenAggregates(survey.slug)
    : null
}

/**
 * Results for one wave: frozen aggregates when raw responses are gone, or
 * always for a closed survey or with `preferFrozen` (a previous wave).
 */
export async function loadWaveResults(
  slug: string,
  fetchResponses: (slug: string) => Promise<SurveyResponse[]>,
  { preferFrozen = false } = {}
): Promise<AggregatedSurveyResults | null> {
  const frozen = getFrozenAggregates(slug)
  const survey = getSurvey(slug)
  if (frozen && (preferFrozen || !survey || getClosedSurveyFrozen(survey)))
    return frozen
  if (!survey) return null
  const responses = await fetchResponses(slug)
  if (frozen && responses.length === 0) return frozen
  return aggregateSurveyResults(survey, responses)
}
