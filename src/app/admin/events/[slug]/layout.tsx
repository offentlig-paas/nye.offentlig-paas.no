import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-guards'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminEventNav } from '@/components/AdminEventNav'
import { getEvent, getTalksCount } from '@/lib/events/helpers'
import { createCaller } from '@/server/root'
import { AdminEventProvider } from '@/contexts/AdminEventContext'

interface AdminEventLayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export default async function AdminEventLayout({
  children,
  params,
}: AdminEventLayoutProps) {
  await requireAdmin()

  const { slug } = await params

  // Verify event exists
  const event = getEvent(slug)
  if (!event) {
    notFound()
  }

  // Fetch data once for all child pages
  const caller = await createCaller()
  const [eventDetails, photos] = await Promise.all([
    caller.admin.events.getDetails({ slug }),
    caller.admin.photos.list({ slug }),
  ])

  const photosCount = photos.length
  const feedbackCount = eventDetails.stats.feedbackSummary?.totalResponses ?? 0
  const talksCount = getTalksCount(eventDetails.schedule)

  return (
    <AdminLayout
      title={eventDetails.title}
      intro={`${eventDetails.date} · ${eventDetails.location}`}
      backButton={{
        href: '/admin/events',
        label: 'Tilbake til fagdager',
      }}
    >
      <AdminEventProvider
        value={{
          slug,
          eventDetails,
          photosCount,
        }}
      >
        <div className="space-y-4">
          <AdminEventNav
            eventSlug={slug}
            eventStartTime={eventDetails.startTime}
            attendeesCount={eventDetails.stats.activeRegistrations}
            talksCount={talksCount}
            photosCount={photosCount}
            feedbackCount={feedbackCount}
            showFeedback={feedbackCount > 0}
          />
          {children}
        </div>
      </AdminEventProvider>
    </AdminLayout>
  )
}
