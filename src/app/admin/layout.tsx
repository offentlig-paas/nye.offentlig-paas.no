import { requireAdminOrSurveyAccess } from '@/lib/auth-guards'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminOrSurveyAccess()
  return <>{children}</>
}
