'use client'

import { useState } from 'react'
import {
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { AdminModal } from '@/components/AdminModal'
import type { RegistrationStatus } from '@/domains/event-registration/types'
import { trpc } from '@/lib/trpc/client'

interface SendReminderModalProps {
  isOpen: boolean
  onClose: () => void
  eventSlug: string
  eventTitle: string
  eventDate: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function SendReminderModal({
  isOpen,
  onClose,
  eventSlug,
  eventTitle,
  eventDate,
  onSuccess,
  onError,
}: SendReminderModalProps) {
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>(
    'all'
  )
  const [isSending, setIsSending] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)

  const isDevelopment = process.env.NODE_ENV === 'development'
  const sendReminderMutation = trpc.admin.sendReminder.useMutation()

  const defaultMessage = `Hei! 👋

Dette er en påminnelse om ${eventTitle} som finner sted ${eventDate}.

Vi gleder oss til å se deg der! 🎉`

  const handleSend = async () => {
    if (!message.trim()) {
      onError('Meldingen kan ikke være tom')
      return
    }

    setIsSending(true)
    try {
      const result = await sendReminderMutation.mutateAsync({
        slug: eventSlug,
        message: message.trim(),
        statusFilter,
        testMode: isTestMode,
      })

      onSuccess(result.message)
      setMessage('')
      setIsTestMode(false)
      onClose()
    } catch (error) {
      console.error('Error sending reminder:', error)
      onError('Noe gikk galt ved sending av påminnelse')
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    if (!isSending) {
      setMessage('')
      setIsTestMode(false)
      onClose()
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send påminnelse til deltakere"
      icon={PaperAirplaneIcon}
      maxWidth="2xl"
      closeDisabled={isSending}
    >
      <div className="space-y-4">
        {isDevelopment && (
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon
                  className="h-5 w-5 text-yellow-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Development Environment
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    You&apos;re running in development mode. Messages containing
                    localhost URLs will be blocked unless you enable test mode
                    or set NEXT_PUBLIC_URL to production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon
                className="h-5 w-5 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Om påminnelser
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  Påminnelsen vil bli sendt som en privat melding på Slack til
                  alle påmeldte med status &quot;Bekreftet&quot; eller
                  &quot;Deltok&quot;. Du kan filtrere basert på status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center">
          <input
            id="testMode"
            type="checkbox"
            checked={isTestMode}
            onChange={e => setIsTestMode(e.target.checked)}
            disabled={isSending}
            className="size-4 rounded-sm border border-zinc-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:checked:border-blue-500 dark:checked:bg-blue-500 forced-colors:appearance-auto"
          />
          <label
            htmlFor="testMode"
            className="ml-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Testmodus (send kun til meg)
          </label>
        </div>

        {!isTestMode && (
          <div>
            <label
              htmlFor="statusFilter"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Filtrer etter status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as RegistrationStatus | 'all')
              }
              disabled={isSending}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 disabled:opacity-50 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10"
            >
              <option value="all">Alle bekreftede (Bekreftet + Deltok)</option>
              <option value="confirmed">Kun bekreftede</option>
              <option value="attended">Kun de som deltok</option>
              <option value="waitlist">Kun venteliste</option>
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Melding
          </label>
          <textarea
            id="message"
            rows={6}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={defaultMessage}
            disabled={isSending}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 disabled:opacity-50 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500"
          />
          <div className="mt-2 space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Skriv en vennlig påminnelse til deltakerne. Meldingen vil sendes
              som en formatert melding på Slack med arrangement-detaljer.
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              <span className="font-medium">Inkludert automatisk:</span> Dato,
              tid, sted, lenke til program, og direktestrøm-link (hvis
              tilgjengelig)
            </p>
          </div>
        </div>

        {!message.trim() && (
          <button
            type="button"
            onClick={() => setMessage(defaultMessage)}
            disabled={isSending}
            className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Bruk standard melding
          </button>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleClose}
          disabled={isSending}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
        >
          Avbryt
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isSending ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sender...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="mr-2 h-4 w-4" />
              {isTestMode ? 'Send test' : 'Send påminnelse'}
            </>
          )}
        </button>
      </div>
    </AdminModal>
  )
}
