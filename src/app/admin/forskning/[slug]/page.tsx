import { Suspense } from 'react'
import { AdminSurveyOverviewClient } from '@/components/AdminSurveyOverviewClient'
import { createCaller } from '@/server/root'

interface AdminSurveyOverviewPageProps {
  params: Promise<{ slug: string }>
}

function OverviewSkeleton() {
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
      <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}

async function OverviewContent({ slug }: { slug: string }) {
  const caller = await createCaller()
  const overview = await caller.admin.surveys.getOverview({ slug })
  return <AdminSurveyOverviewClient overview={overview} />
}

export default async function AdminSurveyOverviewPage({
  params,
}: AdminSurveyOverviewPageProps) {
  const { slug } = await params
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent slug={slug} />
    </Suspense>
  )
}
