export interface TalkRating {
  talkTitle: string
  rating: number
  comment?: string
}

export interface TopicSuggestion {
  topic: string
  willingToPresent: boolean
}

export interface EventFeedback {
  _id?: string
  eventSlug: string
  slackUserId: string
  name: string
  email: string
  talkRatings: TalkRating[]
  eventRating: number
  eventComment?: string
  topicSuggestions: TopicSuggestion[]
  submittedAt: Date
  metadata?: FeedbackMetadata
}

interface FeedbackMetadata {
  userAgent?: string
  submissionSource?: string
  [key: string]: unknown
}

export interface CreateEventFeedbackInput {
  eventSlug: string
  slackUserId: string
  name: string
  email: string
  talkRatings: TalkRating[]
  eventRating: number
  eventComment?: string
  topicSuggestions: TopicSuggestion[]
  metadata?: FeedbackMetadata
}

export interface EventFeedbackQuery {
  eventSlug?: string
  slackUserId?: string
  limit?: number
  offset?: number
}

export interface TalkFeedbackSummary {
  talkTitle: string
  averageRating: number
  totalRatings: number
  comments: string[]
}

export interface EventFeedbackSummary {
  eventSlug: string
  totalResponses: number
  averageEventRating: number
  talkSummaries: TalkFeedbackSummary[]
  topicSuggestions: Array<{
    topic: string
    count: number
    willingToPresentCount: number
  }>
  eventComments: string[]
}
