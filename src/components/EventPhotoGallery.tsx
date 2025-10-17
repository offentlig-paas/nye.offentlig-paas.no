'use client'

import Image from 'next/image'
import { urlForImage, type EventPhoto } from '@/lib/sanity/event-photos'

interface EventPhotoGalleryProps {
  photos: EventPhoto[]
  variant?: 'hero' | 'compact'
}

export function EventPhotoGallery({
  photos,
  variant = 'compact',
}: EventPhotoGalleryProps) {
  if (!photos || photos.length === 0) {
    return null
  }

  if (variant === 'hero' && photos.length >= 4) {
    return (
      <div className="mx-auto mt-6 max-w-7xl lg:grid lg:grid-cols-3 lg:gap-x-8">
        <Image
          alt={photos[0]?.caption || 'Event photo'}
          src={urlForImage(photos[0]!.image).width(800).height(1200).url()}
          width={800}
          height={1200}
          className="row-span-2 aspect-[3/4] size-full rounded-lg object-cover max-lg:hidden"
        />
        <Image
          alt={photos[1]?.caption || 'Event photo'}
          src={urlForImage(photos[1]!.image).width(800).height(600).url()}
          width={800}
          height={600}
          className="col-start-2 aspect-[3/2] size-full rounded-lg object-cover max-lg:hidden"
        />
        <Image
          alt={photos[2]?.caption || 'Event photo'}
          src={urlForImage(photos[2]!.image).width(800).height(600).url()}
          width={800}
          height={600}
          className="col-start-2 row-start-2 aspect-[3/2] size-full rounded-lg object-cover max-lg:hidden"
        />
        <Image
          alt={photos[3]?.caption || 'Event photo'}
          src={urlForImage(photos[3]!.image).width(800).height(1200).url()}
          width={800}
          height={1200}
          className="row-span-2 aspect-[4/5] size-full object-cover sm:rounded-lg lg:aspect-[3/4]"
        />
      </div>
    )
  }

  const displayPhotos = photos.slice(0, 6)
  const hasMore = photos.length > 6

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Bilder fra fagdagen
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {displayPhotos.map(photo => (
          <div
            key={photo._id}
            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <Image
              src={urlForImage(photo.image).width(600).height(600).url()}
              alt={photo.caption || 'Event photo'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {photo.caption && (
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="p-4 text-sm font-medium text-white drop-shadow-lg">
                  {photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      {hasMore && (
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          +{photos.length - 6} flere bilder
        </p>
      )}
    </div>
  )
}
