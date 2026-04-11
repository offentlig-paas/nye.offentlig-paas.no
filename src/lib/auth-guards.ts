import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAnySurveyAccess } from '@/lib/surveys/helpers'

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
 * Requires authentication and either admin access or survey access (owner/researcher).
 * Used by the admin layout to allow survey participants through.
 */
export async function requireAdminOrSurveyAccess() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin && !hasAnySurveyAccess(session.user)) {
    redirect('/')
  }

  return session
}
