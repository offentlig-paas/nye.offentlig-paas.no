import { router, protectedProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  aggregateSlackUsersByDomain,
  getSlackUserCount,
} from '@/lib/slack/users'
import { hasAnyEventAccess } from '@/lib/events/helpers'
import { members } from '@/data/members'

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

  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user.isAdmin && !hasAnyEventAccess(ctx.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Ikke autorisert',
        })
      }

      const { domains, status } = await aggregateSlackUsersByDomain()

      if (status === 'no_token') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'SLACK_BOT_TOKEN not configured',
        })
      }

      const domainToMemberName = new Map<string, string>()
      for (const m of members) {
        for (const d of m.domains) {
          domainToMemberName.set(d.toLowerCase(), m.name)
        }
      }

      const query = input.query.toLowerCase()
      const matchingUsers: {
        id: string
        name: string
        realName: string
        displayName: string
        email?: string
        avatar?: string
        title?: string
        organisation?: string
        url: string
      }[] = []

      for (const [domain, bucket] of domains.entries()) {
        const orgName = domainToMemberName.get(domain)
        for (const user of bucket.users) {
          if (matchingUsers.length >= 50) break
          const searchFields = [
            user.name,
            user.realName,
            user.displayName,
            user.email ?? '',
          ].map(f => f.toLowerCase())
          if (searchFields.some(f => f.includes(query))) {
            matchingUsers.push({
              ...user,
              organisation: orgName,
              url: `https://offentlig-paas-no.slack.com/team/${user.id}`,
            })
          }
        }
        if (matchingUsers.length >= 50) break
      }

      return { users: matchingUsers }
    }),
})
