import { router, protectedProcedure } from '../trpc'
import { eventRegistrationService } from '@/domains/event-registration'
import { TRPCError } from '@trpc/server'
import { revalidatePath } from 'next/cache'

export const userRouter = router({
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.slackId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      })
    }

    try {
      const anonymizedCount = await eventRegistrationService.anonymizeUserData(
        ctx.user.slackId
      )

      revalidatePath('/profil')

      return {
        success: true,
        message: 'Account data deleted successfully',
        anonymizedRegistrations: anonymizedCount,
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to delete account data',
      })
    }
  }),
})
