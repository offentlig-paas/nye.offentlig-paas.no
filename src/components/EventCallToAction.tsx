import Link from 'next/link'
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/20/solid'
import { events } from '@/data/events'
import { getStatus } from '@/lib/events/helpers'
import { Status } from '@/lib/events/types'
import { formatDateLong, formatTimeRange } from '@/lib/formatDate'

export function EventCallToAction({ slug }: { slug: string }) {
  const event = events.find(e => e.slug === slug)
  if (!event) return null

  const status = getStatus(event)
  if (status === Status.Past) return null

  return (
    <div className="not-prose my-10">
      <Link
        href={`/fagdag/${event.slug}`}
        className="group block rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-teal-500" />
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            {status === Status.Current ? 'Pågår nå' : 'Kommende arrangement'}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {event.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4 text-zinc-400" />
            {formatDateLong(event.start)}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4 text-zinc-400" />
            {formatTimeRange(event.start, event.end)}
          </span>
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-4 w-4 text-zinc-400" />
            {event.location}
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {event.ingress}
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-teal-600 dark:text-teal-400">
          Meld deg på
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="ml-1 h-4 w-4 stroke-current"
          >
            <path
              d="M6.75 5.75 9.25 8l-2.5 2.25"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  )
}
