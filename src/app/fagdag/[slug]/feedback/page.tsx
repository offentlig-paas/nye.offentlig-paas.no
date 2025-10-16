'use client'

import { notFound, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getEvent, getStatus, isTalkType } from '@/lib/events/helpers'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { EventFeedbackForm } from '@/components/EventFeedbackForm'
import { Status } from '@/lib/events/types'
import { trpc } from '@/lib/trpc/client'
import { use, useEffect } from 'react'

interface FeedbackPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function FeedbackPage({ params }: FeedbackPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const { registration } = useEventRegistration()

  const event = getEvent(slug)

  const { data: feedbackData, isLoading } =
    trpc.eventFeedback.hasFeedback.useQuery(
      { slug },
      {
        enabled: !!session?.user?.slackId,
      }
    )

  if (!event) {
    notFound()
  }

  const eventStatus = getStatus(event)
  const hasFeedback = feedbackData?.hasFeedback ?? false

  // Only allow feedback for past events where user attended
  const canProvideFeedback =
    eventStatus === Status.Past &&
    registration &&
    registration.status === 'attended'

  useEffect(() => {
    if (!canProvideFeedback) {
      router.push(`/fagdag/${slug}`)
    }
  }, [canProvideFeedback, router, slug])

  const talks = event.schedule.filter(item => isTalkType(item.type))

  if (!canProvideFeedback) {
    return null
  }

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          <Button
            href={`/fagdag/${slug}`}
            aria-label="Tilbake til arrangement"
            className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
          >
            <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
          </Button>

          {isLoading ? (
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">Laster...</p>
            </div>
          ) : hasFeedback ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                  Takk for tilbakemeldingen!
                </h1>
                <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                  Vi setter stor pris på at du tok deg tid til å dele dine
                  tanker om {event.title}. Din tilbakemelding hjelper oss å
                  gjøre fremtidige arrangementer enda bedre.
                </p>
              </div>

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
                        Du har allerede gitt tilbakemelding på dette
                        arrangementet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button href={`/fagdag/${slug}`} variant="secondary">
                Tilbake til arrangement
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                  Gi tilbakemelding
                </h1>
                <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                  Hjelp oss å forbedre fremtidige arrangementer ved å dele dine
                  tanker om {event.title}.
                </p>
              </div>

              <EventFeedbackForm
                eventSlug={slug}
                talks={talks}
                organizers={event.organizers}
                onSubmit={() => {
                  router.push(`/fagdag/${slug}/feedback`)
                  router.refresh()
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
