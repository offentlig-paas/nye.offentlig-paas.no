import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { SimpleLayout } from '@/components/SimpleLayout'
import { AdminEventDetailsClient } from '@/components/AdminEventDetailsClient'
import { createCaller } from '@/server/root'
import { getUniqueSpeakersWithoutUrls } from '@/lib/events/helpers'

interface AdminEventPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminEventPage({ params }: AdminEventPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin) {
    redirect('/')
  }

  const { slug } = await params
  const caller = await createCaller()

  try {
    const [eventDetails, participantInfo] = await Promise.all([
      caller.admin.events.getDetails({ slug }),
      caller.admin.participantInfo.get({ slug }),
    ])

    const speakersWithoutUrls = getUniqueSpeakersWithoutUrls(
      eventDetails.schedule
    )

    return (
      <SimpleLayout
        title={eventDetails.title}
        intro={`${eventDetails.date} · ${eventDetails.location}`}
        backButton={{
          href: '/admin/events',
          label: 'Tilbake til fagdager',
        }}
      >
        <AdminEventDetailsClient
          slug={slug}
          initialEventDetails={eventDetails}
          initialParticipantInfo={participantInfo}
          speakersWithoutUrls={speakersWithoutUrls}
        />
      </SimpleLayout>
    )
  } catch (error) {
    console.error('Error loading event:', error)
    notFound()
  }
}
