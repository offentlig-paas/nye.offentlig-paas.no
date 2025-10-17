'use client'

import { trpc } from '@/lib/trpc/client'
import { EventFeedbackSummary } from './EventFeedbackSummary'
import { EventReviews } from './EventReviews'
import { useSession } from 'next-auth/react'

interface EventFeedbackSummaryWrapperProps {
  eventSlug: string
  variant?: 'compact' | 'full' | 'admin' | 'reviews'
}

export function EventFeedbackSummaryWrapper({
  eventSlug,
  variant = 'compact',
}: EventFeedbackSummaryWrapperProps) {
  const { data: session } = useSession()

  const { data: summary, isLoading: summaryLoading } =
    trpc.eventFeedback.getSummary.useQuery(
      { slug: eventSlug },
      {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      }
    )

  const { data: reviews, isLoading: reviewsLoading } =
    trpc.eventFeedback.getPublicReviews.useQuery(
      { slug: eventSlug },
      {
        enabled: variant === 'reviews',
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      }
    )

  const { data: hasFeedbackData } = trpc.eventFeedback.hasFeedback.useQuery(
    { slug: eventSlug },
    {
      enabled: variant === 'reviews' && !!session?.user,
      staleTime: 1 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  if (summaryLoading || (variant === 'reviews' && reviewsLoading)) {
    return null
  }

  if (variant === 'reviews') {
    if (!summary || summary.totalResponses === 0) {
      return null
    }

    const canSubmitFeedback = !!session?.user && !hasFeedbackData?.hasFeedback
    const hasSubmittedFeedback = !!session?.user && hasFeedbackData?.hasFeedback

    return (
      <EventReviews
        reviews={reviews || []}
        eventSlug={eventSlug}
        averageRating={summary.averageEventRating}
        totalReviews={summary.totalResponses}
        canSubmitFeedback={canSubmitFeedback}
        hasSubmittedFeedback={hasSubmittedFeedback}
        ratingDistribution={summary.ratingDistribution}
      />
    )
  }

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
