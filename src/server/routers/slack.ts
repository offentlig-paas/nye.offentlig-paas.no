import { router, adminProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  aggregateSlackUsersByDomain,
  getSlackUserCount,
} from '@/lib/slack/users'

export const slackRouter = router({
  userCount: publicProcedure.query(async () => {
    try {
      const userCount = await getSlackUserCount()
      return { userCount }
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

      const { domains, status } = await aggregateSlackUsersByDomain()

      if (status === 'no_token') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'SLACK_BOT_TOKEN not configured',
        })
      }

      const query = input.query.toLowerCase()
      const matchingUsers: {
        id: string
        name: string
        realName: string
        displayName: string
        email?: string
        avatar?: string
        url: string
      }[] = []

      for (const bucket of domains.values()) {
        for (const user of bucket.users) {
          if (matchingUsers.length >= 50) break
          const searchFields = [user.name, user.realName, user.displayName].map(
            f => f.toLowerCase()
          )
          if (searchFields.some(f => f.includes(query))) {
            matchingUsers.push({
              ...user,
              url: `https://offentlig-paas-no.slack.com/team/${user.id}`,
            })
          }
        }
        if (matchingUsers.length >= 50) break
      }

      return { users: matchingUsers }
    }),
})
