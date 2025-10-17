import { sanityClient } from './config'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const builder = imageUrlBuilder(sanityClient)

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
  return builder.image(source)
}

function removeUndefinedFields<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

export async function getEventPhotos(eventSlug: string): Promise<EventPhoto[]> {
  const query = `*[_type == "eventPhoto" && eventSlug == $eventSlug] | order(order asc, uploadedAt desc) {
    _id,
    eventSlug,
    image,
    caption,
    speakers,
    uploadedAt,
    uploadedBy,
    order,
    featured
  }`

  return sanityClient.fetch<EventPhoto[]>(query, { eventSlug })
}

export async function getPhotosByEventAndSpeaker(
  eventSlug: string,
  speakerName: string
): Promise<EventPhoto[]> {
  const query = `*[_type == "eventPhoto" && eventSlug == $eventSlug && $speakerName in speakers] | order(order asc, uploadedAt desc) {
    _id,
    eventSlug,
    image,
    caption,
    speakers,
    uploadedAt,
    uploadedBy,
    order,
    featured
  }`

  return sanityClient.fetch<EventPhoto[]>(query, { eventSlug, speakerName })
}

export async function updateEventPhoto(
  photoId: string,
  input: {
    caption?: string
    speakers?: string[]
    order?: number
    featured?: boolean
  }
): Promise<EventPhoto> {
  const updates = removeUndefinedFields(input)

  return sanityClient.patch(photoId).set(updates).commit()
}

export async function deleteEventPhoto(photoId: string): Promise<void> {
  await sanityClient.delete(photoId)
}

export async function reorderEventPhotos(photoIds: string[]): Promise<void> {
  const transaction = sanityClient.transaction()

  photoIds.forEach((photoId, index) => {
    transaction.patch(photoId, { set: { order: index } })
  })

  await transaction.commit()
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
