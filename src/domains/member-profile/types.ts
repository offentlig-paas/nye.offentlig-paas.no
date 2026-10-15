import { z } from 'zod'

export const PROFILE_ACCENT_COLORS = [
  'teal',
  'blue',
  'indigo',
  'emerald',
  'rose',
  'amber',
] as const
export type ProfileAccentColor = (typeof PROFILE_ACCENT_COLORS)[number]

export const PROFILE_HERO_STYLES = ['gradient', 'grid', 'minimal'] as const
export type ProfileHeroStyle = (typeof PROFILE_HERO_STYLES)[number]

const PROFILE_SECTION_IDS = [
  'capabilities',
  'cncf',
  'architecture',
  'team',
  'jobs',
  'talks',
] as const
export type ProfileSectionId = (typeof PROFILE_SECTION_IDS)[number]

export const CAPABILITY_CATEGORIES = [
  'compute',
  'security',
  'observability',
  'data',
  'dx',
  'cicd',
  'ai',
] as const
export type CapabilityCategory = (typeof CAPABILITY_CATEGORIES)[number]

export const CNCF_MATURITY_TIERS = [
  'Graduated',
  'Incubating',
  'Sandbox',
] as const
export type CncfMaturityTier = (typeof CNCF_MATURITY_TIERS)[number]

export const CNCF_PROJECT_CATEGORIES = [
  'Orchestration & GitOps',
  'Networking & Service Mesh',
  'Observability',
  'Security & Policy',
  'Platform & App Definition',
  'Storage & Data',
] as const
export type CncfProjectCategory = (typeof CNCF_PROJECT_CATEGORIES)[number]

export const PROFILE_LINK_TYPES = [
  'docs',
  'github',
  'blog',
  'careers',
  'status',
  'website',
] as const
type ProfileLinkType = (typeof PROFILE_LINK_TYPES)[number]

export interface PlatformCapability {
  id: string
  title: string
  titleEn: string
  category: CapabilityCategory
  maturity: 'production' | 'beta' | 'planned'
  selfService: boolean
  description: string
  descriptionEn: string
  highlights: string[]
  highlightsEn?: string[]
}

export interface CncfProjectUsage {
  name: string
  tier: CncfMaturityTier
  category: CncfProjectCategory
  usage: string
  usageEn: string
  cncfUrl: string
  sourceRepoUrl?: string
  sinceYear?: number
}

export interface TechStackGroup {
  category: string
  categoryEn: string
  items: string[]
}

export interface TeamMember {
  name: string
  role: string
  roleEn?: string
  slackUrl?: string
  github?: string
}

export interface OpenPosition {
  title: string
  department: string
  location: string
  deadline?: string
  url: string
  tags: string[]
}

export interface ProfileLink {
  title: string
  description: string
  url: string
  type: ProfileLinkType
}

export interface ProfileStat {
  label: string
  labelEn: string
  value: string
  detail?: string
}

interface DeclarativeManifestExample {
  title: string
  titleEn: string
  filename: string
  description: string
  descriptionEn: string
  code: string
}

export interface MemberProfile {
  _id?: string
  slug: string
  platformName: string
  platformDescription: string
  platformHref: string
  platformLabel: string
  platformLogo?: string
  verifiedUpdated: string
  updatedBy?: {
    name: string
  }
  theme: {
    accentColor: ProfileAccentColor
    heroStyle: ProfileHeroStyle
    sectionOrder: ProfileSectionId[]
  }
  tagline: string
  taglineEn: string
  about: string
  aboutEn: string
  cncfEndUserMember?: boolean
  openSourceFirst?: boolean
  cloudProviders: string[]
  stats: ProfileStat[]
  manifestExample?: DeclarativeManifestExample
  capabilities: PlatformCapability[]
  cncfProjects: CncfProjectUsage[]
  techStack: TechStackGroup[]
  team: TeamMember[]
  openPositions: OpenPosition[]
  links: ProfileLink[]
}

export interface MemberPlatformSummary {
  slug: string
  name: string
  description: string
  href: string
  label: string
  logo?: string
}

export interface MemberTalkContribution {
  eventSlug: string
  eventTitle: string
  eventDate: Date
  talkTitle: string
  talkDescription?: string
  speakers: { name: string; url?: string }[]
}

export const CAPABILITY_CATEGORY_LABELS: Record<
  CapabilityCategory,
  { no: string; en: string }
> = {
  compute: { no: 'Kjøremiljø', en: 'Compute & Runtime' },
  security: { no: 'Zero Trust & Sikkerhet', en: 'Zero Trust & Security' },
  observability: { no: 'Observability', en: 'Observability & SRE' },
  data: { no: 'Data & Meldinger', en: 'Managed Data & Messaging' },
  dx: { no: 'Utvikleropplevelse', en: 'Developer Experience' },
  cicd: { no: 'Leveranse & GitOps', en: 'Delivery & GitOps' },
  ai: { no: 'KI & Agenter', en: 'AI & Agentic Enablement' },
}

export const CNCF_PROJECT_CATALOG: Array<{
  name: string
  tier: CncfMaturityTier
  category: CncfProjectCategory
  cncfUrl: string
}> = [
  {
    name: 'Kubernetes',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
  },
  {
    name: 'Argo CD',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/argo/',
  },
  {
    name: 'Flux',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/flux/',
  },
  {
    name: 'Cilium',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/cilium/',
  },
  {
    name: 'Istio',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/istio/',
  },
  {
    name: 'Linkerd',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/linkerd/',
  },
  {
    name: 'Envoy',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/envoy/',
  },
  {
    name: 'Prometheus',
    tier: 'Graduated',
    category: 'Observability',
    cncfUrl: 'https://www.cncf.io/projects/prometheus/',
  },
  {
    name: 'OpenTelemetry',
    tier: 'Incubating',
    category: 'Observability',
    cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
  },
  {
    name: 'Cert-Manager',
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/cert-manager/',
  },
  {
    name: 'Kyverno',
    tier: 'Incubating',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/kyverno/',
  },
  {
    name: 'External Secrets Operator',
    tier: 'Incubating',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/external-secrets-operator/',
  },
  {
    name: 'Harbor',
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/harbor/',
  },
  {
    name: 'Falco',
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/falco/',
  },
  {
    name: 'Backstage',
    tier: 'Incubating',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/backstage/',
  },
  {
    name: 'Crossplane',
    tier: 'Incubating',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/crossplane/',
  },
  {
    name: 'Helm',
    tier: 'Graduated',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/helm/',
  },
  {
    name: 'KEDA',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/keda/',
  },
  {
    name: 'CloudNativePG',
    tier: 'Sandbox',
    category: 'Storage & Data',
    cncfUrl: 'https://www.cncf.io/projects/cloudnativepg/',
  },
]

const httpUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    val => {
      try {
        const parsed = new URL(val)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: 'URL må starte med http:// eller https://' }
  )

const safeLogoSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    val => {
      if (!val) return true
      if (val.startsWith('/') && !val.startsWith('//') && !val.includes('..')) {
        return true
      }
      try {
        const parsed = new URL(val)
        return parsed.protocol === 'https:'
      } catch {
        return false
      }
    },
    {
      message:
        'Logo må være en lokal sti (/images/...) eller en gyldig https:// URL',
    }
  )

const githubHandleSchema = z
  .string()
  .trim()
  .max(39)
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
    'Ugyldig GitHub-brukernavn'
  )

const platformCapabilitySchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  titleEn: z.string().max(200).default(''),
  category: z.enum(CAPABILITY_CATEGORIES),
  maturity: z.enum(['production', 'beta', 'planned']),
  selfService: z.boolean().default(true),
  description: z.string().min(1).max(1000),
  descriptionEn: z.string().max(1000).default(''),
  highlights: z.array(z.string().max(250)).max(15).default([]),
  highlightsEn: z.array(z.string().max(250)).max(15).optional(),
})

const cncfProjectUsageSchema = z.object({
  name: z.string().min(1).max(100),
  tier: z.enum(CNCF_MATURITY_TIERS),
  category: z.enum(CNCF_PROJECT_CATEGORIES),
  usage: z.string().min(1).max(1000),
  usageEn: z.string().max(1000).default(''),
  cncfUrl: httpUrlSchema,
  sourceRepoUrl: httpUrlSchema.optional().or(z.literal('')),
  sinceYear: z.number().int().min(2014).max(2035).optional(),
})

const techStackGroupSchema = z.object({
  category: z.string().min(1).max(150),
  categoryEn: z.string().max(150).default(''),
  items: z.array(z.string().max(100)).max(40).default([]),
})

const teamMemberSchema = z.object({
  name: z.string().min(1).max(150),
  role: z.string().min(1).max(150),
  roleEn: z.string().max(150).optional(),
  slackUrl: httpUrlSchema.optional().or(z.literal('')),
  github: githubHandleSchema.optional().or(z.literal('')),
})

const openPositionSchema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().min(1).max(150),
  location: z.string().min(1).max(150),
  deadline: z.string().max(100).optional(),
  url: httpUrlSchema,
  tags: z.array(z.string().max(60)).max(15).default([]),
})

const profileLinkSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(400).default(''),
  url: httpUrlSchema,
  type: z.enum(PROFILE_LINK_TYPES),
})

const profileStatSchema = z.object({
  label: z.string().min(1).max(150),
  labelEn: z.string().max(150).default(''),
  value: z.string().min(1).max(100),
  detail: z.string().max(200).optional(),
})

const manifestExampleSchema = z.object({
  title: z.string().min(1).max(200),
  titleEn: z.string().max(200).default(''),
  filename: z.string().min(1).max(100),
  description: z.string().max(600).default(''),
  descriptionEn: z.string().max(600).default(''),
  code: z.string().min(1).max(10000),
})

export const upsertMemberProfileSchema = z.object({
  slug: z.string().min(1).max(80),
  platformName: z.string().min(1).max(150),
  platformDescription: z.string().min(1).max(1000),
  platformHref: httpUrlSchema,
  platformLabel: z.string().min(1).max(150),
  platformLogo: safeLogoSchema.optional(),
  theme: z.object({
    accentColor: z.enum(PROFILE_ACCENT_COLORS),
    heroStyle: z.enum(PROFILE_HERO_STYLES),
    sectionOrder: z
      .array(z.enum(PROFILE_SECTION_IDS))
      .min(1)
      .max(PROFILE_SECTION_IDS.length)
      .refine(items => new Set(items).size === items.length, {
        message: 'Dupliserte seksjoner er ikke tillatt',
      }),
  }),
  tagline: z.string().max(500).default(''),
  taglineEn: z.string().max(500).default(''),
  about: z.string().max(4000).default(''),
  aboutEn: z.string().max(4000).default(''),
  cncfEndUserMember: z.boolean().default(false),
  openSourceFirst: z.boolean().default(true),
  cloudProviders: z.array(z.string().max(120)).max(15).default([]),
  stats: z.array(profileStatSchema).max(8).default([]),
  manifestExample: manifestExampleSchema.optional(),
  capabilities: z.array(platformCapabilitySchema).max(30).default([]),
  cncfProjects: z.array(cncfProjectUsageSchema).max(40).default([]),
  techStack: z.array(techStackGroupSchema).max(15).default([]),
  team: z.array(teamMemberSchema).max(40).default([]),
  openPositions: z.array(openPositionSchema).max(20).default([]),
  links: z.array(profileLinkSchema).max(20).default([]),
})

export type UpsertMemberProfileInput = z.infer<typeof upsertMemberProfileSchema>
