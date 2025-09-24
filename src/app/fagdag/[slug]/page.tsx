import { type Metadata } from 'next'
import { headers } from 'next/headers'
import React from 'react'

import { SimpleLayout } from '@/components/SimpleLayout'
import { EventRegistration } from '@/components/EventRegistration'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Rating } from '@/components/Rating'
import { Avatar } from '@/components/Avatar'
import {
  getEvent,
  getStatus,
  isAcceptingRegistrations,
  isCallForPapersOpen,
  canUserAccessEvent,
} from '@/lib/events/helpers'
import { formatDateTime } from '@/lib/formatDate'
import { auth } from '@/auth'
import type { Attachment, Event } from '@/lib/events/types'
import {
  AttachmentType,
  ItemType,
  Status,
  AttendanceTypeDisplay,
} from '@/lib/events/types'
import {
  CalendarDaysIcon,
  MapPinIcon,
  BanknotesIcon,
  UserGroupIcon,
  UsersIcon,
  CalendarIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  PresentationChartLineIcon,
  Battery50Icon,
  ChatBubbleBottomCenterIcon,
  VideoCameraIcon,
  PaperClipIcon,
  CogIcon,
} from '@heroicons/react/20/solid'

function EventIcon({
  type,
  className,
}: {
  type: ItemType
  className?: string
}) {
  switch (type) {
    case ItemType.Panel:
      return <UsersIcon className={className} aria-hidden="true" />
    case ItemType.Talk:
      return (
        <PresentationChartLineIcon className={className} aria-hidden="true" />
      )
    case ItemType.Break:
      return <Battery50Icon className={className} aria-hidden="true" />
    default:
      return <InformationCircleIcon className={className} aria-hidden="true" />
  }
}

function EventStatus({ status }: { status: Status }) {
  const statusClass = (status: Status) => {
    switch (status) {
      case Status.Upcoming:
        return 'bg-blue-50 text-blue-600 ring-blue-600/20 dark:bg-blue-950/20 dark:text-blue-400 dark:ring-blue-400/20'
      case Status.Past:
        return 'bg-gray-50 text-gray-600 ring-gray-600/20 dark:bg-gray-800/50 dark:text-gray-400 dark:ring-gray-400/20'
      case Status.Current:
        return 'bg-yellow-50 text-yellow-600 ring-yellow-600/20 dark:bg-yellow-950/20 dark:text-yellow-400 dark:ring-yellow-400/20'
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-600/20 dark:bg-gray-800/50 dark:text-gray-400 dark:ring-gray-400/20'
    }
  }

  const statusText = (status: Status) => {
    switch (status) {
      case Status.Upcoming:
        return 'Kommende'
      case Status.Past:
        return 'Tidligere'
      case Status.Current:
        return 'Pågående'
      default:
        return 'Ukjent'
    }
  }

  return (
    <dd
      className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}
    >
      {statusText(status)}
    </dd>
  )
}

function getGoogleCalendarUrl(event: Event) {
  const startTime = calenderDateTime(event.start)
  const endTime = calenderDateTime(event.end)
  const details = {
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startTime}/${endTime}`,
    details: event.description || '',
    location: event.location,
  }
  const params = new URLSearchParams(details)
  return `https://www.google.com/calendar/render?${params.toString()}`
}

function calenderDateTime(date: Date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '')
}

function getIcsFileContent(event: Event, url: string) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${event.slug}`,
    `DTSTAMP:${calenderDateTime(new Date())}`,
    `DTSTART:${calenderDateTime(event.start)}`,
    `DTEND:${calenderDateTime(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')
}

function AttachmentIcon({
  type,
  className,
}: {
  type: AttachmentType
  className?: string
}) {
  switch (type) {
    case AttachmentType.Recording:
      return <VideoCameraIcon className={className} aria-hidden="true" />
    case AttachmentType.Slides:
      return (
        <PresentationChartLineIcon className={className} aria-hidden="true" />
      )
    case AttachmentType.Link:
      return <PaperClipIcon className={className} aria-hidden="true" />
    default:
      return <PaperClipIcon className={className} aria-hidden="true" />
  }
}

function AttachmentLink({
  attachment,
  className,
}: {
  attachment: Attachment
  className?: string
}) {
  return (
    <a href={attachment.url} className={className}>
      {(() => {
        const hostname = new URL(attachment.url).hostname
        switch (attachment.type) {
          case AttachmentType.Recording:
            return `Se opptak (${hostname})`
          case AttachmentType.Slides:
            return attachment.title || `Se slides (${hostname})`
          case AttachmentType.Link:
            return attachment.title || `Lenke (${hostname})`
          default:
            return attachment.title || `Vedlegg (${attachment.type})`
        }
      })()}
    </a>
  )
}

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

  return {
    title: event.title,
    description: event.ingress,
  }
}

export default async function Fagdag({ params }: { params: Params }) {
  const { slug } = await params
  const event = getEvent(slug)
  if (!event) {
    return (
      <SimpleLayout
        title="Fagdag ikke funnet"
        intro="Fagdagen du leter etter finnes ikke."
      />
    )
  }

  // Check if user has admin access to this event
  const session = await auth()
  const hasAdminAccess = session?.user
    ? canUserAccessEvent(event, session.user)
    : false

  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host')

  const url = `${protocol}://${host}/fagdag/${slug}`

  const googleCalendarUrl = getGoogleCalendarUrl(event)
  const icsFileContent = getIcsFileContent(event, url)
  const icsFileUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsFileContent)}`

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
              {event.title}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                href="https://github.com/offentlig-paas/nye.offentlig-paas.no/edit/main/src/data/events.ts"
                target="_blank"
                variant="secondary"
                className="mt-1 flex items-center gap-2"
              >
                <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                Rediger
              </Button>
              {hasAdminAccess && (
                <Button
                  href={`/admin/events/${slug}`}
                  variant="secondary"
                  className="mt-1 flex items-center gap-2"
                >
                  <CogIcon className="h-4 w-4" aria-hidden="true" />
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl py-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Event summary */}
          <div className="lg:col-start-3 lg:row-end-1">
            <h2 className="sr-only">Oppsummering</h2>
            <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5 dark:bg-transparent dark:ring-gray-400/5">
              <dl className="flex flex-wrap">
                <div className="flex-auto pt-6 pl-6">
                  <dd className="text-base leading-6 font-semibold text-gray-900 dark:text-gray-100">
                    Fagdag
                  </dd>
                </div>
                <div className="flex-none self-start px-6 pt-6">
                  <dt className="sr-only">Status</dt>
                  <EventStatus status={getStatus(event)} />
                </div>
                <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6 dark:border-gray-400/5">
                  <dt className="flex-none">
                    <span className="sr-only">Lokasjon</span>
                    <MapPinIcon
                      className="h-6 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm leading-6 font-medium">
                    {event.location}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Start</span>
                    <CalendarDaysIcon
                      className="h-6 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                    <ul>
                      <li>
                        <time dateTime={event.start.toISOString()}>
                          {formatDateTime(event.start)}
                        </time>
                      </li>
                      <li>
                        <time dateTime={event.end.toISOString()}>
                          {formatDateTime(event.end)}
                        </time>
                      </li>
                    </ul>
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Deltakere</span>
                    <UserGroupIcon
                      className="h-6 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {event.audience}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Deltakelse</span>
                    <UsersIcon
                      className="h-6 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {event.registration.attendanceTypes
                      .map(type => AttendanceTypeDisplay[type])
                      .join(', ')}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Pris</span>
                    <BanknotesIcon
                      className="h-6 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {event.price ?? 'Ingen deltakeravgift'}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-gray-900/5 px-6 py-6 dark:border-gray-400/5">
                {isAcceptingRegistrations(event) ? (
                  <>
                    <EventRegistration
                      eventSlug={slug}
                      eventTitle={event.title}
                      isAcceptingRegistrations={true}
                      attendanceTypes={event.registration.attendanceTypes}
                    />
                    {event.registrationUrl && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                          Eller bruk ekstern påmelding:
                        </p>
                        <Button
                          href={event.registrationUrl}
                          variant="secondary"
                          className="w-full"
                        >
                          Ekstern registrering
                        </Button>
                      </div>
                    )}
                    {isCallForPapersOpen(event) && (
                      <Button
                        href={event.callForPapersUrl}
                        variant="secondary"
                        className="group mt-4 w-full"
                      >
                        <PresentationChartLineIcon
                          className="mr-1 h-4 w-4"
                          aria-hidden="true"
                        />
                        Send inn forslag
                      </Button>
                    )}
                    <div className="mt-4 flex flex-col gap-4">
                      <Button
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary"
                        className="w-full"
                      >
                        <CalendarIcon
                          className="mr-2 h-6 w-6"
                          aria-hidden="true"
                        />
                        Legg til i Google Kalender
                      </Button>
                      <Button
                        href={icsFileUrl}
                        download={`${event.slug}.ics`}
                        variant="secondary"
                        className="w-full"
                      >
                        <CalendarIcon
                          className="mr-2 h-6 w-6"
                          aria-hidden="true"
                        />
                        Legg til i kalender (.ics)
                      </Button>
                    </div>
                  </>
                ) : event.recordingUrl ? (
                  <Button
                    href={event.recordingUrl}
                    variant="secondary"
                    className="w-full"
                  >
                    <VideoCameraIcon
                      className="mr-1 h-4 w-4"
                      aria-hidden="true"
                    />
                    Se opptak
                  </Button>
                ) : (
                  <EventRegistration
                    eventSlug={slug}
                    eventTitle={event.title}
                    isAcceptingRegistrations={false}
                    attendanceTypes={event.registration.attendanceTypes}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Organizers */}
          <div className="lg:col-start-3">
            <div className="rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700/50">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
                Arrangører
              </h2>
              <ul className="space-y-4">
                {event.organizers.map(organizer => (
                  <li key={organizer.name} className="flex gap-x-3">
                    <Avatar
                      name={organizer.name}
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
                ))}
              </ul>
            </div>
          </div>

          {event.stats && (
            <div className="lg:col-start-3">
              <div className="rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700/50">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <svg
                    className="h-5 w-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-5.5m5.5 0v1.5a1.5 1.5 0 01-1.5 1.5h-1.5a1.5 1.5 0 01-1.5-1.5v-1.5m0-5.5v-2.25"
                    />
                  </svg>
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
            </div>
          )}

          {/* Event details */}
          <div className="-mx-4 px-6 py-6 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg lg:col-span-2 lg:row-span-2 lg:row-end-2 dark:ring-gray-400/5">
            <h2 className="mb-4 text-base leading-6 font-semibold">
              Beskrivelse
            </h2>
            <p className="leading-6 text-gray-500 dark:text-gray-400">
              {event.ingress}
            </p>
            {event.description && (
              <p className="mt-4 leading-6 text-gray-500 dark:text-gray-400">
                {event.description.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            )}
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
                      Vi tar imot forslag til presentasjoner for denne fagdagen.
                      Del din kunnskap og erfaring med fellesskapet!
                    </p>
                    {event.callForPapersClosedDate && (
                      <p className="mt-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                        Frist:{' '}
                        {event.callForPapersClosedDate.toLocaleDateString(
                          'nb-NO',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <h2 className="mt-8 text-base leading-6 font-semibold">Agenda</h2>
            {event.schedule.length > 0 ? (
              <ol className="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 dark:divide-gray-800">
                {event.schedule.map(item => (
                  <li
                    key={item.time}
                    className="relative flex space-x-6 py-6 xl:static"
                  >
                    <EventIcon
                      type={item.type}
                      className="h-8 w-8 flex-none text-gray-400"
                    />

                    <div className="flex-auto">
                      <h3 className="pr-10 font-semibold xl:pr-0">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                      <dl className="mt-2 flex flex-col xl:flex-row">
                        <div className="flex items-start space-x-3">
                          <dt className="mt-0.5">
                            <span className="sr-only">Tidspunkt</span>
                            <CalendarIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </dt>
                          <dd>
                            <time dateTime={item.time}>{item.time}</time>
                          </dd>
                        </div>
                        {item.speaker && (
                          <div className="xl:border-opacity-50 mt-2 flex items-start space-x-3 xl:mt-0 xl:ml-3.5 xl:border-l xl:border-gray-400 xl:pl-3.5">
                            <dt className="mt-0.5">
                              <span className="sr-only">Type</span>
                              <UsersIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </dt>
                            <dd>{item.speaker}</dd>
                          </div>
                        )}
                      </dl>
                      {item.attachments && item.attachments.length > 0 && (
                        <dl className="mt-4 flex flex-col space-y-2">
                          {item.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <dt className="mt-0.5">
                                {AttachmentIcon({
                                  type: attachment.type,
                                  className: 'h-5 w-5 text-gray-400',
                                })}
                              </dt>
                              <dd>
                                {AttachmentLink({
                                  attachment,
                                  className:
                                    'text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300',
                                })}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <CalendarIcon
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Agenda kommer snart
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Vi jobber med å lage programmet for denne fagdagen.
                  {getStatus(event) === Status.Upcoming &&
                    ' Følg med for oppdateringer!'}
                </p>
                {hasAdminAccess && (
                  <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    Som arrangør kan du administrere dette arrangementet via
                    admin-panelet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
