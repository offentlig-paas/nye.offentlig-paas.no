import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminSurveyListClient } from '@/components/AdminSurveyListClient'
import { createCaller } from '@/server/root'

function SurveyListSkeleton() {
  return (
    <AdminLayout
      title="Forskning"
      intro="Oversikt over undersøkelser du har tilgang til."
      backButton={{ href: '/admin', label: 'Tilbake til admin' }}
    >
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </AdminLayout>
  )
}

async function SurveyListContent() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const caller = await createCaller()
  const surveys = await caller.admin.surveys.list()

  return (
    <AdminLayout
      title="Forskning"
      intro="Oversikt over undersøkelser du har tilgang til."
      backButton={{ href: '/admin', label: 'Tilbake til admin' }}
    >
      <AdminSurveyListClient surveys={surveys} />
    </AdminLayout>
  )
}

export default function AdminForskningPage() {
  return (
    <Suspense fallback={<SurveyListSkeleton />}>
      <SurveyListContent />
    </Suspense>
  )
}
