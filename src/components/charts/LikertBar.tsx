import { stripMarkdown } from '@/lib/markdown'
import type { AggregatedQuestion } from '@/lib/surveys/aggregation'
import {
  SUPPRESSED_VALUE,
  formatNb,
  likertAverage,
  scaleOptions,
} from '@/lib/surveys/likert'

const NEGATIVE = ['bg-red-500', 'bg-orange-400', 'bg-amber-300']
const POSITIVE = ['bg-emerald-300', 'bg-teal-500', 'bg-teal-700']
const NEUTRAL = 'bg-zinc-300 dark:bg-zinc-500'

function color(i: number, total: number) {
  const mid = Math.floor(total / 2)
  const hasNeutral = total % 2 === 1
  if (hasNeutral && i === mid) return NEUTRAL
  if (i < mid) return NEGATIVE[Math.min(mid - 1 - i, NEGATIVE.length - 1)]!
  const p = i - (hasNeutral ? mid + 1 : mid)
  return POSITIVE[Math.min(p, POSITIVE.length - 1)]!
}

function share(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : 0
}

function Bar({ question }: { question: AggregatedQuestion }) {
  const scale = scaleOptions(question.options)
  const total = scale.reduce((s, o) => s + o.count, 0)
  const mid = Math.floor(scale.length / 2)
  const hasNeutral = scale.length % 2 === 1
  const left =
    scale.slice(0, mid).reduce((s, o) => s + share(o.count, total), 0) +
    (hasNeutral ? share(scale[mid]!.count, total) / 2 : 0)

  // Track spans -100..100 %, so every percent is half a percent of width.
  return (
    <div
      aria-hidden="true"
      className="relative h-7 rounded bg-zinc-100 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] dark:bg-zinc-800"
    >
      <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-400 dark:bg-zinc-500" />
      <div
        className="absolute inset-y-0 flex"
        style={{ left: `${50 - left / 2}%`, width: '50%' }}
      >
        {scale.map((o, i) => {
          const pct = share(o.count, total)
          return (
            <div
              key={o.value}
              className={`flex items-center justify-center overflow-hidden text-[11px] whitespace-nowrap text-zinc-900 ${color(i, scale.length)}`}
              style={{ width: `${pct}%` }}
            >
              {pct >= 18 && `${Math.round(pct)} % (${o.count})`}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LikertBar({ questions }: { questions: AggregatedQuestion[] }) {
  const scale = scaleOptions(questions[0]!.options)

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] dark:text-zinc-400">
        {scale.map((o, i) => (
          <li key={o.value} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`inline-block h-3 w-3 rounded-sm ${color(i, scale.length)}`}
            />
            {i + 1}. {stripMarkdown(o.label)}
          </li>
        ))}
      </ul>

      {questions.map(q => {
        const avg = likertAverage(q.options)
        const suppressed = q.options.find(o => o.value === SUPPRESSED_VALUE)
        return (
          <div key={q.id} className="break-inside-avoid space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {q.title}
              </h4>
              <p className="text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                {avg !== null && <>Gjennomsnitt {formatNb(avg)} · </>}
                Antall svar: {q.responseCount}
              </p>
            </div>
            {q.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {q.description}
              </p>
            )}
            <Bar question={q} />
            {suppressed && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {suppressed.count} svar er slått sammen fordi for få valgte
                hvert av alternativene.
              </p>
            )}
            <details className="text-xs">
              <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">
                Vis tall
              </summary>
              <table className="mt-2 w-full">
                <thead>
                  <tr className="text-left text-zinc-500 dark:text-zinc-400">
                    <th scope="col" className="py-1 pr-3 font-medium">
                      Svar
                    </th>
                    <th
                      scope="col"
                      className="py-1 pr-3 text-right font-medium"
                    >
                      Antall
                    </th>
                    <th scope="col" className="py-1 text-right font-medium">
                      Andel av dem som svarte
                    </th>
                  </tr>
                </thead>
                <tbody className="text-zinc-700 tabular-nums dark:text-zinc-300">
                  {q.options.map(o => (
                    <tr key={o.value}>
                      <th
                        scope="row"
                        className="py-0.5 pr-3 text-left font-normal"
                      >
                        {stripMarkdown(o.label)}
                      </th>
                      <td className="py-0.5 pr-3 text-right">{o.count}</td>
                      <td className="py-0.5 text-right">{o.percentage} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        )
      })}
    </div>
  )
}
