'use client'

import Image from 'next/image'
import { SimpleLayout } from '@/components/SimpleLayout'
import { members } from '@/data/members'
import { MemberType, type Member } from '@/lib/members'
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons'
import {
  ArrowTopRightOnSquareIcon,
  ServerStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { getInitials, getBackgroundColor } from '@/lib/avatar-utils'
import { useEffect, useRef, useState } from 'react'

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
                member.logoBackgroundColor ??
                (logo ? '#ffffff' : undefined),
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
            member.logoBackgroundColor ??
            (logo ? '#ffffff' : undefined),
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

export default function MedlemmerPage() {
  const [openMember, setOpenMember] = useState<string | null>(null)

  return (
    <SimpleLayout
      title="Medlemmer av Offentlig PaaS"
      intro="Offentlig PaaS er for alle offentlige virksomheter i stat og kommune, eller private virksomheter hvor offentligheten eier 50%, med interesse for plattformteknologi og kunnskapsdeling. Dette er en grasrotbevegelse for de som jobber med plattformer og det er ingen kostnad eller forpliktelser ved å være medlem."
      gitHubPage="src/data/members.ts"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {members.length} medlemmer
        </p>
        {sections.map(section => {
          const sectionMembers = members
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
      </div>
    </SimpleLayout>
  )
}
