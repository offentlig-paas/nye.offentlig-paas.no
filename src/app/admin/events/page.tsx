import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SimpleLayout } from '@/components/SimpleLayout'
import { AdminEventsClient } from '@/components/AdminEventsClient'
import { createCaller } from '@/server/root'

export default async function AdminEventsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin) {
    redirect('/')
  }

  const caller = await createCaller()
  const eventsData = await caller.admin.events.list()

  return (
    <SimpleLayout
      title="Admin - Fagdager"
      intro="Oversikt over alle fagdager og påmeldinger."
      backButton={{
        href: '/',
        label: 'Tilbake til forsiden',
      }}
    >
      <AdminEventsClient eventsData={eventsData} />
    </SimpleLayout>
  )
}
