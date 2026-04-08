import { AdminLayout } from '@/components/AdminLayout'
import { AdminMembersClient } from '@/components/AdminMembersClient'

export default function AdminMembersPage() {
  return (
    <AdminLayout
      title="Medlemmer"
      intro="Slack-representasjon per medlemsorganisasjon."
      backButton={{ href: '/admin', label: 'Tilbake til admin' }}
    >
      <AdminMembersClient />
    </AdminLayout>
  )
}
