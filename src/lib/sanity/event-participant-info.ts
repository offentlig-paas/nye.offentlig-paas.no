import { sanityClient } from './config'
import type { EventParticipantInfo } from '@/lib/events/types'

interface SanityEventParticipantInfo {
  _id: string
  _type: 'eventParticipantInfo'
  eventSlug: string
  streamingUrl?: string
  notes?: string
}

export async function getEventParticipantInfo(
  eventSlug: string
): Promise<EventParticipantInfo | null> {
  try {
    const query = `*[_type == "eventParticipantInfo" && eventSlug == $eventSlug][0]{
      streamingUrl,
      notes
    }`

    const result = await sanityClient.fetch<SanityEventParticipantInfo | null>(
      query,
      { eventSlug },
      { cache: 'no-store' }
    )

    if (!result) {
      return null
    }

    return {
      streamingUrl: result.streamingUrl,
      notes: result.notes,
    }
  } catch (error) {
    console.error('Error fetching participant info:', error)
    return null
  }
}

export async function upsertEventParticipantInfo(
  eventSlug: string,
  info: Partial<EventParticipantInfo>
): Promise<SanityEventParticipantInfo | null> {
  try {
    const query = `*[_type == "eventParticipantInfo" && eventSlug == $eventSlug][0]`
    const existing =
      await sanityClient.fetch<SanityEventParticipantInfo | null>(
        query,
        {
          eventSlug,
        },
        { cache: 'no-store' }
      )

    if (existing) {
      const updated = await sanityClient
        .patch(existing._id)
        .set({
          streamingUrl: info.streamingUrl,
          notes: info.notes,
        })
        .commit()

      return updated as unknown as SanityEventParticipantInfo
    } else {
      const created = await sanityClient.create({
        _type: 'eventParticipantInfo',
        eventSlug,
        streamingUrl: info.streamingUrl,
        notes: info.notes,
      })

      return created as unknown as SanityEventParticipantInfo
    }
  } catch (error) {
    console.error('Error upserting participant info:', error)
    return null
  }
}
