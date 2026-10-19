import { describe, expect, it } from 'vitest'
import { compareWaves } from '../comparison'
import type { AggregatedSurveyResults } from '../aggregation'

function results(
  qid: string,
  n: number,
  options: [string, number][],
  visualization: 'bar' | 'diverging' = 'bar'
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
})
