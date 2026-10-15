'use client'

import { useState } from 'react'
import {
  ArrowsUpDownIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  CubeTransparentIcon,
  PlusIcon,
  ServerStackIcon,
  SparklesIcon,
  SwatchIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { trpc } from '@/lib/trpc/client'
import {
  CAPABILITY_CATEGORIES,
  CAPABILITY_CATEGORY_LABELS,
  CNCF_MATURITY_TIERS,
  CNCF_PROJECT_CATALOG,
  CNCF_PROJECT_CATEGORIES,
  PROFILE_ACCENT_COLORS,
  PROFILE_HERO_STYLES,
  PROFILE_LINK_TYPES,
  type CncfProjectUsage,
  type MemberProfile,
  type OpenPosition,
  type PlatformCapability,
  type ProfileAccentColor,
  type ProfileHeroStyle,
  type ProfileLink,
  type ProfileSectionId,
  type ProfileStat,
  type TeamMember,
  type TechStackGroup,
} from '@/domains/member-profile/types'

interface MemberProfileEditorModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  memberSlug: string
  memberDomains: string[]
  userEmailDomain?: string
  isAdmin?: boolean
  initialProfile?: MemberProfile
  onSaved: (updated: MemberProfile) => void
}

type EditorTab = 'general' | 'stats' | 'capabilities' | 'cncf' | 'more'

const SECTION_LABELS_NO: Record<ProfileSectionId, string> = {
  capabilities: 'Plattformkapabiliteter',
  cncf: 'CNCF-økosystem',
  talks: 'Foredrag på fagdager',
  team: 'Menneskene bak',
  architecture: 'Teknologi og lenker',
  jobs: 'Ledige stillinger',
}

const DEFAULT_SECTION_ORDER: ProfileSectionId[] = [
  'capabilities',
  'cncf',
  'talks',
  'team',
  'architecture',
  'jobs',
]

export function MemberProfileEditorModal({
  isOpen,
  onClose,
  memberName,
  memberSlug,
  memberDomains,
  userEmailDomain,
  isAdmin,
  initialProfile,
  onSaved,
}: MemberProfileEditorModalProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('general')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [platformName, setPlatformName] = useState(
    initialProfile?.platformName ?? ''
  )
  const [platformDescription, setPlatformDescription] = useState(
    initialProfile?.platformDescription ?? ''
  )
  const [platformHref, setPlatformHref] = useState(
    initialProfile?.platformHref ?? ''
  )
  const [platformLabel, setPlatformLabel] = useState(
    initialProfile?.platformLabel ?? ''
  )
  const [platformLogo, setPlatformLogo] = useState(
    initialProfile?.platformLogo ?? ''
  )

  const [accentColor, setAccentColor] = useState<ProfileAccentColor>(
    initialProfile?.theme.accentColor ?? 'teal'
  )
  const [heroStyle, setHeroStyle] = useState<ProfileHeroStyle>(
    initialProfile?.theme.heroStyle ?? 'gradient'
  )
  const [sectionOrder, setSectionOrder] = useState<ProfileSectionId[]>(
    initialProfile?.theme.sectionOrder ?? DEFAULT_SECTION_ORDER
  )

  const [tagline, setTagline] = useState(initialProfile?.tagline ?? '')
  const [taglineEn, setTaglineEn] = useState(initialProfile?.taglineEn ?? '')
  const [about, setAbout] = useState(initialProfile?.about ?? '')
  const [aboutEn, setAboutEn] = useState(initialProfile?.aboutEn ?? '')

  const [cncfEndUserMember, setCncfEndUserMember] = useState(
    initialProfile?.cncfEndUserMember ?? false
  )
  const [openSourceFirst, setOpenSourceFirst] = useState(
    initialProfile?.openSourceFirst ?? true
  )
  const [cloudProvidersText, setCloudProvidersText] = useState(
    (initialProfile?.cloudProviders ?? []).join(', ')
  )

  const [stats, setStats] = useState<ProfileStat[]>(
    initialProfile?.stats ?? [
      {
        label: 'Applikasjoner i produksjon',
        labelEn: 'Workloads in production',
        value: '',
        detail: '',
      },
    ]
  )

  const [hasManifest, setHasManifest] = useState(
    Boolean(initialProfile?.manifestExample)
  )
  const [manifestTitle, setManifestTitle] = useState(
    initialProfile?.manifestExample?.title ?? 'Deklarativ applikasjonskontrakt'
  )
  const manifestTitleEn =
    initialProfile?.manifestExample?.titleEn ??
    'Declarative Application Manifest'
  const [manifestFilename, setManifestFilename] = useState(
    initialProfile?.manifestExample?.filename ?? 'app.yaml'
  )
  const [manifestDescription, setManifestDescription] = useState(
    initialProfile?.manifestExample?.description ?? ''
  )
  const manifestDescriptionEn =
    initialProfile?.manifestExample?.descriptionEn ?? ''
  const [manifestCode, setManifestCode] = useState(
    initialProfile?.manifestExample?.code ?? ''
  )

  const [capabilities, setCapabilities] = useState<PlatformCapability[]>(
    initialProfile?.capabilities ?? []
  )
  const [cncfProjects, setCncfProjects] = useState<CncfProjectUsage[]>(
    initialProfile?.cncfProjects ?? []
  )
  const [techStack, setTechStack] = useState<TechStackGroup[]>(
    initialProfile?.techStack ?? []
  )
  const [team, setTeam] = useState<TeamMember[]>(initialProfile?.team ?? [])
  const [links, setLinks] = useState<ProfileLink[]>(initialProfile?.links ?? [])
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>(
    initialProfile?.openPositions ?? []
  )

  const utils = trpc.useUtils()
  const upsertMutation = trpc.memberProfile.upsert.useMutation({
    onSuccess: data => {
      utils.memberProfile.getBySlug.invalidate({ slug: memberSlug })
      utils.memberProfile.listPlatforms.invalidate()
      onSaved(data)
      onClose()
    },
    onError: err => {
      setErrorMsg(err.message)
    },
  })

  if (!isOpen) return null

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= sectionOrder.length) return
    const next = [...sectionOrder]
    const tmp = next[index]!
    next[index] = next[target]!
    next[target] = tmp
    setSectionOrder(next)
  }

  const addFromCatalog = (
    catalogItem: (typeof CNCF_PROJECT_CATALOG)[number]
  ) => {
    if (
      cncfProjects.some(
        p => p.name.toLowerCase() === catalogItem.name.toLowerCase()
      )
    ) {
      return
    }
    setCncfProjects(prev => [
      ...prev,
      {
        name: catalogItem.name,
        tier: catalogItem.tier,
        category: catalogItem.category,
        cncfUrl: catalogItem.cncfUrl,
        usage: `Brukes i ${platformName || memberName}.`,
        usageEn: `Used in ${platformName || memberName}.`,
      },
    ])
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (
      !platformName.trim() ||
      !platformDescription.trim() ||
      !platformHref.trim()
    ) {
      setErrorMsg(
        'Fyll ut plattformnavn, kort beskrivelse og dokumentasjons-URL under Grunninfo.'
      )
      setActiveTab('general')
      return
    }

    const validStats = stats.filter(s => s.label.trim() && s.value.trim())
    const validCapabilities = capabilities.filter(
      c => c.title.trim() && c.description.trim()
    )
    const validCncf = cncfProjects.filter(
      p => p.name.trim() && p.usage.trim() && p.cncfUrl.trim()
    )
    const validTechStack = techStack.filter(
      g => g.category.trim() && g.items.length > 0
    )
    const validTeam = team.filter(m => m.name.trim() && m.role.trim())
    const validLinks = links.filter(l => l.title.trim() && l.url.trim())
    const validJobs = openPositions.filter(
      j => j.title.trim() && j.department.trim() && j.url.trim()
    )

    upsertMutation.mutate({
      slug: memberSlug,
      platformName: platformName.trim(),
      platformDescription: platformDescription.trim(),
      platformHref: platformHref.trim(),
      platformLabel:
        platformLabel.trim() ||
        platformHref
          .trim()
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, ''),
      platformLogo: platformLogo.trim() || undefined,
      theme: {
        accentColor,
        heroStyle,
        sectionOrder,
      },
      tagline: tagline.trim() || platformDescription.trim(),
      taglineEn:
        taglineEn.trim() || tagline.trim() || platformDescription.trim(),
      about: about.trim(),
      aboutEn: aboutEn.trim() || about.trim(),
      cncfEndUserMember,
      openSourceFirst,
      cloudProviders: cloudProvidersText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      stats: validStats.map(s => ({
        label: s.label.trim(),
        labelEn: s.labelEn.trim() || s.label.trim(),
        value: s.value.trim(),
        detail: s.detail?.trim() || undefined,
      })),
      manifestExample:
        hasManifest && manifestCode.trim() && manifestFilename.trim()
          ? {
              title: manifestTitle.trim() || 'Deklarativ applikasjonskontrakt',
              titleEn:
                manifestTitleEn.trim() ||
                manifestTitle.trim() ||
                'Declarative Application Manifest',
              filename: manifestFilename.trim(),
              description: manifestDescription.trim(),
              descriptionEn:
                manifestDescriptionEn.trim() || manifestDescription.trim(),
              code: manifestCode,
            }
          : undefined,
      capabilities: validCapabilities.map((c, idx) => ({
        ...c,
        id: c.id || `cap-${idx + 1}`,
        title: c.title.trim(),
        titleEn: c.titleEn.trim() || c.title.trim(),
        description: c.description.trim(),
        descriptionEn: c.descriptionEn.trim() || c.description.trim(),
        highlights: c.highlights.map(h => h.trim()).filter(Boolean),
        highlightsEn: c.highlightsEn?.map(h => h.trim()).filter(Boolean),
      })),
      cncfProjects: validCncf.map(p => ({
        ...p,
        name: p.name.trim(),
        usage: p.usage.trim(),
        usageEn: p.usageEn.trim() || p.usage.trim(),
        cncfUrl: p.cncfUrl.trim(),
        sourceRepoUrl: p.sourceRepoUrl?.trim() || undefined,
      })),
      techStack: validTechStack.map(g => ({
        category: g.category.trim(),
        categoryEn: g.categoryEn.trim() || g.category.trim(),
        items: g.items.map(i => i.trim()).filter(Boolean),
      })),
      team: validTeam.map(m => ({
        name: m.name.trim(),
        role: m.role.trim(),
        roleEn: m.roleEn?.trim() || undefined,
        slackUrl: m.slackUrl?.trim() || undefined,
        github: m.github?.trim() || undefined,
      })),
      links: validLinks.map(l => ({
        title: l.title.trim(),
        description: l.description.trim(),
        url: l.url.trim(),
        type: l.type,
      })),
      openPositions: validJobs.map(j => ({
        title: j.title.trim(),
        department: j.department.trim(),
        location: j.location.trim() || 'Norge',
        deadline: j.deadline?.trim() || undefined,
        url: j.url.trim(),
        tags: j.tags.map(t => t.trim()).filter(Boolean),
      })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-3 backdrop-blur-xs sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Rediger plattformprofil for {memberName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-400/30">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                {isAdmin
                  ? 'Admin-tilgang'
                  : `Verifisert via @${userEmailDomain ?? memberDomains[0]}`}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Endringer lagres direkte i Sanity og oppdaterer både medlemssiden
              og plattformoversikten umiddelbart.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-zinc-200 bg-zinc-50/70 px-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          {(
            [
              {
                id: 'general',
                label: 'Grunninfo & Utseende',
                icon: SwatchIcon,
              },
              {
                id: 'capabilities',
                label: `Kapabiliteter (${capabilities.length})`,
                icon: SparklesIcon,
              },
              {
                id: 'cncf',
                label: `CNCF-prosjekter (${cncfProjects.length})`,
                icon: CubeTransparentIcon,
              },
              {
                id: 'stats',
                label: `Nøkkeltall & YAML (${stats.length})`,
                icon: CodeBracketIcon,
              },
              {
                id: 'more',
                label: 'Teknologi, Team & Lenker',
                icon: ServerStackIcon,
              },
            ] as const
          ).map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                  active
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSave}
          className="flex-1 space-y-6 overflow-y-auto p-6"
        >
          {errorMsg && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
              {errorMsg}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Plattformnavn *
                  </label>
                  <input
                    type="text"
                    required
                    value={platformName}
                    onChange={e => setPlatformName(e.target.value)}
                    placeholder="f.eks. NAIS, SKIP, Aurora"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Dokumentasjons- / plattform-URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={platformHref}
                    onChange={e => setPlatformHref(e.target.value)}
                    placeholder="https://docs.nais.io"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Knappetekst for lenke
                  </label>
                  <input
                    type="text"
                    value={platformLabel}
                    onChange={e => setPlatformLabel(e.target.value)}
                    placeholder="docs.nais.io"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Plattformlogo (valgfri sti/URL)
                  </label>
                  <input
                    type="text"
                    value={platformLogo}
                    onChange={e => setPlatformLogo(e.target.value)}
                    placeholder="/images/platforms/nais.svg"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Kort plattformbeskrivelse (vises på /plattformer og
                  /medlemmer) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={platformDescription}
                  onChange={e => setPlatformDescription(e.target.value)}
                  placeholder="Applikasjonsplattformen til Nav som gir utviklingsteam autonome verktøy..."
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Ingress / Tagline (Norsk)
                  </label>
                  <textarea
                    rows={2}
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Ingress / Tagline (Engelsk)
                  </label>
                  <textarea
                    rows={2}
                    value={taglineEn}
                    onChange={e => setTaglineEn(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Om plattformen (Norsk)
                  </label>
                  <textarea
                    rows={4}
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Om plattformen (Engelsk)
                  </label>
                  <textarea
                    rows={4}
                    value={aboutEn}
                    onChange={e => setAboutEn(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Skyleverandører / kjøremiljø (komma-separert)
                  </label>
                  <input
                    type="text"
                    value={cloudProvidersText}
                    onChange={e => setCloudProvidersText(e.target.value)}
                    placeholder="Google Cloud Platform (GCP), On-premise datasentre"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2 pb-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={cncfEndUserMember}
                      onChange={e => setCncfEndUserMember(e.target.checked)}
                      className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                    CNCF End User Member
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={openSourceFirst}
                      onChange={e => setOpenSourceFirst(e.target.checked)}
                      className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                    100 % Open Source-plattform
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                  Visuell tilpasning og seksjonsrekkefølge
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Profilfarge
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {PROFILE_ACCENT_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAccentColor(color)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition ${
                            accentColor === color
                              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                              : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Toppstil
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {PROFILE_HERO_STYLES.map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setHeroStyle(style)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition ${
                            heroStyle === style
                              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                              : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      <ArrowsUpDownIcon className="h-3.5 w-3.5" />
                      Seksjonsrekkefølge
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {sectionOrder.map((secId, index) => (
                        <div
                          key={secId}
                          className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <span>{SECTION_LABELS_NO[secId]}</span>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveSection(index, -1)}
                            aria-label="Flytt seksjon opp"
                            className="text-zinc-400 hover:text-zinc-900 disabled:opacity-30 dark:hover:text-white"
                          >
                            <ChevronLeftIcon className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sectionOrder.length - 1}
                            onClick={() => moveSection(index, 1)}
                            aria-label="Flytt seksjon ned"
                            className="text-zinc-400 hover:text-zinc-900 disabled:opacity-30 dark:hover:text-white"
                          >
                            <ChevronRightIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'capabilities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Plattformkapabiliteter og Golden Paths
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Beskriv hvilke selvbetjente tjenester og kapabiliteter
                    plattformen tilbyr utviklerteamene.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCapabilities(prev => [
                      ...prev,
                      {
                        id: `cap-${Date.now()}`,
                        title: '',
                        titleEn: '',
                        category: 'compute',
                        maturity: 'production',
                        selfService: true,
                        description: '',
                        descriptionEn: '',
                        highlights: [],
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
                >
                  <PlusIcon className="h-4 w-4" />
                  Legg til kapabilitet
                </button>
              </div>

              {capabilities.length === 0 && (
                <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-xs text-zinc-500 dark:border-zinc-700">
                  Ingen kapabiliteter lagt til ennå. Klikk «Legg til
                  kapabilitet» for å starte.
                </p>
              )}

              {capabilities.map((cap, idx) => (
                <div
                  key={cap.id || idx}
                  className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-500">
                      Kapabilitet #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCapabilities(prev =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Fjern
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Tittel (NO) *
                      </label>
                      <input
                        type="text"
                        value={cap.title}
                        onChange={e => {
                          const next = [...capabilities]
                          next[idx] = { ...cap, title: e.target.value }
                          setCapabilities(next)
                        }}
                        placeholder="Deklarativ applikasjonsplattform"
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Tittel (EN)
                      </label>
                      <input
                        type="text"
                        value={cap.titleEn}
                        onChange={e => {
                          const next = [...capabilities]
                          next[idx] = { ...cap, titleEn: e.target.value }
                          setCapabilities(next)
                        }}
                        placeholder="Declarative Application Runtime"
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Kategori
                        </label>
                        <select
                          value={cap.category}
                          onChange={e => {
                            const next = [...capabilities]
                            next[idx] = {
                              ...cap,
                              category: e.target
                                .value as PlatformCapability['category'],
                            }
                            setCapabilities(next)
                          }}
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          {CAPABILITY_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {CAPABILITY_CATEGORY_LABELS[cat].no}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Status
                        </label>
                        <select
                          value={cap.maturity}
                          onChange={e => {
                            const next = [...capabilities]
                            next[idx] = {
                              ...cap,
                              maturity: e.target
                                .value as PlatformCapability['maturity'],
                            }
                            setCapabilities(next)
                          }}
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          <option value="production">Produksjon</option>
                          <option value="beta">Beta</option>
                          <option value="planned">Planlagt</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Beskrivelse (NO) *
                      </label>
                      <textarea
                        rows={2}
                        value={cap.description}
                        onChange={e => {
                          const next = [...capabilities]
                          next[idx] = { ...cap, description: e.target.value }
                          setCapabilities(next)
                        }}
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Høydepunkter (ett punkt per linje)
                      </label>
                      <textarea
                        rows={2}
                        value={cap.highlights.join('\n')}
                        onChange={e => {
                          const next = [...capabilities]
                          next[idx] = {
                            ...cap,
                            highlights: e.target.value.split('\n'),
                          }
                          setCapabilities(next)
                        }}
                        placeholder={
                          'Automatisk nettverkspolicy\nInnebygd autoskalering'
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cncf' && (
            <div className="space-y-5">
              {/* Quick-add Catalog */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <h3 className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-300">
                  Hurtigvalg fra CNCF-katalogen
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Klikk på prosjektene dere bruker i plattformen for å legge dem
                  til med riktig modenhetsnivå og lenke.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {CNCF_PROJECT_CATALOG.map(item => {
                    const added = cncfProjects.some(
                      p => p.name.toLowerCase() === item.name.toLowerCase()
                    )
                    return (
                      <button
                        key={item.name}
                        type="button"
                        disabled={added}
                        onClick={() => addFromCatalog(item)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          added
                            ? 'bg-teal-100 text-teal-800 opacity-60 dark:bg-teal-950 dark:text-teal-300'
                            : 'border border-zinc-200 bg-white text-zinc-700 hover:border-teal-500 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <PlusIcon className="h-3 w-3" />
                        <span>{item.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Valgte CNCF-prosjekter ({cncfProjects.length})
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setCncfProjects(prev => [
                      ...prev,
                      {
                        name: '',
                        tier: 'Graduated',
                        category: 'Orchestration & GitOps',
                        usage: '',
                        usageEn: '',
                        cncfUrl: 'https://www.cncf.io/projects/',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <PlusIcon className="h-4 w-4" />
                  Egendefinert prosjekt
                </button>
              </div>

              <div className="space-y-3">
                {cncfProjects.map((proj, idx) => (
                  <div
                    key={`${proj.name}-${idx}`}
                    className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800/30"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Prosjektnavn *
                        </label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={e => {
                            const next = [...cncfProjects]
                            next[idx] = { ...proj, name: e.target.value }
                            setCncfProjects(next)
                          }}
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          CNCF Tier
                        </label>
                        <select
                          value={proj.tier}
                          onChange={e => {
                            const next = [...cncfProjects]
                            next[idx] = {
                              ...proj,
                              tier: e.target.value as CncfProjectUsage['tier'],
                            }
                            setCncfProjects(next)
                          }}
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          {CNCF_MATURITY_TIERS.map(t => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Kategori
                        </label>
                        <select
                          value={proj.category}
                          onChange={e => {
                            const next = [...cncfProjects]
                            next[idx] = {
                              ...proj,
                              category: e.target
                                .value as CncfProjectUsage['category'],
                            }
                            setCncfProjects(next)
                          }}
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          {CNCF_PROJECT_CATEGORIES.map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            I bruk siden (år)
                          </label>
                          <input
                            type="number"
                            value={proj.sinceYear ?? ''}
                            onChange={e => {
                              const next = [...cncfProjects]
                              next[idx] = {
                                ...proj,
                                sinceYear: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }
                              setCncfProjects(next)
                            }}
                            placeholder="2020"
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCncfProjects(prev =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="mb-1 rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          title="Fjern prosjekt"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Hvordan bruker dere prosjektet? (NO) *
                        </label>
                        <input
                          type="text"
                          value={proj.usage}
                          onChange={e => {
                            const next = [...cncfProjects]
                            next[idx] = { ...proj, usage: e.target.value }
                            setCncfProjects(next)
                          }}
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Lenke til egen kildekode / oppsett (valgfri)
                        </label>
                        <input
                          type="url"
                          value={proj.sourceRepoUrl ?? ''}
                          onChange={e => {
                            const next = [...cncfProjects]
                            next[idx] = {
                              ...proj,
                              sourceRepoUrl: e.target.value,
                            }
                            setCncfProjects(next)
                          }}
                          placeholder="https://github.com/..."
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Nøkkeltall (vises i toppen av profilen)
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      F.eks. antall applikasjoner, produktteam, daglige deploys
                      eller klustre.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setStats(prev => [
                        ...prev,
                        { label: '', labelEn: '', value: '', detail: '' },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Legg til nøkkeltall
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  {stats.map((st, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-4 dark:border-zinc-800"
                    >
                      <input
                        type="text"
                        value={st.label}
                        onChange={e => {
                          const next = [...stats]
                          next[idx] = { ...st, label: e.target.value }
                          setStats(next)
                        }}
                        placeholder="Merkelapp (f.eks. Daglige deploys)"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={st.value}
                        onChange={e => {
                          const next = [...stats]
                          next[idx] = { ...st, value: e.target.value }
                          setStats(next)
                        }}
                        placeholder="Verdi (f.eks. 600+)"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={st.detail ?? ''}
                        onChange={e => {
                          const next = [...stats]
                          next[idx] = { ...st, detail: e.target.value }
                          setStats(next)
                        }}
                        placeholder="Detalj (f.eks. Fullautomatisert GitOps)"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setStats(prev => prev.filter((_, i) => i !== idx))
                          }
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Fjern
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={hasManifest}
                    onChange={e => setHasManifest(e.target.checked)}
                    className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                  />
                  Vis eksempel på deklarativ applikasjonskontrakt (YAML / CRD)
                </label>

                {hasManifest && (
                  <div className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Filnavn
                        </label>
                        <input
                          type="text"
                          value={manifestFilename}
                          onChange={e => setManifestFilename(e.target.value)}
                          placeholder="nais.yaml / skiperator.yaml"
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Tittel
                        </label>
                        <input
                          type="text"
                          value={manifestTitle}
                          onChange={e => setManifestTitle(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Kort forklaring
                      </label>
                      <input
                        type="text"
                        value={manifestDescription}
                        onChange={e => setManifestDescription(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        YAML-kode
                      </label>
                      <textarea
                        rows={10}
                        value={manifestCode}
                        onChange={e => setManifestCode(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-950 p-3 font-mono text-xs text-teal-300 dark:border-zinc-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'more' && (
            <div className="space-y-6">
              {/* Tech Stack */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Teknologistabel (kategorier i sidekolonnen)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setTechStack(prev => [
                        ...prev,
                        { category: '', categoryEn: '', items: [] },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Ny kategori
                  </button>
                </div>
                <div className="mt-2.5 space-y-2">
                  {techStack.map((group, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-3 dark:border-zinc-800"
                    >
                      <input
                        type="text"
                        value={group.category}
                        onChange={e => {
                          const next = [...techStack]
                          next[idx] = { ...group, category: e.target.value }
                          setTechStack(next)
                        }}
                        placeholder="Kategori (f.eks. Språk og rammeverk)"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={group.items.join(', ')}
                        onChange={e => {
                          const next = [...techStack]
                          next[idx] = {
                            ...group,
                            items: e.target.value.split(','),
                          }
                          setTechStack(next)
                        }}
                        placeholder="Teknologier (komma-separert: Kotlin, Go, Kafka)"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Nøkkelpersoner / Plattformteam
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Foredragsholdere fra fagdager legges til automatisk i
                      tillegg til disse.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setTeam(prev => [
                        ...prev,
                        { name: '', role: '', slackUrl: '', github: '' },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Legg til person
                  </button>
                </div>
                <div className="mt-2.5 space-y-2">
                  {team.map((member, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-4 dark:border-zinc-800"
                    >
                      <input
                        type="text"
                        value={member.name}
                        onChange={e => {
                          const next = [...team]
                          next[idx] = { ...member, name: e.target.value }
                          setTeam(next)
                        }}
                        placeholder="Navn"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={member.role}
                        onChange={e => {
                          const next = [...team]
                          next[idx] = { ...member, role: e.target.value }
                          setTeam(next)
                        }}
                        placeholder="Rolle (f.eks. Plattformarkitekt)"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={member.github ?? ''}
                        onChange={e => {
                          const next = [...team]
                          next[idx] = { ...member, github: e.target.value }
                          setTeam(next)
                        }}
                        placeholder="GitHub-brukernavn"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={member.slackUrl ?? ''}
                          onChange={e => {
                            const next = [...team]
                            next[idx] = { ...member, slackUrl: e.target.value }
                            setTeam(next)
                          }}
                          placeholder="Slack-profil URL"
                          className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTeam(prev => prev.filter((_, i) => i !== idx))
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Relevante lenker
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setLinks(prev => [
                        ...prev,
                        {
                          title: '',
                          description: '',
                          url: '',
                          type: 'docs',
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Ny lenke
                  </button>
                </div>
                <div className="mt-2.5 space-y-2">
                  {links.map((link, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-4 dark:border-zinc-800"
                    >
                      <input
                        type="text"
                        value={link.title}
                        onChange={e => {
                          const next = [...links]
                          next[idx] = { ...link, title: e.target.value }
                          setLinks(next)
                        }}
                        placeholder="Tittel"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={link.description}
                        onChange={e => {
                          const next = [...links]
                          next[idx] = { ...link, description: e.target.value }
                          setLinks(next)
                        }}
                        placeholder="Kort beskrivelse"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={e => {
                          const next = [...links]
                          next[idx] = { ...link, url: e.target.value }
                          setLinks(next)
                        }}
                        placeholder="https://..."
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={link.type}
                          onChange={e => {
                            const next = [...links]
                            next[idx] = {
                              ...link,
                              type: e.target.value as ProfileLink['type'],
                            }
                            setLinks(next)
                          }}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          {PROFILE_LINK_TYPES.map(t => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            setLinks(prev => prev.filter((_, i) => i !== idx))
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Positions */}
              <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Ledige stillinger i plattformteamet
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenPositions(prev => [
                        ...prev,
                        {
                          title: '',
                          department: '',
                          location: 'Oslo',
                          url: '',
                          tags: [],
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Ny stilling
                  </button>
                </div>
                <div className="mt-2.5 space-y-2">
                  {openPositions.map((job, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-4 dark:border-zinc-800"
                    >
                      <input
                        type="text"
                        value={job.title}
                        onChange={e => {
                          const next = [...openPositions]
                          next[idx] = { ...job, title: e.target.value }
                          setOpenPositions(next)
                        }}
                        placeholder="Stillingstittel"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={job.department}
                        onChange={e => {
                          const next = [...openPositions]
                          next[idx] = { ...job, department: e.target.value }
                          setOpenPositions(next)
                        }}
                        placeholder="Avdeling / Team"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="url"
                        value={job.url}
                        onChange={e => {
                          const next = [...openPositions]
                          next[idx] = { ...job, url: e.target.value }
                          setOpenPositions(next)
                        }}
                        placeholder="Lenke til utlysning (https://...)"
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={job.tags.join(', ')}
                          onChange={e => {
                            const next = [...openPositions]
                            next[idx] = {
                              ...job,
                              tags: e.target.value.split(','),
                            }
                            setOpenPositions(next)
                          }}
                          placeholder="Stikkord (Kubernetes, Go)"
                          className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setOpenPositions(prev =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={upsertMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500 disabled:opacity-50"
            >
              {upsertMutation.isPending
                ? 'Lagrer i Sanity...'
                : 'Lagre plattformprofil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
