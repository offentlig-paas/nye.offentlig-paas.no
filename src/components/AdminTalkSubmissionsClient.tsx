'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { useAdminEvent } from '@/contexts/AdminEventContext'
import { trpc } from '@/lib/trpc/client'
import { Badge } from '@/components/Badge'
import type { BadgeColor } from '@/components/Badge'
import {
  TalkFormatDisplay,
  TalkSubmissionStatusDisplay,
} from '@/domains/talk-submission/types'
import type { TalkSubmissionStatus } from '@/domains/talk-submission/types'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

const statusConfig: Record<
  TalkSubmissionStatus,
  { icon: typeof ClockIcon; color: BadgeColor }
> = {
  submitted: { icon: ClockIcon, color: 'yellow' },
  accepted: { icon: CheckCircleIcon, color: 'green' },
  rejected: { icon: XCircleIcon, color: 'red' },
  withdrawn: { icon: XMarkIcon, color: 'zinc' },
}

const STATUS_FILTERS: Array<{
  value: TalkSubmissionStatus | 'all'
  label: string
}> = [
  { value: 'all', label: 'Alle' },
  { value: 'submitted', label: 'Innsendt' },
  { value: 'accepted', label: 'Godkjent' },
  { value: 'rejected', label: 'Avslått' },
  { value: 'withdrawn', label: 'Trukket' },
]

export function AdminTalkSubmissionsClient() {
  const { slug } = useAdminEvent()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<
    TalkSubmissionStatus | 'all'
  >('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const { data: submissions, refetch } =
    trpc.admin.talkSubmissions.list.useQuery({ slug })
  const updateStatusMutation =
    trpc.admin.talkSubmissions.updateStatus.useMutation()
  const deleteMutation = trpc.admin.talkSubmissions.delete.useMutation()

  const filteredSubmissions = submissions?.filter(
    s => statusFilter === 'all' || s.status === statusFilter
  )

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleStatusUpdate = async (
    submissionId: string,
    newStatus: TalkSubmissionStatus
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        slug,
        submissionId,
        status: newStatus,
      })
      await refetch()
      startTransition(() => {
        router.refresh()
      })
      showSuccess('Oppdatert', 'Status ble oppdatert')
    } catch (error) {
      showError(
        'Feil',
        error instanceof Error ? error.message : 'Noe gikk galt'
      )
    }
  }

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Er du sikker på at du vil slette dette forslaget?')) {
      return
    }
    try {
      await deleteMutation.mutateAsync({ slug, submissionId })
      await refetch()
      startTransition(() => {
        router.refresh()
      })
      showSuccess('Slettet', 'Forslaget ble slettet')
    } catch (error) {
      showError(
        'Feil',
        error instanceof Error ? error.message : 'Noe gikk galt'
      )
    }
  }

  if (!submissions) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-600">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ingen foredragsforslag er sendt inn ennå.
        </p>
      </div>
    )
  }

  const counts = {
    all: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    accepted: submissions.filter(s => s.status === 'accepted').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    withdrawn: submissions.filter(s => s.status === 'withdrawn').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(filter => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {filter.label}
            {counts[filter.value] > 0 && (
              <span className="ml-1.5 inline-flex items-center rounded-full bg-white/50 px-1.5 py-0.5 text-xs dark:bg-black/20">
                {counts[filter.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredSubmissions?.map(submission => {
          const config = statusConfig[submission.status]
          const StatusIcon = config.icon
          const isExpanded = expandedIds.has(submission._id)

          return (
            <div
              key={submission._id}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:ring-zinc-400/5"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {submission.title}
                      </h3>
                      <Badge color={config.color} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {TalkSubmissionStatusDisplay[submission.status]}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{submission.speakerName}</span>
                      <span>{submission.speakerOrganisation}</span>
                      <span>{TalkFormatDisplay[submission.format]}</span>
                      {submission.duration && (
                        <span>{submission.duration}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(submission._id)}
                    className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-700">
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Beskrivelse
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                        {submission.abstract}
                      </p>
                    </div>

                    {submission.speakerBio && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Om foredragsholder
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {submission.speakerBio}
                        </p>
                      </div>
                    )}

                    {submission.notes && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Tilleggsinfo
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {submission.notes}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-zinc-400 dark:text-zinc-500">
                      {submission.speakerEmail} · Sendt inn{' '}
                      {new Date(submission.submittedAt).toLocaleDateString(
                        'nb-NO',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-700">
                      {submission.status !== 'accepted' && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(submission._id, 'accepted')
                          }
                          disabled={updateStatusMutation.isPending}
                          className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                        >
                          Godkjenn
                        </button>
                      )}
                      {submission.status !== 'rejected' && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(submission._id, 'rejected')
                          }
                          disabled={updateStatusMutation.isPending}
                          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          Avslå
                        </button>
                      )}
                      {submission.status === 'accepted' && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(submission._id, 'submitted')
                          }
                          disabled={updateStatusMutation.isPending}
                          className="rounded-md bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                        >
                          Tilbakestill
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(submission._id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-md bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      >
                        <TrashIcon className="inline h-3.5 w-3.5" /> Slett
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
