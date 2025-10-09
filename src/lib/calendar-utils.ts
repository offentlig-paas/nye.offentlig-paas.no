import type { Event } from '@/lib/events/types'

export function calendarDateTime(date: Date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '')
}

export function getGoogleCalendarUrl(
  event: Event,
  description?: string
): string {
  const startTime = calendarDateTime(event.start)
  const endTime = calendarDateTime(event.end)
  const details = {
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startTime}/${endTime}`,
    details: description || event.description || '',
    location: event.location,
  }
  const params = new URLSearchParams(details)
  return `https://www.google.com/calendar/render?${params.toString()}`
}

export function getIcsFileContent(
  event: Event,
  url: string,
  streamingUrl?: string
) {
  let description = event.description || ''
  if (streamingUrl) {
    description += `\\n\\nStreaming: ${streamingUrl}`
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${event.slug}`,
    `DTSTAMP:${calendarDateTime(event.start)}`,
    `DTSTART:${calendarDateTime(event.start)}`,
    `DTEND:${calendarDateTime(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${event.location}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\\n')
}
