import React from 'react'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'
import { EventThumbnailGallery } from '@/components/EventThumbnailGallery'
import { getAllEvents } from '@/lib/events/helpers'
import {
  getEventPhotos,
  prepareEventThumbnailUrls,
} from '@/lib/sanity/event-photos'
import { formatDate } from '@/lib/formatDate'

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

interface EventCardProps {
  title: string
  description: string
  date: string
  cta: string
  href: string
  thumbnailUrls?: string[]
}

function EventCard({
  title,
  description,
  date,
  cta,
  href,
  thumbnailUrls,
}: EventCardProps) {
  return (
    <Card as="article">
      <EventThumbnailGallery photos={thumbnailUrls ?? []} title={title} />
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Eyebrow decorate>{date}</Card.Eyebrow>
      <Card.Description>{description}</Card.Description>
      {cta && <Card.Cta>{cta}</Card.Cta>}
    </Card>
  )
}

export const metadata: Metadata = {
  title: 'Fagdager',
  description:
    'Fagdager er Offentlig PaaS nettverket sin helt egen dag hvor vi inviterer til faglig påfyll, erfaringsdeling og nettverksbygging.',
}

export default async function Fagdager() {
  const events = getAllEvents()

  const eventsWithPhotos = await Promise.all(
    events.map(async event => {
      const photos = await getEventPhotos(event.slug)
      const thumbnailUrls =
        photos.length > 0 ? prepareEventThumbnailUrls(photos) : undefined

      return {
        event,
        thumbnailUrls,
      }
    })
  )

  return (
    <SimpleLayout
      title="Offentlig PaaS Fagdager"
      intro="Fagdager er Offentlig PaaS nettverket sin helt egen dag hvor vi inviterer til faglig påfyll, erfaringsdeling og nettverksbygging. Her finner du en oversikt over neste og tidligere arrangementer. Denne siden er fortsatt under utvikling og vi jobber med å lage en enda bedre oversikt over kommende fagdager."
    >
      <div className="space-y-20">
        <SpeakingSection title="Fagdager">
          {eventsWithPhotos.map(({ event, thumbnailUrls }) => (
            <EventCard
              key={event.slug}
              href={`/fagdag/${event.slug}`}
              title={event.title}
              description={event.ingress}
              date={formatDate(event.start)}
              cta="Mer informasjon"
              thumbnailUrls={thumbnailUrls}
            />
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
