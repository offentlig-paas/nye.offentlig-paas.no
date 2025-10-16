import { EventRegistrationProvider } from '@/contexts/EventRegistrationContext'

export default async function FeedbackLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <EventRegistrationProvider eventSlug={slug}>
      {children}
    </EventRegistrationProvider>
  )
}
