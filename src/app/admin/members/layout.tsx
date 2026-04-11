import { requireAdmin } from '@/lib/auth-guards'

export default async function AdminMembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <>{children}</>
}
