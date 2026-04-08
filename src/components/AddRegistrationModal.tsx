'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline'

interface AddRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    email: string
    organisation: string
    attendanceType: 'physical' | 'digital'
    attendingSocialEvent?: boolean
    dietary?: string
    comments?: string
  }) => Promise<void>
  hasSocialEvent: boolean
  attendanceTypes: string[]
}

export function AddRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  hasSocialEvent,
  attendanceTypes,
}: AddRegistrationModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [attendanceType, setAttendanceType] = useState<'physical' | 'digital'>(
    attendanceTypes.includes('physical') ? 'physical' : 'digital'
  )
  const [attendingSocialEvent, setAttendingSocialEvent] = useState(false)
  const [dietary, setDietary] = useState('')
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setEmail('')
    setOrganisation('')
    setAttendanceType(
      attendanceTypes.includes('physical') ? 'physical' : 'digital'
    )
    setAttendingSocialEvent(false)
    setDietary('')
    setComments('')
    setError(null)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        organisation: organisation.trim(),
        attendanceType,
        attendingSocialEvent: hasSocialEvent ? attendingSocialEvent : undefined,
        dietary: dietary.trim() || undefined,
        comments: comments.trim() || undefined,
      })
      resetForm()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Noe gikk galt ved registrering'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClassName =
    'block w-full rounded-md bg-white px-3 py-2 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 disabled:opacity-50 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500'

  const labelClassName =
    'mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300'

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-800">
                <div className="flex items-start justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-semibold text-zinc-900 dark:text-white"
                  >
                    Legg til deltaker manuelt
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-zinc-400 hover:text-zinc-500 focus:outline-none dark:hover:text-zinc-300"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Registrer en deltaker som ikke bruker Slack.
                </p>

                {error && (
                  <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="reg-name" className={labelClassName}>
                      Navn <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isSubmitting}
                      className={inputClassName}
                      placeholder="Ola Nordmann"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-email" className={labelClassName}>
                      E-post <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className={inputClassName}
                      placeholder="ola@organisasjon.no"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reg-organisation"
                      className={labelClassName}
                    >
                      Organisasjon <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-organisation"
                      type="text"
                      required
                      value={organisation}
                      onChange={e => setOrganisation(e.target.value)}
                      disabled={isSubmitting}
                      className={inputClassName}
                      placeholder="Digitaliseringsdirektoratet"
                    />
                  </div>

                  {attendanceTypes.length > 1 ? (
                    <fieldset>
                      <legend className={labelClassName}>
                        Deltakelse <span className="text-red-500">*</span>
                      </legend>
                      <div className="mt-1 flex gap-4">
                        {attendanceTypes.includes('physical') && (
                          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <input
                              type="radio"
                              name="attendanceType"
                              value="physical"
                              checked={attendanceType === 'physical'}
                              onChange={() => setAttendanceType('physical')}
                              disabled={isSubmitting}
                              className="size-4 border border-zinc-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/10 dark:bg-white/5 dark:checked:border-blue-500 dark:checked:bg-blue-500"
                            />
                            Fysisk
                          </label>
                        )}
                        {attendanceTypes.includes('digital') && (
                          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <input
                              type="radio"
                              name="attendanceType"
                              value="digital"
                              checked={attendanceType === 'digital'}
                              onChange={() => setAttendanceType('digital')}
                              disabled={isSubmitting}
                              className="size-4 border border-zinc-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/10 dark:bg-white/5 dark:checked:border-blue-500 dark:checked:bg-blue-500"
                            />
                            Digitalt
                          </label>
                        )}
                      </div>
                    </fieldset>
                  ) : null}

                  {hasSocialEvent && (
                    <div className="flex items-center gap-2">
                      <input
                        id="reg-social"
                        type="checkbox"
                        checked={attendingSocialEvent}
                        onChange={e =>
                          setAttendingSocialEvent(e.target.checked)
                        }
                        disabled={isSubmitting}
                        className="size-4 rounded-sm border border-zinc-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:checked:border-blue-500 dark:checked:bg-blue-500"
                      />
                      <label
                        htmlFor="reg-social"
                        className="text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        Deltar på sosialt arrangement
                      </label>
                    </div>
                  )}

                  <div>
                    <label htmlFor="reg-dietary" className={labelClassName}>
                      Allergier / matpreferanser
                    </label>
                    <input
                      id="reg-dietary"
                      type="text"
                      value={dietary}
                      onChange={e => setDietary(e.target.value)}
                      disabled={isSubmitting}
                      className={inputClassName}
                      placeholder="Vegetar, glutenfri, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-comments" className={labelClassName}>
                      Kommentarer
                    </label>
                    <textarea
                      id="reg-comments"
                      rows={2}
                      value={comments}
                      onChange={e => setComments(e.target.value)}
                      disabled={isSubmitting}
                      className={inputClassName}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      {isSubmitting ? (
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
                          Registrerer...
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="mr-2 h-4 w-4" />
                          Legg til
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
