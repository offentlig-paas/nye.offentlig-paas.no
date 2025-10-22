import { sanityClient } from '@/lib/sanity/config'
import { prepareSanityDocument } from '@/lib/sanity/utils'
import type { EventFeedback, EventFeedbackQuery } from './types'

export class EventFeedbackRepository {
  async create(feedback: Omit<EventFeedback, '_id'>): Promise<EventFeedback> {
    const preparedDoc = prepareSanityDocument({
      _type: 'eventFeedback',
      ...feedback,
      submittedAt: new Date().toISOString(),
    })

    const doc = await sanityClient.create(preparedDoc)

    return {
      ...feedback,
      _id: doc._id,
      submittedAt: new Date(doc.submittedAt),
    }
  }

  async findMany(query: EventFeedbackQuery): Promise<EventFeedback[]> {
    let sanityQuery = '*[_type == "eventFeedback"'
    const params: Record<string, unknown> = {}

    if (query.eventSlug) {
      sanityQuery += ' && eventSlug == $eventSlug'
      params.eventSlug = query.eventSlug
    }

    if (query.slackUserId) {
      sanityQuery += ' && slackUserId == $slackUserId'
      params.slackUserId = query.slackUserId
    }

    sanityQuery += '] | order(submittedAt desc)'

    if (query.offset) {
      sanityQuery += `[${query.offset}...`
      if (query.limit) {
        sanityQuery += `${query.offset + query.limit}]`
      } else {
        sanityQuery += ']'
      }
    } else if (query.limit) {
      sanityQuery += `[0...${query.limit}]`
    }

    const results = await sanityClient.fetch<EventFeedback[]>(
      sanityQuery,
      params
    )

    return results.map(r => ({
      ...r,
      submittedAt: new Date(r.submittedAt),
    }))
  }

  async findByEventAndUser(
    eventSlug: string,
    slackUserId: string
  ): Promise<EventFeedback | null> {
    const feedback = await this.findMany({ eventSlug, slackUserId, limit: 1 })
    return feedback[0] || null
  }

  async findById(id: string): Promise<EventFeedback | null> {
    const doc = await sanityClient.fetch<EventFeedback | null>(
      '*[_type == "eventFeedback" && _id == $id][0]',
      { id }
    )

    if (!doc) return null

    return {
      ...doc,
      submittedAt: new Date(doc.submittedAt),
    }
  }

  async update(
    id: string,
    feedback: Partial<Omit<EventFeedback, '_id'>>
  ): Promise<EventFeedback> {
    const preparedDoc = prepareSanityDocument(feedback)

    const updatedDoc = await sanityClient
      .patch(id)
      .set({
        ...preparedDoc,
        submittedAt: new Date().toISOString(),
      })
      .commit()

    return {
      ...(updatedDoc as unknown as EventFeedback),
      submittedAt: new Date(updatedDoc.submittedAt as string),
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await sanityClient.delete(id)
      return true
    } catch {
      return false
    }
  }

  async count(query: EventFeedbackQuery): Promise<number> {
    let sanityQuery = 'count(*[_type == "eventFeedback"'
    const params: Record<string, unknown> = {}

    if (query.eventSlug) {
      sanityQuery += ' && eventSlug == $eventSlug'
      params.eventSlug = query.eventSlug
    }

    if (query.slackUserId) {
      sanityQuery += ' && slackUserId == $slackUserId'
      params.slackUserId = query.slackUserId
    }

    sanityQuery += '])'

    return await sanityClient.fetch<number>(sanityQuery, params)
  }
}
