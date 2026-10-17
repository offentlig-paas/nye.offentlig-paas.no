import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { AdminSurveyResponsesClient } from '@/components/AdminSurveyResponsesClient'
import { AdminSurveyPilotLink } from '@/components/AdminSurveyPilotLink'
import { createCaller } from '@/server/root'
import { getSurvey, getUserSurveyRole } from '@/lib/surveys/helpers'
import { members } from '@/data/members'
import { requireAdminOrSurveyAccess } from '@/lib/auth-guards'
import type { QuestionMeta } from '@/components/AdminSurveyResponsesClient'

interface AdminSurveyResponsesPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ pilot?: string }>
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

async function ResponsesContent({
  slug,
  pilot,
  isOwner,
}: {
  slug: string
  pilot: boolean
  isOwner: boolean
}) {
  const caller = await createCaller()
  const [data, pilotLink] = await Promise.all([
    caller.admin.surveys.getResponses({ slug, pilot }),
    pilot ? caller.admin.surveys.getPilotLink({ slug }) : null,
  ])
  const questionMeta = buildQuestionMeta(slug)
  const memberNames = members
    .map(m => m.name)
    .sort((a, b) => a.localeCompare(b, 'nb'))
  return (
    <div className="space-y-6">
      {pilotLink && (
        <AdminSurveyPilotLink
          slug={slug}
          title={getSurvey(slug)?.title ?? slug}
          url={pilotLink.url}
        />
      )}
      <AdminSurveyResponsesClient
        slug={slug}
        initialData={data}
        questionMeta={Object.fromEntries(questionMeta)}
        memberNames={memberNames}
        pilot={pilot}
        isOwner={isOwner}
      />
    </div>
  )
}

export default async function AdminSurveyResponsesPage({
  params,
  searchParams,
}: AdminSurveyResponsesPageProps) {
  const { slug } = await params
  const pilot = (await searchParams).pilot === '1'

  const session = await requireAdminOrSurveyAccess()
  const survey = getSurvey(slug)
  const isOwner =
    !survey || getUserSurveyRole(survey, session.user) !== 'researcher'
  if (!isOwner && !pilot) {
    redirect(`/admin/forskning/${slug}`)
  }

  return (
    <Suspense fallback={<ResponsesSkeleton />}>
      <ResponsesContent slug={slug} pilot={pilot} isOwner={isOwner} />
    </Suspense>
  )
}
