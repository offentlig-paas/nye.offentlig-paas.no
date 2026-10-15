import React, { Suspense } from 'react'
import { type Metadata } from 'next'
import { cacheLife } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'
import { EventThumbnailGallery } from '@/components/EventThumbnailGallery'
import { getAllEvents, getStatus } from '@/lib/events/helpers'
import {
  getEventPhotos,
  prepareEventThumbnailUrls,
} from '@/lib/sanity/event-photos'
import { formatDate } from '@/lib/formatDate'
import { Status, type Event } from '@/lib/events/types'

import rssLogo from '@/images/rss.svg'
import calendarIcon from '@/images/calendar.png'

function SpeakingSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <div className="space-y-16">{children}</div>
    </Section>
  )
}

function EventCardShell({
  title,
  description,
  date,
  cta,
  href,
  children,
}: {
  title: string
  description: string
  date: string
  cta: string
  href: string
  children?: React.ReactNode
}) {
  return (
    <Card as="article">
      {children}
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Eyebrow decorate>{date}</Card.Eyebrow>
      <Card.Description>{description}</Card.Description>
      {cta && <Card.Cta>{cta}</Card.Cta>}
    </Card>
  )
}

async function EventCardPhotos({ event }: { event: Event }) {
  const photos = await getEventPhotos(event.slug)
  const thumbnailUrls =
    photos.length > 0 ? prepareEventThumbnailUrls(photos) : undefined

  if (thumbnailUrls && thumbnailUrls.length > 0) {
    return <EventThumbnailGallery photos={thumbnailUrls} title={event.title} />
  }

  if (event.bannerImage) {
    return (
      <div className="relative z-10 mb-4 w-full">
        <Image
          src={event.bannerImage.src}
          alt={event.title}
          width={800}
          height={420}
          unoptimized
          className="aspect-40/21 w-full rounded-lg object-cover"
        />
      </div>
    )
  }

  return null
}

function EventCardPhotosFallback({ event }: { event: Event }) {
  if (event.bannerImage) {
    return (
      <div className="relative z-10 mb-4 w-full">
        <Image
          src={event.bannerImage.src}
          alt={event.title}
          width={800}
          height={420}
          unoptimized
          className="aspect-40/21 w-full rounded-lg object-cover"
        />
      </div>
    )
  }
  return null
}

export const metadata: Metadata = {
  title: 'Fagdager',
  description:
    'Fagdager er Offentlig PaaS nettverket sin helt egen dag hvor vi inviterer til faglig påfyll, erfaringsdeling og nettverksbygging.',
}

async function getEventsByStatus() {
  'use cache'
  cacheLife('hours')

  const events = getAllEvents()
  const upcomingEvents = events
    .filter(event => {
      const status = getStatus(event)
      return status === Status.Upcoming || status === Status.Current
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  const pastEvents = events.filter(event => getStatus(event) === Status.Past)

  return { upcomingEvents, pastEvents }
}

export default async function Fagdager() {
  const { upcomingEvents, pastEvents } = await getEventsByStatus()

  return (
    <SimpleLayout
      title="Offentlig PaaS Fagdager"
      intro="Fagdager er Offentlig PaaS-nettverkets egne samlinger for faglig påfyll, erfaringsdeling og nettverksbygging på tvers av offentlig sektor."
    >
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 px-5 py-4 text-sm text-zinc-700 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-300">
        <span>
          Har din virksomhet lyst til å være vertskap eller medarrangør for en
          fagdag?
        </span>
        <Link
          href="/fagdag/arrangere"
          className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Se veiledning for arrangører &rarr;
        </Link>
      </div>

      <div className="space-y-20">
        {upcomingEvents.length > 0 && (
          <SpeakingSection title="Kommende fagdager">
            {upcomingEvents.map(event => (
              <EventCardShell
                key={event.slug}
                href={`/fagdag/${event.slug}`}
                title={event.title}
                description={event.ingress}
                date={`${formatDate(event.start)} • ${event.location}`}
                cta="Påmelding og program"
              >
                <Suspense fallback={<EventCardPhotosFallback event={event} />}>
                  <EventCardPhotos event={event} />
                </Suspense>
              </EventCardShell>
            ))}
          </SpeakingSection>
        )}

        <SpeakingSection title="Tidligere fagdager">
          {pastEvents.map(event => (
            <EventCardShell
              key={event.slug}
              href={`/fagdag/${event.slug}`}
              title={event.title}
              description={event.ingress}
              date={`${formatDate(event.start)} • ${event.location}`}
              cta="Se program og oppsummering"
            >
              <Suspense fallback={<EventCardPhotosFallback event={event} />}>
                <EventCardPhotos event={event} />
              </Suspense>
            </EventCardShell>
          ))}
        </SpeakingSection>
      </div>

      <Link href="/feed.xml?type=events">
        <Image
          src={rssLogo}
          className="float-right mt-8 size-6"
          alt="Events RSS feed"
        />
      </Link>
      <Link href="/events.ics">
        <Image
          src={calendarIcon}
          className="float-right mt-8 mr-5 size-6"
          alt="Events calendar feed"
        />
      </Link>
    </SimpleLayout>
  )
}
