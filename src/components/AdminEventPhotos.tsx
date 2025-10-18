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
  PhotoIcon,
  StarIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { Button } from './Button'
import { useToast } from '@/components/ToastProvider'
import type { Event } from '@/lib/events/types'

interface AdminEventPhotosProps {
  slug: string
  event: Event
}

interface EditingPhoto {
  id: string
  caption: string
  speakers: string[]
  featured: boolean
}

interface UploadProgress {
  total: number
  completed: number
  failed: number
  uploading: boolean
}

export function AdminEventPhotos({ slug, event }: AdminEventPhotosProps) {
  const [editingPhoto, setEditingPhoto] = useState<EditingPhoto | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  )
  const [isDragging, setIsDragging] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [speakerSearch, setSpeakerSearch] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [originalDraggedIndex, setOriginalDraggedIndex] = useState<
    number | null
  >(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [tempPhotos, setTempPhotos] = useState<EventPhoto[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { showSuccess, showError } = useToast()
  const utils = trpc.useUtils()
  const { data: photos = [], isLoading } = trpc.admin.photos.list.useQuery({
    slug,
  })

  const updateMutation = trpc.admin.photos.update.useMutation({
    onSuccess: () => {
      utils.admin.photos.list.invalidate({ slug })
      setEditingPhoto(null)
      setIsEditModalOpen(false)
      setSpeakerSearch('')
      showSuccess('Bilde oppdatert')
    },
    onError: () => {
      showError('Kunne ikke oppdatere bilde')
    },
  })

  const deleteMutation = trpc.admin.photos.delete.useMutation({
    onSuccess: () => {
      utils.admin.photos.list.invalidate({ slug })
      showSuccess('Bilde slettet')
    },
    onError: () => {
      showError('Kunne ikke slette bilde')
    },
  })

  const reorderMutation = trpc.admin.photos.reorder.useMutation({
    onMutate: async variables => {
      // Cancel any outgoing refetches
      await utils.admin.photos.list.cancel({ slug })

      // Snapshot the previous value
      const previousPhotos = utils.admin.photos.list.getData({ slug })

      // Optimistically update to the new value
      if (previousPhotos && variables.photoIds) {
        const newPhotos = variables.photoIds
          .map(id => previousPhotos.find(p => p._id === id))
          .filter((p): p is EventPhoto => p !== undefined)
        utils.admin.photos.list.setData({ slug }, newPhotos)
      }

      return { previousPhotos }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPhotos) {
        utils.admin.photos.list.setData({ slug }, context.previousPhotos)
      }
      showError('Kunne ikke lagre rekkefølge')
    },
    onSuccess: () => {
      showSuccess('Rekkefølge lagret')
    },
    onSettled: () => {
      utils.admin.photos.list.invalidate({ slug })
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
      featured: photo.featured || false,
    })
    setSpeakerSearch('')
    setIsEditModalOpen(true)
  }

  const handleUpdate = () => {
    if (!editingPhoto) return

    updateMutation.mutate({
      slug,
      photoId: editingPhoto.id,
      caption: editingPhoto.caption,
      speakers: editingPhoto.speakers,
      featured: editingPhoto.featured,
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

  const handleUploadDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files)
    }
  }

  const handleUploadDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleUploadDragLeave = (e: React.DragEvent) => {
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

  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    if (!reorderMode) {
      e.preventDefault()
      return
    }
    setDraggedIndex(index)
    setOriginalDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    if (!reorderMode) {
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    // Only update if we're hovering over a different position
    if (dragOverIndex === index) {
      return
    }

    setDragOverIndex(index)

    if (originalDraggedIndex !== null && originalDraggedIndex !== index) {
      // Create temporary reordered array for visual feedback
      const sourcePhotos = photos // Always use original photos as source
      const newPhotos = [...sourcePhotos]
      const [draggedItem] = newPhotos.splice(originalDraggedIndex, 1)

      if (draggedItem) {
        newPhotos.splice(index, 0, draggedItem)
      }

      setTempPhotos(newPhotos)
      setDraggedIndex(index)
    }
  }

  const handlePhotoDragLeave = () => {
    setDragOverIndex(null)
  }

  const handlePhotoDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!reorderMode) {
      return
    }
    e.preventDefault()

    if (originalDraggedIndex === null || originalDraggedIndex === dropIndex) {
      setDraggedIndex(null)
      setOriginalDraggedIndex(null)
      setDragOverIndex(null)
      setTempPhotos(null)
      return
    }

    // Use the temporary photos for the final order
    const finalPhotos = tempPhotos || photos

    // Clear all drag state immediately
    setDraggedIndex(null)
    setOriginalDraggedIndex(null)
    setDragOverIndex(null)
    setTempPhotos(null)

    // Mutation will handle optimistic update
    reorderMutation.mutate({
      slug,
      photoIds: finalPhotos.map(p => p._id),
    })
  }

  const handlePhotoDragEnd = () => {
    setDraggedIndex(null)
    setOriginalDraggedIndex(null)
    setDragOverIndex(null)
    setTempPhotos(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Laster bilder...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {photos.length === 0 ? (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Last opp bilder
              </h3>
            </div>

            <div
              className={`space-y-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDrop={handleUploadDrop}
              onDragOver={handleUploadDragOver}
              onDragLeave={handleUploadDragLeave}
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

          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              Ingen bilder lastet opp ennå
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bilder
            </h3>
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
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Upload box as first item in grid */}
            <div
              className={`overflow-hidden rounded-lg border-2 border-dashed shadow-sm transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
              }`}
              onDrop={handleUploadDrop}
              onDragOver={handleUploadDragOver}
              onDragLeave={handleUploadDragLeave}
            >
              <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6">
                <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                <div className="text-center">
                  <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
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
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Maks 10MB per fil
                </p>
              </div>

              {uploadProgress && (
                <div className="border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                  {uploadProgress.uploading ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        Laster opp {uploadProgress.total}...
                      </p>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-full animate-pulse bg-blue-600" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-900 dark:text-white">
                      ✓ Lastet opp {uploadProgress.completed}
                      {uploadProgress.failed > 0 &&
                        ` (${uploadProgress.failed} feilet)`}
                    </p>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="border-t border-gray-200 bg-red-50 p-3 dark:border-gray-700 dark:bg-red-900/20">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {uploadError}
                  </p>
                </div>
              )}
            </div>

            {/* Photo grid */}
            {(tempPhotos || photos).map((photo, index) => (
              <div
                key={photo._id}
                draggable={reorderMode}
                onDragStart={e => handlePhotoDragStart(e, index)}
                onDragOver={e => handlePhotoDragOver(e, index)}
                onDragLeave={handlePhotoDragLeave}
                onDrop={e => handlePhotoDrop(e, index)}
                onDragEnd={handlePhotoDragEnd}
                className={`group overflow-hidden rounded-lg border shadow-sm transition-all ${
                  reorderMode ? 'cursor-move hover:shadow-lg' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''} ${
                  dragOverIndex === index && draggedIndex !== index
                    ? 'border-2 border-blue-500 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700'
                } ${
                  reorderMode
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={urlForImage(photo.image).width(1200).height(900).url()}
                    alt={photo.caption || 'Event photo'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {/* Subtle drag overlay on hover */}
                  {reorderMode && (
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  )}
                  {/* Labels for hero and featured */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {index < 4 && (
                      <span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-medium text-white shadow-md">
                        Hero {index + 1}
                      </span>
                    )}
                    {photo.featured && (
                      <span className="flex items-center gap-1 rounded bg-yellow-500 px-2 py-0.5 text-xs font-medium text-black shadow-md">
                        <StarIcon className="h-3 w-3" />
                        Cover
                      </span>
                    )}
                  </div>
                  {reorderMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Bars3Icon className="h-8 w-8 text-white" />
                    </div>
                  )}

                  {/* Always visible caption and speakers at top-right */}
                  {!reorderMode &&
                    (photo.caption ||
                      (photo.speakers && photo.speakers.length > 0)) && (
                      <div className="absolute top-2 right-2 max-w-[calc(100%-4rem)] space-y-1">
                        {photo.caption && (
                          <p className="line-clamp-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
                            {photo.caption}
                          </p>
                        )}
                        {photo.speakers && photo.speakers.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-1">
                            {photo.speakers.slice(0, 2).map(speaker => (
                              <span
                                key={speaker}
                                className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-900 shadow-lg backdrop-blur-sm"
                              >
                                {speaker}
                              </span>
                            ))}
                            {photo.speakers.length > 2 && (
                              <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-900 shadow-lg backdrop-blur-sm">
                                +{photo.speakers.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  {/* Hover-only action buttons at bottom */}
                  {!reorderMode && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(photo)}
                          className="rounded-full bg-blue-500/70 p-2 text-white shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-blue-600/90"
                          title="Tagg foredragsholdere"
                        >
                          <TagIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(photo)}
                          className="rounded-full bg-gray-500/70 p-2 text-white shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-gray-600/90"
                          title="Rediger"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(photo._id)}
                          disabled={deleteMutation.isPending}
                          className="rounded-full bg-red-500/70 p-2 text-white shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-red-600/90 disabled:opacity-50"
                          title="Slett"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info box at bottom when photos exist */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              <PhotoIcon className="h-5 w-5" />
              Bildebruk
            </h3>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-200">
              <li>
                <strong>Hero Gallery:</strong> De 4 første bildene (1-4) vises
                som stort galleri øverst på arrangementssiden
              </li>
              <li>
                <strong>Cover-bilde:</strong> Marker ett bilde som skal brukes i
                arrangementslistingen
              </li>
              <li>
                <strong>Fullt galleri:</strong> Alle bilder vises i galleriet
                nederst på arrangementssiden
              </li>
            </ul>
          </div>
        </>
      )}

      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingPhoto(null)
          setSpeakerSearch('')
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <Dialog.Title className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Rediger bilde
            </Dialog.Title>

            {editingPhoto && (
              <div className="space-y-4">
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
                    Tagg foredragsholdere
                  </label>

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

                  {editingPhoto.speakers.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {editingPhoto.speakers.map(speaker => (
                        <button
                          key={speaker}
                          onClick={() => toggleSpeaker(speaker)}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          {speaker}
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {speakerSearch &&
                    filteredSpeakers.filter(
                      s => !editingPhoto.speakers.includes(s)
                    ).length > 0 && (
                      <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        {filteredSpeakers
                          .filter(s => !editingPhoto.speakers.includes(s))
                          .map(speaker => (
                            <button
                              key={speaker}
                              onClick={() => toggleSpeaker(speaker)}
                              className="flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <span className="font-medium text-gray-900 dark:text-white">
                                {speaker}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}

                  {speakerSearch &&
                    filteredSpeakers.filter(
                      s => !editingPhoto.speakers.includes(s)
                    ).length === 0 && (
                      <p className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        Ingen treff
                      </p>
                    )}
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPhoto.featured}
                      onChange={e =>
                        setEditingPhoto({
                          ...editingPhoto,
                          featured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-400"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bruk som cover-bilde
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Cover-bildet vises i arrangementslistingen
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    {updateMutation.isPending ? 'Lagrer...' : 'Lagre'}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingPhoto(null)
                      setIsEditModalOpen(false)
                      setSpeakerSearch('')
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Avbryt
                  </Button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
