import { events } from '@/data/events'
import type { Event } from '@/lib/events/types'
import { Status } from '@/lib/events/types'

export function getStatus(event: Event) {
  const now = new Date()
  if (now < event.start) {
    return Status.Upcoming
  }
  if (now > event.end) {
    return Status.Past
  }
  return Status.Current
}

export function isAcceptingRegistrations(event: Event) {
  return getStatus(event) === Status.Upcoming
}

export function isCallForPapersOpen(event: Event) {
  if (!event.callForPapersUrl) {
    return false
  }

  const now = new Date()

  // If there's a specific CFP closed date, use that
  if (event.callForPapersClosedDate) {
    return now < event.callForPapersClosedDate
  }

  // Default behavior: CFP is open as long as the event is accepting registrations
  return isAcceptingRegistrations(event)
}

export function formatDescription(description: string) {
  return description.replace(/\n/g, '<br>')
}

export function getAllEvents() {
  return events
}

export function getEvent(slug: string) {
  return events.find(event => event.slug === slug)
}

export function getUpcomingEvents() {
  return events.filter(event => getStatus(event) === Status.Upcoming)
}
