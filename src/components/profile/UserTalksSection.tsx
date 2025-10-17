'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PresentationChartLineIcon } from '@heroicons/react/20/solid'
import { formatDateLong } from '@/lib/formatDate'
import { getAttachmentIcon } from '@/lib/events/helpers'
import { TalkAttachmentManager } from '@/components/TalkAttachmentManager'
import { urlForImage, type EventPhoto } from '@/lib/sanity/event-photos'
import type { Event } from '@/lib/events/types'

interface UserTalk {
  event: Event
  talk: Event['schedule'][number]
}

interface UserTalksSectionProps {
  talks: UserTalk[]
  userSlackId: string
}

export function UserTalksSection({
  talks,
  userSlackId,
}: UserTalksSectionProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [talkPhotos, setTalkPhotos] = useState<Map<string, EventPhoto[]>>(
    new Map()
  )

  useEffect(() => {
    async function fetchPhotos() {
      const photosMap = new Map<string, EventPhoto[]>()

      for (const item of talks) {
        const speakerName = item.talk.speakers?.find(s =>
          s.url?.includes(`/team/${userSlackId}`)
        )?.name

        if (speakerName) {
          try {
            const response = await fetch(
              `/api/photos/by-speaker?eventSlug=${item.event.slug}&speakerName=${encodeURIComponent(speakerName)}`
            )
            if (response.ok) {
              const photos = (await response.json()) as EventPhoto[]
              if (photos.length > 0) {
                photosMap.set(`${item.event.slug}-${item.talk.title}`, photos)
              }
            }
          } catch (error) {
            console.error('Error fetching photos:', error)
          }
        }
      }

      setTalkPhotos(photosMap)
    }

    fetchPhotos()
  }, [talks, userSlackId])

  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mine foredrag
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

      {talks.length > 0 ? (
        <div className="mt-6 space-y-3">
          {talks.map((item, idx) => {
            const talkKey = `${item.event.slug}-${item.talk.title}`
            const photos = talkPhotos.get(talkKey) || []

            return (
              <div
                key={`${item.event.slug}-${idx}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex items-start gap-3">
                  <PresentationChartLineIcon className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.talk.title}
                    </h3>
                    <Link
                      href={`/fagdag/${item.event.slug}`}
                      className="mt-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {item.event.title}
                    </Link>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDateLong(item.event.start)} • {item.talk.time}
                    </p>
                    {item.talk.description && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.talk.description}
                      </p>
                    )}

                    {photos.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {photos.slice(0, 4).map(photo => (
                          <div
                            key={photo._id}
                            className="relative h-20 w-20 overflow-hidden rounded-md"
                          >
                            <Image
                              src={urlForImage(photo.image)
                                .width(600)
                                .height(600)
                                .url()}
                              alt={photo.caption || 'Talk photo'}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ))}
                        {photos.length > 4 && (
                          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                            +{photos.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {item.talk.attachments &&
                      item.talk.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.talk.attachments.map(attachment => {
                            const Icon = getAttachmentIcon(attachment.type)
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

                    <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                      <TalkAttachmentManager
                        eventSlug={item.event.slug}
                        talkTitle={item.talk.title}
                        speakerSlackId={userSlackId}
                        canManage={true}
                        onError={error => {
                          setErrorMessage(error)
                          setTimeout(() => setErrorMessage(null), 5000)
                        }}
                        onSuccess={message => {
                          setSuccessMessage(message)
                          setTimeout(() => setSuccessMessage(null), 5000)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Ingen registrerte foredrag
        </p>
      )}
    </section>
  )
}
