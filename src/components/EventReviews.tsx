'use client'

import { CheckIcon, StarIcon } from '@heroicons/react/20/solid'
import { Button } from './Button'
import type { EventFeedback } from '@/domains/event-feedback/types'

interface EventReviewsProps {
  reviews: EventFeedback[]
  eventSlug: string
  averageRating: number
  totalReviews: number
  canSubmitFeedback: boolean
  hasSubmittedFeedback?: boolean
  needsLogin?: boolean
  ratingDistribution?: { rating: number; count: number }[]
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface RatingCount {
  rating: number
  count: number
}

function getRatingCounts(reviews: EventFeedback[]): RatingCount[] {
  const counts = [
    { rating: 5, count: 0 },
    { rating: 4, count: 0 },
    { rating: 3, count: 0 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ]

  reviews.forEach(review => {
    const ratingIndex = counts.findIndex(c => c.rating === review.eventRating)
    if (ratingIndex !== -1) {
      counts[ratingIndex]!.count++
    }
  })

  return counts
}

export function EventReviews({
  reviews,
  eventSlug,
  averageRating,
  totalReviews,
  canSubmitFeedback,
  hasSubmittedFeedback = false,
  needsLogin = false,
  ratingDistribution,
}: EventReviewsProps) {
  // Use provided distribution or calculate from all reviews if not provided
  const ratingCounts = ratingDistribution || getRatingCounts(reviews)
  const publicReviews = reviews.filter(
    review => review.isPublic && review.eventComment
  )

  if (totalReviews === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Tilbakemeldinger
      </h2>
      <div className="space-y-4">
        {/* Rating Summary */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map(rating => (
                <StarIcon
                  key={rating}
                  aria-hidden="true"
                  className={classNames(
                    averageRating > rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600',
                    'h-4 w-4 shrink-0'
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Basert på {totalReviews}{' '}
              {totalReviews === 1 ? 'tilbakemelding' : 'tilbakemeldinger'}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="sr-only">Fordelingen av vurderinger</h3>

            <dl className="space-y-2">
              {ratingCounts.map(count => (
                <div key={count.rating} className="flex items-center text-sm">
                  <dt className="flex flex-1 items-center">
                    <p className="w-3 font-medium text-gray-900 dark:text-gray-100">
                      {count.rating}
                      <span className="sr-only"> stjerner</span>
                    </p>
                    <div
                      aria-hidden="true"
                      className="ml-1 flex flex-1 items-center"
                    >
                      <StarIcon
                        aria-hidden="true"
                        className={classNames(
                          count.count > 0
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600',
                          'h-4 w-4 shrink-0'
                        )}
                      />

                      <div className="relative ml-3 flex-1">
                        <div className="h-3 rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900" />
                        {count.count > 0 && totalReviews > 0 ? (
                          <div
                            style={{
                              width: `${(count.count / totalReviews) * 100}%`,
                            }}
                            className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                          />
                        ) : null}
                      </div>
                    </div>
                  </dt>
                  <dd className="ml-3 w-10 text-right text-sm text-gray-900 tabular-nums dark:text-gray-100">
                    {totalReviews > 0
                      ? Math.round((count.count / totalReviews) * 100)
                      : 0}
                    %
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {canSubmitFeedback && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Del dine erfaringer
              </h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Hvis du deltok på arrangementet, del dine tanker med andre
              </p>

              <Button
                href={`/fagdag/${eventSlug}/tilbakemelding`}
                variant="secondary"
                className="mt-4 w-full"
              >
                Gi tilbakemelding
              </Button>
            </div>
          )}

          {needsLogin && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Del dine erfaringer
              </h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Logg inn for å gi tilbakemelding på dette arrangementet
              </p>

              <Button
                href={`/auth/signin?callbackUrl=${encodeURIComponent(`/fagdag/${eventSlug}/tilbakemelding`)}`}
                variant="secondary"
                className="mt-4 w-full"
              >
                Logg inn for å gi tilbakemelding
              </Button>
            </div>
          )}

          {hasSubmittedFeedback && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-xs text-green-800 dark:text-green-200">
                  Takk for din tilbakemelding!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Public Reviews */}
        {publicReviews.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              Nylige tilbakemeldinger
            </h3>

            <div className="space-y-3">
              {publicReviews.slice(0, 3).map(review => (
                <div
                  key={review._id}
                  className="rounded-lg bg-white/50 p-3 dark:bg-gray-900/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-xs font-semibold text-white">
                      {review.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {review.name}
                        </h4>
                        <div className="flex items-center gap-0.5">
                          {[0, 1, 2, 3, 4].map(rating => (
                            <StarIcon
                              key={rating}
                              aria-hidden="true"
                              className={classNames(
                                review.eventRating > rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600',
                                'h-3 w-3 shrink-0'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      {review.eventComment && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600 italic dark:text-gray-400">
                          &quot;{review.eventComment}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
