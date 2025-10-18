'use client'

import { useState } from 'react'
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import { SendReminderModal } from '@/components/SendReminderModal'
import { SendFeedbackRequestModal } from '@/components/SendFeedbackRequestModal'
import { getEventState } from '@/lib/events/state-machine'

interface AdminEventActionsProps {
  eventSlug: string
  eventTitle: string
  eventDate: string
  eventStartTime: string
  activeRegistrations: number
  attendedCount: number
  onExport?: () => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
  showExport?: boolean
}

export function AdminEventActions({
  eventSlug,
  eventTitle,
  eventDate,
  eventStartTime,
  activeRegistrations,
  attendedCount,
  onExport,
  onSuccess,
  onError,
  showExport = true,
}: AdminEventActionsProps) {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isFeedbackRequestModalOpen, setIsFeedbackRequestModalOpen] =
    useState(false)

  const state = getEventState(eventStartTime)
  const isPreEvent = state === 'PRE_EVENT'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap gap-2">
        {isPreEvent && (
          <button
            onClick={() => setIsReminderModalOpen(true)}
            disabled={activeRegistrations === 0}
            className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            <BellIcon className="mr-2 h-4 w-4" />
            Send påminnelse
          </button>
        )}

        {!isPreEvent && (
          <button
            onClick={() => setIsFeedbackRequestModalOpen(true)}
            disabled={attendedCount === 0}
            className="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            <ChatBubbleLeftRightIcon className="mr-2 h-4 w-4" />
            Be om tilbakemelding
          </button>
        )}

        {showExport && onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
          >
            <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
            Eksporter CSV
          </button>
        )}
      </div>

      {/* Modals */}
      <SendReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        eventSlug={eventSlug}
        eventTitle={eventTitle}
        eventDate={eventDate}
        onSuccess={message => {
          onSuccess?.(message)
          setIsReminderModalOpen(false)
        }}
        onError={message => onError?.(message)}
      />

      <SendFeedbackRequestModal
        isOpen={isFeedbackRequestModalOpen}
        onClose={() => setIsFeedbackRequestModalOpen(false)}
        eventSlug={eventSlug}
        eventTitle={eventTitle}
        eventDate={eventDate}
        onSuccess={message => {
          onSuccess?.(message)
          setIsFeedbackRequestModalOpen(false)
        }}
        onError={message => onError?.(message)}
      />
    </div>
  )
}
