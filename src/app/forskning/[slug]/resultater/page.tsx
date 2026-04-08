import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Container } from '@/components/Container'
import { SurveyResultsRenderer } from '@/components/SurveyResultsRenderer'
import { getProject } from '@/lib/research/helpers'
import { getSurveyForProject } from '@/lib/surveys/helpers'
import { createCaller } from '@/server/root'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'

interface ResultsPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}

  return {
    title: `Resultater — ${project.title}`,
    description: `Foreløpige resultater fra undersøkelsen "${project.title}".`,
  }
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
  const project = getProject(slug)
  if (!project) notFound()

  const survey = getSurveyForProject(slug)
  if (!survey || !survey.resultsConfig?.published) notFound()

  const caller = await createCaller()
  const data = await caller.survey.getAggregatedResults({
    surveySlug: survey.slug,
  })

  return (
    <SurveyResultsRenderer
      results={data}
      uniqueOrganizations={data.uniqueOrganizations}
      heroText={data.heroText}
      methodologyNote={data.methodologyNote}
    />
  )
}

export default async function SurveyResultsPage({ params }: ResultsPageProps) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const survey = getSurveyForProject(slug)
  if (!survey || !survey.resultsConfig?.published) notFound()

  return (
    <Container className="mt-8 sm:mt-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/forskning/${slug}`}
          className="group mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Tilbake til prosjektet
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-100">
          Resultater — {project.title}
        </h1>

        <div className="mt-8">
          <Suspense fallback={<ResultsSkeleton />}>
            <ResultsContent slug={slug} />
          </Suspense>
        </div>
      </div>
    </Container>
  )
}
