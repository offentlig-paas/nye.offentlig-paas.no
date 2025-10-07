import { useEffect, useState } from 'react'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import type { EventParticipantInfo } from '@/lib/events/types'

export function useEventParticipantInfo(eventSlug: string) {
  const { isRegistered, isCheckingStatus } = useEventRegistration()
  const [participantInfo, setParticipantInfo] =
    useState<EventParticipantInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isRegistered || isCheckingStatus) {
      setParticipantInfo(null)
      return
    }

    const fetchParticipantInfo = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/events/${eventSlug}/participant-info`
        )

        if (response.status === 404) {
          setParticipantInfo(null)
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch participant info')
        }

        const data = await response.json()
        setParticipantInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setParticipantInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchParticipantInfo()
  }, [eventSlug, isRegistered, isCheckingStatus])

  return {
    participantInfo,
    isLoading,
    error,
    streamingUrl: participantInfo?.streamingUrl,
    notes: participantInfo?.notes,
  }
}
