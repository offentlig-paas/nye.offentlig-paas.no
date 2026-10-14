'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ToastProvider'
import { generateRegistrationsCSV, downloadCSV } from '@/lib/csv-utils'
import { AdminSlackChannelManager } from '@/components/AdminSlackChannelManager'
import { ParticipantInfoEditor } from '@/components/ParticipantInfoEditor'
import { AdminEventChecklist } from '@/components/AdminEventChecklist'
import { AdminEventActions } from '@/components/AdminEventActions'
import { StatCard } from '@/components/StatCard'
import { Avatar } from '@/components/Avatar'
import { AddToSlackChannelButton } from '@/components/AddToSlackChannelButton'
import { getUniqueSpeakers, getTalksCount } from '@/lib/events/helpers'
import {
  StarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline'
import { getEventState } from '@/lib/events/state-machine'
import { useAdminEvent } from '@/contexts/AdminEventContext'
import type { EventParticipantInfo } from '@/lib/events/types'
import React from 'react'

interface AdminEventDetailsClientProps {
  initialParticipantInfo: EventParticipantInfo
}

export function AdminEventDetailsClient({
  initialParticipantInfo,
}: AdminEventDetailsClientProps) {
  const { slug, eventDetails, photosCount } = useAdminEvent()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const participantInfoData = initialParticipantInfo

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleExportCSV = () => {
    const csvContent = generateRegistrationsCSV(eventDetails.registrations)
    downloadCSV(csvContent, `${slug}-paemeldinger.csv`)
  }

  const talksCount = getTalksCount(eventDetails.schedule)
  const speakers = getUniqueSpeakers(eventDetails.schedule || [])

  const state = getEventState(eventDetails.startTime)
  const isPostEvent = state === 'POST_EVENT'

  // Calculate attendance type breakdown
  const socialCount = eventDetails.registrations.filter(
    r => r.attendingSocialEvent && r.status !== 'cancelled'
  ).length

  if (!eventDetails) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Key Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Påmeldte"
          value={eventDetails.stats.activeRegistrations}
          subtext={`${eventDetails.stats.uniqueOrganisations} organisasjoner${socialCount > 0 ? ` · ${socialCount} sosialt` : ''}`}
          icon={UsersIcon}
        />
        <StatCard
          label="Organisasjoner"
          value={eventDetails.stats.uniqueOrganisations}
          icon={BuildingOfficeIcon}
        />
        <StatCard
          label="Programposter"
          value={talksCount}
          subtext={`${speakers.length} foredragsholdere`}
          icon={PresentationChartLineIcon}
        />
        {isPostEvent && eventDetails.stats.feedbackSummary ? (
          <StatCard
            label="Snitt vurdering"
            value={eventDetails.stats.feedbackSummary.averageEventRating.toFixed(
              1
            )}
            subtext={`${eventDetails.stats.feedbackSummary.totalResponses} svar`}
            icon={StarIcon}
          />
        ) : (
          <StatCard
            label="Bidragsytere"
            value={eventDetails.organizers.length + speakers.length}
            subtext={`${eventDetails.organizers.length} arrangører · ${speakers.length} talere`}
            icon={UserGroupIcon}
          />
        )}
      </div>

      {/* Middle Section: Sjekkliste and Hurtighandlinger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Checklist */}
        <div className="lg:col-span-7 xl:col-span-8">
          <AdminEventChecklist
            eventDetails={eventDetails}
            eventSlug={slug}
            participantInfo={participantInfoData}
            photosCount={photosCount}
          />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-5 xl:col-span-4">
          <AdminEventActions
            eventSlug={slug}
            eventTitle={eventDetails.title}
            eventDate={eventDetails.date}
            eventStartTime={eventDetails.startTime}
            activeRegistrations={eventDetails.stats.activeRegistrations}
            attendedCount={eventDetails.stats.statusBreakdown.attended || 0}
            onExport={handleExportCSV}
            onSuccess={message => showSuccess('Sendt', message)}
            onError={message => showError('Feil', message)}
            variant="card"
          />
        </div>
      </div>

      {/* Bottom Section: 3-column structured operational grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1: Participant Info */}
        <div className="flex flex-col">
          <ParticipantInfoEditor
            slug={slug}
            initialData={participantInfoData}
            showSuccess={showSuccess}
            showError={showError}
          />
        </div>

        {/* Column 2: Contributors (Organizers & Speakers) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-700/80 dark:bg-zinc-800">
          <div>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <UserGroupIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                    Bidragsytere
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {eventDetails.organizers.length} arrangører ·{' '}
                    {speakers.length} foredragsholdere
                  </p>
                </div>
              </div>
            </div>

            {/* Organizers Section */}
            {eventDetails.organizers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Arrangører ({eventDetails.organizers.length})
                  </h4>
                  {eventDetails.slackChannel && (
                    <AddToSlackChannelButton
                      eventSlug={slug}
                      userGroup="organizers"
                      count={eventDetails.organizers.length}
                      channelName={eventDetails.slackChannel.name}
                      onUpdate={handleRefresh}
                      showError={showError}
                      showSuccess={showSuccess}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  {eventDetails.organizers.map((organizer, index) => (
                    <div
                      key={index}
                      className="dark:hover:bg-zinc-750/50 flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-50/70"
                    >
                      <div className="flex min-w-0 items-center space-x-2.5">
                        <Avatar
                          name={organizer.name}
                          slackUrl={organizer.url}
                          size="xs"
                        />
                        <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-200">
                          {organizer.name}
                        </span>
                      </div>
                      {organizer.url && (
                        <a
                          href={organizer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Slack
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="my-4 border-t border-zinc-100 dark:border-zinc-700/50" />

            {/* Speakers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                  Foredragsholdere ({speakers.length})
                </h4>
                {eventDetails.slackChannel &&
                  speakers.filter(s => s.url).length > 0 && (
                    <AddToSlackChannelButton
                      eventSlug={slug}
                      userGroup="speakers"
                      count={speakers.filter(s => s.url).length}
                      channelName={eventDetails.slackChannel.name}
                      onUpdate={handleRefresh}
                      showError={showError}
                      showSuccess={showSuccess}
                    />
                  )}
              </div>
              {speakers.length > 0 ? (
                <div className="max-h-56 scrollbar-none space-y-2 overflow-y-auto">
                  {speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="dark:hover:bg-zinc-750/50 flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-50/70"
                    >
                      <div className="flex min-w-0 items-center space-x-2.5">
                        <Avatar
                          name={speaker.name}
                          slackUrl={speaker.url}
                          size="xs"
                        />
                        <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-200">
                          {speaker.name}
                        </span>
                      </div>
                      {speaker.url ? (
                        <a
                          href={speaker.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Slack
                        </a>
                      ) : (
                        <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                          Mangler Slack
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dark:bg-zinc-750/30 rounded-xl bg-zinc-50/80 p-3 text-center">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Ingen foredragsholdere lagt til ennå.{' '}
                    <Link
                      href={`/admin/events/${slug}/agenda`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Gå til program
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Slack Channel Manager */}
        <div className="flex flex-col">
          <AdminSlackChannelManager
            eventSlug={slug}
            channelId={eventDetails.slackChannel?.id}
            channelName={eventDetails.slackChannel?.name}
            organizersCount={eventDetails.organizers.length}
            speakersCount={speakers.length}
            attendeesCount={eventDetails.stats.activeRegistrations}
            onUpdate={handleRefresh}
            showError={showError}
            showSuccess={showSuccess}
          />
        </div>
      </div>
    </div>
  )
}
