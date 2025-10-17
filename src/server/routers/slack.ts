import { router, adminProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { WebClient } from '@slack/web-api'
import { TRPCError } from '@trpc/server'

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

export const slackRouter = router({
  userCount: publicProcedure.query(async () => {
    if (!SLACK_BOT_TOKEN) {
      return { userCount: 0 }
    }

    try {
      const slack = new WebClient(SLACK_BOT_TOKEN)
      let totalUsers = 0
      let cursor = ''

      do {
        const response = await slack.users.list({
          cursor: cursor || undefined,
          limit: 200,
        })

        if (!response.ok || !response.members) {
          return { userCount: 0 }
        }

        const activeUsers = (response.members as SlackUser[]).filter(
          user => !user.deleted && !user.is_bot
        )
        totalUsers += activeUsers.length
        cursor = response.response_metadata?.next_cursor || ''
      } while (cursor)

      return { userCount: totalUsers }
    } catch (error) {
      console.error('Error fetching Slack user count:', error)
      return { userCount: 0 }
    }
  }),

  searchUsers: adminProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      if (process.env.NODE_ENV !== 'development') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This endpoint is only available in development mode',
        })
      }

      if (!SLACK_BOT_TOKEN) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'SLACK_BOT_TOKEN not configured',
        })
      }

      const query = input.query.toLowerCase()

      const slack = new WebClient(SLACK_BOT_TOKEN)
      let allUsers: SlackUser[] = []
      let cursor = ''

      do {
        const response = await slack.users.list({
          cursor: cursor || undefined,
          limit: 200,
        })

        if (!response.ok || !response.members) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch users from Slack',
          })
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
          displayName:
            user.profile?.display_name || user.real_name || user.name,
          email: user.profile?.email,
          url: `https://offentlig-paas-no.slack.com/team/${user.id}`,
          avatar: user.profile?.image_512,
        }))

      return { users: matchingUsers }
    }),
})
