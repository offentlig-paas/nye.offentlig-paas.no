'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { BellAlertIcon } from '@heroicons/react/24/outline'
import type { Item } from '@/lib/events/types'

interface BulkNudgeSpeakersProps {
  eventSlug: string
  schedule: Item[]
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

interface TalkWithSpeakers {
  title: string
  time: string
  speakerUrls: string[]
}

export function BulkNudgeSpeakers({
  eventSlug,
  schedule,
  onSuccess,
  onError,
}: BulkNudgeSpeakersProps) {
  const [isSending, setIsSending] = useState(false)
  const [onlyWithoutAttachments, setOnlyWithoutAttachments] = useState(false)

  const isDevelopment = process.env.NODE_ENV === 'development'
  const baseUrl = process.env.NEXT_PUBLIC_URL
  const hasLocalUrl =
    !baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
  const showWarning = isDevelopment && hasLocalUrl

  const talksWithSpeakers: TalkWithSpeakers[] = schedule
    .filter(
      item =>
        (item.type === 'Presentation' ||
          item.type === 'Panel' ||
          item.type === 'Workshop') &&
        item.speakers &&
        item.speakers.length > 0
    )
    .map(talk => ({
      title: talk.title,
      time: talk.time,
      speakerUrls:
        talk.speakers?.map(s => s.url).filter((url): url is string => !!url) ||
        [],
    }))
    .filter(talk => talk.speakerUrls.length > 0)

  const handleBulkNudge = async () => {
    const mode = onlyWithoutAttachments
      ? 'bare til foredragsholdere som ikke har lastet opp presentasjon'
      : 'til alle foredragsholdere'

    if (
      !confirm(
        `Send påminnelse ${mode}?\n\nDette sender en Slack-melding til foredragsholdere.`
      )
    ) {
      return
    }

    setIsSending(true)

    try {
      const response = await fetch(
        `/api/admin/events/${encodeURIComponent(eventSlug)}/nudge-speakers-bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            onlyWithoutAttachments,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send nudges')
      }

      const result = await response.json()

      if (result.sent > 0) {
        onSuccess?.(
          `Påminnelse sendt til ${result.sent} foredragsholder${result.sent !== 1 ? 'e' : ''}${result.failed > 0 ? ` (${result.failed} feilet)` : ''}`
        )
      } else {
        onError?.(result.message || 'Ingen meldinger ble sendt')
      }
    } catch (error) {
      console.error('Error sending bulk nudge:', error)
      onError?.(
        error instanceof Error ? error.message : 'Kunne ikke sende påminnelser'
      )
    } finally {
      setIsSending(false)
    }
  }

  if (talksWithSpeakers.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      {showWarning && (
        <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Development Environment
              </h3>
              <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                Messages will contain localhost URLs. This will be blocked by
                the API. Set NEXT_PUBLIC_URL to production URL to enable.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Send påminnelse
          </h4>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Sender melding til foredragsholdere om sitt foredrag på Slack
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="onlyWithoutAttachments"
          checked={onlyWithoutAttachments}
          onChange={e => setOnlyWithoutAttachments(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700"
        />
        <label
          htmlFor="onlyWithoutAttachments"
          className="text-sm text-zinc-700 dark:text-zinc-300"
        >
          Bare til de som mangler slides
        </label>
      </div>

      <Button
        onClick={handleBulkNudge}
        disabled={isSending}
        variant="primary"
        className="w-full"
      >
        <BellAlertIcon className="h-4 w-4" />
        {isSending ? 'Sender...' : 'Send påminnelser'}
      </Button>
    </div>
  )
}
