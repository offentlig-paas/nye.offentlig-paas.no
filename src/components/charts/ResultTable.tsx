import { stripMarkdown } from '@/lib/markdown'
import type { AggregatedQuestion } from '@/lib/surveys/aggregation'

export function ResultTable({ question }: { question: AggregatedQuestion }) {
  // Same as the old bar chart: options nobody picked are not listed.
  // Suppressed options (count 0) are listed as hidden.
  const rows = question.options.filter(o => o.count > 0 || o.suppressed)
  const anyHidden = rows.some(o => o.suppressed)

  return (
    <>
      <table className="w-full text-sm">
        <caption className="mb-2 text-left text-xs text-zinc-500 dark:text-zinc-400">
          Antall svar: {question.nIsLowerBound && 'minst '}
          {question.responseCount}
        </caption>
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th scope="col" className="py-1.5 pr-3 font-medium">
              Svar
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-medium">
              Antall
            </th>
            <th scope="col" className="w-2/5 py-1.5 font-medium">
              Andel av dem som svarte
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(o => (
            <tr
              key={o.value}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
            >
              <th
                scope="row"
                className="py-1.5 pr-3 text-left font-normal text-zinc-700 dark:text-zinc-300"
              >
                {stripMarkdown(o.label)}
              </th>
              <td className="py-1.5 pr-3 text-right text-zinc-700 tabular-nums dark:text-zinc-300">
                {o.suppressed ? 'skjult' : o.count}
              </td>
              <td className="py-1.5">
                {o.suppressed ? (
                  <span className="text-zinc-600 dark:text-zinc-400">
                    skjult
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      aria-hidden="true"
                      className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] dark:bg-zinc-800"
                    >
                      <div
                        className="h-full rounded-full bg-teal-500 dark:bg-teal-400"
                        style={{ width: `${o.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-zinc-600 tabular-nums dark:text-zinc-400">
                      {o.percentage} %
                    </span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {anyHidden && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Noen svar er skjult for å hindre at enkeltpersoner kan kjennes igjen.
        </p>
      )}
    </>
  )
}
