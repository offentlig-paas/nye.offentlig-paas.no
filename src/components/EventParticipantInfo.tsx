'use client'

import { VideoCameraIcon } from '@heroicons/react/20/solid'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import type { Event } from '@/lib/events/types'
import { Status } from '@/lib/events/types'
import { getStatus } from '@/lib/events/helpers'

interface EventParticipantInfoProps {
  event?: Event
}

export function EventParticipantInfo({
  event: propsEvent,
}: EventParticipantInfoProps = {}) {
  const { event: eventData, isLoading: isCheckingStatus } =
    useEventRegistration()
  const participantInfo = eventData?.participantInfo

  // Don't show streaming info for past events
  if (propsEvent && getStatus(propsEvent) === Status.Past) {
    return null
  }

  if (isCheckingStatus) {
    return null
  }

  const streamingUrl = participantInfo?.streamingUrl

  if (!participantInfo || !streamingUrl) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-xl bg-blue-50 p-6 shadow-sm ring-1 ring-blue-900/10 dark:bg-blue-950/20 dark:ring-blue-400/10">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <VideoCameraIcon
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Strømming for deltakere
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
            <p className="mb-2">
              Du har tilgang til denne informasjonen fordi du er påmeldt
              fagdagen.
            </p>
            <a
              href={streamingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <VideoCameraIcon className="mr-1.5 -ml-0.5 h-5 w-5" />
              Åpne strømming
            </a>
            {participantInfo.notes && (
              <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                {participantInfo.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
