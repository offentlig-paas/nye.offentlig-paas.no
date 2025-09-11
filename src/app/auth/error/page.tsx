import { Container } from '@/components/Container'
import { SimpleLayout } from '@/components/SimpleLayout'
import { Button } from '@/components/Button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  const getErrorMessage = (error: string | undefined) => {
    switch (error) {
      case 'Configuration':
        return 'Det oppstod en konfigureringsfeil. Kontakt administrator.'
      case 'AccessDenied':
        return 'Tilgang nektet. Du har ikke tilgang til denne tjenesten.'
      case 'Verification':
        return 'Verifiseringsfeil. Prøv å logge inn på nytt.'
      default:
        return 'Det oppstod en uventet feil under pålogging. Prøv på nytt.'
    }
  }

  return (
    <SimpleLayout
      title="Påloggingsfeil"
      intro="Det oppstod en feil under pålogging."
    >
      <Container className="mt-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm dark:border-red-800 dark:bg-red-950/20">
            <div className="text-center">
              <h2 className="mb-4 text-lg font-semibold text-red-900 dark:text-red-100">
                Kunne ikke logge inn
              </h2>
              <p className="mb-6 text-sm text-red-700 dark:text-red-300">
                {getErrorMessage(error)}
              </p>

              <Button href="/auth/signin" variant="primary" className="w-full">
                Prøv på nytt
              </Button>

              <Button href="/" variant="secondary" className="mt-4 w-full">
                Tilbake til forsiden
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </SimpleLayout>
  )
}
