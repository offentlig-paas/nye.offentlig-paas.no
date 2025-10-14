import Link from 'next/link'
import { formatDateLong } from '@/lib/formatDate'
import type { Event } from '@/lib/events/types'
import type { EventRegistration } from '@/domains/event-registration/types'

interface PastEventWithRegistration {
  event: Event
  registration: EventRegistration
}

interface PastRegistrationsSectionProps {
  events: PastEventWithRegistration[]
}

export function PastRegistrationsSection({
  events,
}: PastRegistrationsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mine tidligere påmeldinger
      </h2>
      {events.length > 0 ? (
        <div className="mt-6 space-y-3">
          {events.map(item => (
            <Link
              key={item.event.slug}
              href={`/fagdag/${item.event.slug}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.event.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {item.registration.status === 'attended' && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Deltok
                    </span>
                  )}
                  {item.registration.status === 'confirmed' && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Påmeldt
                    </span>
                  )}
                  {item.registration.status === 'no-show' && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      Møtte ikke
                    </span>
                  )}
                  {item.registration.status === 'cancelled' && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                      Avmeldt
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {formatDateLong(item.event.start)} • {item.event.location}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Ingen tidligere påmeldinger
        </p>
      )}
    </section>
  )
}
