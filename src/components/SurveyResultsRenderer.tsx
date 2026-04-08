'use client'

import type {
  AggregatedSurveyResults,
  AggregatedQuestion,
} from '@/lib/surveys/aggregation'
import { HorizontalBarChart } from './charts/HorizontalBarChart'
import { DivergingBarChart } from './charts/DivergingBarChart'
import { UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

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

      {results.sections.map(section => (
        <section key={section.id} className="space-y-8">
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

          {section.questions.map(question => (
            <QuestionChart
              key={question.id}
              question={question}
              totalResponses={results.totalResponses}
            />
          ))}
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

function QuestionChart({
  question,
  totalResponses,
}: {
  question: AggregatedQuestion
  totalResponses: number
}) {
  const showN = question.responseCount !== totalResponses

  if (question.visualization === 'diverging') {
    return (
      <DivergingBarChart
        title={question.title}
        description={showN ? undefined : question.description}
        options={question.options}
        responseCount={question.responseCount}
      />
    )
  }

  return (
    <HorizontalBarChart
      title={question.title}
      description={showN ? undefined : question.description}
      options={question.options}
      responseCount={question.responseCount}
    />
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        </div>
      </div>
    </div>
  )
}
