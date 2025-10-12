import Link from 'next/link'
import { PresentationChartLineIcon } from '@heroicons/react/20/solid'
import { formatDateLong } from '@/lib/formatDate'
import { getAttachmentIcon } from '@/lib/events/helpers'
import type { Event } from '@/lib/events/types'

interface UserTalk {
  event: Event
  talk: Event['schedule'][number]
}

interface UserTalksSectionProps {
  talks: UserTalk[]
}

export function UserTalksSection({ talks }: UserTalksSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mine foredrag
      </h2>
      {talks.length > 0 ? (
        <div className="mt-6 space-y-3">
          {talks.map((item, idx) => (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Ingen registrerte foredrag
        </p>
      )}
    </section>
  )
}
