'use client'

import { createContext, useContext } from 'react'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type RouterOutput = inferRouterOutputs<AppRouter>
type EventDetails = RouterOutput['admin']['events']['getDetails']

interface AdminEventContextValue {
  slug: string
  eventDetails: EventDetails
  photosCount: number
}

const AdminEventContext = createContext<AdminEventContextValue | null>(null)

export function AdminEventProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: AdminEventContextValue
}) {
  return (
    <AdminEventContext.Provider value={value}>
      {children}
    </AdminEventContext.Provider>
  )
}

export function useAdminEvent() {
  const context = useContext(AdminEventContext)
  if (!context) {
    throw new Error('useAdminEvent must be used within AdminEventProvider')
  }
  return context
}
