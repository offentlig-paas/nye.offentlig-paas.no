import Link from 'next/link'
import clsx from 'clsx'
import {
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  CircleStackIcon,
  ChartBarIcon,
} from '@heroicons/react/20/solid'
import {
  type ResearchProject,
  ResearchStatus,
  SurveyStatus,
} from '@/lib/research/types'
import {
  statusColors,
  getSurveyStatus,
  hasPublishedSurveyResults,
} from '@/lib/research/helpers'
import { formatDate } from '@/lib/formatDate'

export function ResearchProjectCard({ project }: { project: ResearchProject }) {
  const openSurveys = (project.surveys ?? []).filter(
    s => getSurveyStatus(s) === SurveyStatus.Open
  ).length
  const hasPublishedResults = (project.surveys ?? []).some(s =>
    hasPublishedSurveyResults(s)
  )
  const primaryPaper = project.papers?.[0]
  const datasetCount = project.datasets?.length ?? 0

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs transition hover:border-zinc-300 dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:hover:border-zinc-600">
      <div className={project.callout ? 'flex' : ''}>
        <div className="flex-1 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                <Link
                  href={`/forskning/${project.slug}`}
                  className="hover:text-teal-600 dark:hover:text-teal-400"
                >
                  {project.title}
                </Link>
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {project.team ? project.team.join(', ') : project.lead}
                </span>
                <span aria-hidden="true">·</span>
                <span>Oppdatert {formatDate(project.lastUpdated)}</span>
              </div>
            </div>
            <span
              className={clsx(
                'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                statusColors[project.status] ??
                  statusColors[ResearchStatus.Planning]
              )}
            >
              {project.status}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {project.description}
          </p>

          {project.stats && project.stats.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {project.stats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-mono text-xl font-bold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
                    {stat.value}
                  </dd>
                  {stat.subtext && (
                    <dd className="mt-0.5 text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
                      {stat.subtext}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          )}

          {openSurveys > 0 && (
            <p className="mt-4 text-sm font-medium text-teal-600 dark:text-teal-400">
              {openSurveys === 1
                ? '1 åpen undersøkelse'
                : `${openSurveys} åpne undersøkelser`}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
            <Link
              href={`/forskning/${project.slug}`}
              className="inline-flex items-center font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Utforsk prosjektet
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </Link>

            {primaryPaper?.url && (
              <a
                href={primaryPaper.url}
                className="inline-flex items-center gap-1.5 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <DocumentTextIcon className="h-4 w-4 text-zinc-400" />
                {primaryPaper.label ?? 'Les rapport (PDF)'}
              </a>
            )}

            {hasPublishedResults && (
              <Link
                href={`/forskning/${project.slug}/resultater`}
                className="inline-flex items-center gap-1.5 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <ChartBarIcon className="h-4 w-4 text-zinc-400" />
                Se alle svar
              </Link>
            )}

            {datasetCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <CircleStackIcon className="h-3.5 w-3.5 text-zinc-400" />
                {datasetCount}{' '}
                {datasetCount === 1 ? 'åpent datasett' : 'åpne datasett'}
              </span>
            )}
          </div>
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
