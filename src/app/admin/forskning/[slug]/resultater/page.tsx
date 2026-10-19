import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SurveyResultsRenderer } from '@/components/SurveyResultsRenderer'
import { getSurvey, getUserSurveyRole } from '@/lib/surveys/helpers'
import { SurveyResultsActions } from '@/components/SurveyResultsActions'
import { SurveyResponseRepository } from '@/domains/survey-response/repository'
import { aggregateSurveyResults } from '@/lib/surveys/aggregation'
import { requireAdminOrSurveyAccess } from '@/lib/auth-guards'

interface AdminSurveyResultsPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ pilot?: string }>
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

async function ResultsContent({
  slug,
  pilot,
  pilotCount,
}: {
  slug: string
  pilot: boolean
  pilotCount: number
}) {
  const survey = getSurvey(slug)
  if (!survey) notFound()

  const repository = new SurveyResponseRepository()
  const orgQid = survey.organizationQuestionId ?? 'q1-org'

  const [responses, uniqueOrgs] = await Promise.all([
    repository.findBySurvey(survey.slug, pilot),
    repository.countUniqueOrganizations(survey.slug, orgQid, pilot),
  ])

  if (!pilot && responses.length === 0 && pilotCount > 0) {
    return (
      <p className="rounded-xl border border-gray-200 p-6 text-gray-700 dark:border-gray-700 dark:text-gray-300">
        Ingen svar ennå – {pilotCount} pilotsvar.{' '}
        <Link
          href={`/admin/forskning/${slug}/resultater?pilot=1`}
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Se pilotsvarene
        </Link>
      </p>
    )
  }

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
  searchParams,
}: AdminSurveyResultsPageProps) {
  const { slug } = await params
  const pilot = (await searchParams).pilot === '1'

  const session = await requireAdminOrSurveyAccess()
  const survey = getSurvey(slug)
  if (!survey) notFound()
  const isOwner = getUserSurveyRole(survey, session.user) === 'owner'
  const pilotCount = await new SurveyResponseRepository().countBySurvey(
    slug,
    true
  )
  const resultsHref = `/admin/forskning/${slug}/resultater`
  const exportHref = `/admin/forskning/${slug}/eksport`
  const pilotQuery = pilot ? '&pilot=1' : ''
  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      active
        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
    }`

  return (
    <div data-print-results>
      {pilotCount > 0 && (
        <nav
          aria-label="Velg hvilke svar som vises"
          className="mb-4 inline-flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 print:hidden"
        >
          <Link
            href={resultsHref}
            aria-current={pilot ? undefined : 'page'}
            className={tabClass(!pilot)}
          >
            Svar
          </Link>
          <Link
            href={`${resultsHref}?pilot=1`}
            aria-current={pilot ? 'page' : undefined}
            className={tabClass(pilot)}
          >
            Pilotsvar ({pilotCount})
          </Link>
        </nav>
      )}
      {pilot && (
        <p
          role="status"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          Du ser pilotsvar. De er bare til testing og er ikke med i resultatene.
        </p>
      )}
      <SurveyResultsActions
        freeTextHref={`/admin/forskning/${slug}/fritekst`}
        csvLinks={[
          ...(isOwner
            ? [
                {
                  href: `${exportHref}?type=raw${pilotQuery}`,
                  label: 'Last ned CSV (alle svar)',
                },
              ]
            : []),
          {
            href: `${exportHref}?type=aggregert${pilotQuery}`,
            label: isOwner ? 'Last ned CSV (oppsummert)' : 'Last ned CSV',
          },
        ]}
      />
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsContent slug={slug} pilot={pilot} pilotCount={pilotCount} />
      </Suspense>
    </div>
  )
}
