import { WebClient } from '@slack/web-api'
import { extractSlackUserId } from './utils'

interface SlackUserData {
  avatarUrl: string | null
  displayName: string
}

interface SlackUser {
  profile?: {
    image_512?: string
    image_192?: string
    image_72?: string
    image_48?: string
    image_32?: string
    image_24?: string
    real_name?: string
    display_name?: string
  }
  real_name?: string
  name?: string
}

let slackClient: WebClient | null = null

function getSlackClient(): WebClient | null {
  if (!process.env.SLACK_BOT_TOKEN) {
    return null
  }

  if (!slackClient) {
    slackClient = new WebClient(process.env.SLACK_BOT_TOKEN)
  }

  return slackClient
}

/**
 * Batch fetch Slack user data for multiple users
 * @param userIds Array of Slack user IDs
 * @returns Map of user ID to user data
 */
export async function batchFetchSlackUsers(
  userIds: string[]
): Promise<Map<string, SlackUserData>> {
  const slack = getSlackClient()
  const results = new Map<string, SlackUserData>()

  if (!slack || userIds.length === 0) {
    return results
  }

  // Remove duplicates
  const uniqueUserIds = Array.from(new Set(userIds))

  // Fetch all users in parallel
  const promises = uniqueUserIds.map(async userId => {
    try {
      const userInfo = await slack.users.info({ user: userId })

      if (!userInfo.ok || !userInfo.user) {
        return null
      }

      const user = userInfo.user as SlackUser

      const avatarUrl =
        user.profile?.image_512 ||
        user.profile?.image_192 ||
        user.profile?.image_72 ||
        user.profile?.image_48 ||
        user.profile?.image_32 ||
        user.profile?.image_24 ||
        null

      const displayName =
        user.profile?.display_name ||
        user.profile?.real_name ||
        user.real_name ||
        user.name ||
        'Unknown User'

      return {
        userId,
        data: { avatarUrl, displayName },
      }
    } catch (error) {
      // Log error for debugging, but continue processing other users
      console.error(`Failed to fetch Slack user info for ${userId}:`, error)
      return null
    }
  })

  const userDataArray = await Promise.all(promises)

  // Build map from results
  for (const result of userDataArray) {
    if (result) {
      results.set(result.userId, result.data)
    }
  }

  return results
}

/**
 * Extract all Slack user IDs from event data
 */
export function extractEventUserIds(event: {
  schedule: Array<{
    speakers?: Array<{ url?: string }>
  }>
  organizers: Array<{ url?: string }>
}): string[] {
  const userIds: string[] = []

  // Extract from speakers
  for (const item of event.schedule) {
    if (item.speakers) {
      for (const speaker of item.speakers) {
        if (speaker.url) {
          const userId = extractSlackUserId(speaker.url)
          if (userId) {
            userIds.push(userId)
          }
        }
      }
    }
  }

  // Extract from organizers
  for (const organizer of event.organizers) {
    if (organizer.url) {
      const userId = extractSlackUserId(organizer.url)
      if (userId) {
        userIds.push(userId)
      }
    }
  }

  return userIds
}
