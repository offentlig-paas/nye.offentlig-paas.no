import { redirect } from 'next/navigation'
import { auth } from '@/auth'

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
