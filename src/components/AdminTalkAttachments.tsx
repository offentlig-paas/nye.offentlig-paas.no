'use client'

import { TalkAttachmentManager } from './TalkAttachmentManager'
import { BulkNudgeSpeakers } from './BulkNudgeSpeakers'
import { PresentationChartLineIcon } from '@heroicons/react/20/solid'
import type { Item } from '@/lib/events/types'

interface AdminTalkAttachmentsProps {
  eventSlug: string
  schedule: Item[]
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function AdminTalkAttachments({
  eventSlug,
  schedule,
  onError,
  onSuccess,
}: AdminTalkAttachmentsProps) {
  const talksWithSpeakers = schedule.filter(
    item =>
      (item.type === 'Presentation' ||
        item.type === 'Panel' ||
        item.type === 'Workshop') &&
      item.speakers &&
      item.speakers.length > 0
  )

  if (talksWithSpeakers.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Ingen foredrag med foredragsholdere funnet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BulkNudgeSpeakers
        eventSlug={eventSlug}
        schedule={schedule}
        onSuccess={onSuccess}
        onError={onError}
      />

      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {talksWithSpeakers.map((talk, idx) => {
          const speakerSlackId =
            talk.speakers?.[0]?.url?.match(/\/team\/([A-Z0-9]+)$/)?.[1] || ''

          return (
            <div key={`${talk.title}-${idx}`} className="py-3">
              <div className="mb-2 flex items-start gap-2">
                <PresentationChartLineIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {talk.title}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <span>{talk.time}</span>
                    {talk.speakers && (
                      <>
                        <span>•</span>
                        <span className="truncate">
                          {talk.speakers.map(s => s.name).join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {speakerSlackId ? (
                <TalkAttachmentManager
                  eventSlug={eventSlug}
                  talkTitle={talk.title}
                  speakerSlackId={speakerSlackId}
                  canManage={true}
                  isAdminContext={true}
                  onError={onError}
                  onSuccess={onSuccess}
                />
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Ingen Slack-bruker tilknyttet foredragsholder. Kan ikke
                  administrere vedlegg.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
