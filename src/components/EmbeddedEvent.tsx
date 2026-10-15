import Link from 'next/link'
import { getEvent, getStatus } from '@/lib/events/helpers'
import { EventSummary } from './EventSummary'
import { EventAgenda } from './EventAgenda'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

interface EmbeddedEventProps {
  slug: string
  showAgenda?: boolean
}

export function EmbeddedEvent({ slug, showAgenda = true }: EmbeddedEventProps) {
  const event = getEvent(slug)
  if (!event) {
    return null
  }

  const status = getStatus(event)

  return (
    <div className="not-prose my-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Link
            href={`/fagdag/${event.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {event.title}
          </Link>
        </h3>
        <Link
          href={`/fagdag/${event.slug}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Se arrangementsside
          <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <EventSummary event={event} status={status} />
      {showAgenda && event.schedule.length > 0 && (
        <div className="overflow-hidden rounded-xl bg-white px-6 py-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
          <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
            Program
          </h4>
          <EventAgenda schedule={event.schedule} attachments={new Map()} />
        </div>
      )}
    </div>
  )
}
