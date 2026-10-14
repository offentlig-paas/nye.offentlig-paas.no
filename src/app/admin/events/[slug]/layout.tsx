import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminEventNav } from '@/components/AdminEventNav'
import {
  getEvent,
  getTalksCount,
  canUserAccessEvent,
  getStatus,
} from '@/lib/events/helpers'
import { Status } from '@/lib/events/types'
import { formatDateTime } from '@/lib/formatDate'
import { createCaller } from '@/server/root'
import { AdminEventProvider } from '@/contexts/AdminEventContext'
import { SHIMMER_CLASS as shimmer } from '@/lib/admin-ui'
import { requireAuth } from '@/lib/auth-guards'
import { Badge } from '@/components/Badge'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

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

  const session = await requireAuth()
  if (!canUserAccessEvent(event, session.user)) {
    notFound()
  }

  const isPast = getStatus(event) === Status.Past

  return (
    <AdminLayout
      title={event.title}
      intro={`${formatDateTime(event.start.toISOString())} · ${event.location}`}
      backButton={{
        href: '/admin/events',
        label: 'Tilbake til fagdager',
      }}
      badge={
        <div className="flex items-center gap-2">
          <Badge color={isPast ? 'zinc' : 'teal'}>
            {isPast ? 'Avholdt' : 'Kommende'}
          </Badge>
          {!event.registration.disabled && (
            <Badge color="green">Påmelding åpen</Badge>
          )}
        </div>
      }
      actions={
        <a
          href={`/arrangementer/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
        >
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-zinc-400" />
          <span>Offentlig side</span>
        </a>
      }
    >
      <Suspense fallback={<NavSkeleton />}>
        <AdminEventContent slug={slug} event={event}>
          {children}
        </AdminEventContent>
      </Suspense>
    </AdminLayout>
  )
}
