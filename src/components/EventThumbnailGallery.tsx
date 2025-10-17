import Image from 'next/image'

interface EventThumbnailGalleryProps {
  photos: string[]
  title: string
}

export function EventThumbnailGallery({
  photos,
  title,
}: EventThumbnailGalleryProps) {
  if (!photos || photos.length === 0) return null

  const photoCount = photos.length

  if (photoCount === 1) {
    return (
      <div className="relative z-10 mb-4 w-full">
        <Image
          src={photos[0]!}
          alt={title}
          width={800}
          height={600}
          unoptimized
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
      </div>
    )
  }

  if (photoCount === 2) {
    return (
      <div className="relative z-10 mb-4 w-full">
        <div className="grid grid-cols-2 gap-2">
          {photos.slice(0, 2).map((photo, index) => (
            <Image
              key={index}
              src={photo}
              alt={title}
              width={400}
              height={300}
              unoptimized
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </div>
    )
  }

  if (photoCount === 3) {
    return (
      <div className="relative z-10 mb-4 w-full">
        <div className="grid grid-cols-2 gap-2">
          <Image
            src={photos[0]!}
            alt={title}
            width={400}
            height={600}
            unoptimized
            className="row-span-2 aspect-[3/4] h-full w-full rounded-lg object-cover"
          />
          <Image
            src={photos[1]!}
            alt={title}
            width={400}
            height={300}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
          <Image
            src={photos[2]!}
            alt={title}
            width={400}
            height={300}
            unoptimized
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 mb-4 w-full">
      <div className="grid grid-cols-3 gap-2">
        <Image
          src={photos[0]!}
          alt={title}
          width={400}
          height={600}
          unoptimized
          className="row-span-2 aspect-[3/4] size-full rounded-lg object-cover"
        />
        <Image
          src={photos[1]!}
          alt={title}
          width={400}
          height={300}
          unoptimized
          className="col-start-2 aspect-[3/2] size-full rounded-lg object-cover"
        />
        <Image
          src={photos[2]!}
          alt={title}
          width={400}
          height={300}
          unoptimized
          className="col-start-2 row-start-2 aspect-[3/2] size-full rounded-lg object-cover"
        />
        <Image
          src={photos[3]!}
          alt={title}
          width={400}
          height={600}
          unoptimized
          className="row-span-2 aspect-[3/4] size-full rounded-lg object-cover"
        />
      </div>
    </div>
  )
}
