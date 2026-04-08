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
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

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
  if (diffMins < 1) return 'Nå'
  if (diffMins < 60) return `${diffMins} min siden`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} t siden`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'I går'
  return `${diffDays} dager siden`
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
          label="Medlemmer svart"
          value={`${overview.respondedMemberCount} / ${overview.memberCount}`}
          subtext={`${memberResponseRate}% svarprosent`}
        />
        <StatCard
          icon={ChartBarIcon}
          label="Organisasjoner"
          value={overview.orgCount}
          subtext={`${overview.survey.sectionCount} seksjoner · ${overview.survey.questionCount} spørsmål`}
        />
        <StatCard
          icon={ClockIcon}
          label="Siste svar"
          value={
            overview.latestResponse
              ? formatRelativeTime(overview.latestResponse)
              : '—'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {overview.dailyCounts.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Svar over tid
            </h3>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={overview.dailyCounts}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => d.slice(5)}
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
                    cursor={{ fill: 'rgba(255,255,255,0.06)' }}
                    contentStyle={{
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                      fontSize: '12px',
                    }}
                    formatter={value => [`${value} svar`, 'Antall']}
                    labelFormatter={label => `Dato: ${label}`}
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
                    label="Raskest"
                    seconds={overview.durationStats.minSeconds}
                  />
                  <DurationStat
                    label="Lengst"
                    seconds={overview.durationStats.maxSeconds}
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

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  subtext?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl leading-tight font-bold text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          {subtext && (
            <p className="text-xs text-teal-600 dark:text-teal-400">
              {subtext}
            </p>
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
