'use client'

import { StarRating } from './StarRating'
import type { EventFeedbackSummary as FeedbackSummary } from '@/domains/event-feedback/types'

interface EventFeedbackSummaryProps {
  summary: FeedbackSummary
  variant?: 'compact' | 'full' | 'admin'
}

export function EventFeedbackSummary({
  summary,
  variant = 'compact',
}: EventFeedbackSummaryProps) {
  if (summary.totalResponses === 0) {
    return null
  }

  const { totalResponses, averageEventRating, talkSummaries } = summary

  if (variant === 'admin') {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating
            rating={averageEventRating}
            readonly
            size="md"
            showLabel={false}
          />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {averageEventRating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({totalResponses})
          </span>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Tilbakemeldinger
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {totalResponses}{' '}
              {totalResponses === 1 ? 'vurdering' : 'vurderinger'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StarRating
              rating={averageEventRating}
              readonly
              size="sm"
              showLabel={false}
            />
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {averageEventRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Tilbakemeldinger fra deltakere
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Basert på {totalResponses}{' '}
          {totalResponses === 1 ? 'vurdering' : 'vurderinger'}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/50">
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">
              Samlet vurdering
            </div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Gjennomsnittlig vurdering av arrangementet
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating
              rating={averageEventRating}
              readonly
              size="md"
              showLabel={false}
            />
            <span className="text-lg font-semibold text-zinc-900 dark:text-white">
              {averageEventRating.toFixed(1)}
            </span>
          </div>
        </div>

        {talkSummaries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
              Foredragsvurderinger
            </h4>
            {talkSummaries
              .sort((a, b) => b.averageRating - a.averageRating)
              .map(talk => (
                <div
                  key={talk.talkTitle}
                  className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-white">
                      {talk.talkTitle}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      {talk.totalRatings}{' '}
                      {talk.totalRatings === 1 ? 'vurdering' : 'vurderinger'}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StarRating
                      rating={talk.averageRating}
                      readonly
                      size="sm"
                      showLabel={false}
                    />
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {talk.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
