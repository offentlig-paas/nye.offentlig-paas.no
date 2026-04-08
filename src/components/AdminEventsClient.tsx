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
import { StatCard } from '@/components/StatCard'
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
        <StatCard
          label="Totalt fagdager"
          value={eventsData.totalStats.totalEvents}
          icon={CalendarIcon}
        />
        <StatCard
          label="Totalt påmeldinger"
          value={eventsData.totalStats.totalRegistrations}
          icon={UsersIcon}
        />
        <StatCard
          label="Unike organisasjoner"
          value={eventsData.totalStats.uniqueOrganisations}
          icon={BuildingOfficeIcon}
        />
      </div>

      {/* View Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <button
            onClick={() => setView('upcoming')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === 'upcoming'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700'
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
                : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            <ArchiveBoxIcon className="h-4 w-4" />
            Tidligere ({pastEvents.length})
          </button>
        </div>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {displayedEvents.length} fagdager
        </div>
      </div>

      {/* Events Grid */}
      {displayedEvents.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <CalendarIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" />
          <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
            {view === 'upcoming'
              ? 'Ingen kommende fagdager'
              : 'Ingen tidligere fagdager'}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
              className="block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-500"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-xl bg-teal-50 p-2 dark:bg-teal-900/30">
                        <CalendarIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          {event.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-4 w-4" />
                            <span>{event.date}</span>
                          </div>
                          {event.location && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-600">
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300">
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
                      />
                      <MetricCard
                        icon={BuildingOfficeIcon}
                        label="Organisasjoner"
                        value={event.uniqueOrganisations}
                      />
                      <MetricCard
                        icon={ChatBubbleLeftIcon}
                        label="Programpunkter"
                        value={event.scheduleItemCount || 0}
                      />
                      <MetricCard
                        icon={UsersIcon}
                        label="Arrangører"
                        value={event.organizerCount}
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
                      />
                      <MetricCard
                        icon={BuildingOfficeIcon}
                        label="Organisasjoner"
                        value={
                          event.statsOrganisations || event.uniqueOrganisations
                        }
                      />
                      {event.feedbackRating ? (
                        <MetricCard
                          icon={StarIcon}
                          label="Vurdering"
                          value={`${event.feedbackRating.toFixed(1)}/5`}
                          subtitle={`${event.feedbackRespondents} svar`}
                        />
                      ) : (
                        <MetricCard
                          icon={StarIcon}
                          label="Tilbakemelding"
                          value="-"
                        />
                      )}
                      {event.hasRecording ? (
                        <MetricCard
                          icon={VideoCameraIcon}
                          label="Opptak"
                          value="✓"
                        />
                      ) : (
                        <MetricCard
                          icon={ChatBubbleLeftIcon}
                          label="Program"
                          value={event.scheduleItemCount || 0}
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
  subtitle?: string
}

function MetricCard({ icon: Icon, label, value, subtitle }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-teal-50 p-2 dark:border-zinc-700 dark:bg-teal-900/20">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      </div>
      <div className="mt-1.5">
        <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
          {value}
        </div>
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </div>
        {subtitle && (
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
