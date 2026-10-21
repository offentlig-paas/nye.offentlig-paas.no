import { describe, expect, it } from 'vitest'
import { agreeCounts, compareWaves, waveName } from '../comparison'
import type { AggregatedSurveyResults } from '../aggregation'

function results(
  qid: string,
  n: number,
  options: [string, number][],
  visualization: 'bar' | 'diverging' | 'ordinal' = 'bar'
): AggregatedSurveyResults {
  return {
    surveySlug: 's',
    totalResponses: n,
    sections: [
      {
        id: 'sec',
        title: 'Sec',
        questions: [
          {
            id: qid,
            title: 'Q',
            type: 'radio',
            visualization,
            responseCount: n,
            options: options.map(([value, count]) => ({
              value,
              label: value.toUpperCase(),
              count,
              percentage: 0,
            })),
          },
        ],
      },
    ],
  }
}

describe('compareWaves', () => {
  it('adds Wilson intervals and Bonferroni-corrected Fisher tests', () => {
    const [q] = compareWaves(
      results('q', 100, [
        ['a', 40],
        ['b', 60],
      ]),
      results('q', 100, [
        ['a', 10],
        ['b', 90],
      ]),
      { q: 'q' }
    )
    const a = q!.options[0]!
    expect(a.current!.ci![0]).toBeLessThan(40)
    expect(a.current!.ci![1]).toBeGreaterThan(40)
    expect(a.p).toBeLessThan(0.001)
    expect(a.significant).toBe(true)
  })

  it('computes percentage-point deltas and marks missing options', () => {
    const [q] = compareWaves(
      results('new', 10, [
        ['a', 5],
        ['c', 5],
      ]),
      results('old', 4, [
        ['a', 1],
        ['b', 3],
      ]),
      { new: 'old' }
    )
    expect(q!.previousN).toBe(4)
    expect(q!.currentN).toBe(10)
    const byValue = Object.fromEntries(q!.options.map(o => [o.value, o]))
    expect(byValue.a!.delta).toBe(25)
    expect(byValue.b!.current).toBeNull()
    expect(byValue.b!.delta).toBeNull()
    expect(byValue.c!.previous).toBeNull()
    expect(q!.average).toBeUndefined()
  })

  it('skips unmapped or missing questions and averages Likert', () => {
    const cur = results(
      'new',
      2,
      [
        ['lo', 0],
        ['hi', 2],
      ],
      'diverging'
    )
    const prev = results(
      'old',
      2,
      [
        ['lo', 1],
        ['hi', 1],
      ],
      'diverging'
    )
    expect(compareWaves(cur, prev, { other: 'old' })).toEqual([])
    const [q] = compareWaves(cur, prev, { new: 'old' })
    expect(q!.average).toEqual({ previous: 1.5, current: 2 })
  })

  it('excludes non-scale options and drops average on suppression', () => {
    const cur = results(
      'new',
      3,
      [
        ['lo', 1],
        ['hi', 1],
        ['na', 1],
      ],
      'diverging'
    )
    cur.sections[0]!.questions[0]!.options[2]!.scale = false
    const prev = results(
      'old',
      2,
      [
        ['lo', 0],
        ['hi', 2],
      ],
      'diverging'
    )
    expect(compareWaves(cur, prev, { new: 'old' })[0]!.average).toEqual({
      previous: 2,
      current: 1.5,
    })
    prev.sections[0]!.questions[0]!.options[0]!.suppressed = true
    expect(compareWaves(cur, prev, { new: 'old' })[0]!.average).toEqual({
      previous: null,
      current: null,
    })
  })

  it('averages ordinal questions too', () => {
    const rows: [string, number][] = [
      ['lo', 1],
      ['hi', 1],
    ]
    const cur = results('new', 2, rows, 'ordinal')
    const prev = results('old', 2, rows, 'ordinal')
    expect(compareWaves(cur, prev, { new: 'old' })[0]!.average).toEqual({
      previous: 1.5,
      current: 1.5,
    })
  })

  it('hides options with zero answers in both waves, keeps suppressed ones', () => {
    const prev = results('q', 10, [
      ['a', 5],
      ['zero', 0],
      ['hidden', 0],
    ])
    prev.sections[0]!.questions[0]!.options[2]!.suppressed = true
    const [q] = compareWaves(
      results('q', 10, [
        ['a', 4],
        ['zero', 0],
        ['hidden', 0],
      ]),
      prev,
      { q: 'q' }
    )
    expect(q!.options.map(o => o.value)).toEqual(['a', 'hidden'])
    expect(q!.options[1]!.previous?.suppressed).toBe(true)
    expect(q!.options[1]!.delta).toBeNull()
  })

  it('keeps zero rows on ordinal scales', () => {
    const [q] = compareWaves(
      results(
        'q',
        10,
        [
          ['a', 10],
          ['b', 0],
        ],
        'ordinal'
      ),
      results(
        'q',
        10,
        [
          ['a', 10],
          ['b', 0],
        ],
        'ordinal'
      ),
      { q: 'q' }
    )
    expect(q!.options).toHaveLength(2)
  })
})

describe('waveName', () => {
  it('uses waveLabel, then the year in the slug', () => {
    expect(waveName({ slug: 'x-2026', waveLabel: 'Våren 2026' })).toBe(
      'Våren 2026'
    )
    expect(waveName({ slug: 'state-of-platforms-2026' })).toBe('2026')
    expect(waveName({ slug: 'pilot' })).toBe('pilot')
  })
})

describe('Likert change', () => {
  const scale = (counts: number[]): [string, number][] =>
    counts.map((c, i) => [String(i + 1), c])

  it('counts answers above the midpoint as agreeing', () => {
    expect(agreeCounts([1, 2, 3, 4, 5])).toEqual({ positive: 9, total: 15 })
    expect(agreeCounts([1, 2, 3, 4])).toEqual({ positive: 7, total: 10 })
  })

  it('computes Δ øvre del and Δ snitt with significance', () => {
    const [q] = compareWaves(
      results('q', 100, scale([5, 5, 10, 40, 40]), 'diverging'),
      results('q', 100, scale([30, 30, 10, 15, 15]), 'diverging'),
      { q: 'q' }
    )
    expect(q!.likert!.agree).toEqual({ previous: 30, current: 80 })
    expect(q!.likert!.agreeDelta).toBe(50)
    expect(q!.likert!.agreeSignificant).toBe(true)
    expect(q!.likert!.meanDelta).toBeCloseTo(4.05 - 2.55)
    expect(q!.likert!.meanSignificant).toBe(true)
    expect(q!.likert!.changed).toBe(false)
  })

  it('omits Δ when a scale point is suppressed', () => {
    const cur = results('q', 50, scale([0, 5, 10, 15, 20]), 'diverging')
    cur.sections[0]!.questions[0]!.options[0]!.suppressed = true
    const [q] = compareWaves(
      cur,
      results('q', 50, scale([10, 10, 10, 10, 10]), 'diverging'),
      { q: 'q' }
    )
    expect(q!.likert!.agree.current).toBeNull()
    expect(q!.likert!.agreeDelta).toBeNull()
    expect(q!.likert!.meanDelta).toBeNull()
    expect(q!.likert!.agreeSignificant).toBe(false)
  })

  it('flags statements whose wording changed', () => {
    const prev = results('p', 20, scale([4, 4, 4, 4, 4]), 'diverging')
    prev.sections[0]!.questions[0]!.title = 'Old wording'
    const [q] = compareWaves(
      results('q', 20, scale([4, 4, 4, 4, 4]), 'diverging'),
      prev,
      { q: 'p' }
    )
    expect(q!.likert!.changed).toBe(true)
    expect(q!.likert!.meanDelta).toBeNull()
    expect(q!.likert!.agreeDelta).toBeNull()
  })

  it('keeps scale points that are empty in both waves', () => {
    const [q] = compareWaves(
      results('q', 20, scale([0, 5, 5, 5, 5]), 'diverging'),
      results('q', 20, scale([0, 4, 4, 6, 6]), 'diverging'),
      { q: 'q' }
    )
    expect(q!.options.map(o => o.value)).toEqual(['1', '2', '3', '4', '5'])
    expect(q!.likert!.upperLabels).toEqual(['4', '5'])
  })
})
