'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { generateRegistrationsCSV, downloadCSV } from '@/lib/csv-utils'
import { AdminRegistrationList } from '@/components/AdminRegistrationList'
import { SendReminderModal } from '@/components/SendReminderModal'
import { SendFeedbackRequestModal } from '@/components/SendFeedbackRequestModal'
import { SpeakerMatcher } from '@/components/SpeakerMatcher'
import { AdminEventStats } from '@/components/AdminEventStats'
import { AdminEventActionBar } from '@/components/AdminEventActionBar'
import { AdminRegistrationFilters } from '@/components/AdminRegistrationFilters'
import { AdminEventDetailsSidebar } from '@/components/AdminEventDetailsSidebar'
import { AdminSlackChannelManager } from '@/components/AdminSlackChannelManager'
import { AdminTalkAttachmentsWithRatings } from '@/components/AdminTalkAttachmentsWithRatings'
import { EventFeedbackSummaryWrapper } from '@/components/EventFeedbackSummaryWrapper'
import { ParticipantInfoEditor } from '@/components/ParticipantInfoEditor'
import {
  deleteRegistration,
  updateRegistrationStatus,
  bulkUpdateRegistrationStatus,
} from '@/app/admin/events/[slug]/actions'
import { VideoCameraIcon } from '@heroicons/react/24/outline'
import type { RegistrationStatus } from '@/domains/event-registration/types'
import type { EventParticipantInfo, SlackUser } from '@/lib/events/types'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type RouterOutput = inferRouterOutputs<AppRouter>
type EventDetails = RouterOutput['admin']['events']['getDetails']

interface AdminEventDetailsClientProps {
  slug: string
  initialEventDetails: EventDetails
  initialParticipantInfo: EventParticipantInfo
  speakersWithoutUrls: SlackUser[]
}

export function AdminEventDetailsClient({
  slug,
  initialEventDetails,
  initialParticipantInfo,
  speakersWithoutUrls: initialSpeakersWithoutUrls,
}: AdminEventDetailsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>(
    'all'
  )
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all')
  const [socialEventFilter, setSocialEventFilter] = useState<string>('all')
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>(
    []
  )
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isFeedbackRequestModalOpen, setIsFeedbackRequestModalOpen] =
    useState(false)
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()

  // Use only the initial data - no redundant fetching
  const eventDetails = initialEventDetails
  const participantInfoData = initialParticipantInfo
  const speakersWithoutUrls = initialSpeakersWithoutUrls

  // Callback to refresh data after mutations
  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne påmeldingen?')) {
      return
    }

    setIsDeleting(registrationId)
    try {
      await deleteRegistration(slug, registrationId)

      showSuccess('Slettet', 'Påmeldingen ble slettet')
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error deleting registration:', error)
      showError('Feil', 'Noe gikk galt ved sletting')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleStatusUpdate = async (
    registrationId: string,
    newStatus: RegistrationStatus
  ) => {
    setIsUpdatingStatus(registrationId)
    try {
      await updateRegistrationStatus(slug, registrationId, newStatus)

      showSuccess('Oppdatert', 'Status ble oppdatert')
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error updating status:', error)
      showError('Feil', 'Noe gikk galt ved oppdatering av status')
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  const handleBulkStatusUpdate = async (status: RegistrationStatus) => {
    if (selectedRegistrations.length === 0) {
      showError('Feil', 'Velg minst én påmelding')
      return
    }

    if (
      !confirm(
        `Er du sikker på at du vil oppdatere status til "${status}" for ${selectedRegistrations.length} påmeldinger?`
      )
    ) {
      return
    }

    try {
      const result = await bulkUpdateRegistrationStatus(
        slug,
        selectedRegistrations,
        status
      )

      showSuccess('Oppdatert', result.message)
      setSelectedRegistrations([])
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error bulk updating status:', error)
      showError('Feil', 'Noe gikk galt ved bulk-oppdatering')
    }
  }

  const handleExportCSV = () => {
    if (!eventDetails) return

    const csvContent = generateRegistrationsCSV(filteredRegistrations)
    downloadCSV(csvContent, `${slug}-paemeldinger.csv`)
  }

  const filteredRegistrations = useMemo(
    () =>
      eventDetails?.registrations.filter(
        (
          registration
        ): registration is typeof registration & { _id: string } => {
          if (!registration._id) return false

          const matchesSearch =
            registration.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            registration.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            registration.organisation
              .toLowerCase()
              .includes(searchTerm.toLowerCase())

          const matchesStatus =
            statusFilter === 'all' || registration.status === statusFilter

          const matchesAttendance =
            attendanceFilter === 'all' ||
            registration.attendanceType === attendanceFilter

          const matchesSocialEvent =
            socialEventFilter === 'all' ||
            (socialEventFilter === 'yes' &&
              registration.attendingSocialEvent) ||
            (socialEventFilter === 'no' && !registration.attendingSocialEvent)

          return (
            matchesSearch &&
            matchesStatus &&
            matchesAttendance &&
            matchesSocialEvent
          )
        }
      ) || [],
    [
      eventDetails?.registrations,
      searchTerm,
      statusFilter,
      attendanceFilter,
      socialEventFilter,
    ]
  )

  if (!eventDetails) {
    return null
  }

  const eventDate = new Date(eventDetails.startTime)
  const now = new Date()
  const isPreEvent = eventDate > now

  return (
    <div className="space-y-8">
      {/* Event Stats */}
      <AdminEventStats eventDetails={eventDetails} />

      {/* Recording Link */}
      {eventDetails.recordingUrl && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/10">
          <div className="flex items-center">
            <VideoCameraIcon className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Opptak tilgjengelig
              </p>
              <a
                href={eventDetails.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {eventDetails.recordingUrl}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Registration List (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Action Bar */}
          <AdminEventActionBar
            mode={
              selectedRegistrations.length > 0
                ? 'bulk'
                : isPreEvent
                  ? 'pre-event'
                  : 'post-event'
            }
            selectedCount={selectedRegistrations.length}
            activeRegistrations={eventDetails.stats.activeRegistrations}
            attendedCount={eventDetails.stats.statusBreakdown.attended || 0}
            feedbackPageUrl={`/fagdag/${slug}/tilbakemeldinger`}
            onSendReminder={() => setIsReminderModalOpen(true)}
            onSendFeedbackRequest={() => setIsFeedbackRequestModalOpen(true)}
            onExport={handleExportCSV}
            onBulkStatusUpdate={handleBulkStatusUpdate}
          />

          {/* Filters */}
          <AdminRegistrationFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            attendanceFilter={attendanceFilter}
            socialEventFilter={socialEventFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onAttendanceChange={setAttendanceFilter}
            onSocialEventChange={setSocialEventFilter}
          />

          {/* Registration List */}
          <AdminRegistrationList
            registrations={filteredRegistrations}
            selectedRegistrations={selectedRegistrations}
            onSelectAll={checked => {
              if (checked) {
                setSelectedRegistrations(
                  filteredRegistrations
                    .map(r => r._id)
                    .filter((id): id is string => id !== undefined)
                )
              } else {
                setSelectedRegistrations([])
              }
            }}
            onSelectOne={(id, checked) => {
              if (checked) {
                setSelectedRegistrations([...selectedRegistrations, id])
              } else {
                setSelectedRegistrations(
                  selectedRegistrations.filter(regId => regId !== id)
                )
              }
            }}
            onStatusChange={handleStatusUpdate}
            onDelete={handleDeleteRegistration}
            isUpdatingStatus={isUpdatingStatus}
            isDeleting={isDeleting}
            searchTerm={searchTerm}
          />
        </div>

        {/* Right Column: Event Details Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Event Details Sidebar */}
          <AdminEventDetailsSidebar
            eventDetails={eventDetails}
            eventSlug={slug}
            slackChannelName={eventDetails.slackChannel?.name}
            onUpdate={handleRefresh}
            showError={showError}
            showSuccess={showSuccess}
          />

          {/* Participant Info Editor */}
          <ParticipantInfoEditor
            slug={slug}
            initialData={participantInfoData}
            showSuccess={showSuccess}
            showError={showError}
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

          {/* Feedback Summary */}
          {!isPreEvent && <EventFeedbackSummaryWrapper eventSlug={slug} />}

          {/* Presentations and Attachments */}
          {eventDetails.schedule && eventDetails.schedule.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Presentasjoner og vedlegg
                </h3>
              </div>
              <div className="p-6">
                <AdminTalkAttachmentsWithRatings
                  eventSlug={slug}
                  schedule={eventDetails.schedule}
                />
              </div>
            </div>
          )}

          {/* Speaker Matcher */}
          {speakersWithoutUrls.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Koble foredragsholdere
                </h3>
              </div>
              <div className="p-3">
                <SpeakerMatcher
                  eventSlug={slug}
                  speakers={speakersWithoutUrls}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SendReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        eventSlug={slug}
        eventTitle={eventDetails.title}
        eventDate={eventDetails.date}
        onSuccess={message => {
          showSuccess('Sendt', message)
          setIsReminderModalOpen(false)
        }}
        onError={message => showError('Feil', message)}
      />

      <SendFeedbackRequestModal
        isOpen={isFeedbackRequestModalOpen}
        onClose={() => setIsFeedbackRequestModalOpen(false)}
        eventSlug={slug}
        eventTitle={eventDetails.title}
        eventDate={eventDetails.date}
        onSuccess={message => {
          showSuccess('Sendt', message)
          setIsFeedbackRequestModalOpen(false)
        }}
        onError={message => showError('Feil', message)}
      />
    </div>
  )
}
