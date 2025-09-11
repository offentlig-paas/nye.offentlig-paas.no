'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/Button'
import { AuthButton } from '@/components/AuthButton'
import { useToast } from '@/components/ToastProvider'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { AttendanceType, AttendanceTypeDisplay } from '@/lib/events/types'

interface EventRegistrationProps {
  eventSlug: string
  eventTitle: string
  isAcceptingRegistrations: boolean
  attendanceTypes: AttendanceType[]
}

export function EventRegistration({
  eventSlug,
  eventTitle,
  isAcceptingRegistrations,
  attendanceTypes,
}: EventRegistrationProps) {
  const { data: session, status } = useSession()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registrationData, setRegistrationData] = useState({
    comments: '',
    dietary: '',
    organisation: '',
    attendanceType:
      attendanceTypes.length === 1 ? attendanceTypes[0] : undefined,
  })
  const [showUnregisterModal, setShowUnregisterModal] = useState(false)
  const { showSuccess, showError } = useToast()

  const checkRegistrationStatus = useCallback(async () => {
    if (!session?.user?.slackId) {
      setIsCheckingStatus(false)
      return
    }

    setIsCheckingStatus(true)
    try {
      const response = await fetch(`/api/events/${eventSlug}/registration`)
      if (response.ok) {
        const data = await response.json()
        setIsRegistered(data.isRegistered)
        setRegistrationCount(data.registrationCount || 0)
      } else {
        console.warn(
          'Failed to check registration status:',
          response.status,
          response.statusText
        )
      }
    } catch (error) {
      console.error('Error checking registration status:', error)
      // Don't show error to user for background check, just log it
    } finally {
      setIsCheckingStatus(false)
    }
  }, [eventSlug, session?.user?.slackId])

  // Check if user is already registered and prefill organisation
  useEffect(() => {
    let isMounted = true

    const initializeRegistrationStatus = async () => {
      if (session?.user?.slackId && isMounted) {
        await checkRegistrationStatus()

        // Pre-fill organisation from user's status text or title
        if (isMounted && (session.user.statusText || session.user.title)) {
          setRegistrationData(prev => ({
            ...prev,
            organisation:
              prev.organisation ||
              session.user.statusText ||
              session.user.title ||
              '',
            attendanceType:
              prev.attendanceType ||
              (attendanceTypes.length === 1 ? attendanceTypes[0] : undefined),
          }))
        }
      } else if (status !== 'loading') {
        // If no session and not loading, stop checking
        setIsCheckingStatus(false)
      }
    }

    initializeRegistrationStatus()

    return () => {
      isMounted = false
    }
  }, [
    session?.user?.slackId,
    session?.user?.statusText,
    session?.user?.title,
    status,
    checkRegistrationStatus,
    attendanceTypes,
  ])

  const handleRegister = async () => {
    if (!session?.user?.slackId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventSlug}/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      if (response.ok) {
        setIsRegistered(true)
        setShowRegistrationForm(false)
        setRegistrationData({
          comments: '',
          dietary: '',
          organisation: session?.user?.statusText || session?.user?.title || '',
          attendanceType:
            attendanceTypes.length === 1 ? attendanceTypes[0] : undefined,
        })
        await checkRegistrationStatus()
        showSuccess('Påmelding bekreftet!', `Du er nå påmeldt ${eventTitle}.`)
      } else {
        const data = await response.json()
        showError(
          'Feil ved påmelding',
          data.error || 'Noe gikk galt under påmeldingen. Prøv igjen.'
        )
      }
    } catch (error) {
      console.error('Registration error:', error)
      showError(
        'Feil ved påmelding',
        'Noe gikk galt under påmeldingen. Prøv igjen.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnregister = async () => {
    if (!session?.user?.slackId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventSlug}/registration`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsRegistered(false)
        setShowUnregisterModal(false)
        await checkRegistrationStatus()
        showSuccess('Avmelding bekreftet', `Du er nå avmeldt ${eventTitle}.`)
      } else {
        const data = await response.json()
        showError(
          'Feil ved avmelding',
          data.error || 'Noe gikk galt under avmeldingen. Prøv igjen.'
        )
      }
    } catch (error) {
      console.error('Unregistration error:', error)
      showError(
        'Feil ved avmelding',
        'Noe gikk galt under avmeldingen. Prøv igjen.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isCheckingStatus) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Laster...</p>
      </div>
    )
  }

  if (!isAcceptingRegistrations) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Påmelding er stengt
        </p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          Meld deg på fagdagen
        </h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Du må logge inn med Slack for å melde deg på fagdagen.
        </p>
        <AuthButton />
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
        <h3 className="mb-2 text-base font-semibold text-green-900 dark:text-green-100">
          Du er påmeldt!
        </h3>
        <p className="mb-4 text-sm text-green-700 dark:text-green-300">
          Du er påmeldt {eventTitle}.
        </p>
        <Button
          variant="secondary"
          onClick={() => setShowUnregisterModal(true)}
          disabled={isLoading}
          className="text-sm"
        >
          Meld av
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">
          Meld deg på fagdagen
        </h3>
        {registrationCount > 0 && (
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {registrationCount} påmeldt{registrationCount !== 1 ? 'e' : ''}
          </span>
        )}
      </div>

      {!showRegistrationForm ? (
        <Button
          variant="primary"
          onClick={() => setShowRegistrationForm(true)}
          className="w-full"
        >
          Meld deg på
        </Button>
      ) : (
        <div className="space-y-6">
          <div>
            <label
              htmlFor="organisation"
              className="block text-sm/6 font-medium text-zinc-900 dark:text-zinc-100"
            >
              Organisasjon *
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="organisation"
                required
                className="block w-full rounded-md bg-zinc-50/50 px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-zinc-800/50 dark:text-zinc-100 dark:outline-zinc-600 dark:placeholder:text-zinc-400"
                placeholder="F.eks. NAV, Skatteetaten, Kommune"
                value={registrationData.organisation}
                onChange={e =>
                  setRegistrationData(prev => ({
                    ...prev,
                    organisation: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {attendanceTypes.length > 0 && (
            <div>
              <label className="block text-sm/6 font-medium text-zinc-900 dark:text-zinc-100">
                Deltakelse *
              </label>
              <div className="mt-2 space-y-2">
                {attendanceTypes.map(type => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-100 ${
                      attendanceTypes.length === 1
                        ? 'opacity-75'
                        : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendanceType"
                      value={type}
                      checked={registrationData.attendanceType === type}
                      disabled={attendanceTypes.length === 1}
                      onChange={e =>
                        setRegistrationData(prev => ({
                          ...prev,
                          attendanceType: e.target.value as AttendanceType,
                        }))
                      }
                      className="h-4 w-4 border-zinc-300 text-blue-600 focus:ring-blue-500 disabled:opacity-75 dark:border-zinc-600"
                    />
                    <span
                      className={
                        attendanceTypes.length === 1 ? 'font-medium' : ''
                      }
                    >
                      {AttendanceTypeDisplay[type]}
                    </span>
                    {attendanceTypes.length === 1 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (automatisk valgt)
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="comments"
              className="block text-sm/6 font-medium text-zinc-900 dark:text-zinc-100"
            >
              Kommentarer (valgfritt)
            </label>
            <div className="mt-2">
              <textarea
                id="comments"
                rows={3}
                className="block w-full rounded-md bg-zinc-50/50 px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-zinc-800/50 dark:text-zinc-100 dark:outline-zinc-600 dark:placeholder:text-zinc-400"
                placeholder="Har du noen spørsmål eller kommentarer?"
                value={registrationData.comments}
                onChange={e =>
                  setRegistrationData(prev => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="dietary"
              className="block text-sm/6 font-medium text-zinc-900 dark:text-zinc-100"
            >
              Allergier/kostholdsbehov (valgfritt)
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="dietary"
                className="block w-full rounded-md bg-zinc-50/50 px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-zinc-800/50 dark:text-zinc-100 dark:outline-zinc-600 dark:placeholder:text-zinc-400"
                placeholder="F.eks. vegetar, glutenfri, nøtteallergi"
                value={registrationData.dietary}
                onChange={e =>
                  setRegistrationData(prev => ({
                    ...prev,
                    dietary: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleRegister}
              disabled={
                isLoading ||
                !registrationData.organisation.trim() ||
                (attendanceTypes.length > 1 && !registrationData.attendanceType)
              }
              className="flex-1"
            >
              {isLoading ? 'Melder på...' : 'Bekreft påmelding'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowRegistrationForm(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Avbryt
            </Button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showUnregisterModal}
        onClose={() => setShowUnregisterModal(false)}
        onConfirm={handleUnregister}
        title="Bekreft avmelding"
        message={`Er du sikker på at du vil melde deg av ${eventTitle}?`}
        confirmText="Meld av"
        cancelText="Avbryt"
        isLoading={isLoading}
        variant="warning"
      />
    </div>
  )
}
