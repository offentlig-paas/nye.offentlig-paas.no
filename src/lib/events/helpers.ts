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
  // Check if event is upcoming
  if (getStatus(event) !== Status.Upcoming) {
    return false
  }

  // Check if registration is not disabled (default is enabled)
  return event.registration ? !event.registration.disabled : true
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
  return events.filter(event => getStatus(event) !== Status.Past)
}

/**
 * Helper function to get event info from slug
 * Uses exact slug matching from events.ts
 */
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

  // Fallback for unknown events
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    date: new Date().toLocaleDateString('nb-NO'),
    location: 'Ikke spesifisert',
  }
}

/**
 * Helper function to get detailed event info including time for individual event pages
 * Uses exact slug matching from events.ts
 */
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

  // Fallback for unknown events
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    date: new Date().toLocaleDateString('nb-NO'),
    location: 'Ikke spesifisert',
  }
}

/**
 * Get all events that have registrations or might have registrations
 */
export function getAllEventsWithPotentialRegistrations(): Event[] {
  return events.filter(event => {
    // Include events that are recent or upcoming
    const eventDate = new Date(event.start)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    return eventDate >= oneYearAgo
  })
}

/**
 * Check if a user is an organizer of a specific event
 */
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

    // Extract Slack user ID from organizer URL
    // URLs are in format: https://offentlig-paas-no.slack.com/team/U0836NTGBQW
    const slackIdMatch = organizer.url.match(/\/team\/([A-Z0-9]+)$/)
    if (!slackIdMatch) {
      return false
    }

    const organizerSlackId = slackIdMatch[1]
    return organizerSlackId === userSlackId
  })
}

/**
 * Check if a user can access event data (admin or organizer)
 */
export function canUserAccessEvent(
  event: Event,
  user: { isAdmin?: boolean; slackId?: string }
): boolean {
  // Admins can access any event
  if (user.isAdmin) {
    return true
  }

  // Check if user is an organizer of this event
  if (user.slackId) {
    if (isUserEventOrganizer(event, user.slackId)) {
      return true
    }
  }

  return false
}

/**
 * Get event by slug and check if it exists
 * Uses exact slug matching from events.ts
 */
export function getEventBySlug(slug: string): Event | null {
  return events.find(e => e.slug === slug) || null
}
