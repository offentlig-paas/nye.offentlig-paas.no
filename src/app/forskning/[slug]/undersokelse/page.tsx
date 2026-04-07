import { type Metadata } from 'next'
import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { researchProjects } from '@/data/research'
import { SurveyStatus } from '@/lib/surveys/types'
import { getSurveyForProject, getConsentContact } from '@/lib/surveys/helpers'
import { Container } from '@/components/Container'
import { SurveyForm } from '@/components/SurveyForm'

type Params = Promise<{ slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const project = researchProjects.find(p => p.slug === slug)
  const survey = getSurveyForProject(slug)
  if (!project) return {}

  return {
    title: survey?.title ?? `Undersøkelse — ${project.title}`,
    description: survey?.description ?? project.description,
  }
}

async function SurveyPageContent({ params }: { params: Params }) {
  const { slug } = await params
  const project = researchProjects.find(p => p.slug === slug)
  if (!project) notFound()

  const survey = getSurveyForProject(slug)

  if (!survey) {
    const externalSurvey = project.surveys?.find(
      s => !('surveySlug' in s) && s.status === SurveyStatus.Open && s.url
    )
    if (externalSurvey && 'url' in externalSurvey && externalSurvey.url) {
      redirect(externalSurvey.url)
    }
    redirect('/forskning')
  }

  if (survey.status !== SurveyStatus.Open) {
    return (
      <Container className="mt-16 sm:mt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            Undersøkelsen er ikke tilgjengelig
          </h1>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Denne undersøkelsen er ikke åpen for svar. Se{' '}
            <a
              href={`/forskning/${slug}`}
              className="text-teal-500 hover:text-teal-600 dark:text-teal-400"
            >
              prosjektsiden
            </a>{' '}
            for mer informasjon.
          </p>
        </div>
      </Container>
    )
  }

  const contact = getConsentContact(survey.slug)
  if (!contact) {
    redirect('/forskning')
  }

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 sm:text-3xl dark:text-zinc-100">
          {survey.title}
        </h1>
        {survey.description && (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            {survey.description}
          </p>
        )}
        <div className="mt-10">
          <SurveyForm survey={survey} contact={contact} />
        </div>
      </div>
    </Container>
  )
}

export default function SurveyPage({ params }: { params: Params }) {
  return (
    <Suspense>
      <SurveyPageContent params={params} />
    </Suspense>
  )
}
