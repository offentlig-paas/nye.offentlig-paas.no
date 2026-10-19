import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminSurveyNav } from '@/components/AdminSurveyNav'
import { getSurvey, getUserSurveyRole } from '@/lib/surveys/helpers'
import { requireAdminOrSurveyAccess } from '@/lib/auth-guards'
import { Badge } from '@/components/Badge'
import { surveyStatusLabels } from '@/lib/surveys/status-labels'

interface AdminSurveyLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

function NavSkeleton() {
  const shimmer = 'animate-pulse rounded bg-gray-200 dark:bg-gray-700' as const

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4"
          >
            <div className={`h-5 w-5 ${shimmer}`} />
            <div className={`h-4 w-16 ${shimmer}`} />
          </div>
        ))}
      </nav>
    </div>
  )
}

export default async function AdminSurveyLayout({
  children,
  params,
}: AdminSurveyLayoutProps) {
  const { slug } = await params

  const survey = getSurvey(slug)
  if (!survey) {
    notFound()
  }

  const session = await requireAdminOrSurveyAccess()
  const role = getUserSurveyRole(survey, session.user)
  if (!role) {
    notFound()
  }

  const status = surveyStatusLabels[survey.status] ?? surveyStatusLabels.draft!

  return (
    <AdminLayout
      actions={<Badge color={status.color}>{status.label}</Badge>}
      title={survey.title}
      intro={survey.description ?? ''}
      backButton={{
        href: '/admin/forskning',
        label: 'Tilbake til forskning',
      }}
    >
      <Suspense fallback={<NavSkeleton />}>
        <div className="space-y-4">
          <AdminSurveyNav surveySlug={slug} role={role} />
          {children}
        </div>
      </Suspense>
    </AdminLayout>
  )
}
