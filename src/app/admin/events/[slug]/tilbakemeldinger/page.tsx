import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getEvent, canUserAccessEvent } from '@/lib/events/helpers'
import { SimpleLayout } from '@/components/SimpleLayout'
import { AdminEventFeedback } from '@/components/AdminEventFeedback'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface AdminEventFeedbackPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminEventFeedbackPage({
  params,
}: AdminEventFeedbackPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    notFound()
  }

  const hasAccess = canUserAccessEvent(event, session.user)
  if (!hasAccess) {
    redirect('/admin/events')
  }

  return (
    <SimpleLayout title={event.title} intro="Tilbakemeldinger fra deltakere">
      <div className="mx-auto max-w-7xl">
        <div className="xl:relative">
          <Link
            href={`/admin/events/${slug}`}
            className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition lg:absolute lg:-left-12 lg:-mt-8 lg:mb-0 xl:-top-8 xl:-left-16 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
            aria-label="Tilbake til arrangement"
          >
            <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
          </Link>

          <AdminEventFeedback eventSlug={slug} />
        </div>
      </div>
    </SimpleLayout>
  )
}
