'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarIcon,
  MapPinIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/20/solid'
import { formatDateLong } from '@/lib/formatDate'
import { getAttachmentIcon, isTalkType } from '@/lib/events/helpers'
import { TalkAttachmentManager } from '@/components/TalkAttachmentManager'
import type { Event } from '@/lib/events/types'
import type { EventRegistration } from '@/domains/event-registration/types'

interface UpcomingEventWithMeta {
  event: Event
  registration?: EventRegistration
  priority: number
  isOrganizer: boolean
  isSpeaker: boolean
  isAttending: boolean
}

interface UpcomingEventsSectionProps {
  events: UpcomingEventWithMeta[]
  userSlackId?: string
}

export function UpcomingEventsSection({
  events,
  userSlackId,
}: UpcomingEventsSectionProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mine kommende fagdager
      </h2>

      {errorMessage && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            {errorMessage}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            {successMessage}
          </p>
        </div>
      )}

      {events.length > 0 ? (
        <div className="mt-6 space-y-4">
          {events.map((item, index) => {
            const userTalks =
              item.isSpeaker && userSlackId
                ? item.event.schedule.filter(
                    scheduleItem =>
                      isTalkType(scheduleItem.type) &&
                      scheduleItem.speakers?.some(
                        speaker =>
                          speaker.url &&
                          speaker.url.includes(`/team/${userSlackId}`)
                      )
                  )
                : []

            return (
              <div
                key={`upcoming-${index}-${item.event.slug}`}
                className="group relative rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  {item.isOrganizer && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Arrangør
                    </span>
                  )}
                  {item.isSpeaker && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Foredragsholder
                    </span>
                  )}
                  {item.isAttending && !item.isOrganizer && !item.isSpeaker && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Påmeldt
                    </span>
                  )}
                </div>

                {item.isOrganizer && (
                  <Link
                    href={`/admin/events/${item.event.slug}`}
                    className="absolute top-6 right-6 rounded-md p-1.5 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                    title="Administrer fagdag"
                  >
                    <Cog6ToothIcon className="h-5 w-5" />
                  </Link>
                )}

                <Link
                  href={`/fagdag/${item.event.slug}`}
                  className="text-lg font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
                >
                  {item.event.title}
                </Link>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDateLong(item.event.start)}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <MapPinIcon className="h-4 w-4" />
                    {item.event.location}
                  </div>
                </div>
                {item.registration?.comments && (
                  <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                    <p className="font-medium">Din kommentar:</p>
                    <p className="mt-1">{item.registration.comments}</p>
                  </div>
                )}

                {item.isSpeaker && userTalks.length > 0 && (
                  <div className="mt-4 space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                    {userTalks.map((talk, talkIdx) => (
                      <div
                        key={`${item.event.slug}-talk-${talkIdx}`}
                        className="rounded-md bg-zinc-50 p-4 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-start gap-2">
                          <PresentationChartLineIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                          <div className="flex-1">
                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                              {talk.title}
                            </h4>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                              {talk.time}
                            </p>
                            {talk.description && (
                              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                {talk.description}
                              </p>
                            )}
                            {talk.attachments &&
                              talk.attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {talk.attachments.map(attachment => {
                                    const Icon = getAttachmentIcon(
                                      attachment.type
                                    )
                                    return (
                                      <a
                                        key={attachment.url}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                                      >
                                        <Icon className="h-3 w-3" />
                                        {attachment.title || attachment.type}
                                      </a>
                                    )
                                  })}
                                </div>
                              )}

                            {userSlackId && (
                              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-600">
                                <TalkAttachmentManager
                                  eventSlug={item.event.slug}
                                  talkTitle={talk.title}
                                  speakerSlackId={userSlackId}
                                  canManage={true}
                                  onError={error => {
                                    setErrorMessage(error)
                                    setTimeout(
                                      () => setErrorMessage(null),
                                      5000
                                    )
                                  }}
                                  onSuccess={message => {
                                    setSuccessMessage(message)
                                    setTimeout(
                                      () => setSuccessMessage(null),
                                      5000
                                    )
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Ingen kommende fagdager
        </p>
      )}
    </section>
  )
}
