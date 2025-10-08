import { auth } from '@/auth'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { events } from '@/data/events'
import { eventRegistrationService } from '@/domains/event-registration'
import { ProfileEventRegistrations } from '@/components/ProfileEventRegistrations'
import { Status } from '@/lib/events/types'
import { getStatus } from '@/lib/events/helpers'
import type { EventRegistration } from '@/domains/event-registration/types'

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
    redirect('/auth/signin')
  }

  const user = session.user

  const userRegistrations = user.slackId
    ? await eventRegistrationService.getUserRegistrations(user.slackId)
    : []

  const registrationsByEvent = new Map(
    userRegistrations
      .filter(
        (r: EventRegistration) =>
          r.status === 'confirmed' || r.status === 'attended'
      )
      .map((r: EventRegistration) => [r.eventSlug, r])
  )

  const upcomingEvents = events
    .filter(event => {
      const status = getStatus(event)
      return (
        (status === Status.Upcoming || status === Status.Current) &&
        registrationsByEvent.has(event.slug)
      )
    })
    .map(event => ({
      event,
      registration: registrationsByEvent.get(event.slug)!,
    }))

  const pastEvents = events
    .filter(event => {
      const status = getStatus(event)
      return status === Status.Past && registrationsByEvent.has(event.slug)
    })
    .map(event => ({
      event,
      registration: registrationsByEvent.get(event.slug)!,
    }))

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
          <div className="lg:col-span-2">
            <ProfileEventRegistrations
              upcomingEvents={upcomingEvents}
              pastEvents={pastEvents}
            />
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
          </div>
        </div>
      </div>
    </Container>
  )
}
