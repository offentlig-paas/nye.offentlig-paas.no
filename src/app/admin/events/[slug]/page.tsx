'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useToast } from '@/components/ToastProvider'
import {
  ArrowLeftIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  VideoCameraIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  StarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'
import { StatusBadge } from '@/components/StatusBadge'
import { ActionsMenu } from '@/components/ActionsMenu'
import type { RegistrationStatus } from '@/domains/event-registration/types'

interface EventRegistration {
  _id: string
  name: string
  email: string
  organisation: string
  dietary?: string
  comments?: string
  attendanceType?: string
  registeredAt: string
  status: RegistrationStatus
}

interface Organizer {
  name: string
  org?: string
  url?: string
}

interface ScheduleItem {
  title: string
  speaker?: string
  description?: string
  time: string
  type: string
  attachments?: unknown[]
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
  organizers: Organizer[]
  schedule: ScheduleItem[]
  eventStats?: {
    registrations: number
    participants: number
    organisations: number
    feedback?: {
      url: string
      averageRating: number
      respondents: number
      comments: string[]
    }
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
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>(
    []
  )
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

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
  }, [session, status, slug, fetchEventDetails])

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
        fetchEventDetails() // Refresh the data
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
        fetchEventDetails() // Refresh the data
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
        fetchEventDetails() // Refresh the data
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
          `"${reg.comments || ''}"`,
          `"${new Date(reg.registeredAt).toLocaleString('nb-NO')}"`,
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

  const filteredRegistrations =
    eventDetails?.registrations.filter(registration => {
      const matchesSearch =
        registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.organisation
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || registration.status === statusFilter

      return matchesSearch && matchesStatus
    }) || []

  if (status === 'loading' || isLoading) {
    return (
      <SimpleLayout title="Laster fagdag..." intro="Henter påmeldingsdata...">
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
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

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                    {eventDetails.stats.totalRegistrations}
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
                <CheckCircleIcon
                  className="h-6 w-6 text-green-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Aktive påmeldinger
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventDetails.stats.activeRegistrations}
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
                <UserIcon
                  className="h-6 w-6 text-blue-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Deltok
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventDetails.stats.statusBreakdown.attended}
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
                    {eventDetails.stats.uniqueOrganisations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fagdagdetaljer
          </h3>
        </div>
        <div className="space-y-6 p-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tid
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(eventDetails.startTime).toLocaleDateString(
                      'nb-NO',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                    <br />
                    {new Date(eventDetails.startTime).toLocaleTimeString(
                      'nb-NO',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}{' '}
                    -{' '}
                    {new Date(eventDetails.endTime).toLocaleTimeString(
                      'nb-NO',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </dd>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPinIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Sted
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {eventDetails.location}
                  </dd>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UserGroupIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Målgruppe
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {eventDetails.audience}
                  </dd>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Påmelding
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        !eventDetails.registration.disabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {!eventDetails.registration.disabled
                        ? 'Aktivert'
                        : 'Deaktivert'}
                    </span>
                  </dd>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UsersIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Deltakelsestyper
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {eventDetails.registration.attendanceTypes.join(', ')}
                  </dd>
                </div>
              </div>

              {eventDetails.price && (
                <div className="flex items-start space-x-3">
                  <BanknotesIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Pris
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {eventDetails.price}
                    </dd>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {eventDetails.registrationUrl && (
                <div className="flex items-start space-x-3">
                  <LinkIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Påmelding
                    </dt>
                    <dd className="text-sm">
                      <a
                        href={eventDetails.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Åpne påmeldingsskjema
                      </a>
                    </dd>
                  </div>
                </div>
              )}

              {eventDetails.callForPapersUrl && (
                <div className="flex items-start space-x-3">
                  <PresentationChartLineIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Call for Papers
                    </dt>
                    <dd className="text-sm">
                      <a
                        href={eventDetails.callForPapersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Send inn bidrag
                      </a>
                    </dd>
                  </div>
                </div>
              )}

              {eventDetails.recordingUrl && (
                <div className="flex items-start space-x-3">
                  <VideoCameraIcon className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Opptak
                    </dt>
                    <dd className="text-sm">
                      <a
                        href={eventDetails.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Se opptak
                      </a>
                    </dd>
                  </div>
                </div>
              )}

              {eventDetails.eventStats?.feedback && (
                <div className="flex items-start space-x-3">
                  <StarIcon className="mt-0.5 h-5 w-5 text-yellow-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tilbakemelding
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {eventDetails.eventStats.feedback.averageRating.toFixed(
                        1
                      )}
                      /5 ({eventDetails.eventStats.feedback.respondents} svar)
                      {eventDetails.eventStats.feedback.url && (
                        <>
                          <br />
                          <a
                            href={eventDetails.eventStats.feedback.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Se tilbakemeldinger
                          </a>
                        </>
                      )}
                    </dd>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {(eventDetails.ingress || eventDetails.description) && (
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              {eventDetails.ingress && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Beskrivelse
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-900 dark:text-white">
                    {eventDetails.ingress}
                  </p>
                </div>
              )}
              {eventDetails.description && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Detaljer
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-white">
                    {eventDetails.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Organizers */}
          {eventDetails.organizers.length > 0 && (
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Arrangører
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {eventDetails.organizers.map((organizer, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {organizer.url ? (
                          <a
                            href={organizer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {organizer.name}
                          </a>
                        ) : (
                          organizer.name
                        )}
                      </p>
                      {organizer.org && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {organizer.org}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Preview */}
          {eventDetails.schedule.length > 0 && (
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Program ({eventDetails.schedule.length} punkter)
              </h4>
              <div className="max-h-60 space-y-3 overflow-y-auto">
                {eventDetails.schedule.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                  >
                    <div className="w-16 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {item.time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      {item.speaker && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          av {item.speaker}
                        </p>
                      )}
                      {item.type && (
                        <span className="mt-1 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          {item.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {eventDetails.schedule.length > 5 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ... og {eventDetails.schedule.length - 5} flere
                      programpunkter
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Stats from events.ts */}
          {eventDetails.eventStats && (
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Statistikk fra arrangementet
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventDetails.eventStats.participants}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Faktiske deltakere
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventDetails.eventStats.organisations}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Organisasjoner deltok
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventDetails.eventStats.registrations}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Totale påmeldinger
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                placeholder="Søk i påmeldinger..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as RegistrationStatus | 'all')
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <option value="all">Alle statuser</option>
              <option value="confirmed">Bekreftet</option>
              <option value="waitlist">Venteliste</option>
              <option value="attended">Deltok</option>
              <option value="no-show">Ikke møtt</option>
              <option value="cancelled">Avbrutt</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
          >
            <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
            Eksporter CSV
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedRegistrations.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedRegistrations.length} påmeldinger valgt
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('confirmed')}
                  className="inline-flex items-center rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70"
                >
                  Bekreft
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('attended')}
                  className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                >
                  Merk som deltok
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('no-show')}
                  className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Ikke møtt
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('waitlist')}
                  className="inline-flex items-center rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900/70"
                >
                  Venteliste
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registrations Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-visible">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedRegistrations.length ===
                        filteredRegistrations.length &&
                      filteredRegistrations.length > 0
                    }
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedRegistrations(
                          filteredRegistrations.map(r => r._id)
                        )
                      } else {
                        setSelectedRegistrations([])
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Navn
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  E-post
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Organisasjon
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Deltakelse
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Påmeldt
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredRegistrations.map(registration => (
                <tr
                  key={registration._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRegistrations.includes(registration._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedRegistrations([
                            ...selectedRegistrations,
                            registration._id,
                          ])
                        } else {
                          setSelectedRegistrations(
                            selectedRegistrations.filter(
                              id => id !== registration._id
                            )
                          )
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900 dark:text-white">
                    {registration.name}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {registration.email}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {registration.organisation}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {registration.attendanceType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={registration.status} />
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {new Date(registration.registeredAt).toLocaleDateString(
                      'nb-NO'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <ActionsMenu
                      currentStatus={registration.status}
                      onStatusChange={(status: RegistrationStatus) =>
                        handleStatusUpdate(registration._id, status)
                      }
                      onDelete={() =>
                        handleDeleteRegistration(registration._id)
                      }
                      disabled={isUpdatingStatus === registration._id}
                      isDeleting={isDeleting === registration._id}
                      isUpdating={isUpdatingStatus === registration._id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {searchTerm ? 'Ingen påmeldinger funnet' : 'Ingen påmeldinger'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Prøv å justere søkekriteriene.'
                : 'Det er ingen påmeldinger til denne fagdagen ennå.'}
            </p>
          </div>
        )}
      </div>

      {/* Additional Details */}
      {filteredRegistrations.some(r => r.comments) && (
        <div className="mt-8">
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
    </SimpleLayout>
  )
}
