import { type Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowTopRightOnSquareIcon,
  CircleStackIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
} from '@heroicons/react/20/solid'

import { SimpleLayout } from '@/components/SimpleLayout'
import { ResearchProjectCard } from '@/components/ResearchProjectCard'
import { SurveyCallToAction } from '@/components/SurveyCallToAction'
import { getAllProjects, getOpenSurveys } from '@/lib/research/helpers'

export const metadata: Metadata = {
  title: 'Forskning',
  description:
    'Empirisk forskning og undersøkelser fra Offentlig PaaS-nettverket. Studier av plattformmodenhet, KI-kodeagenter, teknologivalg og organisasjonsutvikling i norsk offentlig sektor.',
}

export default async function ResearchPage() {
  const projects = getAllProjects()
  const openSurveys = getOpenSurveys()

  return (
    <SimpleLayout
      title="Forskning"
      intro="Vi gjennomfører empiriske studier av plattformutvikling, KI-verktøy, teknologivalg og organisasjonsmodenhet i norsk offentlig sektor. Alle anonymiserte datasett, spørreskjemaer og analyser publiseres åpent."
    >
      {openSurveys.length > 0 && (
        <div className="mt-8 space-y-4">
          {openSurveys.map(({ project }) => (
            <SurveyCallToAction key={project.slug} projectSlug={project.slug} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-5 py-3.5 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <Link
          href="https://github.com/offentlig-paas/forskning"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-teal-600 dark:text-zinc-300 dark:hover:text-teal-400"
        >
          <CodeBracketIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          GitHub-repo og analyse-skript
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-zinc-400" />
        </Link>
        <Link
          href="https://github.com/offentlig-paas/open-data"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-teal-600 dark:text-zinc-300 dark:hover:text-teal-400"
        >
          <CircleStackIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          Åpne datasett (CC BY 4.0)
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-zinc-400" />
        </Link>
        <Link
          href="https://github.com/offentlig-paas/forskning/blob/main/ETHICS.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-teal-600 dark:text-zinc-300 dark:hover:text-teal-400"
        >
          <ShieldCheckIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          Forskningsetiske retningslinjer (NESH / GDPR)
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-zinc-400" />
        </Link>
      </div>

      <div className="mt-12 space-y-10 sm:mt-14">
        {projects.map(project => (
          <ResearchProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SimpleLayout>
  )
}
