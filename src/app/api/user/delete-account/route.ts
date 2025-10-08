import { auth } from '@/auth'
import { eventRegistrationService } from '@/domains/event-registration'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/user/delete-account
 * Anonymize all user data (GDPR right to be forgotten)
 * This keeps registrations for capacity/statistics but removes personal information
 */
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.slackId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const anonymizedCount = await eventRegistrationService.anonymizeUserData(
      session.user.slackId
    )

    return NextResponse.json({
      success: true,
      message: 'Account data deleted successfully',
      anonymizedRegistrations: anonymizedCount,
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete account data',
      },
      { status: 500 }
    )
  }
}
