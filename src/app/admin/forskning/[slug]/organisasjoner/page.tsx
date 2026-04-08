import { Suspense } from 'react'
import { AdminSurveyOrganizationsClient } from '@/components/AdminSurveyOrganizationsClient'
import { createCaller } from '@/server/root'

interface AdminSurveyOrganizationsPageProps {
  params: Promise<{ slug: string }>
}

function OrgSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  )
}

async function OrgContent({ slug }: { slug: string }) {
  const caller = await createCaller()
  const data = await caller.admin.surveys.getOrganizations({ slug })
  return <AdminSurveyOrganizationsClient data={data} />
}

export default async function AdminSurveyOrganizationsPage({
  params,
}: AdminSurveyOrganizationsPageProps) {
  const { slug } = await params
  return (
    <Suspense fallback={<OrgSkeleton />}>
      <OrgContent slug={slug} />
    </Suspense>
  )
}
