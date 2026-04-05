import { type Metadata } from 'next'
import Link from 'next/link'

import { SimpleLayout } from '@/components/SimpleLayout'
import { ResearchProjectCard } from '@/components/ResearchProjectCard'
import { SurveyCallToAction } from '@/components/SurveyCallToAction'
import { getAllProjects, getOpenSurveys } from '@/lib/research/helpers'

export const metadata: Metadata = {
  title: 'Forskning',
  description:
    'Forskning og undersøkelser fra Offentlig PaaS-nettverket. Studier over tid om plattformmodenhet, teknologivalg og organisasjonsutvikling i offentlig sektor.',
}

export default async function ResearchPage() {
  const projects = getAllProjects()
  const openSurveys = getOpenSurveys()

  return (
    <SimpleLayout
      title="Forskning"
      intro="Vi forsker på plattformutvikling, teknologivalg og organisasjonsmodenhet i offentlig sektor. Alle datasett og publikasjoner er åpent tilgjengelige."
    >
      {openSurveys.length > 0 && (
        <div className="mt-8 space-y-4">
          {openSurveys.map(({ project }) => (
            <SurveyCallToAction key={project.slug} projectSlug={project.slug} />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 text-sm">
        <Link
          href="https://github.com/offentlig-paas/forskning"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
        >
          GitHub-repoet
        </Link>
      </div>

      <div className="mt-16 space-y-12 sm:mt-20">
        {projects.map(project => (
          <ResearchProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SimpleLayout>
  )
}
