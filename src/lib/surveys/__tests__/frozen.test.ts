import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  aggregatesDir,
  renderAggregatesIndex,
} from '../../../../scripts/aggregates-index'
import {
  getClosedSurveyFrozen,
  getFrozenAggregates,
  loadWaveResults,
  type FrozenAggregates,
} from '../frozen'
import { compareWaves } from '../comparison'
import { getSurvey } from '../helpers'
import { SurveyStatus } from '../types'
import {
  aggregateOpenDataset,
  columnTitle,
  resolveTarget,
} from '../../../../scripts/freeze-from-open-dataset'

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

describe('freeze-from-open-dataset', () => {
  it('maps tagged column titles to question ids', () => {
    expect(columnTitle('Hvor sikker er du på svaret over? (Q5b)')).toBe(
      'Hvor sikker er du på svaret over?'
    )
    const t = resolveTarget('state-of-platforms-2026')
    expect(t.idFor('q7-platform')).toBe('q7-platform')
    expect(
      resolveTarget('ai-agents-2026')
        .sections.flatMap(s => s.questions)
        .map(q => q.id)
    ).not.toContain('q1-org')
  })

  it('reads per-option tables, preferring survey option values', () => {
    const t = (name: string, id: string, rows: string[]) =>
      rows.map(r => `"${name}",${r},respondents,${id}`)
    const csv = [
      'table,measure,value,n,unit,question_id',
      ...t('role (Q2), groups', 'q2-role', ['developer,99,10']),
      ...t('q2-role, survey option values', 'q2-role', [
        'technical-leadership,4,10',
        'practitioner,6,10',
      ]),
      ...t('q9-usage-modes, survey option values', 'q9-usage-modes', [
        'planning,<3,8',
        'chat,5,8',
        'debugging,suppressed,8',
        '(no answer),2,10',
      ]),
      ...t('frequency, original codes', 'q11-frequency', [
        'daily,5,10',
        '(empty),2,10',
      ]),
    ].join('\n')
    const r = aggregateOpenDataset(csv, 'ai-agents-2026', { title: 'T' })
    const q = (id: string) =>
      r.sections.flatMap(s => s.questions).find(q => q.id === id)!
    expect(r.totalResponses).toBe(10)
    // Recoded groups are shown as published, in published order.
    expect(q('q2-role').options.map(o => [o.value, o.count])).toEqual([
      ['technical-leadership', 4],
      ['practitioner', 6],
    ])
    const usage = q('q9-usage-modes')
    expect(usage.responseCount).toBe(8)
    // Survey order, missing options 0, hidden cells suppressed, no bucket.
    expect(usage.options.map(o => o.value)).toEqual(
      resolveTarget('ai-agents-2026')
        .sections.flatMap(s => s.questions)
        .find(q => q.id === 'q9-usage-modes')!
        .options.map(o => o.value)
    )
    expect(usage.options.filter(o => o.suppressed).map(o => o.value)).toEqual([
      'planning',
      'debugging',
    ])
    expect(usage.options.find(o => o.value === 'chat')?.count).toBe(5)
    expect(q('q11-frequency').responseCount).toBe(8)
    expect(q('q20-trust')).toBeUndefined()
  })

  it('copies an aggregate table and keeps its hidden counts hidden', () => {
    const csv = [
      'column,question,answer,n',
      ',responses,,10',
      '7,Har dere en applikasjonsplattform?,Ja,8',
      '7,Har dere en applikasjonsplattform?,Nei,<3',
      '7,Har dere en applikasjonsplattform?,(no answer),suppressed',
    ].join('\n')
    const survey = getSurvey('state-of-platforms-2027')!
    const r = aggregateOpenDataset(csv, 'old', { title: 'T' }, [
      {
        ...survey,
        comparesTo: { slug: 'old', questionMap: { 'q7-platform': 'p' } },
      },
    ])
    const q = r.sections[0]!.questions[0]!
    expect(q.id).toBe('p')
    // No gate and "(no answer)" hidden: only the visible answers are known.
    expect(q.responseCount).toBe(8)
    expect(q.nIsLowerBound).toBe(true)
    expect(q.options).toEqual([
      expect.objectContaining({ value: 'Ja', count: 8 }),
      expect.objectContaining({ value: 'Nei', count: 0, suppressed: true }),
    ])
  })
})

describe('freeze-from-open-dataset gating', () => {
  it('takes n from the showIf gate when "(no answer)" is hidden', () => {
    const csv = [
      'column,question,answer,n',
      ',responses,,10',
      '7,Har dere en applikasjonsplattform?,Ja,7',
      '7,Har dere en applikasjonsplattform?,Nei,3',
      '10,Har plattformen selvbetjening?,Ja,4',
      '10,Har plattformen selvbetjening?,(no answer),suppressed',
    ].join('\n')
    const survey = getSurvey('state-of-platforms-2027')!
    const r = aggregateOpenDataset(csv, 'old', { title: 'T' }, [
      {
        ...survey,
        sections: [
          {
            id: 's',
            title: 'S',
            questions: [
              survey.sections
                .flatMap(s => s.questions)
                .find(q => q.id === 'q7-platform')!,
              {
                id: 'q10',
                type: 'radio',
                required: false,
                title: 'Har plattformen selvbetjening?',
                showIf: [{ questionId: 'q7-platform', anyOf: ['Ja'] }],
                options: [
                  { label: 'Ja', value: 'Ja' },
                  { label: 'Nei', value: 'Nei' },
                ],
              },
            ],
          },
        ],
        comparesTo: {
          slug: 'old',
          questionMap: { 'q7-platform': 'p', q10: 'q10' },
        },
      },
    ])
    const q = r.sections[0]!.questions.find(q => q.id === 'q10')!
    expect(q.responseCount).toBe(7)
    expect(q.nIsLowerBound).toBeUndefined()
  })
})

describe('closed surveys', () => {
  it('are served from frozen aggregates; open ones are not', async () => {
    const closed = getSurvey('ai-agents-2026')!
    expect(getClosedSurveyFrozen(closed)).toBe(
      getFrozenAggregates('ai-agents-2026')
    )
    expect(
      getClosedSurveyFrozen({ ...closed, status: SurveyStatus.Open })
    ).toBeNull()
    const fetch = vi.fn()
    expect(await loadWaveResults('ai-agents-2026', fetch)).toBe(
      getFrozenAggregates('ai-agents-2026')
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('frozen files never show a count of 1 or 2', () => {
    for (const slug of ['ai-agents-2026', 'state-of-platforms-2026']) {
      for (const q of getFrozenAggregates(slug)!.sections.flatMap(
        s => s.questions
      )) {
        for (const o of q.options) {
          if (o.value === '_suppressed') {
            expect(o.count).toBeGreaterThanOrEqual(3)
            expect(
              q.options.filter(x => x.suppressed).length
            ).toBeGreaterThanOrEqual(2)
          } else expect([1, 2]).not.toContain(o.count)
        }
      }
    }
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
