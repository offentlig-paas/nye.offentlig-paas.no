'use client'

import { useEffect, useState, useMemo } from 'react'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import { CalendarIcon } from '@heroicons/react/20/solid'
import type { Event } from '@/lib/events/types'
import { getIcsFileContent, getGoogleCalendarUrl } from '@/lib/calendar-utils'

interface EventCalendarDownloadProps {
  event: Event
  url: string
}

export function EventCalendarDownload({
  event,
  url,
}: EventCalendarDownloadProps) {
  const { isRegistered } = useEventRegistration()
  const [streamingUrl, setStreamingUrl] = useState<string | undefined>()

  useEffect(() => {
    if (isRegistered) {
      fetch(`/api/events/${event.slug}/participant-info`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.streamingUrl) {
            setStreamingUrl(data.streamingUrl)
          }
        })
        .catch(err => console.error('Error fetching participant info:', err))
    }
  }, [isRegistered, event.slug])

  const description = useMemo(() => {
    let desc = event.description || ''
    if (streamingUrl) {
      desc += `\n\nStreaming: ${streamingUrl}`
    }
    return desc
  }, [event.description, streamingUrl])

  const dynamicGoogleCalendarUrl = useMemo(
    () => getGoogleCalendarUrl(event, description),
    [event, description]
  )

  const icsFileContent = getIcsFileContent(event, url, streamingUrl)
  const icsFileUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsFileContent)}`

  return (
    <>
      <a
        href={dynamicGoogleCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <CalendarIcon
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
        Google Calendar
      </a>
      <a
        href={icsFileUrl}
        download={`${event.slug}.ics`}
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <CalendarIcon
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
        iCal/Outlook
      </a>
    </>
  )
}
