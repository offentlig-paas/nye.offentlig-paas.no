import { auth, signIn } from '@/auth'
import { Container } from '@/components/Container'
import { SimpleLayout } from '@/components/SimpleLayout'
import { Button } from '@/components/Button'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  const { callbackUrl } = await searchParams

  if (session) {
    redirect(callbackUrl || '/')
  }

  return (
    <SimpleLayout
      title="Logg inn"
      intro="Logg inn med din Slack-konto for å melde deg på fagdager."
    >
      <Container className="mt-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-center">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Velkommen til Offentlig PaaS
              </h2>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Logg inn med din Slack-konto for å melde deg på fagdager og få
                tilgang til medlemsområdet.
              </p>

              <form
                action={async (formData: FormData) => {
                  'use server'
                  const redirectTo = formData.get('callbackUrl') as
                    | string
                    | null
                  await signIn('slack', {
                    redirectTo: redirectTo || undefined,
                  })
                }}
              >
                <input
                  type="hidden"
                  name="callbackUrl"
                  value={callbackUrl || '/'}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="flex w-full items-center justify-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                  </svg>
                  Logg inn med Slack
                </Button>
              </form>

              <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                Ved å logge inn godtar du vår{' '}
                <Link
                  href="/personvern"
                  className="underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  personvernerklæring
                </Link>{' '}
                og{' '}
                <Link
                  href="/vilkar"
                  className="underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  vilkår for bruk
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </Container>
    </SimpleLayout>
  )
}
