'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useToast } from '@/components/ToastProvider'
import { formatDateTime } from '@/lib/formatDate'
import { getUniqueSpeakers } from '@/lib/events/helpers'
import { AdminRegistrationList } from '@/components/AdminRegistrationList'
import { ArrowLeftIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { SendReminderModal } from '@/components/SendReminderModal'
import { SpeakerMatcher } from '@/components/SpeakerMatcher'
import { AdminEventStats } from '@/components/AdminEventStats'
import { AdminEventActionBar } from '@/components/AdminEventActionBar'
import { AdminRegistrationFilters } from '@/components/AdminRegistrationFilters'
import { AdminEventDetailsSidebar } from '@/components/AdminEventDetailsSidebar'
import { AdminSlackChannelManager } from '@/components/AdminSlackChannelManager'
import { AdminTalkAttachments } from '@/components/AdminTalkAttachments'
import { Button } from '@/components/Button'
import type { RegistrationStatus } from '@/domains/event-registration/types'
import type { SlackUser, Item } from '@/lib/events/types'

interface EventRegistration {
  _id: string
  name: string
  email: string
  organisation: string
  slackUserId?: string
  dietary?: string
  comments?: string
  attendanceType?: string
  attendingSocialEvent?: boolean
  registeredAt: string
  status: RegistrationStatus
}

interface EventDetails {
  title: string
  date: string
  location: string
  ingress?: string
  description?: string
  audience: string
  price?: string
  startTime: string
  endTime: string
  registrationUrl?: string
  callForPapersUrl?: string
  recordingUrl?: string
  registration: {
    disabled?: boolean
    attendanceTypes: string[]
  }
  organizers: SlackUser[]
  schedule: Item[]
  socialEvent?: {
    description: string
    start: string
    location: string
  }
  participantInfo?: {
    streamingUrl?: string
    notes?: string
  }
  slackChannel?: {
    id: string
    name: string
  }
  registrations: EventRegistration[]
  stats: {
    totalRegistrations: number
    uniqueOrganisations: number
    statusBreakdown: Record<RegistrationStatus, number>
    activeRegistrations: number
  }
}

export default function AdminEventDetailsPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const slug = params.slug as string
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
  const [participantInfo, setParticipantInfo] = useState<{
    streamingUrl: string
    notes: string
  }>({ streamingUrl: '', notes: '' })
  const [isEditingParticipantInfo, setIsEditingParticipantInfo] =
    useState(false)
  const [isSavingParticipantInfo, setIsSavingParticipantInfo] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const { showSuccess, showError } = useToast()

  const speakersWithoutUrls = useMemo(() => {
    if (!eventDetails?.schedule) return []

    const allSpeakers = eventDetails.schedule
      .filter(item => item.speakers && item.speakers.length > 0)
      .flatMap(item => item.speakers!)
      .filter(
        (speaker, index, self) =>
          index === self.findIndex(s => s.name === speaker.name)
      )

    return allSpeakers.filter(speaker => !speaker.url)
  }, [eventDetails?.schedule])

  const fetchParticipantInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/events/${slug}/participant-info`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setParticipantInfo({
          streamingUrl: data.streamingUrl || '',
          notes: data.notes || '',
        })
      }
    } catch (error) {
      console.error('Error fetching participant info:', error)
    }
  }, [slug])

  const fetchEventDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${slug}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEventDetails(data)
      } else {
        console.error('Failed to fetch event details')
        showError('Feil', 'Kunne ikke laste fagdagdata')
      }
    } catch (error) {
      console.error('Error fetching event details:', error)
      showError('Feil', 'Noe gikk galt ved lasting av data')
    } finally {
      setIsLoading(false)
    }
  }, [slug, showError])

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      redirect('/auth/signin')
    }

    if (!session.user.isAdmin) {
      redirect('/')
    }

    fetchEventDetails()
    fetchParticipantInfo()
  }, [session, status, slug, fetchEventDetails, fetchParticipantInfo])

  const handleSaveParticipantInfo = async () => {
    setIsSavingParticipantInfo(true)
    try {
      const response = await fetch(
        `/api/admin/events/${slug}/participant-info`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(participantInfo),
        }
      )

      if (response.ok) {
        showSuccess('Lagret', 'Deltakerinformasjon ble lagret')
        setIsEditingParticipantInfo(false)
      } else {
        showError('Feil', 'Kunne ikke lagre deltakerinformasjon')
      }
    } catch (error) {
      console.error('Error saving participant info:', error)
      showError('Feil', 'Noe gikk galt ved lagring')
    } finally {
      setIsSavingParticipantInfo(false)
    }
  }

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne påmeldingen?')) {
      return
    }

    setIsDeleting(registrationId)
    try {
      const response = await fetch(
        `/api/admin/events/${slug}/registrations/${registrationId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        showSuccess('Slettet', 'Påmeldingen ble slettet')
        fetchEventDetails()
      } else {
        showError('Feil', 'Kunne ikke slette påmeldingen')
      }
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
      const response = await fetch(
        `/api/admin/events/${slug}/registrations/${registrationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.ok) {
        showSuccess('Oppdatert', 'Status ble oppdatert')
        fetchEventDetails()
      } else {
        showError('Feil', 'Kunne ikke oppdatere status')
      }
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
      const response = await fetch(
        `/api/admin/events/${slug}/registrations/bulk-status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: selectedRegistrations,
            status,
          }),
        }
      )

      if (response.ok) {
        const result = await response.json()
        showSuccess('Oppdatert', result.message)
        setSelectedRegistrations([])
        fetchEventDetails()
      } else {
        showError('Feil', 'Kunne ikke oppdatere status for valgte påmeldinger')
      }
    } catch (error) {
      console.error('Error bulk updating status:', error)
      showError('Feil', 'Noe gikk galt ved bulk-oppdatering')
    }
  }

  const handleExportCSV = () => {
    if (!eventDetails) return

    const headers = [
      'Navn',
      'E-post',
      'Organisasjon',
      'Deltakelse',
      'Kommentarer',
      'Påmeldt',
      'Status',
    ]
    const csvContent = [
      headers.join(','),
      ...filteredRegistrations.map(reg =>
        [
          `"${reg.name}"`,
          `"${reg.email}"`,
          `"${reg.organisation}"`,
          `"${reg.attendanceType || ''}"`,
          `"${reg.comments || ''}"`,
          `"${formatDateTime(reg.registeredAt)}"`,
          `"${reg.status}"`,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${slug}-paemeldinger.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredRegistrations = useMemo(
    () =>
      eventDetails?.registrations.filter(registration => {
        const matchesSearch =
          registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          (socialEventFilter === 'yes' && registration.attendingSocialEvent) ||
          (socialEventFilter === 'no' && !registration.attendingSocialEvent)

        return (
          matchesSearch &&
          matchesStatus &&
          matchesAttendance &&
          matchesSocialEvent
        )
      }) || [],
    [
      eventDetails?.registrations,
      searchTerm,
      statusFilter,
      attendanceFilter,
      socialEventFilter,
    ]
  )

  if (status === 'loading' || isLoading) {
    return (
      <SimpleLayout title="Laster fagdag..." intro="Henter påmeldingsdata...">
        {/* Navigation Skeleton */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="mb-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      </dt>
                      <dd>
                        <div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event Details Skeleton */}
        <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="mt-0.5 h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1">
                      <div className="mb-1 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="mt-0.5 h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1">
                      <div className="mb-1 h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-visible">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SimpleLayout>
    )
  }

  if (!eventDetails) {
    return (
      <SimpleLayout
        title="Fagdag ikke funnet"
        intro="Kunne ikke laste fagdagdata."
      >
        <div className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Fagdagen ble ikke funnet.
          </p>
          <Link
            href="/admin/events"
            className="mt-4 inline-flex items-center rounded-lg border border-transparent bg-blue-100 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Tilbake til oversikt
          </Link>
        </div>
      </SimpleLayout>
    )
  }

  const eventDate = new Date(eventDetails.startTime)
  const now = new Date()
  const isPreEvent = eventDate > now

  return (
    <SimpleLayout
      title={eventDetails.title}
      intro={`Påmeldinger for ${eventDetails.date}${eventDetails.location ? ` - ${eventDetails.location}` : ''}`}
    >
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors duration-150 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Tilbake til oversikt
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <AdminEventStats eventDetails={eventDetails} />
          {selectedRegistrations.length > 0 ? (
            <AdminEventActionBar
              mode="bulk"
              selectedCount={selectedRegistrations.length}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onExport={handleExportCSV}
            />
          ) : isPreEvent ? (
            <AdminEventActionBar
              mode="pre-event"
              activeRegistrations={eventDetails.stats.activeRegistrations}
              onSendReminder={() => setIsReminderModalOpen(true)}
              onExport={handleExportCSV}
            />
          ) : (
            <AdminEventActionBar mode="post-event" onExport={handleExportCSV} />
          )}

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

          <AdminRegistrationList
            registrations={filteredRegistrations}
            selectedRegistrations={selectedRegistrations}
            onSelectAll={checked => {
              if (checked) {
                setSelectedRegistrations(filteredRegistrations.map(r => r._id))
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

          {filteredRegistrations.some(r => r.comments) && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Kommentarer fra deltagere
              </h3>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRegistrations
                    .filter(r => r.comments)
                    .map(registration => (
                      <div key={registration._id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {registration.name} ({registration.organisation})
                            </p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {registration.comments}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 xl:col-span-1">
          <AdminEventDetailsSidebar
            eventDetails={eventDetails}
            eventSlug={slug}
            slackChannelName={eventDetails.slackChannel?.name}
            onUpdate={fetchEventDetails}
            showError={showError}
            showSuccess={showSuccess}
          />
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Deltakerinformasjon
              </h3>
              {!isEditingParticipantInfo && (
                <button
                  onClick={() => setIsEditingParticipantInfo(true)}
                  className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Rediger
                </button>
              )}
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label
                  htmlFor="streamingUrl"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Streaming URL
                </label>
                {isEditingParticipantInfo ? (
                  <input
                    type="url"
                    id="streamingUrl"
                    value={participantInfo.streamingUrl}
                    onChange={e =>
                      setParticipantInfo(prev => ({
                        ...prev,
                        streamingUrl: e.target.value,
                      }))
                    }
                    placeholder="https://zoom.us/j/..."
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-sm text-gray-900 dark:text-white">
                    {participantInfo.streamingUrl ? (
                      <a
                        href={participantInfo.streamingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <VideoCameraIcon className="mr-1.5 h-4 w-4" />
                        Åpne streaming
                      </a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Ikke satt
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Notater
                </label>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Disse notatene er synlige for alle påmeldte deltakere etter at
                  de har registrert seg.
                </p>
                {isEditingParticipantInfo ? (
                  <textarea
                    id="notes"
                    value={participantInfo.notes}
                    onChange={e =>
                      setParticipantInfo(prev => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Interne notater..."
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                ) : (
                  <div className="text-sm text-gray-900 dark:text-white">
                    {participantInfo.notes || (
                      <span className="text-gray-500 dark:text-gray-400">
                        Ingen notater
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isEditingParticipantInfo && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveParticipantInfo}
                    disabled={isSavingParticipantInfo}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    {isSavingParticipantInfo ? 'Lagrer...' : 'Lagre'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingParticipantInfo(false)
                      fetchParticipantInfo()
                    }}
                    disabled={isSavingParticipantInfo}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Avbryt
                  </button>
                </div>
              )}
            </div>
          </div>

          <AdminSlackChannelManager
            eventSlug={slug}
            channelId={eventDetails.slackChannel?.id}
            channelName={eventDetails.slackChannel?.name}
            organizersCount={eventDetails.organizers.length}
            speakersCount={getUniqueSpeakers(eventDetails.schedule).length}
            attendeesCount={eventDetails.stats.activeRegistrations}
            onUpdate={fetchEventDetails}
            showError={showError}
            showSuccess={showSuccess}
          />

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Tilbakemeldinger
              </h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Se alle tilbakemeldinger fra deltakere på en dedikert side.
              </p>
              <Button
                href={`/fagdag/${slug}/feedback`}
                variant="primary"
                className="w-full"
              >
                Se tilbakemeldinger
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Presentasjoner og vedlegg
              </h3>
            </div>
            <div className="p-6">
              <AdminTalkAttachments
                eventSlug={slug}
                schedule={eventDetails.schedule}
                onError={message => showError('Feil', message)}
                onSuccess={message => showSuccess('Suksess', message)}
              />
            </div>
          </div>

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

      {eventDetails && (
        <SendReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          eventSlug={slug}
          eventTitle={eventDetails.title}
          eventDate={eventDetails.date}
          onSuccess={message => {
            showSuccess('Sendt', message)
          }}
          onError={message => {
            showError('Feil', message)
          }}
        />
      )}
    </SimpleLayout>
  )
}
