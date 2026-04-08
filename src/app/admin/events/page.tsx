import { Suspense } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminEventsClient } from '@/components/AdminEventsClient'
import { createCaller } from '@/server/root'

function AdminEventsListSkeleton() {
  return (
    <AdminLayout
      title="Admin - Fagdager"
      intro="Oversikt over alle fagdager og påmeldinger."
      backButton={{
        href: '/admin',
        label: 'Tilbake til admin',
      }}
    >
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </AdminLayout>
  )
}

async function AdminEventsContent() {
  const caller = await createCaller()
  const eventsData = await caller.admin.events.list()

  return (
    <AdminLayout
      title="Admin - Fagdager"
      intro="Oversikt over alle fagdager og påmeldinger."
      backButton={{
        href: '/admin',
        label: 'Tilbake til admin',
      }}
    >
      <AdminEventsClient eventsData={eventsData} />
    </AdminLayout>
  )
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={<AdminEventsListSkeleton />}>
      <AdminEventsContent />
    </Suspense>
  )
}
