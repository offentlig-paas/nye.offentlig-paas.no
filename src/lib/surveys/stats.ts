/**
 * Small statistics helpers for survey analyses, ported from the research
 * scripts (state-of-ai-agents/analyze_wave1_v2.py, state-of-platforms/
 * analyze.py and verify_paper.py). Pure functions, no dependencies.
 */

/** Wilson score interval for a proportion, as fractions in [0, 1]. */
export function wilson(
  successes: number,
  total: number,
  z = 1.96
): [number, number] {
  if (total === 0) return [0, 0]
  const p = successes / total
  const z2 = z * z
  const denom = 1 + z2 / total
  const center = (p + z2 / (2 * total)) / denom
  const margin =
    (z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denom
  return [Math.max(0, center - margin), Math.min(1, center + margin)]
}

const logFactCache: number[] = [0]
function logFact(n: number): number {
  for (let i = logFactCache.length; i <= n; i++)
    logFactCache[i] = logFactCache[i - 1]! + Math.log(i)
  return logFactCache[n]!
}
const logComb = (n: number, k: number) =>
  logFact(n) - logFact(k) - logFact(n - k)

/** Two-sided Fisher's exact test for the 2×2 table [[a, b], [c, d]]. */
export function fisherExact(a: number, b: number, c: number, d: number) {
  const r1 = a + b
  const r2 = c + d
  const c1 = a + c
  const n = r1 + r2
  const pmf = (k: number) =>
    Math.exp(logComb(r1, k) + logComb(r2, c1 - k) - logComb(n, c1))
  const pObs = pmf(a)
  let p = 0
  for (let k = Math.max(0, c1 - r2); k <= Math.min(r1, c1); k++) {
    const pk = pmf(k)
    // Same relative tolerance as scipy, so ties count as "as extreme".
    if (pk <= pObs * (1 + 1e-7)) p += pk
  }
  return Math.min(1, p)
}

/** Regularized upper incomplete gamma Q(s, x) (Numerical Recipes). */
function gammaQ(s: number, x: number): number {
  if (x <= 0) return 1
  const lnGammaS = logGamma(s)
  if (x < s + 1) {
    let sum = 1 / s
    let term = sum
    for (let n = 1; n < 500; n++) {
      term *= x / (s + n)
      sum += term
      if (Math.abs(term) < Math.abs(sum) * 1e-14) break
    }
    return 1 - sum * Math.exp(-x + s * Math.log(x) - lnGammaS)
  }
  let b = x + 1 - s
  let c = 1e300
  let d = 1 / b
  let h = d
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - s)
    b += 2
    d = an * d + b
    if (Math.abs(d) < 1e-300) d = 1e-300
    c = b + an / c
    if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d
    const delta = d * c
    h *= delta
    if (Math.abs(delta - 1) < 1e-14) break
  }
  return Math.exp(-x + s * Math.log(x) - lnGammaS) * h
}

function logGamma(z: number): number {
  // Lanczos approximation (g = 7).
  const g = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61503916999185, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (z < 0.5)
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
  z -= 1
  let x = g[0]!
  for (let i = 1; i < 9; i++) x += g[i]! / (z + i)
  const t = z + 7.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

/** P(X ≥ x) for a chi-square distribution with `df` degrees of freedom. */
export function chiSquareSf(x: number, df: number): number {
  return gammaQ(df / 2, x / 2)
}

/**
 * Chi-square test of independence and Cramér's V for a contingency table
 * (rows × columns of counts). Empty rows and columns are dropped first.
 * A 2×2 table uses Fisher's exact test for the p-value instead.
 */
export function contingencyTest(table: number[][]) {
  let rows = table.filter(r => r.some(v => v > 0))
  const keep = rows[0]?.map((_, j) => rows.some(r => r[j]! > 0)) ?? []
  rows = rows.map(r => r.filter((_, j) => keep[j]))
  const nr = rows.length
  const nc = rows[0]?.length ?? 0
  const n = rows.flat().reduce((s, v) => s + v, 0)
  if (nr < 2 || nc < 2 || n === 0)
    return { chi2: 0, df: 0, p: 1, cramersV: 0, test: 'none' as const }
  const rt = rows.map(r => r.reduce((s, v) => s + v, 0))
  const ct = rows[0]!.map((_, j) => rows.reduce((s, r) => s + r[j]!, 0))
  let chi2 = 0
  for (let i = 0; i < nr; i++)
    for (let j = 0; j < nc; j++) {
      const e = (rt[i]! * ct[j]!) / n
      chi2 += (rows[i]![j]! - e) ** 2 / e
    }
  const df = (nr - 1) * (nc - 1)
  const cramersV = Math.sqrt(chi2 / (n * (Math.min(nr, nc) - 1)))
  if (nr === 2 && nc === 2) {
    const [[a, b], [c, d]] = rows as [[number, number], [number, number]]
    return {
      chi2,
      df,
      p: fisherExact(a, b, c, d),
      cramersV,
      test: 'fisher' as const,
    }
  }
  return { chi2, df, p: chiSquareSf(chi2, df), cramersV, test: 'chi2' as const }
}

/** Two-sided exact McNemar test: binomial test on the discordant pairs. */
export function mcnemarExact(gained: number, lost: number): number {
  const n = gained + lost
  if (n === 0) return 1
  const k = Math.min(gained, lost)
  let p = 0
  for (let i = 0; i <= k; i++) p += Math.exp(logComb(n, i) - n * Math.LN2)
  return Math.min(1, 2 * p)
}

/** Deterministic PRNG (mulberry32) returning floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Permutation test for agreement within groups. `values[i]` is one person's
 * answer and `groups` lists index sets of people in the same organization
 * (each with ≥ 2 members). Disagreement is the share of groups whose members
 * gave more than one distinct answer. Answers are shuffled across everyone
 * to build the null distribution.
 */
export function groupDisagreementTest(
  values: string[],
  groups: number[][],
  { permutations = 10_000, seed = 42 } = {}
) {
  const disagree = (v: string[]) =>
    groups.filter(g => new Set(g.map(i => v[i])).size > 1).length /
    groups.length
  const observed = disagree(values)
  const rng = seededRandom(seed)
  const perm = [...values]
  const nul: number[] = []
  for (let n = 0; n < permutations; n++) {
    for (let i = perm.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[perm[i], perm[j]] = [perm[j]!, perm[i]!]
    }
    nul.push(disagree(perm))
  }
  nul.sort((a, b) => a - b)
  return {
    observed,
    nullMean: nul.reduce((s, v) => s + v, 0) / permutations,
    nullInterval: [
      nul[Math.floor(0.025 * permutations)]!,
      nul[Math.ceil(0.975 * permutations) - 1]!,
    ] as [number, number],
    /** One-sided: share of shuffles with as little disagreement as observed. */
    p: nul.filter(v => v <= observed).length / permutations,
  }
}
