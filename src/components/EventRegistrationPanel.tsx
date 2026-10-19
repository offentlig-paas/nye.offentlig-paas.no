import { Button } from './Button'
import { EventRegistrationForm } from './EventRegistrationForm'
import { EventParticipantInfo } from './EventParticipantInfo'
import { EventCalendarDownload } from './EventCalendarDownload'
import { VideoCameraIcon } from '@heroicons/react/20/solid'
import { AttendanceType, type Event } from '@/lib/events/types'
import { isPhysicalRegistrationClosed } from '@/lib/events/helpers'

interface EventRegistrationPanelProps {
  event: Event
  eventSlug: string
  eventUrl: string
  isAcceptingRegistrations: boolean
}

/**
 * Master panel for event registration and related actions.
 * Manages the complete registration flow including:
 * - Registration form (EventRegistrationForm)
 * - Participant info (streaming links for registered users)
 * - Alternative registration options (external URL, CFP)
 * - Calendar downloads
 * - Recording links for past events
 */
export function EventRegistrationPanel({
  event,
  eventSlug,
  eventUrl,
  isAcceptingRegistrations,
}: EventRegistrationPanelProps) {
  const physicalClosed =
    isAcceptingRegistrations &&
    event.registration.attendanceTypes.includes(AttendanceType.Physical) &&
    isPhysicalRegistrationClosed(event)
  return (
    <div className="space-y-4">
      {physicalClosed && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900/60">
          Fysiske plasser er fordelt. Du kan stå på venteliste, men får bare
          plass hvis arrangøren tildeler den.
        </p>
      )}

      {/* Main Registration Form */}
      <EventRegistrationForm
        eventSlug={eventSlug}
        eventTitle={event.title}
        isAcceptingRegistrations={isAcceptingRegistrations}
        attendanceTypes={event.registration.attendanceTypes}
        socialEvent={event.socialEvent}
      />

      {/* Participant Info (streaming links, etc.) */}
      <EventParticipantInfo event={event} />

      {/* External Registration Option */}
      {isAcceptingRegistrations && event.registrationUrl && (
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Eller bruk ekstern påmelding:
          </p>
          <Button
            href={event.registrationUrl}
            variant="secondary"
            className="w-full"
          >
            Ekstern registrering
          </Button>
        </div>
      )}

      {/* Calendar Downloads */}
      {isAcceptingRegistrations && (
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
          <div className="flex flex-col gap-2">
            <EventCalendarDownload event={event} url={eventUrl} />
          </div>
        </div>
      )}

      {/* Recording Link */}
      {!isAcceptingRegistrations && event.recordingUrl && (
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
          <Button
            href={event.recordingUrl}
            variant="secondary"
            className="w-full"
          >
            <VideoCameraIcon className="mr-1 h-4 w-4" aria-hidden="true" />
            Se opptak
          </Button>
        </div>
      )}
    </div>
  )
}
