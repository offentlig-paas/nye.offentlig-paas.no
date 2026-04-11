import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { AdminSurveyResponsesClient } from '@/components/AdminSurveyResponsesClient'
import { createCaller } from '@/server/root'
import { getSurvey, getUserSurveyRole } from '@/lib/surveys/helpers'
import { members } from '@/data/members'
import { requireAdminOrSurveyAccess } from '@/lib/auth-guards'
import type { QuestionMeta } from '@/components/AdminSurveyResponsesClient'

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

function buildQuestionMeta(slug: string): Map<string, QuestionMeta> {
  const survey = getSurvey(slug)
  if (!survey) return new Map()

  const meta = new Map<string, QuestionMeta>()
  for (const section of survey.sections) {
    for (const q of section.questions) {
      const optionLabels = new Map<string, string>()
      if ('options' in q && Array.isArray(q.options)) {
        for (const opt of q.options) {
          optionLabels.set(opt.value, opt.label)
        }
      }
      meta.set(q.id, {
        title: q.title,
        sectionTitle: section.title,
        optionLabels: Object.fromEntries(optionLabels),
      })
    }
  }
  return meta
}

async function ResponsesContent({ slug }: { slug: string }) {
  const caller = await createCaller()
  const data = await caller.admin.surveys.getResponses({ slug })
  const questionMeta = buildQuestionMeta(slug)
  const memberNames = members
    .map(m => m.name)
    .sort((a, b) => a.localeCompare(b, 'nb'))
  return (
    <AdminSurveyResponsesClient
      slug={slug}
      initialData={data}
      questionMeta={Object.fromEntries(questionMeta)}
      memberNames={memberNames}
    />
  )
}

export default async function AdminSurveyResponsesPage({
  params,
}: AdminSurveyResponsesPageProps) {
  const { slug } = await params

  const session = await requireAdminOrSurveyAccess()
  const survey = getSurvey(slug)
  if (survey && getUserSurveyRole(survey, session.user) === 'researcher') {
    redirect(`/admin/forskning/${slug}`)
  }

  return (
    <Suspense fallback={<ResponsesSkeleton />}>
      <ResponsesContent slug={slug} />
    </Suspense>
  )
}
