import {
  aggregateSlackUsersByDomain,
  type SlackUserSummary,
  type SlackFetchStatus,
} from '@/lib/slack/users'
import { members } from '@/data/members'
import type { Member } from '@/lib/members'
import {
  externalDomains,
  type ExternalDomainLabel,
} from '@/data/external-domains'

function buildDomainIndex() {
  const domainToMember = new Map<string, Member>()
  for (const member of members) {
    for (const domain of member.domains) {
      domainToMember.set(domain.toLowerCase(), member)
    }
  }
  return domainToMember
}

export interface MemberRepresentation {
  name: string
  slug?: string
  type: string
  domains: string[]
  userCount: number
}

interface MemberRepresentationDetail extends MemberRepresentation {
  users: SlackUserSummary[]
}

export interface UnmatchedDomain {
  domain: string
  count: number
  label?: ExternalDomainLabel
}

interface UnmatchedDomainDetail extends UnmatchedDomain {
  users: SlackUserSummary[]
}

export interface SlackRepresentationSummary {
  status: SlackFetchStatus
  totalSlackUsers: number
  matchedUsers: number
  matchedOrgs: number
  totalOrgs: number
  members: MemberRepresentation[]
  unmatchedDomains: UnmatchedDomain[]
}

interface SlackRepresentationDetail {
  member: MemberRepresentationDetail
}

export async function getSlackRepresentationSummary(): Promise<SlackRepresentationSummary> {
  const {
    domains: domainBuckets,
    status,
    totalUsers,
  } = await aggregateSlackUsersByDomain()

  if (status !== 'ok') {
    return {
      status,
      totalSlackUsers: totalUsers,
      matchedUsers: 0,
      matchedOrgs: 0,
      totalOrgs: members.length,
      members: members.map(m => ({
        name: m.name,
        slug: m.slug,
        type: m.type,
        domains: m.domains,
        userCount: 0,
      })),
      unmatchedDomains: [],
    }
  }

  const domainToMember = buildDomainIndex()

  const memberCounts = new Map<
    string,
    { count: number; domains: Set<string> }
  >()
  const unmatchedMap = new Map<string, number>()
  let matchedUsers = 0

  for (const [domain, bucket] of domainBuckets) {
    const member = domainToMember.get(domain)
    if (member) {
      const existing = memberCounts.get(member.name) ?? {
        count: 0,
        domains: new Set<string>(),
      }
      existing.count += bucket.count
      existing.domains.add(domain)
      memberCounts.set(member.name, existing)
      matchedUsers += bucket.count
    } else {
      unmatchedMap.set(domain, bucket.count)
    }
  }

  const memberRepresentations: MemberRepresentation[] = members
    .map(m => ({
      name: m.name,
      slug: m.slug,
      type: m.type,
      domains: m.domains,
      userCount: memberCounts.get(m.name)?.count ?? 0,
    }))
    .sort((a, b) => b.userCount - a.userCount)

  const unmatchedDomains: UnmatchedDomain[] = [...unmatchedMap.entries()]
    .map(([domain, count]) => ({
      domain,
      count,
      label: externalDomains[domain],
    }))
    .sort((a, b) => b.count - a.count)

  return {
    status,
    totalSlackUsers: totalUsers,
    matchedUsers,
    matchedOrgs: memberRepresentations.filter(m => m.userCount > 0).length,
    totalOrgs: members.length,
    members: memberRepresentations,
    unmatchedDomains,
  }
}

export async function getSlackUsersForMember(
  memberName: string
): Promise<SlackRepresentationDetail | null> {
  const { domains: domainBuckets, status } = await aggregateSlackUsersByDomain()

  if (status !== 'ok') return null

  const domainToMember = buildDomainIndex()
  const member = members.find(m => m.name === memberName)
  if (!member) return null

  const users: SlackUserSummary[] = []

  for (const [domain, bucket] of domainBuckets) {
    if (domainToMember.get(domain)?.name === memberName) {
      users.push(...bucket.users)
    }
  }

  return {
    member: {
      name: member.name,
      slug: member.slug,
      type: member.type,
      domains: member.domains,
      userCount: users.length,
      users: users.sort((a, b) =>
        a.realName.localeCompare(b.realName, 'nb-NO')
      ),
    },
  }
}

export async function getSlackUsersForDomain(
  domain: string
): Promise<UnmatchedDomainDetail | null> {
  const { domains: domainBuckets, status } = await aggregateSlackUsersByDomain()

  if (status !== 'ok') return null

  const bucket = domainBuckets.get(domain)
  if (!bucket) return null

  return {
    domain,
    count: bucket.count,
    users: bucket.users.sort((a, b) =>
      a.realName.localeCompare(b.realName, 'nb-NO')
    ),
  }
}
