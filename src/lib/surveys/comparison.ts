import type { AggregatedQuestion, AggregatedSurveyResults } from './aggregation'
import { isScale, likertAverage } from './likert'
import { fisherExact, wilson } from './stats'

interface ComparedCell {
  count: number
  percentage: number
  /** Wilson 95 % interval in percent; absent for suppressed counts. */
  ci?: [number, number]
  /** Count hidden below minBucketSize; shown as "skjult", never as zero. */
  suppressed?: true
}

interface ComparedOption {
  value: string
  label: string
  /** null when the option does not exist in that wave. */
  previous: ComparedCell | null
  current: ComparedCell | null
  /** Percentage points, current minus previous; null if either is missing. */
  delta: number | null
  /** Fisher's exact p for the change; null when untestable (missing or suppressed). */
  p: number | null
  /** p < 0.05 after Bonferroni over the tested options in the question. */
  significant: boolean
}

export interface ComparedQuestion {
  id: string
  title: string
  previousN: number
  currentN: number
  options: ComparedOption[]
  visualization: AggregatedQuestion['visualization']
  /** Mean scale position (1 = first; N/A options excluded), for diverging and ordinal questions. */
  average?: { previous: number | null; current: number | null }
}

function questionsById(results: AggregatedSurveyResults) {
  return new Map(
    results.sections.flatMap(s => s.questions).map(q => [q.id, q] as const)
  )
}

const pct = (count: number, n: number) => (n > 0 ? (count / n) * 100 : 0)

const testable = (o: { value: string; suppressed?: true } | undefined) =>
  !!o && !o.suppressed && !o.value.startsWith('_')

function toCell(
  o: { count: number; value: string; suppressed?: true } | undefined,
  n: number
): ComparedCell | null {
  if (!o) return null
  const cell: ComparedCell = { count: o.count, percentage: pct(o.count, n) }
  if (o.suppressed) cell.suppressed = true
  if (testable(o) && n > 0) {
    const [lo, hi] = wilson(o.count, n)
    cell.ci = [lo * 100, hi * 100]
  }
  return cell
}

const isEmpty = (c: ComparedCell | null) =>
  !c || (c.count === 0 && !c.suppressed)

/** Legend name for a wave: its waveLabel, else the year in its slug. */
export function waveName(survey: { slug: string; waveLabel?: string }) {
  return survey.waveLabel ?? survey.slug.match(/\d{4}$/)?.[0] ?? survey.slug
}

/** Compare mapped questions; options are matched by value. */
export function compareWaves(
  current: AggregatedSurveyResults,
  previous: AggregatedSurveyResults,
  questionMap: Record<string, string>
): ComparedQuestion[] {
  const cur = questionsById(current)
  const prev = questionsById(previous)
  const out: ComparedQuestion[] = []

  for (const [curId, prevId] of Object.entries(questionMap)) {
    const c = cur.get(curId)
    const p = prev.get(prevId)
    if (!c || !p) continue

    const values = [
      ...c.options.map(o => o.value),
      ...p.options
        .map(o => o.value)
        .filter(v => !c.options.some(o => o.value === v)),
    ]
    const options = values.map(value => {
      const co = c.options.find(o => o.value === value)
      const po = p.options.find(o => o.value === value)
      const currentCell = toCell(co, c.responseCount)
      const previousCell = toCell(po, p.responseCount)
      const pValue =
        testable(co) && testable(po)
          ? fisherExact(
              po!.count,
              p.responseCount - po!.count,
              co!.count,
              c.responseCount - co!.count
            )
          : null
      return {
        value,
        label: (co ?? po)!.label,
        previous: previousCell,
        current: currentCell,
        delta:
          currentCell && previousCell
            ? currentCell.percentage - previousCell.percentage
            : null,
        p: pValue,
        significant: false,
      }
    })
    const tests = options.filter(o => o.p !== null).length
    for (const o of options) o.significant = o.p !== null && o.p * tests < 0.05

    const question: ComparedQuestion = {
      id: curId,
      title: c.title,
      previousN: p.responseCount,
      currentN: c.responseCount,
      // Filtered after Bonferroni so hiding empty rows does not change the stats.
      options: options.filter(o => !isEmpty(o.previous) || !isEmpty(o.current)),
      visualization: c.visualization,
    }
    if (isScale(c) || isScale(p)) {
      // Frozen waves carry the mean computed before suppression.
      const previousAvg = p.average ?? likertAverage(p.options)
      const currentAvg = c.average ?? likertAverage(c.options)
      // A suppressed scale point in either wave makes the change misleading.
      question.average =
        previousAvg === null || currentAvg === null
          ? { previous: null, current: null }
          : { previous: previousAvg, current: currentAvg }
    }
    out.push(question)
  }
  return out
}
