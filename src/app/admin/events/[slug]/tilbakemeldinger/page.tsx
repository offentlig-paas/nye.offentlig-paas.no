import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getEvent, canUserAccessEvent } from '@/lib/events/helpers'
import { SimpleLayout } from '@/components/SimpleLayout'
import { AdminEventFeedback } from '@/components/AdminEventFeedback'

interface AdminEventFeedbackPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminEventFeedbackPage({
  params,
}: AdminEventFeedbackPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    notFound()
  }

  const hasAccess = canUserAccessEvent(event, session.user)
  if (!hasAccess) {
    redirect('/admin/events')
  }

  return (
    <SimpleLayout
      title={event.title}
      intro="Tilbakemeldinger fra deltakere"
      backButton={{
        href: `/admin/events/${slug}`,
        label: 'Tilbake til arrangement',
      }}
    >
      <div className="mx-auto max-w-7xl">
        <AdminEventFeedback eventSlug={slug} />
      </div>
    </SimpleLayout>
  )
}
