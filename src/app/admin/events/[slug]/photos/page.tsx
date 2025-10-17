import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { SimpleLayout } from '@/components/SimpleLayout'
import { AdminEventPhotos } from '@/components/AdminEventPhotos'
import { getEvent, canUserAccessEvent } from '@/lib/events/helpers'

interface AdminEventPhotosPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminEventPhotosPage({
  params,
}: AdminEventPhotosPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin) {
    redirect('/')
  }

  const { slug } = await params

  const event = getEvent(slug)
  if (!event) {
    notFound()
  }

  const hasAccess = canUserAccessEvent(event, session.user)
  if (!hasAccess) {
    redirect('/')
  }

  return (
    <SimpleLayout
      title={`Bilder: ${event.title}`}
      intro="Last opp og administrer bilder fra fagdagen"
      backButton={{
        href: `/admin/events/${slug}`,
        label: 'Tilbake til administrasjon',
      }}
    >
      <AdminEventPhotos slug={slug} event={event} />
    </SimpleLayout>
  )
}
