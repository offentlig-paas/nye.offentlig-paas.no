import { Suspense } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminMembersClient } from '@/components/AdminMembersClient'
import { createCaller } from '@/server/root'
import { requireAdmin } from '@/lib/auth-guards'

function AdminMembersSkeleton() {
  return (
    <AdminLayout
      title="Medlemmer"
      intro="Slack-representasjon per medlemsorganisasjon."
      backButton={{ href: '/admin', label: 'Tilbake til admin' }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </AdminLayout>
  )
}

async function AdminMembersContent() {
  await requireAdmin()

  const caller = await createCaller()
  const summary = await caller.admin.members.getSummary()

  return (
    <AdminLayout
      title="Medlemmer"
      intro="Slack-representasjon per medlemsorganisasjon."
      backButton={{ href: '/admin', label: 'Tilbake til admin' }}
    >
      <AdminMembersClient summary={summary} />
    </AdminLayout>
  )
}

export default function AdminMembersPage() {
  return (
    <Suspense fallback={<AdminMembersSkeleton />}>
      <AdminMembersContent />
    </Suspense>
  )
}
