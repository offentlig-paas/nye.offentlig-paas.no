import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { researchProjects } from '@/data/research'
import { SurveyStatus } from '@/lib/research/types'

export function SurveyCallToAction({
  projectSlug,
  surveyIndex = 0,
}: {
  projectSlug: string
  surveyIndex?: number
}) {
  const project = researchProjects.find(p => p.slug === projectSlug)
  if (!project) return null
  const survey = project.surveys?.[surveyIndex]
  if (!survey?.url || survey.status !== SurveyStatus.Open) return null

  const surveyUrl = `/forskning/${projectSlug}/undersokelse`

  return (
    <div className="not-prose my-10">
      <a
        href={surveyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl border-2 border-teal-500/30 bg-teal-50/50 p-6 transition hover:border-teal-500/50 hover:bg-teal-50 dark:border-teal-400/20 dark:bg-teal-400/5 dark:hover:border-teal-400/40 dark:hover:bg-teal-400/10"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500" />
          </span>
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            Aktiv undersøkelse
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {survey.title}
          <ArrowTopRightOnSquareIcon className="ml-2 inline h-4 w-4 text-zinc-400 transition group-hover:text-teal-500" />
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>
        {survey.description && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {survey.description}
          </p>
        )}
        <span className="mt-3 inline-flex items-center text-sm font-medium text-teal-600 dark:text-teal-400">
          Svar på undersøkelsen
          <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
        </span>
      </a>
    </div>
  )
}
