'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useToast } from '@/components/ToastProvider'
import { formatDateTime } from '@/lib/formatDate'
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
  ChartBarIcon,
  XCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { StatusBadge } from '@/components/StatusBadge'
import { ActionsMenu } from '@/components/ActionsMenu'
import { Avatar } from '@/components/Avatar'
import { SendReminderModal } from '@/components/SendReminderModal'
import { SpeakerMatcher } from '@/components/SpeakerMatcher'
import type { RegistrationStatus } from '@/domains/event-registration/types'
import { AttendanceTypeDisplay } from '@/lib/events/types'
import type { SlackUser, Item as ScheduleItem } from '@/lib/events/types'

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
    }) || []

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
      <div className="mb-8">
        {(() => {
          const eventDate = new Date(eventDetails.startTime)
          const now = new Date()
          const isFutureEvent = eventDate > now
          const useLegacyStats = eventDetails.registration.disabled === true

          if (useLegacyStats && eventDetails.eventStats) {
            // Legacy stats for events with disabled registration
            return (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserIcon
                          className="h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Deltakere
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {eventDetails.eventStats.participants}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BuildingOfficeIcon
                          className="h-5 w-5 text-gray-400 dark:text-gray-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Organisasjoner
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {eventDetails.eventStats.organisations}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-5 w-5 text-blue-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Påmeldinger
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {eventDetails.eventStats.registrations}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          } else if (isFutureEvent) {
            // Future event stats - focus on registrations
            const physicalCount = eventDetails.registrations.filter(
              r =>
                r.attendanceType === 'physical' &&
                ['confirmed', 'attended'].includes(r.status)
            ).length
            const digitalCount = eventDetails.registrations.filter(
              r =>
                r.attendanceType === 'digital' &&
                ['confirmed', 'attended'].includes(r.status)
            ).length
            const socialEventCount = eventDetails.registrations.filter(
              r =>
                r.attendingSocialEvent &&
                ['confirmed', 'attended'].includes(r.status)
            ).length

            return (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Påmeldte
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
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MapPinIcon
                          className="h-5 w-5 text-blue-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Fysisk
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {physicalCount}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <VideoCameraIcon
                          className="h-5 w-5 text-purple-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Digitalt
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {digitalCount}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserGroupIcon
                          className="h-5 w-5 text-orange-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Sosialt
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {socialEventCount}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BuildingOfficeIcon
                          className="h-5 w-5 text-gray-400 dark:text-gray-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Organisasjoner
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
            )
          } else {
            // Past event stats - focus on outcomes
            const attendanceRate =
              eventDetails.stats.totalRegistrations > 0
                ? Math.round(
                    (eventDetails.stats.statusBreakdown.attended /
                      eventDetails.stats.totalRegistrations) *
                      100
                  )
                : 0
            const noShowCount =
              eventDetails.stats.statusBreakdown['no-show'] || 0

            return (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserIcon
                          className="h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
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
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChartBarIcon
                          className="h-5 w-5 text-blue-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Oppmøte %
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {attendanceRate}%
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <XCircleIcon
                          className="h-5 w-5 text-red-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Ikke møtt
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {noShowCount}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BuildingOfficeIcon
                          className="h-5 w-5 text-gray-400 dark:text-gray-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            Organisasjoner
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
            )
          }
        })()}
      </div>

      {/* Event Details */}
      <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Fagdagdetaljer
          </h3>
        </div>
        <div className="p-4">
          {/* Basic Info - Split into two rows */}
          <div className="space-y-4">
            {/* First Row - Core Event Info */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="flex items-start space-x-2">
                <CalendarIcon className="mt-0.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Tid
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(eventDetails.startTime)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPinIcon className="mt-0.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Sted
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {eventDetails.location}
                  </dd>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <UserGroupIcon className="mt-0.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Målgruppe
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {eventDetails.audience}
                  </dd>
                </div>
              </div>
            </div>

            {/* Second Row - Registration & Additional Info */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Påmeldingssystem
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    <div className="flex flex-wrap items-center gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          !eventDetails.registration.disabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {!eventDetails.registration.disabled
                          ? 'Aktivert'
                          : 'Deaktivert'}
                      </span>
                      {eventDetails.registration.attendanceTypes.map(
                        (type, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {AttendanceTypeDisplay[
                              type as keyof typeof AttendanceTypeDisplay
                            ] || type}
                          </span>
                        )
                      )}
                    </div>
                  </dd>
                </div>
              </div>

              {eventDetails.price && (
                <div className="flex items-start space-x-2">
                  <BanknotesIcon className="mt-0.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Pris
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {eventDetails.price}
                    </dd>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* URLs in a more compact format */}
          {(eventDetails.registrationUrl ||
            eventDetails.callForPapersUrl ||
            eventDetails.recordingUrl) && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <dt className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Lenker
              </dt>
              <dd className="flex flex-wrap gap-3">
                {eventDetails.registrationUrl && (
                  <a
                    href={eventDetails.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <LinkIcon className="mr-1 h-3 w-3" />
                    Påmelding
                  </a>
                )}
                {eventDetails.callForPapersUrl && (
                  <a
                    href={eventDetails.callForPapersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <PresentationChartLineIcon className="mr-1 h-3 w-3" />
                    Call for Papers
                  </a>
                )}
                {eventDetails.recordingUrl && (
                  <a
                    href={eventDetails.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <VideoCameraIcon className="mr-1 h-3 w-3" />
                    Opptak
                  </a>
                )}
                {eventDetails.eventStats?.feedback?.url && (
                  <a
                    href={eventDetails.eventStats.feedback.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <StarIcon className="mr-1 h-3 w-3" />
                    Tilbakemeldinger (
                    {eventDetails.eventStats.feedback.averageRating.toFixed(1)}
                    /5)
                  </a>
                )}
              </dd>
            </div>
          )}

          {/* Organizers - More compact */}
          {eventDetails.organizers.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <dt className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Arrangører
              </dt>
              <div className="flex flex-wrap gap-3">
                {eventDetails.organizers.map((organizer, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Avatar
                      name={organizer.name}
                      slackUrl={organizer.url}
                      size="xs"
                    />
                    <div className="text-sm">
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
                      {organizer.org && (
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({organizer.org})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers - Extracted from schedule */}
          {(() => {
            const speakers = eventDetails.schedule
              .filter(item => item.speakers && item.speakers.length > 0)
              .flatMap(item => item.speakers!)
              .reduce((unique: SlackUser[], speaker) => {
                if (!unique.find(s => s.name === speaker.name)) {
                  unique.push(speaker)
                }
                return unique
              }, [])

            return speakers.length > 0 ? (
              <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                <dt className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Foredragsholdere
                </dt>
                <div className="flex flex-wrap gap-3">
                  {speakers.map((speaker, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Avatar
                        name={speaker.name}
                        slackUrl={speaker.url}
                        size="xs"
                      />
                      <div className="text-sm">
                        {speaker.url ? (
                          <a
                            href={speaker.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {speaker.name}
                          </a>
                        ) : (
                          <span className="font-medium text-gray-900 dark:text-white">
                            {speaker.name}
                          </span>
                        )}
                        {speaker.org && (
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                            ({speaker.org})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          })()}

          {/* Schedule Summary - Very compact */}
          {eventDetails.schedule.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <dt className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Program
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {eventDetails.schedule.length} programpunkter
                {(() => {
                  const firstItem = eventDetails.schedule[0]
                  const lastItem =
                    eventDetails.schedule[eventDetails.schedule.length - 1]
                  return eventDetails.schedule.length > 0 &&
                    firstItem &&
                    lastItem ? (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({firstItem.time} - {lastItem.time})
                    </span>
                  ) : null
                })()}
              </dd>
            </div>
          )}

          {/* Event Stats - More compact */}
          {eventDetails.eventStats && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <dt className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Statistikk fra arrangementet
              </dt>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {eventDetails.eventStats.participants}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Deltakere
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {eventDetails.eventStats.organisations}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Organisasjoner
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {eventDetails.eventStats.registrations}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Påmeldinger
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participant Info */}
      <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
        <div className="space-y-4 p-6">
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
              Disse notatene er synlige for alle påmeldte deltakere etter at de
              har registrert seg.
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

      {/* Speaker Matcher */}
      {(() => {
        const allSpeakers = eventDetails.schedule
          .filter(item => item.speakers && item.speakers.length > 0)
          .flatMap(item => item.speakers!)
          .filter(
            (speaker, index, self) =>
              index === self.findIndex(s => s.name === speaker.name)
          )

        const speakersWithoutUrls = allSpeakers.filter(speaker => !speaker.url)

        if (speakersWithoutUrls.length > 0) {
          return (
            <div className="mb-8">
              <SpeakerMatcher eventSlug={slug} speakers={speakersWithoutUrls} />
            </div>
          )
        }
        return null
      })()}

      {/* Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-1">
            <div className="relative sm:min-w-[240px] lg:max-w-xs">
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
              <option value="cancelled">Avmeldt</option>
            </select>

            <select
              value={attendanceFilter}
              onChange={e => setAttendanceFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <option value="all">Alle deltakelser</option>
              <option value="physical">Fysisk</option>
              <option value="digital">Digitalt</option>
            </select>

            <select
              value={socialEventFilter}
              onChange={e => setSocialEventFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <option value="all">Sosialt</option>
              <option value="yes">Ja</option>
              <option value="no">Nei</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 lg:flex-nowrap">
            <button
              onClick={() => setIsReminderModalOpen(true)}
              disabled={
                !eventDetails || eventDetails.stats.activeRegistrations === 0
              }
              className="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors duration-150 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              <BellIcon className="mr-2 h-4 w-4" />
              Send påminnelse
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
            >
              <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
              Eksporter CSV
            </button>
          </div>
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
        <div className="overflow-x-auto">
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
                  Organisasjon
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Deltakelse
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Sosialt
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Status
                </th>
                <th className="w-12 px-6 py-3">
                  <span className="sr-only">Handlinger</span>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        name={registration.name}
                        slackUserId={registration.slackUserId}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {registration.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {registration.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {registration.organisation}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {registration.attendanceType
                      ? AttendanceTypeDisplay[
                          registration.attendanceType as keyof typeof AttendanceTypeDisplay
                        ] || registration.attendanceType
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {registration.attendingSocialEvent ? (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                        <UserGroupIcon className="mr-1 h-3 w-3" />
                        Ja
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div>
                        <StatusBadge
                          status={registration.status}
                          className="px-1 py-0.5 text-xs font-medium"
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(registration.registeredAt).toLocaleDateString(
                          'nb-NO'
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
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
