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
import { AdminEmptyState } from '@/components/AdminEmptyState'
import { Badge } from '@/components/Badge'
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-2xl border border-zinc-200/80 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
          <button
            onClick={() => setView('upcoming')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              view === 'upcoming'
                ? 'bg-white font-semibold text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Kommende ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setView('past')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              view === 'past'
                ? 'bg-white font-semibold text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <ArchiveBoxIcon className="h-4 w-4 text-zinc-400" />
            Tidligere ({pastEvents.length})
          </button>
        </div>

        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {displayedEvents.length} fagdager
        </div>
      </div>

      {/* Events Grid */}
      {displayedEvents.length === 0 ? (
        <AdminEmptyState
          icon={CalendarIcon}
          title={
            view === 'upcoming'
              ? 'Ingen kommende fagdager'
              : 'Ingen tidligere fagdager'
          }
          description={
            view === 'upcoming'
              ? 'Det er ingen planlagte fagdager.'
              : 'Det er ingen avholdte fagdager.'
          }
        />
      ) : (
        <div className="space-y-4">
          {displayedEvents.map(event => (
            <Link
              key={event.slug}
              href={`/admin/events/${event.slug}`}
              className="block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-800 dark:hover:border-zinc-600"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
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
                      <Badge color="green" className="gap-1.5 px-3 py-1">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Kommende
                      </Badge>
                    ) : (
                      <Badge color="zinc" className="gap-1.5 px-3 py-1">
                        <ArchiveBoxIcon className="h-3.5 w-3.5" />
                        Avholdt
                      </Badge>
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
                      <Badge color="blue" className="gap-1">
                        <VideoCameraIcon className="h-3 w-3" />
                        Opptak tilgjengelig
                      </Badge>
                    )}
                    {event.feedbackRating && (
                      <Badge color="yellow" className="gap-1">
                        <StarIcon className="h-3 w-3" />
                        {event.feedbackRating.toFixed(1)}/5 av{' '}
                        {event.feedbackRespondents}
                      </Badge>
                    )}
                    {event.scheduleItemCount > 0 && (
                      <Badge color="green" className="gap-1">
                        <ChatBubbleLeftIcon className="h-3 w-3" />
                        {event.scheduleItemCount} programpunkter
                      </Badge>
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
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-700/50 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
      </div>
      <div className="mt-1.5">
        <div className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </div>
        {subtitle && (
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
