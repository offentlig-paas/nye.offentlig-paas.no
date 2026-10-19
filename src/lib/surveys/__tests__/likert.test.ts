import { describe, expect, it } from 'vitest'
import type { AggregatedQuestion } from '../aggregation'
import {
  formatNb,
  groupQuestions,
  likertAverage,
  storedAverage,
} from '../likert'

const opt = (label: string, count: number, value = label) => ({
  label,
  value,
  count,
  percentage: 0,
})

const q = (
  id: string,
  labels: string[],
  visualization: AggregatedQuestion['visualization'] = 'diverging'
): AggregatedQuestion => ({
  id,
  title: id,
  type: 'radio',
  visualization,
  responseCount: 1,
  options: labels.map(l => opt(l, 1)),
})

describe('likertAverage', () => {
  it('weights by position and ignores the suppressed bucket', () => {
    expect(
      likertAverage([
        opt('a', 1),
        opt('b', 0),
        opt('c', 3),
        opt('Andre', 5, '_suppressed'),
      ])
    ).toBe(2.5)
  })
  it('excludes non-scale options such as N/A from the average', () => {
    expect(
      likertAverage([
        opt('a', 1),
        opt('b', 1),
        { ...opt('N/A', 10), scale: false as const },
      ])
    ).toBe(1.5)
  })
  it('returns null when a scale point is suppressed', () => {
    expect(
      likertAverage([
        opt('a', 4),
        { ...opt('b', 0), suppressed: true as const },
      ])
    ).toBeNull()
  })
  it('returns null without answers', () => {
    expect(likertAverage([opt('a', 0)])).toBeNull()
  })
  it('formats with decimal comma', () => {
    expect(formatNb(2.5)).toBe('2,5')
  })
})

describe('groupQuestions', () => {
  it('groups consecutive likert questions with identical scales', () => {
    const s = ['Uenig', 'Nøytral', 'Enig']
    const groups = groupQuestions([
      q('a', s),
      q('b', s),
      q('c', ['Nei', 'Ja']),
      q('d', s, 'bar'),
      q('e', s),
    ])
    expect(
      groups.map(g => (g.kind === 'likert' ? g.questions.length : 's'))
    ).toEqual([2, 1, 's', 1])
  })
})

describe('storedAverage', () => {
  const raw = [opt('a', 1), opt('b', 2), opt('c', 4)]
  it('rounds the raw mean to one decimal', () => {
    expect(storedAverage(raw, raw)).toBe(2.4)
  })
  it('is omitted when a scale point is suppressed', () => {
    const safe = [
      { ...opt('a', 0), suppressed: true as const },
      ...raw.slice(1),
    ]
    expect(storedAverage(raw, safe)).toBeUndefined()
  })
})
