'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { RegistrationStats, Registration } from '@/types/api/registration'
import type { EventParticipantInfo } from '@/lib/events/types'
import type { RegistrationStatus } from '@/domains/event-registration/types'
import { trpc } from '@/lib/trpc/client'

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

  const {
    data: registrationData,
    isLoading: isLoadingRegistration,
    refetch,
  } = trpc.eventRegistration.getRegistrationStatus.useQuery(
    { slug: eventSlug },
    {
      enabled: !!session?.user?.slackId,
      refetchOnWindowFocus: false,
    }
  )

  const { data: statsData, isLoading: isLoadingStats } =
    trpc.eventRegistration.getStats.useQuery(
      { slug: eventSlug },
      {
        enabled: !session?.user?.slackId && status !== 'loading',
        refetchOnWindowFocus: false,
      }
    )

  const isCheckingStatus =
    status === 'loading' ||
    (session?.user?.slackId ? isLoadingRegistration : isLoadingStats)

  let stats: RegistrationStats | null = null
  let registrationStatus: RegistrationStatus | null = null
  let registration: Registration | null = null
  let participantInfo: EventParticipantInfo | null = null

  if (registrationData) {
    stats = registrationData.stats
    registrationStatus = registrationData.registrationStatus
    registration = registrationData.registration as Registration | null
    participantInfo = registrationData.participantInfo
  } else if (statsData) {
    stats = {
      total: 0,
      persons: statsData.registrationCounts.persons,
      organizations: statsData.registrationCounts.organizations,
      uniqueOrganizations: statsData.registrationCounts.uniqueOrganizations,
      participants: [],
    }
  }

  const value: EventRegistrationContextValue = {
    registrationStatus,
    registration,
    stats,
    participantInfo,
    isLoading: false,
    isCheckingStatus,
    refetch: async () => {
      await refetch()
    },
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
