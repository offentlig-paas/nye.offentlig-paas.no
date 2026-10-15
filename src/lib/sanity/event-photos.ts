import 'server-only'
import { cache } from 'react'
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

export const getEventPhotos = cache(
  async (eventSlug: string): Promise<EventPhoto[]> => {
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
)

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

const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_PARTICIPANT_PHOTOS_PER_EVENT = 10

const ALLOWED_PHOTO_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function hasValidImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === 'image/jpeg') {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    )
  }
  if (mimeType === 'image/png') {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    )
  }
  if (mimeType === 'image/gif') {
    return (
      buffer.length >= 6 &&
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38 &&
      (buffer[4] === 0x37 || buffer[4] === 0x39) &&
      buffer[5] === 0x61
    )
  }
  if (mimeType === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    )
  }
  return false
}

export function validateEventPhotoFile(
  file: { name: string; type: string; size: number },
  buffer: Buffer
): string | null {
  if (file.size <= 0 || buffer.length <= 0) {
    return 'Tom fil'
  }
  if (
    file.size > MAX_PHOTO_SIZE_BYTES ||
    buffer.length > MAX_PHOTO_SIZE_BYTES
  ) {
    return 'Filen er for stor (maks 10 MB)'
  }
  if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
    return 'Ugyldig filformat (kun JPG, PNG, WebP og GIF er tillatt)'
  }
  if (!hasValidImageSignature(buffer, file.type)) {
    return 'Filinnholdet samsvarer ikke med bildeformatet'
  }
  return null
}

export async function getEventPhotoCountByUser(
  eventSlug: string,
  uploadedBy: string
): Promise<number> {
  const query = `count(*[_type == "eventPhoto" && eventSlug == $eventSlug && uploadedBy == $uploadedBy])`
  return sanityClient.fetch<number>(query, { eventSlug, uploadedBy })
}

export async function uploadEventPhoto({
  eventSlug,
  buffer,
  filename,
  contentType,
  uploadedBy,
  caption,
  order = 0,
}: {
  eventSlug: string
  buffer: Buffer
  filename: string
  contentType: string
  uploadedBy: string
  caption?: string
  order?: number
}): Promise<EventPhoto> {
  const asset = await sanityClient.assets.upload('image', buffer, {
    filename,
    contentType,
  })

  const doc = {
    _type: 'eventPhoto',
    eventSlug,
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    },
    ...(caption ? { caption } : {}),
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    order,
  }

  return sanityClient.create(doc) as unknown as Promise<EventPhoto>
}

export async function reorderEventPhotos(photoIds: string[]): Promise<void> {
  const transaction = sanityClient.transaction()

  photoIds.forEach((photoId, index) => {
    transaction.patch(photoId, { set: { order: index } })
  })

  await transaction.commit()
}
