import { NextRequest, NextResponse } from 'next/server'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN

if (!SLACK_BOT_TOKEN) {
  throw new Error('SLACK_BOT_TOKEN is not defined')
}

export const revalidate = 3600

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function GET(request: NextRequest) {
  try {
    let userCount = 0
    let cursor = ''

    do {
      const fetchResponse = await fetch(
        `https://slack.com/api/users.list?cursor=${cursor}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await fetchResponse.json()

      if (!data.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch users from Slack' },
          { status: 500 }
        )
      }

      interface SlackUser {
        id: string
        team_id: string
        name: string
        deleted: boolean
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any
      }

      interface SlackResponseMetadata {
        next_cursor: string
      }

      interface SlackUsersListResponse {
        ok: boolean
        members: SlackUser[]
        response_metadata?: SlackResponseMetadata
      }

      userCount += (data as SlackUsersListResponse).members.filter(
        (member: SlackUser) => !member.deleted
      ).length
      cursor = data.response_metadata?.next_cursor || ''
    } while (cursor)

    return NextResponse.json({ userCount }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch user count' },
      { status: 500 }
    )
  }
}
