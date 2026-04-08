import { router, adminProcedure } from '../trpc'
import { z } from 'zod'
import {
  getSlackRepresentationSummary,
  getSlackUsersForMember,
  getSlackUsersForDomain,
} from '@/lib/members-slack'
import { clearSlackUsersCache } from '@/lib/slack/users'

export const adminMembersRouter = router({
  getSummary: adminProcedure.query(async () => {
    return getSlackRepresentationSummary()
  }),

  getMemberUsers: adminProcedure
    .input(z.object({ memberName: z.string() }))
    .query(async ({ input }) => {
      return getSlackUsersForMember(input.memberName)
    }),

  getDomainUsers: adminProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      return getSlackUsersForDomain(input.domain)
    }),

  refresh: adminProcedure.mutation(async () => {
    clearSlackUsersCache()
    return getSlackRepresentationSummary()
  }),
})
