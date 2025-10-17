import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { Container } from '@/components/Container'
import { AdminEventPhotos } from '@/components/AdminEventPhotos'
import { getEvent, canUserAccessEvent } from '@/lib/events/helpers'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface AdminEventPhotosPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminEventPhotosPage({
  params,
}: AdminEventPhotosPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!session.user.isAdmin) {
    redirect('/')
  }

  const { slug } = await params

  const event = getEvent(slug)
  if (!event) {
    notFound()
  }

  const hasAccess = canUserAccessEvent(event, session.user)
  if (!hasAccess) {
    redirect('/')
  }

  return (
    <Container className="mt-16 sm:mt-24">
      <div className="mb-6">
        <Link
          href={`/admin/events/${slug}`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Tilbake til administrasjon
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
          Bilder: {event.title}
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
          Last opp og administrer bilder fra fagdagen
        </p>
      </header>

      <AdminEventPhotos slug={slug} event={event} />
    </Container>
  )
}
