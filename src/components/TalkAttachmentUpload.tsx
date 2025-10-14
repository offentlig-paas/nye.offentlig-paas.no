'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline'
import { AttachmentType } from '@/lib/events/types'

interface TalkAttachmentUploadProps {
  eventSlug: string
  talkTitle: string
  speakerSlackId: string
  isAdminContext?: boolean
  onUploadComplete?: () => void
  onError?: (error: string) => void
  compact?: boolean
}

export function TalkAttachmentUpload({
  eventSlug,
  talkTitle,
  speakerSlackId,
  isAdminContext = false,
  onUploadComplete,
  onError,
  compact = false,
}: TalkAttachmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [attachmentType, setAttachmentType] = useState<AttachmentType>(
    AttachmentType.Slides
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name)
      }
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (!isAdminContext) {
        formData.append('eventSlug', eventSlug)
      }
      formData.append('talkTitle', talkTitle)
      formData.append('speakerSlackId', speakerSlackId)
      formData.append('title', title || selectedFile.name)
      formData.append('type', attachmentType)

      const apiUrl = isAdminContext
        ? `/api/admin/events/${encodeURIComponent(eventSlug)}/talk-attachments`
        : '/api/talk-attachments'

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      setSelectedFile(null)
      setTitle('')
      setUploadMode(null)
      onUploadComplete?.()
    } catch (error) {
      console.error('Upload error:', error)
      onError?.(
        error instanceof Error ? error.message : 'Failed to upload file'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!url) return

    setIsUploading(true)

    try {
      const apiUrl = isAdminContext
        ? `/api/admin/events/${encodeURIComponent(eventSlug)}/talk-attachments`
        : '/api/talk-attachments'

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(!isAdminContext && { eventSlug }),
          talkTitle,
          speakerSlackId,
          title,
          url,
          type: attachmentType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add link')
      }

      setUrl('')
      setTitle('')
      setUploadMode(null)
      onUploadComplete?.()
    } catch (error) {
      console.error('URL submit error:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to add link')
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setUploadMode(null)
    setSelectedFile(null)
    setUrl('')
    setTitle('')
    setAttachmentType(AttachmentType.Slides)
  }

  if (!uploadMode) {
    return (
      <div className={compact ? 'flex gap-2' : 'space-y-2'}>
        <Button
          onClick={() => setUploadMode('file')}
          variant="secondary"
          className={compact ? 'flex-1' : 'w-full'}
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          Last opp fil
        </Button>
        <Button
          onClick={() => setUploadMode('url')}
          variant="secondary"
          className={compact ? 'flex-1' : 'w-full'}
        >
          Legg til lenke
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {uploadMode === 'file' ? 'Last opp fil' : 'Legg til lenke'}
        </h3>
        <button
          onClick={resetForm}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Type
          </label>
          <select
            value={attachmentType}
            onChange={e => setAttachmentType(e.target.value as AttachmentType)}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          >
            <option value={AttachmentType.Slides}>Slides</option>
            <option value={AttachmentType.PDF}>PDF</option>
            <option value={AttachmentType.Video}>Video</option>
            <option value={AttachmentType.Recording}>Recording</option>
            <option value={AttachmentType.Code}>Code</option>
            <option value={AttachmentType.Link}>Link</option>
            <option value={AttachmentType.Other}>Other</option>
          </select>
        </div>

        {uploadMode === 'file' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Fil
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.pptx,.ppt,.key,.odp,.zip"
                  className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-zinc-400 dark:file:bg-blue-900 dark:file:text-blue-200"
                />
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <DocumentIcon className="h-4 w-4" />
                  {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tittel (valgfritt)
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={
              uploadMode === 'file'
                ? 'Bruker filnavn hvis tom'
                : 'Legg til en beskrivende tittel'
            }
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={uploadMode === 'file' ? handleFileUpload : handleUrlSubmit}
            disabled={
              isUploading || (uploadMode === 'file' ? !selectedFile : !url)
            }
            className="flex-1"
          >
            {isUploading ? 'Laster opp...' : 'Last opp'}
          </Button>
          <Button onClick={resetForm} variant="secondary">
            Avbryt
          </Button>
        </div>
      </div>
    </div>
  )
}
