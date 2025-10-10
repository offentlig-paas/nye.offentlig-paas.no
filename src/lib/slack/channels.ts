import { WebClient } from '@slack/web-api'
import { NORWEGIAN_MONTHS } from '@/lib/formatDate'

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
 * Extracts error message from Slack API error
 */
function extractSlackError(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    return (error as { data?: { error?: string } }).data?.error || 'Ukjent feil'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ukjent feil'
}

/**
 * Generates a Slack channel name based on event date
 * Format: fagdag-{norwegianMonth}-{year}
 * @param eventDate The event date
 * @returns Channel name (e.g., "fagdag-oktober-2025")
 */
export function generateChannelName(eventDate: Date): string {
  const month = NORWEGIAN_MONTHS[eventDate.getMonth() + 1]
  const year = eventDate.getFullYear()
  return `fagdag-${month}-${year}`
}

export interface ChannelInfo {
  id: string
  name: string
}

/**
 * Ensures the bot is a member of the specified channel
 * Required before inviting other users to the channel
 * @param slack Slack WebClient instance
 * @param channelId Channel ID to join
 */
export async function ensureBotInChannel(
  slack: WebClient,
  channelId: string
): Promise<void> {
  try {
    await slack.conversations.join({
      channel: channelId,
    })
  } catch (error) {
    if (error && typeof error === 'object') {
      const slackError = error as { data?: { error?: string } }
      if (slackError.data?.error === 'already_in_channel') {
        return
      }
    }
    console.error(`Failed to join channel ${channelId}:`, error)
    throw new Error(
      `Kunne ikke bli med i Slack-kanal: ${extractSlackError(error)}`
    )
  }
}

/**
 * Creates a Slack channel or returns existing channel if found
 * Ensures bot is a member of the channel before returning
 * @param channelName Name of the channel to create
 * @returns Channel info or null if creation failed
 */
export async function createChannel(
  channelName: string
): Promise<ChannelInfo | null> {
  const slack = getSlackClient()

  if (!slack) {
    throw new Error('Slack client not configured')
  }

  try {
    const existing = await slack.conversations.list({
      exclude_archived: true,
      types: 'public_channel',
      limit: 1000,
    })

    const existingChannel = existing.channels?.find(
      channel => channel.name === channelName
    )

    if (existingChannel?.id) {
      await ensureBotInChannel(slack, existingChannel.id)
      return {
        id: existingChannel.id,
        name: channelName,
      }
    }

    const result = await slack.conversations.create({
      name: channelName,
      is_private: false,
    })

    if (result.ok && result.channel?.id) {
      return {
        id: result.channel.id,
        name: channelName,
      }
    }

    return null
  } catch (error) {
    console.error('Failed to create channel:', error)
    throw new Error(
      `Kunne ikke opprette Slack-kanal: ${extractSlackError(error)}`
    )
  }
}

export interface InviteUsersResult {
  success: boolean
  invited: number
  failed: number
  errors: string[]
  alreadyInChannel: number
}

/**
 * Invites multiple users to a Slack channel with batch processing
 * @param channelId Channel ID to invite users to
 * @param slackIds Array of Slack user IDs to invite
 * @param options Configuration for batch processing and error handling
 * @returns Result with counts of invited, failed, and already in channel
 */
export async function inviteUsersToChannel(
  channelId: string,
  slackIds: string[],
  options?: {
    batchSize?: number
    delayBetweenBatches?: number
    continueOnError?: boolean
  }
): Promise<InviteUsersResult> {
  const slack = getSlackClient()

  if (!slack) {
    throw new Error('Slack client not configured')
  }

  const {
    batchSize = 100,
    delayBetweenBatches = 1000,
    continueOnError = true,
  } = options || {}

  const errors: string[] = []
  let invited = 0
  let failed = 0
  let alreadyInChannel = 0

  const uniqueIds = [...new Set(slackIds)]

  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize)

    const batchPromises = batch.map(async userId => {
      try {
        await slack.conversations.invite({
          channel: channelId,
          users: userId,
        })
        invited++
      } catch (error) {
        let errorMessage = 'Ukjent feil'
        let errorCode = 'unknown'

        if (error && typeof error === 'object') {
          const slackError = error as {
            data?: { error?: string }
            message?: string
          }
          errorCode = slackError.data?.error || 'unknown'
          errorMessage =
            slackError.data?.error || slackError.message || 'Ukjent feil'
        } else if (error instanceof Error) {
          errorMessage = error.message || 'Ukjent feil'
        }

        if (
          errorCode === 'already_in_channel' ||
          errorMessage.includes('already_in_channel')
        ) {
          alreadyInChannel++
        } else {
          failed++
          const detailedError = `User ${userId}: ${errorCode} - ${errorMessage}`
          errors.push(detailedError)
          console.error(
            `Failed to invite user to channel ${channelId}:`,
            detailedError
          )

          if (!continueOnError) {
            throw error
          }
        }
      }
    })

    await Promise.allSettled(batchPromises)

    if (i + batchSize < uniqueIds.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  return {
    success: failed === 0,
    invited,
    failed,
    errors,
    alreadyInChannel,
  }
}

/**
 * Finds a Slack channel by name
 * @param channelName Name of the channel to find
 * @returns Channel info or null if not found
 */
export async function findChannelByName(
  channelName: string
): Promise<ChannelInfo | null> {
  const slack = getSlackClient()

  if (!slack) {
    return null
  }

  try {
    const result = await slack.conversations.list({
      exclude_archived: true,
      types: 'public_channel',
      limit: 1000,
    })

    const channel = result.channels?.find(ch => ch.name === channelName)

    if (channel?.id) {
      return {
        id: channel.id,
        name: channelName,
      }
    }

    return null
  } catch (error) {
    console.error('Failed to find channel:', error)
    return null
  }
}

/**
 * Archives a Slack channel
 * @param channelId Channel ID to archive
 * @returns Success status
 */
export async function archiveChannel(
  channelId: string
): Promise<{ success: boolean }> {
  const slack = getSlackClient()

  if (!slack) {
    throw new Error('Slack client not configured')
  }

  try {
    const result = await slack.conversations.archive({
      channel: channelId,
    })

    return { success: result.ok === true }
  } catch (error) {
    console.error('Failed to archive channel:', error)
    throw new Error(
      `Kunne ikke arkivere Slack-kanal: ${extractSlackError(error)}`
    )
  }
}
