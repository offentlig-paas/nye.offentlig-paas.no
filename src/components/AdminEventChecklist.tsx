'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import {
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/Badge'
import {
  getEventState,
  getChecklistForState,
  type ChecklistItem,
} from '@/lib/events/state-machine'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'
import type { EventParticipantInfo } from '@/lib/events/types'

type RouterOutput = inferRouterOutputs<AppRouter>
type EventDetails = RouterOutput['admin']['events']['getDetails']

interface AdminEventChecklistProps {
  eventDetails: EventDetails
  eventSlug: string
  participantInfo?: EventParticipantInfo
  photosCount?: number
}

export function AdminEventChecklist({
  eventDetails,
  eventSlug,
  participantInfo,
  photosCount = 0,
}: AdminEventChecklistProps) {
  const state = getEventState(eventDetails.startTime)
  const checklist = React.useMemo(() => getChecklistForState(state), [state])

  // Override completion status for items that need external data
  const checklistWithStatus = checklist.map(
    (item): ChecklistItem & { completed: boolean } => {
      let completed = item.isComplete(eventDetails)

      // Override for participant info
      if (item.id === 'participant-info') {
        completed = !!(participantInfo?.streamingUrl || participantInfo?.notes)
      }

      // Override for photos
      if (item.id === 'photos-uploaded') {
        completed = photosCount > 0
      }

      // Override for recording
      if (item.id === 'recording-added') {
        completed = !!eventDetails.recordingUrl
      }

      return { ...item, completed }
    }
  )

  // Calculate progress with overrides
  const completedCount = checklistWithStatus.filter(
    item => item.completed
  ).length
  const progressPercentage = Math.round(
    (completedCount / checklist.length) * 100
  )
  const allComplete = completedCount === checklist.length

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-700/80 dark:bg-zinc-800">
      <div className="border-b border-zinc-200/80 p-5 dark:border-zinc-700/80">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ClipboardDocumentCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {state === 'PRE_EVENT'
                  ? 'Sjekkliste før fagdagen'
                  : 'Sjekkliste etter fagdagen'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Oppgaver for planlegging og gjennomføring
              </p>
            </div>
          </div>
          <Badge color={allComplete ? 'green' : 'blue'}>
            {completedCount} av {checklist.length} fullført (
            {progressPercentage}
            %)
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allComplete
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : 'bg-linear-to-r from-blue-500 to-teal-500 dark:from-blue-400 dark:to-teal-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
        {checklistWithStatus.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-700/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              {item.completed ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
              )}
              <span
                className={`truncate text-sm ${
                  item.completed
                    ? 'text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600'
                    : 'font-medium text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {item.label}
              </span>
            </div>

            {!item.completed && item.actionLabel && (
              <div className="shrink-0 pl-3">
                {item.actionLink ? (
                  <Link
                    href={
                      item.actionLink.startsWith('#')
                        ? item.actionLink
                        : `/admin/events/${eventSlug}${item.actionLink}`
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400">
                    {item.actionLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
