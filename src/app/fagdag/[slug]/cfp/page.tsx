import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  getEvent,
  getStatus,
  isCallForPapersOpen,
  hasInternalCallForPapers,
} from '@/lib/events/helpers'
import { formatDateTime } from '@/lib/formatDate'
import { Container } from '@/components/Container'
import { TalkSubmissionForm } from '@/components/TalkSubmissionForm'
import { EventSummary } from '@/components/EventSummary'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'

interface CfpPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: CfpPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = getEvent(slug)

  if (!event) return {}

  return {
    title: `Foreslå foredrag – ${event.title}`,
    description: `Send inn foredragsforslag til ${event.title}`,
  }
}

export default async function CfpPage({ params }: CfpPageProps) {
  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    notFound()
  }

  if (!hasInternalCallForPapers(event) || !isCallForPapersOpen(event)) {
    redirect(`/fagdag/${slug}`)
  }

  const status = getStatus(event)

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/fagdag/${slug}`}
            className="group mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            <ArrowLeftIcon className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Tilbake til {event.title}
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-100">
            Foreslå foredrag
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Del din kunnskap og erfaring med fellesskapet. Vi tar imot forslag
            til presentasjoner, lynforedrag, workshops og paneldebatter.
          </p>

          {event.callForPapersClosedDate && (
            <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Frist: {formatDateTime(event.callForPapersClosedDate)}
            </p>
          )}

          <div className="mt-8">
            <TalkSubmissionForm eventSlug={slug} eventTitle={event.title} />
          </div>

          <div className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
            <EventSummary event={event} status={status} />
          </div>
        </div>
      </div>
    </Container>
  )
}
