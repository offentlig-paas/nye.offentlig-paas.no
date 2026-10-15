'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDateLong } from '@/lib/formatDate'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ToastProvider'
import type { Event } from '@/lib/events/types'
import type { EventRegistration } from '@/domains/event-registration/types'

interface PastEventWithRegistration {
  event: Event
  registration: EventRegistration
}

interface PastRegistrationsSectionProps {
  events: PastEventWithRegistration[]
}

export function PastRegistrationsSection({
  events,
}: PastRegistrationsSectionProps) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const updateAttendanceMutation =
    trpc.eventRegistration.updateAttendance.useMutation({
      onSuccess: data => {
        showSuccess('Oppdatert', data.message)
        router.refresh()
      },
      onError: error => {
        showError('Feil', error.message || 'Kunne ikke oppdatere oppmøte')
      },
    })

  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mine tidligere påmeldinger
      </h2>
      {events.length > 0 ? (
        <div className="mt-6 space-y-3">
          {events.map(item => {
            const { status } = item.registration
            const canToggleAttendance =
              status === 'confirmed' ||
              status === 'attended' ||
              status === 'no-show'

            return (
              <div
                key={item.event.slug}
                className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/fagdag/${item.event.slug}`}
                    className="font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
                  >
                    {item.event.title}
                  </Link>
                  <div className="flex flex-wrap gap-1">
                    {status === 'attended' && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Deltok
                      </span>
                    )}
                    {status === 'confirmed' && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Påmeldt
                      </span>
                    )}
                    {status === 'waitlist' && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        På venteliste
                      </span>
                    )}
                    {status === 'no-show' && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Møtte ikke
                      </span>
                    )}
                    {status === 'cancelled' && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                        Avmeldt
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDateLong(item.event.start)} • {item.event.location}
                </p>
                {canToggleAttendance && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-3 text-xs dark:border-zinc-700/60">
                    {(status === 'attended' || status === 'confirmed') && (
                      <Link
                        href={`/fagdag/${item.event.slug}/tilbakemelding`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Gi tilbakemelding
                      </Link>
                    )}
                    {status !== 'attended' && (
                      <button
                        type="button"
                        disabled={updateAttendanceMutation.isPending}
                        onClick={() =>
                          updateAttendanceMutation.mutate({
                            slug: item.event.slug,
                            status: 'attended',
                          })
                        }
                        className="font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        Jeg deltok
                      </button>
                    )}
                    {status !== 'no-show' && (
                      <button
                        type="button"
                        disabled={updateAttendanceMutation.isPending}
                        onClick={() =>
                          updateAttendanceMutation.mutate({
                            slug: item.event.slug,
                            status: 'no-show',
                          })
                        }
                        className="font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        Deltok ikke
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Ingen tidligere påmeldinger
        </p>
      )}
    </section>
  )
}
