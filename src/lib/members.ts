import type { ImageProps } from 'next/image'

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

interface MemberPlatform {
  name: string
  description: string
  href: string
  label: string
  logo: ImageProps['src']
}

interface iMember {
  name: string
  type: MemberType
  logo?: ImageProps['src']
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string
  platform?: MemberPlatform
}

export class Member implements iMember {
  name: string
  type: MemberType
  logo?: ImageProps['src']
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string
  platform?: MemberPlatform

  constructor({
    name,
    type,
    logo,
    logoBackgroundColor,
    github,
    homepage,
    linkedinUrl,
    platform,
  }: iMember) {
    this.name = name
    this.type = type
    this.logo = logo
    this.logoBackgroundColor = logoBackgroundColor
    this.homepage = homepage
    this.linkedinUrl = linkedinUrl
    this.github = github
    this.platform = platform
  }

  image(size: number = 200) {
    if (this.logo) return this.logo
    if (this.github) return `https://github.com/${this.github}.png?size=${size}`
    return ''
  }
}
