import { events } from '@/data/events'
import type { Event } from '@/lib/events/types'
import { Status, AttachmentType, ItemType } from '@/lib/events/types'
import { formatDateShort, formatDateTime } from '@/lib/formatDate'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  LinkIcon,
  PaperClipIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/20/solid'

export const TALK_TYPES = [
  ItemType.Talk,
  ItemType.Panel,
  ItemType.Workshop,
] as const

export function isTalkType(
  type: ItemType
): type is (typeof TALK_TYPES)[number] {
  return TALK_TYPES.includes(type as (typeof TALK_TYPES)[number])
}

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

/**
 * Extracts unique speakers from event schedule
 * @param schedule Event schedule items with optional speakers
 * @returns Array of unique speakers
 */
export function getUniqueSpeakers(
  schedule: Array<{
    speakers?: Array<{ name: string; url?: string; org?: string }>
  }>
) {
  return schedule
    .filter(item => item.speakers && item.speakers.length > 0)
    .flatMap(item => item.speakers!)
    .reduce(
      (
        unique: Array<{ name: string; url?: string; org?: string }>,
        speaker
      ) => {
        if (!unique.find(s => s.name === speaker.name)) {
          unique.push(speaker)
        }
        return unique
      },
      []
    )
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
      date: formatDateShort(event.start),
      location: event.location,
    }
  }

  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    date: formatDateTime(new Date()),
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
      date: formatDateTime(event.start),
      location: event.location,
    }
  }

  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    date: formatDateShort(new Date()),
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

export function isUserEventSpeaker(event: Event, userSlackId: string): boolean {
  if (!userSlackId || !event.schedule || event.schedule.length === 0) {
    return false
  }

  return event.schedule.some(
    item =>
      isTalkType(item.type) &&
      item.speakers?.some(
        speaker => speaker.url && speaker.url.includes(`/team/${userSlackId}`)
      )
  )
}

export function getUserTalksFromEvents(
  userSlackId: string
): Array<{ event: Event; talk: Event['schedule'][number] }> {
  if (!userSlackId) {
    return []
  }

  return events
    .map(event => {
      const speakerTalks = event.schedule
        .filter(
          item =>
            isTalkType(item.type) &&
            item.speakers?.some(
              speaker =>
                speaker.url && speaker.url.includes(`/team/${userSlackId}`)
            )
        )
        .map(item => ({
          event,
          talk: item,
        }))
      return speakerTalks
    })
    .flat()
    .sort((a, b) => b.event.start.getTime() - a.event.start.getTime())
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

export function getAttachmentIcon(type: AttachmentType) {
  switch (type) {
    case AttachmentType.Slides:
      return PresentationChartLineIcon
    case AttachmentType.PDF:
      return DocumentTextIcon
    case AttachmentType.Recording:
    case AttachmentType.Video:
      return VideoCameraIcon
    case AttachmentType.Code:
      return CodeBracketIcon
    case AttachmentType.Link:
      return LinkIcon
    default:
      return PaperClipIcon
  }
}
