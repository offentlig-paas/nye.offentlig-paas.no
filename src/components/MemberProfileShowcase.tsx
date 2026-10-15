'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloudIcon,
  CodeBracketIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MapPinIcon,
  MicrophoneIcon,
  PencilSquareIcon,
  ServerStackIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { GitHubIcon, LinkedInIcon, SlackIcon } from '@/components/SocialIcons'
import { Avatar } from '@/components/Avatar'
import { MemberProfileEditorModal } from '@/components/MemberProfileEditorModal'
import { getInitials, getBackgroundColor } from '@/lib/avatar-utils'
import { formatDate } from '@/lib/formatDate'
import { extractSlackUserId } from '@/lib/slack/utils'
import { trpc } from '@/lib/trpc/client'
import {
  CAPABILITY_CATEGORY_LABELS,
  type CapabilityCategory,
  type CncfMaturityTier,
  type CncfProjectCategory,
  type MemberProfile,
  type MemberTalkContribution,
  type ProfileAccentColor,
  type ProfileSectionId,
} from '@/domains/member-profile/types'
import type { MemberType, Sector } from '@/lib/members'

export interface SerializedMember {
  name: string
  slug: string
  type: MemberType
  sectors: Sector[]
  domains: string[]
  logo: string
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string
  platform?: {
    name: string
    description: string
    href: string
    label: string
    logo?: string
  }
}

interface MemberProfileShowcaseProps {
  member: SerializedMember
  profile?: MemberProfile
  isInternalRestricted?: boolean
  autoOpenEditor?: boolean
  talks: MemberTalkContribution[]
  organizedEventsCount: number
  uniqueSpeakers: { name: string; url?: string }[]
}

const ACCENT_STYLES: Record<
  ProfileAccentColor,
  {
    badge: string
    border: string
    button: string
    pillActive: string
    iconText: string
    heroGradient: string
    statHighlight: string
    dot: string
  }
> = {
  teal: {
    badge:
      'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-400/30',
    border: 'border-teal-500/30 dark:border-teal-400/30',
    button:
      'bg-teal-600 text-white hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400',
    pillActive: 'bg-teal-600 text-white dark:bg-teal-500 dark:text-zinc-950',
    iconText: 'text-teal-600 dark:text-teal-400',
    heroGradient:
      'from-teal-500/8 via-transparent to-transparent dark:from-teal-500/12',
    statHighlight: 'text-teal-600 dark:text-teal-400',
    dot: 'bg-teal-500',
  },
  rose: {
    badge:
      'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-400/30',
    border: 'border-rose-500/30 dark:border-rose-400/30',
    button:
      'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400',
    pillActive: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white',
    iconText: 'text-rose-600 dark:text-rose-400',
    heroGradient:
      'from-rose-500/8 via-transparent to-transparent dark:from-rose-500/12',
    statHighlight: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  emerald: {
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-400/30',
    border: 'border-emerald-500/30 dark:border-emerald-400/30',
    button:
      'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400',
    pillActive:
      'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    heroGradient:
      'from-emerald-500/8 via-transparent to-transparent dark:from-emerald-500/12',
    statHighlight: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  blue: {
    badge:
      'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/30',
    border: 'border-blue-500/30 dark:border-blue-400/30',
    button:
      'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400',
    pillActive: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
    iconText: 'text-blue-600 dark:text-blue-400',
    heroGradient:
      'from-blue-500/8 via-transparent to-transparent dark:from-blue-500/12',
    statHighlight: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  indigo: {
    badge:
      'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-400/30',
    border: 'border-indigo-500/30 dark:border-indigo-400/30',
    button:
      'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400',
    pillActive: 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    heroGradient:
      'from-indigo-500/8 via-transparent to-transparent dark:from-indigo-500/12',
    statHighlight: 'text-indigo-600 dark:text-indigo-400',
    dot: 'bg-indigo-500',
  },
  amber: {
    badge:
      'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-400/30',
    border: 'border-amber-500/30 dark:border-amber-400/30',
    button:
      'bg-amber-600 text-white hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400',
    pillActive: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-zinc-950',
    iconText: 'text-amber-600 dark:text-amber-400',
    heroGradient:
      'from-amber-500/8 via-transparent to-transparent dark:from-amber-500/12',
    statHighlight: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
}

const CNCF_TIER_BADGES: Record<CncfMaturityTier, string> = {
  Graduated:
    'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-400/30',
  Incubating:
    'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-950/60 dark:text-purple-300 dark:ring-purple-400/30',
  Sandbox:
    'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-400/30',
}

const CNCF_CATEGORY_LABELS: Record<
  CncfProjectCategory,
  { no: string; en: string }
> = {
  'Orchestration & GitOps': {
    no: 'Orkestrering og GitOps',
    en: 'Orchestration & GitOps',
  },
  'Networking & Service Mesh': {
    no: 'Nettverk og Service Mesh',
    en: 'Networking & Service Mesh',
  },
  Observability: {
    no: 'Observability og telemetri',
    en: 'Observability & Telemetry',
  },
  'Security & Policy': {
    no: 'Sikkerhet, identitet og policy',
    en: 'Security, Identity & Policy',
  },
  'Platform & App Definition': {
    no: 'Utviklerportal og applikasjonsdefinisjon',
    en: 'Developer Portal & App Definition',
  },
  'Storage & Data': {
    no: 'Lagring og datastrømmer',
    en: 'Storage & Data',
  },
}

const MAIN_COLUMN_SECTIONS = new Set<ProfileSectionId>([
  'capabilities',
  'cncf',
  'talks',
])

const DEFAULT_SECTION_ORDER: ProfileSectionId[] = [
  'capabilities',
  'cncf',
  'talks',
  'team',
  'architecture',
  'jobs',
]

export function MemberProfileShowcase({
  member,
  profile: initialProfile,
  isInternalRestricted = false,
  autoOpenEditor = false,
  talks,
  organizedEventsCount,
  uniqueSpeakers,
}: MemberProfileShowcaseProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<MemberProfile | undefined>(
    initialProfile
  )
  const [prevAutoOpen, setPrevAutoOpen] = useState(Boolean(autoOpenEditor))
  const [editorOpen, setEditorOpen] = useState(Boolean(autoOpenEditor))
  if (Boolean(autoOpenEditor) !== prevAutoOpen) {
    setPrevAutoOpen(Boolean(autoOpenEditor))
    if (autoOpenEditor) {
      setEditorOpen(true)
    }
  }

  const handleCloseEditor = () => {
    setEditorOpen(false)
    if (autoOpenEditor) {
      router.replace(`/medlemmer/${member.slug}`, { scroll: false })
    }
  }

  const [lang, setLang] = useState<'no' | 'en'>('no')
  const [manifestExpanded, setManifestExpanded] = useState(false)
  const [showAllTalks, setShowAllTalks] = useState(false)

  const accentColor = profile?.theme.accentColor ?? 'teal'
  const heroStyle = profile?.theme.heroStyle ?? 'gradient'
  const sectionOrder = profile?.theme.sectionOrder ?? DEFAULT_SECTION_ORDER

  const { data: permissions } = trpc.memberProfile.getPermissions.useQuery({
    slug: member.slug,
  })
  const canEdit = Boolean(permissions?.canEdit)

  const platformInfo = profile?.platformName
    ? {
        name: profile.platformName,
        description: profile.platformDescription,
        href: profile.platformHref,
        label: profile.platformLabel,
        logo: profile.platformLogo,
      }
    : member.platform

  const [selectedCapabilityCategory, setSelectedCapabilityCategory] = useState<
    CapabilityCategory | 'all'
  >('all')
  const [selectedCncfTier, setSelectedCncfTier] = useState<
    CncfMaturityTier | 'all'
  >('all')

  const accent = ACCENT_STYLES[accentColor]

  const availableCapabilityCategories = useMemo(() => {
    if (!profile) return []
    const set = new Set<CapabilityCategory>()
    for (const cap of profile.capabilities) {
      set.add(cap.category)
    }
    return Array.from(set)
  }, [profile])

  const filteredCapabilities = useMemo(() => {
    if (!profile) return []
    if (selectedCapabilityCategory === 'all') return profile.capabilities
    return profile.capabilities.filter(
      c => c.category === selectedCapabilityCategory
    )
  }, [profile, selectedCapabilityCategory])

  const filteredCncfProjects = useMemo(() => {
    if (!profile) return []
    if (selectedCncfTier === 'all') return profile.cncfProjects
    return profile.cncfProjects.filter(p => p.tier === selectedCncfTier)
  }, [profile, selectedCncfTier])

  const groupedCncfProjects = useMemo(() => {
    const groups = new Map<CncfProjectCategory, typeof filteredCncfProjects>()
    for (const project of filteredCncfProjects) {
      const existing = groups.get(project.category) ?? []
      existing.push(project)
      groups.set(project.category, existing)
    }
    return Array.from(groups.entries())
  }, [filteredCncfProjects])

  const cncfCounts = useMemo(() => {
    if (!profile) return { Graduated: 0, Incubating: 0, Sandbox: 0 }
    return {
      Graduated: profile.cncfProjects.filter(p => p.tier === 'Graduated')
        .length,
      Incubating: profile.cncfProjects.filter(p => p.tier === 'Incubating')
        .length,
      Sandbox: profile.cncfProjects.filter(p => p.tier === 'Sandbox').length,
    }
  }, [profile])

  const combinedPeople = useMemo(() => {
    const people: {
      name: string
      role: string
      slackUrl?: string
      github?: string
    }[] = []
    const seenKeys = new Set<string>()

    const getPersonKey = (name: string, slackUrl?: string) => {
      const slackId = slackUrl ? extractSlackUserId(slackUrl) : null
      return slackId ?? name.toLowerCase().trim()
    }

    if (profile?.team) {
      for (const person of profile.team) {
        const key = getPersonKey(person.name, person.slackUrl)
        seenKeys.add(key)
        seenKeys.add(person.name.toLowerCase().trim())
        people.push({
          name: person.name,
          role: lang === 'en' && person.roleEn ? person.roleEn : person.role,
          slackUrl: person.slackUrl,
          github: person.github,
        })
      }
    }

    for (const speaker of uniqueSpeakers) {
      const key = getPersonKey(speaker.name, speaker.url)
      if (
        !seenKeys.has(key) &&
        !seenKeys.has(speaker.name.toLowerCase().trim())
      ) {
        seenKeys.add(key)
        seenKeys.add(speaker.name.toLowerCase().trim())
        people.push({
          name: speaker.name,
          role:
            lang === 'en'
              ? 'Fagdag Speaker / Contributor'
              : 'Foredragsholder på fagdag',
          slackUrl: speaker.url,
        })
      }
    }

    return people
  }, [profile, uniqueSpeakers, lang])

  const renderCapabilitiesSection = () => {
    if (!profile || profile.capabilities.length === 0) return null

    return (
      <section key="capabilities" className="scroll-mt-24">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <SparklesIcon className={`h-5 w-5 ${accent.iconText}`} />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {lang === 'en'
                ? 'Platform Capabilities & Golden Paths'
                : 'Plattformkapabiliteter og Golden Paths'}
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {lang === 'en'
              ? `Self-service capabilities provided out of the box by ${platformInfo?.name ?? member.name}.`
              : `Ferdige kapabiliteter og selvbetjente tjenester som ${platformInfo?.name ?? member.name} tilbyr produktteamene.`}
          </p>

          {availableCapabilityCategories.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCapabilityCategory('all')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedCapabilityCategory === 'all'
                    ? accent.pillActive
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {lang === 'en' ? 'All' : 'Alle'} ({profile.capabilities.length})
              </button>
              {availableCapabilityCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCapabilityCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedCapabilityCategory === cat
                      ? accent.pillActive
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {CAPABILITY_CATEGORY_LABELS[cat][lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredCapabilities.map(cap => {
            const highlights =
              lang === 'en' && cap.highlightsEn && cap.highlightsEn.length > 0
                ? cap.highlightsEn
                : cap.highlights

            return (
              <div
                key={cap.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-5 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${accent.badge}`}
                    >
                      {CAPABILITY_CATEGORY_LABELS[cap.category][lang]}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      {cap.maturity === 'beta' && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-400/30">
                          Beta
                        </span>
                      )}
                      {cap.selfService && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap text-emerald-700 dark:text-emerald-400">
                          <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                          {lang === 'en' ? 'Self-service' : 'Selvbetjent'}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {lang === 'en' && cap.titleEn ? cap.titleEn : cap.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {lang === 'en' && cap.descriptionEn
                      ? cap.descriptionEn
                      : cap.description}
                  </p>
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                  {highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {profile.manifestExample && (
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <CodeBracketIcon className="h-4 w-4 text-teal-400" />
                <span className="font-mono text-xs font-semibold text-zinc-100">
                  {profile.manifestExample.filename}
                </span>
                <span className="hidden text-xs text-zinc-400 sm:inline">
                  ·{' '}
                  {lang === 'en' && profile.manifestExample.titleEn
                    ? profile.manifestExample.titleEn
                    : profile.manifestExample.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setManifestExpanded(prev => !prev)}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700"
              >
                {manifestExpanded ? (
                  <>
                    {lang === 'en' ? 'Collapse' : 'Vis mindre'}
                    <ChevronUpIcon className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    {lang === 'en'
                      ? 'Expand full manifest'
                      : 'Vis hele kontrakten'}
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
            <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-2.5">
              <p className="text-xs leading-relaxed text-zinc-300">
                {lang === 'en' && profile.manifestExample.descriptionEn
                  ? profile.manifestExample.descriptionEn
                  : profile.manifestExample.description}
              </p>
            </div>
            <div
              className={`relative overflow-x-auto px-4 py-3.5 font-mono text-xs leading-relaxed text-teal-300 transition-all ${
                manifestExpanded ? 'max-h-none' : 'max-h-56 overflow-y-hidden'
              }`}
            >
              <pre>{profile.manifestExample.code}</pre>
              {!manifestExpanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />
              )}
            </div>
          </div>
        )}
      </section>
    )
  }

  const renderCncfSection = () => {
    if (!profile || profile.cncfProjects.length === 0) return null

    return (
      <section key="cncf" className="scroll-mt-24">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CubeTransparentIcon className={`h-5 w-5 ${accent.iconText}`} />
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {lang === 'en'
                  ? 'Cloud Native (CNCF) Stack'
                  : 'CNCF-prosjekter i produksjon'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCncfTier('all')}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  selectedCncfTier === 'all'
                    ? accent.pillActive
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {lang === 'en' ? 'All' : 'Alle'} ({profile.cncfProjects.length})
              </button>
              {(['Graduated', 'Incubating', 'Sandbox'] as const).map(tier =>
                cncfCounts[tier] > 0 ? (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedCncfTier(tier)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      selectedCncfTier === tier
                        ? accent.pillActive
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {tier} ({cncfCounts[tier]})
                  </button>
                ) : null
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {lang === 'en'
              ? 'Open-source Cloud Native Computing Foundation technologies powering the platform.'
              : 'Åpne prosjekter fra Cloud Native Computing Foundation som utgjør grunnmuren i plattformen.'}
          </p>
        </div>

        <div className="mt-5 space-y-6">
          {groupedCncfProjects.map(([category, projects]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                {CNCF_CATEGORY_LABELS[category][lang]}
              </h3>
              <div className="mt-2 divide-y divide-zinc-200/80 rounded-xl border border-zinc-200/90 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
                {projects.map(project => (
                  <div
                    key={project.name}
                    className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {project.name}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${CNCF_TIER_BADGES[project.tier]}`}
                        >
                          {project.tier}
                        </span>
                        {project.sinceYear && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            · {lang === 'en' ? 'Since' : 'Siden'}{' '}
                            {project.sinceYear}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {lang === 'en' && project.usageEn
                          ? project.usageEn
                          : project.usage}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 sm:pt-0.5">
                      {project.sourceRepoUrl && (
                        <a
                          href={project.sourceRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          <GitHubIcon className="h-3.5 w-3.5 fill-current" />
                          <span>{lang === 'en' ? 'Config' : 'Kildekode'}</span>
                        </a>
                      )}
                      <a
                        href={project.cncfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        <span>CNCF</span>
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const renderTalksSection = () => {
    if (talks.length === 0) return null
    const visibleTalks = showAllTalks ? talks : talks.slice(0, 5)

    return (
      <section key="talks" className="scroll-mt-24">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MicrophoneIcon className={`h-5 w-5 ${accent.iconText}`} />
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {lang === 'en'
                  ? 'Community Talks & Knowledge Sharing'
                  : 'Kunnskapsdeling og foredrag på fagdager'}
              </h2>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {talks.length} {lang === 'en' ? 'talks' : 'foredrag'}
              {organizedEventsCount > 0 &&
                ` · ${organizedEventsCount} ${
                  lang === 'en' ? 'events co-organized' : 'arrangementer'
                }`}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {lang === 'en'
              ? `Presentations, panels, and workshops shared by ${member.name} in the Offentlig PaaS community.`
              : `Erfaringer, arkitekturvalg og demoer delt av ${member.name} på Offentlig PaaS sine fagdager.`}
          </p>
        </div>

        <div className="relative mt-6 ml-2 border-l border-zinc-200 pl-6 dark:border-zinc-800">
          <div className="space-y-6">
            {visibleTalks.map((talk, idx) => (
              <div key={`${talk.eventSlug}-${idx}`} className="group relative">
                <span
                  className={`absolute top-1.5 -left-[29px] h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900 ${accent.dot}`}
                />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <time className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatDate(talk.eventDate)}
                  </time>
                  <span>·</span>
                  <Link
                    href={`/fagdag/${talk.eventSlug}`}
                    className="hover:underline"
                  >
                    {talk.eventTitle}
                  </Link>
                </div>

                <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  <Link
                    href={`/fagdag/${talk.eventSlug}`}
                    className="hover:text-teal-600 dark:hover:text-teal-400"
                  >
                    {talk.talkTitle}
                  </Link>
                </h3>

                {talk.talkDescription && (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {talk.talkDescription}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  {talk.speakers.map(speaker => (
                    <div
                      key={speaker.name}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      <Avatar
                        name={speaker.name}
                        slackUrl={speaker.url}
                        size="xs"
                      />
                      <span>{speaker.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {talks.length > 5 && (
          <div className="mt-6 pl-8">
            <button
              type="button"
              onClick={() => setShowAllTalks(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {showAllTalks ? (
                <>
                  {lang === 'en' ? 'Show fewer talks' : 'Vis færre foredrag'}
                  <ChevronUpIcon className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  {lang === 'en'
                    ? `Show all ${talks.length} talks`
                    : `Vis alle ${talks.length} foredrag`}
                  <ChevronDownIcon className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </section>
    )
  }

  const renderTeamSection = () => {
    if (combinedPeople.length === 0) return null

    return (
      <section
        key="team"
        className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserGroupIcon className={`h-5 w-5 ${accent.iconText}`} />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {lang === 'en' ? 'People & Contributors' : 'Menneskene bak'}
            </h2>
          </div>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {combinedPeople.length}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {lang === 'en'
            ? 'Platform engineers and community speakers in Offentlig PaaS.'
            : 'Plattformutviklere, arkitekter og foredragsholdere i nettverket.'}
        </p>

        <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {combinedPeople.map(person => (
            <li
              key={person.name}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                {person.slackUrl ? (
                  <Avatar
                    name={person.name}
                    slackUrl={person.slackUrl}
                    size="sm"
                    className="shrink-0"
                  />
                ) : (
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getBackgroundColor(
                      person.name
                    )}`}
                  >
                    {getInitials(person.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {person.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {person.role}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {person.slackUrl && (
                  <a
                    href={person.slackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Slack"
                    className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <SlackIcon className="h-4 w-4" />
                  </a>
                )}
                {person.github && (
                  <a
                    href={`https://github.com/${person.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                    className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <GitHubIcon className="h-4 w-4 fill-current" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const renderArchitectureSection = () => {
    if (
      !profile ||
      (profile.techStack.length === 0 && profile.links.length === 0)
    ) {
      return null
    }

    return (
      <section
        key="architecture"
        className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="flex items-center gap-2">
          <ServerStackIcon className={`h-5 w-5 ${accent.iconText}`} />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {lang === 'en'
              ? 'Technology & Resources'
              : 'Teknologistabel og ressurser'}
          </h2>
        </div>

        {profile.techStack.length > 0 && (
          <div className="mt-4 space-y-4">
            {profile.techStack.map(group => (
              <div key={group.category}>
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {lang === 'en' && group.categoryEn
                    ? group.categoryEn
                    : group.category}
                </h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.items.map(item => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {profile.links.length > 0 && (
          <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              {lang === 'en' ? 'Direct Links' : 'Relevante lenker'}
            </h3>
            <div className="mt-2.5 space-y-2">
              {profile.links.map(link => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -mx-2 flex items-start justify-between gap-2 rounded-lg p-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 group-hover:text-teal-600 dark:text-zinc-100 dark:group-hover:text-teal-400">
                      {link.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {link.description}
                    </p>
                  </div>
                  <ArrowTopRightOnSquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    )
  }

  const renderJobsSection = () => {
    if (!profile || profile.openPositions.length === 0) return null

    return (
      <section
        key="jobs"
        className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className={`h-5 w-5 ${accent.iconText}`} />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {lang === 'en' ? 'Work With Us' : 'Ledige stillinger'}
            </h2>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${accent.badge}`}
          >
            {profile.openPositions.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {profile.openPositions.map(job => (
            <a
              key={job.title}
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-teal-600 dark:text-zinc-100 dark:group-hover:text-teal-400">
                  {job.title}
                </h3>
                <ArrowTopRightOnSquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {job.department}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                {job.deadline && <span>· {job.deadline}</span>}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {job.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>
    )
  }

  const mainSections = sectionOrder.filter(id => MAIN_COLUMN_SECTIONS.has(id))
  const sidebarSections = sectionOrder.filter(
    id => !MAIN_COLUMN_SECTIONS.has(id)
  )

  return (
    <div className="space-y-8 pb-12">
      {/* Compact top navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <Link
          href="/medlemmer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{lang === 'en' ? 'All members' : 'Alle medlemmer'}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language toggle */}
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setLang('no')}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                lang === 'no'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              NO
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                lang === 'en'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              EN
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              <span>
                {profile
                  ? lang === 'en'
                    ? 'Edit Platform Profile'
                    : 'Rediger plattformprofil'
                  : lang === 'en'
                    ? 'Create Platform Profile'
                    : 'Opprett plattformprofil'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Editorial Hero Header (No Box-Inside-Box) */}
      <header
        className={`relative rounded-2xl px-1 pt-2 pb-2 ${
          heroStyle === 'gradient'
            ? `bg-gradient-to-br ${accent.heroGradient}`
            : ''
        }`}
      >
        {heroStyle === 'grid' && (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
        )}

        <div className="relative">
          {/* Identity Row */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-200/80 p-3 shadow-xs dark:border-zinc-800"
              style={{
                backgroundColor: member.logoBackgroundColor || '#ffffff',
              }}
            >
              <Image
                src={member.logo}
                alt={member.name}
                width={64}
                height={64}
                className="max-h-14 w-auto object-contain"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {member.type}
                </span>
                {profile?.visibility === 'internal' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-400/30">
                    <LockClosedIcon className="h-3.5 w-3.5" />
                    {lang === 'en'
                      ? 'Members only'
                      : 'Kun for innloggede medlemmer'}
                  </span>
                )}
                {profile?.platformAccess === 'internal' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-300/60 ring-inset dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                    <LockClosedIcon className="h-3.5 w-3.5" />
                    {lang === 'en' ? 'Internal platform' : 'Intern plattform'}
                  </span>
                )}
                {profile?.cncfEndUserMember && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-400/30">
                    <CheckBadgeIcon className="h-3.5 w-3.5" />
                    CNCF End User Member
                  </span>
                )}
                {profile?.openSourceFirst && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-400/30">
                    100 % Open Source
                  </span>
                )}
                {profile?.verifiedUpdated && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    · {lang === 'en' ? 'Updated' : 'Oppdatert'}{' '}
                    {profile.verifiedUpdated}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
                  {member.name}
                </h1>
                {platformInfo && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-semibold ring-1 ring-inset ${accent.badge}`}
                  >
                    <span>
                      {lang === 'en' ? 'Platform:' : 'Plattform:'}{' '}
                      {platformInfo.name}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Full-width Editorial Description */}
          <div className="mt-6 max-w-3xl space-y-3">
            <p className="text-lg leading-snug font-medium text-zinc-900 sm:text-xl dark:text-zinc-100">
              {profile
                ? lang === 'en' && profile.taglineEn
                  ? profile.taglineEn
                  : profile.tagline
                : (platformInfo?.description ??
                  `${member.name} er medlem av Offentlig PaaS.`)}
            </p>
            {profile && (
              <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {lang === 'en' && profile.aboutEn
                  ? profile.aboutEn
                  : profile.about}
              </p>
            )}
          </div>

          {/* Action Bar & Cloud Footprint */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {platformInfo?.href && profile?.platformAccess !== 'internal' && (
                <a
                  href={platformInfo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition ${accent.button}`}
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>
                    {platformInfo.label ||
                      (lang === 'en' ? 'Platform Docs' : 'Dokumentasjon')}
                  </span>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-80" />
                </a>
              )}
              {member.github && (
                <a
                  href={`https://github.com/${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <GitHubIcon className="h-4 w-4 fill-current" />
                  <span>GitHub</span>
                </a>
              )}
              {member.homepage && (
                <a
                  href={member.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Website' : 'Nettside'}</span>
                </a>
              )}
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <LinkedInIcon className="h-4 w-4 fill-current" />
                </a>
              )}
            </div>

            {profile && profile.cloudProviders.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <CloudIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                {profile.cloudProviders.map((provider, idx) => (
                  <span key={provider} className="inline-flex items-center">
                    {idx > 0 && <span className="mr-2">·</span>}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {provider}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Clean Border-Divided Key Figures Strip */}
          {profile && profile.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-zinc-200 py-5 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-zinc-200 dark:border-zinc-800 dark:sm:divide-zinc-800">
              {profile.stats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`${
                    idx === 0
                      ? 'sm:pr-6'
                      : idx === 1
                        ? 'sm:px-6'
                        : idx === 2
                          ? 'border-t border-zinc-200 pt-4 sm:border-t-0 sm:px-6 sm:pt-0 dark:border-zinc-800'
                          : 'border-t border-zinc-200 pt-4 sm:border-t-0 sm:pt-0 sm:pl-6 dark:border-zinc-800'
                  }`}
                >
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {lang === 'en' && stat.labelEn ? stat.labelEn : stat.label}
                  </dt>
                  <dd
                    className={`mt-1 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${accent.statHighlight}`}
                  >
                    {stat.value}
                  </dd>
                  {stat.detail && (
                    <dd className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {stat.detail}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {/* Notice for internal member-only profiles or members without a profile yet */}
      {!profile && isInternalRestricted ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/60 p-6 dark:border-amber-500/20 dark:bg-amber-950/20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <LockClosedIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Plattformprofilen for {member.name} er kun synlig for
                  innloggede medlemmer
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {member.name} har valgt å dele sin plattformprofil internt i
                  Offentlig PaaS-nettverket. Logg inn med Slack for å se
                  kapabiliteter, teknologistabel og team.
                </p>
              </div>
            </div>

            <Link
              href={`/auth/signin?callbackUrl=/medlemmer/${member.slug}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500"
            >
              <SlackIcon className="h-4 w-4" />
              <span>Logg inn med Slack</span>
            </Link>
          </div>
        </div>
      ) : (
        !profile && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 p-6 dark:border-zinc-700 dark:bg-zinc-800/30">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {member.name} har ikke publisert en utvidet plattformprofil
                  ennå
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Her vises organisasjonens bidrag på fagdager og offentlige
                  lenker. Utforsk delte plattformprofiler i nettverket på{' '}
                  <Link
                    href="/plattformer"
                    className="font-semibold text-teal-600 underline dark:text-teal-400"
                  >
                    plattformoversikten
                  </Link>
                  .
                </p>
                {member.domains.length > 0 && !canEdit && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <LockClosedIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Jobber du i {member.name}? Logg inn med Slack (
                      {member.domains.map(d => `@${d}`).join(', ')}) for å
                      opprette og administrere plattformprofilen.
                    </span>
                  </p>
                )}
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditorOpen(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  <span>Opprett plattformprofil</span>
                </button>
              )}
            </div>
          </div>
        )
      )}

      {/* Asymmetric 2-Column Profile Body */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* Main Technical & Community Column */}
        <div className="space-y-12 lg:col-span-8">
          {mainSections.map(sectionId => {
            switch (sectionId) {
              case 'capabilities':
                return renderCapabilitiesSection()
              case 'cncf':
                return renderCncfSection()
              case 'talks':
                return renderTalksSection()
              default:
                return null
            }
          })}
        </div>

        {/* Sticky / Contextual Organization Sidebar */}
        <aside className="space-y-6 lg:col-span-4">
          {sidebarSections.map(sectionId => {
            switch (sectionId) {
              case 'team':
                return renderTeamSection()
              case 'architecture':
                return renderArchitectureSection()
              case 'jobs':
                return renderJobsSection()
              default:
                return null
            }
          })}
        </aside>
      </div>

      {canEdit && editorOpen && (
        <MemberProfileEditorModal
          isOpen={editorOpen}
          onClose={handleCloseEditor}
          memberName={member.name}
          memberSlug={member.slug}
          memberDomains={member.domains}
          userEmailDomain={permissions?.emailDomain}
          isAdmin={permissions?.isAdmin}
          accessReason={permissions?.reason}
          currentUser={permissions?.currentUser ?? undefined}
          uniqueSpeakers={uniqueSpeakers}
          initialProfile={profile}
          onSaved={updated => {
            setProfile(updated)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
