import { ResolvingMetadata, type Metadata } from 'next'
import { Event, WithContext } from 'schema-dts'

import { SimpleLayout } from '@/components/SimpleLayout'
import { formatLocation, getEvent, getStatus, isAcceptingRegistrations } from '@/lib/events/helpers'
import { formatDate, formatDateTime } from '@/lib/formatDate'

import {
  CalendarDaysIcon,
  MapPinIcon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarIcon,
  MegaphoneIcon,
  InformationCircleIcon,
  PresentationChartLineIcon,
  Battery0Icon,
  Battery50Icon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import { Container } from '@/components/Container'
import React from 'react'
import { ItemType, Status } from '@/lib/events/types'
import { PresentationChartBarIcon } from '@heroicons/react/16/solid'
import { Button } from '@/components/Button'

function EventIcon({ type, className }: { type: ItemType, className?: string }) {
  switch (type) {
    case ItemType.Talk:
      return <PresentationChartLineIcon className={className} aria-hidden="true" />
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
        return "bg-blue-50 text-blue-600 ring-blue-600/20";
      case Status.Past:
        return "bg-gray-50 text-gray-600 ring-gray-600/20";
      case Status.Current:
        return "bg-yellow-50 text-yellow-600 ring-yellow-600/20";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-600/20";
    }
  };

  const statusText = (status: Status) => {
    switch (status) {
      case Status.Upcoming:
        return "Kommende";
      case Status.Past:
        return "Tidligere";
      case Status.Current:
        return "Pågående";
      default:
        return "Ukjent";
    }
  };

  return (
    <dd className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}>
      {statusText(status)}
    </dd>
  );
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const event = getEvent(params.slug)

  let title = 'Fagdag ikke funnet';
  let description = 'Fagdagen du leter etter finnes ikke.';

  const metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: 'nb_NO',
      siteName: 'Offentlig PaaS',
    },
  };

  if (event) {
    const speakers = [
      ...new Set(
        event.schedule.filter((item) => item.speaker).map((item) => item.speaker),
      ),
    ].join(', ');

    metadata.title = event.title;
    metadata.openGraph.title = `${formatDate(event.start)} - ${event.title}`;
    metadata.description = `${event.ingress} Sted: ${formatLocation(event.location)}. Foredragsholdere: ${speakers}.`;
    metadata.openGraph.description = metadata.description;
  }

  return metadata;
}

export default async function Fagdag({ params }: Props) {
  const event = getEvent(params.slug)

  if (!event) {
    return <SimpleLayout title="Fagdag ikke funnet" intro='Fagdagen du leter etter finnes ikke.' />
  }

  const jsonLd: WithContext<Event> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.title,
    'startDate': event.start.toJSON(),
    'endDate': event.end.toJSON(),
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'eventStatus': 'https://schema.org/EventScheduled',
    'location': {
      '@type': 'Place',
      'name': event.location.name,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': event.location.streetAddress,
        'addressLocality': event.location.city,
        'postalCode': event.location.name,
      }
    },
    'description': event.description,
    'organizer': {
      '@type': 'Person',
      'name': event.organizers[0]?.name,
      'worksFor': {
        '@type': 'Organization',
        'legalName': event.organizers[0]?.org,
      },
    }
  }

  return (
    <Container className="mt-16 lg:mt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
        {event.title}
      </h1>
      <div className="mx-auto max-w-7xl py-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Event summary */}
          <div className="lg:col-start-3 lg:row-end-1">
            <h2 className="sr-only">Oppsummering</h2>
            <div className="rounded-lg bg-gray-50 dark:bg-transparent shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-400/5">
              <dl className="flex flex-wrap">
                <div className="flex-auto pl-6 pt-6">
                  <dd className="text-base font-semibold leading-6">Fagdag</dd>
                </div>
                <div className="flex-none self-end px-6 pt-4">
                  <dt className="sr-only">Status</dt>
                  <EventStatus status={getStatus(event)} />
                </div>
                <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 dark:border-gray-400/5 px-6 pt-6">
                  <dt className="flex-none">
                    <span className="sr-only">Lokasjon</span>
                    <MapPinIcon className="h-6 w-5 text-gray-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-sm font-medium leading-6">{formatLocation(event.location)}</dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Start</span>
                    <CalendarDaysIcon className="h-6 w-5 text-gray-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                    <ul>
                      <li>
                        <time dateTime={event.start.toISOString()}>{formatDateTime(event.start)}</time>
                      </li>
                      <li>
                        <time dateTime={event.end.toISOString()}>{formatDateTime(event.end)}</time>
                      </li>
                    </ul>
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Deltakere</span>
                    <UserGroupIcon className="h-6 w-5 text-gray-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">{event.audience}</dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Pris</span>
                    <BanknotesIcon className="h-6 w-5 text-gray-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500 dark:text-gray-400">{event.price ?? 'Ingen deltakeravgift'}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-gray-900/5 dark:border-gray-400/5 px-6 py-6">
                {isAcceptingRegistrations(event) && event.registrationUrl ? (
                  <Button href={event.registrationUrl} variant="primary" className="group w-full">
                    Registrer deg
                  </Button>
                ) : (
                  <p className="text-sm font-semibold leading-6 text-gray-500 dark:text-gray-400">
                    Registrering er stengt
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Event details */}
          <div className="-mx-4 px-6 py-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-400/5 sm:mx-0 sm:rounded-lg lg:col-span-2 lg:row-span-2 lg:row-end-2">
            <h2 className="text-base font-semibold leading-6 mb-4">Beskrivelse</h2>
            <p className="leading-6 text-gray-500 dark:text-gray-400">{event.ingress}</p>
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
            <h2 className="mt-8 text-base font-semibold leading-6">Agenda</h2>
            <ol className="mt-4 divide-y divide-gray-100 dark:divide-gray-800 text-sm leading-6 lg:col-span-7 xl:col-span-8">
              {event.schedule.map((item) => (
                <li key={item.time} className="relative flex space-x-6 py-6 xl:static">
                  <EventIcon type={item.type} className="h-8 w-8 flex-none text-gray-400" />

                  < div className="flex-auto">
                    <h3 className="pr-10 font-semibold xl:pr-0">{item.title}</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{item.description}</p>
                    <dl className="mt-2 flex flex-col xl:flex-row">
                      <div className="flex items-start space-x-3">
                        <dt className="mt-0.5">
                          <span className="sr-only">Tidspunkt</span>
                          <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd>
                          <time dateTime={item.time}>
                            {item.time}
                          </time>
                        </dd>
                      </div>
                      {item.speaker && (
                        <div className="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5">
                          <dt className="mt-0.5">
                            <span className="sr-only">Type</span>
                            <UsersIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </dt>
                          <dd>{item.speaker}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-start-3">
            {/* Organizers */}
            <h2 className="text-sm font-semibold leading-6">Arrangører</h2>
            <ul className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-1">
              {event.organizers.map((organizer) => (
                <li key={organizer.name} className="flex gap-x-4">
                  <img
                    className="flex-none h-10 w-10 rounded-full bg-gray-100"
                    src={`https://ui-avatars.com/api/?name=${organizer.name}`}
                    alt=""
                  />
                  <div className="flex-auto">
                    <h3 className="text-base font-semibold leading-6">
                      <a href={organizer.url} className="transition hover:text-teal-500 dark:hover:text-teal-400">{organizer.name}</a>
                    </h3>
                    <p className="text-sm leading-6">{organizer.org}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div >
    </Container >
  )
}
