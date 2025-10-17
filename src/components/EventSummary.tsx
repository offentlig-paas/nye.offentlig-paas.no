import {
  CalendarDaysIcon,
  MapPinIcon,
  BanknotesIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import { formatDateTime } from '@/lib/formatDate'
import { Status, AttendanceTypeDisplay } from '@/lib/events/types'
import type { Event } from '@/lib/events/types'
import clsx from 'clsx'

function EventStatus({ status }: { status: Status }) {
  const statusClass = (status: Status) => {
    switch (status) {
      case Status.Upcoming:
        return 'bg-blue-50 text-blue-600 ring-blue-600/20 dark:bg-blue-950/20 dark:text-blue-400 dark:ring-blue-400/20'
      case Status.Past:
        return 'bg-gray-50 text-gray-600 ring-gray-600/20 dark:bg-gray-800/50 dark:text-gray-400 dark:ring-gray-400/20'
      case Status.Current:
        return 'bg-yellow-50 text-yellow-600 ring-yellow-600/20 dark:bg-yellow-950/20 dark:text-yellow-400 dark:ring-yellow-400/20'
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-600/20 dark:bg-gray-800/50 dark:text-gray-400 dark:ring-gray-400/20'
    }
  }

  const statusText = (status: Status) => {
    switch (status) {
      case Status.Upcoming:
        return 'Kommende'
      case Status.Past:
        return 'Tidligere'
      case Status.Current:
        return 'Pågående'
      default:
        return 'Ukjent'
    }
  }

  return (
    <dd
      className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}
    >
      {statusText(status)}
    </dd>
  )
}
interface EventSummaryProps {
  event: Event
  status: Status
  className?: string
}

export function EventSummary({ event, status, className }: EventSummaryProps) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5',
        className
      )}
    >
      <dl className="flex flex-wrap">
        <div className="flex-auto px-6 pt-6">
          <dd className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Fagdag
          </dd>
        </div>
        <div className="flex-none self-start px-6 pt-6">
          <dt className="sr-only">Status</dt>
          <EventStatus status={status} />
        </div>
        <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6 dark:border-gray-400/5">
          <dt className="flex-none">
            <span className="sr-only">Lokasjon</span>
            <MapPinIcon
              className="h-6 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </dt>
          <dd className="text-base leading-6 font-medium text-gray-900 dark:text-gray-100">
            {event.location}
          </dd>
        </div>
        <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
          <dt className="flex-none">
            <span className="sr-only">Start</span>
            <CalendarDaysIcon
              className="h-6 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </dt>
          <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            <ul>
              <li>
                <time dateTime={event.start.toISOString()}>
                  {formatDateTime(event.start)}
                </time>
              </li>
              <li>
                <time dateTime={event.end.toISOString()}>
                  {formatDateTime(event.end)}
                </time>
              </li>
            </ul>
          </dd>
        </div>
        <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
          <dt className="flex-none">
            <span className="sr-only">Deltakere</span>
            <UserGroupIcon
              className="h-6 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </dt>
          <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {event.audience}
          </dd>
        </div>
        <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
          <dt className="flex-none">
            <span className="sr-only">Deltakelse</span>
            <UsersIcon
              className="h-6 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </dt>
          <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {event.registration.attendanceTypes
              .map(type => AttendanceTypeDisplay[type])
              .join(', ')}
          </dd>
        </div>
        <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-6">
          <dt className="flex-none">
            <span className="sr-only">Pris</span>
            <BanknotesIcon
              className="h-6 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </dt>
          <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {event.price ?? 'Ingen deltakeravgift'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
