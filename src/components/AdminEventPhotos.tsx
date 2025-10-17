'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { trpc } from '@/lib/trpc/client'
import { urlForImage, type EventPhoto } from '@/lib/sanity/event-photos'
import { getUniqueSpeakers } from '@/lib/events/helpers'
import {
  TrashIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { Button } from './Button'
import type { Event } from '@/lib/events/types'

interface AdminEventPhotosProps {
  slug: string
  event: Event
}

interface EditingPhoto {
  id: string
  caption: string
  speakers: string[]
}

interface UploadProgress {
  total: number
  completed: number
  failed: number
  uploading: boolean
}

export function AdminEventPhotos({ slug, event }: AdminEventPhotosProps) {
  const [editingPhoto, setEditingPhoto] = useState<EditingPhoto | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  )
  const [isDragging, setIsDragging] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [speakerSearch, setSpeakerSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const utils = trpc.useUtils()
  const { data: photos = [], isLoading } = trpc.admin.photos.list.useQuery({
    slug,
  })

  const updateMutation = trpc.admin.photos.update.useMutation({
    onSuccess: () => {
      utils.admin.photos.list.invalidate({ slug })
      setEditingPhoto(null)
    },
  })

  const deleteMutation = trpc.admin.photos.delete.useMutation({
    onSuccess: () => {
      utils.admin.photos.list.invalidate({ slug })
    },
  })

  const reorderMutation = trpc.admin.photos.reorder.useMutation({
    onSuccess: () => {
      utils.admin.photos.list.invalidate({ slug })
      setReorderMode(false)
    },
  })

  const speakers = getUniqueSpeakers(event.schedule)
  const speakerNames = speakers.map(s => s.name)

  const filteredSpeakers = speakerNames.filter(speaker =>
    speaker.toLowerCase().includes(speakerSearch.toLowerCase())
  )

  const handleEdit = (photo: EventPhoto) => {
    setEditingPhoto({
      id: photo._id,
      caption: photo.caption || '',
      speakers: photo.speakers || [],
    })
    setSpeakerSearch('')
  }

  const handleUpdate = () => {
    if (!editingPhoto) return

    updateMutation.mutate({
      slug,
      photoId: editingPhoto.id,
      caption: editingPhoto.caption,
      speakers: editingPhoto.speakers,
    })
  }

  const handleDelete = (photoId: string) => {
    if (confirm('Er du sikker på at du vil slette dette bildet?')) {
      deleteMutation.mutate({ slug, photoId })
    }
  }

  const handleFilesUpload = async (files: FileList) => {
    setUploadError(null)
    const fileArray = Array.from(files)

    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      setUploadError('Ingen gyldige bildefiler valgt')
      return
    }

    setUploadProgress({
      total: validFiles.length,
      completed: 0,
      failed: 0,
      uploading: true,
    })

    try {
      const formData = new FormData()
      formData.append('eventSlug', slug)
      validFiles.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })

      const response = await fetch('/api/admin/events/photos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Opplasting feilet')
      }

      const result = await response.json()
      setUploadProgress({
        total: validFiles.length,
        completed: result.success || 0,
        failed: result.failed || 0,
        uploading: false,
      })

      setTimeout(() => {
        setUploadProgress(null)
        utils.admin.photos.list.invalidate({ slug })
      }, 3000)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Opplasting feilet'
      )
      setUploadProgress(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const toggleSpeaker = (speaker: string) => {
    if (!editingPhoto) return

    const speakers = editingPhoto.speakers.includes(speaker)
      ? editingPhoto.speakers.filter(s => s !== speaker)
      : [...editingPhoto.speakers, speaker]

    setEditingPhoto({ ...editingPhoto, speakers })
  }

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos]
    const [moved] = newPhotos.splice(fromIndex, 1)
    if (moved) {
      newPhotos.splice(toIndex, 0, moved)
    }
    return newPhotos
  }

  const handleReorder = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= photos.length) return

    const reordered = movePhoto(fromIndex, toIndex)
    reorderMutation.mutate({
      slug,
      photoIds: reordered.map(p => p._id),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Laster bilder...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Last opp bilder
          </h3>
          {photos.length > 0 && (
            <Button
              onClick={() => setReorderMode(!reorderMode)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {reorderMode ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Ferdig
                </>
              ) : (
                <>
                  <Bars3Icon className="h-4 w-4" />
                  Endre rekkefølge
                </>
              )}
            </Button>
          )}
        </div>

        <div
          className={`space-y-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Dra og slipp bilder her, eller
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                velg filer fra datamaskinen din
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maks 10MB per fil. Støttede formater: JPG, PNG, GIF, WebP
            </p>
          </div>

          {uploadProgress && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
              {uploadProgress.uploading ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Laster opp {uploadProgress.total} bilder...
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full animate-pulse bg-blue-600" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-900 dark:text-white">
                  ✓ Lastet opp {uploadProgress.completed} av{' '}
                  {uploadProgress.total} bilder
                  {uploadProgress.failed > 0 &&
                    ` (${uploadProgress.failed} feilet)`}
                </p>
              )}
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Ingen bilder lastet opp ennå
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo._id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={urlForImage(photo.image).width(600).url()}
                  alt={photo.caption || 'Event photo'}
                  fill
                  className="object-cover"
                />
                {reorderMode && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50">
                    <button
                      onClick={() => handleReorder(index, 'up')}
                      disabled={index === 0 || reorderMutation.isPending}
                      className="rounded-full bg-white p-2 shadow-lg transition-opacity hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <svg
                        className="h-5 w-5 text-gray-700 dark:text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReorder(index, 'down')}
                      disabled={
                        index === photos.length - 1 || reorderMutation.isPending
                      }
                      className="rounded-full bg-white p-2 shadow-lg transition-opacity hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <svg
                        className="h-5 w-5 text-gray-700 dark:text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {!reorderMode && editingPhoto?.id === photo._id ? (
                <div className="space-y-4 p-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bildetekst
                    </label>
                    <input
                      type="text"
                      value={editingPhoto.caption}
                      onChange={e =>
                        setEditingPhoto({
                          ...editingPhoto,
                          caption: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      placeholder="Legg til bildetekst..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tagg foredragsholdere ({editingPhoto.speakers.length})
                    </label>

                    {speakerNames.length > 8 && (
                      <div className="relative mb-2">
                        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={speakerSearch}
                          onChange={e => setSpeakerSearch(e.target.value)}
                          placeholder="Søk etter foredragsholder..."
                          className="w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                        />
                      </div>
                    )}

                    <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-900/50">
                      {editingPhoto.speakers.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1 border-b border-gray-200 pb-2 dark:border-gray-700">
                          {editingPhoto.speakers.map(speaker => (
                            <button
                              key={speaker}
                              onClick={() => toggleSpeaker(speaker)}
                              className="group inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                              {speaker}
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {filteredSpeakers
                          .filter(s => !editingPhoto.speakers.includes(s))
                          .map(speaker => (
                            <button
                              key={speaker}
                              onClick={() => toggleSpeaker(speaker)}
                              className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              + {speaker}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                      className="flex-1"
                    >
                      {updateMutation.isPending ? 'Lagrer...' : 'Lagre'}
                    </Button>
                    <Button
                      onClick={() => setEditingPhoto(null)}
                      variant="secondary"
                      className="flex-1"
                    >
                      Avbryt
                    </Button>
                  </div>
                </div>
              ) : !reorderMode ? (
                <div className="p-4">
                  {photo.caption && (
                    <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                      {photo.caption}
                    </p>
                  )}
                  {photo.speakers && photo.speakers.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        {photo.speakers.length}{' '}
                        {photo.speakers.length === 1
                          ? 'foredragsholder'
                          : 'foredragsholdere'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {photo.speakers.slice(0, 3).map(speaker => (
                          <span
                            key={speaker}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                          >
                            {speaker}
                          </span>
                        ))}
                        {photo.speakers.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            +{photo.speakers.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(photo)}
                      className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Rediger
                    </button>
                    <button
                      onClick={() => handleDelete(photo._id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Slett
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
