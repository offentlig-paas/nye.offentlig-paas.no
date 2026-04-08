import { Suspense } from 'react'
import { AdminSurveyResponsesClient } from '@/components/AdminSurveyResponsesClient'
import { createCaller } from '@/server/root'

interface AdminSurveyResponsesPageProps {
  params: Promise<{ slug: string }>
}

function ResponsesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  )
}

async function ResponsesContent({ slug }: { slug: string }) {
  const caller = await createCaller()
  const data = await caller.admin.surveys.getResponses({ slug })
  return <AdminSurveyResponsesClient slug={slug} initialData={data} />
}

export default async function AdminSurveyResponsesPage({
  params,
}: AdminSurveyResponsesPageProps) {
  const { slug } = await params
  return (
    <Suspense fallback={<ResponsesSkeleton />}>
      <ResponsesContent slug={slug} />
    </Suspense>
  )
}
