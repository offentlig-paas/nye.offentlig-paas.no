import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  aggregatesDir,
  renderAggregatesIndex,
} from '../../../../scripts/aggregates-index'
import {
  getFrozenAggregates,
  loadWaveResults,
  type FrozenAggregates,
} from '../frozen'
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
    'Organisasjon,"Har dere en applikasjonsplattform?","Hvorfor lager dere plattform?"',
    ...Array(5).fill('A,Ja,"Sikkerhet, Kostoptimalisering"'),
    'b,Ja,"Sikkerhet, fordi sjefen sa det"',
    ' a ,Nei,',
  ].join('\n')

  it('counts options, folds free text into Annet and suppresses small groups', () => {
    const r = aggregateCsv(parseCsv(csv), survey, { slug: 'old', title: 'T' })
    const [platform, why] = r.sections[0]!.questions
    expect(r.totalResponses).toBe(7)
    expect(r.uniqueOrganizations).toBe(2)
    // "Nei" (1) is suppressed, and "Ja" with it so the bucket hides both.
    const nei = platform!.options.find(o => o.value === 'Nei')!
    expect(nei).toMatchObject({ count: 0, suppressed: true })
    expect(platform!.options.find(o => o.value === 'Ja')?.suppressed).toBe(true)
    expect(platform!.options.find(o => o.value === '_suppressed')?.count).toBe(
      7
    )
    // Only respondents with a platform see q9.
    expect(why!.responseCount).toBe(6)
    expect(why!.options.find(o => o.value === 'Sikkerhet')?.count).toBe(6)
    expect(why!.options.find(o => o.value === 'Annet')?.suppressed).toBe(true)
    expect(JSON.stringify(r)).not.toContain('sjefen')
  })
})

describe('compareWaves with frozen averages', () => {
  it('prefers the stored pre-suppression average', () => {
    const wave = (average?: number): FrozenAggregates => ({
      surveySlug: 's',
      title: 'T',
      frozenAt: '2026-01-01',
      totalResponses: 4,
      sections: [
        {
          id: 'core',
          title: 'C',
          questions: [
            {
              id: 'q',
              title: 'Q',
              type: 'radio',
              visualization: 'diverging',
              responseCount: 4,
              ...(average !== undefined && { average }),
              options: [
                {
                  label: 'L',
                  value: 'lo',
                  count: 0,
                  percentage: 0,
                  suppressed: true,
                },
                { label: 'H', value: 'hi', count: 3, percentage: 75 },
                {
                  label: 'Andre',
                  value: '_suppressed',
                  count: 1,
                  percentage: 25,
                },
              ],
            },
          ],
        },
      ],
    })
    const live = wave()
    live.sections[0]!.questions[0]!.options = [
      { label: 'L', value: 'lo', count: 1, percentage: 50 },
      { label: 'H', value: 'hi', count: 1, percentage: 50 },
    ]
    expect(compareWaves(live, wave(1.75), { q: 'q' })[0]!.average).toEqual({
      previous: 1.75,
      current: 1.5,
    })
    expect(compareWaves(live, wave(), { q: 'q' })[0]!.average).toEqual({
      previous: null,
      current: null,
    })
  })
})

describe('aggregates index', () => {
  it('lists every JSON file in the aggregates directory', () => {
    expect(readFileSync(join(aggregatesDir, 'index.ts'), 'utf-8')).toBe(
      renderAggregatesIndex()
    )
  })
})
