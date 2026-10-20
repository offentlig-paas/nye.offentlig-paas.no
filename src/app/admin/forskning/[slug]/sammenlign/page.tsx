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

type Cell = ComparedQuestion['options'][number]['current']

const share = (c: Cell) =>
  c ? `${Math.round(c.percentage)} % (${c.count})` : '—'

const SIG_NOTE = 'p < 0,05 etter Bonferroni-korreksjon'

const withCi = (c: Cell) =>
  c
    ? `${nb1.format(c.percentage)}${c.ci ? ` (${Math.round(c.ci[0])}–${Math.round(c.ci[1])})` : ''}`
    : '—'

const formatP = (p: number | null) =>
  p === null ? '—' : p < 0.001 ? '< 0,001' : p.toFixed(3).replace('.', ',')

function PairedBars({ q }: { q: ComparedQuestion }) {
  const max = Math.max(
    1,
    ...q.options.flatMap(o =>
      [o.previous, o.current].map(c => c?.ci?.[1] ?? c?.percentage ?? 0)
    )
  )
  const x = (v: number) => `${(v / max) * 100}%`
  return (
    <div aria-hidden="true" className={`space-y-3 ${exact}`}>
      {q.options.map(o => (
        <div key={o.value} className="sm:flex sm:items-center sm:gap-4">
          <p className="flex justify-between gap-2 text-sm text-zinc-800 sm:w-[40%] dark:text-zinc-200">
            <span>{o.label}</span>
            {o.delta !== null && (
              <span
                className="shrink-0 text-xs text-zinc-600 tabular-nums dark:text-zinc-400"
                title={o.significant ? SIG_NOTE : undefined}
              >
                {formatPp(o.delta)}
                {o.significant && ' *'}
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
                <div className="relative h-3 w-3/4">
                  <div
                    className={`h-3 rounded-sm ${color}`}
                    style={{ width: x(c?.percentage ?? 0) }}
                  />
                  {c?.ci && (
                    <div
                      className="absolute top-1/2 h-px -translate-y-1/2 bg-zinc-900 dark:bg-zinc-100"
                      style={{ left: x(c.ci[0]), width: x(c.ci[1] - c.ci[0]) }}
                    />
                  )}
                </div>
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
                pp = prosentpoeng. Den tynne streken viser 95 %
                konfidensintervall: området der den sanne andelen trolig ligger.
                * = {SIG_NOTE}.
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
                  n = {q.previousN} i forrige bølge, {q.currentN} i denne
                  bølgen. Tall i parentes er 95 % konfidensintervall. Fishers
                  eksakte test sier hvor sannsynlig en så stor endring er hvis
                  det egentlig ikke har skjedd noe; * = {SIG_NOTE}.
                </caption>
                <thead className="border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className={th}>Svar</th>
                    <th className={th}>{data.previousLabel} (%)</th>
                    <th className={th}>{data.currentLabel} (%)</th>
                    <th className={th}>Endring (prosentpoeng)</th>
                    <th className={th}>p (Fisher)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {q.options.map(o => (
                    <tr key={o.value}>
                      <td className="px-3 py-2">{o.label}</td>
                      <td className={td}>{withCi(o.previous)}</td>
                      <td className={td}>{withCi(o.current)}</td>
                      <td className={td}>
                        {cell(o.delta, nbSigned)}
                        {o.significant && ' *'}
                      </td>
                      <td className={td}>{formatP(o.p)}</td>
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
                      <td className={td} />
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
