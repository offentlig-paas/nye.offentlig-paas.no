import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { createCaller } from '@/server/root'
import { getSurvey } from '@/lib/surveys/helpers'
import {
  divergingLeft,
  formatPp,
  groupQuestions,
  upperShareLabel,
} from '@/lib/surveys/likert'
import { stripMarkdown } from '@/lib/markdown'
import { diverging, sequential } from '@/components/charts/LikertBar'
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
  v === null || v === undefined ? '–' : f.format(v)

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

const pos = (v: number, k: number) => `${((v - 1) / (k - 1)) * 100}%`

const SIG_MARK = (sig: boolean) => (sig ? ' *' : '')
const deltaMean = (l: LikertChange) =>
  l.meanDelta === null ? '–' : nbSigned.format(l.meanDelta)
const deltaAgree = (l: LikertChange) =>
  l.agreeDelta === null ? '–' : formatPp(l.agreeDelta)

type LikertChange = NonNullable<ComparedQuestion['likert']>
type Likert = ComparedQuestion & { likert: LikertChange }

const scaleOf = (q: Likert) =>
  q.likert.scaleValues.flatMap(v => q.options.filter(o => o.value === v))

function DotPlot({ rows }: { rows: Likert[] }) {
  const k = Math.max(2, rows[0]!.likert.scaleValues.length)
  const axis = Array.from({ length: k }, (_, i) => i + 1)
  const num = 'w-14 shrink-0 text-right text-xs tabular-nums sm:w-16'
  return (
    <div className={`space-y-3 ${exact}`}>
      <div className="flex items-end gap-2 sm:gap-4">
        <div className="relative h-4 flex-1 text-xs text-zinc-500 sm:ml-[40%] dark:text-zinc-400">
          {axis.map(v => (
            <span
              key={v}
              aria-hidden="true"
              className="absolute -translate-x-1/2"
              style={{ left: pos(v, k) }}
            >
              {v}
            </span>
          ))}
        </div>
        <span className={`${num} font-medium text-zinc-600 dark:text-zinc-400`}>
          Δ snitt
        </span>
        <span className={`${num} font-medium text-zinc-600 dark:text-zinc-400`}>
          {upperShareLabel(rows[0]!.likert.upperLabels)}
        </span>
      </div>
      {rows.map(q => {
        const { previous: a, current: b } = q.average!
        const l = q.likert
        return (
          <div key={q.id} className="sm:flex sm:items-center">
            <p className="text-sm text-zinc-800 sm:w-[40%] sm:pr-4 dark:text-zinc-200">
              {q.title}
              {l.changed && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {' '}
                  (endret ordlyd)
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 sm:flex-1 sm:gap-4">
              <div aria-hidden="true" className="relative h-6 flex-1">
                {axis.map(v => (
                  <div
                    key={v}
                    className="absolute inset-y-0 w-px bg-zinc-200 dark:bg-zinc-700"
                    style={{ left: pos(v, k) }}
                  />
                ))}
                {a !== null && b !== null && !l.changed && (
                  <div
                    className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500"
                    style={{
                      left: pos(Math.min(a, b), k),
                      width: `${(Math.abs(b - a) / (k - 1)) * 100}%`,
                    }}
                  />
                )}
                {(
                  [
                    [a, PREV],
                    [b, CUR],
                  ] as const
                ).map(([v, c]) =>
                  v === null ? null : (
                    <div
                      key={c}
                      className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${c}`}
                      style={{ left: pos(v, k) }}
                    />
                  )
                )}
              </div>
              <span
                className={`${num} text-zinc-700 dark:text-zinc-300 ${l.meanSignificant ? 'font-semibold' : ''}`}
                title={l.meanSignificant ? SIG_NOTE : undefined}
              >
                {deltaMean(l)}
                {SIG_MARK(l.meanSignificant)}
              </span>
              <span
                className={`${num} text-zinc-700 dark:text-zinc-300 ${l.agreeSignificant ? 'font-semibold' : ''}`}
                title={l.agreeSignificant ? SIG_NOTE : undefined}
              >
                {deltaAgree(l)}
                {SIG_MARK(l.agreeSignificant)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Badge({ sig, children }: { sig: boolean; children: string }) {
  return (
    <span
      className={`rounded bg-zinc-100 px-1.5 py-0.5 text-xs whitespace-nowrap text-zinc-700 tabular-nums dark:bg-zinc-800 dark:text-zinc-300 ${sig ? 'font-semibold' : ''}`}
      title={sig ? SIG_NOTE : undefined}
    >
      {children}
      {SIG_MARK(sig)}
    </span>
  )
}

/** One diverging bar per wave, centred on neutral, with the mean at right. */
function DivergingPair({ q, labels }: { q: Likert; labels: [string, string] }) {
  const scale = scaleOf(q)
  const k = scale.length
  const rows = (['previous', 'current'] as const).map((wave, w) => {
    // Suppressed points carry no count and drop out, as on the results page.
    const counts = scale.map(o =>
      o[wave]?.suppressed ? 0 : (o[wave]?.count ?? 0)
    )
    const total = counts.reduce((s, c) => s + c, 0)
    const shares = counts.map(c => (total > 0 ? (c / total) * 100 : 0))
    return {
      label: labels[w]!,
      counts,
      shares,
      left: divergingLeft(shares),
      avg: q.average?.[wave] ?? null,
    }
  })
  return (
    <div className={`space-y-2 ${exact}`}>
      {rows.map(r => (
        <div key={r.label}>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{r.label}</p>
          <div className="mt-0.5 flex items-center gap-3">
            <div aria-hidden="true" className="relative h-7 min-w-0 flex-1">
              <div
                className="absolute inset-y-0 flex gap-px"
                style={{ left: `${50 - r.left / 2}%`, width: '50%' }}
              >
                {r.shares.map((v, i) =>
                  v > 0 ? (
                    <div
                      key={scale[i]!.value}
                      className={`flex items-center justify-center overflow-hidden text-xs whitespace-nowrap tabular-nums ${diverging(i, k)}`}
                      style={{ width: `${v}%` }}
                    >
                      {v >= 12 && (
                        <span
                          className={`px-0.5 ${v >= 25 ? '' : 'hidden sm:inline'}`}
                        >
                          {`${Math.round(v)} % (${r.counts[i]})`}
                        </span>
                      )}
                    </div>
                  ) : null
                )}
              </div>
              <div className="absolute -inset-y-1 left-1/2 w-0.5 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100" />
            </div>
            <span className="w-16 shrink-0 text-right text-xs whitespace-nowrap text-zinc-700 tabular-nums dark:text-zinc-300">
              Snitt {r.avg === null ? '–' : nb1.format(r.avg)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

type Cell = ComparedQuestion['options'][number]['current']

const share = (c: Cell) =>
  !c
    ? '–'
    : c.suppressed
      ? 'skjult'
      : `${Math.round(c.percentage)} % (${c.count})`

const SIG_NOTE = 'p < 0,05 etter Bonferroni-korreksjon'

const ciText = (c: Cell) =>
  c?.ci
    ? `95 % konfidensintervall: ${Math.round(c.ci[0])}–${Math.round(c.ci[1])} %`
    : undefined

const withCi = (c: Cell) =>
  !c
    ? '–'
    : c.suppressed
      ? 'skjult'
      : `${nb1.format(c.percentage)}${c.ci ? ` (${Math.round(c.ci[0])}–${Math.round(c.ci[1])})` : ''}`

const formatP = (p: number | null) =>
  p === null ? '–' : p < 0.001 ? '< 0,001' : p.toFixed(3).replace('.', ',')

// Interval band behind the bar end and its caps: the bar colour, faded.
const BAND = {
  [PREV]: [
    'bg-zinc-400/45 dark:bg-zinc-500/30',
    'bg-zinc-500/60 dark:bg-zinc-400/60',
  ],
  [CUR]: [
    'bg-blue-600/30 dark:bg-blue-400/30',
    'bg-blue-700/60 dark:bg-blue-300/60',
  ],
}

function PpBadge({ o }: { o: ComparedQuestion['options'][number] }) {
  if (o.delta === null) return null
  return (
    <span
      className={`shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-xs whitespace-nowrap text-zinc-700 tabular-nums dark:bg-zinc-800 dark:text-zinc-300 ${o.significant ? 'font-semibold' : ''}`}
      title={o.significant ? SIG_NOTE : undefined}
    >
      {formatPp(o.delta)}
      {o.significant && ' *'}
    </span>
  )
}

function PairedBars({ q }: { q: ComparedQuestion }) {
  const max = Math.max(
    1,
    ...q.options.flatMap(o =>
      [o.previous, o.current].map(c => c?.ci?.[1] ?? c?.percentage ?? 0)
    )
  )
  const x = (v: number) => `${(v / max) * 100}%`
  return (
    <div className={`space-y-3 ${exact}`}>
      {q.options.map(o => (
        <div key={o.value} className="sm:flex sm:items-center sm:gap-4">
          <p className="text-sm text-zinc-800 sm:w-[40%] dark:text-zinc-200">
            {o.label}
          </p>
          <div className="mt-1 flex items-center gap-3 sm:mt-0 sm:flex-1">
            <div className="flex-1 space-y-0.5">
              {(
                [
                  [o.previous, PREV],
                  [o.current, CUR],
                ] as const
              ).map(([c, color]) => (
                <div
                  key={color}
                  className="flex items-center gap-2"
                  title={ciText(c)}
                >
                  <div className="relative h-3 w-3/4">
                    {c?.ci && (
                      <>
                        <div
                          className={`absolute inset-y-0 rounded-sm ${BAND[color][0]}`}
                          style={{
                            left: x(c.ci[0]),
                            width: x(c.ci[1] - c.ci[0]),
                          }}
                        />
                        {c.ci.map((v, i) => (
                          <div
                            key={i}
                            className={`absolute inset-y-0.5 w-px ${BAND[color][1]}`}
                            style={{ left: x(v) }}
                          />
                        ))}
                      </>
                    )}
                    <div
                      className={`relative h-3 rounded-sm ${color}`}
                      style={{ width: x(c?.percentage ?? 0) }}
                    />
                  </div>
                  <span className="text-xs whitespace-nowrap text-zinc-600 tabular-nums dark:text-zinc-400">
                    {share(c)}
                  </span>
                </div>
              ))}
            </div>
            <PpBadge o={o} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Ordinal questions: one 100 % bar per wave, light (lowest) to dark (highest). */
function StackedBars({
  q,
  labels,
}: {
  q: ComparedQuestion
  labels: [string, string]
}) {
  const scale = q.options.filter(
    o => o.scale !== false && !o.value.startsWith('_')
  )
  const other = q.options.filter(o => !scale.includes(o))
  const rows = (['previous', 'current'] as const).map((wave, w) => {
    const total = scale.reduce((s, o) => s + (o[wave]?.count ?? 0), 0)
    return {
      label: labels[w]!,
      parts: scale.map(o =>
        total > 0 ? ((o[wave]?.count ?? 0) / total) * 100 : 0
      ),
      hidden: scale.some(o => o[wave]?.suppressed),
      // N/A and similar, as text beside the bar (like LikertBar).
      other: other
        .filter(o => o[wave])
        .map(
          o => `${o.label}: ${o[wave]!.suppressed ? 'skjult' : o[wave]!.count}`
        )
        .join(' · '),
    }
  })
  return (
    <div className={`space-y-2 ${exact}`}>
      <Legend
        items={scale.map((o, i) => [o.label, sequential(i, scale.length)])}
      />
      {rows.map((r, w) => (
        <div key={w}>
          <div className="sm:flex sm:items-center sm:gap-4">
            <p className="text-xs text-zinc-600 sm:w-[25%] dark:text-zinc-400">
              {r.label}
            </p>
            <div className="mt-1 flex h-6 flex-1 overflow-hidden rounded-sm sm:mt-0">
              {r.parts.map((v, i) =>
                v > 0 ? (
                  <div
                    key={scale[i]!.value}
                    className={`flex items-center justify-center overflow-hidden text-xs tabular-nums ${sequential(i, scale.length)}`}
                    style={{ width: `${v}%` }}
                    title={`${scale[i]!.label}: ${Math.round(v)} %`}
                  >
                    {v >= 8 && `${Math.round(v)} %`}
                  </div>
                ) : null
              )}
            </div>
            {r.other && (
              <span className="mt-1 block text-xs whitespace-nowrap text-zinc-600 tabular-nums sm:mt-0 dark:text-zinc-400">
                {r.other}
              </span>
            )}
          </div>
          {r.hidden && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Noen svaralternativer er skjult. Se tabellen.
            </p>
          )}
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
  const groupStart = new Map(
    groupQuestions(data.questions).flatMap(g =>
      g.kind === 'likert' && g.questions[0]!.likert
        ? [[g.questions[0]!.id, g.questions as Likert[]] as const]
        : []
    )
  )
  const quote = (o: { label: string } | undefined) =>
    `«${stripMarkdown(o?.label ?? '')}»`

  return (
    <div className="space-y-10">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Bare spørsmål som finnes i begge bølgene vises. Forrige bølge:{' '}
        {data.previousLabel} ({data.previousTotal} svar). Denne bølgen:{' '}
        {data.currentLabel} ({data.currentTotal} svar).
      </p>

      {data.questions.map(q => {
        const group = groupStart.get(q.id)
        const scale = group && scaleOf(group[0]!)
        return (
          <Fragment key={q.id}>
            {group && scale && (
              <section className="space-y-3">
                {group.length >= 2 && (
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Gjennomsnitt per spørsmål
                  </h2>
                )}
                <Legend
                  items={[
                    [`${data.previousLabel} · n ${data.previousTotal}`, PREV],
                    [`${data.currentLabel} · n ${data.currentTotal}`, CUR],
                  ]}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  1 er {quote(scale[0])}, {scale.length} er{' '}
                  {quote(scale.at(-1))}. Δ snitt er endringen i gjennomsnittet
                  på skalaen. {upperShareLabel(group[0]!.likert.upperLabels)} =
                  endring i andelen som svarte{' '}
                  {group[0]!.likert.upperLabels
                    .map(l => quote({ label: l }))
                    .join(' eller ')}
                  , i prosentpoeng. Uthevet og merket med * betyr {SIG_NOTE}.
                </p>
                {group.length >= 2 && <DotPlot rows={group} />}
                <Legend
                  items={scale.map((o, i) => [
                    o.label,
                    diverging(i, scale.length).split(' ')[0]!,
                  ])}
                />
              </section>
            )}
            <section className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {q.title}
                </h2>
                {q.likert?.changed ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    (endret ordlyd)
                  </span>
                ) : (
                  q.likert && (
                    <div className="flex flex-wrap gap-1.5">
                      <Badge sig={q.likert.meanSignificant}>
                        {`Δ snitt ${deltaMean(q.likert)}`}
                      </Badge>
                      <Badge sig={q.likert.agreeSignificant}>
                        {`${upperShareLabel(q.likert.upperLabels)} ${deltaAgree(q.likert)}`}
                      </Badge>
                    </div>
                  )
                )}
              </div>
              {q.likert ? (
                <DivergingPair
                  q={q as Likert}
                  labels={[
                    `${data.previousLabel} · n ${q.previousN}`,
                    `${data.currentLabel} · n ${q.currentN}`,
                  ]}
                />
              ) : (
                <>
                  {q.visualization === 'ordinal' ? (
                    <StackedBars
                      q={q}
                      labels={[
                        `${data.previousLabel} · n ${q.previousN}`,
                        `${data.currentLabel} · n ${q.currentN}`,
                      ]}
                    />
                  ) : (
                    <>
                      <Legend
                        items={[
                          [`${data.previousLabel} · n ${q.previousN}`, PREV],
                          [`${data.currentLabel} · n ${q.currentN}`, CUR],
                        ]}
                      />
                      <PairedBars q={q} />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        pp = prosentpoeng. Det lyse feltet ved enden av søylen
                        viser 95 % konfidensintervall: området der den sanne
                        andelen trolig ligger. Uthevet og merket med * betyr{' '}
                        {SIG_NOTE}.
                      </p>
                    </>
                  )}
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
                      bølgen. Tall i parentes er 95 % konfidensintervall.
                      Fishers eksakte test sier hvor sannsynlig en så stor
                      endring er hvis det egentlig ikke har skjedd noe; * ={' '}
                      {SIG_NOTE}.
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
                            Snitt (1 = første svaralternativ)
                          </td>
                          <td className={td}>{cell(q.average.previous)}</td>
                          <td className={td}>{cell(q.average.current)}</td>
                          <td className={td}>
                            {q.likert
                              ? deltaMean(q.likert)
                              : q.average.previous !== null &&
                                  q.average.current !== null
                                ? nbSigned.format(
                                    q.average.current - q.average.previous
                                  )
                                : '–'}
                          </td>
                          <td className={td} />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>
          </Fragment>
        )
      })}
    </div>
  )
}
