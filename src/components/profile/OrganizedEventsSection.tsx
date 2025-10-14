import Link from 'next/link'
import {
  CalendarIcon,
  MapPinIcon,
  Cog6ToothIcon,
} from '@heroicons/react/20/solid'
import { formatDateLong } from '@/lib/formatDate'
import type { Event } from '@/lib/events/types'

interface OrganizedEventsSectionProps {
  events: Event[]
}

export function OrganizedEventsSection({
  events,
}: OrganizedEventsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mine arrangerte fagdager
      </h2>
      {events.length > 0 ? (
        <div className="mt-6 space-y-3">
          {events.map(event => (
            <div
              key={event.slug}
              className="group relative rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
            >
              <Link href={`/fagdag/${event.slug}`} className="block">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {event.title}
                </h3>
                <div className="mt-2 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDateLong(event.start)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    {event.location}
                  </span>
                </div>
              </Link>
              <Link
                href={`/admin/events/${event.slug}`}
                className="absolute top-4 right-4 rounded-md p-1.5 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                title="Administrer fagdag"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Ingen arrangerte fagdager
        </p>
      )}
    </section>
  )
}
