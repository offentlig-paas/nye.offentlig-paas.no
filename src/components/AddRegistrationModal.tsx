'use client'

import { useState } from 'react'
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { AdminModal } from '@/components/AdminModal'
import { Avatar } from '@/components/Avatar'
import { OrganisationTypeahead } from '@/components/OrganisationTypeahead'
import { trpc } from '@/lib/trpc/client'

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
    slackUserId?: string
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
  const [slackSearch, setSlackSearch] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [slackUserId, setSlackUserId] = useState('')
  const [attendanceType, setAttendanceType] = useState<'physical' | 'digital'>(
    attendanceTypes.includes('physical') ? 'physical' : 'digital'
  )
  const [attendingSocialEvent, setAttendingSocialEvent] = useState(false)
  const [dietary, setDietary] = useState('')
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedSlackQuery = slackSearch.trim()
  const { data: slackResults, isFetching: isSearchingSlack } =
    trpc.slack.searchUsers.useQuery(
      { query: trimmedSlackQuery },
      { enabled: isOpen && trimmedSlackQuery.length >= 2 }
    )

  const resetForm = () => {
    setSlackSearch('')
    setName('')
    setEmail('')
    setOrganisation('')
    setSlackUserId('')
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
        slackUserId: slackUserId.trim() || undefined,
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
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Legg til deltaker manuelt"
      description="Søk opp deltaker fra Slack for automatisk utfylling, eller fyll ut feltene manuelt."
      icon={UserPlusIcon}
      closeDisabled={isSubmitting}
    >
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-blue-200/70 bg-blue-50/40 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <label
              htmlFor="reg-slack-lookup"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Hent profil fra Slack
            </label>
            <span
              id="reg-slack-lookup-hint"
              className="text-xs text-zinc-500 dark:text-zinc-400"
            >
              Autofyller skjemaet
            </span>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="reg-slack-lookup"
              aria-describedby="reg-slack-lookup-hint"
              type="text"
              value={slackSearch}
              onChange={e => setSlackSearch(e.target.value)}
              disabled={isSubmitting}
              placeholder="Søk på navn eller e-post i Slack..."
              className={`${inputClassName} pl-9`}
            />
          </div>

          {trimmedSlackQuery.length >= 2 && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              {isSearchingSlack ? (
                <p className="px-3 py-2 text-xs text-zinc-500">
                  Søker i Slack...
                </p>
              ) : slackResults?.users && slackResults.users.length > 0 ? (
                slackResults.users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setName(u.realName)
                      if (u.email) setEmail(u.email)
                      if (u.organisation) setOrganisation(u.organisation)
                      setSlackUserId(u.id)
                      setSlackSearch('')
                    }}
                    className="flex w-full items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2 text-left text-xs transition last:border-b-0 hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-blue-950/40"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={u.realName} slackUserId={u.id} size="xs" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                          {u.realName}
                        </div>
                        <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {[u.organisation, u.email]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      Velg
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-zinc-500">
                  Ingen Slack-brukere funnet for «{trimmedSlackQuery}».
                </p>
              )}
            </div>
          )}

          {slackUserId && (
            <div className="mt-2 flex items-center justify-between rounded-md bg-white/80 px-2.5 py-1.5 text-xs text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:ring-zinc-700">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Koblet til Slack-ID{' '}
                  <code className="font-mono font-semibold">{slackUserId}</code>
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSlackUserId('')}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                title="Fjern Slack-kobling"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

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
          <OrganisationTypeahead
            id="reg-organisation"
            value={organisation}
            onChange={setOrganisation}
            label="Organisasjon"
            required
            disabled={isSubmitting}
            placeholder="Søk etter organisasjon..."
            className={inputClassName}
            labelClassName={labelClassName}
          />
        </div>

        <div>
          <label htmlFor="reg-slack-id" className={labelClassName}>
            Slack-bruker-ID{' '}
            <span className="font-normal text-zinc-400">(valgfritt)</span>
          </label>
          <input
            id="reg-slack-id"
            type="text"
            value={slackUserId}
            onChange={e => setSlackUserId(e.target.value)}
            disabled={isSubmitting}
            className={inputClassName}
            placeholder="U12345678"
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
              onChange={e => setAttendingSocialEvent(e.target.checked)}
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
    </AdminModal>
  )
}
