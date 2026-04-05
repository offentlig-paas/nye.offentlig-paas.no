import Link from 'next/link'
import clsx from 'clsx'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import {
  type ResearchProject,
  ResearchStatus,
  SurveyStatus,
} from '@/lib/research/types'

const statusColors: Record<ResearchStatus, string> = {
  [ResearchStatus.Planning]:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20',
  [ResearchStatus.DataCollection]:
    'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20',
  [ResearchStatus.Analysis]:
    'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/20',
  [ResearchStatus.Writing]:
    'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20',
  [ResearchStatus.UnderReview]:
    'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20',
  [ResearchStatus.Published]:
    'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20',
  [ResearchStatus.Ongoing]:
    'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-400 dark:ring-teal-400/20',
}

export function ResearchProjectCard({ project }: { project: ResearchProject }) {
  const openSurveys = (project.surveys ?? []).filter(
    s => s.status === SurveyStatus.Open
  ).length

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-700/40">
      <div className={project.callout ? 'flex' : ''}>
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                <Link
                  href={`/forskning/${project.slug}`}
                  className="hover:text-teal-500 dark:hover:text-teal-400"
                >
                  {project.title}
                </Link>
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {project.lead}
              </p>
            </div>
            <span
              className={clsx(
                'inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                statusColors[project.status] ??
                  statusColors[ResearchStatus.Planning]
              )}
            >
              {project.status}
            </span>
          </div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            {project.description}
          </p>
          {openSurveys > 0 && (
            <p className="mt-3 text-sm font-medium text-teal-600 dark:text-teal-400">
              {openSurveys === 1
                ? '1 åpen undersøkelse'
                : `${openSurveys} åpne undersøkelser`}
            </p>
          )}
          <Link
            href={`/forskning/${project.slug}`}
            className="mt-4 inline-flex items-center text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Les mer
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </div>
        {project.callout && (
          <Link
            href={project.callout.linkHref}
            className="hidden w-1/3 flex-col justify-between bg-linear-to-br from-sky-900 to-blue-950 p-6 transition hover:from-sky-800 hover:to-blue-900 md:flex"
          >
            <div>
              <p className="text-xl font-bold text-white">
                {project.callout.headline}
              </p>
              <p className="mt-2 text-base text-sky-200">
                {project.callout.subtitle}
              </p>
            </div>
            <span className="mt-4 inline-flex items-center self-start rounded-lg bg-teal-500 px-4 py-2 text-base font-semibold text-white">
              {project.callout.linkText}
              <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4" />
            </span>
          </Link>
        )}
      </div>
    </article>
  )
}
