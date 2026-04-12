import 'server-only'
import { sanityClient } from './config'
import type { EventPhoto } from './image-url'

export { urlForImage, prepareEventThumbnailUrls } from './image-url'

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

export async function getEventPhotoById(
  photoId: string
): Promise<EventPhoto | null> {
  const query = `*[_type == "eventPhoto" && _id == $photoId][0] {
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
  return sanityClient.fetch<EventPhoto | null>(query, { photoId })
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
