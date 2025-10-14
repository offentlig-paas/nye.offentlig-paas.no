import { sanityClient } from './config'
import type { AttachmentType } from '@/lib/events/types'

export interface SanityTalkAttachment {
  _id: string
  _type: 'talkAttachment'
  eventSlug: string
  talkTitle: string
  speakerSlackId: string
  title?: string
  url?: string
  fileUrl?: string
  file?: {
    asset: {
      _ref: string
      _type: 'reference'
      url?: string
    }
  }
  type: AttachmentType
  uploadedAt: string
  uploadedBy: string
}

export interface TalkAttachment {
  id: string
  eventSlug: string
  talkTitle: string
  speakerSlackId: string
  title?: string
  url?: string
  fileUrl?: string
  type: AttachmentType
  uploadedAt: string
  uploadedBy: string
}

export async function getTalkAttachments(
  eventSlug: string,
  talkTitle: string,
  options?: { cache?: 'force-cache' | 'no-store' }
): Promise<TalkAttachment[]> {
  try {
    const query = `*[_type == "talkAttachment" && eventSlug == $eventSlug && talkTitle == $talkTitle] | order(uploadedAt desc) {
      _id,
      eventSlug,
      talkTitle,
      speakerSlackId,
      title,
      url,
      "fileUrl": file.asset->url,
      type,
      uploadedAt,
      uploadedBy
    }`

    const cacheOption =
      options?.cache === 'force-cache'
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' as const }

    const results = await sanityClient.fetch<SanityTalkAttachment[]>(
      query,
      { eventSlug, talkTitle },
      cacheOption
    )

    return results.map(result => ({
      id: result._id,
      eventSlug: result.eventSlug,
      talkTitle: result.talkTitle,
      speakerSlackId: result.speakerSlackId,
      title: result.title,
      url: result.url,
      fileUrl: result.fileUrl,
      type: result.type,
      uploadedAt: result.uploadedAt,
      uploadedBy: result.uploadedBy,
    }))
  } catch (error) {
    console.error('Error fetching talk attachments:', error)
    return []
  }
}

export async function getEventAttachments(
  eventSlug: string,
  options?: { cache?: 'force-cache' | 'no-store' }
): Promise<TalkAttachment[]> {
  try {
    const query = `*[_type == "talkAttachment" && eventSlug == $eventSlug] | order(uploadedAt desc) {
      _id,
      eventSlug,
      talkTitle,
      speakerSlackId,
      title,
      url,
      "fileUrl": file.asset->url,
      type,
      uploadedAt,
      uploadedBy
    }`

    const cacheOption =
      options?.cache === 'force-cache'
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' as const }

    const results = await sanityClient.fetch<SanityTalkAttachment[]>(
      query,
      { eventSlug },
      cacheOption
    )

    return results.map(result => ({
      id: result._id,
      eventSlug: result.eventSlug,
      talkTitle: result.talkTitle,
      speakerSlackId: result.speakerSlackId,
      title: result.title,
      url: result.url,
      fileUrl: result.fileUrl,
      type: result.type,
      uploadedAt: result.uploadedAt,
      uploadedBy: result.uploadedBy,
    }))
  } catch (error) {
    console.error('Error fetching event attachments:', error)
    return []
  }
}

export async function createTalkAttachment(
  data: Omit<TalkAttachment, 'id' | 'uploadedAt'>
): Promise<TalkAttachment | null> {
  try {
    const doc = {
      _type: 'talkAttachment',
      eventSlug: data.eventSlug,
      talkTitle: data.talkTitle,
      speakerSlackId: data.speakerSlackId,
      title: data.title,
      url: data.url,
      type: data.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy,
    }

    const result = await sanityClient.create(doc)

    return {
      id: result._id,
      eventSlug: result.eventSlug,
      talkTitle: result.talkTitle,
      speakerSlackId: result.speakerSlackId,
      title: result.title,
      url: result.url,
      type: result.type,
      uploadedAt: result.uploadedAt,
      uploadedBy: result.uploadedBy,
    }
  } catch (error) {
    console.error('Error creating talk attachment:', error)
    return null
  }
}

export async function uploadTalkAttachmentFile(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<{ assetId: string; url: string } | null> {
  try {
    const asset = await sanityClient.assets.upload('file', file, {
      filename,
      contentType: mimeType,
    })

    return {
      assetId: asset._id,
      url: asset.url,
    }
  } catch (error) {
    console.error('Error uploading file to Sanity:', error)
    return null
  }
}

export async function createTalkAttachmentWithFile(
  data: Omit<TalkAttachment, 'id' | 'uploadedAt' | 'fileUrl'>,
  fileAssetId: string
): Promise<TalkAttachment | null> {
  try {
    const doc = {
      _type: 'talkAttachment',
      eventSlug: data.eventSlug,
      talkTitle: data.talkTitle,
      speakerSlackId: data.speakerSlackId,
      title: data.title,
      file: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: fileAssetId,
        },
      },
      type: data.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy,
    }

    const result = await sanityClient.create(doc)

    const query = `*[_id == $id][0]{
      _id,
      eventSlug,
      talkTitle,
      speakerSlackId,
      title,
      url,
      "fileUrl": file.asset->url,
      type,
      uploadedAt,
      uploadedBy
    }`

    const fetchedResult = await sanityClient.fetch<SanityTalkAttachment>(
      query,
      { id: result._id }
    )

    return {
      id: fetchedResult._id,
      eventSlug: fetchedResult.eventSlug,
      talkTitle: fetchedResult.talkTitle,
      speakerSlackId: fetchedResult.speakerSlackId,
      title: fetchedResult.title,
      url: fetchedResult.url,
      fileUrl: fetchedResult.fileUrl,
      type: fetchedResult.type,
      uploadedAt: fetchedResult.uploadedAt,
      uploadedBy: fetchedResult.uploadedBy,
    }
  } catch (error) {
    console.error('Error creating talk attachment with file:', error)
    return null
  }
}

export async function getTalkAttachmentById(
  attachmentId: string
): Promise<TalkAttachment | null> {
  try {
    const query = `*[_type == "talkAttachment" && _id == $id][0] {
      _id,
      eventSlug,
      talkTitle,
      speakerSlackId,
      title,
      url,
      "fileUrl": file.asset->url,
      type,
      uploadedAt,
      uploadedBy
    }`

    const result = await sanityClient.fetch<SanityTalkAttachment | null>(
      query,
      { id: attachmentId }
    )

    if (!result) {
      return null
    }

    return {
      id: result._id,
      eventSlug: result.eventSlug,
      talkTitle: result.talkTitle,
      speakerSlackId: result.speakerSlackId,
      title: result.title,
      url: result.url,
      fileUrl: result.fileUrl,
      type: result.type,
      uploadedAt: result.uploadedAt,
      uploadedBy: result.uploadedBy,
    }
  } catch (error) {
    console.error('Error fetching talk attachment by ID:', error)
    return null
  }
}

export async function deleteTalkAttachment(
  attachmentId: string
): Promise<boolean> {
  try {
    await sanityClient.delete(attachmentId)
    return true
  } catch (error) {
    console.error('Error deleting talk attachment:', error)
    return false
  }
}
