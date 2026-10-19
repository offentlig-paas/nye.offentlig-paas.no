import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { SurveyResultsRenderer } from '@/components/SurveyResultsRenderer'
import { getSurvey, getUserSurveyRole } from '@/lib/surveys/helpers'
import { SurveyResultsActions } from '@/components/SurveyResultsActions'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'
import { aggregateSurveyResults } from '@/lib/surveys/aggregation'
import { requireAdminOrSurveyAccess } from '@/lib/auth-guards'

interface AdminSurveyResultsPageProps {
  params: Promise<{ slug: string }>
}

function ResultsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  )
}

async function ResultsContent({ slug }: { slug: string }) {
  const survey = getSurvey(slug)
  if (!survey) notFound()

  const repository = new SurveyResponseRepository()
  const orgQid = survey.organizationQuestionId ?? 'q1-org'

  const [responses, uniqueOrgs] = await Promise.all([
    repository.findBySurvey(survey.slug),
    repository.countUniqueOrganizations(survey.slug, orgQid),
  ])

  const aggregated = aggregateSurveyResults(survey, responses)

  return (
    <SurveyResultsRenderer
      results={aggregated}
      uniqueOrganizations={uniqueOrgs}
      heroText={survey.resultsConfig?.heroText}
      methodologyNote={survey.resultsConfig?.methodologyNote}
    />
  )
}

export default async function AdminSurveyResultsPage({
  params,
}: AdminSurveyResultsPageProps) {
  const { slug } = await params

  const session = await requireAdminOrSurveyAccess()
  const survey = getSurvey(slug)
  if (!survey) notFound()
  const isOwner = getUserSurveyRole(survey, session.user) === 'owner'
  const exportHref = `/admin/forskning/${slug}/eksport`

  return (
    <div data-print-results>
      <SurveyResultsActions
        freeTextHref={`/admin/forskning/${slug}/fritekst`}
        csvLinks={[
          ...(isOwner
            ? [
                {
                  href: `${exportHref}?type=raw`,
                  label: 'Last ned CSV (alle svar)',
                },
              ]
            : []),
          {
            href: `${exportHref}?type=aggregert`,
            label: isOwner ? 'Last ned CSV (oppsummert)' : 'Last ned CSV',
          },
        ]}
      />
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsContent slug={slug} />
      </Suspense>
    </div>
  )
}
