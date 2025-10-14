import {
  archiveChannel,
  createChannel,
  findChannelByName,
  generateChannelName,
  inviteUsersToChannel,
} from '@/lib/slack/channels'
import { extractSlackIds } from '@/lib/slack/utils'
import { USER_GROUPS, buildInvitationMessage } from '@/lib/slack/types'
import { NextRequest, NextResponse } from 'next/server'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import { EventRegistrationRepository } from '@/domains/event-registration/repository'
import type { SlackUser } from '@/lib/events/types'

const registrationRepository = new EventRegistrationRepository()

enum SlackChannelAction {
  Create = 'create',
  AddMembers = 'add-members',
  Archive = 'archive',
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/slack-channel`,
    'POST',
    slug
  )

  if (!authResult.success) {
    return authResult.response
  }

  const { auth } = authResult
  const event = auth.event

  try {
    const body = await request.json()
    const { action, userGroups } = body

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    if (
      !Object.values(SlackChannelAction).includes(action as SlackChannelAction)
    ) {
      return NextResponse.json(
        {
          error: 'Invalid action',
          validActions: Object.values(SlackChannelAction),
        },
        { status: 400 }
      )
    }

    if (action === SlackChannelAction.Archive) {
      if (!event.slackChannel?.id) {
        return NextResponse.json(
          { error: 'No channel to archive' },
          { status: 400 }
        )
      }

      const result = await archiveChannel(event.slackChannel.id)

      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to archive channel' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    if (
      action === SlackChannelAction.Create ||
      action === SlackChannelAction.AddMembers
    ) {
      if (
        action === SlackChannelAction.AddMembers &&
        (!userGroups || !Array.isArray(userGroups) || userGroups.length === 0)
      ) {
        return NextResponse.json(
          { error: 'User groups are required for add-members action' },
          { status: 400 }
        )
      }

      const channelName = generateChannelName(new Date(event.start))
      let channelId = event.slackChannel?.id

      if (!channelId) {
        const channel = await createChannel(channelName)
        if (!channel) {
          return NextResponse.json(
            { error: 'Failed to create channel' },
            { status: 500 }
          )
        }
        channelId = channel.id
      }

      if (userGroups && userGroups.length > 0) {
        let slackIds: string[] = []

        if (userGroups.includes(USER_GROUPS.ORGANIZERS)) {
          const organizerIds = extractSlackIds(event.organizers)
          slackIds.push(...organizerIds)
        }

        if (userGroups.includes(USER_GROUPS.SPEAKERS)) {
          const speakers = event.schedule
            .filter(
              (item): item is typeof item & { speakers: SlackUser[] } =>
                item.speakers !== undefined && item.speakers.length > 0
            )
            .flatMap(item => item.speakers)
          const speakerIds = extractSlackIds(speakers)
          slackIds.push(...speakerIds)
        }

        if (userGroups.includes(USER_GROUPS.ATTENDEES)) {
          const registrations = await registrationRepository.findMany({
            eventSlug: slug,
          })
          const attendeeIds = extractSlackIds(registrations)
          slackIds.push(...attendeeIds)
        }

        slackIds = [...new Set(slackIds)]

        if (slackIds.length === 0) {
          console.warn(`No Slack IDs found for event ${slug}`, {
            userGroups,
            organizersCount: event.organizers.length,
            scheduleItemsCount: event.schedule.length,
          })
          return NextResponse.json({
            success: true,
            channelId,
            channelName,
            invited: 0,
            failed: 0,
            alreadyInChannel: 0,
            message: 'Ingen brukere funnet å invitere',
          })
        }

        const result = await inviteUsersToChannel(channelId, slackIds, {
          batchSize: 100,
          delayBetweenBatches: 1000,
          continueOnError: true,
        })

        if (result.errors.length > 0) {
          console.error(`Failed invitations for event ${slug}:`, result.errors)
        }

        const message = buildInvitationMessage(
          result.invited,
          result.failed,
          result.alreadyInChannel
        )

        return NextResponse.json({
          success: true,
          channelId,
          channelName,
          invited: result.invited,
          failed: result.failed,
          alreadyInChannel: result.alreadyInChannel,
          totalProcessed: slackIds.length,
          errors: result.errors.slice(0, 10),
          message,
        })
      }

      return NextResponse.json({
        success: true,
        channelId,
        channelName,
        invited: 0,
        failed: 0,
        alreadyInChannel: 0,
      })
    }

    return NextResponse.json(
      {
        error: 'Invalid action',
        validActions: Object.values(SlackChannelAction),
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Slack channel operation failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Ukjent feil'
    return NextResponse.json(
      {
        error: 'Kunne ikke administrere Slack-kanal',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/slack-channel`,
    'GET',
    slug
  )

  if (!authResult.success) {
    return authResult.response
  }

  const { auth } = authResult
  const event = auth.event

  try {
    const channelName = generateChannelName(new Date(event.start))
    const channel = await findChannelByName(channelName)

    return NextResponse.json({
      exists: channel !== null,
      channel: channel || null,
    })
  } catch (error) {
    console.error('Failed to check channel status:', error)
    return NextResponse.json(
      { error: 'Failed to check channel status' },
      { status: 500 }
    )
  }
}
