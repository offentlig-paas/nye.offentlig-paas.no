import type { AggregatedQuestion, AggregatedSurveyResults } from './aggregation'
import { isScale, likertAverage, scaleOptions } from './likert'
import { fisherExact, meanPermutationTest, wilson } from './stats'

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
  /** false when not a point on the scale (e.g. N/A). */
  scale?: false
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
  /** Diverging questions only: Δ snitt and Δ øvre del (share above the midpoint). */
  likert?: LikertChange
}

interface LikertChange {
  /** Scale option values in order (N/A options excluded). */
  scaleValues: string[]
  /** Labels of the points above the midpoint, counted in Δ øvre del. */
  upperLabels: string[]
  /** Statement wording differs between waves, so the change is not like for like. */
  changed: boolean
  /** Percent of scale answers on the positive side; null when a scale point is suppressed. */
  agree: { previous: number | null; current: number | null }
  meanDelta: number | null
  meanSignificant: boolean
  /** Percentage points. */
  agreeDelta: number | null
  agreeSignificant: boolean
}

/** Scale counts in order, or null when a point is suppressed or nobody answered. */
function scaleCounts(q: AggregatedQuestion) {
  const scale = scaleOptions(q.options)
  if (scale.some(o => o.suppressed)) return null
  const counts = scale.map(o => o.count)
  return counts.some(c => c > 0) ? counts : null
}

/** Answers above the midpoint (neutral excluded) and the scale total. */
export function agreeCounts(counts: number[]) {
  const positive = counts
    .slice(Math.ceil(counts.length / 2))
    .reduce((s, c) => s + c, 0)
  return { positive, total: counts.reduce((s, c) => s + c, 0) }
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
  const meanPs: [LikertChange, number][] = []
  const agreePs: [LikertChange, number][] = []

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
        ...((co ?? po)!.scale === false && { scale: false as const }),
        // A suppressed count reads as 0 %, so a change against it would mislead.
        delta:
          currentCell &&
          previousCell &&
          !currentCell.suppressed &&
          !previousCell.suppressed
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
      // Ordinal scales keep every point so the stacked bars stay comparable.
      options:
        c.visualization === 'ordinal'
          ? options
          : options.filter(
              o =>
                !isEmpty(o.previous) ||
                !isEmpty(o.current) ||
                // Diverging scale points stay so the bars line up.
                (c.visualization === 'diverging' &&
                  o.scale !== false &&
                  !o.value.startsWith('_'))
            ),
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
    if (c.visualization === 'diverging') {
      const pc = scaleCounts(p)
      const cc = scaleCounts(c)
      const same = !!pc && !!cc && pc.length === cc.length
      const pa = pc && agreeCounts(pc)
      const ca = cc && agreeCounts(cc)
      const avg = question.average!
      // Changed wording is not like for like: no Δ and no test.
      const like = same && c.title === p.title
      const scale = scaleOptions(c.options)
      question.likert = {
        scaleValues: scale.map(o => o.value),
        upperLabels: scale.slice(Math.ceil(scale.length / 2)).map(o => o.label),
        changed: c.title !== p.title,
        agree: {
          previous: pa && pct(pa.positive, pa.total),
          current: ca && pct(ca.positive, ca.total),
        },
        meanDelta:
          like && avg.previous !== null && avg.current !== null
            ? avg.current - avg.previous
            : null,
        agreeDelta:
          like && pa && ca
            ? pct(ca.positive, ca.total) - pct(pa.positive, pa.total)
            : null,
        meanSignificant: false,
        agreeSignificant: false,
      }
      if (like) {
        meanPs.push([question.likert, meanPermutationTest(pc, cc)])
        agreePs.push([
          question.likert,
          fisherExact(
            pa!.positive,
            pa!.total - pa!.positive,
            ca!.positive,
            ca!.total - ca!.positive
          ),
        ])
      }
    }
    out.push(question)
  }
  // Bonferroni per measure, over all Likert questions in the comparison.
  for (const p of meanPs) p[0].meanSignificant = p[1] * meanPs.length < 0.05
  for (const p of agreePs) p[0].agreeSignificant = p[1] * agreePs.length < 0.05
  return out
}
