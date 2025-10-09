import { auth } from '@/auth'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { events } from '@/data/events'
import { eventRegistrationService } from '@/domains/event-registration'
import { DeleteAccountButton } from '@/components/DeleteAccountButton'
import { Status, ItemType } from '@/lib/events/types'
import {
  getStatus,
  isUserEventOrganizer,
  getAttachmentIcon,
} from '@/lib/events/helpers'
import { formatDateLong } from '@/lib/formatDate'
import type { EventRegistration } from '@/domains/event-registration/types'
import type { Event } from '@/lib/events/types'
import {
  CalendarIcon,
  MapPinIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/20/solid'

const TALK_TYPES = [ItemType.Talk, ItemType.Panel, ItemType.Workshop] as const

function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut()
      }}
    >
      <Button type="submit" variant="secondary">
        Logg ut
      </Button>
    </form>
  )
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/profil')
  }

  const user = session.user

  const userRegistrations = user.slackId
    ? await eventRegistrationService.getUserRegistrations(user.slackId)
    : []

  const upcomingRegistrationsByEvent = new Map(
    userRegistrations
      .filter((r: EventRegistration) => r.status === 'confirmed')
      .map((r: EventRegistration) => [r.eventSlug, r])
  )

  const upcomingEvents = events
    .filter(event => {
      const status = getStatus(event)
      return (
        (status === Status.Upcoming || status === Status.Current) &&
        upcomingRegistrationsByEvent.has(event.slug)
      )
    })
    .map(event => ({
      event,
      registration: upcomingRegistrationsByEvent.get(event.slug)!,
    }))
    .sort((a, b) => a.event.start.getTime() - b.event.start.getTime())

  const allRegistrationsByEvent = new Map(
    userRegistrations.map((r: EventRegistration) => [r.eventSlug, r])
  )

  const pastEvents = events
    .filter(event => {
      const status = getStatus(event)
      return status === Status.Past && allRegistrationsByEvent.has(event.slug)
    })
    .map(event => ({
      event,
      registration: allRegistrationsByEvent.get(event.slug)!,
    }))
    .sort((a, b) => b.event.start.getTime() - a.event.start.getTime())

  const organizedEvents = user.slackId
    ? events
        .filter(event => isUserEventOrganizer(event, user.slackId!))
        .sort((a, b) => b.start.getTime() - a.start.getTime())
    : []

  const userTalks = user.slackId
    ? events
        .map(event => {
          const speakerTalks = event.schedule
            .filter(
              item =>
                (TALK_TYPES as readonly ItemType[]).includes(item.type) &&
                item.speakers?.some(
                  speaker =>
                    speaker.url && speaker.url.includes(`/team/${user.slackId}`)
                )
            )
            .map(item => ({
              event,
              talk: item,
            }))
          return speakerTalks
        })
        .flat()
        .sort((a, b) => b.event.start.getTime() - a.event.start.getTime())
    : []

  return (
    <Container className="mt-16 sm:mt-24">
      <div className="max-w-7xl">
        <div className="flex items-center gap-6 pb-8">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name || 'Bruker'}
              width={120}
              height={120}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
              {user.name}
            </h1>
            {user.email && (
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                {user.email}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {user.isAdmin && (
                <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-red-600/10 ring-inset dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20">
                  Administrator
                </span>
              )}
              {user.adminGroups &&
                user.adminGroups.length > 0 &&
                user.adminGroups.map(group => (
                  <span
                    key={group}
                    className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30"
                  >
                    @{group}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <section>
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                Mine kommende påmeldinger
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {upcomingEvents.map(item => (
                    <div
                      key={item.event.slug}
                      className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <Link
                        href={`/fagdag/${item.event.slug}`}
                        className="text-lg font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
                      >
                        {item.event.title}
                      </Link>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDateLong(item.event.start)}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                          <MapPinIcon className="h-4 w-4" />
                          {item.event.location}
                        </div>
                      </div>
                      {item.registration.comments && (
                        <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                          <p className="font-medium">Din kommentar:</p>
                          <p className="mt-1">{item.registration.comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  Ingen kommende påmeldinger
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                Mine arrangerte fagdager
              </h2>
              {organizedEvents.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {organizedEvents.map((event: Event) => (
                    <Link
                      key={event.slug}
                      href={`/fagdag/${event.slug}`}
                      className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                    >
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {event.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDateLong(event.start)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {event.location}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  Ingen arrangerte fagdager
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                Mine foredrag
              </h2>
              {userTalks.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {userTalks.map((item, idx) => (
                    <div
                      key={`${item.event.slug}-${idx}`}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="flex items-start gap-3">
                        <PresentationChartLineIcon className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.talk.title}
                          </h3>
                          <Link
                            href={`/fagdag/${item.event.slug}`}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {item.event.title}
                          </Link>
                          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {formatDateLong(item.event.start)} •{' '}
                            {item.talk.time}
                          </p>
                          {item.talk.description && (
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                              {item.talk.description}
                            </p>
                          )}
                          {item.talk.attachments &&
                            item.talk.attachments.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.talk.attachments.map((attachment, i) => {
                                  const Icon = getAttachmentIcon(
                                    attachment.type
                                  )
                                  return (
                                    <a
                                      key={i}
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                                    >
                                      <Icon className="h-3 w-3" />
                                      {attachment.title || attachment.type}
                                    </a>
                                  )
                                })}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  Ingen registrerte foredrag
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                Mine tidligere påmeldinger
              </h2>
              {pastEvents.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {pastEvents.map(item => (
                    <Link
                      key={item.event.slug}
                      href={`/fagdag/${item.event.slug}`}
                      className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.event.title}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {item.registration.status === 'attended' && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Deltok
                            </span>
                          )}
                          {item.registration.status === 'confirmed' && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Påmeldt
                            </span>
                          )}
                          {item.registration.status === 'no-show' && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              Møtte ikke
                            </span>
                          )}
                          {item.registration.status === 'cancelled' && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                              Avmeldt
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDateLong(item.event.start)} •{' '}
                        {item.event.location}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  Ingen tidligere påmeldinger
                </p>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                Profildetaljer
              </h3>
              <dl className="mt-6 space-y-4">
                {user.title && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Stilling
                    </dt>
                    <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
                      {user.title}
                    </dd>
                  </div>
                )}

                {user.statusText && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Status
                    </dt>
                    <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
                      {user.statusText}
                    </dd>
                  </div>
                )}

                {user.department && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Avdeling
                    </dt>
                    <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
                      {user.department}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Slack ID
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">
                    {user.slackId}
                  </dd>
                </div>
              </dl>

              {user.slackProfile && (
                <>
                  <h3 className="mt-8 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                    Slack-profil
                  </h3>
                  <dl className="mt-6 space-y-4">
                    {user.slackProfile?.display_name &&
                    typeof user.slackProfile.display_name === 'string' ? (
                      <div>
                        <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          Visningsnavn
                        </dt>
                        <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
                          {user.slackProfile.display_name as string}
                        </dd>
                      </div>
                    ) : null}

                    {user.slackProfile?.pronouns &&
                    typeof user.slackProfile.pronouns === 'string' ? (
                      <div>
                        <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          Pronomen
                        </dt>
                        <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
                          {user.slackProfile.pronouns as string}
                        </dd>
                      </div>
                    ) : null}

                    {user.slackProfile?.phone &&
                    typeof user.slackProfile.phone === 'string' ? (
                      <div>
                        <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          Telefon
                        </dt>
                        <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
                          {user.slackProfile.phone as string}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </>
              )}

              <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-700/40">
                <SignOutButton />
              </div>
            </div>

            <div className="mt-8">
              <DeleteAccountButton />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
