import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAnySurveyAccess } from '@/lib/surveys/helpers'
import { hasAnyEventAccess } from '@/lib/events/helpers'

/**
 * Requires authentication and admin access
 * Redirects to /auth/signin if not authenticated
 * Redirects to / if not admin
 */
export async function requireAdmin() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin) {
    redirect('/')
  }

  return session
}

/**
 * Requires authentication and either admin, event organizer, or survey access.
 * Used by the top-level admin layout to allow non-admin collaborators through.
 */
export async function requireAdminOrSurveyAccess() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (
    !session.user.isAdmin &&
    !hasAnySurveyAccess(session.user) &&
    !hasAnyEventAccess(session.user)
  ) {
    redirect('/')
  }

  return session
}

/**
 * Requires authentication and returns the session.
 * Does NOT check admin or any role — caller must do authorization.
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return session
}
