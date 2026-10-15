'use client'

import { useSession } from 'next-auth/react'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import { Button } from './Button'
import type { Event, Status } from '@/lib/events/types'
import { trpc } from '@/lib/trpc/client'
import { useToast } from './ToastProvider'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

interface EventFeedbackPromptProps {
  event: Event
  eventStatus: Status
}

export function EventFeedbackPrompt({
  event: propsEvent,
  eventStatus,
}: EventFeedbackPromptProps) {
  const { data: session } = useSession()
  const { event: eventData, refetch } = useEventRegistration()
  const { showSuccess, showError } = useToast()
  const registration = eventData?.userRegistration

  const updateAttendanceMutation =
    trpc.eventRegistration.updateAttendance.useMutation()

  const { data: feedbackData, isLoading } =
    trpc.eventFeedback.hasFeedback.useQuery(
      { slug: propsEvent.slug },
      {
        enabled: !!session?.user?.slackId,
      }
    )

  const hasFeedback = feedbackData?.hasFeedback ?? null

  if (eventStatus !== 'past') return null
  if (
    !registration ||
    (registration.status !== 'attended' &&
      registration.status !== 'confirmed' &&
      registration.status !== 'no-show')
  ) {
    return null
  }

  const handleAttendanceChange = async (status: 'attended' | 'no-show') => {
    try {
      const result = await updateAttendanceMutation.mutateAsync({
        slug: propsEvent.slug,
        status,
      })
      await refetch()
      showSuccess('Oppdatert', result.message)
    } catch (error) {
      showError(
        'Feil ved oppdatering',
        error instanceof Error
          ? error.message
          : 'Kunne ikke oppdatere deltakelse.'
      )
    }
  }

  if (registration.status === 'no-show') {
    return (
      <div className="overflow-hidden rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800/50 dark:ring-gray-400/5">
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Du har registrert at du ikke deltok på denne fagdagen.
        </p>
        <Button
          variant="secondary"
          onClick={() => handleAttendanceChange('attended')}
          disabled={updateAttendanceMutation.isPending}
          className="w-full text-sm"
        >
          {updateAttendanceMutation.isPending
            ? 'Oppdaterer...'
            : 'Endre til at jeg deltok'}
        </Button>
      </div>
    )
  }

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
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-semibold">Takk for tilbakemeldingen din!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
      <h2 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
        Gi tilbakemelding
      </h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Hjelp oss å forbedre fremtidige arrangementer ved å dele dine tanker om{' '}
        {propsEvent.title}.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          href={`/fagdag/${propsEvent.slug}/tilbakemelding`}
          variant="primary"
          className="w-full"
        >
          Gi tilbakemelding
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleAttendanceChange('no-show')}
          disabled={updateAttendanceMutation.isPending}
          className="w-full text-sm"
        >
          {updateAttendanceMutation.isPending
            ? 'Oppdaterer...'
            : 'Jeg kunne ikke delta'}
        </Button>
      </div>
    </div>
  )
}
