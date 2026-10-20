import Link from 'next/link'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { members } from '@/data/members'
import {
  getOpenSurveys,
  findOpenSurvey,
  getSurveyTitle,
} from '@/lib/research/helpers'
import { surveyResponseService } from '@/domains/survey-response/service'

// Indigo, not teal: keeps surveys visually apart from the events block.
export async function SurveyCallToAction({
  projectSlug,
  surveySlug,
}: {
  projectSlug: string
  /** Pin one survey; renders nothing unless that survey is open. */
  surveySlug?: string
}) {
  const open = findOpenSurvey(projectSlug, surveySlug)
  if (!open) return null
  const { survey, project, href, minutes } = open

  const responses =
    'surveySlug' in survey
      ? // A Sanity hiccup must not take down the page this block sits on.
        await surveyResponseService
          .getUniqueOrganizationCount(survey.surveySlug)
          .catch(() => 0)
      : 0
  const total = members.length
  const rate = total > 0 ? Math.round((responses / total) * 100) : 0

  return (
    <div className="not-prose my-10 rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/50 p-6 dark:border-indigo-400/20 dark:bg-indigo-400/5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
        </span>
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          Åpen undersøkelse
          {minutes && (
            <span className="font-normal text-zinc-500 dark:text-zinc-400">
              {' '}
              · ca. {minutes} min
            </span>
          )}
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {getSurveyTitle(survey)}
      </h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>
      {responses > 0 && (
        <div className="mt-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {responses} av {total} organisasjoner har svart ({rate} %)
          </p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <div
              className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
              style={{ width: `${Math.min(rate, 100)}%` }}
            />
          </div>
        </div>
      )}
      <Link
        href={href}
        className="mt-5 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        Svar på undersøkelsen
      </Link>
    </div>
  )
}

/** Compact front-page card, secondary to the events block. */
export function OpenSurveysCard({ className }: { className?: string }) {
  const open = getOpenSurveys()
  if (open.length === 0) return null
  return (
    <div className={className}>
      {open.map(({ survey, href, minutes }) => {
        const external = !href.startsWith('/')
        const Tag = external ? 'a' : Link
        return (
          <Tag
            key={href}
            href={href}
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
            className="group flex items-start gap-3 rounded-2xl border border-zinc-200 p-4 transition hover:border-indigo-400 dark:border-zinc-700/40 dark:hover:border-indigo-400/60"
          >
            <ClipboardDocumentListIcon className="h-6 w-6 flex-none text-indigo-500 dark:text-indigo-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                Forskning · åpen undersøkelse
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {getSurveyTitle(survey)}
              </p>
              <p className="mt-1 text-sm text-zinc-600 group-hover:text-indigo-600 dark:text-zinc-400 dark:group-hover:text-indigo-400">
                Svar på undersøkelsen{minutes && ` (ca. ${minutes} min)`} →
                {external && (
                  <span className="sr-only"> (åpnes i ny fane)</span>
                )}
              </p>
            </div>
          </Tag>
        )
      })}
    </div>
  )
}
