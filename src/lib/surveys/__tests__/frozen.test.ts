import { describe, expect, it, vi } from 'vitest'
import { getFrozenAggregates, loadWaveResults } from '../frozen'
import { compareWaves } from '../comparison'
import { getSurvey } from '../helpers'
import type { SurveyDefinition } from '../types'
import {
  aggregateCsv,
  parseCsv,
} from '../../../../scripts/import-sop-wave2-aggregates'

describe('getFrozenAggregates', () => {
  it('returns the frozen wave 2 file and null for unknown slugs', () => {
    const f = getFrozenAggregates('state-of-platforms-2026')
    expect(f?.surveySlug).toBe('state-of-platforms-2026')
    expect(f?.totalResponses).toBeGreaterThan(0)
    expect(getFrozenAggregates('nope')).toBeNull()
  })

  it('covers every mapped question of state-of-platforms-2027', () => {
    const map = getSurvey('state-of-platforms-2027')!.comparesTo!.questionMap
    const ids = getFrozenAggregates('state-of-platforms-2026')!
      .sections.flatMap(s => s.questions)
      .map(q => q.id)
    expect(ids.sort()).toEqual(Object.values(map).sort())
  })
})

describe('loadWaveResults', () => {
  it('uses frozen data for the previous wave without querying', async () => {
    const fetch = vi.fn()
    const r = await loadWaveResults('state-of-platforms-2026', fetch, {
      preferFrozen: true,
    })
    expect(r).toBe(getFrozenAggregates('state-of-platforms-2026'))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('aggregates raw responses when there is no frozen file', async () => {
    const r = await loadWaveResults('state-of-platforms-2027', async () => [])
    expect(r?.totalResponses).toBe(0)
  })

  it('compares a live wave against the frozen previous wave', async () => {
    const current = await loadWaveResults('state-of-platforms-2027', async () =>
      [1, 2].map(i => ({
        _id: `r${i}`,
        surveySlug: 'state-of-platforms-2027',
        surveyVersion: 2,
        submittedAt: '2027-01-01',
        answers: [{ questionId: 'q7-platform', value: 'Ja' }],
      }))
    )
    const previous = getFrozenAggregates('state-of-platforms-2026')!
    const rows = compareWaves(current!, previous, {
      'q7-platform': 'q7-platform',
    })
    const ja = rows[0]!.options.find(o => o.value === 'Ja')!
    expect(ja.current?.percentage).toBe(100)
    expect(ja.previous?.count).toBeGreaterThan(0)
    expect(ja.delta).not.toBeNull()
  })
})

describe('import-sop-wave2-aggregates', () => {
  const survey: SurveyDefinition = {
    ...getSurvey('state-of-platforms-2027')!,
    comparesTo: {
      slug: 'old',
      questionMap: { 'q7-platform': 'q7-platform', 'q9-why': 'q9-why' },
    },
  }
  const csv = [
    '"Har dere en applikasjonsplattform?","Hvorfor lager dere plattform?"',
    ...Array(5).fill('Ja,"Sikkerhet, Kostoptimalisering"'),
    'Ja,"Sikkerhet, fordi sjefen sa det"',
    'Nei,',
  ].join('\n')

  it('counts options, folds free text into Annet and suppresses small groups', () => {
    const r = aggregateCsv(parseCsv(csv), survey, { slug: 'old', title: 'T' })
    const [platform, why] = r.sections[0]!.questions
    expect(r.totalResponses).toBe(7)
    // "Nei" (1) is merged into the suppressed bucket.
    expect(platform!.options.find(o => o.value === 'Nei')).toBeUndefined()
    expect(platform!.options.find(o => o.value === '_suppressed')?.count).toBe(
      1
    )
    // Only respondents with a platform see q9.
    expect(why!.responseCount).toBe(6)
    expect(why!.options.find(o => o.value === 'Sikkerhet')?.count).toBe(6)
    expect(why!.options.find(o => o.value === 'Annet')).toBeUndefined()
    expect(JSON.stringify(r)).not.toContain('sjefen')
  })
})
