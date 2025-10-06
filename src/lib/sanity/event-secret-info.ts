import { sanityClient } from './config'
import type { EventSecretInfo } from '@/lib/events/types'

export interface SanityEventSecretInfo {
  _id: string
  _type: 'eventSecretInfo'
  eventSlug: string
  streamingUrl?: string
  notes?: string
}

export async function getEventSecretInfo(
  eventSlug: string
): Promise<EventSecretInfo | null> {
  try {
    const query = `*[_type == "eventSecretInfo" && eventSlug == $eventSlug][0]{
      streamingUrl,
      notes
    }`

    const result = await sanityClient.fetch<SanityEventSecretInfo | null>(
      query,
      { eventSlug }
    )

    if (!result) {
      return null
    }

    return {
      streamingUrl: result.streamingUrl,
      notes: result.notes,
    }
  } catch (error) {
    console.error('Error fetching event secret info:', error)
    return null
  }
}
