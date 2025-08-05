import { ImageProps } from 'next/image'

export interface iMember {
  name: string
  type: string
  logo?: ImageProps['src']
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string
}

export class Member implements iMember {
  name: string
  type: string
  logo?: ImageProps['src']
  logoBackgroundColor?: string
  github?: string
  homepage?: string
  linkedinUrl?: string

  constructor({
    name,
    type,
    logo,
    logoBackgroundColor,
    github,
    homepage,
    linkedinUrl,
  }: iMember) {
    this.name = name
    this.type = type
    this.logo = logo
    this.logoBackgroundColor = logoBackgroundColor
    this.homepage = homepage
    this.linkedinUrl = linkedinUrl
    this.github = github
  }

  image(size: number = 200) {
    if (this.logo) return this.logo
    if (this.github) return `https://github.com/${this.github}.png?size=${size}`
    return ''
  }
}
