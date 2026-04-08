import { WebClient, LogLevel } from '@slack/web-api'

export interface SlackUserSummary {
  id: string
  name: string
  realName: string
  displayName: string
  email?: string
  avatar?: string
  title?: string
  statusText?: string
  statusEmoji?: string
}

interface SlackApiUser {
  id: string
  name: string
  real_name?: string
  deleted: boolean
  is_bot: boolean
  is_stranger?: boolean
  profile?: {
    real_name?: string
    display_name?: string
    email?: string
    image_512?: string
    title?: string
    status_text?: string
    status_emoji?: string
  }
}

export type SlackFetchStatus = 'ok' | 'missing_email_scope' | 'no_token'

interface DomainBucket {
  users: SlackUserSummary[]
  count: number
}

interface DomainAggregation {
  domains: Map<string, DomainBucket>
  status: SlackFetchStatus
  totalUsers: number
}

let cachedAggregation: DomainAggregation | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 10 * 60 * 1000

function getSlackClient(): WebClient | null {
  if (!process.env.SLACK_BOT_TOKEN) return null
  return new WebClient(process.env.SLACK_BOT_TOKEN, {
    logLevel: LogLevel.ERROR,
  })
}

function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? ''
}

/**
 * Paginates through Slack users.list and aggregates by email domain.
 * Processes each page immediately — never holds all raw users in memory.
 */
export async function aggregateSlackUsersByDomain(
  options: { skipCache?: boolean } = {}
): Promise<DomainAggregation> {
  if (
    !options.skipCache &&
    cachedAggregation &&
    Date.now() - cacheTimestamp < CACHE_TTL_MS
  ) {
    return cachedAggregation
  }

  const slack = getSlackClient()
  if (!slack) {
    return { domains: new Map(), status: 'no_token', totalUsers: 0 }
  }

  const domains = new Map<string, DomainBucket>()
  let totalUsers = 0
  let hasAnyEmail = false
  let cursor = ''
  let pageCount = 0
  const startMs = performance.now()

  do {
    const response = await slack.users.list({
      cursor: cursor || undefined,
      limit: 200,
    })
    pageCount++

    if (!response.ok || !response.members) break

    for (const raw of response.members as SlackApiUser[]) {
      if (
        raw.deleted ||
        raw.is_bot ||
        raw.is_stranger ||
        raw.id === 'USLACKBOT'
      )
        continue

      totalUsers++
      const email = raw.profile?.email
      if (!email) continue
      hasAnyEmail = true

      const domain = extractDomain(email)
      if (!domain) continue

      let bucket = domains.get(domain)
      if (!bucket) {
        bucket = { users: [], count: 0 }
        domains.set(domain, bucket)
      }

      bucket.count++
      bucket.users.push({
        id: raw.id,
        name: raw.name,
        realName: raw.real_name || raw.profile?.real_name || raw.name,
        displayName: raw.profile?.display_name || raw.real_name || raw.name,
        email,
        avatar: raw.profile?.image_512,
        title: raw.profile?.title || undefined,
        statusText: raw.profile?.status_text || undefined,
        statusEmoji: raw.profile?.status_emoji || undefined,
      })
    }

    cursor = response.response_metadata?.next_cursor || ''
  } while (cursor)

  const elapsedMs = Math.round(performance.now() - startMs)
  console.log(
    `[slack] users.list: ${totalUsers} users across ${pageCount} pages in ${elapsedMs}ms`
  )

  const result: DomainAggregation = {
    domains,
    status: hasAnyEmail ? 'ok' : 'missing_email_scope',
    totalUsers,
  }

  cachedAggregation = result
  cacheTimestamp = Date.now()
  return result
}

/**
 * Returns just the user count (no user details held).
 */
export async function getSlackUserCount(): Promise<number> {
  const slack = getSlackClient()
  if (!slack) return 0

  let count = 0
  let cursor = ''

  do {
    const response = await slack.users.list({
      cursor: cursor || undefined,
      limit: 200,
    })

    if (!response.ok || !response.members) return 0

    for (const raw of response.members as SlackApiUser[]) {
      if (
        !raw.deleted &&
        !raw.is_bot &&
        !raw.is_stranger &&
        raw.id !== 'USLACKBOT'
      )
        count++
    }

    cursor = response.response_metadata?.next_cursor || ''
  } while (cursor)

  return count
}

export function clearSlackUsersCache() {
  cachedAggregation = null
  cacheTimestamp = 0
}
