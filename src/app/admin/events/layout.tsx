import { requireAdmin } from '@/lib/auth-guards'

export default async function AdminEventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <>{children}</>
}
