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
  event,
  eventStatus,
}: EventFeedbackPromptProps) {
  const { data: session } = useSession()
  const { registration } = useEventRegistration()

  const { data: feedbackData } = trpc.eventFeedback.hasFeedback.useQuery(
    { slug: event.slug },
    {
      enabled: !!session?.user?.slackId,
    }
  )

  const hasFeedback = feedbackData?.hasFeedback ?? null

  // Only show for past events where user attended
  if (eventStatus !== 'past') return null
  if (!registration || registration.status !== 'attended') return null
  if (hasFeedback === null) return null

  if (hasFeedback) {
    return (
      <div className="rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700/50">
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
    <div className="rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700/50">
      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Gi tilbakemelding
      </h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Hjelp oss å forbedre fremtidige arrangementer ved å dele dine tanker om{' '}
        {event.title}.
      </p>
      <Button
        href={`/fagdag/${event.slug}/tilbakemelding`}
        variant="primary"
        className="w-full"
      >
        Gi tilbakemelding
      </Button>
    </div>
  )
}
