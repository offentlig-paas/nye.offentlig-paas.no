'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UsersIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import type {
  SlackRepresentationSummary,
  MemberRepresentation,
  UnmatchedDomain,
} from '@/lib/members-slack'
import type { ExternalDomainLabel } from '@/data/external-domains'
import type { SlackUserSummary } from '@/lib/slack/users'
import { trpc } from '@/lib/trpc/client'

const labelStyles: Record<ExternalDomainLabel, string> = {
  Konsulent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Leverandør:
    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Offentlig sektor':
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Helse: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Personlig: 'bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
  Fellesskap:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
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

function CopyDomainsButton({
  domains,
  label,
}: {
  domains: string[]
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(domains.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may fail in non-secure contexts
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        label
          ? 'flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          : 'flex items-center gap-1 rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
      }
      title={label ?? 'Kopier alle domener'}
    >
      {copied ? (
        <>
          <CheckIcon className="h-3.5 w-3.5 text-teal-500" />
          {label ? 'Kopiert!' : 'Kopiert'}
        </>
      ) : (
        <>
          <ClipboardDocumentIcon className="h-3.5 w-3.5" />
          {label ?? 'Kopier'}
        </>
      )}
    </button>
  )
}

function UserList({ users }: { users: SlackUserSummary[] }) {
  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
      {users.map(user => (
        <li key={user.id} className="flex items-center gap-3 px-4 py-2">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full"
              unoptimized
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-500 dark:bg-zinc-600 dark:text-zinc-300">
              {user.realName.charAt(0)}
            </div>
          )}
          <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
            {user.realName}
          </span>
          {user.email && (
            <span className="hidden truncate text-xs text-zinc-400 sm:block">
              {user.email}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

function MemberRow({ member }: { member: MemberRepresentation }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isFetching } = trpc.admin.members.getMemberUsers.useQuery(
    { memberName: member.name },
    { enabled: isOpen }
  )

  return (
    <li className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={member.userCount === 0}
        className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-default disabled:opacity-60"
      >
        <ChevronRightIcon
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-90' : ''} ${member.userCount === 0 ? 'invisible' : ''}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {member.name}
            </span>
            <span className="shrink-0 text-xs text-zinc-400">
              {member.type}
            </span>
          </div>
          {member.domains.length > 0 && (
            <p className="truncate text-xs text-zinc-400">
              {member.domains.join(', ')}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            member.userCount > 0
              ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
              : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500'
          }`}
        >
          {member.userCount}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-700">
          {isFetching ? (
            <div className="flex items-center justify-center py-4">
              <ArrowPathIcon className="h-4 w-4 animate-spin text-zinc-400" />
            </div>
          ) : data?.member.users.length ? (
            <UserList users={data.member.users} />
          ) : (
            <p className="py-3 text-center text-xs text-zinc-400">
              Ingen brukere funnet
            </p>
          )}
        </div>
      )}
    </li>
  )
}

function UnmatchedDomainRow({ entry }: { entry: UnmatchedDomain }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isFetching } = trpc.admin.members.getDomainUsers.useQuery(
    { domain: entry.domain },
    { enabled: isOpen }
  )

  return (
    <li className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <ChevronRightIcon
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
          {entry.domain}
        </span>
        {entry.label && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${labelStyles[entry.label]}`}
          >
            {entry.label}
          </span>
        )}
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
          {entry.count}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-700">
          {isFetching ? (
            <div className="flex items-center justify-center py-4">
              <ArrowPathIcon className="h-4 w-4 animate-spin text-zinc-400" />
            </div>
          ) : data?.users.length ? (
            <UserList users={data.users} />
          ) : (
            <p className="py-3 text-center text-xs text-zinc-400">
              Ingen brukere funnet
            </p>
          )}
        </div>
      )}
    </li>
  )
}

export function AdminMembersClient({
  summary,
}: {
  summary: SlackRepresentationSummary
}) {
  const [search, setSearch] = useState('')
  const [showUnmatched, setShowUnmatched] = useState(false)
  const [showDormant, setShowDormant] = useState(false)

  if (summary.status === 'no_token') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-200">
              Slack ikke konfigurert
            </h3>
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              SLACK_BOT_TOKEN mangler. Konfigurer miljøvariabelen for å se
              Slack-representasjon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (summary.status === 'missing_email_scope') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-200">
              Mangler Slack-tilgang
            </h3>
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              Slack-appen mangler <code>users:read.email</code>-scope. Legg til
              denne i Slack app-konfigurasjonen for å se e-postdomener.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const filteredMembers = summary.members.filter(
    m =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.domains.some(d => d.includes(search.toLowerCase()))
  )

  const filteredUnmatched = summary.unmatchedDomains.filter(
    d => !search || d.domain.includes(search.toLowerCase())
  )

  const activeMembers = filteredMembers.filter(m => m.userCount > 0)
  const dormantMembers = filteredMembers.filter(m => m.userCount === 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Slack-brukere"
          value={summary.totalSlackUsers}
          icon={UsersIcon}
        />
        <StatCard
          label="Matchede brukere"
          value={summary.matchedUsers}
          icon={UserGroupIcon}
        />
        <StatCard
          label="Representerte org."
          value={`${summary.matchedOrgs} / ${summary.totalOrgs}`}
          icon={BuildingOfficeIcon}
        />
        <StatCard
          label="Ukjente domener"
          value={summary.unmatchedDomains.length}
          icon={GlobeAltIcon}
        />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Søk etter organisasjon eller domene..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-3 pl-9 text-sm text-zinc-900 placeholder-zinc-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <CopyDomainsButton
          domains={summary.members.flatMap(m => m.domains)}
          label="Kopier alle domener"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Aktive medlemmer
          <span className="ml-2 text-xs font-normal text-zinc-400">
            {activeMembers.length}
          </span>
        </h2>
        <ul className="space-y-2">
          {activeMembers.map(member => (
            <MemberRow key={member.name} member={member} />
          ))}
        </ul>
      </div>

      {dormantMembers.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDormant(!showDormant)}
              className="flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              <ChevronRightIcon
                className={`h-4 w-4 text-zinc-400 transition-transform ${showDormant ? 'rotate-90' : ''}`}
              />
              Sovende medlemmer
              <span className="ml-1 text-xs font-normal text-zinc-400">
                {dormantMembers.length}
              </span>
            </button>
            <CopyDomainsButton
              domains={dormantMembers.flatMap(m => m.domains)}
            />
          </div>
          {showDormant && (
            <ul className="space-y-2">
              {dormantMembers.map(member => (
                <li
                  key={member.name}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {member.name}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-400">
                        {member.type}
                      </span>
                    </div>
                    {member.domains.length > 0 && (
                      <p className="truncate text-xs text-zinc-400">
                        {member.domains.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500">
                    0
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {summary.unmatchedDomains.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUnmatched(!showUnmatched)}
              className="flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              <ChevronRightIcon
                className={`h-4 w-4 text-zinc-400 transition-transform ${showUnmatched ? 'rotate-90' : ''}`}
              />
              Uregistrerte domener
              <span className="ml-1 text-xs font-normal text-zinc-400">
                {filteredUnmatched.length}
              </span>
            </button>
            <CopyDomainsButton domains={filteredUnmatched.map(d => d.domain)} />
          </div>
          {showUnmatched && (
            <ul className="space-y-2">
              {filteredUnmatched.map(entry => (
                <UnmatchedDomainRow key={entry.domain} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
