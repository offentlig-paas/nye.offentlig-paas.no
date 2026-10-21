import { stripMarkdown } from '@/lib/markdown'
import type { AggregatedQuestion } from '@/lib/surveys/aggregation'
import {
  SUPPRESSED_VALUE,
  divergingLeft,
  formatNb,
  likertAverage,
  nonScaleOptions,
  scaleOptions,
} from '@/lib/surveys/likert'

// Nearest the centre first. Strong ends carry white text, light steps dark
// text; the same fills read on both light and dark page backgrounds.
const NEGATIVE = ['bg-red-200 text-zinc-900', 'bg-red-700 text-white']
const POSITIVE = ['bg-emerald-200 text-zinc-900', 'bg-emerald-700 text-white']
const NEUTRAL = 'bg-zinc-300 text-zinc-900'

function color(i: number, total: number) {
  const mid = Math.floor(total / 2)
  const hasNeutral = total % 2 === 1
  if (hasNeutral && i === mid) return NEUTRAL
  if (i < mid) return NEGATIVE[Math.min(mid - 1 - i, NEGATIVE.length - 1)]!
  const p = i - (hasNeutral ? mid + 1 : mid)
  return POSITIVE[Math.min(p, POSITIVE.length - 1)]!
}

// Ordinal: one hue, light (lowest level) to dark (highest).
const SEQUENTIAL = [
  'bg-sky-100 text-zinc-900',
  'bg-sky-300 text-zinc-900',
  'bg-sky-500 text-zinc-900',
  'bg-sky-700 text-white',
  'bg-sky-900 text-white',
]

export function sequential(i: number, total: number) {
  const last = SEQUENTIAL.length - 1
  return SEQUENTIAL[total <= 1 ? last : Math.round((i * last) / (total - 1))]!
}

type Variant = AggregatedQuestion['visualization']

function fill(variant: Variant, i: number, total: number) {
  return variant === 'ordinal' ? sequential(i, total) : color(i, total)
}

function share(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : 0
}

function Bar({ question }: { question: AggregatedQuestion }) {
  const ordinal = question.visualization === 'ordinal'
  const scale = scaleOptions(question.options)
  const total = scale.reduce((s, o) => s + o.count, 0)
  const left = divergingLeft(scale.map(o => share(o.count, total)))

  // Track spans -100..100 %, so every percent is half a percent of width.
  return (
    <div
      aria-hidden="true"
      className="relative h-7 min-w-0 flex-1 [-webkit-print-color-adjust:exact] [print-color-adjust:exact]"
    >
      <div
        className="absolute inset-y-0 flex gap-px"
        style={
          ordinal
            ? { left: 0, width: '100%' }
            : { left: `${50 - left / 2}%`, width: '50%' }
        }
      >
        {scale.map((o, i) => {
          const pct = share(o.count, total)
          if (pct === 0) return null
          // Label room in diverging units: the ordinal track is twice as wide.
          const room = ordinal ? pct * 2 : pct
          return (
            <div
              key={o.value}
              className={`flex items-center justify-center overflow-hidden text-xs whitespace-nowrap ${fill(question.visualization, i, scale.length)}`}
              style={{ width: `${pct}%` }}
            >
              {room >= 12 && (
                <span
                  className={`overflow-hidden px-0.5 text-ellipsis whitespace-nowrap ${room >= 25 ? '' : 'hidden sm:inline'}`}
                >
                  {`${Math.round(pct)} % (${o.count})`}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {!ordinal && (
        <div className="absolute -inset-y-1 left-1/2 w-0.5 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100" />
      )}
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
              className={`inline-block h-3 w-3 rounded-full ${fill(questions[0]!.visualization, i, scale.length)}`}
            />
            {stripMarkdown(o.label)}
          </li>
        ))}
      </ul>

      {questions.map(q => {
        const avg = likertAverage(q.options)
        const suppressed = q.options.find(o => o.value === SUPPRESSED_VALUE)
        const outside = nonScaleOptions(q.options)
        return (
          <div key={q.id} className="break-inside-avoid space-y-1.5">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {q.title}
            </h4>
            {q.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {q.description}
              </p>
            )}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <Bar question={q} />
              <p className="shrink-0 text-xs leading-tight whitespace-nowrap text-zinc-600 tabular-nums dark:text-zinc-400">
                {avg !== null && (
                  <>
                    Gjennomsnitt{' '}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatNb(avg)}
                    </span>
                  </>
                )}
              </p>
            </div>
            {suppressed && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {suppressed.count} svar er slått sammen fordi for få valgte
                hvert av alternativene.
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
              <p className="text-zinc-500 tabular-nums dark:text-zinc-400">
                {[
                  `${q.nIsLowerBound ? 'minst ' : ''}${q.responseCount} svar`,
                  ...outside.map(
                    o =>
                      `${stripMarkdown(o.label)} ${o.suppressed ? 'for få' : `${o.count} (${o.percentage} %)`}`
                  ),
                ].join(' · ')}
              </p>
              <details className="open:basis-full">
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
                        <td className="py-0.5 pr-3 text-right">
                          {o.suppressed ? 'for få' : o.count}
                        </td>
                        <td className="py-0.5 text-right">
                          {o.suppressed ? '–' : `${o.percentage} %`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          </div>
        )
      })}
    </div>
  )
}
