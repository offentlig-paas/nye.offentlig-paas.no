import { describe, expect, it } from 'vitest'
import { compareWaves, waveName } from '../comparison'
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
