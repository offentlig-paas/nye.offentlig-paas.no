import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminEventNav } from '@/components/AdminEventNav'
import { getEvent, getTalksCount, canUserAccessEvent } from '@/lib/events/helpers'
import { formatDateTime } from '@/lib/formatDate'
import { createCaller } from '@/server/root'
import { AdminEventProvider } from '@/contexts/AdminEventContext'
import { SHIMMER_CLASS as shimmer } from '@/lib/admin-ui'
import { requireAdmin } from '@/lib/auth-guards'

interface AdminEventLayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

function NavSkeleton() {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700">
      <nav className="-mb-px flex space-x-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4"
          >
            <div className={`h-5 w-5 ${shimmer}`} />
            <div className={`h-4 w-16 ${shimmer}`} />
          </div>
        ))}
      </nav>
    </div>
  )
}

async function AdminEventContent({
  slug,
  event,
  children,
}: {
  slug: string
  event: ReturnType<typeof getEvent> & {}
  children: React.ReactNode
}) {
  const caller = await createCaller()
  const [eventDetails, photos, submissionsCount] = await Promise.all([
    caller.admin.events.getDetails({ slug }),
    caller.admin.photos.list({ slug }),
    caller.admin.talkSubmissions.getCount({ slug }),
  ])

  const photosCount = photos.length
  const feedbackCount = eventDetails.stats.feedbackSummary?.totalResponses ?? 0
  const talksCount = getTalksCount(eventDetails.schedule)

  return (
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
          submissionsCount={submissionsCount}
          showSubmissions={!!event.callForPapersEnabled}
        />
        {children}
      </div>
    </AdminEventProvider>
  )
}

export default async function AdminEventLayout({
  children,
  params,
}: AdminEventLayoutProps) {
  const { slug } = await params

  const event = getEvent(slug)
  if (!event) {
    notFound()
  }

  const session = await requireAdmin()
  if (!canUserAccessEvent(event, session.user)) {
    notFound()
  }

  return (
    <AdminLayout
      title={event.title}
      intro={`${formatDateTime(event.start.toISOString())} · ${event.location}`}
      backButton={{
        href: '/admin/events',
        label: 'Tilbake til fagdager',
      }}
    >
      <Suspense fallback={<NavSkeleton />}>
        <AdminEventContent slug={slug} event={event}>
          {children}
        </AdminEventContent>
      </Suspense>
    </AdminLayout>
  )
}
