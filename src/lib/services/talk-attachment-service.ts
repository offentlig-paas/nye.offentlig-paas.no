import {
  uploadTalkAttachmentFile,
  createTalkAttachmentWithFile,
  createTalkAttachment,
} from '@/lib/sanity/talk-attachments'
import { AttachmentType } from '@/lib/events/types'
import type { TalkAttachment } from '@/lib/sanity/talk-attachments'

export interface FileUploadData {
  file: Buffer
  filename: string
  mimeType: string
  eventSlug: string
  talkTitle: string
  speakerSlackId: string
  title: string
  type: AttachmentType
  uploadedBy: string
}

export interface UrlAttachmentData {
  eventSlug: string
  talkTitle: string
  speakerSlackId: string
  title?: string
  url: string
  type: AttachmentType
  uploadedBy: string
}

interface AttachmentResult {
  success: boolean
  attachment?: TalkAttachment
  error?: string
}

/**
 * Handles file upload and attachment creation
 * Pure business logic, easily testable without HTTP layer
 */
export async function handleFileUpload(
  data: FileUploadData
): Promise<AttachmentResult> {
  // Upload file to Sanity
  const uploadResult = await uploadTalkAttachmentFile(
    data.file,
    data.filename,
    data.mimeType
  )

  if (!uploadResult) {
    return {
      success: false,
      error: 'Failed to upload file',
    }
  }

  // Create attachment document
  const attachment = await createTalkAttachmentWithFile(
    {
      eventSlug: data.eventSlug,
      talkTitle: data.talkTitle,
      speakerSlackId: data.speakerSlackId,
      title: data.title,
      type: data.type,
      uploadedBy: data.uploadedBy,
    },
    uploadResult.assetId
  )

  if (!attachment) {
    return {
      success: false,
      error: 'Failed to create attachment',
    }
  }

  return {
    success: true,
    attachment,
  }
}

/**
 * Handles URL attachment creation
 * Pure business logic, easily testable without HTTP layer
 */
export async function handleUrlAttachment(
  data: UrlAttachmentData
): Promise<AttachmentResult> {
  const attachment = await createTalkAttachment({
    eventSlug: data.eventSlug,
    talkTitle: data.talkTitle,
    speakerSlackId: data.speakerSlackId,
    title: data.title,
    url: data.url,
    type: data.type,
    uploadedBy: data.uploadedBy,
  })

  if (!attachment) {
    return {
      success: false,
      error: 'Failed to create attachment',
    }
  }

  return {
    success: true,
    attachment,
  }
}
