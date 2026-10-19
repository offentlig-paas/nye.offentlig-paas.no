'use client'

import {
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Link from 'next/link'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'
import { StatCard } from '@/components/StatCard'
import { formatDateTime } from '@/lib/formatDate'

type Overview = inferRouterOutputs<AppRouter>['admin']['surveys']['getOverview']

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobil',
  tablet: 'Nettbrett',
  unknown: 'Ukjent',
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'Akkurat nå'
  if (diffMins < 60) return `${diffMins} min siden`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} t siden`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'I går'
  return `${diffDays} dager siden`
}

/** Adds zero-count days between the first and last date (YYYY-MM-DD, UTC). */
function fillMissingDays(counts: { date: string; count: number }[]) {
  if (counts.length === 0) return counts
  const byDate = new Map(counts.map(c => [c.date, c.count]))
  const out: { date: string; count: number }[] = []
  const end = new Date(`${counts[counts.length - 1]!.date}T00:00:00Z`)
  for (
    let d = new Date(`${counts[0]!.date}T00:00:00Z`);
    d <= end;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const key = d.toISOString().slice(0, 10)
    out.push({ date: key, count: byDate.get(key) ?? 0 })
  }
  return out
}

function formatDay(date: string, long = false): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: long ? 'long' : 'short',
    ...(long && { year: 'numeric' }),
    timeZone: 'UTC',
  })
}

export function AdminSurveyOverviewClient({
  overview,
}: {
  overview: Overview
}) {
  const memberResponseRate =
    overview.memberCount > 0
      ? Math.round((overview.respondedMemberCount / overview.memberCount) * 100)
      : 0

  if (overview.responseCount === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {overview.pilotCount > 0 ? (
            <>
              Ingen svar ennå –{' '}
              <Link
                href={`/admin/forskning/${overview.survey.slug}/resultater?pilot=1`}
                className="text-teal-600 hover:text-teal-500 dark:text-teal-400"
              >
                {overview.pilotCount} pilotsvar
              </Link>
              .
            </>
          ) : (
            'Ingen svar ennå'
          )}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Statistikken vises her når de første svarene kommer inn.{' '}
          <Link
            href={`/admin/forskning/${overview.survey.slug}/forhandsvisning`}
            className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400"
          >
            Se forhåndsvisning av undersøkelsen
          </Link>
        </p>
      </div>
    )
  }

  const dailyCounts = fillMissingDays(overview.dailyCounts)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label="Totalt antall svar"
          value={overview.responseCount}
        />
        <StatCard
          icon={BuildingOfficeIcon}
          label="Medlemsorganisasjoner som har svart"
          value={`${overview.respondedMemberCount} / ${overview.memberCount}`}
          subtext={`${memberResponseRate} % av alle medlemsorganisasjoner`}
        />
        <StatCard
          icon={ChartBarIcon}
          label="Organisasjoner"
          value={overview.orgCount}
          subtext="Unike organisasjoner som har svart"
        />
        <StatCard
          icon={ClockIcon}
          label="Siste svar"
          value={
            overview.latestResponse ? (
              <span title={formatDateTime(overview.latestResponse)}>
                {formatRelativeTime(overview.latestResponse)}
              </span>
            ) : (
              '—'
            )
          }
        />
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {overview.survey.sectionCount} seksjoner ·{' '}
        {overview.survey.questionCount} spørsmål
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {dailyCounts.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Svar over tid
            </h3>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyCounts}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => formatDay(d)}
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    className="text-zinc-400 dark:text-zinc-500"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                    className="text-zinc-400 dark:text-zinc-500"
                  />
                  <Tooltip
                    cursor={{ fill: 'currentColor', fillOpacity: 0.08 }}
                    wrapperClassName="!rounded-lg !border-zinc-200 !bg-white !text-xs !text-zinc-900 dark:!border-zinc-700 dark:!bg-zinc-900 dark:!text-zinc-100"
                    formatter={value => [`${value} svar`, 'Antall']}
                    labelFormatter={label => formatDay(String(label), true)}
                  />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <div className="space-y-6">
          {overview.durationStats.count > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                Tid brukt
              </h3>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  <DurationStat
                    label="Median"
                    seconds={overview.durationStats.medianSeconds}
                  />
                  <DurationStat
                    label="Gjennomsnitt"
                    seconds={overview.durationStats.avgSeconds}
                  />
                  <DurationStat
                    label="Raskeste 10 %"
                    seconds={overview.durationStats.p10Seconds}
                  />
                  <DurationStat
                    label="Tregeste 10 %"
                    seconds={overview.durationStats.p90Seconds}
                  />
                </div>
              </div>
            </section>
          )}

          {overview.deviceBreakdown.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                Enheter
              </h3>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="space-y-3">
                  {overview.deviceBreakdown.map(d => {
                    const pct =
                      overview.responseCount > 0
                        ? Math.round((d.count / overview.responseCount) * 100)
                        : 0
                    return (
                      <div key={d.device}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {DEVICE_LABELS[d.device] ?? d.device}
                          </span>
                          <span className="text-zinc-500 tabular-nums dark:text-zinc-400">
                            {d.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
                          <div
                            className="h-full rounded-full bg-teal-500 transition-all dark:bg-teal-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function DurationStat({
  label,
  seconds,
}: {
  label: string
  seconds: number | null
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
        {seconds !== null ? formatDuration(seconds) : '—'}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  )
}
