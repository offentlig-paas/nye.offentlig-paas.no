import type { AttachmentType } from '@/lib/events/types'

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
