import { notFound } from 'next/navigation'
import { AdminEventDetailsClient } from '@/components/AdminEventDetailsClient'
import { createCaller } from '@/server/root'

interface AdminEventPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminEventPage({ params }: AdminEventPageProps) {
  const { slug } = await params
  const caller = await createCaller()

  try {
    const participantInfo = await caller.admin.participantInfo.get({ slug })

    return <AdminEventDetailsClient initialParticipantInfo={participantInfo} />
  } catch (error) {
    console.error('Error loading event:', error)
    notFound()
  }
}
