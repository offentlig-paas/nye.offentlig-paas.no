'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { signOut } from 'next-auth/react'
import { useToast } from '@/components/ToastProvider'
import { trpc } from '@/lib/trpc/client'

export function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false)
  const { showSuccess, showError } = useToast()
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation()

  const handleDeleteAccount = async () => {
    try {
      const data = await deleteAccountMutation.mutateAsync()
      showSuccess(
        'Kontoen din er slettet',
        `${data.anonymizedRegistrations} påmeldinger ble anonymisert.`
      )

      setTimeout(() => {
        signOut({ callbackUrl: '/' })
      }, 2000)
    } catch (error: unknown) {
      console.error('Delete account error:', error)
      showError(
        'Feil ved sletting',
        error instanceof Error ? error.message : 'Noe gikk galt.'
      )
    } finally {
      setShowModal(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800/50 dark:bg-red-900/10">
        <h3 className="mb-2 text-base font-semibold text-red-900 dark:text-red-100">
          Slett konto
        </h3>
        <p className="mb-4 text-sm text-red-700 dark:text-red-300">
          Dette vil anonymisere all din personlige informasjon i systemet vårt.
          Påmeldinger til arrangementer blir beholdt for statistikk, men vil
          ikke lenger kunne knyttes til deg.
        </p>
        <p className="mb-4 text-sm text-red-700 dark:text-red-300">
          Du kan logge inn igjen senere, men da starter du med en ny, tom
          profil.
        </p>
        <Button
          variant="secondary"
          onClick={() => setShowModal(true)}
          disabled={deleteAccountMutation.isPending}
          className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-100 active:text-red-700/70 dark:border-red-700 dark:bg-red-900/10 dark:text-red-300 dark:hover:bg-red-900/20 dark:active:bg-red-900/10 dark:active:text-red-300/70"
        >
          Slett min konto
        </Button>
      </div>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteAccount}
        title="Bekreft sletting av konto"
        message="Er du sikker på at du vil slette din konto? Denne handlingen kan ikke angres. All din personlige informasjon vil bli anonymisert."
        confirmText="Ja, slett min konto"
        cancelText="Avbryt"
        isLoading={deleteAccountMutation.isPending}
        variant="danger"
      />
    </>
  )
}
