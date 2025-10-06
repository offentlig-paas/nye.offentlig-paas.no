'use client'

import { useEffect, useState } from 'react'
import { VideoCameraIcon } from '@heroicons/react/20/solid'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import type { EventParticipantInfo as EventParticipantInfoType } from '@/lib/events/types'

interface EventParticipantInfoProps {
  eventSlug: string
}

export function EventParticipantInfo({ eventSlug }: EventParticipantInfoProps) {
  const { isRegistered, isCheckingStatus } = useEventRegistration()
  const [participantInfo, setParticipantInfo] =
    useState<EventParticipantInfoType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isRegistered || isCheckingStatus) {
      return
    }

    const fetchParticipantInfo = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(
          `/api/events/${eventSlug}/participant-info`
        )

        if (response.status === 404) {
          setParticipantInfo(null)
          return
        }

        if (!response.ok) {
          setParticipantInfo(null)
          return
        }

        const data = await response.json()
        setParticipantInfo(data)
      } catch {
        setParticipantInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchParticipantInfo()
  }, [eventSlug, isRegistered, isCheckingStatus])

  if (isCheckingStatus || isLoading) {
    return null
  }

  if (!isRegistered) {
    return null
  }

  if (!participantInfo || !participantInfo.streamingUrl) {
    return null
  }

  return (
    <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <VideoCameraIcon
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Strømming for påmeldte deltakere
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
            <p className="mb-2">
              Du har tilgang til denne informasjonen fordi du er påmeldt
              fagdagen.
            </p>
            <a
              href={participantInfo.streamingUrl}
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
