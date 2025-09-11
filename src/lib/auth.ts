import { auth } from '@/auth'

export async function isUserAdmin() {
  const session = await auth()
  return session?.user?.isAdmin || false
}

export async function getUserAdminGroups() {
  const session = await auth()
  return session?.user?.adminGroups || []
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    throw new Error('Admin access required')
  }
  return session
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}