import type { AggregatedQuestion, AggregatedSurveyResults } from './aggregation'
import { isScale, likertAverage } from './likert'

interface ComparedOption {
  value: string
  label: string
  /** null when the option does not exist in that wave. */
  previous: { count: number; percentage: number } | null
  current: { count: number; percentage: number } | null
  /** Percentage points, current minus previous; null if either is missing. */
  delta: number | null
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
      const currentCell = co
        ? { count: co.count, percentage: pct(co.count, c.responseCount) }
        : null
      const previousCell = po
        ? { count: po.count, percentage: pct(po.count, p.responseCount) }
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
      }
    })

    const question: ComparedQuestion = {
      id: curId,
      title: c.title,
      previousN: p.responseCount,
      currentN: c.responseCount,
      options,
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
