import { NextRequest, NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const slack = getSlackClient()

  if (!slack) {
    return NextResponse.json(
      { error: 'Slack API not configured' },
      { status: 500 }
    )
  }

  try {
    const userInfo = await slack.users.info({
      user: userId,
    })

    if (!userInfo.ok || !userInfo.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    return NextResponse.json(
      {
        userId,
        avatarUrl,
        displayName,
      },
      {
        headers: {
          'Cache-Control':
            'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'max-age=3600',
          'Vercel-CDN-Cache-Control': 'max-age=3600',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching Slack user avatar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user avatar' },
      { status: 500 }
    )
  }
}
