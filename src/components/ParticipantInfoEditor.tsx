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
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-700">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          Deltakerinformasjon
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Rediger
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <label
            htmlFor="streamingUrl"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Streaming URL
          </label>
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
              className="w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500"
              placeholder="https://..."
            />
          ) : (
            <div className="text-sm text-zinc-900 dark:text-white">
              {participantInfo.streamingUrl ? (
                <a
                  href={participantInfo.streamingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <VideoCameraIcon className="mr-1.5 h-4 w-4" />
                  Åpne streaming
                </a>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400">
                  Ikke satt
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Notater
          </label>
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
              className="w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500"
              placeholder="Legg til notater om arrangementet..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
              {participantInfo.notes || 'Ingen notater'}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Lagrer...' : 'Lagre'}
            </Button>
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
          </div>
        )}
      </div>
    </div>
  )
}
