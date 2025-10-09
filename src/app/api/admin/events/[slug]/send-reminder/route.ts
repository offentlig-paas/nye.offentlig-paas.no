import { NextRequest, NextResponse } from 'next/server'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import { eventRegistrationService } from '@/domains/event-registration'
import {
  sendBulkDirectMessages,
  type MessagePayload,
} from '@/lib/slack/messaging'
import type { KnownBlock } from '@slack/web-api'
import { formatDateLong, formatTimeRange } from '@/lib/formatDate'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/send-reminder`,
    'POST',
    slug
  )

  if (!authResult.success) {
    return authResult.response
  }

  const { auth } = authResult
  const body = await request.json()
  const { message, statusFilter, testMode } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const { event } = auth
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') ||
    request.headers.get('host') ||
    'offentlig-paas.no'
  const eventUrl = `${protocol}://${host}/fagdag/${slug}`

  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message,
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

  if (event.participantInfo?.streamingUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎥 *Direktestrøm:* <${event.participantInfo.streamingUrl}|Bli med digitalt>`,
      },
    })
  }

  const profileUrl = `${protocol}://${host}/profil`

  blocks.push({
    type: 'actions',
    elements: [
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
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '📋 Mine påmeldinger',
          emoji: true,
        },
        url: profileUrl,
        action_id: 'view_profile',
      },
    ],
  })

  const payload: MessagePayload = {
    text: `${message} - ${event.title}`,
    blocks,
  }

  let userIds: string[]

  if (testMode) {
    if (!auth.user.slackId) {
      return NextResponse.json(
        { error: 'Slack ID not found for current user' },
        { status: 400 }
      )
    }
    userIds = [auth.user.slackId]
  } else {
    const registrations =
      await eventRegistrationService.getEventRegistrations(slug)

    let filteredRegistrations = registrations
    if (statusFilter && statusFilter !== 'all') {
      filteredRegistrations = registrations.filter(
        r => r.status === statusFilter
      )
    } else {
      filteredRegistrations = registrations.filter(r =>
        ['confirmed', 'attended'].includes(r.status)
      )
    }

    userIds = filteredRegistrations
      .map(r => r.slackUserId)
      .filter((id): id is string => !!id)

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: 'No registered users with Slack IDs found' },
        { status: 400 }
      )
    }
  }

  const result = await sendBulkDirectMessages(userIds, payload, {
    batchSize: 50,
    delayBetweenBatches: 1000,
  })

  const responseMessage = testMode
    ? 'Test-påminnelse sendt til deg'
    : `Påminnelse sendt til ${result.sent} av ${userIds.length} deltakere`

  return NextResponse.json({
    message: responseMessage,
    sent: result.sent,
    failed: result.failed,
    total: userIds.length,
    results: result.results,
  })
}
