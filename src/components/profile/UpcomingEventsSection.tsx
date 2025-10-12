import Link from 'next/link'
import { CalendarIcon, MapPinIcon } from '@heroicons/react/20/solid'
import { formatDateLong } from '@/lib/formatDate'
import type { Event } from '@/lib/events/types'
import type { EventRegistration } from '@/domains/event-registration/types'

interface UpcomingEventWithMeta {
  event: Event
  registration?: EventRegistration
  priority: number
  isOrganizer: boolean
  isSpeaker: boolean
  isAttending: boolean
}

interface UpcomingEventsSectionProps {
  events: UpcomingEventWithMeta[]
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mine kommende fagdager
      </h2>
      {events.length > 0 ? (
        <div className="mt-6 space-y-4">
          {events.map((item, index) => (
            <div
              key={`upcoming-${index}-${item.event.slug}`}
              className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="mb-3 flex flex-wrap gap-2">
                {item.isOrganizer && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Arrangør
                  </span>
                )}
                {item.isSpeaker && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Foredragsholder
                  </span>
                )}
                {item.isAttending && !item.isOrganizer && !item.isSpeaker && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Påmeldt
                  </span>
                )}
              </div>
              <Link
                href={`/fagdag/${item.event.slug}`}
                className="text-lg font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
              >
                {item.event.title}
              </Link>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDateLong(item.event.start)}
                </div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <MapPinIcon className="h-4 w-4" />
                  {item.event.location}
                </div>
              </div>
              {item.registration?.comments && (
                <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                  <p className="font-medium">Din kommentar:</p>
                  <p className="mt-1">{item.registration.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Ingen kommende fagdager
        </p>
      )}
    </section>
  )
}
