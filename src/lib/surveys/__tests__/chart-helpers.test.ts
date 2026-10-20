import { describe, expect, it } from 'vitest'
import { divergingLeft, formatPp } from '../likert'

describe('divergingLeft', () => {
  it('adds negatives and half the neutral', () => {
    expect(divergingLeft([10, 20, 30, 25, 15])).toBe(45)
  })
  it('has no neutral on even scales', () => {
    expect(divergingLeft([10, 20, 30, 40])).toBe(30)
  })
})

describe('formatPp', () => {
  it('signs and rounds with nb minus', () => {
    expect(formatPp(4.4)).toBe('+4 pp')
    expect(formatPp(-0.6)).toBe('−1 pp')
    expect(formatPp(0.2)).toBe('0 pp')
  })
})
