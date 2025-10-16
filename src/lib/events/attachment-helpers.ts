import { getEventAttachments } from '@/lib/sanity/talk-attachments'
import type { Attachment } from '@/lib/events/types'

/**
 * Fetches all attachments for an event in a single query and organizes them by talk title
 * Returns a Map for O(1) lookup when rendering schedule items
 */
export async function getAllEventAttachments(
  eventSlug: string
): Promise<Map<string, Attachment[]>> {
  const sanityAttachments = await getEventAttachments(eventSlug)

  const attachmentsByTalk = new Map<string, Attachment[]>()

  for (const attachment of sanityAttachments) {
    const existing = attachmentsByTalk.get(attachment.talkTitle) || []
    existing.push({
      title: attachment.title,
      url: attachment.fileUrl || attachment.url || '',
      type: attachment.type,
    })
    attachmentsByTalk.set(attachment.talkTitle, existing)
  }

  return attachmentsByTalk
}
