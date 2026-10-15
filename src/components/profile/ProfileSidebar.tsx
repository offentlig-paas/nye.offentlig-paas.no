import Link from 'next/link'
import { PencilSquareIcon, ServerStackIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/Button'
import { DeleteAccountButton } from '@/components/DeleteAccountButton'
import { signOut } from '@/auth'
import type { Session } from 'next-auth'

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

interface ProfileSidebarProps {
  user: NonNullable<Session['user']>
  organization?: {
    slug: string
    name: string
    platformName?: string
    visibility?: 'public' | 'internal'
  }
}

export function ProfileSidebar({ user, organization }: ProfileSidebarProps) {
  return (
    <div className="lg:col-span-1">
      {organization && (
        <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/40 p-6 dark:border-teal-800/60 dark:bg-teal-950/20">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-teal-700 uppercase dark:text-teal-300">
            <ServerStackIcon className="h-4 w-4" />
            Din virksomhet
          </div>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {organization.name}
          </h3>
          {organization.platformName ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Plattform: <strong>{organization.platformName}</strong> (
              {organization.visibility === 'internal'
                ? 'Kun for medlemmer'
                : 'Offentlig'}
              )
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Ingen plattformprofil publisert ennå. Du kan opprette en offentlig
              eller intern profil for {organization.name}.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {organization.platformName && (
              <Link
                href={`/medlemmer/${organization.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700"
              >
                Se plattformprofil
              </Link>
            )}
            <Link
              href={`/medlemmer/${organization.slug}?edit=1`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-500"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              {organization.platformName
                ? 'Rediger plattform'
                : 'Opprett plattformprofil'}
            </Link>
          </div>
        </div>
      )}

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
  )
}
