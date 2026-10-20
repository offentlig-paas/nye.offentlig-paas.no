import { describe, expect, it } from 'vitest'
import {
  chiSquareSf,
  contingencyTest,
  fisherExact,
  groupDisagreementTest,
  mcnemarExact,
  seededRandom,
  wilson,
} from '../stats'

describe('wilson', () => {
  it('matches the reference interval', () => {
    const [lo, hi] = wilson(5, 10)
    expect(lo).toBeCloseTo(0.2366, 4)
    expect(hi).toBeCloseTo(0.7634, 4)
    expect(wilson(0, 0)).toEqual([0, 0])
    expect(wilson(0, 20)[0]).toBe(0)
  })
})

describe('fisherExact', () => {
  // Values from fisher_exact_2x2 in verify_paper.py / analyze_wave1_v2.py.
  it.each([
    [[1, 9, 11, 3], 0.002759456185220083],
    [[3, 1, 1, 3], 0.4857142857142857],
    [[12, 30, 25, 20], 0.01664266128496385],
    [[40, 60, 55, 45], 0.04716548538301929],
  ])('%j', (t, p) => {
    const [a, b, c, d] = t as [number, number, number, number]
    expect(fisherExact(a, b, c, d)).toBeCloseTo(p, 10)
  })
})

describe('chi-square', () => {
  it('gives the textbook critical values', () => {
    expect(chiSquareSf(3.841, 1)).toBeCloseTo(0.05, 3)
    expect(chiSquareSf(7.815, 3)).toBeCloseTo(0.05, 3)
    expect(chiSquareSf(12.592, 6)).toBeCloseTo(0.05, 3)
    expect(chiSquareSf(30, 2)).toBeCloseTo(Math.exp(-15), 12)
  })

  it('tests a contingency table with Cramér’s V', () => {
    const r = contingencyTest([
      [10, 20, 30],
      [20, 15, 5],
    ])
    expect(r.test).toBe('chi2')
    expect(r.df).toBe(2)
    expect(r.chi2).toBeCloseTo(18.651, 3)
    expect(r.p).toBeCloseTo(Math.exp(-r.chi2 / 2), 10)
    expect(r.cramersV).toBeCloseTo(Math.sqrt(18.651 / 100), 3)
  })

  it('uses Fisher for 2×2 and drops empty rows', () => {
    const r = contingencyTest([
      [10, 0, 0],
      [0, 0, 0],
      [0, 0, 10],
    ])
    expect(r.test).toBe('fisher')
    expect(r.cramersV).toBeCloseTo(1, 10)
    expect(contingencyTest([[5, 5]]).test).toBe('none')
  })
})

describe('mcnemarExact', () => {
  it('matches mcnemar_exact in analyze.py', () => {
    expect(mcnemarExact(1, 9)).toBeCloseTo(0.021484375, 12)
    expect(mcnemarExact(3, 4)).toBe(1)
    expect(mcnemarExact(0, 6)).toBeCloseTo(0.03125, 12)
    expect(mcnemarExact(0, 0)).toBe(1)
  })
})

describe('groupDisagreementTest', () => {
  it('is deterministic with a seed', () => {
    const r = seededRandom(1)
    const s = seededRandom(1)
    expect([r(), r()]).toEqual([s(), s()])
  })

  it('detects agreement within groups', () => {
    // Ten orgs of two, each in perfect agreement, answers vary across orgs.
    const values = Array.from({ length: 20 }, (_, i) =>
      String(Math.floor(i / 2) % 4)
    )
    const groups = Array.from({ length: 10 }, (_, g) => [2 * g, 2 * g + 1])
    const a = groupDisagreementTest(values, groups, { permutations: 2000 })
    const b = groupDisagreementTest(values, groups, { permutations: 2000 })
    expect(a).toEqual(b)
    expect(a.observed).toBe(0)
    expect(a.nullMean).toBeGreaterThan(0.5)
    expect(a.p).toBeLessThan(0.01)
    expect(a.nullInterval[0]).toBeLessThanOrEqual(a.nullInterval[1])
  })
})
