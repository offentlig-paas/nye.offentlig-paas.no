'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
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
}

export function AdminEventNav({
  eventSlug,
  eventStartTime,
  attendeesCount,
  talksCount,
  photosCount,
  feedbackCount,
  showFeedback,
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
    {
      name: 'Bilder',
      href: `/admin/events/${eventSlug}/photos`,
      icon: PhotoIcon,
      current: pathname === `/admin/events/${eventSlug}/photos`,
      badge: photosCount,
    },
  ]

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
    <div className="border-b border-gray-200 dark:border-gray-700">
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
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  tab.current
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                }`}
              />
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    tab.current
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
