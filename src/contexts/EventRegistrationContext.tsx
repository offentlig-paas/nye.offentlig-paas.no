'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { EventWithDynamicData } from '@/lib/events/types'
import { trpc } from '@/lib/trpc/client'

interface EventRegistrationContextValue {
  event: EventWithDynamicData | null
  isLoading: boolean
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
  const { status } = useSession()

  const {
    data: eventData,
    isLoading,
    refetch,
  } = trpc.event.getBySlug.useQuery(
    { slug: eventSlug },
    {
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  )

  const isCheckingStatus = status === 'loading' || isLoading

  const value: EventRegistrationContextValue = {
    event: eventData || null,
    isLoading: isCheckingStatus,
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
