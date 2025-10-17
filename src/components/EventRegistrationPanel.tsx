import { Button } from './Button'
import { EventRegistrationForm } from './EventRegistrationForm'
import { EventParticipantInfo } from './EventParticipantInfo'
import { EventCalendarDownload } from './EventCalendarDownload'
import {
  PresentationChartLineIcon,
  VideoCameraIcon,
} from '@heroicons/react/20/solid'
import type { Event } from '@/lib/events/types'

interface EventRegistrationPanelProps {
  event: Event
  eventSlug: string
  eventUrl: string
  isAcceptingRegistrations: boolean
  isCallForPapersOpen: boolean
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
  isCallForPapersOpen,
}: EventRegistrationPanelProps) {
  return (
    <div className="space-y-4">
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

      {/* Call for Papers */}
      {isAcceptingRegistrations && isCallForPapersOpen && (
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
          <Button
            href={event.callForPapersUrl}
            variant="secondary"
            className="group w-full"
          >
            <PresentationChartLineIcon
              className="mr-1 h-4 w-4"
              aria-hidden="true"
            />
            Send inn forslag
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
