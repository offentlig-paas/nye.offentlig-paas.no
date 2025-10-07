'use client'

import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useEventParticipantInfo } from '@/hooks/useEventParticipantInfo'
import type { EventParticipantInfo } from '@/lib/events/types'

interface EventParticipantInfoContextValue {
  participantInfo: EventParticipantInfo | null
  isLoading: boolean
  error: Error | null
  streamingUrl?: string
  notes?: string
}

const EventParticipantInfoContext =
  createContext<EventParticipantInfoContextValue | null>(null)

interface EventParticipantInfoProviderProps {
  eventSlug: string
  children: ReactNode
}

export function EventParticipantInfoProvider({
  eventSlug,
  children,
}: EventParticipantInfoProviderProps) {
  const hookValue = useEventParticipantInfo(eventSlug)

  return (
    <EventParticipantInfoContext.Provider value={hookValue}>
      {children}
    </EventParticipantInfoContext.Provider>
  )
}

export function useEventParticipantInfoContext() {
  const context = useContext(EventParticipantInfoContext)

  if (!context) {
    throw new Error(
      'useEventParticipantInfoContext must be used within EventParticipantInfoProvider'
    )
  }

  return context
}
