'use client'

import { useState, useEffect, useCallback } from 'react'
import { TalkAttachmentUpload } from './TalkAttachmentUpload'
import { getAttachmentIcon } from '@/lib/events/helpers'
import { TrashIcon } from '@heroicons/react/24/outline'
import type { TalkAttachment } from '@/lib/sanity/talk-attachments'

interface TalkAttachmentManagerProps {
  eventSlug: string
  talkTitle: string
  speakerSlackId: string
  canManage: boolean
  isAdminContext?: boolean
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function TalkAttachmentManager({
  eventSlug,
  talkTitle,
  speakerSlackId,
  canManage,
  isAdminContext = false,
  onError,
  onSuccess,
}: TalkAttachmentManagerProps) {
  const [attachments, setAttachments] = useState<TalkAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchAttachments = useCallback(async () => {
    try {
      const apiUrl = isAdminContext
        ? `/api/admin/events/${encodeURIComponent(eventSlug)}/talk-attachments?talkTitle=${encodeURIComponent(talkTitle)}`
        : `/api/talk-attachments?eventSlug=${encodeURIComponent(eventSlug)}&talkTitle=${encodeURIComponent(talkTitle)}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error('Failed to fetch attachments')
      }

      const data = await response.json()
      setAttachments(data.attachments || [])
    } catch (error) {
      console.error('Error fetching attachments:', error)
      onError?.('Kunne ikke laste vedlegg')
    } finally {
      setIsLoading(false)
    }
  }, [eventSlug, talkTitle, isAdminContext, onError])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments])

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Er du sikker på at du vil slette dette vedlegget?')) {
      return
    }

    setIsDeleting(attachmentId)

    try {
      const apiUrl = isAdminContext
        ? `/api/admin/events/${encodeURIComponent(eventSlug)}/talk-attachments?id=${encodeURIComponent(attachmentId)}`
        : `/api/talk-attachments?id=${encodeURIComponent(attachmentId)}`

      const response = await fetch(apiUrl, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete attachment')
      }

      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
      onSuccess?.('Vedlegg slettet')
    } catch (error) {
      console.error('Error deleting attachment:', error)
      onError?.('Kunne ikke slette vedlegg')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleUploadComplete = () => {
    onSuccess?.('Vedlegg lastet opp')
    fetchAttachments()
  }

  if (isLoading) {
    return (
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Laster vedlegg...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Vedlegg
          </h4>
          <div className="space-y-2">
            {attachments.map(attachment => {
              const Icon = getAttachmentIcon(attachment.type)
              const displayUrl = attachment.fileUrl || attachment.url
              const displayTitle = attachment.title || attachment.type

              return (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0 text-zinc-400" />
                    <div className="flex-1">
                      {displayUrl ? (
                        <a
                          href={displayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {displayTitle}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {displayTitle}
                        </span>
                      )}
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {attachment.type} •{' '}
                        {new Date(attachment.uploadedAt).toLocaleDateString(
                          'nb-NO'
                        )}
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      disabled={isDeleting === attachment.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {canManage && (
        <TalkAttachmentUpload
          eventSlug={eventSlug}
          talkTitle={talkTitle}
          speakerSlackId={speakerSlackId}
          isAdminContext={isAdminContext}
          onUploadComplete={handleUploadComplete}
          onError={onError}
          compact={attachments.length === 0}
        />
      )}
    </div>
  )
}
