'use client'

import { useState } from 'react'
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowDownIcon,
  UserPlusIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { SendReminderModal } from '@/components/SendReminderModal'
import { SendFeedbackRequestModal } from '@/components/SendFeedbackRequestModal'
import { getEventState } from '@/lib/events/state-machine'
import type { RegistrationStatus } from '@/domains/event-registration/types'

interface AdminEventActionsProps {
  eventSlug: string
  eventTitle: string
  eventDate: string
  eventStartTime: string
  activeRegistrations: number
  attendedCount: number
  onExport?: () => void
  onAddRegistration?: () => void
  onImportRegistrations?: () => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
  showExport?: boolean
  selectedCount?: number
  onBulkStatusUpdate?: (status: RegistrationStatus) => void
  onClearSelection?: () => void
}

export function AdminEventActions({
  eventSlug,
  eventTitle,
  eventDate,
  eventStartTime,
  activeRegistrations,
  attendedCount,
  onExport,
  onAddRegistration,
  onImportRegistrations,
  onSuccess,
  onError,
  showExport = true,
  selectedCount = 0,
  onBulkStatusUpdate,
  onClearSelection,
}: AdminEventActionsProps) {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isFeedbackRequestModalOpen, setIsFeedbackRequestModalOpen] =
    useState(false)

  const state = getEventState(eventStartTime)
  const isPreEvent = state === 'PRE_EVENT'
  const hasSelection = selectedCount > 0

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex flex-wrap items-center gap-2">
        {hasSelection ? (
          <>
            <span className="mr-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {selectedCount} valgt
            </span>

            <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" />

            <button
              onClick={() => onBulkStatusUpdate?.('confirmed')}
              className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              Bekreft
            </button>
            <button
              onClick={() => onBulkStatusUpdate?.('attended')}
              className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              Merk som deltok
            </button>
            <button
              onClick={() => onBulkStatusUpdate?.('no-show')}
              className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              Ikke møtt
            </button>
            <button
              onClick={() => onBulkStatusUpdate?.('waitlist')}
              className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              Venteliste
            </button>

            <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" />

            <button
              onClick={onClearSelection}
              className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-500 transition-colors duration-150 hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
            >
              <XMarkIcon className="mr-1 h-4 w-4" />
              Avbryt
            </button>
          </>
        ) : (
          <>
            {isPreEvent && (
              <button
                onClick={() => setIsReminderModalOpen(true)}
                disabled={activeRegistrations === 0}
                className="inline-flex items-center rounded-xl border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-800"
              >
                <BellIcon className="mr-2 h-4 w-4" />
                Send påminnelse
              </button>
            )}

            {!isPreEvent && (
              <button
                onClick={() => setIsFeedbackRequestModalOpen(true)}
                disabled={attendedCount === 0}
                className="inline-flex items-center rounded-xl border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-800"
              >
                <ChatBubbleLeftRightIcon className="mr-2 h-4 w-4" />
                Be om tilbakemelding
              </button>
            )}

            {showExport && onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 dark:focus:ring-offset-zinc-800"
              >
                <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
                Eksporter CSV
              </button>
            )}

            {onAddRegistration && (
              <button
                onClick={onAddRegistration}
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-offset-zinc-800"
              >
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Legg til deltaker
              </button>
            )}

            {onImportRegistrations && (
              <button
                onClick={onImportRegistrations}
                className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 dark:focus:ring-offset-zinc-800"
              >
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Importer påmeldinger
              </button>
            )}
          </>
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
