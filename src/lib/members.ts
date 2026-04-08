import { logoManifest } from '@/data/logo-manifest'

export enum MemberType {
  // Central government ministries and agencies
  DIRECTORATE = 'Direktorat',
  AGENCY = 'Etat',
  GOVERNMENT_AGENCY = 'Forvaltningsorgan',

  // Research and educational institutions
  UNIVERSITY = 'Universitet',
  RESEARCH_INSTITUTE = 'Forskningsinstitusjon',

  // Local government
  MUNICIPALITY = 'Kommune',
  COUNTY = 'Fylkeskommune',

  // State-owned enterprises and companies
  STATE_ENTERPRISE = 'Statlig foretak',
  STATE_COMPANY = 'Statseid selskap',
  MUNICIPAL_COMPANY = 'Kommunalt selskap',

  // Other public sector organizations
  PUBLIC_CORPORATION = 'Offentlig virksomhet',
  OTHER = 'Andre',
}

export enum Sector {
  TRANSPORT = 'Transport',
  HEALTH = 'Helse',
  ENERGY = 'Energi',
  EDUCATION = 'Utdanning og forskning',
  JUSTICE = 'Justis og beredskap',
  FINANCE = 'Finans og økonomi',
  DIGITAL = 'Digitalisering',
  ENVIRONMENT = 'Miljø og klima',
  CULTURE = 'Kultur og medier',
  DEFENSE = 'Forsvar og sikkerhet',
  AGRICULTURE = 'Landbruk og mat',
  GENERAL = 'Generell forvaltning',
}

interface MemberPlatform {
  name: string
  description: string
  href: string
  label: string
  logo: string
}

interface iMember {
  name: string
  type: MemberType
  sectors: Sector[]
  domains?: string[]
  slug?: string
  logoKey?: string
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string
  platform?: MemberPlatform
}

export class Member implements iMember {
  name: string
  type: MemberType
  sectors: Sector[]
  domains: string[]
  slug?: string
  logoKey?: string
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string
  platform?: MemberPlatform

  constructor({
    name,
    type,
    sectors,
    domains,
    slug,
    logoKey,
    logoBackgroundColor,
    github,
    homepage,
    linkedinUrl,
    platform,
  }: iMember) {
    this.name = name
    this.type = type
    this.sectors = sectors
    this.domains = domains ?? []
    this.slug = slug
    this.logoKey = logoKey
    this.logoBackgroundColor = logoBackgroundColor
    this.homepage = homepage
    this.linkedinUrl = linkedinUrl
    this.github = github
    this.platform = platform
  }

  image(size: number = 200) {
    const key = this.logoKey ?? this.slug
    if (key) {
      const entry = logoManifest[key]
      if (entry) {
        if (entry.hasMark) return `/logos/${key}-mark.svg`
        return `/logos/${key}.${entry.ext}`
      }
    }
    if (this.github) return `https://github.com/${this.github}.png?size=${size}`
    return ''
  }
}
