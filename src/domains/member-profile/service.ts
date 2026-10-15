import 'server-only'
import { members } from '@/data/members'
import { events } from '@/data/events'
import type { Member } from '@/lib/members'
import { ItemType } from '@/lib/events/types'
import { cleanOrganizationName } from '@/lib/organization-utils'
import { extractSlackUserId } from '@/lib/slack/utils'
import { MemberProfileRepository } from './repository'
import type {
  MemberProfile,
  MemberPlatformSummary,
  MemberTalkContribution,
  UpsertMemberProfileInput,
} from './types'

const SUBSTANTIVE_TALK_TYPES = new Set<ItemType>([
  ItemType.Talk,
  ItemType.Panel,
  ItemType.Workshop,
])

const GENERIC_SCHEDULE_TITLE =
  /^(velkommen|registrering|introduksjon|mingling|lunsj|pause|avslutning)/i

export function getMemberBySlug(slug: string): Member | undefined {
  const normalized = slug.toLowerCase()
  return members.find(
    m =>
      m.getSlug() === normalized ||
      m.slug?.toLowerCase() === normalized ||
      m.github?.toLowerCase() === normalized
  )
}

const VALID_DOMAIN_REGEX =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/

export function canUserEditMemberProfile(
  member: Member,
  user?: { email?: string | null; isAdmin?: boolean | null } | null
): {
  canEdit: boolean
  matchedDomain?: string
  reason: 'admin' | 'domain_match' | 'unauthenticated' | 'domain_mismatch'
} {
  if (!user) {
    return { canEdit: false, reason: 'unauthenticated' }
  }
  if (user.isAdmin) {
    return { canEdit: true, reason: 'admin' }
  }
  const parts = user.email?.toLowerCase().trim().split('@')
  if (!parts || parts.length !== 2 || !parts[0] || !parts[1]) {
    return { canEdit: false, reason: 'domain_mismatch' }
  }
  const emailDomain = parts[1]
  if (!VALID_DOMAIN_REGEX.test(emailDomain)) {
    return { canEdit: false, reason: 'domain_mismatch' }
  }

  const matchedDomain = member.domains.find(d => {
    const normalized = d.toLowerCase().trim()
    if (!VALID_DOMAIN_REGEX.test(normalized)) return false
    return emailDomain === normalized || emailDomain.endsWith(`.${normalized}`)
  })

  if (matchedDomain) {
    return { canEdit: true, matchedDomain, reason: 'domain_match' }
  }

  return { canEdit: false, reason: 'domain_mismatch' }
}

export function getMemberEventContributions(member: Member): {
  talks: MemberTalkContribution[]
  organizedEventsCount: number
  uniqueSpeakers: { name: string; url?: string }[]
} {
  const targetNames = new Set<string>([
    member.name.toLowerCase(),
    cleanOrganizationName(member.name).toLowerCase(),
  ])
  if (member.slug) targetNames.add(member.slug.toLowerCase())
  if (member.github) targetNames.add(member.github.toLowerCase())
  if (member.name.toLowerCase() === 'politiet') targetNames.add('pit')
  if (member.name.toLowerCase() === 'statens vegvesen')
    targetNames.add('vegvesen')

  const matchesOrg = (org?: string) => {
    if (!org) return false
    const raw = org.toLowerCase().trim()
    const cleaned = cleanOrganizationName(org).toLowerCase()
    return targetNames.has(raw) || targetNames.has(cleaned)
  }

  const talks: MemberTalkContribution[] = []
  let organizedEventsCount = 0
  const speakerByKey = new Map<string, { name: string; url?: string }>()

  const registerSpeaker = (name: string, url?: string) => {
    const slackId = url ? extractSlackUserId(url) : null
    const key = slackId ?? name.toLowerCase().trim()
    const existing = speakerByKey.get(key)
    if (!existing || (!existing.url && url)) {
      speakerByKey.set(key, { name, url })
    }
  }

  for (const event of events) {
    if (event.organizers.some(o => matchesOrg(o.org))) {
      organizedEventsCount++
    }
    for (const org of event.organizers) {
      if (matchesOrg(org.org)) {
        registerSpeaker(org.name, org.url)
      }
    }

    for (const item of event.schedule) {
      if (
        !item.speakers ||
        !SUBSTANTIVE_TALK_TYPES.has(item.type) ||
        GENERIC_SCHEDULE_TITLE.test(item.title.trim())
      ) {
        continue
      }
      const matchingSpeakers = item.speakers.filter(s => matchesOrg(s.org))
      if (matchingSpeakers.length > 0) {
        talks.push({
          eventSlug: event.slug,
          eventTitle: event.title,
          eventDate: event.start,
          talkTitle: item.title,
          talkDescription: item.description,
          speakers: matchingSpeakers.map(s => ({ name: s.name, url: s.url })),
        })
        for (const s of matchingSpeakers) {
          registerSpeaker(s.name, s.url)
        }
      }
    }
  }

  talks.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())

  return {
    talks,
    organizedEventsCount,
    uniqueSpeakers: Array.from(speakerByKey.values()),
  }
}

class MemberProfileService {
  private repository: MemberProfileRepository

  constructor(repository?: MemberProfileRepository) {
    this.repository = repository ?? new MemberProfileRepository()
  }

  async getBySlug(slug: string): Promise<MemberProfile | null> {
    const member = getMemberBySlug(slug)
    const canonicalSlug = member ? member.getSlug() : slug.toLowerCase()
    return await this.repository.findBySlug(canonicalSlug)
  }

  async getAll(): Promise<MemberProfile[]> {
    return await this.repository.findAll()
  }

  async listPlatformSummaries(): Promise<MemberPlatformSummary[]> {
    return await this.repository.listPlatformSummaries()
  }

  async upsert(
    input: UpsertMemberProfileInput,
    updatedBy?: { name: string; email?: string; slackId?: string }
  ): Promise<MemberProfile> {
    const member = getMemberBySlug(input.slug)
    if (!member) {
      throw new Error(`Member not found for slug: ${input.slug}`)
    }
    const canonicalSlug = member.getSlug()
    return await this.repository.upsert(
      { ...input, slug: canonicalSlug },
      updatedBy
    )
  }
}

export const memberProfileService = new MemberProfileService()
