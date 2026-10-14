'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { VideoCameraIcon } from '@heroicons/react/24/outline'
import { updateParticipantInfo } from '@/app/admin/events/[slug]/actions'
import type { EventParticipantInfo } from '@/lib/events/types'

interface ParticipantInfoEditorProps {
  slug: string
  initialData: EventParticipantInfo
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
}

export function ParticipantInfoEditor({
  slug,
  initialData,
  showSuccess,
  showError,
}: ParticipantInfoEditorProps) {
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [participantInfo, setParticipantInfo] = useState({
    streamingUrl: initialData?.streamingUrl || '',
    notes: initialData?.notes || '',
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateParticipantInfo(slug, {
        streamingUrl: participantInfo.streamingUrl,
        notes: participantInfo.notes,
      })

      showSuccess('Lagret', 'Deltakerinformasjon ble lagret')
      setIsEditing(false)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error saving participant info:', error)
      showError('Feil', 'Noe gikk galt ved lagring')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-700/80 dark:bg-zinc-800">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <VideoCameraIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Deltakerinformasjon
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Streaming og praktiske beskjeder
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Rediger
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Streaming URL
            </span>
            {isEditing ? (
              <input
                type="url"
                id="streamingUrl"
                value={participantInfo.streamingUrl}
                onChange={e =>
                  setParticipantInfo({
                    ...participantInfo,
                    streamingUrl: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white px-3.5 py-2 text-sm text-zinc-900 ring-1 ring-zinc-200 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:ring-inset dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-700 dark:placeholder:text-zinc-500"
                placeholder="https://..."
              />
            ) : (
              <div className="text-sm">
                {participantInfo.streamingUrl ? (
                  <a
                    href={participantInfo.streamingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
                  >
                    <VideoCameraIcon className="h-4 w-4" />
                    <span>Åpne streaming ({participantInfo.streamingUrl})</span>
                  </a>
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Ingen streaming-lenke lagt til ennå
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Notater til deltakere
            </span>
            {isEditing ? (
              <textarea
                id="notes"
                value={participantInfo.notes}
                onChange={e =>
                  setParticipantInfo({
                    ...participantInfo,
                    notes: e.target.value,
                  })
                }
                rows={4}
                className="w-full rounded-xl bg-white px-3.5 py-2 text-sm text-zinc-900 ring-1 ring-zinc-200 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:ring-inset dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-700 dark:placeholder:text-zinc-500"
                placeholder="Legg til praktiske beskjeder eller notater om arrangementet..."
              />
            ) : (
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-700/50 dark:bg-zinc-900/50">
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                  {participantInfo.notes || 'Ingen notater lagt til ennå'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-700/50">
          <Button
            variant="secondary"
            onClick={() => {
              setIsEditing(false)
              setParticipantInfo({
                streamingUrl: initialData?.streamingUrl || '',
                notes: initialData?.notes || '',
              })
            }}
          >
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      )}
    </div>
  )
}
