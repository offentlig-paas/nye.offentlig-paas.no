'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { generateRegistrationsCSV, downloadCSV } from '@/lib/csv-utils'
import { AdminRegistrationList } from '@/components/AdminRegistrationList'
import { AdminRegistrationFilters } from '@/components/AdminRegistrationFilters'
import { AdminEventActions } from '@/components/AdminEventActions'
import { AdminEventStats } from '@/components/AdminEventStats'
import {
  deleteRegistration,
  updateRegistrationStatus,
  bulkUpdateRegistrationStatus,
} from '@/app/admin/events/[slug]/actions'
import { useAdminEvent } from '@/contexts/AdminEventContext'
import type { RegistrationStatus } from '@/domains/event-registration/types'

export function AdminAttendeesClient() {
  const { slug, eventDetails } = useAdminEvent()
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
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()

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

  return (
    <div className="space-y-4">
      {/* Stats */}
      <AdminEventStats eventDetails={eventDetails} />

      {/* Actions */}
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

      {/* Bulk Actions */}
      {selectedRegistrations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedRegistrations.length} påmeldinger valgt
            </span>
            <button
              onClick={() => handleBulkStatusUpdate('confirmed')}
              className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              Bekreft
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('attended')}
              className="inline-flex items-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700"
            >
              Merk som deltok
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('no-show')}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Ikke møtt
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('waitlist')}
              className="inline-flex items-center rounded-lg border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-700 transition-colors duration-150 hover:bg-yellow-50 dark:border-yellow-700 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700"
            >
              Venteliste
            </button>
          </div>
        </div>
      )}

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
        registrations={filteredRegistrations.map(r => ({
          ...r,
          eventSlug: slug,
          _id: r._id || '',
        }))}
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
  )
}
