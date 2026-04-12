import {
  createImageUrlBuilder,
  type SanityImageSource,
} from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null

export type { SanityImageSource }

export interface EventPhoto {
  _id: string
  eventSlug: string
  image: SanityImageSource
  caption?: string
  speakers?: string[]
  uploadedAt: string
  uploadedBy?: string
  order?: number
  featured?: boolean
}

export function urlForImage(source: SanityImageSource) {
  if (!builder) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID for image URLs')
  }
  return builder.image(source)
}

export function prepareEventThumbnailUrls(photos: EventPhoto[]): string[] {
  return photos.slice(0, 4).map((photo, index) => {
    const isFirstOrLast = index === 0 || index === 3
    return urlForImage(photo.image)
      .width(800)
      .height(isFirstOrLast ? 1200 : 600)
      .url()
  })
}
