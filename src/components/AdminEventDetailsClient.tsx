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
import { AdminEventStatCard } from '@/components/AdminEventStatCard'
import { Avatar } from '@/components/Avatar'
import { AddToSlackChannelButton } from '@/components/AddToSlackChannelButton'
import { formatDateTime } from '@/lib/formatDate'
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
    <div className="space-y-4">
      {/* Top Section: Checklist and Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Checklist - 2/3 width */}
        <div className="lg:col-span-2">
          <AdminEventChecklist
            eventDetails={eventDetails}
            eventSlug={slug}
            participantInfo={participantInfoData}
            photosCount={photosCount}
          />
        </div>

        {/* Stats Grid - 1/3 width */}
        <div className="grid h-full auto-rows-fr grid-cols-2 gap-4">
          <AdminEventStatCard
            label="Påmeldte"
            value={eventDetails.stats.activeRegistrations}
            icon={UsersIcon}
            color="blue"
          />
          <AdminEventStatCard
            label="Organisasjoner"
            value={eventDetails.stats.uniqueOrganisations}
            icon={BuildingOfficeIcon}
            color="purple"
          />
          <AdminEventStatCard
            label="Foredrag"
            value={talksCount}
            icon={PresentationChartLineIcon}
            color="green"
          />
          {isPostEvent && eventDetails.stats.feedbackSummary ? (
            <AdminEventStatCard
              label={`${eventDetails.stats.feedbackSummary.totalResponses} svar`}
              value={eventDetails.stats.feedbackSummary.averageEventRating.toFixed(
                1
              )}
              icon={StarIcon}
              color="yellow"
            />
          ) : (
            <AdminEventStatCard
              label="Foredragsholdere"
              value={speakers.length}
              icon={UserGroupIcon}
              color="purple"
            />
          )}
          {isPostEvent && (
            <AdminEventStatCard
              label="Sosialt"
              value={socialCount}
              icon={UserGroupIcon}
              color="orange"
            />
          )}
        </div>
      </div>

      {/* Management Section - 3 Equal Columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Column 1: Arrangement & Participant Info */}
        <div className="space-y-4">
          {/* Basic Event Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              Arrangement
            </h3>
            <div className="space-y-2">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Tid
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(eventDetails.startTime)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Sted
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {eventDetails.location}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Påmelding
                </dt>
                <dd className="flex flex-wrap gap-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      !eventDetails.registration.disabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {!eventDetails.registration.disabled ? 'Åpen' : 'Stengt'}
                  </span>
                </dd>
              </div>
            </div>
          </div>

          {/* Participant Info */}
          <ParticipantInfoEditor
            slug={slug}
            initialData={participantInfoData}
            showSuccess={showSuccess}
            showError={showError}
          />
        </div>

        {/* Column 2: Organizers & Speakers */}
        <div className="space-y-4">
          {/* Organizers */}
          {eventDetails.organizers.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Arrangører
                </h3>
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
                  <div key={index} className="flex items-center space-x-2">
                    <Avatar
                      name={organizer.name}
                      slackUrl={organizer.url}
                      size="xs"
                    />
                    <div className="min-w-0 flex-1 text-sm">
                      {organizer.url ? (
                        <a
                          href={organizer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {organizer.name}
                        </a>
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">
                          {organizer.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Foredragsholdere
              </h3>
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
            {speakers.filter(s => s.url).length > 0 ? (
              <div className="space-y-2">
                {speakers
                  .filter(s => s.url)
                  .map((speaker, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Avatar
                        name={speaker.name}
                        slackUrl={speaker.url}
                        size="xs"
                      />
                      <div className="min-w-0 flex-1 text-sm">
                        <a
                          href={speaker.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {speaker.name}
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ingen foredragsholdere lagt til ennå. Gå til{' '}
                  <Link
                    href={`/admin/events/${slug}/agenda`}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Program
                  </Link>{' '}
                  for å legge til foredragsholdere.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Actions & Slack */}
        <div className="space-y-4">
          {/* Quick Actions */}
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
          />

          {/* Slack Channel Manager */}
          {eventDetails.slackChannel && (
            <AdminSlackChannelManager
              eventSlug={slug}
              channelId={eventDetails.slackChannel.id}
              channelName={eventDetails.slackChannel.name}
              organizersCount={eventDetails.organizers.length}
              speakersCount={
                eventDetails.schedule
                  ? eventDetails.schedule
                      .filter(item => item.speakers && item.speakers.length > 0)
                      .flatMap(item => item.speakers!)
                      .filter(
                        (speaker, index, self) =>
                          index === self.findIndex(s => s.name === speaker.name)
                      ).length
                  : 0
              }
              attendeesCount={eventDetails.stats.activeRegistrations}
              onUpdate={handleRefresh}
              showError={showError}
              showSuccess={showSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
