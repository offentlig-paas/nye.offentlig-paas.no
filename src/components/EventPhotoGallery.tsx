'use client'

import Image from 'next/image'
import { urlForImage, type EventPhoto } from '@/lib/sanity/event-photos'

interface EventPhotoGalleryProps {
  photos: EventPhoto[]
  variant?: 'hero' | 'full'
  showHeading?: boolean
}

export function EventPhotoGallery({
  photos,
  variant = 'full',
  showHeading = true,
}: EventPhotoGalleryProps) {
  if (!photos || photos.length === 0) {
    return null
  }

  if (variant === 'hero') {
    const count = Math.min(photos.length, 4)

    if (count === 1) {
      return (
        <div className="mx-auto mt-6 max-w-4xl">
          <Image
            alt={photos[0]?.caption || 'Event photo'}
            src={urlForImage(photos[0]!.image).width(1600).height(1200).url()}
            width={1600}
            height={1200}
            unoptimized
            className="w-full rounded-lg object-cover"
          />
        </div>
      )
    }

    if (count === 2) {
      return (
        <>
          {/* Mobile: Carousel with all photos */}
          <div className="mx-auto mt-6 max-w-7xl sm:hidden">
            <div className="relative">
              <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto">
                {photos.map((photo, index) => (
                  <div key={index} className="w-full shrink-0 snap-center">
                    <Image
                      alt={photo?.caption || 'Event photo'}
                      src={urlForImage(photo.image)
                        .width(1600)
                        .height(1200)
                        .url()}
                      width={800}
                      height={600}
                      unoptimized
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-1.5">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Tablet+: Grid */}
          <div className="mx-auto mt-6 hidden max-w-7xl grid-cols-2 gap-4 sm:grid lg:gap-8">
            <Image
              alt={photos[0]?.caption || 'Event photo'}
              src={urlForImage(photos[0]!.image).width(1600).height(1200).url()}
              width={800}
              height={600}
              unoptimized
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
            <Image
              alt={photos[1]?.caption || 'Event photo'}
              src={urlForImage(photos[1]!.image).width(1600).height(1200).url()}
              width={800}
              height={600}
              unoptimized
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
          </div>
        </>
      )
    }

    if (count === 3) {
      return (
        <>
          {/* Mobile: Carousel with all photos */}
          <div className="mx-auto mt-6 max-w-7xl sm:hidden">
            <div className="relative">
              <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto">
                {photos.map((photo, index) => (
                  <div key={index} className="w-full shrink-0 snap-center">
                    <Image
                      alt={photo?.caption || 'Event photo'}
                      src={urlForImage(photo.image)
                        .width(1600)
                        .height(1200)
                        .url()}
                      width={800}
                      height={600}
                      unoptimized
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-1.5">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Tablet+: Grid */}
          <div className="mx-auto mt-6 hidden max-w-7xl grid-cols-2 gap-4 sm:grid lg:gap-8">
            <Image
              alt={photos[0]?.caption || 'Event photo'}
              src={urlForImage(photos[0]!.image).width(1600).height(2400).url()}
              width={800}
              height={1200}
              unoptimized
              className="aspect-[4/3] w-full rounded-lg object-cover sm:row-span-2 sm:aspect-[3/4] sm:h-full"
            />
            <Image
              alt={photos[1]?.caption || 'Event photo'}
              src={urlForImage(photos[1]!.image).width(1600).height(1200).url()}
              width={800}
              height={600}
              unoptimized
              className="aspect-[4/3] w-full rounded-lg object-cover sm:aspect-[3/2]"
            />
            <Image
              alt={photos[2]?.caption || 'Event photo'}
              src={urlForImage(photos[2]!.image).width(1600).height(1200).url()}
              width={800}
              height={600}
              unoptimized
              className="aspect-[4/3] w-full rounded-lg object-cover sm:aspect-[3/2]"
            />
          </div>
        </>
      )
    }

    return (
      <>
        {/* Mobile: Carousel with all photos */}
        <div className="mx-auto mt-6 max-w-7xl sm:hidden">
          <div className="relative">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto">
              {photos.map((photo, index) => (
                <div key={index} className="w-full shrink-0 snap-center">
                  <Image
                    alt={photo?.caption || 'Event photo'}
                    src={urlForImage(photo.image)
                      .width(1600)
                      .height(1200)
                      .url()}
                    width={800}
                    height={600}
                    unoptimized
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-1.5">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
                />
              ))}
            </div>
          </div>
        </div>
        {/* Tablet+: Grid */}
        <div className="mx-auto mt-6 hidden max-w-7xl grid-cols-2 gap-4 sm:grid md:grid-cols-3 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-8">
          {/* First vertical image - left side on lg */}
          <Image
            alt={photos[0]?.caption || 'Event photo'}
            src={urlForImage(photos[0]!.image).width(1600).height(2400).url()}
            width={800}
            height={1200}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover sm:aspect-[3/2] lg:row-span-2 lg:aspect-[3/4] lg:h-full"
          />
          {/* Two horizontal images - middle on lg, stacked */}
          <Image
            alt={photos[1]?.caption || 'Event photo'}
            src={urlForImage(photos[1]!.image).width(1600).height(900).url()}
            width={800}
            height={450}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover sm:aspect-[3/2] lg:col-start-2 lg:aspect-[16/9] lg:h-full"
          />
          <Image
            alt={photos[2]?.caption || 'Event photo'}
            src={urlForImage(photos[2]!.image).width(1600).height(900).url()}
            width={800}
            height={450}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover sm:aspect-[3/2] lg:col-start-2 lg:row-start-2 lg:aspect-[16/9] lg:h-full"
          />
          {/* Second vertical image - right side on lg */}
          <Image
            alt={photos[3]?.caption || 'Event photo'}
            src={urlForImage(photos[3]!.image).width(1600).height(2400).url()}
            width={800}
            height={1200}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover sm:col-span-2 sm:aspect-[3/2] md:col-span-1 md:aspect-[3/2] lg:row-span-2 lg:aspect-[3/4] lg:h-full"
          />
        </div>
      </>
    )
  }

  if (variant === 'full') {
    return (
      <div className="mb-12 hidden sm:block">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Bilder fra fagdagen
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
      </div>
    )
  }

  const displayPhotos = photos.slice(0, 6)
  const hasMore = photos.length > 6

  return (
    <div className="mb-12">
      {showHeading && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Bilder fra fagdagen
        </h2>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {displayPhotos.map(photo => (
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
