import { Suspense } from 'react'
import { AdminSurveyOverviewClient } from '@/components/AdminSurveyOverviewClient'
import { AdminSurveyPilotLink } from '@/components/AdminSurveyPilotLink'
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
  const [overview, pilotLink] = await Promise.all([
    caller.admin.surveys.getOverview({ slug }),
    caller.admin.surveys.getPilotLink({ slug }),
  ])
  return (
    <div className="space-y-6">
      {pilotLink && (
        <AdminSurveyPilotLink
          slug={slug}
          title={overview.survey.title}
          url={pilotLink.url}
        />
      )}
      <AdminSurveyOverviewClient overview={overview} />
    </div>
  )
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
