import { auth } from '@/auth'
import { SimpleLayout } from '@/components/SimpleLayout'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'

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

  return (
    <SimpleLayout
      title="Min profil"
      intro="Her er informasjonen vi har lagret om deg fra Slack."
    >
      <Container className="mt-16 sm:mt-32">
        <div className="max-w-5xl">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-6 border-b border-zinc-100 pb-8 dark:border-zinc-700/40">
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
              <h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                {user.name}
              </h2>
              {user.email && (
                <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
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

          {/* Two-column layout for profile details */}
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column - Profile Details */}
            <div>
              <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                Profildetaljer
              </h3>
              <dl className="mt-6 space-y-6">
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
                  <dd className="mt-1 font-mono text-base text-zinc-900 dark:text-zinc-100">
                    {user.slackId}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right Column - Additional Slack Profile Info */}
            <div>
              {user.slackProfile && (
                <>
                  <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                    Slack-profil
                  </h3>
                  <dl className="mt-6 space-y-6">
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
            </div>
          </div>

          {/* Actions - Full width at bottom */}
          <div className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
            <SignOutButton />
          </div>
        </div>
      </Container>
    </SimpleLayout>
  )
}
