'use client'

import { useSession } from 'next-auth/react'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import { Button } from './Button'
import type { Event, Status } from '@/lib/events/types'
import { trpc } from '@/lib/trpc/client'

interface EventFeedbackPromptProps {
  event: Event
  eventStatus: Status
}

export function EventFeedbackPrompt({
  event: propsEvent,
  eventStatus,
}: EventFeedbackPromptProps) {
  const { data: session } = useSession()
  const { event: eventData } = useEventRegistration()
  const registration = eventData?.userRegistration

  const { data: feedbackData, isLoading } =
    trpc.eventFeedback.hasFeedback.useQuery(
      { slug: propsEvent.slug },
      {
        enabled: !!session?.user?.slackId,
      }
    )

  const hasFeedback = feedbackData?.hasFeedback ?? null

  // Only show for past events where user attended
  if (eventStatus !== 'past') return null
  if (!registration || registration.status !== 'attended') return null

  // Show loading state while checking feedback status
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (hasFeedback === null) return null

  if (hasFeedback) {
    return (
      <div className="overflow-hidden rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800/50 dark:ring-gray-400/5">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">Takk for tilbakemeldingen din!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
      <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
        Gi tilbakemelding
      </h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Hjelp oss å forbedre fremtidige arrangementer ved å dele dine tanker om{' '}
        {propsEvent.title}.
      </p>
      <Button
        href={`/fagdag/${propsEvent.slug}/tilbakemelding`}
        variant="primary"
        className="w-full"
      >
        Gi tilbakemelding
      </Button>
    </div>
  )
}
