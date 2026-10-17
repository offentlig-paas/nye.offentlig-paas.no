import { type Metadata } from 'next'
import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { researchProjects } from '@/data/research'
import { ResearchStatus } from '@/lib/research/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { getSurveyForProject, getConsentContact } from '@/lib/surveys/helpers'
import { Container } from '@/components/Container'
import { SurveyForm } from '@/components/SurveyForm'
import { isValidPilotToken } from '@/lib/surveys/pilot'

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ pilot?: string | string[] }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const project = researchProjects.find(p => p.slug === slug)
  const survey = getSurveyForProject(slug, 'form')
  if (!project) return {}

  return {
    title: survey?.title ?? `Undersøkelse — ${project.title}`,
    description: survey?.description ?? project.description,
  }
}

async function SurveyPageContent({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await params
  const { pilot } = await searchParams
  const project = researchProjects.find(p => p.slug === slug)
  if (!project) notFound()

  const pilotToken = typeof pilot === 'string' ? pilot : undefined
  const pilotSurvey =
    pilotToken !== undefined ? getSurveyForProject(slug, 'pilot') : undefined
  const isPilot = !!pilotSurvey && isValidPilotToken(pilotToken)
  const survey = isPilot ? pilotSurvey : getSurveyForProject(slug, 'form')

  if (!survey && pilotToken !== undefined) {
    return <NotAvailable slug={slug} nextWavePlanned={false} />
  }

  if (!survey) {
    const externalSurvey = project.surveys?.find(
      s => !('surveySlug' in s) && s.status === SurveyStatus.Open && s.url
    )
    if (externalSurvey && 'url' in externalSurvey && externalSurvey.url) {
      redirect(externalSurvey.url)
    }
    redirect('/forskning')
  }

  if (survey.status !== SurveyStatus.Open && !isPilot) {
    return (
      <NotAvailable
        slug={slug}
        nextWavePlanned={
          project.waves?.some(w => w.status === ResearchStatus.Planning) ??
          false
        }
      />
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
        {isPilot && (
          <p
            role="note"
            className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
          >
            Pilotversjon. Svarene brukes bare til å teste skjemaet og slettes
            før undersøkelsen åpnes.
          </p>
        )}
        <div className="mt-10">
          <SurveyForm
            survey={survey}
            contact={contact}
            pilotToken={isPilot ? pilotToken : undefined}
          />
        </div>
      </div>
    </Container>
  )
}

function NotAvailable({
  slug,
  nextWavePlanned,
}: {
  slug: string
  nextWavePlanned: boolean
}) {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Undersøkelsen er ikke tilgjengelig
        </h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {nextWavePlanned
            ? 'Forrige runde er avsluttet, og neste runde er under planlegging. Se'
            : 'Denne undersøkelsen er ikke åpen for svar. Se'}{' '}
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

export default function SurveyPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  return (
    <Suspense>
      <SurveyPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
