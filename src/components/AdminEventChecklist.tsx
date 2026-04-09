'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { ClockIcon } from '@heroicons/react/24/outline'
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

  return (
    <div className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              {state === 'PRE_EVENT' ? 'Før fagdagen' : 'Etter fagdagen'}
            </h3>
          </div>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {completedCount}/{checklist.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300 dark:bg-teal-400"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {checklistWithStatus.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
          >
            <div className="flex items-center gap-3">
              <CheckCircleIcon
                className={`h-5 w-5 flex-shrink-0 ${
                  item.completed
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-zinc-300 dark:text-zinc-600'
                }`}
              />
              <span
                className={`text-sm ${
                  item.completed
                    ? 'text-zinc-500 line-through dark:text-zinc-400'
                    : 'text-zinc-900 dark:text-white'
                }`}
              >
                {item.label}
              </span>
            </div>

            {!item.completed && item.actionLabel && (
              <div>
                {item.actionLink ? (
                  <Link
                    href={`/admin/events/${eventSlug}${item.actionLink}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {item.actionLabel}
                  </Link>
                ) : (
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
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
