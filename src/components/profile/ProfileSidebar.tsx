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
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  return (
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
  )
}
