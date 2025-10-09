'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useToast } from '@/components/ToastProvider'
import type { Event } from '@/lib/events/types'
import type { EventRegistration } from '@/domains/event-registration/types'
import { AttendanceType, AttendanceTypeDisplay } from '@/lib/events/types'
import {
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { formatDateLong } from '@/lib/formatDate'

interface EventRegistrationItem {
  event: Event
  registration: EventRegistration
}

interface ProfileEventRegistrationsProps {
  upcomingEvents: EventRegistrationItem[]
  pastEvents: EventRegistrationItem[]
}

interface RegistrationUpdate {
  attendanceType?: AttendanceType
  comments?: string
  attendingSocialEvent?: boolean
}

interface AttendanceTypeSelectorProps {
  selected?: AttendanceType
  onChange: (type: AttendanceType) => void
}

function AttendanceTypeSelector({
  selected,
  onChange,
}: AttendanceTypeSelectorProps) {
  const getButtonClasses = (type: AttendanceType) => {
    const isSelected = selected === type
    const base =
      'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition'
    const active =
      'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
    const inactive =
      'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500'

    return `${base} ${isSelected ? active : inactive}`
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(AttendanceType.Physical)}
        className={getButtonClasses(AttendanceType.Physical)}
      >
        {AttendanceTypeDisplay[AttendanceType.Physical]}
      </button>
      <button
        type="button"
        onClick={() => onChange(AttendanceType.Digital)}
        className={getButtonClasses(AttendanceType.Digital)}
      >
        {AttendanceTypeDisplay[AttendanceType.Digital]}
      </button>
    </div>
  )
}

interface EventHeaderProps {
  event: Event
  isPast: boolean
  isAttended: boolean
}

function EventHeader({ event, isPast, isAttended }: EventHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Link
          href={`/fagdag/${event.slug}`}
          className="text-lg font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
        >
          {event.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {event.ingress}
        </p>
      </div>
      {isPast && isAttended && (
        <span className="ml-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircleIcon className="mr-1 -ml-0.5 h-4 w-4" />
          Deltok
        </span>
      )}
    </div>
  )
}

interface EventDetailsProps {
  event: Event
}

function EventDetails({ event }: EventDetailsProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
        <CalendarIcon className="h-4 w-4 flex-shrink-0" />
        <span>{formatDateLong(event.start)}</span>
      </div>
      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
        <span>{event.location}</span>
      </div>
    </>
  )
}

interface RegistrationDisplayProps {
  registration: EventRegistration
  event: Event
}

function RegistrationDisplay({
  registration,
  event,
}: RegistrationDisplayProps) {
  return (
    <>
      {registration.attendanceType && (
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
          <span>{AttendanceTypeDisplay[registration.attendanceType]}</span>
        </div>
      )}

      {registration.comments && (
        <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Din kommentar:
          </p>
          <p className="mt-1">{registration.comments}</p>
        </div>
      )}

      {registration.attendingSocialEvent && event.socialEvent && (
        <div className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900 dark:bg-teal-900/20 dark:text-teal-300">
          ✓ Du er påmeldt det sosiale arrangementet
        </div>
      )}
    </>
  )
}

interface RegistrationFormProps {
  event: Event
  attendanceType?: AttendanceType
  comments: string
  attendingSocial: boolean
  onAttendanceTypeChange: (type: AttendanceType) => void
  onCommentsChange: (comments: string) => void
  onAttendingSocialChange: (attending: boolean) => void
}

function RegistrationForm({
  event,
  attendanceType,
  comments,
  attendingSocial,
  onAttendanceTypeChange,
  onCommentsChange,
  onAttendingSocialChange,
}: RegistrationFormProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
          Oppmøte
        </label>
        <AttendanceTypeSelector
          selected={attendanceType}
          onChange={onAttendanceTypeChange}
        />
      </div>

      {event.socialEvent && (
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id={`social-${event.slug}`}
            checked={attendingSocial}
            onChange={e => onAttendingSocialChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700"
          />
          <label
            htmlFor={`social-${event.slug}`}
            className="flex-1 cursor-pointer text-sm text-zinc-700 dark:text-zinc-300"
          >
            Jeg ønsker å delta på det sosiale arrangementet
          </label>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor={`comments-${event.slug}`}
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Kommentar
        </label>
        <textarea
          id={`comments-${event.slug}`}
          value={comments}
          onChange={e => onCommentsChange(e.target.value)}
          rows={3}
          placeholder="Legg til en kommentar..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>
    </>
  )
}

function EventCard({
  item,
  isPast,
  onCancel,
  onUpdate,
}: {
  item: EventRegistrationItem
  isPast: boolean
  onCancel?: (eventSlug: string) => void
  onUpdate?: (eventSlug: string, updates: RegistrationUpdate) => Promise<void>
}) {
  const { event, registration } = item
  const { showSuccess } = useToast()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editedAttendanceType, setEditedAttendanceType] = useState(
    registration.attendanceType
  )
  const [editedComments, setEditedComments] = useState(
    registration.comments || ''
  )
  const [editedAttendingSocial, setEditedAttendingSocial] = useState(
    registration.attendingSocialEvent || false
  )

  const handleCancel = async () => {
    if (!onCancel) return
    setIsCancelling(true)
    try {
      await onCancel(event.slug)
      setShowCancelModal(false)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSave = async () => {
    if (!onUpdate) return
    setIsSaving(true)
    try {
      await onUpdate(event.slug, {
        attendanceType: editedAttendanceType,
        comments: editedComments,
        attendingSocialEvent: editedAttendingSocial,
      })
      setIsEditing(false)
      showSuccess('Påmelding oppdatert', 'Endringene dine er lagret.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedAttendanceType(registration.attendanceType)
    setEditedComments(registration.comments || '')
    setEditedAttendingSocial(registration.attendingSocialEvent || false)
    setIsEditing(false)
  }

  return (
    <div className="group relative rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
      <EventHeader
        event={event}
        isPast={isPast}
        isAttended={registration.status === 'attended'}
      />

      <div className="mt-4 space-y-3 text-sm">
        <EventDetails event={event} />

        {!isPast && isEditing ? (
          <RegistrationForm
            event={event}
            attendanceType={editedAttendanceType}
            comments={editedComments}
            attendingSocial={editedAttendingSocial}
            onAttendanceTypeChange={setEditedAttendanceType}
            onCommentsChange={setEditedComments}
            onAttendingSocialChange={setEditedAttendingSocial}
          />
        ) : (
          <RegistrationDisplay registration={registration} event={event} />
        )}
      </div>

      {!isPast && (
        <div className="mt-6 flex gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-700">
          {isEditing ? (
            <>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                {isSaving ? 'Lagrer...' : 'Lagre endringer'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Avbryt
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Rediger påmelding
              </Button>
              <Link href={`/fagdag/${event.slug}`}>
                <Button variant="secondary">Se detaljer</Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(true)}
                className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Meld av
              </Button>
            </>
          )}
        </div>
      )}

      {isPast && (
        <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-700">
          <Link href={`/fagdag/${event.slug}`}>
            <Button variant="secondary">Se detaljer</Button>
          </Link>
        </div>
      )}

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Bekreft avmelding"
        message={`Er du sikker på at du vil melde deg av ${event.title}?`}
        confirmText="Meld av"
        cancelText="Avbryt"
        isLoading={isCancelling}
        variant="warning"
      />
    </div>
  )
}

export function ProfileEventRegistrations({
  upcomingEvents,
  pastEvents,
}: ProfileEventRegistrationsProps) {
  const { showSuccess, showError } = useToast()
  const [cancelledEvents, setCancelledEvents] = useState<Set<string>>(new Set())
  const [updatedRegistrations, setUpdatedRegistrations] = useState<
    Map<string, RegistrationUpdate>
  >(new Map())

  const handleCancel = async (eventSlug: string) => {
    try {
      const response = await fetch(`/api/events/${eventSlug}/registration`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCancelledEvents(prev => new Set(prev).add(eventSlug))
        showSuccess('Avmelding bekreftet', 'Du er nå avmeldt arrangementet.')
      } else {
        const data = await response.json()
        showError(
          'Feil ved avmelding',
          data.error || 'Noe gikk galt under avmeldingen.'
        )
      }
    } catch (error) {
      console.error('Cancellation error:', error)
      showError('Feil ved avmelding', 'Noe gikk galt under avmeldingen.')
    }
  }

  const handleUpdate = async (
    eventSlug: string,
    updates: RegistrationUpdate
  ) => {
    try {
      const response = await fetch(`/api/events/${eventSlug}/registration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setUpdatedRegistrations(prev => new Map(prev).set(eventSlug, updates))
      } else {
        const data = await response.json()
        showError(
          'Feil ved oppdatering',
          data.error || 'Noe gikk galt under oppdateringen.'
        )
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Update error:', error)
      showError('Feil ved oppdatering', 'Noe gikk galt under oppdateringen.')
      throw error
    }
  }

  const filteredUpcomingEvents = upcomingEvents
    .filter(item => !cancelledEvents.has(item.event.slug))
    .map(item => {
      const updates = updatedRegistrations.get(item.event.slug)
      if (updates) {
        return {
          ...item,
          registration: { ...item.registration, ...updates },
        }
      }
      return item
    })

  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Mine påmeldinger
        </h3>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
          <XCircleIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" />
          <h4 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Ingen påmeldinger ennå
          </h4>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Du har ikke meldt deg på noen arrangementer.
          </p>
          <div className="mt-6">
            <Link href="/fagdag">
              <Button variant="primary">Se kommende fagdager</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        Mine påmeldinger
      </h3>

      {filteredUpcomingEvents.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-4 text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Kommende arrangementer ({filteredUpcomingEvents.length})
          </h4>
          <div className="space-y-4">
            {filteredUpcomingEvents.map(item => (
              <EventCard
                key={item.event.slug}
                item={item}
                isPast={false}
                onCancel={handleCancel}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="mt-8">
          <h4 className="mb-4 text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Tidligere arrangementer ({pastEvents.length})
          </h4>
          <div className="space-y-4">
            {pastEvents.map(item => (
              <EventCard key={item.event.slug} item={item} isPast={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
