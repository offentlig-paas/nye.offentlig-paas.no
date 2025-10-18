'use client'

import { AdminEventPhotos } from './AdminEventPhotos'
import { useAdminEvent } from '@/contexts/AdminEventContext'
import { getEvent } from '@/lib/events/helpers'

export function AdminEventPhotosClient() {
  const { slug } = useAdminEvent()
  const event = getEvent(slug)

  if (!event) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">Event ikke funnet</p>
      </div>
    )
  }

  return <AdminEventPhotos slug={slug} event={event} />
}
