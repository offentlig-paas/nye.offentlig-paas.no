'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  StarIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArchiveBoxIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import { AdminEventStatCard } from '@/components/AdminEventStatCard'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type RouterOutput = inferRouterOutputs<AppRouter>
type EventsData = RouterOutput['admin']['events']['list']
type Event = EventsData['events'][0]

interface AdminEventsClientProps {
  eventsData: EventsData
}

export function AdminEventsClient({ eventsData }: AdminEventsClientProps) {
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming')

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date()
    const upcoming: Event[] = []
    const past: Event[] = []

    eventsData.events.forEach(event => {
      const eventDate = new Date(event.startDate)
      if (eventDate > now) {
        upcoming.push(event)
      } else {
        past.push(event)
      }
    })

    return {
      upcomingEvents: upcoming,
      pastEvents: past,
    }
  }, [eventsData])

  const displayedEvents = view === 'upcoming' ? upcomingEvents : pastEvents

  return (
    <>
      {/* Overall Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminEventStatCard
          label="Totalt fagdager"
          value={eventsData.totalStats.totalEvents}
          icon={CalendarIcon}
          color="blue"
        />
        <AdminEventStatCard
          label="Totalt påmeldinger"
          value={eventsData.totalStats.totalRegistrations}
          icon={UsersIcon}
          color="green"
        />
        <AdminEventStatCard
          label="Unike organisasjoner"
          value={eventsData.totalStats.uniqueOrganisations}
          icon={BuildingOfficeIcon}
          color="purple"
        />
      </div>

      {/* View Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => setView('upcoming')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === 'upcoming'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <SparklesIcon className="h-4 w-4" />
            Kommende ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setView('past')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === 'past'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <ArchiveBoxIcon className="h-4 w-4" />
            Tidligere ({pastEvents.length})
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {displayedEvents.length} fagdager
        </div>
      </div>

      {/* Events Grid */}
      {displayedEvents.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            {view === 'upcoming'
              ? 'Ingen kommende fagdager'
              : 'Ingen tidligere fagdager'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {view === 'upcoming'
              ? 'Det er ingen planlagte fagdager.'
              : 'Det er ingen avholdte fagdager.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedEvents.map(event => (
            <Link
              key={event.slug}
              href={`/admin/events/${event.slug}`}
              className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-4 w-4" />
                            <span>{event.date}</span>
                          </div>
                          {event.location && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">
                                •
                              </span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {view === 'upcoming' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Kommende
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <ArchiveBoxIcon className="h-3.5 w-3.5" />
                        Avholdt
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {/* Upcoming Event Metrics */}
                  {view === 'upcoming' && (
                    <>
                      <MetricCard
                        icon={UsersIcon}
                        label="Påmeldte"
                        value={event.totalRegistrations}
                        color="blue"
                      />
                      <MetricCard
                        icon={BuildingOfficeIcon}
                        label="Organisasjoner"
                        value={event.uniqueOrganisations}
                        color="purple"
                      />
                      <MetricCard
                        icon={ChatBubbleLeftIcon}
                        label="Programpunkter"
                        value={event.scheduleItemCount || 0}
                        color="green"
                      />
                      <MetricCard
                        icon={UsersIcon}
                        label="Arrangører"
                        value={event.organizerCount}
                        color="orange"
                      />
                    </>
                  )}

                  {/* Past Event Metrics */}
                  {view === 'past' && (
                    <>
                      <MetricCard
                        icon={UsersIcon}
                        label={
                          event.statsParticipants ? 'Deltakere' : 'Påmeldinger'
                        }
                        value={
                          event.statsParticipants || event.totalRegistrations
                        }
                        color="blue"
                      />
                      <MetricCard
                        icon={BuildingOfficeIcon}
                        label="Organisasjoner"
                        value={
                          event.statsOrganisations || event.uniqueOrganisations
                        }
                        color="purple"
                      />
                      {event.feedbackRating ? (
                        <MetricCard
                          icon={StarIcon}
                          label="Vurdering"
                          value={`${event.feedbackRating.toFixed(1)}/5`}
                          color="yellow"
                          subtitle={`${event.feedbackRespondents} svar`}
                        />
                      ) : (
                        <MetricCard
                          icon={StarIcon}
                          label="Tilbakemelding"
                          value="-"
                          color="gray"
                        />
                      )}
                      {event.hasRecording ? (
                        <MetricCard
                          icon={VideoCameraIcon}
                          label="Opptak"
                          value="✓"
                          color="green"
                        />
                      ) : (
                        <MetricCard
                          icon={ChatBubbleLeftIcon}
                          label="Program"
                          value={event.scheduleItemCount || 0}
                          color="orange"
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Additional Info for Past Events */}
                {view === 'past' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.hasRecording && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <VideoCameraIcon className="h-3 w-3" />
                        Opptak tilgjengelig
                      </span>
                    )}
                    {event.feedbackRating && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <StarIcon className="h-3 w-3" />
                        {event.feedbackRating.toFixed(1)}/5 av{' '}
                        {event.feedbackRespondents}
                      </span>
                    )}
                    {event.scheduleItemCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <ChatBubbleLeftIcon className="h-3 w-3" />
                        {event.scheduleItemCount} programpunkter
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: 'blue' | 'green' | 'orange' | 'yellow' | 'purple' | 'red' | 'gray'
  subtitle?: string
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green:
      'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    orange:
      'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    yellow:
      'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    purple:
      'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    gray: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
  }

  const textColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-400',
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 p-2 dark:border-gray-700 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <Icon className={`h-4 w-4 ${textColorClasses[color]}`} />
      </div>
      <div className="mt-1.5">
        <div className={`text-lg font-bold ${textColorClasses[color]}`}>
          {value}
        </div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
