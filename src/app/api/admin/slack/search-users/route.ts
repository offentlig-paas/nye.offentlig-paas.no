import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { WebClient } from '@slack/web-api'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN

interface SlackUserProfile {
  real_name?: string
  display_name?: string
  email?: string
  image_512?: string
}

interface SlackUser {
  id: string
  name: string
  real_name?: string
  deleted: boolean
  is_bot: boolean
  profile?: SlackUserProfile
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      )
    }

    const session = await auth()

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!SLACK_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'SLACK_BOT_TOKEN not configured' },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')?.toLowerCase() || ''

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const slack = new WebClient(SLACK_BOT_TOKEN)
    let allUsers: SlackUser[] = []
    let cursor = ''

    do {
      const response = await slack.users.list({
        cursor: cursor || undefined,
        limit: 200,
      })

      if (!response.ok || !response.members) {
        return NextResponse.json(
          { error: 'Failed to fetch users from Slack' },
          { status: 500 }
        )
      }

      allUsers = allUsers.concat(response.members as SlackUser[])
      cursor = response.response_metadata?.next_cursor || ''
    } while (cursor)

    const matchingUsers = allUsers
      .filter(user => !user.deleted && !user.is_bot)
      .filter(user => {
        const searchFields = [
          user.name,
          user.real_name,
          user.profile?.real_name,
          user.profile?.display_name,
        ]
          .filter(Boolean)
          .map(field => field!.toLowerCase())

        return searchFields.some(field => field.includes(query))
      })
      .slice(0, 50)
      .map(user => ({
        id: user.id,
        name: user.name,
        realName: user.real_name || user.profile?.real_name || user.name,
        displayName: user.profile?.display_name || user.real_name || user.name,
        email: user.profile?.email,
        url: `https://offentlig-paas-no.slack.com/team/${user.id}`,
        avatar: user.profile?.image_512,
      }))

    return NextResponse.json({ users: matchingUsers }, { status: 200 })
  } catch (error) {
    console.error('Error searching Slack users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
