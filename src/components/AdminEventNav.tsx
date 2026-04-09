'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import { getEventState } from '@/lib/events/state-machine'

interface AdminEventNavProps {
  eventSlug: string
  eventStartTime: string
  attendeesCount?: number
  talksCount?: number
  photosCount?: number
  feedbackCount?: number
  showFeedback?: boolean
  submissionsCount?: number
  showSubmissions?: boolean
}

export function AdminEventNav({
  eventSlug,
  eventStartTime,
  attendeesCount,
  talksCount,
  photosCount,
  feedbackCount,
  showFeedback,
  submissionsCount,
  showSubmissions,
}: AdminEventNavProps) {
  const pathname = usePathname()
  const state = getEventState(eventStartTime)

  // Determine if feedback should be shown (post-event or explicitly enabled)
  const displayFeedback = showFeedback ?? state === 'POST_EVENT'

  const tabs = [
    {
      name: 'Oversikt',
      href: `/admin/events/${eventSlug}`,
      icon: HomeIcon,
      current: pathname === `/admin/events/${eventSlug}`,
    },
    {
      name: 'Deltakere',
      href: `/admin/events/${eventSlug}/attendees`,
      icon: UserGroupIcon,
      current: pathname === `/admin/events/${eventSlug}/attendees`,
      badge: attendeesCount,
    },
    {
      name: 'Program',
      href: `/admin/events/${eventSlug}/agenda`,
      icon: CalendarDaysIcon,
      current: pathname === `/admin/events/${eventSlug}/agenda`,
      badge: talksCount,
    },
  ]

  if (
    showSubmissions ||
    (submissionsCount !== undefined && submissionsCount > 0)
  ) {
    tabs.push({
      name: 'Foredragsforslag',
      href: `/admin/events/${eventSlug}/submissions`,
      icon: LightBulbIcon,
      current: pathname === `/admin/events/${eventSlug}/submissions`,
      badge: submissionsCount,
    })
  }

  tabs.push({
    name: 'Bilder',
    href: `/admin/events/${eventSlug}/photos`,
    icon: PhotoIcon,
    current: pathname === `/admin/events/${eventSlug}/photos`,
    badge: photosCount,
  })

  if (displayFeedback) {
    tabs.push({
      name: 'Tilbakemeldinger',
      href: `/admin/events/${eventSlug}/feedback`,
      icon: ChatBubbleLeftRightIcon,
      current: pathname === `/admin/events/${eventSlug}/feedback`,
      badge: feedbackCount,
    })
  }

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                tab.current
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  tab.current
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400'
                }`}
              />
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    tab.current
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
