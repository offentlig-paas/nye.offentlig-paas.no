import type { AggregatedQuestion, AggregatedSurveyResults } from './aggregation'

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
  /** Mean option position (1 = first), for diverging (Likert) questions. */
  average?: { previous: number | null; current: number | null }
}

function questionsById(results: AggregatedSurveyResults) {
  return new Map(
    results.sections.flatMap(s => s.questions).map(q => [q.id, q] as const)
  )
}

const pct = (count: number, n: number) => (n > 0 ? (count / n) * 100 : 0)

function likertAverage(q: AggregatedQuestion, order: string[]): number | null {
  let sum = 0
  let total = 0
  for (const o of q.options) {
    const pos = order.indexOf(o.value)
    if (pos < 0) continue
    sum += (pos + 1) * o.count
    total += o.count
  }
  return total > 0 ? sum / total : null
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
    }
    if (c.visualization === 'diverging' || p.visualization === 'diverging') {
      const order = c.options.map(o => o.value)
      question.average = {
        previous: likertAverage(p, order),
        current: likertAverage(c, order),
      }
    }
    out.push(question)
  }
  return out
}
