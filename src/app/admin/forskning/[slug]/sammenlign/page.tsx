import { notFound } from 'next/navigation'
import { createCaller } from '@/server/root'
import { getSurvey } from '@/lib/surveys/helpers'
import { formatPp } from '@/lib/surveys/likert'
import type { ComparedQuestion } from '@/lib/surveys/comparison'

interface AdminSurveyComparePageProps {
  params: Promise<{ slug: string }>
}

const nb1 = new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const nbSigned = new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})
const cell = (v: number | null | undefined, f = nb1) =>
  v === null || v === undefined ? '—' : f.format(v)

const th = 'px-3 py-2 text-left font-medium'
const td = 'px-3 py-2 tabular-nums'
const PREV = 'bg-zinc-400 dark:bg-zinc-500'
const CUR = 'bg-blue-600 dark:bg-blue-400'
const exact = '[-webkit-print-color-adjust:exact] [print-color-adjust:exact]'

function Legend({ items }: { items: [string, string][] }) {
  return (
    <ul
      className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400 ${exact}`}
    >
      {items.map(([label, color]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`inline-block h-3 w-3 rounded-full ${color}`}
          />
          {label}
        </li>
      ))}
    </ul>
  )
}

const AXIS = [1, 2, 3, 4, 5]
const pos = (v: number) => `${((v - 1) / 4) * 100}%`

function DotPlot({ rows }: { rows: ComparedQuestion[] }) {
  return (
    <div aria-hidden="true" className={`space-y-3 ${exact}`}>
      <div className="relative ml-0 h-4 text-xs text-zinc-500 sm:ml-[40%] dark:text-zinc-400">
        {AXIS.map(v => (
          <span
            key={v}
            className="absolute -translate-x-1/2"
            style={{ left: pos(v) }}
          >
            {v}
          </span>
        ))}
      </div>
      {rows.map(q => {
        const a = q.average!.previous!
        const b = q.average!.current!
        return (
          <div key={q.id} className="sm:flex sm:items-center">
            <p className="text-sm text-zinc-800 sm:w-[40%] sm:pr-4 dark:text-zinc-200">
              {q.title}
            </p>
            <div className="relative h-6 sm:flex-1">
              {AXIS.map(v => (
                <div
                  key={v}
                  className="absolute inset-y-0 w-px bg-zinc-200 dark:bg-zinc-700"
                  style={{ left: pos(v) }}
                />
              ))}
              <div
                className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500"
                style={{
                  left: pos(Math.min(a, b)),
                  width: `${(Math.abs(b - a) / 4) * 100}%`,
                }}
              />
              {(
                [
                  [a, PREV],
                  [b, CUR],
                ] as const
              ).map(([v, c]) => (
                <div
                  key={c}
                  className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${c}`}
                  style={{ left: pos(v) }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const share = (c: { count: number; percentage: number } | null) =>
  c ? `${Math.round(c.percentage)} % (${c.count})` : '—'

function PairedBars({ q }: { q: ComparedQuestion }) {
  const max = Math.max(
    1,
    ...q.options.flatMap(o => [
      o.previous?.percentage ?? 0,
      o.current?.percentage ?? 0,
    ])
  )
  return (
    <div aria-hidden="true" className={`space-y-3 ${exact}`}>
      {q.options.map(o => (
        <div key={o.value} className="sm:flex sm:items-center sm:gap-4">
          <p className="flex justify-between gap-2 text-sm text-zinc-800 sm:w-[40%] dark:text-zinc-200">
            <span>{o.label}</span>
            {o.delta !== null && (
              <span className="shrink-0 text-xs text-zinc-600 tabular-nums dark:text-zinc-400">
                {formatPp(o.delta)}
              </span>
            )}
          </p>
          <div className="mt-1 space-y-0.5 sm:mt-0 sm:flex-1">
            {(
              [
                [o.previous, PREV],
                [o.current, CUR],
              ] as const
            ).map(([c, color]) => (
              <div key={color} className="flex items-center gap-2">
                <div
                  className={`h-3 rounded-sm ${color}`}
                  style={{ width: `${((c?.percentage ?? 0) / max) * 75}%` }}
                />
                <span className="text-xs whitespace-nowrap text-zinc-600 tabular-nums dark:text-zinc-400">
                  {share(c)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AdminSurveyComparePage({
  params,
}: AdminSurveyComparePageProps) {
  const { slug } = await params
  if (!getSurvey(slug)?.comparesTo) notFound()

  const caller = await createCaller()
  const data = await caller.admin.surveys.getComparison({ slug })
  // The dot plot's 1–5 agreement axis fits diverging questions only;
  // ordinal means stay in each question's table.
  const likert = data.questions.filter(
    q =>
      q.visualization === 'diverging' &&
      q.average?.previous != null &&
      q.average?.current != null
  )

  return (
    <div className="space-y-10">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Bare spørsmål som finnes i begge bølgene vises. Forrige bølge:{' '}
        {data.previousLabel} ({data.previousTotal} svar). Denne bølgen:{' '}
        {data.currentLabel} ({data.currentTotal} svar).
      </p>

      {likert.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Gjennomsnitt per påstand
          </h2>
          <Legend
            items={[
              [`${data.previousLabel} · n ${data.previousTotal}`, PREV],
              [`${data.currentLabel} · n ${data.currentTotal}`, CUR],
            ]}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            1 er helt uenig, 5 er helt enig. Tallene står i tabellen under hver
            påstand.
          </p>
          <DotPlot rows={likert} />
        </section>
      )}

      {data.questions.map(q => (
        <section key={q.id} className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {q.title}
          </h2>
          {!likert.includes(q) && (
            <>
              <Legend
                items={[
                  [`${data.previousLabel} · n ${q.previousN}`, PREV],
                  [`${data.currentLabel} · n ${q.currentN}`, CUR],
                ]}
              />
              <PairedBars q={q} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                pp = prosentpoeng
              </p>
            </>
          )}
          <details className="text-sm">
            <summary className="cursor-pointer text-xs text-zinc-600 dark:text-zinc-400">
              Vis tall
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm text-zinc-700 dark:text-zinc-300">
                <caption className="caption-bottom pt-2 text-left text-xs text-zinc-500 dark:text-zinc-400">
                  n = {q.previousN} i forrige bølge, {q.currentN} i denne bølgen
                </caption>
                <thead className="border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className={th}>Svar</th>
                    <th className={th}>{data.previousLabel} (%)</th>
                    <th className={th}>{data.currentLabel} (%)</th>
                    <th className={th}>Endring (prosentpoeng)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {q.options.map(o => (
                    <tr key={o.value}>
                      <td className="px-3 py-2">{o.label}</td>
                      <td className={td}>{cell(o.previous?.percentage)}</td>
                      <td className={td}>{cell(o.current?.percentage)}</td>
                      <td className={td}>{cell(o.delta, nbSigned)}</td>
                    </tr>
                  ))}
                  {q.average && (
                    <tr className="font-medium">
                      <td className="px-3 py-2">
                        Gjennomsnitt (1 = første svaralternativ)
                      </td>
                      <td className={td}>{cell(q.average.previous)}</td>
                      <td className={td}>{cell(q.average.current)}</td>
                      <td className={td}>
                        {q.average.previous !== null &&
                        q.average.current !== null
                          ? nbSigned.format(
                              q.average.current - q.average.previous
                            )
                          : '—'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      ))}
    </div>
  )
}
