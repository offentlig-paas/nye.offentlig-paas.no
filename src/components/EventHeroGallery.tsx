'use client'

import Image from 'next/image'
import { urlForImage, type EventPhoto } from '@/lib/sanity/event-photos'
import { EventPhotoCarousel } from './EventPhotoCarousel'

interface EventHeroGalleryProps {
  photos: EventPhoto[]
}

function SingleImageLayout({ photo }: { photo: EventPhoto }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Image
        alt={photo.caption || 'Event photo'}
        src={urlForImage(photo.image).width(1600).height(1200).url()}
        width={1600}
        height={1200}
        unoptimized
        className="w-full rounded-lg object-cover"
      />
    </div>
  )
}

function TwoImageGrid({ photos }: { photos: EventPhoto[] }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:gap-8">
      {photos.slice(0, 2).map((photo, index) => (
        <Image
          key={photo._id || index}
          alt={photo.caption || 'Event photo'}
          src={urlForImage(photo.image).width(1600).height(1200).url()}
          width={1600}
          height={1200}
          unoptimized
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
      ))}
    </div>
  )
}

function ThreeImageGrid({ photos }: { photos: EventPhoto[] }) {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Tablet: Show only first 2 in a clean row */}
      <div className="grid grid-cols-2 gap-4 lg:hidden lg:gap-8">
        {photos.slice(0, 2).map((photo, index) => (
          <Image
            key={photo._id || index}
            alt={photo.caption || 'Event photo'}
            src={urlForImage(photo.image).width(1600).height(1200).url()}
            width={1600}
            height={1200}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        ))}
      </div>

      {/* Large: Show all 3 with tall first image */}
      <div className="hidden grid-cols-2 gap-8 lg:grid">
        <Image
          alt={photos[0]?.caption || 'Event photo'}
          src={urlForImage(photos[0]!.image).width(1600).height(2400).url()}
          width={1600}
          height={2400}
          unoptimized
          className="row-span-2 h-full w-full rounded-lg object-cover"
        />
        <Image
          alt={photos[1]?.caption || 'Event photo'}
          src={urlForImage(photos[1]!.image).width(1600).height(1200).url()}
          width={1600}
          height={1200}
          unoptimized
          className="w-full rounded-lg object-cover"
        />
        <Image
          alt={photos[2]?.caption || 'Event photo'}
          src={urlForImage(photos[2]!.image).width(1600).height(1200).url()}
          width={1600}
          height={1200}
          unoptimized
          className="w-full rounded-lg object-cover"
        />
      </div>
    </div>
  )
}

function FourImageGrid({ photos }: { photos: EventPhoto[] }) {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Tablet: Show only first 2 in a clean row */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {photos.slice(0, 2).map((photo, index) => (
          <Image
            key={photo._id || index}
            alt={photo.caption || 'Event photo'}
            src={urlForImage(photo.image).width(1600).height(1200).url()}
            width={1600}
            height={1200}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        ))}
      </div>

      {/* Large: Show all 4 in complex layout */}
      <div className="hidden grid-cols-3 gap-x-8 gap-y-8 lg:grid">
        <Image
          alt={photos[0]?.caption || 'Event photo'}
          src={urlForImage(photos[0]!.image).width(1600).height(2400).url()}
          width={1600}
          height={2400}
          unoptimized
          className="row-span-2 h-full w-full rounded-lg object-cover"
        />
        <Image
          alt={photos[1]?.caption || 'Event photo'}
          src={urlForImage(photos[1]!.image).width(1600).height(1200).url()}
          width={1600}
          height={1200}
          unoptimized
          className="w-full rounded-lg object-cover"
        />
        <Image
          alt={photos[3]?.caption || 'Event photo'}
          src={urlForImage(photos[3]!.image).width(1600).height(2400).url()}
          width={1600}
          height={2400}
          unoptimized
          className="row-span-2 h-full w-full rounded-lg object-cover"
        />
        <Image
          alt={photos[2]?.caption || 'Event photo'}
          src={urlForImage(photos[2]!.image).width(1600).height(1200).url()}
          width={1600}
          height={1200}
          unoptimized
          className="w-full rounded-lg object-cover"
        />
      </div>
    </div>
  )
}

export function EventHeroGallery({ photos }: EventHeroGalleryProps) {
  if (!photos || photos.length === 0) {
    return null
  }

  const photoCount = photos.length

  if (photoCount === 1) {
    return (
      <div className="mt-6">
        <SingleImageLayout photo={photos[0]!} />
      </div>
    )
  }

  const GridComponent =
    photoCount === 2
      ? TwoImageGrid
      : photoCount === 3
        ? ThreeImageGrid
        : FourImageGrid

  return (
    <div className="mt-6">
      {/* Mobile: Carousel */}
      <div className="mx-auto max-w-7xl sm:hidden">
        <EventPhotoCarousel photos={photos} />
      </div>

      {/* Tablet+: Grid */}
      <div className="hidden sm:block">
        <GridComponent photos={photos} />
      </div>
    </div>
  )
}
