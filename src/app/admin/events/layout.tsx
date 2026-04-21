import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-guards'
import { hasAnyEventAccess } from '@/lib/events/helpers'

export default async function AdminEventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  if (!hasAnyEventAccess(session.user)) {
    redirect('/')
  }
  return <>{children}</>
}
