import { Suspense } from 'react'
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

function AdminEventLayoutSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4"
            >
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </nav>
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}

async function AdminEventLayoutContent({
  params,
  children,
}: {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}) {
  const { slug } = await params
  await requireAdmin()

  const event = getEvent(slug)
  if (!event) {
    notFound()
  }

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
            submissionsCount={submissionsCount}
            showSubmissions={!!event.callForPapersEnabled}
          />
          {children}
        </div>
      </AdminEventProvider>
    </AdminLayout>
  )
}

export default function AdminEventLayout({
  children,
  params,
}: AdminEventLayoutProps) {
  return (
    <Suspense fallback={<AdminEventLayoutSkeleton />}>
      <AdminEventLayoutContent params={params}>
        {children}
      </AdminEventLayoutContent>
    </Suspense>
  )
}
