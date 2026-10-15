import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { auth } from '@/auth'
import { Container } from '@/components/Container'
import {
  memberProfileService,
  getMemberBySlug,
  getMemberEventContributions,
  canUserEditMemberProfile,
} from '@/domains/member-profile'
import {
  type EditorTab,
  MemberProfileEditorModal,
} from '@/components/MemberProfileEditorModal'

type Props = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ tab?: string }>
}

const VALID_TABS = new Set<EditorTab>([
  'general',
  'capabilities',
  'cncf',
  'stats',
  'more',
])

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const member = getMemberBySlug(slug)
  if (!member) {
    return { title: 'Medlem ikke funnet' }
  }

  return {
    title: `Rediger plattformprofil – ${member.name}`,
    description: `Rediger plattformprofil, kapabiliteter, CNCF-prosjekter og team for ${member.name}`,
  }
}

export default async function EditMemberProfilePage({
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
  const session = await auth()

  if (!session?.user) {
    redirect(
      `/auth/signin?callbackUrl=${encodeURIComponent(`/medlemmer/${canonicalSlug}/rediger`)}`
    )
  }

  const profile = await memberProfileService.getBySlug(canonicalSlug, {
    includeInternal: true,
  })

  const access = canUserEditMemberProfile(member, session.user, profile)
  if (!access.canEdit) {
    redirect(`/medlemmer/${canonicalSlug}`)
  }

  const { uniqueSpeakers } = getMemberEventContributions(member)
  const requestedTab = resolvedSearchParams?.tab as EditorTab | undefined
  const initialTab: EditorTab =
    requestedTab && VALID_TABS.has(requestedTab) ? requestedTab : 'general'

  const userEmailDomain = session.user.email?.split('@')[1]?.toLowerCase()

  return (
    <Container className="mt-8 pb-16 sm:mt-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href={`/medlemmer/${canonicalSlug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Tilbake til {member.name}</span>
          </Link>
        </div>

        <MemberProfileEditorModal
          mode="page"
          initialTab={initialTab}
          memberSlug={canonicalSlug}
          memberName={member.name}
          memberDomains={member.domains}
          memberGithub={member.github}
          memberHomepage={member.homepage}
          userEmailDomain={userEmailDomain}
          isAdmin={Boolean(session.user.isAdmin)}
          accessReason={access.reason}
          currentUser={{
            name: session.user.name || '',
            email: session.user.email || '',
            slackId: session.user.slackId || '',
            title: session.user.title || '',
          }}
          uniqueSpeakers={uniqueSpeakers}
          initialProfile={profile ?? undefined}
        />
      </div>
    </Container>
  )
}
