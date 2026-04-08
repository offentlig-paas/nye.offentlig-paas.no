'use client'

import { useState } from 'react'
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'
import { StatCard } from '@/components/StatCard'

type OrgData =
  inferRouterOutputs<AppRouter>['admin']['surveys']['getOrganizations']

export function AdminSurveyOrganizationsClient({ data }: { data: OrgData }) {
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<
    'all' | 'members' | 'non-members' | 'missing'
  >('all')

  function toggleSector(type: string) {
    setExpandedSectors(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const filteredOrgBreakdown =
    filter === 'all'
      ? data.orgBreakdown
      : filter === 'members'
        ? data.orgBreakdown.filter(o => o.isMember)
        : filter === 'non-members'
          ? data.orgBreakdown.filter(o => !o.isMember)
          : []

  const nonMemberCount = data.orgBreakdown.filter(o => !o.isMember).length
  const missingMembers = data.sectorBreakdown
    .flatMap(s => s.organizations)
    .filter(m => !m.responded)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={BuildingOfficeIcon}
          label="Medlemmer svart"
          value={`${data.respondedMembers} / ${data.totalMembers}`}
          subtext={`${data.memberResponseRate}% svarprosent`}
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Unike organisasjoner i svar"
          value={data.orgBreakdown.length}
        />
        <StatCard
          icon={XCircleIcon}
          label="Medlemmer uten svar"
          value={data.totalMembers - data.respondedMembers}
        />
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Sektorfordeling
        </h3>
        <div className="space-y-2">
          {data.sectorBreakdown.map(sector => {
            const isExpanded = expandedSectors.has(sector.type)
            return (
              <div
                key={sector.type}
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700"
              >
                <button
                  onClick={() => toggleSector(sector.type)}
                  className="flex w-full items-center justify-between gap-4 bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/50"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-zinc-400" />
                    )}
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {sector.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-600">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all dark:bg-teal-400"
                          style={{ width: `${sector.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
                        {sector.percentage}%
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                      {sector.responded}/{sector.total}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-zinc-100 bg-white dark:divide-zinc-700/50 dark:bg-zinc-900/50">
                    {sector.organizations.map(org => (
                      <div
                        key={org.name}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <span
                          className={`text-sm ${
                            org.responded
                              ? 'text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          {org.name}
                        </span>
                        {org.responded ? (
                          <CheckCircleIcon className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Alle svar per organisasjon
          </h3>
          <div className="flex gap-1 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
            {(
              [
                { key: 'all', label: 'Alle' },
                { key: 'members', label: 'Medlemmer' },
                {
                  key: 'non-members',
                  label: `Ikke-medlemmer (${nonMemberCount})`,
                },
                {
                  key: 'missing',
                  label: `Mangler svar (${missingMembers.length})`,
                },
              ] as const
            ).map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === opt.key
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {filter === 'missing' ? (
          <MissingMembersTable members={missingMembers} />
        ) : (
          <OrgTable orgBreakdown={filteredOrgBreakdown} />
        )}
      </section>
    </div>
  )
}

function OrgTable({ orgBreakdown }: { orgBreakdown: OrgData['orgBreakdown'] }) {
  if (orgBreakdown.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">Ingen svar ennå</p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Organisasjon
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Antall svar
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
          {orgBreakdown.map(row => (
            <tr key={row.organization}>
              <td className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100">
                <span className="inline-flex items-center gap-1.5">
                  {row.organization}
                  {!row.isMember && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Ikke medlem
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {row.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MissingMembersTable({
  members,
}: {
  members: { name: string; responded: boolean }[]
}) {
  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        Alle medlemmer har svart!
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Medlem
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
          {members.map(org => (
            <tr key={org.name}>
              <td className="px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500">
                {org.name}
              </td>
              <td className="px-4 py-2 text-right">
                <XCircleIcon className="ml-auto h-4 w-4 text-zinc-300 dark:text-zinc-600" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
