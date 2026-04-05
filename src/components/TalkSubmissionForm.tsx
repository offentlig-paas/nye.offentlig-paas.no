'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/Button'
import { AuthButton } from '@/components/AuthButton'
import { useToast } from '@/components/ToastProvider'
import { trpc } from '@/lib/trpc/client'
import {
  TalkFormatDisplay,
  TalkSubmissionStatusDisplay,
} from '@/domains/talk-submission/types'
import type { TalkFormat } from '@/domains/talk-submission/types'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid'

const TALK_FORMATS = Object.keys(TalkFormatDisplay) as TalkFormat[]

const DURATIONS = ['15 min', '20 min', '30 min', '45 min', '60 min']

interface TalkSubmissionFormProps {
  eventSlug: string
  eventTitle: string
}

const statusIcons: Record<string, typeof CheckCircleIcon> = {
  submitted: ClockIcon,
  accepted: CheckCircleIcon,
  rejected: XCircleIcon,
  withdrawn: XMarkIcon,
}

const statusColors: Record<string, string> = {
  submitted:
    'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  accepted:
    'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  rejected: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  withdrawn: 'bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
}

const inputClassName =
  'block w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500'

const selectClassName =
  'col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 *:bg-white focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-zinc-800'

export function TalkSubmissionForm({
  eventSlug,
  eventTitle,
}: TalkSubmissionFormProps) {
  const { data: session, status: sessionStatus } = useSession()
  const { showSuccess, showError } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    format: 'Presentation' as TalkFormat,
    duration: '',
    organisation: '',
    speakerBio: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitMutation = trpc.talkSubmission.submit.useMutation()
  const withdrawMutation = trpc.talkSubmission.withdraw.useMutation()

  const { data: existingSubmissions, refetch } =
    trpc.talkSubmission.getUserSubmissions.useQuery(
      { slug: eventSlug },
      { enabled: !!session?.user?.slackId }
    )

  if (sessionStatus === 'loading') {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-700">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Logg inn for å sende inn foredragsforslag til {eventTitle}.
        </p>
        <AuthButton className="w-full" />
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.abstract.trim()) return

    const submittedTitle = formData.title.trim()
    setIsSubmitting(true)
    try {
      await submitMutation.mutateAsync({
        slug: eventSlug,
        title: submittedTitle,
        abstract: formData.abstract.trim(),
        format: formData.format,
        duration: formData.duration || undefined,
        organisation: formData.organisation || undefined,
        speakerBio: formData.speakerBio || undefined,
        notes: formData.notes || undefined,
      })

      setFormData({
        title: '',
        abstract: '',
        format: 'Presentation',
        duration: '',
        organisation: '',
        speakerBio: '',
        notes: '',
      })
      await refetch()
      showSuccess(
        'Forslag sendt inn!',
        `Ditt foredragsforslag "${submittedTitle}" er sendt inn.`
      )
    } catch (error) {
      showError(
        'Feil ved innsending',
        error instanceof Error ? error.message : 'Noe gikk galt'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWithdraw = async (submissionId: string) => {
    try {
      await withdrawMutation.mutateAsync({
        slug: eventSlug,
        submissionId,
      })
      await refetch()
      showSuccess('Forslag trukket', 'Foredragsforslaget er trukket tilbake.')
    } catch (error) {
      showError(
        'Feil',
        error instanceof Error ? error.message : 'Noe gikk galt'
      )
    }
  }

  const activeSubmissions = existingSubmissions?.filter(
    s => s.status !== 'withdrawn'
  )

  return (
    <div className="space-y-6">
      {activeSubmissions && activeSubmissions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Dine forslag
          </p>
          {activeSubmissions.map(submission => {
            const StatusIcon = statusIcons[submission.status] ?? ClockIcon
            return (
              <div
                key={submission._id}
                className={`rounded-lg p-3 ${statusColors[submission.status]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {submission.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs opacity-75">
                      {TalkFormatDisplay[submission.format]} ·{' '}
                      {TalkSubmissionStatusDisplay[submission.status]}
                    </p>
                  </div>
                  {submission.status === 'submitted' && (
                    <button
                      onClick={() => handleWithdraw(submission._id)}
                      disabled={withdrawMutation.isPending}
                      className="shrink-0 text-xs underline opacity-75 hover:opacity-100"
                    >
                      Trekk
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="talk-title"
            className="block text-sm/6 font-medium text-zinc-900 dark:text-white"
          >
            Tittel *
          </label>
          <div className="mt-2">
            <input
              type="text"
              id="talk-title"
              required
              className={inputClassName}
              placeholder="Tittel på foredraget"
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="talk-abstract"
            className="block text-sm/6 font-medium text-zinc-900 dark:text-white"
          >
            Beskrivelse *
          </label>
          <div className="mt-2">
            <textarea
              id="talk-abstract"
              rows={4}
              required
              className={inputClassName}
              placeholder="Beskriv foredraget ditt"
              value={formData.abstract}
              onChange={e =>
                setFormData(prev => ({ ...prev, abstract: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="talk-format"
              className="block text-sm/6 font-medium text-zinc-900 dark:text-white"
            >
              Format *
            </label>
            <div className="mt-2 grid grid-cols-1">
              <select
                id="talk-format"
                className={selectClassName}
                value={formData.format}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    format: e.target.value as TalkFormat,
                  }))
                }
              >
                {TALK_FORMATS.map(format => (
                  <option key={format} value={format}>
                    {TalkFormatDisplay[format]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-zinc-500 sm:size-4 dark:text-zinc-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="talk-duration"
              className="block text-sm/6 font-medium text-zinc-900 dark:text-white"
            >
              Ønsket varighet
            </label>
            <div className="mt-2 grid grid-cols-1">
              <select
                id="talk-duration"
                className={selectClassName}
                value={formData.duration}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
              >
                <option value="">Fleksibel</option>
                {DURATIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-zinc-500 sm:size-4 dark:text-zinc-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="talk-organisation"
            className="block text-sm/6 font-medium text-zinc-900 dark:text-white"
          >
            Organisasjon
          </label>
          <div className="mt-2">
            <input
              type="text"
              id="talk-organisation"
              className={inputClassName}
              placeholder={
                session.user.statusText || 'F.eks. NAV, Skatteetaten'
              }
              value={formData.organisation}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  organisation: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="talk-bio"
            className="block text-sm/6 font-medium text-zinc-900 dark:text-white"
          >
            Kort bio (valgfritt)
          </label>
          <div className="mt-2">
            <textarea
              id="talk-bio"
              rows={2}
              className={inputClassName}
              placeholder="Fortell kort om deg selv og din bakgrunn"
              value={formData.speakerBio}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  speakerBio: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="talk-notes"
            className="block text-sm/6 font-medium text-zinc-900 dark:text-white"
          >
            Tilleggsinfo (valgfritt)
          </label>
          <div className="mt-2">
            <textarea
              id="talk-notes"
              rows={2}
              className={inputClassName}
              placeholder="Andre ting arrangørene bør vite, f.eks. tekniske behov eller co-speakers"
              value={formData.notes}
              onChange={e =>
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting || !formData.title.trim() || !formData.abstract.trim()
          }
          className="w-full"
        >
          {isSubmitting ? 'Sender inn...' : 'Send inn forslag'}
        </Button>
      </div>
    </div>
  )
}
