import React from 'react'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'
import { getAllEvents } from '@/lib/events/helpers'
import { getEventPhotos, urlForImage } from '@/lib/sanity/event-photos'
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

function Appearance({
  title,
  description,
  date,
  cta,
  href,
  heroPhotos,
}: {
  title: string
  description: string
  date: string
  cta: string
  href: string
  heroPhotos?: string[]
}) {
  return (
    <Card as="article">
      {heroPhotos && heroPhotos.length >= 4 && (
        <div className="relative z-10 mb-4 w-full">
          <div className="grid grid-cols-3 gap-2">
            <Image
              src={heroPhotos[0]!}
              alt={title}
              width={400}
              height={600}
              unoptimized
              className="row-span-2 aspect-[3/4] size-full rounded-lg object-cover"
            />
            <Image
              src={heroPhotos[1]!}
              alt={title}
              width={400}
              height={300}
              unoptimized
              className="col-start-2 aspect-[3/2] size-full rounded-lg object-cover"
            />
            <Image
              src={heroPhotos[2]!}
              alt={title}
              width={400}
              height={300}
              unoptimized
              className="col-start-2 row-start-2 aspect-[3/2] size-full rounded-lg object-cover"
            />
            <Image
              src={heroPhotos[3]!}
              alt={title}
              width={400}
              height={600}
              unoptimized
              className="row-span-2 aspect-[3/4] size-full rounded-lg object-cover"
            />
          </div>
        </div>
      )}
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

  // Fetch hero photos (first 4) for all events
  const eventsWithPhotos = await Promise.all(
    events.map(async event => {
      const photos = await getEventPhotos(event.slug)
      const heroPhotos =
        photos.length >= 4
          ? photos.slice(0, 4).map(photo =>
              urlForImage(photo.image)
                .width(800)
                .height(photo === photos[0] || photo === photos[3] ? 1200 : 600)
                .url()
            )
          : undefined

      return {
        event,
        heroPhotos,
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
          {eventsWithPhotos.map(({ event, heroPhotos }) => (
            <Appearance
              key={event.slug}
              href={`/fagdag/${event.slug}`}
              title={event.title}
              description={event.ingress}
              date={formatDate(event.start)}
              cta="Mer informasjon"
              heroPhotos={heroPhotos}
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
