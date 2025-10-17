'use client'

import Image from 'next/image'
import { urlForImage, type EventPhoto } from '@/lib/sanity/event-photos'

interface EventPhotoCarouselProps {
  photos: EventPhoto[]
}

export function EventPhotoCarousel({ photos }: EventPhotoCarouselProps) {
  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto">
        {photos.map((photo, index) => (
          <div key={photo._id || index} className="w-full shrink-0 snap-center">
            <Image
              alt={photo.caption || 'Event photo'}
              src={urlForImage(photo.image).width(1600).height(1200).url()}
              width={1600}
              height={1200}
              unoptimized
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {photos.map((photo, index) => (
            <div
              key={photo._id || index}
              className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
            />
          ))}
        </div>
      )}
    </div>
  )
}
