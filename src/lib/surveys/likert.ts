import type { AggregatedOption, AggregatedQuestion } from './aggregation'

export const SUPPRESSED_VALUE = '_suppressed'

/** Scale options in order, without the k-anonymity bucket or N/A-style options. */
export function scaleOptions(options: AggregatedOption[]) {
  return options.filter(o => o.value !== SUPPRESSED_VALUE && o.scale !== false)
}

/** "Vet ikke"/N/A-style options shown outside the diverging bar. */
export function nonScaleOptions(options: AggregatedOption[]) {
  return options.filter(o => o.scale === false)
}

/** Mean on a 1..k scale, or null when nobody answered or a point is suppressed. */
export function likertAverage(options: AggregatedOption[]): number | null {
  const scale = scaleOptions(options)
  if (scale.some(o => o.suppressed)) return null
  const total = scale.reduce((s, o) => s + o.count, 0)
  if (total === 0) return null
  return scale.reduce((s, o, i) => s + (i + 1) * o.count, 0) / total
}

export function formatNb(n: number, digits = 1) {
  return n.toLocaleString('nb-NO', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/**
 * Percent of the scale that sits left of the centre line: all negative
 * shares plus half the neutral one (odd-length scales).
 */
export function divergingLeft(shares: number[]) {
  const mid = Math.floor(shares.length / 2)
  const neutral = shares.length % 2 === 1 ? shares[mid]! / 2 : 0
  return shares.slice(0, mid).reduce((s, x) => s + x, 0) + neutral
}

/** Signed percentage-point change with nb minus sign, e.g. "−1 pp". */
export function formatPp(delta: number) {
  const r = Math.round(delta)
  if (r === 0) return '0 pp'
  return `${r > 0 ? '+' : '−'}${Math.abs(r)} pp`
}

const scaleKey = (q: AggregatedQuestion) =>
  scaleOptions(q.options)
    .map(o => o.label)
    .join('\u0000')

type QuestionGroup =
  | { kind: 'single'; question: AggregatedQuestion }
  | { kind: 'likert'; questions: AggregatedQuestion[] }

/** Group consecutive diverging questions that share the same scale labels. */
export function groupQuestions(questions: AggregatedQuestion[]) {
  const groups: QuestionGroup[] = []
  for (const q of questions) {
    if (q.visualization !== 'diverging') {
      groups.push({ kind: 'single', question: q })
      continue
    }
    const last = groups.at(-1)
    if (last?.kind === 'likert' && scaleKey(last.questions[0]!) === scaleKey(q))
      last.questions.push(q)
    else groups.push({ kind: 'likert', questions: [q] })
  }
  return groups
}

/**
 * Pre-suppression mean for frozen aggregates, rounded to 1 decimal. Omitted
 * when any scale point is suppressed, since the exact mean could reveal it.
 */
export function storedAverage(
  raw: AggregatedOption[],
  suppressed: AggregatedOption[]
): number | undefined {
  if (scaleOptions(suppressed).some(o => o.suppressed)) return undefined
  const avg = likertAverage(raw)
  return avg === null ? undefined : Math.round(avg * 10) / 10
}
