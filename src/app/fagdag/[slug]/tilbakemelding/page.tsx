import { notFound, redirect } from 'next/navigation'
import { getEvent, getStatus, isTalkType } from '@/lib/events/helpers'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { EventFeedbackForm } from '@/components/EventFeedbackForm'
import { EventSummary } from '@/components/EventSummary'
import { Status } from '@/lib/events/types'
import { createCaller } from '@/server/root'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'

interface FeedbackPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { slug } = await params
  const session = await auth()

  const event = getEvent(slug)

  if (!event) {
    notFound()
  }

  const eventStatus = getStatus(event)

  // Redirect if event is not past
  if (eventStatus !== Status.Past) {
    redirect(`/fagdag/${slug}`)
  }

  // Redirect if not authenticated
  if (!session?.user?.slackId) {
    redirect(
      `/auth/signin?callbackUrl=${encodeURIComponent(`/fagdag/${slug}/tilbakemelding`)}`
    )
  }

  const caller = await createCaller()

  // Fetch enriched event data (replaces deprecated getRegistrationStatus)
  const enrichedEvent = await caller.event.getBySlug({ slug })

  const registration = enrichedEvent.userRegistration

  // Redirect if user didn't attend
  if (!registration || registration.status !== 'attended') {
    redirect(`/fagdag/${slug}`)
  }

  // Check if user already submitted feedback
  const feedbackData = await caller.eventFeedback.hasFeedback({ slug })
  const { hasFeedback, isQuickFeedback } = feedbackData

  const talks = event.schedule.filter(item => isTalkType(item.type))

  // If user has full feedback, show thank you message
  if (hasFeedback && !isQuickFeedback) {
    return (
      <Container className="mt-16 lg:mt-32">
        <div className="xl:relative">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={`/fagdag/${slug}`}
                  className="group flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
                  aria-label="Tilbake til arrangement"
                >
                  <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
                </Link>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                  Takk for tilbakemeldingen!
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl py-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
                <div className="px-6 py-6">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                          Tilbakemelding mottatt
                        </h3>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                          <p>
                            Vi setter stor pris på at du tok deg tid til å dele
                            dine tanker om {event.title}. Din tilbakemelding
                            hjelper oss å gjøre fremtidige arrangementer enda
                            bedre.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button href={`/fagdag/${slug}`} variant="secondary">
                      Tilbake til arrangement
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <EventSummary event={event} status={eventStatus} />
            </div>
          </div>
        </div>
      </Container>
    )
  }

  // Fetch existing feedback only when upgrading from quick to full
  const existingFeedback = isQuickFeedback
    ? await caller.eventFeedback.getUserFeedback({ slug })
    : null

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <Link
              href={`/fagdag/${slug}`}
              className="group flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
              aria-label="Tilbake til arrangement"
            >
              <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
              {isQuickFeedback
                ? 'Utvid tilbakemeldingen din'
                : 'Gi tilbakemelding'}
            </h1>
          </div>
          {isQuickFeedback ? (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Du har allerede gitt en rask vurdering via Slack. Nå kan du
                    gi mer detaljert tilbakemelding til foredragsholderne.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
              Hjelp oss å forbedre fremtidige arrangementer ved å dele dine
              tanker om {event.title}.
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <EventFeedbackForm
              eventSlug={slug}
              talks={talks}
              organizers={event.organizers}
              isUpgrade={isQuickFeedback}
              existingFeedback={existingFeedback}
            />
          </div>

          <div className="space-y-6">
            <EventSummary event={event} status={eventStatus} />
          </div>
        </div>
      </div>
    </Container>
  )
}
