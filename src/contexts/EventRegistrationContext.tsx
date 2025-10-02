'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import type { AttendanceType } from '@/lib/events/types'

interface RegistrationCounts {
  totalActive: number
  persons: number
  organizations: number
  uniqueOrganizations: number
}

interface Participant {
  name: string
  slackUserId?: string
}

interface ParticipantData {
  participants: Participant[]
  totalCount: number
}

interface Registration {
  _id?: string
  attendingSocialEvent?: boolean
  attendanceType?: AttendanceType
  [key: string]: unknown
}

interface EventRegistrationContextValue {
  isRegistered: boolean
  registration: Registration | null
  registrationCounts: RegistrationCounts | null
  participantData: ParticipantData | null
  isLoading: boolean
  isCheckingStatus: boolean
  refetch: () => Promise<void>
}

const EventRegistrationContext =
  createContext<EventRegistrationContextValue | null>(null)

interface EventRegistrationProviderProps {
  children: ReactNode
  eventSlug: string
}

export function EventRegistrationProvider({
  children,
  eventSlug,
}: EventRegistrationProviderProps) {
  const { data: session, status } = useSession()

  const [state, setState] = useState({
    isRegistered: false,
    registration: null as Registration | null,
    registrationCounts: null as RegistrationCounts | null,
    participantData: null as ParticipantData | null,
    isLoading: false,
    isCheckingStatus: true,
  })

  const fetchData = useCallback(async () => {
    // If not authenticated and not loading, fetch public stats only
    if (!session?.user?.slackId && status !== 'loading') {
      try {
        const response = await fetch(`/api/events/${eventSlug}/stats`)
        if (response.ok) {
          const data = await response.json()
          setState(prev => ({
            ...prev,
            registrationCounts: data.registrationCounts,
            participantData: null,
            isCheckingStatus: false,
          }))
        } else {
          setState(prev => ({ ...prev, isCheckingStatus: false }))
        }
      } catch (error) {
        console.error('Error fetching public stats:', error)
        setState(prev => ({ ...prev, isCheckingStatus: false }))
      }
      return
    }

    // If still loading session, wait
    if (!session?.user?.slackId) {
      setState(prev => ({ ...prev, isCheckingStatus: status === 'loading' }))
      return
    }

    // Fetch authenticated user data
    setState(prev => ({ ...prev, isCheckingStatus: true }))
    try {
      const regResponse = await fetch(`/api/events/${eventSlug}/registration`)

      if (regResponse.ok) {
        const data = await regResponse.json()

        // Fetch participants if registered
        let participants = null
        if (data.isRegistered) {
          try {
            const participantsResponse = await fetch(
              `/api/events/${eventSlug}/participants`
            )
            if (participantsResponse.ok) {
              participants = await participantsResponse.json()
            }
          } catch (error) {
            console.error('Error fetching participants:', error)
          }
        }

        setState(prev => ({
          ...prev,
          isRegistered: data.isRegistered,
          registration: data.registration || null,
          registrationCounts:
            data.registrationCounts || prev.registrationCounts,
          participantData: participants,
          isCheckingStatus: false,
        }))
      } else {
        console.warn('Failed to check registration status:', regResponse.status)
        setState(prev => ({ ...prev, isCheckingStatus: false }))
      }
    } catch (error) {
      console.error('Error checking registration status:', error)
      setState(prev => ({ ...prev, isCheckingStatus: false }))
    }
  }, [eventSlug, session?.user?.slackId, status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const value: EventRegistrationContextValue = {
    isRegistered: state.isRegistered,
    registration: state.registration,
    registrationCounts: state.registrationCounts,
    participantData: state.participantData,
    isLoading: state.isLoading,
    isCheckingStatus: state.isCheckingStatus,
    refetch: fetchData,
  }

  return (
    <EventRegistrationContext.Provider value={value}>
      {children}
    </EventRegistrationContext.Provider>
  )
}

export function useEventRegistration() {
  const context = useContext(EventRegistrationContext)
  if (!context) {
    throw new Error(
      'useEventRegistration must be used within EventRegistrationProvider'
    )
  }
  return context
}
