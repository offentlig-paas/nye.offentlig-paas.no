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

const PROFILE_VISIBILITY_OPTIONS = ['public', 'internal'] as const
export type ProfileVisibility = (typeof PROFILE_VISIBILITY_OPTIONS)[number]

const PLATFORM_ACCESS_TYPES = ['public', 'internal'] as const
export type PlatformAccessType = (typeof PLATFORM_ACCESS_TYPES)[number]

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
  logoUrl?: string
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
  visibility: ProfileVisibility
  platformAccess: PlatformAccessType
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
  visibility: ProfileVisibility
  platformAccess: PlatformAccessType
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

export interface CncfCatalogItem {
  name: string
  aliases?: string[]
  tier: CncfMaturityTier
  category: CncfProjectCategory
  cncfUrl: string
  sourceRepoUrl: string
  logoUrl: string
  description: string
}

export const CNCF_PROJECT_CATALOG: CncfCatalogItem[] = [
  {
    name: 'Kubernetes',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
    sourceRepoUrl: 'https://github.com/kubernetes/kubernetes',
    logoUrl:
      'https://landscape.cncf.io/logos/e0303fdc381c96c1b4461ad1a2437c8f050cfb856fcb8710c9104367ca60f316.svg',
    description:
      'Kjerneorkestrering for applikasjonsklynger med deklarative API-er.',
  },
  {
    name: 'Argo CD',
    aliases: ['Argo'],
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/argo/',
    sourceRepoUrl: 'https://github.com/argoproj/argo-cd',
    logoUrl:
      'https://landscape.cncf.io/logos/ba71fd50cbc06c7bad3554de23cbca4298593141df3842003a94065c209610f4.svg',
    description:
      'Deklarativ GitOps kontinuerlig leveranse og utrulling til Kubernetes.',
  },
  {
    name: 'Flux',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/flux/',
    sourceRepoUrl: 'https://github.com/fluxcd/flux2',
    logoUrl:
      'https://landscape.cncf.io/logos/c513f673e1c90ff7826a7aa6065452b4bade9bd731db2e05675b74d6f5940d49.svg',
    description:
      'Kontinuerlig leveranse og GitOps-synkronisering for Kubernetes-klynger.',
  },
  {
    name: 'Cilium',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/cilium/',
    sourceRepoUrl: 'https://github.com/cilium/cilium',
    logoUrl:
      'https://landscape.cncf.io/logos/6b052d96054bbe311b0429d2267d60b92b1c5e6527e6646c0bf2fc06a55e2f43.svg',
    description:
      'eBPF-basert nettverk (CNI), nettverkspolicy og trafikkobservability.',
  },
  {
    name: 'Istio',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/istio/',
    sourceRepoUrl: 'https://github.com/istio/istio',
    logoUrl:
      'https://landscape.cncf.io/logos/2d881599f6faed0a16840a675049bd10ce7096134d93df3f533aaf91972a9689.svg',
    description:
      'Service mesh for mTLS, trafikkstyring og telemetri mellom tjenester.',
  },
  {
    name: 'Linkerd',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/linkerd/',
    sourceRepoUrl: 'https://github.com/linkerd/linkerd2',
    logoUrl:
      'https://landscape.cncf.io/logos/f1940543e59719e7ce1929d7bf6004b9fc56db3a6a59a2dc6f0db16c789b28ac.svg',
    description:
      'Lettvekts service mesh for automatisk mTLS, telemetri og pålitelighet.',
  },
  {
    name: 'Envoy',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/envoy/',
    sourceRepoUrl: 'https://github.com/envoyproxy/envoy',
    logoUrl:
      'https://landscape.cncf.io/logos/1cb1ec893e39b60f7d14dc76c6cc1e597b24be0161c0bdf9f97442fcb8d331f9.svg',
    description:
      'Høyytelses edge- og tjenesteproxy for skybaserte plattformer.',
  },
  {
    name: 'CoreDNS',
    tier: 'Graduated',
    category: 'Networking & Service Mesh',
    cncfUrl: 'https://www.cncf.io/projects/coredns/',
    sourceRepoUrl: 'https://github.com/coredns/coredns',
    logoUrl:
      'https://landscape.cncf.io/logos/9f366c2d009f0fc6fa4dd5fbfc4dbb462f3d20a09c534d3e4ced67dcb9b092b1.svg',
    description:
      'Fleksibel DNS-tjener og tjenesteoppslag i Kubernetes-klynger.',
  },
  {
    name: 'Prometheus',
    tier: 'Graduated',
    category: 'Observability',
    cncfUrl: 'https://www.cncf.io/projects/prometheus/',
    sourceRepoUrl: 'https://github.com/prometheus/prometheus',
    logoUrl:
      'https://landscape.cncf.io/logos/4d6a2b87a6c9a01ed1b82cef5db978e273adb99fda44d47e5dae48f75207147c.svg',
    description:
      'Innsamling av tidsseriemetrikker og varsling for infrastruktur og applikasjoner.',
  },
  {
    name: 'OpenTelemetry',
    tier: 'Graduated',
    category: 'Observability',
    cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
    sourceRepoUrl: 'https://github.com/open-telemetry/community',
    logoUrl:
      'https://landscape.cncf.io/logos/52818595352a47637721976b546e0a2a1d0da186a0eb97ec203bd7e5248eb4fc.svg',
    description:
      'Standardisert instrumentering og innsamling av spor, metrikker og logger.',
  },
  {
    name: 'Jaeger',
    tier: 'Graduated',
    category: 'Observability',
    cncfUrl: 'https://www.cncf.io/projects/jaeger/',
    sourceRepoUrl: 'https://github.com/jaegertracing/jaeger',
    logoUrl:
      'https://landscape.cncf.io/logos/5877af58428f6cd35e6dc2df2afe82af3b90853bd191670a60111e6e8c01ea54.svg',
    description:
      'Distribuert sporing og feilsøking av mikrotjenestearkitektur.',
  },
  {
    name: 'Fluentd',
    tier: 'Graduated',
    category: 'Observability',
    cncfUrl: 'https://www.cncf.io/projects/fluentd/',
    sourceRepoUrl: 'https://github.com/fluent/fluentd',
    logoUrl:
      'https://landscape.cncf.io/logos/af80830c567373db3566d11fc8f42f7a2648a58db4f11163fa143042ce515b04.svg',
    description:
      'Innsamling og videresending av applikasjons- og klyngelogger.',
  },
  {
    name: 'Thanos',
    tier: 'Incubating',
    category: 'Observability',
    cncfUrl: 'https://www.cncf.io/projects/thanos/',
    sourceRepoUrl: 'https://github.com/thanos-io/thanos',
    logoUrl:
      'https://landscape.cncf.io/logos/0246c435a220238574280479dfd919e033309178693f308b8c14bbb088eb0ac1.svg',
    description:
      'Høytilgjengelig Prometheus-oppsett med langtidslagring på tvers av klynger.',
  },
  {
    name: 'Cert-Manager',
    aliases: ['cert-manager'],
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/cert-manager/',
    sourceRepoUrl: 'https://github.com/cert-manager/cert-manager',
    logoUrl:
      'https://landscape.cncf.io/logos/781162dfd40606ace7e76f727bb24f3222ac6878f7bdb129a1082b533f3f8be7.svg',
    description:
      'Automatisk utstedelse og fornyelse av TLS-sertifikater i Kubernetes.',
  },
  {
    name: 'Kyverno',
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/kyverno/',
    sourceRepoUrl: 'https://github.com/kyverno/kyverno',
    logoUrl:
      'https://landscape.cncf.io/logos/cd16e4a1d4b1b2b785530124b090d2fe64cbe2ce0f4d80e1bb968c45bb35af0b.svg',
    description:
      'Kubernetes-native policy-motor for validering, mutering og sikring av laster.',
  },
  {
    name: 'Open Policy Agent (OPA)',
    aliases: ['OPA', 'Gatekeeper'],
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/open-policy-agent-opa/',
    sourceRepoUrl: 'https://github.com/open-policy-agent/opa',
    logoUrl:
      'https://landscape.cncf.io/logos/c6d473cc6a37ca7850f1f787e5e1eefd1c898c0b288b1c895e663561aa3de387.svg',
    description:
      'Deklarativ policy-motor for tilgangskontroll og admission control.',
  },
  {
    name: 'External Secrets Operator',
    aliases: ['external-secrets'],
    tier: 'Sandbox',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/external-secrets-operator/',
    sourceRepoUrl: 'https://github.com/external-secrets/external-secrets',
    logoUrl:
      'https://landscape.cncf.io/logos/07686e3ac9335c6071c003bba42cc984b1bbef6feaa1b6ed02626937968d6e3b.svg',
    description:
      'Synkroniserer hemmeligheter fra eksterne hvelv til Kubernetes Secrets.',
  },
  {
    name: 'Harbor',
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/harbor/',
    sourceRepoUrl: 'https://github.com/goharbor/harbor',
    logoUrl:
      'https://landscape.cncf.io/logos/de4f2dfd628db72e7d482ff0d9d22f0615f800a222ce7c8d6d2b5a147da77883.svg',
    description:
      'Container-register med sårbarhetsskanning og signering av artefakter.',
  },
  {
    name: 'Falco',
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/falco/',
    sourceRepoUrl: 'https://github.com/falcosecurity/falco',
    logoUrl:
      'https://landscape.cncf.io/logos/4b03a845c7d926abfb00df4ed9c16fc5a024b700fa1aea4984b1d8393550d46d.svg',
    description:
      'Kjøretidssikkerhet og sanntids trusseldeteksjon for containere og kjerne.',
  },
  {
    name: 'Keycloak',
    tier: 'Incubating',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/keycloak/',
    sourceRepoUrl: 'https://github.com/keycloak/keycloak',
    logoUrl:
      'https://landscape.cncf.io/logos/e7ec76aed9cec7e65927f9f8cf4e675d49e79154c45c504a5cd6da1fdaecfc2d.svg',
    description:
      'Identitets- og tilgangsstyring (IAM) med OIDC, OAuth 2.0 og SAML.',
  },
  {
    name: 'SPIFFE',
    tier: 'Graduated',
    category: 'Security & Policy',
    cncfUrl: 'https://www.cncf.io/projects/spiffe/',
    sourceRepoUrl: 'https://github.com/spiffe/spiffe',
    logoUrl:
      'https://landscape.cncf.io/logos/e649cd82385a7f0758eb272631b7d91493001b6864a6538b73cbee6.svg',
    description:
      'Kryptografisk tjenesteidentitet for Zero Trust mellom arbeidsbelastninger.',
  },
  {
    name: 'Backstage',
    tier: 'Incubating',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/backstage/',
    sourceRepoUrl: 'https://github.com/backstage/backstage',
    logoUrl:
      'https://landscape.cncf.io/logos/041229aa6e716c8d0beb5752747b4789f42dc3239c245c6cf3af8d5cf651b1ee.svg',
    description:
      'Utviklerportal med tjenestekatalog, dokumentasjon og selvbetjeningsmaler.',
  },
  {
    name: 'Crossplane',
    tier: 'Graduated',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/crossplane/',
    sourceRepoUrl: 'https://github.com/crossplane/crossplane',
    logoUrl:
      'https://landscape.cncf.io/logos/c43855293d114dcad77461e7e5af20cf26023e365619f5d4abb54942b51ffc8a.svg',
    description:
      'Kubernetes-basert kontrollplan for deklarativ provisjonering av skyressurser.',
  },
  {
    name: 'Helm',
    tier: 'Graduated',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/helm/',
    sourceRepoUrl: 'https://github.com/helm/helm',
    logoUrl:
      'https://landscape.cncf.io/logos/caf58dcdb373502573c954e0aa3e03e725c12ffec5f8fe183c7f174b71357dd5.svg',
    description: 'Pakkehåndtering for utrulling av plattformkomponenter.',
  },
  {
    name: 'Tekton',
    tier: 'Incubating',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/tekton/',
    sourceRepoUrl: 'https://github.com/tektoncd/pipeline',
    logoUrl:
      'https://landscape.cncf.io/logos/6435e589e94c6cef2a892324f822f41cf57da43dfb6a4d7c6ef8bfd537086d20.svg',
    description:
      'Kubernetes-native rammeverk for CI/CD-bygg og leveransepipelines.',
  },
  {
    name: 'Dapr',
    tier: 'Graduated',
    category: 'Platform & App Definition',
    cncfUrl: 'https://www.cncf.io/projects/dapr/',
    sourceRepoUrl: 'https://github.com/dapr/dapr',
    logoUrl:
      'https://landscape.cncf.io/logos/5b3a3f211aae4c129ca1aa9bf3cf52cf12fc7fe5a3c6bc44744ca45ccd697597.svg',
    description:
      'Portabel runtime for hendelsesdrevne og distribuerte applikasjoner.',
  },
  {
    name: 'KEDA',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/keda/',
    sourceRepoUrl: 'https://github.com/kedacore/keda',
    logoUrl:
      'https://landscape.cncf.io/logos/c87a77d52e0b19e58b98012864dbd5d963a4c4d97c767b15e074d30077104b12.svg',
    description: 'Hendelsesdrevet autoskalering av containere i Kubernetes.',
  },
  {
    name: 'Knative',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/knative/',
    sourceRepoUrl: 'https://github.com/knative/serving',
    logoUrl:
      'https://landscape.cncf.io/logos/6a1b7572490f95cada1836b3e0f932e5ff10c683bc1167b08ff868fb7867cfd5.svg',
    description:
      'Serverless-applikasjonslag med skalering til null og hendelsesruting.',
  },
  {
    name: 'containerd',
    tier: 'Graduated',
    category: 'Orchestration & GitOps',
    cncfUrl: 'https://www.cncf.io/projects/containerd/',
    sourceRepoUrl: 'https://github.com/containerd/containerd',
    logoUrl:
      'https://landscape.cncf.io/logos/f26381b645b2f14293a2a597bc98b5bbe1e5e086029de41830ba7c667353bf3e.svg',
    description: 'Standard container-runtime på klyngenoder.',
  },
  {
    name: 'CloudNativePG',
    tier: 'Sandbox',
    category: 'Storage & Data',
    cncfUrl: 'https://www.cncf.io/projects/cloudnativepg/',
    sourceRepoUrl: 'https://github.com/cloudnative-pg/cloudnative-pg',
    logoUrl:
      'https://landscape.cncf.io/logos/d795f87b2810954c88802c0b4bd6b3eee5a840c32cbee7276b25831cfb09e1cd.svg',
    description:
      'Kubernetes-operator for høytilgjengelige PostgreSQL-databaser.',
  },
  {
    name: 'NATS',
    tier: 'Incubating',
    category: 'Storage & Data',
    cncfUrl: 'https://www.cncf.io/projects/nats/',
    sourceRepoUrl: 'https://github.com/nats-io/nats-server',
    logoUrl:
      'https://landscape.cncf.io/logos/96862eb7542174f9ffeca0d2965f0c30d45675896983d9c4e17e9b8f4306f2c5.svg',
    description:
      'Sanntids meldingsbuss og strømming for distribuerte tjenester.',
  },
  {
    name: 'Strimzi',
    tier: 'Incubating',
    category: 'Storage & Data',
    cncfUrl: 'https://www.cncf.io/projects/strimzi/',
    sourceRepoUrl: 'https://github.com/strimzi/strimzi-kafka-operator',
    logoUrl:
      'https://landscape.cncf.io/logos/7d10ac8a7224e5d1cce99d7e0c16ea0f48b434c0461139c48a4f8b1477b5400a.svg',
    description: 'Deklarativ drift av Apache Kafka-klynger på Kubernetes.',
  },
  {
    name: 'Rook',
    tier: 'Graduated',
    category: 'Storage & Data',
    cncfUrl: 'https://www.cncf.io/projects/rook/',
    sourceRepoUrl: 'https://github.com/rook/rook',
    logoUrl:
      'https://landscape.cncf.io/logos/d08d5a49647bd660e74f90a4ff4f46524f35a4463b65090f4bcc513e577922b2.svg',
    description: 'Lagringsorkestrering av Ceph på Kubernetes.',
  },
  {
    name: 'Longhorn',
    tier: 'Incubating',
    category: 'Storage & Data',
    cncfUrl: 'https://www.cncf.io/projects/longhorn/',
    sourceRepoUrl: 'https://github.com/longhorn/longhorn',
    logoUrl:
      'https://landscape.cncf.io/logos/acd3d31cbdf0aa2ef2d695fa4a3571e6d232a96214ec33fe0b2022b9719c244c.svg',
    description: 'Distribuert blokklagring for Kubernetes.',
  },
  {
    name: 'etcd',
    tier: 'Graduated',
    category: 'Storage & Data',
    cncfUrl: 'https://www.cncf.io/projects/etcd/',
    sourceRepoUrl: 'https://github.com/etcd-io/etcd',
    logoUrl:
      'https://landscape.cncf.io/logos/0d8c081f2c074582caafefe4b135388d3e62c6e64ca1faf2058743c9d784f14f.svg',
    description: 'Distribuert nøkkel-verdi-lager for klyngetilstand.',
  },
]

export function getCncfProjectMeta(name: string): CncfCatalogItem | undefined {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return undefined
  return CNCF_PROJECT_CATALOG.find(
    item =>
      item.name.toLowerCase() === normalized ||
      item.aliases?.some(alias => alias.toLowerCase() === normalized)
  )
}

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

const slackProfileUrlSchema = z
  .string()
  .trim()
  .max(500)
  .transform(val => {
    if (!val) return ''
    if (/^[UW][A-Z0-9]{6,}$/i.test(val)) {
      return `https://offentlig-paas-no.slack.com/team/${val.toUpperCase()}`
    }
    return val.replace(/\/+$/, '')
  })
  .refine(
    val => {
      if (!val) return true
      try {
        const parsed = new URL(val)
        return (
          parsed.protocol === 'https:' &&
          (parsed.hostname === 'slack.com' ||
            parsed.hostname.endsWith('.slack.com')) &&
          /^\/team\/[UW][A-Z0-9]{6,}$/i.test(parsed.pathname)
        )
      } catch {
        return false
      }
    },
    {
      message:
        'Oppgi en gyldig Slack-ID (f.eks. U0123ABC) eller Slack-profil-URL (https://offentlig-paas-no.slack.com/team/...)',
    }
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
  logoUrl: safeLogoSchema.optional().or(z.literal('')),
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
  slackUrl: slackProfileUrlSchema.optional().or(z.literal('')),
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

export const upsertMemberProfileSchema = z
  .object({
    slug: z.string().min(1).max(80),
    visibility: z.enum(PROFILE_VISIBILITY_OPTIONS).default('public'),
    platformAccess: z.enum(PLATFORM_ACCESS_TYPES).default('public'),
    platformName: z.string().min(1).max(150),
    platformDescription: z.string().min(1).max(1000),
    platformHref: httpUrlSchema.optional().or(z.literal('')).default(''),
    platformLabel: z.string().max(150).default(''),
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
  .superRefine((data, ctx) => {
    if (data.platformAccess === 'public') {
      if (!data.platformHref || !data.platformHref.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['platformHref'],
          message: 'URL må oppgis for åpne plattformer',
        })
      }
      if (!data.platformLabel || !data.platformLabel.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['platformLabel'],
          message: 'Lenke-etikett må oppgis for åpne plattformer',
        })
      }
    }
  })

export type UpsertMemberProfileInput = z.infer<typeof upsertMemberProfileSchema>
