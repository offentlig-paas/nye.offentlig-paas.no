'use client'

import { useState } from 'react'
import {
  ArrowsUpDownIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CodeBracketIcon,
  CubeTransparentIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  LockClosedIcon,
  PlusIcon,
  ServerStackIcon,
  SparklesIcon,
  SwatchIcon,
  TrashIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { trpc } from '@/lib/trpc/client'
import { extractSlackUserId } from '@/lib/slack/utils'
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
  type PlatformAccessType,
  type PlatformCapability,
  type ProfileAccentColor,
  type ProfileHeroStyle,
  type ProfileLink,
  type ProfileSectionId,
  type ProfileStat,
  type ProfileVisibility,
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
  accessReason?:
    | 'admin'
    | 'domain_match'
    | 'team_member'
    | 'unauthenticated'
    | 'domain_mismatch'
  currentUser?: {
    name: string
    email: string
    slackId: string
    title: string
  }
  uniqueSpeakers?: {
    name: string
    url?: string
  }[]
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

const ACCENT_COLOR_SWATCHES: Record<ProfileAccentColor, string> = {
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

const ACCENT_COLOR_LABELS_NO: Record<ProfileAccentColor, string> = {
  teal: 'Teal',
  blue: 'Blå',
  indigo: 'Indigo',
  emerald: 'Smaragd',
  amber: 'Rav',
  rose: 'Rose',
}

const HERO_STYLE_LABELS_NO: Record<ProfileHeroStyle, string> = {
  gradient: 'Gradient',
  grid: 'Rutenett',
  minimal: 'Minimal',
}

const LINK_TYPE_LABELS_NO: Record<ProfileLink['type'], string> = {
  docs: 'Dokumentasjon',
  github: 'GitHub / Kildekode',
  blog: 'Teknologiblogg',
  website: 'Nettside / Portal',
  status: 'Statusside',
  careers: 'Karriereside',
}

const DEFAULT_SECTION_ORDER: ProfileSectionId[] = [
  'capabilities',
  'cncf',
  'talks',
  'team',
  'architecture',
  'jobs',
]

const INPUT_CLASS =
  'mt-1.5 h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none sm:text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500'

const SELECT_CLASS =
  'mt-1.5 h-9 w-full rounded-lg border border-zinc-300 bg-white px-2.5 text-base text-zinc-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none sm:text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'

const TEXTAREA_CLASS =
  'mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none sm:text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500'

function normalizeSlackUrl(raw?: string): string | undefined {
  const trimmed = raw?.trim().replace(/\/+$/, '')
  if (!trimmed) return undefined
  if (/^[UW][A-Z0-9]{6,}$/i.test(trimmed)) {
    return `https://offentlig-paas-no.slack.com/team/${trimmed.toUpperCase()}`
  }
  return trimmed
}

function isValidSlackProfileUrl(url?: string): boolean {
  if (!url) return true
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'slack.com' ||
        parsed.hostname.endsWith('.slack.com')) &&
      /^\/team\/[UW][A-Z0-9]{6,}$/i.test(parsed.pathname)
    )
  } catch {
    return false
  }
}

function normalizeGithubHandle(raw?: string): string | undefined {
  const trimmed = raw?.trim()
  if (!trimmed) return undefined
  return trimmed
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
}

export function MemberProfileEditorModal({
  isOpen,
  onClose,
  memberName,
  memberSlug,
  memberDomains,
  userEmailDomain,
  isAdmin,
  accessReason,
  currentUser,
  uniqueSpeakers = [],
  initialProfile,
  onSaved,
}: MemberProfileEditorModalProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('general')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [templateNotice, setTemplateNotice] = useState<string | null>(null)
  const [showStarterTemplates, setShowStarterTemplates] = useState(
    !initialProfile ||
      (initialProfile.capabilities.length === 0 &&
        initialProfile.cncfProjects.length === 0)
  )

  const [visibility, setVisibility] = useState<ProfileVisibility>(
    initialProfile?.visibility ?? 'public'
  )
  const [platformAccess, setPlatformAccess] = useState<PlatformAccessType>(
    initialProfile?.platformAccess ??
      (initialProfile
        ? initialProfile.platformHref
          ? 'public'
          : 'internal'
        : 'public')
  )

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
      utils.memberProfile.getPermissions.invalidate({ slug: memberSlug })
      utils.memberProfile.listPlatforms.invalidate()
      utils.memberProfile.getMyMembership.invalidate()
      onSaved(data)
      onClose()
    },
    onError: err => {
      setErrorMsg(err.message)
    },
  })

  if (!isOpen) return null

  const applyStarterTemplate = (
    templateId: 'cloud-k8s' | 'hybrid-k8s' | 'internal'
  ) => {
    const pName = platformName.trim() || `${memberName} Plattform`
    if (!platformName.trim()) {
      setPlatformName(pName)
    }
    if (!platformDescription.trim()) {
      setPlatformDescription(
        `Applikasjonsplattformen til ${memberName} for effektiv og sikker utvikling og drift av digitale tjenester.`
      )
    }
    if (!tagline.trim()) {
      setTagline(
        `Felles applikasjonsplattform og golden paths for produktteam i ${memberName}.`
      )
    }
    if (!about.trim()) {
      setAbout(
        `Plattformen reduserer kognitiv belastning for utviklingsteamene i ${memberName} gjennom standardisert utrulling, innebygd sikkerhet og ferdig oppsatt observability.`
      )
    }

    if (templateId === 'cloud-k8s') {
      setCloudProvidersText('Google Cloud Platform (GCP), Microsoft Azure')
      setOpenSourceFirst(true)
    } else if (templateId === 'hybrid-k8s') {
      setCloudProvidersText('On-premise datasentre, Microsoft Azure / GCP')
      setOpenSourceFirst(true)
    } else if (templateId === 'internal') {
      setPlatformAccess('internal')
      setOpenSourceFirst(false)
      if (!cloudProvidersText.trim()) {
        setCloudProvidersText('Internt datasenter / Privat sky')
      }
    }

    const defaultCaps: PlatformCapability[] = [
      {
        id: 'cap-deploy',
        category: 'dx',
        title: 'GitOps og automatisert utrulling',
        titleEn: 'GitOps & Automated Deployment',
        description:
          'Deklarativ utrulling fra Git til test- og produksjonsmiljøer.',
        descriptionEn:
          'Declarative deployment from Git to test and production environments.',
        maturity: 'production',
        selfService: true,
        highlights: [
          'Automatisk synkronisering av miljøer via GitOps',
          'Standardiserte bygge- og utrullingspipelines',
        ],
      },
      {
        id: 'cap-security',
        category: 'security',
        title: 'Innebygd sikkerhet og tilgangsstyring',
        titleEn: 'Built-in Security & Access Control',
        description:
          'Automatisk sertifikathåndtering, nettverkspolicyer og hemmelighetshåndtering.',
        descriptionEn:
          'Automated certificate management, network policies, and secrets management.',
        maturity: 'production',
        selfService: true,
        highlights: [
          'Zero-trust nettverksisolasjon mellom applikasjoner',
          'Automatisk rotasjon av hemmeligheter og sertifikater',
        ],
      },
      {
        id: 'cap-obs',
        category: 'observability',
        title: 'Ferdig oppsatt logging, metrikker og sporing',
        titleEn: 'Turnkey Logging, Metrics & Tracing',
        description:
          'Standardiserte dashboards, alarmer og distribuert sporing ut av boksen.',
        descriptionEn:
          'Standardized dashboards, alerts, and distributed tracing out of the box.',
        maturity: 'production',
        selfService: true,
        highlights: [
          'Prometheus-metrikker og ferdige Grafana-dashboards',
          'OpenTelemetry-basert sporing og sentralisert loggsøk',
        ],
      },
    ]

    if (capabilities.length === 0) {
      setCapabilities(defaultCaps)
    }

    if (cncfProjects.length === 0) {
      const starterNames =
        templateId === 'internal'
          ? ['Kubernetes', 'Prometheus', 'OpenTelemetry', 'Cert-Manager']
          : [
              'Kubernetes',
              'Argo CD',
              'Prometheus',
              'Cilium',
              'OpenTelemetry',
              'Cert-Manager',
              'Kyverno',
            ]
      const selected = CNCF_PROJECT_CATALOG.filter(item =>
        starterNames.includes(item.name)
      ).map(item => ({
        name: item.name,
        tier: item.tier,
        category: item.category,
        cncfUrl: item.cncfUrl,
        usage: `Brukes i ${pName}.`,
        usageEn: `Used in ${pName}.`,
      }))
      setCncfProjects(selected)
    }

    if (techStack.length === 0) {
      setTechStack([
        {
          category: 'Kjøremiljø & Leveranse',
          categoryEn: 'Runtime & Delivery',
          items: ['Kubernetes', 'GitHub Actions', 'Argo CD', 'Terraform'],
        },
        {
          category: 'Observability & Sikkerhet',
          categoryEn: 'Observability & Security',
          items: ['Prometheus', 'Grafana', 'OpenTelemetry', 'Kyverno'],
        },
      ])
    }

    setTemplateNotice(
      'Malen er fylt inn! Se gjerne gjennom fanene Kapabiliteter, CNCF-prosjekter og Teknologi, Team & Lenker før du lagrer.'
    )
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= sectionOrder.length) return
    const next = [...sectionOrder]
    const tmp = next[index]!
    next[index] = next[target]!
    next[target] = tmp
    setSectionOrder(next)
  }

  const moveCapability = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= capabilities.length) return
    const next = [...capabilities]
    const tmp = next[index]!
    next[index] = next[target]!
    next[target] = tmp
    setCapabilities(next)
  }

  const toggleFromCatalog = (
    catalogItem: (typeof CNCF_PROJECT_CATALOG)[number]
  ) => {
    const exists = cncfProjects.some(
      p => p.name.toLowerCase() === catalogItem.name.toLowerCase()
    )
    if (exists) {
      setCncfProjects(prev =>
        prev.filter(
          p => p.name.toLowerCase() !== catalogItem.name.toLowerCase()
        )
      )
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

  const isPersonInTeam = (name?: string, slackIdOrUrl?: string) => {
    const targetSlackId = slackIdOrUrl
      ? /^[UW][A-Z0-9]{6,}$/i.test(slackIdOrUrl.trim())
        ? slackIdOrUrl.trim().toUpperCase()
        : extractSlackUserId(slackIdOrUrl)
      : null

    return team.some(m => {
      if (targetSlackId && m.slackUrl) {
        const mSlackId = /^[UW][A-Z0-9]{6,}$/i.test(m.slackUrl.trim())
          ? m.slackUrl.trim().toUpperCase()
          : extractSlackUserId(m.slackUrl)
        if (mSlackId && mSlackId === targetSlackId) return true
      }
      if (name && m.name.trim().toLowerCase() === name.trim().toLowerCase()) {
        return true
      }
      return false
    })
  }

  const canAddCurrentUser =
    Boolean(currentUser?.name) &&
    !isPersonInTeam(currentUser?.name, currentUser?.slackId)

  const addCurrentUserToTeam = () => {
    if (!currentUser?.name) return
    const slackUrl = currentUser.slackId
      ? `https://offentlig-paas-no.slack.com/team/${currentUser.slackId}`
      : ''
    setTeam(prev => [
      ...prev,
      {
        name: currentUser.name,
        role: currentUser.title || 'Plattformteam',
        slackUrl,
        github: '',
      },
    ])
  }

  const availableSpeakers = uniqueSpeakers.filter(
    s => s.name && !isPersonInTeam(s.name, s.url)
  )

  const addSpeakerToTeam = (speaker: { name: string; url?: string }) => {
    setTeam(prev => [
      ...prev,
      {
        name: speaker.name,
        role: 'Plattformteam',
        slackUrl: speaker.url ?? '',
        github: '',
      },
    ])
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!platformName.trim() || !platformDescription.trim()) {
      setErrorMsg(
        'Fyll ut plattformnavn og kort beskrivelse under Grunninfo & Utseende.'
      )
      setActiveTab('general')
      return
    }

    if (platformAccess === 'public' && !platformHref.trim()) {
      setErrorMsg(
        'Fyll ut dokumentasjons-URL eller velg «Intern plattform» dersom plattformen ikke har en åpen nettside.'
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
      g => g.category.trim() && g.items.some(i => i.trim().length > 0)
    )
    const validTeam = team.filter(m => m.name.trim() && m.role.trim())
    for (const member of validTeam) {
      const normalizedSlack = normalizeSlackUrl(member.slackUrl)
      if (!isValidSlackProfileUrl(normalizedSlack)) {
        setErrorMsg(
          `Ugyldig Slack-ID eller URL for «${member.name.trim()}». Oppgi en Slack-ID (f.eks. U0123ABC) eller full Slack-profil-URL.`
        )
        setActiveTab('more')
        return
      }
      const normalizedGh = normalizeGithubHandle(member.github)
      if (
        normalizedGh &&
        !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(
          normalizedGh
        )
      ) {
        setErrorMsg(
          `Ugyldig GitHub-brukernavn for «${member.name.trim()}». Oppgi kun brukernavnet (f.eks. olanordmann).`
        )
        setActiveTab('more')
        return
      }
    }
    const validLinks = links.filter(l => l.title.trim() && l.url.trim())
    const validJobs = openPositions.filter(
      j => j.title.trim() && j.department.trim() && j.url.trim()
    )

    const trimmedHref = platformHref.trim()
    const computedLabel =
      platformLabel.trim() ||
      (trimmedHref
        ? trimmedHref.replace(/^https?:\/\//, '').replace(/\/$/, '')
        : '')

    upsertMutation.mutate({
      slug: memberSlug,
      visibility,
      platformAccess,
      platformName: platformName.trim(),
      platformDescription: platformDescription.trim(),
      platformHref: trimmedHref,
      platformLabel: computedLabel,
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
        slackUrl: normalizeSlackUrl(m.slackUrl),
        github: normalizeGithubHandle(m.github),
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

  const accessBadgeText = isAdmin
    ? 'Admin-tilgang'
    : accessReason === 'team_member'
      ? 'Tilgang via plattformteam'
      : `Verifisert via @${userEmailDomain ?? memberDomains[0] ?? 'medlem'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-3 backdrop-blur-xs sm:p-6">
      <div className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3.5 sm:px-6 dark:border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 sm:text-lg dark:text-zinc-100">
                {initialProfile ? 'Rediger' : 'Opprett'} plattformprofil for{' '}
                {memberName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-400/30">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                {accessBadgeText}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Endringer publiseres umiddelbart på medlemssiden og i
              plattformoversikten.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk redigeringsvindu"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-zinc-200 bg-zinc-50/70 px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/60">
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
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
            {errorMsg && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
                {errorMsg}
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Starter Templates (Collapsible when profile already has content) */}
                <div className="rounded-xl border border-teal-500/20 bg-teal-50/40 px-4 py-3 dark:border-teal-500/20 dark:bg-teal-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Hurtigstart med mal (1-klikk)
                      </h3>
                      {!showStarterTemplates && (
                        <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">
                          — Fyller kun inn tomme seksjoner uten å overskrive
                          eksisterende innhold
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowStarterTemplates(v => !v)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                    >
                      <span>
                        {showStarterTemplates ? 'Skjul maler' : 'Vis maler'}
                      </span>
                      {showStarterTemplates ? (
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {showStarterTemplates && (
                    <div className="mt-3 flex flex-col justify-between gap-3 border-t border-teal-500/15 pt-3 sm:flex-row sm:items-center">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Fyller automatisk inn standard kapabiliteter,
                        CNCF-prosjekter og teknologistabel dersom feltene er
                        tomme.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyStarterTemplate('cloud-k8s')}
                          className="rounded-lg border border-teal-600/30 bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-teal-700 transition hover:bg-teal-50 dark:border-teal-400/30 dark:bg-zinc-900 dark:text-teal-300 dark:hover:bg-zinc-800"
                        >
                          Skybasert Kubernetes
                        </button>
                        <button
                          type="button"
                          onClick={() => applyStarterTemplate('hybrid-k8s')}
                          className="rounded-lg border border-teal-600/30 bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-teal-700 transition hover:bg-teal-50 dark:border-teal-400/30 dark:bg-zinc-900 dark:text-teal-300 dark:hover:bg-zinc-800"
                        >
                          Hybrid / On-prem
                        </button>
                        <button
                          type="button"
                          onClick={() => applyStarterTemplate('internal')}
                          className="rounded-lg border border-teal-600/30 bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-teal-700 transition hover:bg-teal-50 dark:border-teal-400/30 dark:bg-zinc-900 dark:text-teal-300 dark:hover:bg-zinc-800"
                        >
                          Intern plattform
                        </button>
                      </div>
                    </div>
                  )}

                  {templateNotice && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-300">
                      <CheckCircleIcon className="h-4 w-4 shrink-0" />
                      <span>{templateNotice}</span>
                    </p>
                  )}
                </div>

                {/* Visibility & Platform Access Controls */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Profilsynlighet på offentlig-paas.no
                      </label>
                      <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Velg om profilen er åpen for alle eller kun innloggede
                        Slack-medlemmer.
                      </p>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibility('public')}
                        className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                          visibility === 'public'
                            ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                        }`}
                      >
                        <GlobeAltIcon className="h-4 w-4 shrink-0" />
                        <span>Offentlig</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibility('internal')}
                        className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                          visibility === 'internal'
                            ? 'border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-zinc-950'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                        }`}
                      >
                        <LockClosedIcon className="h-4 w-4 shrink-0" />
                        <span>Kun medlemmer</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Plattformtilgang og dokumentasjon
                      </label>
                      <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Har plattformen en åpen dokumentasjonsside eller er den
                        kun tilgjengelig internt?
                      </p>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPlatformAccess('public')}
                        className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                          platformAccess === 'public'
                            ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                        }`}
                      >
                        <GlobeAltIcon className="h-4 w-4 shrink-0" />
                        <span>Åpen nettside / docs</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlatformAccess('internal')}
                        className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                          platformAccess === 'internal'
                            ? 'border-zinc-800 bg-zinc-800 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                        }`}
                      >
                        <LockClosedIcon className="h-4 w-4 shrink-0" />
                        <span>Intern plattform</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Platform Fields */}
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
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Dokumentasjons- / plattform-URL{' '}
                      {platformAccess === 'public'
                        ? '*'
                        : '(valgfri for intern plattform)'}
                    </label>
                    <input
                      type="url"
                      required={platformAccess === 'public'}
                      value={platformHref}
                      onChange={e => setPlatformHref(e.target.value)}
                      placeholder={
                        platformAccess === 'public'
                          ? 'https://docs.nais.io'
                          : 'Valgfritt for intern plattform'
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Knappetekst for dokumentasjonslenke
                    </label>
                    <input
                      type="text"
                      value={platformLabel}
                      onChange={e => setPlatformLabel(e.target.value)}
                      placeholder={
                        platformAccess === 'public'
                          ? 'docs.nais.io'
                          : 'Intern plattform'
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Plattformlogo (valgfri sti eller URL)
                    </label>
                    <input
                      type="text"
                      value={platformLogo}
                      onChange={e => setPlatformLogo(e.target.value)}
                      placeholder="/images/platforms/nais.svg"
                      className={INPUT_CLASS}
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
                    className={TEXTAREA_CLASS}
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
                      placeholder="Hovedingress øverst på medlemssiden..."
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Ingress / Tagline (Engelsk, valgfri)
                    </label>
                    <textarea
                      rows={2}
                      value={taglineEn}
                      onChange={e => setTaglineEn(e.target.value)}
                      placeholder="Valgfri engelsk oversettelse..."
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Om plattformen (Norsk)
                    </label>
                    <textarea
                      rows={3}
                      value={about}
                      onChange={e => setAbout(e.target.value)}
                      placeholder="Utfyllende beskrivelse av arkitektur, formål og hvordan plattformteamet jobber..."
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Om plattformen (Engelsk, valgfri)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutEn}
                      onChange={e => setAboutEn(e.target.value)}
                      placeholder="Valgfri engelsk oversettelse..."
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                </div>

                {/* Cloud Providers & Badges */}
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
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Sertifisering og åpen kildekode
                    </label>
                    <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        <input
                          type="checkbox"
                          checked={cncfEndUserMember}
                          onChange={e => setCncfEndUserMember(e.target.checked)}
                          className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="truncate">CNCF End User Member</span>
                      </label>
                      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        <input
                          type="checkbox"
                          checked={openSourceFirst}
                          onChange={e => setOpenSourceFirst(e.target.checked)}
                          className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="truncate">100 % Open Source</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Theme & Section Order */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Visuell tilpasning og seksjonsrekkefølge
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${
                              accentColor === color
                                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${ACCENT_COLOR_SWATCHES[color]}`}
                            />
                            <span>{ACCENT_COLOR_LABELS_NO[color]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Toppstil (Hero)
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {PROFILE_HERO_STYLES.map(style => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setHeroStyle(style)}
                            className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition ${
                              heroStyle === style
                                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {HERO_STYLE_LABELS_NO[style]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-zinc-200/80 pt-3.5 dark:border-zinc-700/60">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      <ArrowsUpDownIcon className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Seksjonsrekkefølge på profilsiden</span>
                    </label>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {sectionOrder.map((secId, index) => (
                        <div
                          key={secId}
                          className="flex h-9 items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 text-[11px] font-semibold text-zinc-600 tabular-nums dark:bg-zinc-700 dark:text-zinc-300">
                              {index + 1}
                            </span>
                            <span className="truncate">
                              {SECTION_LABELS_NO[secId]}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveSection(index, -1)}
                              aria-label="Flytt seksjon frem"
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-700 dark:hover:text-white"
                            >
                              <ChevronLeftIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === sectionOrder.length - 1}
                              onClick={() => moveSection(index, 1)}
                              aria-label="Flytt seksjon bak"
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-700 dark:hover:text-white"
                            >
                              <ChevronRightIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'capabilities' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-500"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Legg til kapabilitet</span>
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
                    className="space-y-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 pb-2.5 dark:border-zinc-700/60">
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        Kapabilitet #{idx + 1}
                      </span>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={cap.selfService}
                            onChange={e => {
                              const next = [...capabilities]
                              next[idx] = {
                                ...cap,
                                selfService: e.target.checked,
                              }
                              setCapabilities(next)
                            }}
                            className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span>Selvbetjent (Self-service)</span>
                        </label>

                        <div className="flex items-center gap-0.5 border-x border-zinc-200 px-2 dark:border-zinc-700">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveCapability(idx, -1)}
                            title="Flytt opp"
                            aria-label="Flytt kapabilitet opp"
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-800 disabled:opacity-30 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                          >
                            <ChevronUpIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === capabilities.length - 1}
                            onClick={() => moveCapability(idx, 1)}
                            title="Flytt ned"
                            aria-label="Flytt kapabilitet ned"
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-800 disabled:opacity-30 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                          >
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setCapabilities(prev =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          <span>Fjern</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                      <div className="sm:col-span-4">
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
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Tittel (EN, valgfri)
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
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-2">
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
                          className={SELECT_CLASS}
                        >
                          {CAPABILITY_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {CAPABILITY_CATEGORY_LABELS[cat].no}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
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
                          className={SELECT_CLASS}
                        >
                          <option value="production">Produksjon</option>
                          <option value="beta">Beta</option>
                          <option value="planned">Planlagt</option>
                        </select>
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
                          placeholder="Beskriv hva kapabiliteten løser for utviklerteamene..."
                          className={TEXTAREA_CLASS}
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
                          className={TEXTAREA_CLASS}
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
                    Klikk for å legge til eller fjerne prosjekter dere bruker i
                    plattformen.
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
                          onClick={() => toggleFromCatalog(item)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                            added
                              ? 'bg-teal-600 text-white shadow-2xs hover:bg-teal-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400'
                              : 'border border-zinc-200 bg-white text-zinc-700 hover:border-teal-500 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {added ? (
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                          ) : (
                            <PlusIcon className="h-3.5 w-3.5" />
                          )}
                          <span>{item.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
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
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Egendefinert prosjekt</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cncfProjects.map((proj, idx) => (
                    <div
                      key={`${proj.name}-${idx}`}
                      className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-800/30"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                        <div className="sm:col-span-4">
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
                            placeholder="f.eks. Kubernetes, Cilium"
                            className={INPUT_CLASS}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            CNCF Tier
                          </label>
                          <select
                            value={proj.tier}
                            onChange={e => {
                              const next = [...cncfProjects]
                              next[idx] = {
                                ...proj,
                                tier: e.target
                                  .value as CncfProjectUsage['tier'],
                              }
                              setCncfProjects(next)
                            }}
                            className={SELECT_CLASS}
                          >
                            {CNCF_MATURITY_TIERS.map(t => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
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
                            className={SELECT_CLASS}
                          >
                            {CNCF_PROJECT_CATEGORIES.map(c => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end gap-2 sm:col-span-3">
                          <div className="min-w-0 flex-1">
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
                              className={INPUT_CLASS}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCncfProjects(prev =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
                            title="Fjern prosjekt"
                            aria-label="Fjern prosjekt"
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
                            placeholder="Kort beskrivelse av bruksområde i plattformen..."
                            className={INPUT_CLASS}
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
                            className={INPUT_CLASS}
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Nøkkeltall (vises i toppen av profilen)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Opptil 4 sentrale nøkkeltall, f.eks. antall
                        applikasjoner, produktteam, daglige deploys eller
                        klustre.
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
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-500"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Legg til nøkkeltall</span>
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {stats.map((st, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-zinc-50/40 p-3.5 sm:grid-cols-12 dark:border-zinc-800 dark:bg-zinc-800/30"
                      >
                        <div className="sm:col-span-4">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Merkelapp *
                          </label>
                          <input
                            type="text"
                            value={st.label}
                            onChange={e => {
                              const next = [...stats]
                              next[idx] = { ...st, label: e.target.value }
                              setStats(next)
                            }}
                            placeholder="f.eks. Daglige deploys"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Verdi *
                          </label>
                          <input
                            type="text"
                            value={st.value}
                            onChange={e => {
                              const next = [...stats]
                              next[idx] = { ...st, value: e.target.value }
                              setStats(next)
                            }}
                            placeholder="f.eks. 600+"
                            className={`${INPUT_CLASS} font-semibold`}
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Kontekst / undertittel (valgfri)
                          </label>
                          <input
                            type="text"
                            value={st.detail ?? ''}
                            onChange={e => {
                              const next = [...stats]
                              next[idx] = { ...st, detail: e.target.value }
                              setStats(next)
                            }}
                            placeholder="f.eks. Fullautomatisert via GitOps"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div className="flex items-end justify-end sm:col-span-1">
                          <button
                            type="button"
                            onClick={() =>
                              setStats(prev => prev.filter((_, i) => i !== idx))
                            }
                            title="Fjern nøkkeltall"
                            aria-label="Fjern nøkkeltall"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={hasManifest}
                      onChange={e => setHasManifest(e.target.checked)}
                      className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>
                      Vis eksempel på deklarativ applikasjonskontrakt (YAML /
                      CRD)
                    </span>
                  </label>

                  {hasManifest && (
                    <div className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Filnavn *
                          </label>
                          <input
                            type="text"
                            value={manifestFilename}
                            onChange={e => setManifestFilename(e.target.value)}
                            placeholder="nais.yaml / skiperator.yaml"
                            className={`${INPUT_CLASS} font-mono`}
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
                            placeholder="Deklarativ applikasjonskontrakt"
                            className={INPUT_CLASS}
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
                          placeholder="Slik definerer utviklingsteam applikasjonen sin..."
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          YAML-kode *
                        </label>
                        <textarea
                          rows={10}
                          value={manifestCode}
                          onChange={e => setManifestCode(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-zinc-950 p-3 font-mono text-base text-teal-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none sm:text-xs dark:border-zinc-700"
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Teknologistabel (kategorier i sidekolonnen)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Grupper sentrale verktøy, språk og plattformtjenester.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTechStack(prev => [
                          ...prev,
                          { category: '', categoryEn: '', items: [] },
                        ])
                      }
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Ny kategori</span>
                    </button>
                  </div>

                  {techStack.length === 0 ? (
                    <p className="mt-2.5 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
                      Ingen teknologikategorier lagt til ennå.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {techStack.map((group, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-zinc-50/40 p-3.5 sm:grid-cols-12 dark:border-zinc-800 dark:bg-zinc-800/30"
                        >
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              Kategori *
                            </label>
                            <input
                              type="text"
                              value={group.category}
                              onChange={e => {
                                const next = [...techStack]
                                next[idx] = {
                                  ...group,
                                  category: e.target.value,
                                }
                                setTechStack(next)
                              }}
                              placeholder="f.eks. Kjøremiljø & Leveranse"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div className="sm:col-span-7">
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              Teknologier (komma-separert) *
                            </label>
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
                              placeholder="Kubernetes, Argo CD, Terraform, Cilium"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div className="flex items-end justify-end sm:col-span-1">
                            <button
                              type="button"
                              onClick={() =>
                                setTechStack(prev =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              title="Fjern kategori"
                              aria-label="Fjern kategori"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team Members & Access Management */}
                <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Nøkkelpersoner / Plattformteam
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Kontaktpersoner i plattformteamet. Foredragsholdere fra
                        fagdager vises også automatisk på profilen.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {canAddCurrentUser && (
                        <button
                          type="button"
                          onClick={addCurrentUserToTeam}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-teal-600/30 bg-teal-50 px-2.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 dark:border-teal-400/30 dark:bg-teal-950/40 dark:text-teal-300"
                        >
                          <UserPlusIcon className="h-3.5 w-3.5" />
                          <span>Legg til meg selv ({currentUser?.name})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setTeam(prev => [
                            ...prev,
                            { name: '', role: '', slackUrl: '', github: '' },
                          ])
                        }
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        <span>Legg til person</span>
                      </button>
                    </div>
                  </div>

                  {/* Team Onboarding & Access Explanation */}
                  <div className="mt-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                      <div className="space-y-1.5">
                        <p>
                          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
                            Tilgang og team-administrasjon:
                          </strong>{' '}
                          {memberDomains.length > 0 ? (
                            <>
                              Alle i teamet (inkludert innleide konsulenter) bør
                              bruke virksomhetens e-postdomene (
                              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                                {memberDomains.map(d => `@${d}`).join(', ')}
                              </span>
                              ) på Slack-kontoen sin i Offentlig PaaS for å få
                              automatisk redigeringstilgang. Legg inn{' '}
                              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                                Slack-ID eller Slack-URL
                              </strong>{' '}
                              på kontaktpersonene under for å koble profilbilde
                              og direkte Slack-lenke til profilen.
                            </>
                          ) : (
                            <>
                              Legg inn{' '}
                              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                                Slack-ID eller Slack-URL
                              </strong>{' '}
                              på kontaktpersonene under for å gi dem
                              redigeringstilgang og vise profilbilde fra Slack.
                            </>
                          )}
                        </p>

                        {availableSpeakers.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                              Hurtigvalg fra tidligere fagdag-foredrag:
                            </span>
                            {availableSpeakers.map(sp => (
                              <button
                                key={sp.name}
                                type="button"
                                onClick={() => addSpeakerToTeam(sp)}
                                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                              >
                                <PlusIcon className="h-3 w-3" />
                                <span>{sp.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {team.length === 0 ? (
                    <p className="mt-3 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
                      Ingen faste nøkkelpersoner lagt til ennå. Klikk «Legg til
                      person» eller velg fra hurtigvalgene over.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {team.map((member, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-zinc-50/40 p-3.5 sm:grid-cols-12 dark:border-zinc-800 dark:bg-zinc-800/30"
                        >
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              Navn *
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={e => {
                                const next = [...team]
                                next[idx] = { ...member, name: e.target.value }
                                setTeam(next)
                              }}
                              placeholder="Ola Nordmann"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              Rolle / tittel *
                            </label>
                            <input
                              type="text"
                              value={member.role}
                              onChange={e => {
                                const next = [...team]
                                next[idx] = { ...member, role: e.target.value }
                                setTeam(next)
                              }}
                              placeholder="f.eks. Tech Lead / Plattformarkitekt"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              GitHub-bruker
                            </label>
                            <input
                              type="text"
                              value={member.github ?? ''}
                              onChange={e => {
                                const next = [...team]
                                next[idx] = {
                                  ...member,
                                  github: e.target.value,
                                }
                                setTeam(next)
                              }}
                              placeholder="brukernavn"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div className="flex items-end gap-2 sm:col-span-3">
                            <div className="min-w-0 flex-1">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Slack-ID eller URL
                              </label>
                              <input
                                type="text"
                                value={member.slackUrl ?? ''}
                                onChange={e => {
                                  const next = [...team]
                                  next[idx] = {
                                    ...member,
                                    slackUrl: e.target.value,
                                  }
                                  setTeam(next)
                                }}
                                placeholder="U0437... eller Slack-URL"
                                className={INPUT_CLASS}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setTeam(prev =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              title="Fjern person"
                              aria-label="Fjern person"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Relevante lenker
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Dokumentasjon, GitHub-repos, teknologiblogger eller
                        utviklerportaler.
                      </p>
                    </div>
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
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Ny lenke</span>
                    </button>
                  </div>

                  {links.length === 0 ? (
                    <p className="mt-2.5 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
                      Ingen ekstra lenker lagt til ennå.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {links.map((link, idx) => (
                        <div
                          key={idx}
                          className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/40 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30"
                        >
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                            <div className="sm:col-span-5">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Tittel *
                              </label>
                              <input
                                type="text"
                                value={link.title}
                                onChange={e => {
                                  const next = [...links]
                                  next[idx] = { ...link, title: e.target.value }
                                  setLinks(next)
                                }}
                                placeholder="f.eks. Teknisk dokumentasjon"
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Type
                              </label>
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
                                className={SELECT_CLASS}
                              >
                                {PROFILE_LINK_TYPES.map(t => (
                                  <option key={t} value={t}>
                                    {LINK_TYPE_LABELS_NO[t]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="sm:col-span-4">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                URL *
                              </label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={e => {
                                  const next = [...links]
                                  next[idx] = { ...link, url: e.target.value }
                                  setLinks(next)
                                }}
                                placeholder="https://..."
                                className={INPUT_CLASS}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                            <div className="sm:col-span-11">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Kort beskrivelse (valgfri)
                              </label>
                              <input
                                type="text"
                                value={link.description}
                                onChange={e => {
                                  const next = [...links]
                                  next[idx] = {
                                    ...link,
                                    description: e.target.value,
                                  }
                                  setLinks(next)
                                }}
                                placeholder="Hva finner man på denne lenken?"
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div className="flex items-end justify-end sm:col-span-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setLinks(prev =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                title="Fjern lenke"
                                aria-label="Fjern lenke"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Open Positions */}
                <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Ledige stillinger i plattformteamet
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Fremhev ledige stillinger direkte på organisasjonens
                        profilside.
                      </p>
                    </div>
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
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Ny stilling</span>
                    </button>
                  </div>

                  {openPositions.length === 0 ? (
                    <p className="mt-2.5 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
                      Ingen aktive stillingsutlysninger lagt til ennå.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {openPositions.map((job, idx) => (
                        <div
                          key={idx}
                          className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/40 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30"
                        >
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                            <div className="sm:col-span-5">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Stillingstittel *
                              </label>
                              <input
                                type="text"
                                value={job.title}
                                onChange={e => {
                                  const next = [...openPositions]
                                  next[idx] = { ...job, title: e.target.value }
                                  setOpenPositions(next)
                                }}
                                placeholder="Senior Platform Engineer"
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Avdeling / Team *
                              </label>
                              <input
                                type="text"
                                value={job.department}
                                onChange={e => {
                                  const next = [...openPositions]
                                  next[idx] = {
                                    ...job,
                                    department: e.target.value,
                                  }
                                  setOpenPositions(next)
                                }}
                                placeholder="Plattform og sky"
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Arbeidssted
                              </label>
                              <input
                                type="text"
                                value={job.location}
                                onChange={e => {
                                  const next = [...openPositions]
                                  next[idx] = {
                                    ...job,
                                    location: e.target.value,
                                  }
                                  setOpenPositions(next)
                                }}
                                placeholder="Oslo / Hybrid"
                                className={INPUT_CLASS}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                            <div className="sm:col-span-5">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Lenke til utlysning (URL) *
                              </label>
                              <input
                                type="url"
                                value={job.url}
                                onChange={e => {
                                  const next = [...openPositions]
                                  next[idx] = { ...job, url: e.target.value }
                                  setOpenPositions(next)
                                }}
                                placeholder="https://arbeidsplassen.nav.no/..."
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Stikkord (komma-separert)
                              </label>
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
                                placeholder="Kubernetes, Go, GCP"
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Søknadsfrist
                              </label>
                              <input
                                type="text"
                                value={job.deadline ?? ''}
                                onChange={e => {
                                  const next = [...openPositions]
                                  next[idx] = {
                                    ...job,
                                    deadline: e.target.value,
                                  }
                                  setOpenPositions(next)
                                }}
                                placeholder="Fortløpende"
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div className="flex items-end justify-end sm:col-span-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenPositions(prev =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                title="Fjern stilling"
                                aria-label="Fjern stilling"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50/80 px-4 py-3.5 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/80">
            <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">
              Profilsynlighet:{' '}
              <strong className="font-semibold text-zinc-700 dark:text-zinc-200">
                {visibility === 'public'
                  ? 'Offentlig'
                  : 'Kun innloggede medlemmer'}
              </strong>
            </span>
            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg border border-zinc-300 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={upsertMutation.isPending}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500 disabled:opacity-50"
              >
                {upsertMutation.isPending
                  ? 'Lagrer...'
                  : 'Lagre plattformprofil'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
