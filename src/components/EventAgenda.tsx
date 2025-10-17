'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { BatchedServerAvatar } from './BatchedServerAvatar'
import { Button } from './Button'
import {
  CalendarIcon,
  LightBulbIcon,
  LockClosedIcon,
} from '@heroicons/react/20/solid'
import {
  UsersIcon,
  PresentationChartLineIcon,
  Battery50Icon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid'
import { ItemType } from '@/lib/events/types'
import type { Attachment, Item } from '@/lib/events/types'
import { getAttachmentIcon } from '@/lib/events/helpers'
import { extractSlackUserId } from '@/lib/slack/utils'

interface EventAgendaProps {
  schedule: Item[]
  attachments: Map<string, Attachment[]>
  hasAdminAccess?: boolean
  eventSlug?: string
  slackUserData?: Map<string, { avatarUrl: string | null; displayName: string }>
}

function EventIcon({
  type,
  className,
}: {
  type: ItemType
  className?: string
}) {
  switch (type) {
    case ItemType.Panel:
      return <UsersIcon className={className} aria-hidden="true" />
    case ItemType.Talk:
      return (
        <PresentationChartLineIcon className={className} aria-hidden="true" />
      )
    case ItemType.Break:
      return <Battery50Icon className={className} aria-hidden="true" />
    default:
      return <InformationCircleIcon className={className} aria-hidden="true" />
  }
}

export function EventAgenda({
  schedule,
  attachments,
  hasAdminAccess = false,
  eventSlug,
  slackUserData,
}: EventAgendaProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (schedule.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
        <CalendarIcon
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
          Program kommer snart
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Vi jobber med å lage et spennende program for denne fagdagen.
          <br />
          Følg med for oppdateringer!
        </p>
        {hasAdminAccess && eventSlug && (
          <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <LightBulbIcon
                className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Som arrangør kan du administrere programmet via admin-panelet.
                </p>
                <Button
                  href={`/admin/events/${eventSlug}`}
                  variant="secondary"
                  className="mt-3 text-xs"
                >
                  Gå til admin-panel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <ol className="mt-6 space-y-6 text-base leading-7">
      {schedule.map(item => {
        const staticAttachments = item.attachments || []
        const uploadedForTalk = attachments.get(item.title) || []
        const allAttachments: Attachment[] = [
          ...staticAttachments,
          ...uploadedForTalk,
        ]

        return (
          <li
            key={item.time}
            className="relative flex space-x-6 border-t border-gray-200 py-6 first:border-t-0 dark:border-gray-700"
          >
            <EventIcon
              type={item.type}
              className="h-9 w-9 flex-none text-gray-400 dark:text-gray-500"
            />

            <div className="flex-auto">
              <h3 className="pr-10 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {item.title}
              </h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
              <dl className="mt-3 flex flex-col text-base text-gray-500 xl:flex-row dark:text-gray-400">
                <div className="flex items-start space-x-3">
                  <dt className="mt-0.5">
                    <span className="sr-only">Tidspunkt</span>
                    <CalendarIcon
                      className="h-5 w-5 text-gray-400 dark:text-gray-500"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd>
                    <time dateTime={item.time}>{item.time}</time>
                  </dd>
                </div>
                {item.speakers && item.speakers.length > 0 && (
                  <div className="xl:border-opacity-50 mt-2 flex items-start space-x-3 xl:mt-0 xl:ml-3.5 xl:border-l xl:border-gray-400 xl:pl-3.5 dark:xl:border-gray-600">
                    <dt className="mt-0.5 flex -space-x-1">
                      {item.speakers.map((speaker, idx) => {
                        const userId = speaker.url
                          ? extractSlackUserId(speaker.url)
                          : null
                        const userData = userId
                          ? slackUserData?.get(userId)
                          : undefined

                        return (
                          <BatchedServerAvatar
                            key={idx}
                            name={speaker.name}
                            slackUserId={userId || undefined}
                            userData={userData}
                            size="sm"
                            className="bg-gray-100 ring-2 ring-white dark:bg-gray-700 dark:ring-gray-800"
                          />
                        )
                      })}
                    </dt>
                    <dd className="ml-2">
                      {item.speakers.map((speaker, idx) => {
                        const userId = speaker.url
                          ? extractSlackUserId(speaker.url)
                          : null
                        const slackUrl = userId
                          ? `https://offentlig-paas-no.slack.com/team/${userId}`
                          : null

                        return (
                          <React.Fragment key={idx}>
                            {idx > 0 && ', '}
                            {slackUrl ? (
                              <a
                                href={slackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {speaker.name}
                              </a>
                            ) : (
                              speaker.name
                            )}
                          </React.Fragment>
                        )
                      })}
                    </dd>
                  </div>
                )}
              </dl>

              {allAttachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Ressurser
                  </h4>
                  {session ? (
                    <ul className="space-y-1">
                      {allAttachments.map((attachment, idx) => (
                        <li key={idx}>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {React.createElement(
                              getAttachmentIcon(attachment.type),
                              {
                                className: 'h-4 w-4',
                                'aria-hidden': 'true',
                              }
                            )}
                            <span className="text-sm">
                              {attachment.title || 'Vedlegg'}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <LockClosedIcon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>
                          {allAttachments.length === 1
                            ? '1 ressurs tilgjengelig'
                            : `${allAttachments.length} ressurser tilgjengelige`}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        <a
                          href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Logg inn
                        </a>{' '}
                        for å se vedlegg
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
