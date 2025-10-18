'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  PresentationChartLineIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowUpIcon,
  StarIcon,
  FunnelIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import { SpeakerMatcher } from '@/components/SpeakerMatcher'
import { TalkAttachmentManager } from '@/components/TalkAttachmentManager'
import { StarRating } from '@/components/StarRating'
import { Button } from '@/components/Button'
import { useToast } from '@/components/ToastProvider'
import { AdminEventStatCard } from '@/components/AdminEventStatCard'
import { useAdminEvent } from '@/contexts/AdminEventContext'
import { getUniqueSpeakersWithoutUrls } from '@/lib/events/helpers'
import { trpc } from '@/lib/trpc/client'
import { ItemType } from '@/lib/events/types'
import type { EventFeedbackSummary } from '@/domains/event-feedback/types'

type TalkTypeFilter = 'all' | ItemType.Talk | ItemType.Panel | ItemType.Workshop
type AttachmentFilter = 'all' | 'with-slides' | 'without-slides'

const TALK_TYPE_ICONS = {
  [ItemType.Talk]: PresentationChartLineIcon,
  [ItemType.Panel]: UserGroupIcon,
  [ItemType.Workshop]: AcademicCapIcon,
}

const TALK_TYPE_COLORS = {
  [ItemType.Talk]:
    'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  [ItemType.Panel]:
    'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  [ItemType.Workshop]:
    'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
}

export function AdminAgendaRedesigned() {
  const { slug, eventDetails } = useAdminEvent()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const { showSuccess, showError } = useToast()

  const [talkTypeFilter, setTalkTypeFilter] = useState<TalkTypeFilter>('all')
  const [attachmentFilter, setAttachmentFilter] =
    useState<AttachmentFilter>('all')
  const [isSendingBulkNudge, setIsSendingBulkNudge] = useState(false)

  const speakersWithoutUrls = useMemo(
    () => getUniqueSpeakersWithoutUrls(eventDetails.schedule),
    [eventDetails.schedule]
  )

  const { data: feedbackData } = trpc.admin.feedback.getAll.useQuery(
    { slug, format: 'summary' },
    { refetchOnWindowFocus: false }
  )
  const summary = feedbackData as EventFeedbackSummary | undefined

  const nudgeSpeakersBulkMutation = trpc.admin.nudgeSpeakersBulk.useMutation()

  const talkRatingsMap = new Map(
    summary?.talkSummaries?.map(t => [t.talkTitle, t]) || []
  )

  const talks = useMemo(() => {
    return eventDetails.schedule.filter(
      item =>
        (item.type === ItemType.Talk ||
          item.type === ItemType.Panel ||
          item.type === ItemType.Workshop) &&
        item.speakers &&
        item.speakers.length > 0
    )
  }, [eventDetails.schedule])

  const filteredTalks = useMemo(() => {
    return talks.filter(talk => {
      const typeMatch = talkTypeFilter === 'all' || talk.type === talkTypeFilter

      let attachmentMatch = true
      if (attachmentFilter === 'with-slides') {
        attachmentMatch = !!(talk.attachments && talk.attachments.length > 0)
      } else if (attachmentFilter === 'without-slides') {
        attachmentMatch = !talk.attachments || talk.attachments.length === 0
      }

      return typeMatch && attachmentMatch
    })
  }, [talks, talkTypeFilter, attachmentFilter])

  const stats = useMemo(() => {
    const withSlides = talks.filter(
      t => t.attachments && t.attachments.length > 0
    ).length
    const withoutSlides = talks.length - withSlides
    const avgRating = summary?.talkSummaries?.length
      ? summary.talkSummaries.reduce((acc, t) => acc + t.averageRating, 0) /
        summary.talkSummaries.length
      : 0

    return {
      total: talks.length,
      withSlides,
      withoutSlides,
      avgRating,
      totalRatings:
        summary?.talkSummaries?.reduce((acc, t) => acc + t.totalRatings, 0) ||
        0,
    }
  }, [talks, summary])

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleBulkNudge = async (onlyWithoutAttachments: boolean) => {
    const mode = onlyWithoutAttachments
      ? 'til foredragsholdere som mangler slides'
      : 'til alle foredragsholdere'

    if (!confirm(`Send påminnelse ${mode}?`)) {
      return
    }

    setIsSendingBulkNudge(true)
    try {
      const result = await nudgeSpeakersBulkMutation.mutateAsync({
        slug,
        onlyWithoutAttachments,
      })

      if (result.sent > 0) {
        showSuccess(
          'Sendt',
          `Påminnelse sendt til ${result.sent} foredragsholder${result.sent !== 1 ? 'e' : ''}${result.failed > 0 ? ` (${result.failed} feilet)` : ''}`
        )
      } else {
        showError('Ingen sendt', result.message || 'Ingen meldinger ble sendt')
      }
    } catch {
      showError('Feil', 'Kunne ikke sende påminnelser')
    } finally {
      setIsSendingBulkNudge(false)
    }
  }

  if (talks.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          Ingen foredrag i programmet
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Programmet inneholder ingen presentasjoner, paneler eller workshops
          ennå.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Speaker Matcher - Only in dev */}
      {process.env.NODE_ENV === 'development' &&
        speakersWithoutUrls.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Koble foredragsholdere til Slack
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {speakersWithoutUrls.length} foredragsholdere mangler
                Slack-profil
              </p>
            </div>
            <div className="p-4">
              <SpeakerMatcher eventSlug={slug} speakers={speakersWithoutUrls} />
            </div>
          </div>
        )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminEventStatCard
          label="Totalt foredrag"
          value={stats.total}
          icon={PresentationChartLineIcon}
          color="blue"
        />
        <AdminEventStatCard
          label="Med slides"
          value={stats.withSlides}
          icon={DocumentArrowUpIcon}
          color="green"
        />
        <AdminEventStatCard
          label="Mangler slides"
          value={stats.withoutSlides}
          icon={XCircleIcon}
          color="orange"
        />
        <AdminEventStatCard
          label="Snitt vurdering"
          value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
          icon={StarIcon}
          color="yellow"
        />
      </div>

      {/* Actions Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrer:
            </span>
            <select
              value={talkTypeFilter}
              onChange={e =>
                setTalkTypeFilter(e.target.value as TalkTypeFilter)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Alle typer</option>
              <option value={ItemType.Talk}>Presentasjoner</option>
              <option value={ItemType.Panel}>Paneler</option>
              <option value={ItemType.Workshop}>Workshops</option>
            </select>

            <select
              value={attachmentFilter}
              onChange={e =>
                setAttachmentFilter(e.target.value as AttachmentFilter)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Alle slides-status</option>
              <option value="with-slides">Med slides</option>
              <option value="without-slides">Mangler slides</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleBulkNudge(true)}
              disabled={isSendingBulkNudge || stats.withoutSlides === 0}
              variant="secondary"
            >
              <BellAlertIcon className="h-4 w-4" />
              Påminn mangler slides
            </Button>
            <Button
              onClick={() => handleBulkNudge(false)}
              disabled={isSendingBulkNudge}
              variant="primary"
            >
              <BellAlertIcon className="h-4 w-4" />
              Påminn alle
            </Button>
          </div>
        </div>
      </div>

      {/* Talks Grid */}
      <div className="space-y-3">
        {filteredTalks.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ingen foredrag matcher valgte filtre
            </p>
          </div>
        ) : (
          filteredTalks.map((talk, idx) => {
            const Icon =
              TALK_TYPE_ICONS[talk.type as keyof typeof TALK_TYPE_ICONS]
            const colorClass =
              TALK_TYPE_COLORS[talk.type as keyof typeof TALK_TYPE_COLORS]
            const talkRating = talkRatingsMap.get(talk.title)
            const speakerSlackId =
              talk.speakers?.[0]?.url?.match(/\/team\/([A-Z0-9]+)$/)?.[1] || ''
            const hasAttachments =
              talk.attachments && talk.attachments.length > 0

            return (
              <div
                key={`${talk.title}-${idx}`}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Talk Header */}
                <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className={`mt-0.5 rounded-lg p-2 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {talk.title}
                          </h4>
                          {hasAttachments && (
                            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-4 w-4" />
                            <span>{talk.time}</span>
                          </div>

                          {talk.speakers && talk.speakers.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <UserGroupIcon className="h-4 w-4" />
                              <span className="truncate">
                                {talk.speakers.map(s => s.name).join(', ')}
                              </span>
                            </div>
                          )}

                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
                          >
                            {talk.type}
                          </span>
                        </div>

                        {talk.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                            {talk.description}
                          </p>
                        )}

                        {/* Rating */}
                        {talkRating && (
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <StarRating
                                rating={talkRating.averageRating}
                                readonly
                                size="sm"
                                showLabel={false}
                              />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {talkRating.averageRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({talkRating.totalRatings} vurderinger)
                              </span>
                            </div>

                            {talkRating.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                                <span>
                                  {talkRating.comments.length} kommentarer
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status indicator */}
                    {hasAttachments ? (
                      <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 flex-shrink-0 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </div>

                {/* Attachments & Comments Section */}
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Attachment Manager */}
                    {speakerSlackId ? (
                      <TalkAttachmentManager
                        eventSlug={slug}
                        talkTitle={talk.title}
                        speakerSlackId={speakerSlackId}
                        canManage={true}
                        isAdminContext={true}
                        onError={message => showError('Feil', message)}
                        onSuccess={message => {
                          showSuccess('Suksess', message)
                          handleRefresh()
                        }}
                      />
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Ingen Slack-bruker tilknyttet foredragsholder
                      </p>
                    )}

                    {/* Feedback Comments */}
                    {talkRating && talkRating.comments.length > 0 && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                        <h5 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Tilbakemeldinger fra deltakere:
                        </h5>
                        <div className="space-y-2">
                          {talkRating.comments
                            .slice(0, 3)
                            .map((comment, idx) => (
                              <p
                                key={idx}
                                className="text-xs text-gray-600 dark:text-gray-400"
                              >
                                &ldquo;{comment}&rdquo;
                              </p>
                            ))}
                          {talkRating.comments.length > 3 && (
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              +{talkRating.comments.length - 3} flere
                              kommentarer
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Results summary */}
      {filteredTalks.length > 0 && filteredTalks.length !== talks.length && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Viser {filteredTalks.length} av {talks.length} foredrag
        </div>
      )}
    </div>
  )
}
