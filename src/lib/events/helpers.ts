import { events } from '@/data/events'
import type { Event, SlackUser, EventDynamicStats } from '@/lib/events/types'
import { Status, AttachmentType, ItemType } from '@/lib/events/types'
import { formatDateShort, formatDateTime } from '@/lib/formatDate'
import type {
  EventRegistration,
  RegistrationStatus,
} from '@/domains/event-registration/types'
import type { EventFeedbackSummary } from '@/domains/event-feedback/types'
// Note: DocumentChartBarIcon is used for slides instead of PresentationChartLineIcon for visual consistency across the application.
import {
  DocumentTextIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  LinkIcon,
  PaperClipIcon,
  DocumentChartBarIcon,
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

/**
 * Count talks (presentations, panels, workshops) in event schedule
 * @param schedule Event schedule items
 * @returns Number of talk-type items
 */
export function getTalksCount(
  schedule?: Array<{ type: string | ItemType }>
): number {
  if (!schedule) return 0

  return schedule.filter(item => isTalkType(item.type as ItemType)).length
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

export function isUserSpeakerForTalk(
  event: Event,
  talkTitle: string,
  userSlackId: string
): boolean {
  if (!userSlackId || !talkTitle) {
    return false
  }

  const talk = event.schedule.find(
    item => isTalkType(item.type) && item.title === talkTitle
  )

  if (!talk || !talk.speakers) {
    return false
  }

  return talk.speakers.some(
    speaker => speaker.url && speaker.url.includes(`/team/${userSlackId}`)
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

/**
 * Extract unique speakers without profile URLs from event schedule
 */
export function getUniqueSpeakersWithoutUrls(
  schedule?: Event['schedule']
): SlackUser[] {
  if (!schedule || schedule.length === 0) {
    return []
  }

  const allSpeakers = schedule
    .filter(item => item.speakers && item.speakers.length > 0)
    .flatMap(item => item.speakers!)

  // Get unique speakers by name
  const uniqueSpeakers = allSpeakers.filter(
    (speaker, index, self) =>
      index === self.findIndex(s => s.name === speaker.name)
  )

  // Filter to only speakers without URLs
  return uniqueSpeakers.filter(speaker => !speaker.url)
}

export function getAttachmentIcon(type: AttachmentType) {
  switch (type) {
    case AttachmentType.Slides:
      return DocumentChartBarIcon
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

/**
 * Compute registration statistics from registrations array (pure function, no DB queries)
 * @param registrations Array of event registrations
 * @returns Registration stats by status
 */
export function computeStatsFromRegistrations(
  registrations: EventRegistration[]
): Record<RegistrationStatus, number> {
  const stats: Record<RegistrationStatus, number> = {
    confirmed: 0,
    waitlist: 0,
    cancelled: 0,
    attended: 0,
    'no-show': 0,
  }

  registrations.forEach(reg => {
    if (reg.status in stats) {
      stats[reg.status]++
    }
  })

  return stats
}

/**
 * Compute registration counts by category from registrations array (pure function, no DB queries)
 * @param registrations Array of event registrations
 * @returns Counts by category (total, persons, organizations, etc.)
 */
export function computeCountsFromRegistrations(
  registrations: EventRegistration[]
): {
  totalActive: number
  persons: number
  organizations: number
  uniqueOrganizations: number
  physicalCount: number
  digitalCount: number
  socialEventCount: number
} {
  const activeRegs = registrations.filter(
    r => r.status === 'confirmed' || r.status === 'attended'
  )

  const organizations = new Set(
    activeRegs.map(r => r.organisation.trim()).filter(org => org.length > 0)
  )

  const physicalCount = activeRegs.filter(
    r => r.attendanceType === 'physical'
  ).length

  const digitalCount = activeRegs.filter(
    r => r.attendanceType === 'digital'
  ).length

  const socialEventCount = activeRegs.filter(
    r => r.attendingSocialEvent === true
  ).length

  return {
    totalActive: activeRegs.length,
    persons: activeRegs.length,
    organizations: organizations.size,
    uniqueOrganizations: organizations.size,
    physicalCount,
    digitalCount,
    socialEventCount,
  }
}

/**
 * Resolve event statistics from dynamic data and legacy fallback
 * Uses dynamic data when available (takes precedence), falls back to event.stats for legacy events
 * Merges legacy feedback comments as separate field
 * @param event Event with optional legacy stats
 * @param registrations Dynamic registrations from Sanity
 * @param feedbackSummary Dynamic feedback summary from Sanity
 * @returns Unified EventDynamicStats
 */
export function resolveEventStats(
  event: Event,
  registrations: EventRegistration[],
  feedbackSummary: EventFeedbackSummary
): EventDynamicStats {
  const hasLegacyStats = !!event.stats
  // const hasDynamicData = registrations.length > 0 || feedbackSummary.totalResponses > 0

  // Compute stats from registrations
  const registrationStats = computeStatsFromRegistrations(registrations)
  const counts = computeCountsFromRegistrations(registrations)

  // Determine if we should use legacy data (only if no dynamic data exists)
  const useLegacyRegistrations = hasLegacyStats && registrations.length === 0
  const useLegacyFeedback =
    hasLegacyStats &&
    event.stats!.feedback &&
    feedbackSummary.totalResponses === 0

  return {
    registrations: {
      total: useLegacyRegistrations
        ? event.stats!.registrations
        : registrations.length,
      confirmed: useLegacyRegistrations ? 0 : registrationStats.confirmed,
      attended: useLegacyRegistrations ? 0 : registrationStats.attended,
      cancelled: useLegacyRegistrations ? 0 : registrationStats.cancelled,
      pending: 0,
      waitlist: useLegacyRegistrations ? 0 : registrationStats.waitlist,
      organizations: useLegacyRegistrations
        ? event.stats!.organisations
        : counts.uniqueOrganizations,
      participants: useLegacyRegistrations
        ? event.stats!.participants
        : counts.persons,
      physicalCount: useLegacyRegistrations ? 0 : counts.physicalCount,
      digitalCount: useLegacyRegistrations ? 0 : counts.digitalCount,
      socialEventCount: useLegacyRegistrations ? 0 : counts.socialEventCount,
    },
    feedback: {
      averageRating: useLegacyFeedback
        ? event.stats!.feedback!.averageRating
        : feedbackSummary.averageEventRating,
      totalResponses: useLegacyFeedback
        ? event.stats!.feedback!.respondents
        : feedbackSummary.totalResponses,
      hasLegacyData: !!useLegacyFeedback,
      historicalComments: useLegacyFeedback
        ? event.stats!.feedback!.comments || []
        : [],
      historicalFeedbackUrl: useLegacyFeedback
        ? event.stats!.feedback!.url
        : undefined,
    },
  }
}
