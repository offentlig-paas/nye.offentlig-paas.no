'use client'

import Link from 'next/link'
import {
  CalendarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  StarIcon,
  VideoCameraIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type RouterOutput = inferRouterOutputs<AppRouter>
type EventsData = RouterOutput['admin']['events']['list']

interface AdminEventsClientProps {
  eventsData: EventsData
}

export function AdminEventsClient({ eventsData }: AdminEventsClientProps) {
  return (
    <>
      {/* Overall Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon
                  className="h-6 w-6 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Totalt fagdager
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventsData.totalStats.totalEvents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon
                  className="h-6 w-6 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Totalt påmeldinger
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventsData.totalStats.totalRegistrations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon
                  className="h-6 w-6 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Unike organisasjoner
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventsData.totalStats.uniqueOrganisations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {eventsData.events.map(event => (
            <li key={event.slug}>
              <Link
                href={`/admin/events/${event.slug}`}
                className="block transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        <span>{event.date}</span>
                        {event.location && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>

                      {/* Additional metrics row */}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <UserGroupIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                          <span>{event.audience}</span>
                        </div>

                        {event.organizerCount > 0 && (
                          <div className="flex items-center">
                            <PresentationChartLineIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>{event.organizerCount} arrangører</span>
                          </div>
                        )}

                        {event.scheduleItemCount > 0 && (
                          <div className="flex items-center">
                            <ChatBubbleLeftIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>
                              {event.scheduleItemCount} programpunkter
                            </span>
                          </div>
                        )}

                        {event.price && (
                          <div className="flex items-center">
                            <BanknotesIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>{event.price}</span>
                          </div>
                        )}

                        {event.hasRecording && (
                          <div className="flex items-center text-blue-600 dark:text-blue-400">
                            <VideoCameraIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>Opptak tilgjengelig</span>
                          </div>
                        )}

                        {event.feedbackRating && (
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                            <StarIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>
                              {event.feedbackRating.toFixed(1)}/5 (
                              {event.feedbackRespondents} tilbakemeldinger)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {event.totalRegistrations > 0
                            ? `${event.totalRegistrations} påmeldte`
                            : 'Ingen påmeldinger'}
                        </div>
                        {event.totalRegistrations > 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {event.uniqueOrganisations} organisasjoner
                          </div>
                        )}
                      </div>

                      {/* Show stats from events.ts if different from registration counts */}
                      {event.statsParticipants &&
                        event.statsParticipants !==
                          event.totalRegistrations && (
                          <div className="text-right">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              Faktiske deltakere: {event.statsParticipants}
                            </div>
                            {event.statsOrganisations &&
                              event.statsOrganisations !==
                                event.uniqueOrganisations && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {event.statsOrganisations} org. deltok
                                </div>
                              )}
                          </div>
                        )}

                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-gray-400 dark:text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {eventsData.events.length === 0 && (
        <div className="py-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            Ingen fagdager funnet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Det er ingen fagdager registrert ennå.
          </p>
        </div>
      )}
    </>
  )
}
