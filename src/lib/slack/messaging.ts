import { WebClient, type Block, type KnownBlock } from '@slack/web-api'

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

export interface SendMessageResult {
  success: boolean
  userId: string
  error?: string
}

export interface MessagePayload {
  text: string
  blocks?: (Block | KnownBlock)[]
}

export async function sendDirectMessage(
  userId: string,
  payload: string | MessagePayload
): Promise<SendMessageResult> {
  const slack = getSlackClient()

  if (!slack) {
    return {
      success: false,
      userId,
      error: 'Slack client not configured',
    }
  }

  try {
    const messageOptions =
      typeof payload === 'string'
        ? {
            channel: userId,
            text: payload,
            unfurl_links: false,
            unfurl_media: false,
          }
        : {
            channel: userId,
            text: payload.text,
            blocks: payload.blocks,
            unfurl_links: false,
            unfurl_media: false,
          }

    const result = await slack.chat.postMessage(messageOptions)

    if (result.ok) {
      return {
        success: true,
        userId,
      }
    } else {
      return {
        success: false,
        userId,
        error: result.error || 'Unknown error',
      }
    }
  } catch (error) {
    return {
      success: false,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function sendBulkDirectMessages(
  userIds: string[],
  payload: string | MessagePayload,
  options?: {
    batchSize?: number
    delayBetweenBatches?: number
  }
): Promise<{
  sent: number
  failed: number
  results: SendMessageResult[]
}> {
  const { batchSize = 50, delayBetweenBatches = 1000 } = options || {}
  const results: SendMessageResult[] = []

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(userId => sendDirectMessage(userId, payload))
    )

    results.push(...batchResults)

    if (i + batchSize < userIds.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  const sent = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return {
    sent,
    failed,
    results,
  }
}

export async function queueBulkDirectMessages(
  userIds: string[],
  payload: string | MessagePayload
): Promise<{ queued: number }> {
  setImmediate(async () => {
    try {
      await sendBulkDirectMessages(userIds, payload, {
        batchSize: 50,
        delayBetweenBatches: 1000,
      })
    } catch (error) {
      console.error('Background message sending failed:', error)
    }
  })

  return { queued: userIds.length }
}
