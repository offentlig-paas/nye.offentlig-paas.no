/**
 * Extracts Slack user ID from Slack team URL
 * @param slackUrl URL in format https://workspace.slack.com/team/U123ABC
 * @returns User ID or null if not found
 */
export function extractSlackUserId(slackUrl: string): string | null {
  const match = slackUrl.match(/\/team\/([A-Z0-9]+)$/)
  return match ? match[1] || null : null
}

/**
 * Checks if a Slack user ID matches any user in a SlackUser array.
 * Shared utility for access control across events and surveys.
 */
export function matchesSlackUser(
  slackId: string | undefined,
  users: { url?: string }[] | undefined
): boolean {
  if (!slackId || !users?.length) return false
  return users.some(
    user => user.url && extractSlackUserId(user.url) === slackId
  )
}

interface SlackIdMapping {
  slackId?: string
  slackUserId?: string
  url?: string
}

/**
 * Extracts Slack user IDs from array of objects with various Slack ID formats
 * Supports slackId, slackUserId, and url properties
 * @param items Array of objects containing Slack identifiers
 * @returns Array of extracted Slack user IDs
 */
export function extractSlackIds(items: SlackIdMapping[]): string[] {
  return items
    .map(item => {
      if (item.slackId) {
        return item.slackId
      }
      if (item.slackUserId) {
        return item.slackUserId
      }
      if (item.url) {
        return extractSlackUserId(item.url)
      }
      return null
    })
    .filter((id): id is string => id !== null)
}
