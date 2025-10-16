import type {
  CreateEventFeedbackInput,
  EventFeedback,
  EventFeedbackSummary,
  TalkFeedbackSummary,
} from './types'
import { EventFeedbackRepository } from './repository'

export class EventFeedbackService {
  private repository: EventFeedbackRepository

  constructor() {
    this.repository = new EventFeedbackRepository()
  }

  async submitFeedback(
    input: CreateEventFeedbackInput
  ): Promise<EventFeedback> {
    const existingFeedback = await this.repository.findByEventAndUser(
      input.eventSlug,
      input.slackUserId
    )

    if (existingFeedback) {
      throw new Error('User has already submitted feedback for this event')
    }

    this.validateFeedbackInput(input)

    return await this.repository.create({
      ...input,
      submittedAt: new Date(),
    })
  }

  async getEventFeedback(eventSlug: string): Promise<EventFeedback[]> {
    return await this.repository.findMany({ eventSlug })
  }

  async getUserFeedback(
    eventSlug: string,
    slackUserId: string
  ): Promise<EventFeedback | null> {
    return await this.repository.findByEventAndUser(eventSlug, slackUserId)
  }

  async getFeedbackSummary(eventSlug: string): Promise<EventFeedbackSummary> {
    const feedback = await this.getEventFeedback(eventSlug)

    if (feedback.length === 0) {
      return {
        eventSlug,
        totalResponses: 0,
        averageEventRating: 0,
        talkSummaries: [],
        topicSuggestions: [],
        eventComments: [],
      }
    }

    // Calculate average event rating
    const totalEventRating = feedback.reduce(
      (sum, fb) => sum + fb.eventRating,
      0
    )
    const averageEventRating = totalEventRating / feedback.length

    // Aggregate talk ratings
    const talkMap = new Map<string, { ratings: number[]; comments: string[] }>()

    feedback.forEach(fb => {
      fb.talkRatings.forEach(tr => {
        if (!talkMap.has(tr.talkTitle)) {
          talkMap.set(tr.talkTitle, { ratings: [], comments: [] })
        }
        const talk = talkMap.get(tr.talkTitle)!
        talk.ratings.push(tr.rating)
        if (tr.comment) {
          talk.comments.push(tr.comment)
        }
      })
    })

    const talkSummaries: TalkFeedbackSummary[] = Array.from(
      talkMap.entries()
    ).map(([talkTitle, data]) => ({
      talkTitle,
      averageRating:
        data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
      totalRatings: data.ratings.length,
      comments: data.comments,
    }))

    // Aggregate topic suggestions
    const topicMap = new Map<
      string,
      { count: number; willingToPresentCount: number }
    >()

    feedback.forEach(fb => {
      fb.topicSuggestions.forEach(ts => {
        const normalizedTopic = ts.topic.toLowerCase().trim()
        if (!topicMap.has(normalizedTopic)) {
          topicMap.set(normalizedTopic, { count: 0, willingToPresentCount: 0 })
        }
        const topic = topicMap.get(normalizedTopic)!
        topic.count++
        if (ts.willingToPresent) {
          topic.willingToPresentCount++
        }
      })
    })

    const topicSuggestions = Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        willingToPresentCount: data.willingToPresentCount,
      }))
      .sort((a, b) => b.count - a.count)

    // Collect event comments
    const eventComments = feedback
      .filter(fb => fb.eventComment)
      .map(fb => fb.eventComment!)

    return {
      eventSlug,
      totalResponses: feedback.length,
      averageEventRating,
      talkSummaries,
      topicSuggestions,
      eventComments,
    }
  }

  async deleteFeedback(feedbackId: string): Promise<boolean> {
    return await this.repository.delete(feedbackId)
  }

  async hasFeedback(eventSlug: string, slackUserId: string): Promise<boolean> {
    const feedback = await this.repository.findByEventAndUser(
      eventSlug,
      slackUserId
    )
    return feedback !== null
  }

  private validateFeedbackInput(input: CreateEventFeedbackInput): void {
    if (input.eventRating < 1 || input.eventRating > 5) {
      throw new Error('Event rating must be between 1 and 5')
    }

    input.talkRatings.forEach(tr => {
      if (tr.rating < 1 || tr.rating > 5) {
        throw new Error('Talk rating must be between 1 and 5')
      }
    })

    if (input.talkRatings.length === 0) {
      throw new Error('At least one talk rating is required')
    }
  }
}

export const eventFeedbackService = new EventFeedbackService()
