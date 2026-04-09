/**
 * Slack message builders for admin notifications
 */
import type { KnownBlock } from '@slack/web-api'
import type { MessagePayload } from '@/lib/slack/messaging'
import { formatDateLong, formatTimeRange } from '@/lib/formatDate'
import type { Event, EventParticipantInfo } from '@/lib/events/types'
import { getAppUrl } from './environment'

/**
 * Builds a reminder message payload for event participants
 */
export function buildReminderMessage(
  event: Event & { participantInfo?: EventParticipantInfo },
  customMessage: string,
  eventSlug: string
): MessagePayload {
  const { url } = getAppUrl()
  const eventUrl = `${url}/fagdag/${eventSlug}`
  const profileUrl = `${url}/profil`

  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: customMessage,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*${event.title}*`,
        },
        {
          type: 'mrkdwn',
          text: `📅 ${formatDateLong(event.start)}`,
        },
        {
          type: 'mrkdwn',
          text: `🕒 ${formatTimeRange(event.start, event.end)}`,
        },
        {
          type: 'mrkdwn',
          text: `📍 ${event.location}`,
        },
      ],
    },
  ]

  const actionButtons: Array<{
    type: 'button'
    text: { type: 'plain_text'; text: string; emoji: boolean }
    url: string
    action_id: string
  }> = [
    {
      type: 'button',
      text: {
        type: 'plain_text',
        text: '📝 Se program',
        emoji: true,
      },
      url: eventUrl,
      action_id: 'view_event',
    },
  ]

  if (event.participantInfo?.streamingUrl) {
    actionButtons.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '🎥 Direktestrøm',
        emoji: true,
      },
      url: event.participantInfo.streamingUrl,
      action_id: 'join_stream',
    })
  }

  actionButtons.push({
    type: 'button',
    text: {
      type: 'plain_text',
      text: '📋 Mine påmeldinger',
      emoji: true,
    },
    url: profileUrl,
    action_id: 'view_profile',
  })

  blocks.push({
    type: 'actions',
    elements: actionButtons,
  })

  return {
    text: `${customMessage} - ${event.title}`,
    blocks,
  }
}

/**
 * Builds a feedback request message payload
 */
export function buildFeedbackRequestMessage(
  event: Event,
  customMessage: string,
  eventSlug: string
): MessagePayload {
  const { url } = getAppUrl()
  const feedbackUrl = `${url}/fagdag/${eventSlug}/tilbakemelding`

  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: customMessage,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*${event.title}*`,
        },
        {
          type: 'mrkdwn',
          text: `📅 ${formatDateLong(event.start)}`,
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '⚡ Rask vurdering',
            emoji: true,
          },
          action_id: 'quick_feedback',
          style: 'primary',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📝 Full tilbakemelding',
            emoji: true,
          },
          url: feedbackUrl,
          action_id: 'full_feedback',
        },
      ],
    },
  ]

  return {
    text: `${customMessage} - ${event.title}`,
    blocks,
    metadata: {
      event_type: 'feedback_request',
      event_payload: {
        eventSlug,
      },
    },
  }
}

/**
 * Filters registrations based on status
 */
export function filterRegistrationsByStatus<
  T extends { status: string; slackUserId?: string },
>(registrations: T[], statusFilter?: string): T[] {
  if (!statusFilter || statusFilter === 'all') {
    return registrations.filter(r =>
      ['confirmed', 'attended'].includes(r.status)
    )
  }
  return registrations.filter(r => r.status === statusFilter)
}

/**
 * Extracts Slack user IDs from registrations
 */
export function extractUserIds<T extends { slackUserId?: string }>(
  registrations: T[]
): string[] {
  return registrations
    .map(r => r.slackUserId)
    .filter((id): id is string => !!id)
}
