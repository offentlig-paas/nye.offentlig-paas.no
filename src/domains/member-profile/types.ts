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
    email?: string
    slackId?: string
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

const platformCapabilitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  titleEn: z.string().default(''),
  category: z.enum(CAPABILITY_CATEGORIES),
  maturity: z.enum(['production', 'beta', 'planned']),
  selfService: z.boolean().default(true),
  description: z.string().min(1),
  descriptionEn: z.string().default(''),
  highlights: z.array(z.string()).default([]),
  highlightsEn: z.array(z.string()).optional(),
})

const cncfProjectUsageSchema = z.object({
  name: z.string().min(1),
  tier: z.enum(CNCF_MATURITY_TIERS),
  category: z.enum(CNCF_PROJECT_CATEGORIES),
  usage: z.string().min(1),
  usageEn: z.string().default(''),
  cncfUrl: z.string().url(),
  sourceRepoUrl: z.string().url().optional().or(z.literal('')),
  sinceYear: z.number().int().min(2014).max(2035).optional(),
})

const techStackGroupSchema = z.object({
  category: z.string().min(1),
  categoryEn: z.string().default(''),
  items: z.array(z.string()).default([]),
})

const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  roleEn: z.string().optional(),
  slackUrl: z.string().url().optional().or(z.literal('')),
  github: z.string().optional(),
})

const openPositionSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  deadline: z.string().optional(),
  url: z.string().url(),
  tags: z.array(z.string()).default([]),
})

const profileLinkSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  url: z.string().url(),
  type: z.enum(PROFILE_LINK_TYPES),
})

const profileStatSchema = z.object({
  label: z.string().min(1),
  labelEn: z.string().default(''),
  value: z.string().min(1),
  detail: z.string().optional(),
})

const manifestExampleSchema = z.object({
  title: z.string().min(1),
  titleEn: z.string().default(''),
  filename: z.string().min(1),
  description: z.string().default(''),
  descriptionEn: z.string().default(''),
  code: z.string().min(1),
})

export const upsertMemberProfileSchema = z.object({
  slug: z.string().min(1),
  platformName: z.string().min(1),
  platformDescription: z.string().min(1),
  platformHref: z.string().url(),
  platformLabel: z.string().min(1),
  platformLogo: z.string().optional(),
  theme: z.object({
    accentColor: z.enum(PROFILE_ACCENT_COLORS),
    heroStyle: z.enum(PROFILE_HERO_STYLES),
    sectionOrder: z.array(z.enum(PROFILE_SECTION_IDS)).min(1),
  }),
  tagline: z.string().default(''),
  taglineEn: z.string().default(''),
  about: z.string().default(''),
  aboutEn: z.string().default(''),
  cncfEndUserMember: z.boolean().default(false),
  openSourceFirst: z.boolean().default(true),
  cloudProviders: z.array(z.string()).default([]),
  stats: z.array(profileStatSchema).default([]),
  manifestExample: manifestExampleSchema.optional(),
  capabilities: z.array(platformCapabilitySchema).default([]),
  cncfProjects: z.array(cncfProjectUsageSchema).default([]),
  techStack: z.array(techStackGroupSchema).default([]),
  team: z.array(teamMemberSchema).default([]),
  openPositions: z.array(openPositionSchema).default([]),
  links: z.array(profileLinkSchema).default([]),
})

export type UpsertMemberProfileInput = z.infer<typeof upsertMemberProfileSchema>
