import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/Container'
import { members } from '@/data/members'
import {
  memberProfileService,
  getMemberBySlug,
  getMemberEventContributions,
} from '@/domains/member-profile'
import {
  MemberProfileShowcase,
  type SerializedMember,
} from '@/components/MemberProfileShowcase'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const member = getMemberBySlug(slug)
  if (!member) {
    return { title: 'Medlem ikke funnet' }
  }

  const profile = await memberProfileService.getBySlug(member.getSlug())
  const title = profile?.platformName
    ? `${member.name} (${profile.platformName}) - Medlemsprofil`
    : `${member.name} - Medlemsprofil`

  return {
    title,
    description:
      profile?.tagline ||
      profile?.platformDescription ||
      `Medlemsprofil for ${member.name} i Offentlig PaaS`,
  }
}

export default async function MemberProfilePage({ params }: Props) {
  const { slug } = await params
  const member = getMemberBySlug(slug)

  if (!member) {
    notFound()
  }

  const canonicalSlug = member.getSlug()
  const [profile, platformSummaries] = await Promise.all([
    memberProfileService.getBySlug(canonicalSlug),
    memberProfileService.listPlatformSummaries(),
  ])

  const { talks, organizedEventsCount, uniqueSpeakers } =
    getMemberEventContributions(member)

  const serializedMember: SerializedMember = {
    name: member.name,
    slug: canonicalSlug,
    type: member.type,
    sectors: member.sectors,
    domains: member.domains,
    logo: member.image(),
    logoBackgroundColor: member.logoBackgroundColor,
    github: member.github,
    homepage: member.homepage,
    linkedinUrl: member.linkedinUrl,
    platform: profile?.platformName
      ? {
          name: profile.platformName,
          description: profile.platformDescription,
          href: profile.platformHref,
          label: profile.platformLabel,
          logo: profile.platformLogo,
        }
      : undefined,
  }

  const showcaseSlugs = platformSummaries
    .map(summary => {
      const m = members.find(item => item.getSlug() === summary.slug)
      if (!m) return null
      return {
        slug: summary.slug,
        name: m.name,
        platformName: summary.name,
      }
    })
    .filter(
      (
        item
      ): item is {
        slug: string
        name: string
        platformName: string
      } => item !== null
    )

  return (
    <Container className="mt-12 sm:mt-16">
      <MemberProfileShowcase
        member={serializedMember}
        profile={profile ?? undefined}
        talks={talks}
        organizedEventsCount={organizedEventsCount}
        uniqueSpeakers={uniqueSpeakers}
        showcaseSlugs={showcaseSlugs}
      />
    </Container>
  )
}
