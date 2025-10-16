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
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
        Takk for tilbakemeldingen din!
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div>
        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
          Gi tilbakemelding
        </h4>
        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
          Hjelp oss å forbedre fremtidige arrangementer ved å dele dine tanker
          om {event.title}.
        </p>
      </div>
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
