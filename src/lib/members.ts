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

interface iMember {
  name: string
  /** Abbreviation for space-restricted UI */
  shortName?: string
  /** Alternative spellings and old names, used when matching free text */
  aliases?: string[]
  type: MemberType
  sectors: Sector[]
  domains?: string[]
  slug?: string
  logoKey?: string
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string
}

function normalizeName(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb')
}

export class Member implements iMember {
  name: string
  shortName?: string
  aliases: string[]
  type: MemberType
  sectors: Sector[]
  domains: string[]
  slug?: string
  logoKey?: string
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string

  constructor({
    name,
    shortName,
    aliases,
    type,
    sectors,
    domains,
    slug,
    logoKey,
    logoBackgroundColor,
    github,
    homepage,
    linkedinUrl,
  }: iMember) {
    this.name = name
    this.shortName = shortName
    this.aliases = aliases ?? []
    this.type = type
    this.sectors = sectors
    this.domains = domains ?? []
    this.slug = slug
    this.logoKey = logoKey
    this.logoBackgroundColor = logoBackgroundColor
    this.homepage = homepage
    this.linkedinUrl = linkedinUrl
    this.github = github
  }

  getDisplayName(short = false): string {
    return (short && this.shortName) || this.name
  }

  /** Name, short name and aliases, for matching and search */
  getNames(): string[] {
    return [
      this.name,
      ...(this.shortName ? [this.shortName] : []),
      ...this.aliases,
    ]
  }

  matchesName(text: string): boolean {
    const n = normalizeName(text)
    return this.getNames().some(name => normalizeName(name) === n)
  }

  getSlug(): string {
    if (this.slug) return this.slug
    return this.name
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
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
