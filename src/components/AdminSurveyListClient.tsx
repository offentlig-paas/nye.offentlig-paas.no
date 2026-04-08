'use client'

import Link from 'next/link'
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/Badge'
import type { BadgeColor } from '@/components/Badge'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type SurveyListItem =
  inferRouterOutputs<AppRouter>['admin']['surveys']['list'][0]

const statusLabels: Record<string, { label: string; color: BadgeColor }> = {
  draft: { label: 'Utkast', color: 'zinc' },
  open: { label: 'Åpen', color: 'green' },
  closed: { label: 'Stengt', color: 'red' },
}

export function AdminSurveyListClient({
  surveys,
}: {
  surveys: SurveyListItem[]
}) {
  if (surveys.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Ingen undersøkelser tilgjengelig.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {surveys.map(survey => {
        const status = statusLabels[survey.status] ?? statusLabels.draft!
        return (
          <Link
            key={survey.slug}
            href={`/admin/forskning/${survey.slug}`}
            className="group block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="truncate text-lg font-semibold text-zinc-900 group-hover:text-teal-600 dark:text-zinc-100 dark:group-hover:text-teal-400">
                    {survey.title}
                  </h3>
                  <Badge color={status.color}>{status.label}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <UsersIcon className="h-4 w-4" />
                    {survey.responseCount} svar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    {survey.orgCount} organisasjoner
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ChartBarIcon className="h-4 w-4" />v{survey.version}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
