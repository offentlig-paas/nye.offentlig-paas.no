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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
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
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="https://..."
            />
          ) : (
            <div className="text-sm text-gray-900 dark:text-white">
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
                <span className="text-gray-500 dark:text-gray-400">
                  Ikke satt
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Legg til notater om arrangementet..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">
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
