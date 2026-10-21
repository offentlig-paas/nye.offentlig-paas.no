'use client'

import { readUploadResponse, shrinkPhoto } from '@/lib/photos/prepare-upload'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CameraIcon, ArrowUpTrayIcon } from '@heroicons/react/20/solid'
import { urlForImage, type EventPhoto } from '@/lib/sanity/image-url'
import { useEventRegistration } from '@/contexts/EventRegistrationContext'
import { useToast } from '@/components/ToastProvider'
import { Button } from '@/components/Button'

interface EventAdditionalPhotosGalleryProps {
  photos: EventPhoto[]
  eventSlug?: string
  isActiveOrPast?: boolean
  canUploadAsStaff?: boolean
}

export function EventAdditionalPhotosGallery({
  photos,
  eventSlug,
  isActiveOrPast = false,
  canUploadAsStaff = false,
}: EventAdditionalPhotosGalleryProps) {
  const router = useRouter()
  const { event: eventData } = useEventRegistration()
  const { showSuccess, showError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const registrationStatus = eventData?.userRegistration?.status
  const canUpload = Boolean(
    eventSlug &&
    isActiveOrPast &&
    (canUploadAsStaff ||
      registrationStatus === 'confirmed' ||
      registrationStatus === 'attended')
  )

  if ((!photos || photos.length === 0) && !canUpload) {
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 5)
    setSelectedFiles(files)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventSlug || selectedFiles.length === 0) return

    setIsUploading(true)
    try {
      let uploaded = 0
      for (const file of selectedFiles) {
        const formData = new FormData()
        if (caption.trim()) {
          formData.append('caption', caption.trim())
        }
        formData.append('file0', await shrinkPhoto(file))

        const response = await fetch(`/api/events/${eventSlug}/photos`, {
          method: 'POST',
          body: formData,
        })

        const data = await readUploadResponse(response)
        if (!response.ok) {
          throw new Error(
            (data.message as string) || 'Kunne ikke laste opp bilder'
          )
        }
        uploaded += Number(data.success) || 0
      }
      const data = { success: uploaded }

      showSuccess(
        data.success === 1
          ? 'Bilde lastet opp!'
          : `${data.success} bilder lastet opp!`
      )
      setSelectedFiles([])
      setCaption('')
      setIsUploadOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      router.refresh()
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Kunne ikke laste opp bilder'
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {photos.length > 0
            ? 'Flere bilder fra fagdagen'
            : 'Bilder fra fagdagen'}
        </h2>
        {canUpload && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsUploadOpen(prev => !prev)}
            className="flex items-center gap-2"
          >
            <CameraIcon className="h-4 w-4" aria-hidden="true" />
            Del bilder
          </Button>
        )}
      </div>

      {canUpload && isUploadOpen && (
        <form
          onSubmit={handleUpload}
          className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-400/5"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="participant-photo-files"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Velg bilder (maks 5 om gangen, 10 MB per fil)
              </label>
              <input
                ref={fileInputRef}
                id="participant-photo-files"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                className="mt-1.5 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100 dark:text-gray-300 dark:file:bg-teal-900/30 dark:file:text-teal-300"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Valgt: {selectedFiles.map(f => f.name).join(', ')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="participant-photo-caption"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Bildetekst (valgfritt)
              </label>
              <input
                id="participant-photo-caption"
                type="text"
                maxLength={200}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Kort beskrivelse av bildet..."
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsUploadOpen(false)
                  setSelectedFiles([])
                  setCaption('')
                }}
                disabled={isUploading}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isUploading || selectedFiles.length === 0}
                className="flex items-center gap-2"
              >
                <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" />
                {isUploading ? 'Laster opp...' : 'Last opp'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map(photo => (
            <div
              key={photo._id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Image
                src={urlForImage(photo.image).width(1200).height(1200).url()}
                alt={photo.caption || 'Event photo'}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {(photo.speakers && photo.speakers.length > 0) ||
              photo.caption ? (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="p-4">
                    {photo.speakers && photo.speakers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {photo.speakers.map(speaker => (
                          <span
                            key={speaker}
                            className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-900 shadow-lg backdrop-blur-sm"
                          >
                            {speaker}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-white drop-shadow-lg">
                        {photo.caption}
                      </p>
                    )}
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
