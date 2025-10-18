'use client'

import { StarRating } from './StarRating'
import { AdminEventStatCard } from './AdminEventStatCard'
import { trpc } from '@/lib/trpc/client'
import {
  StarIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import type { EventFeedbackSummary } from '@/domains/event-feedback/types'

interface AdminEventFeedbackProps {
  eventSlug: string
}

export function AdminEventFeedback({ eventSlug }: AdminEventFeedbackProps) {
  const { data, isLoading, error } = trpc.admin.feedback.getAll.useQuery(
    { slug: eventSlug, format: 'summary' },
    { refetchOnWindowFocus: false }
  )

  const summary = data as EventFeedbackSummary | undefined

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">
          {error.message || 'Kunne ikke hente tilbakemeldinger'}
        </p>
      </div>
    )
  }

  if (!summary || summary.totalResponses === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Ingen tilbakemeldinger ennå
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminEventStatCard
          label="Snitt vurdering"
          value={
            summary.averageEventRating !== null
              ? summary.averageEventRating.toFixed(1)
              : 'N/A'
          }
          icon={StarIcon}
          color="yellow"
        />
        <AdminEventStatCard
          label="Totalt svar"
          value={summary.totalResponses}
          icon={ChatBubbleLeftIcon}
          color="blue"
        />
        <AdminEventStatCard
          label="Foredrag vurdert"
          value={summary.talkSummaries.length}
          icon={UserGroupIcon}
          color="green"
        />
        <AdminEventStatCard
          label="Nye temaforslag"
          value={summary.topicSuggestions.length}
          icon={LightBulbIcon}
          color="purple"
        />
      </div>

      {/* Talk Ratings */}
      {summary.talkSummaries.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Foredrag og innlegg
          </h3>
          <div className="space-y-4">
            {summary.talkSummaries
              .sort((a, b) => b.averageRating - a.averageRating)
              .map(talk => (
                <div
                  key={talk.talkTitle}
                  className="border-b border-gray-200 pb-4 last:border-0 dark:border-gray-700"
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex-1 font-medium text-gray-900 dark:text-white">
                      {talk.talkTitle}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StarRating
                        rating={Math.round(talk.averageRating)}
                        size="sm"
                        readonly
                        showLabel={false}
                      />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {talk.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({talk.totalRatings})
                      </span>
                    </div>
                  </div>
                  {talk.comments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Kommentarer:
                      </div>
                      {talk.comments.map((comment, idx) => (
                        <div
                          key={idx}
                          className="rounded bg-gray-50 p-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                          {comment}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Event Comments */}
      {summary.eventComments.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Kommentarer om arrangementet
          </h3>
          <div className="space-y-3">
            {summary.eventComments.map((comment, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {comment}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Suggestions */}
      {summary.topicSuggestions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            Forslag til nye tema
          </h4>
          <ul className="space-y-3">
            {summary.topicSuggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
              >
                <span className="text-sm text-gray-900 dark:text-white">
                  {suggestion.topic}
                </span>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>{suggestion.count} forslag</span>
                  {suggestion.willingToPresentCount > 0 && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {suggestion.willingToPresentCount} vil presentere
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
