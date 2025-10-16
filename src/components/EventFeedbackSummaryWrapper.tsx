'use client'

import { trpc } from '@/lib/trpc/client'
import { EventFeedbackSummary } from './EventFeedbackSummary'

interface EventFeedbackSummaryWrapperProps {
  eventSlug: string
  variant?: 'compact' | 'full' | 'admin'
}

export function EventFeedbackSummaryWrapper({
  eventSlug,
  variant = 'compact',
}: EventFeedbackSummaryWrapperProps) {
  const { data: summary, isLoading } = trpc.eventFeedback.getSummary.useQuery({
    slug: eventSlug,
  })

  if (isLoading) {
    return null
  }

  // Show empty state if no feedback yet
  if (!summary || summary.totalResponses === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Tilbakemeldinger
          </h3>
        </div>
        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Ingen tilbakemeldinger ennå
        </div>
      </div>
    )
  }

  return <EventFeedbackSummary summary={summary} variant={variant} />
}
