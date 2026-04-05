import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import {
  DocumentTextIcon,
  CircleStackIcon,
  ClipboardDocumentListIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid'
import {
  type ResearchProject,
  ResearchStatus,
  PaperStatus,
  SurveyStatus,
} from '@/lib/research/types'
import { type ArticleWithSlug } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'

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

function StatusBadge({ status }: { status: string; colorClass: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
        statusColors[status as ResearchStatus] ??
          statusColors[ResearchStatus.Planning]
      )}
    >
      {status}
    </span>
  )
}

function WaveTimeline({ project }: { project: ResearchProject }) {
  if (!project.waves?.length) return null
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Bølger
      </h4>
      <ol className="mt-3 space-y-3">
        {project.waves.map(wave => (
          <li key={wave.name} className="flex items-start gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-medium text-teal-600 ring-1 ring-teal-500/20 dark:text-teal-400 dark:ring-teal-400/20">
              {wave.year.toString().slice(-2)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {wave.name} ({wave.year})
                {wave.organizations && (
                  <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                    — {wave.organizations} organisasjoner
                  </span>
                )}
              </p>
              {wave.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {wave.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function PapersList({ papers }: { papers: ResearchProject['papers'] }) {
  if (!papers?.length) return null

  const paperStatusLabel: Record<PaperStatus, string> = {
    [PaperStatus.Draft]: 'Utkast',
    [PaperStatus.UnderReview]: 'Under fagfellevurdering',
    [PaperStatus.Accepted]: 'Akseptert',
    [PaperStatus.Published]: 'Publisert',
  }

  return (
    <div className="mt-6">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <DocumentTextIcon className="h-4 w-4 text-zinc-400" />
        Publikasjoner
      </h4>
      <ul className="mt-2 space-y-2">
        {papers.map(paper => (
          <li key={paper.title} className="text-sm">
            {paper.url ? (
              <a
                href={paper.url}
                className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
              >
                {paper.title}
                <ArrowTopRightOnSquareIcon className="ml-1 inline h-3 w-3" />
              </a>
            ) : (
              <span className="text-zinc-700 dark:text-zinc-300">
                {paper.title}
              </span>
            )}
            <span className="ml-2 text-xs text-zinc-500">
              ({paperStatusLabel[paper.status]})
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SurveysList({
  surveys,
  projectSlug,
}: {
  surveys: ResearchProject['surveys']
  projectSlug: string
}) {
  if (!surveys?.length) return null
  return (
    <div className="mt-6">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <ClipboardDocumentListIcon className="h-4 w-4 text-zinc-400" />
        Undersøkelser
      </h4>
      <ul className="mt-2 space-y-2">
        {surveys.map(survey => (
          <li
            key={survey.title}
            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <span
              className={clsx(
                'inline-block h-2 w-2 rounded-full',
                survey.status === SurveyStatus.Open
                  ? 'bg-green-500'
                  : survey.status === SurveyStatus.Closed
                    ? 'bg-zinc-400 dark:bg-zinc-500'
                    : 'bg-amber-400'
              )}
            />
            {survey.url ? (
              <a
                href={`/forskning/${projectSlug}/undersokelse`}
                className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
              >
                {survey.title}
                <ArrowTopRightOnSquareIcon className="ml-1 inline h-3 w-3" />
              </a>
            ) : (
              <span>{survey.title}</span>
            )}
            <span className="text-xs text-zinc-400">({survey.status})</span>
            {survey.description && (
              <span className="text-xs text-zinc-400">
                — {survey.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DatasetsList({ datasets }: { datasets: ResearchProject['datasets'] }) {
  if (!datasets?.length) return null
  return (
    <div className="mt-6">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <CircleStackIcon className="h-4 w-4 text-zinc-400" />
        Datasett
      </h4>
      <ul className="mt-2 space-y-2">
        {datasets.map(dataset => (
          <li key={dataset.title} className="text-sm">
            <a
              href={dataset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
            >
              {dataset.title}
              <ArrowTopRightOnSquareIcon className="ml-1 inline h-3 w-3" />
            </a>
            <span className="ml-2 text-xs text-zinc-400">{dataset.format}</span>
            {dataset.description && (
              <span className="ml-1 text-xs text-zinc-400">
                — {dataset.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RelatedArticles({ articles }: { articles: ArticleWithSlug[] }) {
  if (!articles.length) return null
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Artikler
      </h4>
      <ul className="mt-2 space-y-2">
        {articles.map(article => (
          <li key={article.slug}>
            <Link
              href={`/artikkel/${article.slug}`}
              className="group flex items-baseline gap-2 text-sm"
            >
              <time
                dateTime={article.date}
                className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500"
              >
                {formatDate(article.date)}
              </time>
              <span className="text-teal-500 group-hover:text-teal-600 dark:text-teal-400 dark:group-hover:text-teal-300">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResearchProjectCard({
  project,
  articles,
}: {
  project: ResearchProject
  articles: ArticleWithSlug[]
}) {
  return (
    <article className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {project.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {project.lead}
          </p>
        </div>
        <StatusBadge
          status={project.status}
          colorClass={statusColors[project.status]}
        />
      </div>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>
      <WaveTimeline project={project} />
      <PapersList papers={project.papers} />
      <SurveysList surveys={project.surveys} projectSlug={project.slug} />
      <DatasetsList datasets={project.datasets} />
      <RelatedArticles articles={articles} />
    </article>
  )
}
