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
  variant?: 'bar' | 'card'
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
  variant = 'bar',
}: AdminEventActionsProps) {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isFeedbackRequestModalOpen, setIsFeedbackRequestModalOpen] =
    useState(false)

  const state = getEventState(eventStartTime)
  const isPreEvent = state === 'PRE_EVENT'
  const hasSelection = selectedCount > 0

  if (variant === 'card') {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-700/80 dark:bg-zinc-800">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <BellIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Hurtighandlinger
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Varsling og eksport
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {isPreEvent && (
              <button
                onClick={() => setIsReminderModalOpen(true)}
                disabled={activeRegistrations === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <BellIcon className="h-4 w-4" />
                <span>Send påminnelse ({activeRegistrations} deltakere)</span>
              </button>
            )}

            {!isPreEvent && (
              <button
                onClick={() => setIsFeedbackRequestModalOpen(true)}
                disabled={attendedCount === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Be om tilbakemelding ({attendedCount} deltok)</span>
              </button>
            )}

            {onAddRegistration && (
              <button
                type="button"
                onClick={onAddRegistration}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <UserPlusIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span>Legg til deltaker manuelt</span>
              </button>
            )}

            {showExport && onExport && (
              <button
                onClick={onExport}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <DocumentArrowDownIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span>Eksporter deltakere (CSV)</span>
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          {isPreEvent
            ? 'Påminnelsen inkluderer tidspunkt, oppmøteadresse og evt. streaming-lenke.'
            : 'Be deltakere om tilbakemelding for å forbedre fremtidige fagdager.'}
        </p>

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

  return (
    <div
      className={`rounded-2xl border p-3.5 shadow-xs transition-colors ${
        hasSelection
          ? 'border-blue-200 bg-blue-50/80 dark:border-blue-900/60 dark:bg-blue-950/40'
          : 'border-zinc-200/80 bg-white dark:border-zinc-700/80 dark:bg-zinc-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {hasSelection ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              {selectedCount} valgt
            </span>

            <div className="mx-1 h-4 w-px bg-blue-200 dark:bg-blue-800" />

            <button
              onClick={() => onBulkStatusUpdate?.('confirmed')}
              className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Bekreft
            </button>
            <button
              onClick={() => onBulkStatusUpdate?.('attended')}
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              Merk som deltok
            </button>
            <button
              onClick={() => onBulkStatusUpdate?.('no-show')}
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              Ikke møtt
            </button>
            <button
              onClick={() => onBulkStatusUpdate?.('waitlist')}
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              Venteliste
            </button>

            <div className="mx-1 h-4 w-px bg-blue-200 dark:bg-blue-800" />

            <button
              onClick={onClearSelection}
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
            >
              <XMarkIcon className="mr-1 h-3.5 w-3.5" />
              Avbryt
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {isPreEvent && (
              <button
                onClick={() => setIsReminderModalOpen(true)}
                disabled={activeRegistrations === 0}
                className="inline-flex items-center rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <BellIcon className="mr-1.5 h-4 w-4" />
                Send påminnelse
              </button>
            )}

            {!isPreEvent && (
              <button
                onClick={() => setIsFeedbackRequestModalOpen(true)}
                disabled={attendedCount === 0}
                className="inline-flex items-center rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <ChatBubbleLeftRightIcon className="mr-1.5 h-4 w-4" />
                Be om tilbakemelding
              </button>
            )}

            {onAddRegistration && (
              <button
                onClick={onAddRegistration}
                className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <UserPlusIcon className="mr-1.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                Legg til deltaker
              </button>
            )}

            {onImportRegistrations && (
              <button
                onClick={onImportRegistrations}
                className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <ArrowDownTrayIcon className="mr-1.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                Importer påmeldinger
              </button>
            )}

            {showExport && onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <DocumentArrowDownIcon className="mr-1.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                Eksporter CSV
              </button>
            )}
          </div>
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
