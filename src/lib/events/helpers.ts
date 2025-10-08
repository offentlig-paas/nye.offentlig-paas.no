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
  if (getStatus(event) !== Status.Upcoming) {
    return false
  }

  return event.registration ? !event.registration.disabled : true
}

export function isCallForPapersOpen(event: Event) {
  if (!event.callForPapersUrl) {
    return false
  }

  const now = new Date()

  if (event.callForPapersClosedDate) {
    return now < event.callForPapersClosedDate
  }

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
  return events.filter(event => getStatus(event) !== Status.Past)
}

export function getEventInfoFromSlug(slug: string): {
  title: string
  date: string
  location: string
} {
  const event = events.find(e => e.slug === slug)

  if (event) {
    return {
      title: event.title,
      date: event.start.toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      location: event.location,
    }
  }

  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    date: new Date().toLocaleDateString('nb-NO'),
    location: 'Ikke spesifisert',
  }
}

export function getDetailedEventInfoFromSlug(slug: string): {
  title: string
  date: string
  location: string
} {
  const event = events.find(e => e.slug === slug)

  if (event) {
    return {
      title: event.title,
      date: `${event.start.toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} kl. ${event.start.toLocaleTimeString('nb-NO', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      location: event.location,
    }
  }

  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    date: new Date().toLocaleDateString('nb-NO'),
    location: 'Ikke spesifisert',
  }
}

export function getAllEventsWithPotentialRegistrations(): Event[] {
  return events.filter(event => {
    const eventDate = new Date(event.start)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    return eventDate >= oneYearAgo
  })
}

export function isUserEventOrganizer(
  event: Event,
  userSlackId: string
): boolean {
  if (!userSlackId || !event.organizers || event.organizers.length === 0) {
    return false
  }

  return event.organizers.some(organizer => {
    if (!organizer.url) {
      return false
    }

    const slackIdMatch = organizer.url.match(/\/team\/([A-Z0-9]+)$/)
    if (!slackIdMatch) {
      return false
    }

    const organizerSlackId = slackIdMatch[1]
    return organizerSlackId === userSlackId
  })
}

export function canUserAccessEvent(
  event: Event,
  user: { isAdmin?: boolean; slackId?: string }
): boolean {
  if (user.isAdmin) {
    return true
  }

  if (user.slackId) {
    if (isUserEventOrganizer(event, user.slackId)) {
      return true
    }
  }

  return false
}

export function getEventBySlug(slug: string): Event | null {
  return events.find(e => e.slug === slug) || null
}
