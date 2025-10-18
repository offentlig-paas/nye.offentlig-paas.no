'use client'

import { AdminEventFeedback } from '@/components/AdminEventFeedback'
import { useAdminEvent } from '@/contexts/AdminEventContext'

export function AdminEventFeedbackClient() {
  const { slug } = useAdminEvent()

  return <AdminEventFeedback eventSlug={slug} />
}
