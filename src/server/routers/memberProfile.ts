import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { revalidatePath } from 'next/cache'
import {
  memberProfileService,
  getMemberBySlug,
  canUserEditMemberProfile,
  upsertMemberProfileSchema,
} from '@/domains/member-profile'

export const memberProfileRouter = router({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await memberProfileService.getBySlug(input.slug)
    }),

  listPlatforms: publicProcedure.query(async () => {
    return await memberProfileService.listPlatformSummaries()
  }),

  getPermissions: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(80) }))
    .query(({ input, ctx }) => {
      const user = ctx.session?.user
      const emailParts = user?.email?.toLowerCase().trim().split('@')
      const emailDomain =
        emailParts?.length === 2 && emailParts[0] && emailParts[1]
          ? emailParts[1]
          : undefined
      const isAdmin = Boolean(user?.isAdmin)
      const member = getMemberBySlug(input.slug)
      if (!member) {
        return {
          canEdit: false,
          reason: 'domain_mismatch' as const,
          isAuthenticated: Boolean(user),
          isAdmin,
          emailDomain,
          matchedDomain: undefined as string | undefined,
          requiredDomains: [] as string[],
        }
      }
      const perm = canUserEditMemberProfile(member, user)
      return {
        ...perm,
        isAuthenticated: Boolean(user),
        isAdmin,
        emailDomain,
        requiredDomains: member.domains,
      }
    }),

  upsert: protectedProcedure
    .input(upsertMemberProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const member = getMemberBySlug(input.slug)
      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Medlemsorganisasjon ikke funnet',
        })
      }

      const perm = canUserEditMemberProfile(member, ctx.user)
      if (!perm.canEdit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Du må være innlogget med en e-postadresse fra ${member.domains.join(' eller ')} for å redigere plattformprofilen til ${member.name}`,
        })
      }

      const profile = await memberProfileService.upsert(input, {
        name: ctx.user.name ?? ctx.user.email ?? 'Ukjent',
        email: ctx.user.email ?? undefined,
        slackId: ctx.user.slackId ?? undefined,
      })

      const canonicalSlug = member.getSlug()
      revalidatePath('/plattformer')
      revalidatePath('/medlemmer')
      revalidatePath(`/medlemmer/${canonicalSlug}`)

      return profile
    }),
})
