import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { Container } from '@/components/Container'
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
      <Container className="mt-16 sm:mt-24">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {eventDetails.title}
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {eventDetails.date} · {eventDetails.location}
          </p>
        </header>

        <AdminEventDetailsClient
          slug={slug}
          initialEventDetails={eventDetails}
          initialParticipantInfo={participantInfo}
          speakersWithoutUrls={speakersWithoutUrls}
        />
      </Container>
    )
  } catch (error) {
    console.error('Error loading event:', error)
    notFound()
  }
}
