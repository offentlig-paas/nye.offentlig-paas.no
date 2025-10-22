'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { trpc } from '@/lib/trpc/client'

interface SendFeedbackRequestModalProps {
  isOpen: boolean
  onClose: () => void
  eventSlug: string
  eventTitle: string
  eventDate: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function SendFeedbackRequestModal({
  isOpen,
  onClose,
  eventSlug,
  eventTitle,
  onSuccess,
  onError,
}: SendFeedbackRequestModalProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)

  const isDevelopment = process.env.NODE_ENV === 'development'
  const sendFeedbackRequestMutation =
    trpc.admin.sendFeedbackRequest.useMutation()

  const defaultMessage = `Takk for at du deltok på ${eventTitle}! 🎉

Gi en rask vurdering via knappen under, eller gå til nettsiden for mer utfyllende tilbakemelding. 📝`

  const handleSend = async () => {
    if (!message.trim()) {
      onError('Meldingen kan ikke være tom')
      return
    }

    setIsSending(true)
    try {
      const result = await sendFeedbackRequestMutation.mutateAsync({
        slug: eventSlug,
        message: message.trim(),
        testMode: isTestMode,
      })

      onSuccess(result.message)
      setMessage('')
      setIsTestMode(false)
      onClose()
    } catch (error) {
      console.error('Error sending feedback request:', error)
      onError('Noe gikk galt ved sending av tilbakemeldingsforespørsel')
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
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <div className="flex items-start justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-semibold text-gray-900 dark:text-white"
                  >
                    Be om tilbakemelding
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none dark:hover:text-gray-300"
                    onClick={handleClose}
                    disabled={isSending}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
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
                            Utviklingsmiljø
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <p>
                              Du kjører i utviklingsmodus. Meldinger som
                              inneholder localhost-URLer vil bli blokkert med
                              mindre du aktiverer testmodus eller setter
                              NEXT_PUBLIC_URL til produksjon.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isDevelopment && (
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
                            Om tilbakemeldingsforespørsler
                          </h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <p>
                              Forespørselen vil bli sendt som en privat melding
                              på Slack til alle påmeldte med status
                              &quot;Deltok&quot; som ikke allerede har gitt
                              tilbakemelding. Meldingen inkluderer en lenke til
                              tilbakemeldingsskjemaet.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="testMode"
                      type="checkbox"
                      checked={isTestMode}
                      onChange={e => setIsTestMode(e.target.checked)}
                      disabled={isSending}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label
                      htmlFor="testMode"
                      className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Testmodus (send kun til meg)
                    </label>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    />
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Be deltakerne om å gi tilbakemelding på arrangementet.
                        Meldingen vil sendes som en formatert melding på Slack
                        med lenke til tilbakemeldingsskjemaet.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-medium">
                          Inkludert automatisk:
                        </span>{' '}
                        Arrangementsnavn, dato og lenke til
                        tilbakemeldingsskjema.
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
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
                        {isTestMode ? 'Send test' : 'Be om tilbakemelding'}
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
