'use client'

import type { AggregatedSurveyResults } from '@/lib/surveys/aggregation'
import { groupQuestions } from '@/lib/surveys/likert'
import { ResultTable } from './charts/ResultTable'
import { LikertBar } from './charts/LikertBar'
import { UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { StatCard } from '@/components/StatCard'

interface SurveyResultsRendererProps {
  results: AggregatedSurveyResults
  uniqueOrganizations: number
  heroText?: string
  methodologyNote?: string
}

export function SurveyResultsRenderer({
  results,
  uniqueOrganizations,
  heroText,
  methodologyNote,
}: SurveyResultsRendererProps) {
  return (
    <div className="space-y-12">
      {heroText && (
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          {heroText}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={UsersIcon}
          value={results.totalResponses}
          label="Besvarelser"
        />
        <StatCard
          icon={BuildingOfficeIcon}
          value={uniqueOrganizations}
          label="Unike organisasjoner"
        />
      </div>

      {results.sections.length > 1 && (
        <nav aria-label="Innhold" className="text-sm">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Innhold
          </h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
            {results.sections.map(section => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="hover:text-teal-600 hover:underline dark:hover:text-teal-400"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {results.sections.map(section => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-24 space-y-8"
        >
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {section.title}
            </h3>
            {section.description && (
              <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                {section.description}
              </p>
            )}
          </div>

          {groupQuestions(section.questions).map(group =>
            group.kind === 'likert' ? (
              <LikertBar
                key={group.questions[0]!.id}
                questions={group.questions}
              />
            ) : (
              <div
                key={group.question.id}
                className="break-inside-avoid space-y-2"
              >
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {group.question.title}
                </h4>
                {group.question.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {group.question.description}
                  </p>
                )}
                <ResultTable question={group.question} />
              </div>
            )
          )}
        </section>
      ))}

      {methodologyNote && (
        <section className="border-t border-zinc-200 pt-8 dark:border-zinc-700">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Metodologi
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            {methodologyNote}
          </p>
        </section>
      )}
    </div>
  )
}
