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

function extractValidEmailDomain(email?: string | null): string | null {
  const parts = email?.toLowerCase().trim().split('@')
  if (!parts || parts.length !== 2 || !parts[0] || !parts[1]) {
    return null
  }
  const emailDomain = parts[1]
  return VALID_DOMAIN_REGEX.test(emailDomain) ? emailDomain : null
}

function findMatchingMemberDomain(
  member: Member,
  emailDomain: string
): string | undefined {
  return member.domains.find(d => {
    const normalized = d.toLowerCase().trim()
    if (!VALID_DOMAIN_REGEX.test(normalized)) return false
    return emailDomain === normalized || emailDomain.endsWith(`.${normalized}`)
  })
}

export function getMemberByUserEmail(
  email?: string | null
): Member | undefined {
  const emailDomain = extractValidEmailDomain(email)
  if (!emailDomain) return undefined
  return members.find(m => Boolean(findMatchingMemberDomain(m, emailDomain)))
}

function matchesSlackIdentifier(
  slackUrlOrId?: string | null,
  userSlackId?: string | null
): boolean {
  if (!slackUrlOrId || !userSlackId) return false
  const normalizedTarget = userSlackId.trim().toUpperCase()
  if (!/^[UW][A-Z0-9]{6,}$/.test(normalizedTarget)) return false

  const trimmed = slackUrlOrId.trim().replace(/\/+$/, '')
  if (/^[UW][A-Z0-9]{6,}$/i.test(trimmed)) {
    return trimmed.toUpperCase() === normalizedTarget
  }

  try {
    const parsed = new URL(trimmed)
    if (
      parsed.protocol !== 'https:' ||
      (parsed.hostname !== 'slack.com' &&
        !parsed.hostname.endsWith('.slack.com'))
    ) {
      return false
    }
  } catch {
    return false
  }

  const extracted =
    extractSlackUserId(trimmed) ??
    trimmed.match(/\/team\/([UW][A-Z0-9]{6,})$/i)?.[1]
  return Boolean(extracted && extracted.toUpperCase() === normalizedTarget)
}

export function canUserEditMemberProfile(
  member: Member,
  user?: {
    email?: string | null
    isAdmin?: boolean | null
    slackId?: string | null
  } | null,
  profile?: MemberProfile | null
): {
  canEdit: boolean
  matchedDomain?: string
  reason:
    | 'admin'
    | 'domain_match'
    | 'team_member'
    | 'unauthenticated'
    | 'domain_mismatch'
} {
  if (!user) {
    return { canEdit: false, reason: 'unauthenticated' }
  }
  if (user.isAdmin) {
    return { canEdit: true, reason: 'admin' }
  }
  const emailDomain = extractValidEmailDomain(user.email)
  if (emailDomain) {
    const matchedDomain = findMatchingMemberDomain(member, emailDomain)
    if (matchedDomain) {
      return { canEdit: true, matchedDomain, reason: 'domain_match' }
    }
  }

  if (user.slackId) {
    const hasCuratedTeam = Boolean(
      profile && (profile.team.length > 0 || profile.updatedBy)
    )
    if (hasCuratedTeam && profile) {
      const inProfileTeam = profile.team.some(t =>
        matchesSlackIdentifier(t.slackUrl, user.slackId)
      )
      if (inProfileTeam) {
        return { canEdit: true, reason: 'team_member' }
      }
    } else {
      const { uniqueSpeakers } = getMemberEventContributions(member)
      const inEventSpeakers = uniqueSpeakers.some(s =>
        matchesSlackIdentifier(s.url, user.slackId)
      )
      if (inEventSpeakers) {
        return { canEdit: true, reason: 'team_member' }
      }
    }
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

  async getBySlug(
    slug: string,
    options?: { includeInternal?: boolean }
  ): Promise<MemberProfile | null> {
    const member = getMemberBySlug(slug)
    const canonicalSlug = member ? member.getSlug() : slug.toLowerCase()
    const profile = await this.repository.findBySlug(canonicalSlug)
    if (!profile) return null
    if (profile.visibility === 'internal' && !options?.includeInternal) {
      return null
    }
    return profile
  }

  async getAll(options?: {
    includeInternal?: boolean
  }): Promise<MemberProfile[]> {
    const all = await this.repository.findAll()
    if (options?.includeInternal) return all
    return all.filter(p => p.visibility !== 'internal')
  }

  async listPlatformSummaries(options?: {
    includeInternal?: boolean
  }): Promise<MemberPlatformSummary[]> {
    const summaries = await this.repository.listPlatformSummaries()
    if (options?.includeInternal) return summaries
    return summaries.filter(s => s.visibility !== 'internal')
  }

  async findMemberForUser(
    user?: { email?: string | null; slackId?: string | null } | null
  ): Promise<{ member: Member; profile: MemberProfile | null } | null> {
    if (!user) return null

    const byEmail = getMemberByUserEmail(user.email)
    if (byEmail) {
      const profile = await this.getBySlug(byEmail.getSlug(), {
        includeInternal: true,
      })
      return { member: byEmail, profile }
    }

    if (user.slackId) {
      const allProfiles = await this.repository.findAll()
      for (const p of allProfiles) {
        if (
          !p.team.some(t => matchesSlackIdentifier(t.slackUrl, user.slackId))
        ) {
          continue
        }
        const member = getMemberBySlug(p.slug)
        if (member) {
          return { member, profile: p }
        }
      }

      const matchedBySpeaker = members.find(m => {
        const existing = allProfiles.find(p => p.slug === m.getSlug())
        if (existing && (existing.team.length > 0 || existing.updatedBy)) {
          return false
        }
        return getMemberEventContributions(m).uniqueSpeakers.some(s =>
          matchesSlackIdentifier(s.url, user.slackId)
        )
      })
      if (matchedBySpeaker) {
        const existingProfile =
          allProfiles.find(p => p.slug === matchedBySpeaker.getSlug()) ?? null
        return { member: matchedBySpeaker, profile: existingProfile }
      }
    }

    return null
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
