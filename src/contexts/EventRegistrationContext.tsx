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
import type {
  EventRegistrationResponse,
  RegistrationStats,
  Registration,
} from '@/types/api/registration'
import type { EventParticipantInfo } from '@/lib/events/types'
import type { RegistrationStatus } from '@/domains/event-registration/types'

interface EventRegistrationContextValue {
  registrationStatus: RegistrationStatus | null
  registration: Registration | null
  stats: RegistrationStats | null
  participantInfo: EventParticipantInfo | null
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
    registrationStatus: null as RegistrationStatus | null,
    registration: null as Registration | null,
    stats: null as RegistrationStats | null,
    participantInfo: null as EventParticipantInfo | null,
    isLoading: false,
    isCheckingStatus: true,
  })

  const fetchData = useCallback(async () => {
    // If not authenticated and not loading, fetch public stats only
    if (!session?.user?.slackId && status !== 'loading') {
      try {
        const response = await fetch(`/api/events/${eventSlug}/stats`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          setState(prev => ({
            ...prev,
            stats: {
              total: 0,
              persons: data.registrationCounts.persons,
              organizations: data.registrationCounts.organizations,
              uniqueOrganizations: data.registrationCounts.uniqueOrganizations,
              participants: [],
            },
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
      const regResponse = await fetch(`/api/events/${eventSlug}/registration`, {
        cache: 'no-store',
      })

      if (regResponse.ok) {
        const data: EventRegistrationResponse = await regResponse.json()

        setState(prev => ({
          ...prev,
          registrationStatus: data.registrationStatus,
          registration: data.registration,
          stats: data.stats,
          participantInfo: data.participantInfo,
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
    registrationStatus: state.registrationStatus,
    registration: state.registration,
    stats: state.stats,
    participantInfo: state.participantInfo,
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
