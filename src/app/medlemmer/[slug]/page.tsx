import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Container } from '@/components/Container'
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
  searchParams?: Promise<{ edit?: string }>
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

export default async function MemberProfilePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const member = getMemberBySlug(slug)

  if (!member) {
    notFound()
  }

  const canonicalSlug = member.getSlug()
  if (resolvedSearchParams?.edit === '1') {
    redirect(`/medlemmer/${canonicalSlug}/rediger`)
  }

  const session = await auth()
  const isAuthenticated = Boolean(session?.user)
  const rawProfile = await memberProfileService.getBySlug(canonicalSlug, {
    includeInternal: true,
  })

  const isInternalRestricted =
    rawProfile?.visibility === 'internal' && !isAuthenticated
  const profile = isInternalRestricted ? null : rawProfile

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

  return (
    <Container className="mt-12 sm:mt-16">
      <MemberProfileShowcase
        member={serializedMember}
        profile={profile ?? undefined}
        isInternalRestricted={isInternalRestricted}
        talks={talks}
        organizedEventsCount={organizedEventsCount}
        uniqueSpeakers={uniqueSpeakers}
      />
    </Container>
  )
}
