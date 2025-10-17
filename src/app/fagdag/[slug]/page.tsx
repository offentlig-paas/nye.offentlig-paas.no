import { type Metadata } from 'next'
import { headers } from 'next/headers'
import React, { Suspense } from 'react'

import { SimpleLayout } from '@/components/SimpleLayout'
import { EventRegistrationPanel } from '@/components/EventRegistrationPanel'
import { EventFeedbackPrompt } from '@/components/EventFeedbackPrompt'
import { EventFeedbackSummaryWrapper } from '@/components/EventFeedbackSummaryWrapper'
import { EventRegistrationProvider } from '@/contexts/EventRegistrationContext'
import { EventSummary } from '@/components/EventSummary'
import { EventAgenda } from '@/components/EventAgenda'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Rating } from '@/components/Rating'
import { BatchedServerAvatar } from '@/components/BatchedServerAvatar'
import Link from 'next/link'
import {
  getEvent,
  getStatus,
  isAcceptingRegistrations,
  isCallForPapersOpen,
  canUserAccessEvent,
} from '@/lib/events/helpers'
import { getAllEventAttachments } from '@/lib/events/attachment-helpers'
import { getEventPhotos, urlForImage } from '@/lib/sanity/event-photos'
import { EventHeroGallery } from '@/components/EventHeroGallery'
import { EventAdditionalPhotosGallery } from '@/components/EventAdditionalPhotosGallery'
import { EventPhotoSkeleton } from '@/components/skeletons/EventPhotoSkeleton'
import { EventAgendaSkeleton } from '@/components/skeletons/EventAgendaSkeleton'
import {
  batchFetchSlackUsers,
  extractEventUserIds,
} from '@/lib/slack/batch-users'
import { extractSlackUserId } from '@/lib/slack/utils'
import {
  formatDateTime,
  formatDateLong,
  formatTimeRange,
  formatTime,
} from '@/lib/formatDate'
import { auth } from '@/auth'
import { ItemType, Status } from '@/lib/events/types'
import {
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  PencilSquareIcon,
  PresentationChartLineIcon,
  ChatBubbleBottomCenterIcon,
  CogIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/20/solid'

type Params = Promise<{ slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    return {
      title: 'Fagdag ikke funnet',
      description: 'Fagdagen du leter etter finnes ikke.',
    }
  }

  const eventDate = formatDateLong(event.start)
  const eventTime = formatTimeRange(event.start, event.end)

  const speakers = Array.from(
    new Set(
      event.schedule
        .filter(item => item.speakers && item.type === ItemType.Talk)
        .flatMap(item => item.speakers!.map(s => s.name))
    )
  )

  const talks = event.schedule
    .filter(item => item.type === ItemType.Talk && item.title)
    .slice(0, 5)
    .map(
      item =>
        `• ${item.title}${item.speakers && item.speakers.length > 0 ? ` (${item.speakers.map(s => s.name).join(', ')})` : ''}`
    )
    .join('\n')

  const photos = await getEventPhotos(slug)
  const firstPhoto = photos[0]

  const descriptionParts = [
    event.ingress,
    '',
    `📅 ${eventDate}`,
    `🕐 ${eventTime}`,
    `📍 ${event.location}`,
    '',
  ]

  if (event.stats?.feedback?.averageRating) {
    const stars = '⭐'.repeat(Math.round(event.stats.feedback.averageRating))
    descriptionParts.push(
      `${stars} ${event.stats.feedback.averageRating.toFixed(1)}/5 (${event.stats.feedback.respondents} vurderinger)`
    )
    descriptionParts.push('')
  }

  if (talks) {
    descriptionParts.push(`Agenda:\n${talks}`)
    descriptionParts.push('')
  }

  if (speakers.length > 0) {
    descriptionParts.push(`Foredragsholdere: ${speakers.join(', ')}`)
  }

  const enhancedDescription = descriptionParts.filter(Boolean).join('\n')

  const ogImage = firstPhoto
    ? urlForImage(firstPhoto.image).width(1200).height(630).url()
    : undefined

  return {
    title: event.title,
    description: event.ingress,
    openGraph: {
      title: event.title,
      description: enhancedDescription,
      type: 'website',
      locale: 'nb_NO',
      siteName: 'Offentlig PaaS',
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: firstPhoto?.caption || event.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: enhancedDescription,
      ...(ogImage && {
        images: [ogImage],
      }),
    },
  }
}

async function EventPhotos({ slug }: { slug: string }) {
  const photos = await getEventPhotos(slug)
  const heroPhotos = photos.slice(0, 4)

  if (heroPhotos.length === 0) {
    return null
  }

  return <EventHeroGallery photos={heroPhotos} />
}

async function AdditionalPhotos({ slug }: { slug: string }) {
  const photos = await getEventPhotos(slug)

  if (photos.length <= 4) {
    return null
  }

  const additionalPhotos = photos.slice(4)
  return <EventAdditionalPhotosGallery photos={additionalPhotos} />
}

async function EventAgendaSection({
  event,
  slug,
  hasAdminAccess,
}: {
  event: ReturnType<typeof getEvent>
  slug: string
  hasAdminAccess: boolean
}) {
  if (!event) return null

  const [attachments, slackUserData] = await Promise.all([
    getAllEventAttachments(slug),
    batchFetchSlackUsers(extractEventUserIds(event)),
  ])

  return (
    <EventAgenda
      schedule={event.schedule}
      attachments={attachments}
      hasAdminAccess={hasAdminAccess}
      eventSlug={slug}
      slackUserData={slackUserData}
    />
  )
}

export default async function Fagdag({ params }: { params: Params }) {
  const { slug } = await params
  const event = getEvent(slug)
  if (!event) {
    return (
      <SimpleLayout
        title="Fagdag ikke funnet"
        intro="Fagdagen du leter etter finnes ikke."
        backButton={{
          href: '/fagdag',
          label: 'Tilbake til fagdager',
        }}
      />
    )
  }

  const session = await auth()
  const hasAdminAccess = session?.user
    ? canUserAccessEvent(event, session.user)
    : false

  const organizerUserIds = event.organizers
    .map(org => (org.url ? extractSlackUserId(org.url) : null))
    .filter((id): id is string => id !== null)
  const organizerSlackData = await batchFetchSlackUsers(organizerUserIds)

  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host')

  const url = `${protocol}://${host}/fagdag/${slug}`

  return (
    <EventRegistrationProvider eventSlug={slug}>
      <Container className="mt-16 lg:mt-32">
        <div className="xl:relative">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/fagdag"
                  className="group flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
                  aria-label="Tilbake til fagdager"
                >
                  <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
                </Link>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                  {event.title}
                </h1>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  href="https://github.com/offentlig-paas/nye.offentlig-paas.no/edit/main/src/data/events.ts"
                  target="_blank"
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Rediger</span>
                </Button>
                {hasAdminAccess && (
                  <Button
                    href={`/admin/events/${slug}`}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <CogIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Photo Gallery */}
        <Suspense fallback={<EventPhotoSkeleton variant="hero" />}>
          <EventPhotos slug={slug} />
        </Suspense>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl py-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Description + Agenda (2/3 width) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Description */}
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
                <div className="px-6 py-6">
                  <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
                    Beskrivelse
                  </h2>
                  <div className="space-y-6">
                    <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
                      {event.ingress}
                    </p>
                    {event.description && (
                      <p className="leading-7 text-gray-700 dark:text-gray-300">
                        {event.description.split('\n').map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                      </p>
                    )}
                  </div>

                  {isCallForPapersOpen(event) && (
                    <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                      <div className="flex items-start">
                        <PresentationChartLineIcon
                          className="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400"
                          aria-hidden="true"
                        />
                        <div>
                          <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">
                            Call for Papers er åpen
                          </h3>
                          <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                            Vi tar imot forslag til presentasjoner for denne
                            fagdagen. Del din kunnskap og erfaring med
                            fellesskapet!
                          </p>
                          {event.callForPapersClosedDate && (
                            <p className="mt-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                              Frist:{' '}
                              {formatDateTime(event.callForPapersClosedDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {event.socialEvent && (
                    <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/20">
                      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-teal-900 dark:text-teal-100">
                        <CheckBadgeIcon
                          className="h-5 w-5 text-teal-600 dark:text-teal-400"
                          aria-hidden="true"
                        />
                        Sosialt arrangement etter fagdagen
                      </h3>
                      <p className="mb-3 text-sm text-teal-700 dark:text-teal-300">
                        {event.socialEvent.description}
                      </p>
                      <div className="space-y-1 text-sm text-teal-600 dark:text-teal-400">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{event.socialEvent.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {formatDateLong(event.socialEvent.start)} kl.{' '}
                            {formatTime(event.socialEvent.start)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Photos */}
              <Suspense fallback={null}>
                <AdditionalPhotos slug={slug} />
              </Suspense>

              {/* Agenda */}
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
                <div className="px-6 py-6">
                  <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
                    Agenda
                  </h2>
                  <Suspense fallback={<EventAgendaSkeleton />}>
                    <EventAgendaSection
                      event={event}
                      slug={slug}
                      hasAdminAccess={hasAdminAccess}
                    />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* Right Column: Event Summary + Registration + Sidebar (1/3 width) */}
            <div className="space-y-6">
              <h2 className="sr-only">Oppsummering</h2>
              <EventSummary event={event} status={getStatus(event)} />

              {/* Registration */}
              {getStatus(event) !== Status.Past && (
                <EventRegistrationPanel
                  event={event}
                  eventSlug={slug}
                  eventUrl={url}
                  isAcceptingRegistrations={isAcceptingRegistrations(event)}
                  isCallForPapersOpen={isCallForPapersOpen(event)}
                />
              )}

              {/* Feedback & Reviews */}
              {!isAcceptingRegistrations(event) ? (
                <EventFeedbackSummaryWrapper
                  eventSlug={slug}
                  variant="reviews"
                />
              ) : (
                <EventFeedbackPrompt
                  event={event}
                  eventStatus={getStatus(event)}
                />
              )}

              {/* Organizers */}
              <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                  <UserGroupIcon
                    className="h-5 w-5 text-gray-600 dark:text-gray-400"
                    aria-hidden="true"
                  />
                  Arrangører
                </h2>
                <ul className="space-y-4">
                  {event.organizers.map(organizer => {
                    const userId = organizer.url
                      ? extractSlackUserId(organizer.url)
                      : null
                    const userData = userId
                      ? organizerSlackData.get(userId)
                      : undefined

                    return (
                      <li key={organizer.name} className="flex gap-x-3">
                        <BatchedServerAvatar
                          name={organizer.name}
                          slackUserId={userId || undefined}
                          userData={userData}
                          size="md"
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                        <div className="flex-auto">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            <a
                              href={organizer.url}
                              className="transition hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {organizer.name}
                            </a>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {organizer.org}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Stats */}
              {event.stats && (
                <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                    <ChartBarIcon
                      className="h-5 w-5 text-gray-600 dark:text-gray-400"
                      aria-hidden="true"
                    />
                    Etter arrangementet
                  </h2>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Deltakere
                      </dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {event.stats.participants}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Organisasjoner
                      </dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {event.stats.organisations}
                      </dd>
                    </div>
                    {event.stats.feedback && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Gjennomsnittlig vurdering
                        </dt>
                        <dd className="mt-1">
                          <Rating
                            rating={event.stats.feedback?.averageRating ?? 0}
                            total={event.stats.feedback?.respondents ?? 0}
                          />
                        </dd>
                      </div>
                    )}
                    {event.stats.feedback &&
                      event.stats.feedback?.comments.length > 0 && (
                        <div>
                          <dt className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Tilbakemeldinger
                          </dt>
                          <dd className="space-y-2">
                            {event.stats.feedback?.comments.map(
                              (feedback, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 rounded-lg bg-white/50 p-3 dark:bg-gray-900/30"
                                >
                                  <ChatBubbleBottomCenterIcon
                                    className="mt-0.5 h-4 w-4 flex-none text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    &quot;{feedback}&quot;
                                  </span>
                                </div>
                              )
                            )}
                          </dd>
                        </div>
                      )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </EventRegistrationProvider>
  )
}
