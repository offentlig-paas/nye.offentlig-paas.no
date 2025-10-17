'use client'

import Image from 'next/image'
import { urlForImage, type EventPhoto } from '@/lib/sanity/event-photos'

interface EventAdditionalPhotosGalleryProps {
  photos: EventPhoto[]
}

export function EventAdditionalPhotosGallery({
  photos,
}: EventAdditionalPhotosGalleryProps) {
  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="mb-12 hidden sm:block">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Flere bilder fra fagdagen
      </h2>
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
            {(photo.speakers && photo.speakers.length > 0) || photo.caption ? (
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
    </div>
  )
}
