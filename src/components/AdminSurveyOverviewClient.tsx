'use client'

import {
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type Overview = inferRouterOutputs<AppRouter>['admin']['surveys']['getOverview']

export function AdminSurveyOverviewClient({
  overview,
}: {
  overview: Overview
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={UsersIcon}
          label="Totalt antall svar"
          value={overview.responseCount}
        />
        <StatCard
          icon={BuildingOfficeIcon}
          label="Unike organisasjoner"
          value={overview.orgCount}
        />
        <StatCard
          icon={DocumentTextIcon}
          label="Spørsmål"
          value={overview.survey.questionCount}
        />
      </div>

      {overview.orgBreakdown.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Organisasjoner
          </h3>
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Organisasjon
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Antall
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                {overview.orgBreakdown.map(row => (
                  <tr key={row.organization}>
                    <td className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100">
                      {row.organization}
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {overview.dailyCounts.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Svar over tid
          </h3>
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Dato
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Antall
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                {overview.dailyCounts.map(row => (
                  <tr key={row.date}>
                    <td className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100">
                      {row.date}
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        </div>
      </div>
    </div>
  )
}
