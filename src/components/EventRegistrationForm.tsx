'use client'

import { useState, useEffect, memo } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/Button'
import { AuthButton } from '@/components/AuthButton'
import { useToast } from '@/components/ToastProvider'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { OverlappingAvatars } from '@/components/OverlappingAvatars'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import type { SocialEvent } from '@/lib/events/types'
import type { RegistrationStats } from '@/types/api/registration'
import { AttendanceType, AttendanceTypeDisplay } from '@/lib/events/types'
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from '@heroicons/react/20/solid'
import { formatTime } from '@/lib/formatDate'
import { trpc } from '@/lib/trpc/client'

interface EventRegistrationFormProps {
  eventSlug: string
  eventTitle: string
  isAcceptingRegistrations: boolean
  attendanceTypes: AttendanceType[]
  socialEvent?: SocialEvent
  showOnlySocialEvent?: boolean
}

const RegistrationStats = memo(function RegistrationStats({
  counts,
  variant = 'blue',
}: {
  counts: RegistrationStats
  variant?: 'blue' | 'green'
}) {
  const colorClasses = {
    blue: {
      container: 'bg-blue-50 dark:bg-blue-950/30',
      personIcon: 'text-blue-600 dark:text-blue-400',
      personNumber: 'text-blue-900 dark:text-blue-100',
      personLabel: 'text-blue-700 dark:text-blue-300',
      orgIcon: 'text-indigo-600 dark:text-indigo-400',
      orgNumber: 'text-indigo-900 dark:text-indigo-100',
      orgLabel: 'text-indigo-700 dark:text-indigo-300',
    },
    green: {
      container: 'bg-white/30 dark:bg-green-800/30',
      personIcon: 'text-green-600 dark:text-green-400',
      personNumber: 'text-green-900 dark:text-green-100',
      personLabel: 'text-green-700 dark:text-green-300',
      orgIcon: 'text-green-600 dark:text-green-400',
      orgNumber: 'text-green-900 dark:text-green-100',
      orgLabel: 'text-green-700 dark:text-green-300',
    },
  }

  const colors = colorClasses[variant]

  return (
    <div
      className={`grid grid-cols-2 gap-3 rounded-lg p-3 text-center ${colors.container}`}
    >
      <div className="flex flex-col items-center">
        <div className="mb-1 flex items-center gap-1">
          <UserGroupIcon className={`h-4 w-4 ${colors.personIcon}`} />
          <span className={`text-lg font-bold ${colors.personNumber}`}>
            {counts.persons}
          </span>
        </div>
        <span className={`text-xs ${colors.personLabel}`}>
          {variant === 'blue' ? 'deltakere' : 'personer'}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <div className="mb-1 flex items-center gap-1">
          <BuildingOfficeIcon className={`h-4 w-4 ${colors.orgIcon}`} />
          <span className={`text-lg font-bold ${colors.orgNumber}`}>
            {counts.organizations}
          </span>
        </div>
        <span className={`text-xs ${colors.orgLabel}`}>organisasjoner</span>
      </div>
    </div>
  )
})

interface RegistrationFormData {
  comments: string
  dietary: string
  organisation: string
  attendanceType: AttendanceType | undefined
  attendingSocialEvent?: boolean
}

const RegistrationForm = memo(function RegistrationForm({
  registrationData,
  setRegistrationData,
  attendanceTypes,
  socialEvent,
  onSubmit,
  onCancel,
  isLoading,
}: {
  registrationData: RegistrationFormData
  setRegistrationData: React.Dispatch<
    React.SetStateAction<RegistrationFormData>
  >
  attendanceTypes: AttendanceType[]
  socialEvent?: SocialEvent
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
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
                className={`flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-100 ${attendanceTypes.length === 1 ? 'opacity-75' : 'cursor-pointer'}`}
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
                  className={attendanceTypes.length === 1 ? 'font-medium' : ''}
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

      {socialEvent && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/20">
          <h4 className="mb-2 text-sm font-semibold text-teal-900 dark:text-teal-100">
            Sosialt arrangement
          </h4>
          <p className="mb-3 text-sm text-teal-700 dark:text-teal-300">
            {socialEvent.description}
          </p>
          <div className="mb-3 space-y-1 text-sm text-teal-600 dark:text-teal-400">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 flex-shrink-0" />
              <span>{socialEvent.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4 flex-shrink-0" />
              <span>{formatTime(socialEvent.start)}</span>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-teal-900 dark:text-teal-100">
            <input
              type="checkbox"
              checked={registrationData.attendingSocialEvent ?? false}
              onChange={e =>
                setRegistrationData(prev => ({
                  ...prev,
                  attendingSocialEvent: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500 dark:border-teal-600"
            />
            <span className="font-medium">
              Ja, jeg ønsker å delta på det sosiale arrangementet
            </span>
          </label>
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Ved å melde deg på godtar du vår{' '}
        <a
          href="/personvern"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          personvernerklæring
        </a>{' '}
        og{' '}
        <a
          href="/vilkar"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          vilkår for bruk
        </a>
        .
      </p>

      <div className="flex gap-3 pt-2">
        <Button
          variant="primary"
          onClick={onSubmit}
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
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Avbryt
        </Button>
      </div>
    </div>
  )
})

/**
 * Event registration form with multiple states:
 * - Not logged in: prompts user to log in
 * - Not registered: shows registration form
 * - Registered: shows confirmation with unregister option
 * - Special mode for social event opt-in only
 */
export const EventRegistrationForm = memo(function EventRegistrationForm({
  eventSlug,
  eventTitle,
  isAcceptingRegistrations,
  attendanceTypes,
  socialEvent,
  showOnlySocialEvent = false,
}: EventRegistrationFormProps) {
  const { data: session } = useSession()
  const { showSuccess, showError } = useToast()
  const { registrationStatus, registration, stats, isCheckingStatus, refetch } =
    useEventRegistration()

  const registerMutation = trpc.eventRegistration.register.useMutation()
  const cancelMutation = trpc.eventRegistration.cancel.useMutation()
  const updateMutation = trpc.eventRegistration.update.useMutation()

  const isActivelyRegistered =
    registrationStatus === 'confirmed' || registrationStatus === 'attended'

  const [state, setState] = useState({
    isLoading: false,
    showRegistrationForm: false,
    showUnregisterModal: false,
  })

  const [registrationData, setRegistrationData] =
    useState<RegistrationFormData>({
      comments: '',
      dietary: '',
      organisation: '',
      attendanceType:
        attendanceTypes.length === 1 ? attendanceTypes[0] : undefined,
      attendingSocialEvent: false,
    })

  useEffect(() => {
    if (session?.user && (session.user.statusText || session.user.title)) {
      setRegistrationData(prev => ({
        ...prev,
        organisation:
          prev.organisation ||
          session.user.statusText ||
          session.user.title ||
          '',
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.slackId, session?.user?.statusText, session?.user?.title])
  const handleRegister = async () => {
    if (!session?.user?.slackId) return

    if (!registrationData.attendanceType) {
      showError('Feil ved påmelding', 'Deltakelsestype må velges')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await registerMutation.mutateAsync({
        slug: eventSlug,
        ...registrationData,
        attendanceType: registrationData.attendanceType,
      })

      setState(prev => ({
        ...prev,
        showRegistrationForm: false,
      }))
      setRegistrationData(prev => ({
        ...prev,
        comments: '',
        dietary: '',
        organisation: session?.user?.statusText || session?.user?.title || '',
      }))
      await refetch()
      showSuccess('Påmelding bekreftet!', `Du er nå påmeldt ${eventTitle}.`)
    } catch (error) {
      console.error('Registration error:', error)
      showError(
        'Feil ved påmelding',
        error instanceof Error
          ? error.message
          : 'Noe gikk galt under påmeldingen.'
      )
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleUnregister = async () => {
    if (!session?.user?.slackId) return

    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await cancelMutation.mutateAsync({ slug: eventSlug })

      setState(prev => ({
        ...prev,
        showUnregisterModal: false,
      }))
      await refetch()
      showSuccess('Avmelding bekreftet', `Du er nå avmeldt ${eventTitle}.`)
    } catch (error) {
      console.error('Unregistration error:', error)
      showError(
        'Feil ved avmelding',
        error instanceof Error
          ? error.message
          : 'Noe gikk galt under avmeldingen.'
      )
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  if (isCheckingStatus) {
    return (
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
        <p className="text-sm text-gray-500 dark:text-gray-400">Laster...</p>
      </div>
    )
  }

  if (!isAcceptingRegistrations) {
    return (
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Påmelding er stengt
        </p>
      </div>
    )
  }

  const handleUpdateSocialEvent = async (attending: boolean) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await updateMutation.mutateAsync({
        slug: eventSlug,
        attendingSocialEvent: attending,
      })

      await refetch()
      showSuccess(
        'Oppdatert!',
        attending
          ? 'Du er nå påmeldt det sosiale arrangementet.'
          : 'Du er nå avmeldt det sosiale arrangementet.'
      )
    } catch (error) {
      console.error('Update error:', error)
      showError(
        'Feil ved oppdatering',
        error instanceof Error
          ? error.message
          : 'Noe gikk galt under oppdateringen.'
      )
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  if (showOnlySocialEvent && socialEvent) {
    if (!session) {
      return null
    }

    if (!isActivelyRegistered) {
      return null
    }

    if (registration?.attendingSocialEvent) {
      return (
        <div className="mt-4 rounded-lg border border-teal-300/50 bg-teal-100/50 px-4 py-3 dark:border-teal-700/50 dark:bg-teal-900/30">
          <p className="flex items-center gap-2 text-sm font-medium text-teal-900 dark:text-teal-100">
            <CheckCircleIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Du er påmeldt
          </p>
        </div>
      )
    }

    return (
      <div className="mt-4">
        <Button
          variant="primary"
          onClick={() => handleUpdateSocialEvent(true)}
          disabled={state.isLoading}
          className="w-full text-sm"
        >
          {state.isLoading ? 'Melder på...' : 'Meld deg på sosialt arrangement'}
        </Button>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5">
        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          Bli med på fagdagen
        </h3>

        {stats && stats.total > 0 && (
          <div className="mb-4">
            <RegistrationStats counts={stats} variant="blue" />
          </div>
        )}

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {stats && stats.total > 0
            ? `Allerede ${stats.persons} påmeldte fra ${stats.organizations} ulike organisasjoner! Logg inn med Slack for å bli med.`
            : 'Du må logge inn med Slack for å melde deg på fagdagen.'}
        </p>
        <AuthButton className="w-full" showFullText />
      </div>
    )
  }

  if (isActivelyRegistered) {
    return (
      <div className="overflow-hidden rounded-xl bg-green-50 p-6 shadow-sm ring-1 ring-green-900/10 dark:bg-green-900/20 dark:ring-green-400/10">
        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-green-900 dark:text-green-100">
          <CheckCircleIcon
            className="h-5 w-5 text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
          Du er påmeldt
        </h3>

        {stats && stats.total > 0 && (
          <div className="mb-3">
            <RegistrationStats counts={stats} variant="green" />
          </div>
        )}

        {stats && stats.participants.length > 0 && (
          <div className="mb-3">
            <OverlappingAvatars
              participants={stats.participants}
              totalCount={stats.total}
              maxVisible={5}
              size="sm"
              className="justify-center"
            />
          </div>
        )}

        <Button
          variant="secondary"
          onClick={() =>
            setState(prev => ({ ...prev, showUnregisterModal: true }))
          }
          disabled={state.isLoading}
          className="w-full border border-green-200/50 bg-white/60 text-sm font-medium text-green-800 hover:bg-white/80 hover:text-green-900 active:bg-white/90 active:text-green-900/70 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:active:bg-gray-800 dark:active:text-white/70"
        >
          Meld av
        </Button>

        <ConfirmationModal
          isOpen={state.showUnregisterModal}
          onClose={() =>
            setState(prev => ({ ...prev, showUnregisterModal: false }))
          }
          onConfirm={handleUnregister}
          title="Bekreft avmelding"
          message={`Er du sikker på at du vil melde deg av ${eventTitle}?`}
          confirmText="Meld av"
          cancelText="Avbryt"
          isLoading={state.isLoading}
          variant="warning"
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-blue-50 p-6 shadow-sm ring-1 ring-blue-900/10 dark:bg-blue-900/20 dark:ring-blue-400/10">
      <div className="mb-4">
        <h3 className="mb-2 text-base font-semibold text-blue-900 dark:text-blue-100">
          Påmelding
        </h3>

        {stats && stats.total > 0 && (
          <div className="mb-3">
            <RegistrationStats counts={stats} variant="blue" />
          </div>
        )}

        {stats && stats.participants.length > 0 && (
          <div className="mb-3">
            <OverlappingAvatars
              participants={stats.participants}
              totalCount={stats.total}
              maxVisible={5}
              size="sm"
              className="justify-center"
            />
          </div>
        )}

        {stats && stats.total > 0 && (
          <p className="mb-3 text-sm text-blue-700 dark:text-blue-300">
            Bli en av {stats.persons + 1} deltakere fra {stats.organizations}+
            organisasjoner.
          </p>
        )}
      </div>

      {!state.showRegistrationForm ? (
        <Button
          variant="primary"
          onClick={() =>
            setState(prev => ({ ...prev, showRegistrationForm: true }))
          }
          className="w-full"
        >
          Meld deg på
        </Button>
      ) : (
        <RegistrationForm
          registrationData={registrationData}
          setRegistrationData={setRegistrationData}
          attendanceTypes={attendanceTypes}
          socialEvent={socialEvent}
          onSubmit={handleRegister}
          onCancel={() =>
            setState(prev => ({ ...prev, showRegistrationForm: false }))
          }
          isLoading={state.isLoading}
        />
      )}
    </div>
  )
})
