'use client'

import Image from 'next/image'
import { SimpleLayout } from '@/components/SimpleLayout'
import { members } from '@/data/members'
import { MemberType, Sector, type Member } from '@/lib/members'
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons'
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  ServerStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { getInitials, getBackgroundColor } from '@/lib/avatar-utils'
import { useEffect, useMemo, useRef, useState } from 'react'

const sections: { title: string; types: MemberType[] }[] = [
  {
    title: 'Direktorat og etater',
    types: [
      MemberType.DIRECTORATE,
      MemberType.AGENCY,
      MemberType.GOVERNMENT_AGENCY,
    ],
  },
  {
    title: 'Kommune og fylke',
    types: [
      MemberType.MUNICIPALITY,
      MemberType.COUNTY,
      MemberType.MUNICIPAL_COMPANY,
    ],
  },
  {
    title: 'Statlige selskap og foretak',
    types: [MemberType.STATE_ENTERPRISE, MemberType.STATE_COMPANY],
  },
  {
    title: 'Forskning og utdanning',
    types: [MemberType.UNIVERSITY, MemberType.RESEARCH_INSTITUTE],
  },
  {
    title: 'Offentlige virksomheter',
    types: [MemberType.PUBLIC_CORPORATION, MemberType.OTHER],
  },
]

function MemberPopover({
  member,
  onClose,
}: {
  member: Member
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const logo = member.image()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-1/2 z-20 w-72 -translate-x-1/2 rounded-xl bg-white shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
      style={{ bottom: '100%', marginBottom: '8px' }}
    >
      {/* Arrow */}
      <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700" />

      <div className="relative rounded-xl bg-white p-4 dark:bg-gray-800">
        <button
          onClick={onClose}
          aria-label="Lukk"
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            style={{
              backgroundColor:
                member.logoBackgroundColor ?? (logo ? '#ffffff' : undefined),
            }}
          >
            {logo ? (
              <Image
                className="h-full w-full object-contain p-1.5"
                src={logo}
                width={56}
                height={56}
                alt={member.name}
                unoptimized
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center text-sm font-bold text-white ${getBackgroundColor(member.name)}`}
              >
                {getInitials(member.name)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {member.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {member.type}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {member.platform && (
            <a
              href={member.platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50"
            >
              <ServerStackIcon className="h-3 w-3" />
              {member.platform.name}
            </a>
          )}
          {member.homepage && (
            <a
              href={member.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Nettside"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          )}
          {member.github && (
            <a
              href={`https://github.com/${member.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="GitHub"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
          )}
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title="LinkedIn"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function MemberCard({
  member,
  isOpen,
  onToggle,
}: {
  member: Member
  isOpen: boolean
  onToggle: () => void
}) {
  const logo = member.image()

  return (
    <li className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-gray-400 dark:ring-gray-700 dark:hover:ring-gray-500"
        style={{
          backgroundColor:
            member.logoBackgroundColor ?? (logo ? '#ffffff' : undefined),
        }}
      >
        {logo ? (
          <Image
            className="h-full w-full object-contain p-2"
            src={logo}
            width={80}
            height={80}
            alt={member.name}
            unoptimized
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-lg font-bold text-white ${getBackgroundColor(member.name)}`}
          >
            {getInitials(member.name)}
          </div>
        )}
      </button>
      <span className="mt-1.5 w-20 truncate text-center text-xs text-gray-600 dark:text-gray-400">
        {member.name}
      </span>
      {member.platform && (
        <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">
          <ServerStackIcon className="h-2.5 w-2.5" />
          {member.platform.name}
        </span>
      )}
      {isOpen && <MemberPopover member={member} onClose={onToggle} />}
    </li>
  )
}

const allSectors = Object.values(Sector)

function SectorPill({
  sector,
  isActive,
  count,
  onToggle,
}: {
  sector: Sector
  isActive: boolean
  count: number
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        isActive
          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
      }`}
    >
      {sector}
      <span
        className={`text-[10px] ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`}
      >
        {count}
      </span>
    </button>
  )
}

export default function MedlemmerPage() {
  const [openMember, setOpenMember] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedSectors, setSelectedSectors] = useState<Set<Sector>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)

  const sectorCounts = useMemo(() => {
    const counts = new Map<Sector, number>()
    for (const sector of allSectors) {
      counts.set(sector, members.filter(m => m.sectors.includes(sector)).length)
    }
    return counts
  }, [])

  const filteredMembers = useMemo(() => {
    let result = members

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(m => m.name.toLowerCase().includes(q))
    }

    if (selectedSectors.size > 0) {
      result = result.filter(m => m.sectors.some(s => selectedSectors.has(s)))
    }

    return result
  }, [search, selectedSectors])

  const isFiltered = search !== '' || selectedSectors.size > 0

  const toggleSector = (sector: Sector) => {
    setSelectedSectors(prev => {
      const next = new Set(prev)
      if (next.has(sector)) next.delete(sector)
      else next.add(sector)
      return next
    })
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedSectors(new Set())
    searchRef.current?.focus()
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <SimpleLayout
      title="Medlemmer av Offentlig PaaS"
      intro="Offentlig PaaS er for alle offentlige virksomheter i stat og kommune, eller private virksomheter hvor offentligheten eier 50%, med interesse for plattformteknologi og kunnskapsdeling. Dette er en grasrotbevegelse for de som jobber med plattformer og det er ingen kostnad eller forpliktelser ved å være medlem."
      gitHubPage="src/data/members.ts"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Søk etter medlemmer…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-8 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-teal-500 dark:focus:ring-teal-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  searchRef.current?.focus()
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Tøm søk"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {allSectors.map(sector => (
              <SectorPill
                key={sector}
                sector={sector}
                isActive={selectedSectors.has(sector)}
                count={sectorCounts.get(sector) ?? 0}
                onToggle={() => toggleSector(sector)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {isFiltered
              ? `${filteredMembers.length} av ${members.length} medlemmer`
              : `${members.length} medlemmer`}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Nullstill
            </button>
          )}
        </div>

        {sections.map(section => {
          const sectionMembers = filteredMembers
            .filter(m => section.types.includes(m.type))
            .sort((a, b) => a.name.localeCompare(b.name, 'nb-NO'))
          if (sectionMembers.length === 0) return null
          return (
            <section key={section.title}>
              <div className="mb-4 flex items-baseline gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {section.title}
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {sectionMembers.length}
                </span>
              </div>
              <ul
                role="list"
                className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
              >
                {sectionMembers.map(member => (
                  <MemberCard
                    key={member.name}
                    member={member}
                    isOpen={openMember === member.name}
                    onToggle={() =>
                      setOpenMember(prev =>
                        prev === member.name ? null : member.name
                      )
                    }
                  />
                ))}
              </ul>
            </section>
          )
        })}

        {isFiltered && filteredMembers.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Ingen medlemmer matcher søket.{' '}
            <button
              type="button"
              onClick={clearFilters}
              className="text-teal-600 hover:underline dark:text-teal-400"
            >
              Nullstill filtre
            </button>
          </p>
        )}
      </div>
    </SimpleLayout>
  )
}
