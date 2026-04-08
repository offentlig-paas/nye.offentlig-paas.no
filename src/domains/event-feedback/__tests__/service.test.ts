import { vi, type Mocked } from 'vitest'
import { EventFeedbackRepository } from '../repository'
import type { EventFeedback, CreateEventFeedbackInput } from '../types'

vi.mock('../repository')

const { eventFeedbackService: service } = await import('../service')

describe('EventFeedbackService', () => {
  let mockRepo: Mocked<EventFeedbackRepository>

  const baseFeedbackInput: CreateEventFeedbackInput = {
    eventSlug: 'fagdag-2026',
    slackUserId: 'U111',
    name: 'Ola Nordmann',
    email: 'ola@example.com',
    talkRatings: [{ talkTitle: 'Talk A', rating: 4, comment: 'Great' }],
    eventRating: 5,
    eventComment: 'Loved it',
    topicSuggestions: [{ topic: 'Kubernetes', willingToPresent: true }],
    isPublic: true,
  }

  const mockFeedback: EventFeedback = {
    _id: 'fb-1',
    ...baseFeedbackInput,
    submittedAt: new Date('2026-03-15T12:00:00Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo =
      EventFeedbackRepository.prototype as Mocked<EventFeedbackRepository>
  })

  describe('submitFeedback', () => {
    it('should create new feedback when user has no existing feedback', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)
      mockRepo.create.mockResolvedValue(mockFeedback)

      const result = await service.submitFeedback(baseFeedbackInput)

      expect(result).toEqual(mockFeedback)
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventSlug: 'fagdag-2026',
          slackUserId: 'U111',
          eventRating: 5,
        })
      )
    })

    it('should throw when user already has full feedback', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(mockFeedback)

      await expect(service.submitFeedback(baseFeedbackInput)).rejects.toThrow(
        'User has already submitted full feedback for this event'
      )
    })

    it('should allow upgrading from quick to full feedback', async () => {
      const quickFeedback: EventFeedback = {
        ...mockFeedback,
        isQuickFeedback: true,
      }
      const upgraded: EventFeedback = {
        ...mockFeedback,
        isQuickFeedback: false,
      }

      mockRepo.findByEventAndUser.mockResolvedValue(quickFeedback)
      mockRepo.update.mockResolvedValue(upgraded)

      const result = await service.submitFeedback({
        ...baseFeedbackInput,
        isQuickFeedback: false,
      })

      expect(result.isQuickFeedback).toBe(false)
      expect(mockRepo.update).toHaveBeenCalledWith(
        'fb-1',
        expect.objectContaining({ isQuickFeedback: false })
      )
    })

    it('should throw when event rating is out of range', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)

      await expect(
        service.submitFeedback({ ...baseFeedbackInput, eventRating: 0 })
      ).rejects.toThrow('Event rating must be between 1 and 5')

      await expect(
        service.submitFeedback({ ...baseFeedbackInput, eventRating: 6 })
      ).rejects.toThrow('Event rating must be between 1 and 5')
    })

    it('should throw when talk rating is out of range', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)

      await expect(
        service.submitFeedback({
          ...baseFeedbackInput,
          talkRatings: [{ talkTitle: 'Talk A', rating: 0 }],
        })
      ).rejects.toThrow('Talk rating must be between 1 and 5')
    })

    it('should throw when no talk ratings provided for full feedback', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)

      await expect(
        service.submitFeedback({
          ...baseFeedbackInput,
          talkRatings: [],
          isQuickFeedback: false,
        })
      ).rejects.toThrow('At least one talk rating is required')
    })

    it('should skip talk rating requirement for quick feedback', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)
      mockRepo.create.mockResolvedValue({
        ...mockFeedback,
        talkRatings: [],
        isQuickFeedback: true,
      })

      const result = await service.submitFeedback({
        ...baseFeedbackInput,
        talkRatings: [],
        isQuickFeedback: true,
      })

      expect(result.isQuickFeedback).toBe(true)
    })
  })

  describe('submitQuickFeedback', () => {
    it('should create quick feedback with registration info', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)
      mockRepo.create.mockResolvedValue({
        ...mockFeedback,
        isQuickFeedback: true,
        talkRatings: [],
        topicSuggestions: [],
      })

      const result = await service.submitQuickFeedback(
        { eventSlug: 'fagdag-2026', slackUserId: 'U111', eventRating: 4 },
        { name: 'Ola', email: 'ola@test.no' }
      )

      expect(result.isQuickFeedback).toBe(true)
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ola',
          email: 'ola@test.no',
          isQuickFeedback: true,
          metadata: { submissionSource: 'slack' },
        })
      )
    })

    it('should use defaults when no registration provided', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)
      mockRepo.create.mockResolvedValue({
        ...mockFeedback,
        isQuickFeedback: true,
      })

      await service.submitQuickFeedback(
        { eventSlug: 'fagdag-2026', slackUserId: 'U111', eventRating: 3 },
        null
      )

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Slack User',
          email: 'slack@offentlig-paas.no',
        })
      )
    })

    it('should throw when quick feedback already exists', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue({
        ...mockFeedback,
        isQuickFeedback: true,
      })

      await expect(
        service.submitQuickFeedback(
          { eventSlug: 'fagdag-2026', slackUserId: 'U111', eventRating: 4 },
          null
        )
      ).rejects.toThrow('ALREADY_SUBMITTED_QUICK')
    })

    it('should throw when full feedback already exists', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue({
        ...mockFeedback,
        isQuickFeedback: false,
      })

      await expect(
        service.submitQuickFeedback(
          { eventSlug: 'fagdag-2026', slackUserId: 'U111', eventRating: 4 },
          null
        )
      ).rejects.toThrow('ALREADY_SUBMITTED_FULL')
    })

    it('should throw when rating is out of range', async () => {
      await expect(
        service.submitQuickFeedback(
          { eventSlug: 'fagdag-2026', slackUserId: 'U111', eventRating: 0 },
          null
        )
      ).rejects.toThrow('Event rating must be between 1 and 5')
    })
  })

  describe('getEventFeedback', () => {
    it('should return all feedback for an event', async () => {
      mockRepo.findMany.mockResolvedValue([mockFeedback])

      const result = await service.getEventFeedback('fagdag-2026')

      expect(result).toEqual([mockFeedback])
      expect(mockRepo.findMany).toHaveBeenCalledWith({
        eventSlug: 'fagdag-2026',
      })
    })
  })

  describe('getPublicFeedback', () => {
    it('should return only public feedback with comments', async () => {
      const publicFb: EventFeedback = {
        ...mockFeedback,
        isPublic: true,
        eventComment: 'Great event!',
      }
      const privateFb: EventFeedback = {
        ...mockFeedback,
        _id: 'fb-2',
        isPublic: false,
        eventComment: 'Private comment',
      }
      const noCommentFb: EventFeedback = {
        ...mockFeedback,
        _id: 'fb-3',
        isPublic: true,
        eventComment: undefined,
      }

      mockRepo.findMany.mockResolvedValue([publicFb, privateFb, noCommentFb])

      const result = await service.getPublicFeedback('fagdag-2026')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        eventRating: 5,
        eventComment: 'Great event!',
        submittedAt: publicFb.submittedAt,
      })
    })
  })

  describe('getUserFeedback', () => {
    it('should return feedback for a specific user', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(mockFeedback)

      const result = await service.getUserFeedback('fagdag-2026', 'U111')

      expect(result).toEqual(mockFeedback)
    })

    it('should return null when user has no feedback', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)

      const result = await service.getUserFeedback('fagdag-2026', 'U999')

      expect(result).toBeNull()
    })
  })

  describe('hasFeedback', () => {
    it('should return feedback status for user', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(mockFeedback)

      const result = await service.hasFeedback('fagdag-2026', 'U111')

      expect(result).toEqual({
        hasFeedback: true,
        isQuickFeedback: false,
      })
    })

    it('should indicate quick feedback', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue({
        ...mockFeedback,
        isQuickFeedback: true,
      })

      const result = await service.hasFeedback('fagdag-2026', 'U111')

      expect(result).toEqual({
        hasFeedback: true,
        isQuickFeedback: true,
      })
    })

    it('should return false when no feedback exists', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue(null)

      const result = await service.hasFeedback('fagdag-2026', 'U999')

      expect(result).toEqual({
        hasFeedback: false,
        isQuickFeedback: false,
      })
    })
  })

  describe('getFeedbackSummary', () => {
    it('should return empty summary when no feedback exists', async () => {
      mockRepo.findMany.mockResolvedValue([])

      const result = await service.getFeedbackSummary('empty-event')

      expect(result.totalResponses).toBe(0)
      expect(result.averageEventRating).toBe(0)
      expect(result.ratingDistribution).toHaveLength(5)
      expect(result.talkSummaries).toEqual([])
      expect(result.topicSuggestions).toEqual([])
      expect(result.eventComments).toEqual([])
    })

    it('should calculate correct averages and distributions', async () => {
      const feedback: EventFeedback[] = [
        {
          ...mockFeedback,
          _id: 'fb-a',
          eventRating: 5,
          isPublic: true,
          eventComment: 'Excellent',
          talkRatings: [{ talkTitle: 'Talk A', rating: 5, comment: 'Good' }],
          topicSuggestions: [{ topic: 'Kubernetes', willingToPresent: true }],
        },
        {
          ...mockFeedback,
          _id: 'fb-b',
          eventRating: 3,
          isPublic: false,
          eventComment: 'Ok',
          talkRatings: [{ talkTitle: 'Talk A', rating: 3 }],
          topicSuggestions: [{ topic: 'kubernetes', willingToPresent: false }],
        },
        {
          ...mockFeedback,
          _id: 'fb-c',
          eventRating: 4,
          isPublic: true,
          eventComment: 'Nice',
          talkRatings: [
            { talkTitle: 'Talk A', rating: 4 },
            { talkTitle: 'Talk B', rating: 5 },
          ],
          topicSuggestions: [],
        },
      ]

      mockRepo.findMany.mockResolvedValue(feedback)

      const result = await service.getFeedbackSummary('fagdag-2026')

      expect(result.totalResponses).toBe(3)
      expect(result.averageEventRating).toBe(4)
      expect(result.ratingDistribution).toEqual([
        { rating: 5, count: 1 },
        { rating: 4, count: 1 },
        { rating: 3, count: 1 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ])

      // Talk summaries
      const talkA = result.talkSummaries.find(t => t.talkTitle === 'Talk A')
      expect(talkA).toBeDefined()
      expect(talkA!.totalRatings).toBe(3)
      expect(talkA!.averageRating).toBe(4)
      expect(talkA!.comments).toEqual(['Good'])

      const talkB = result.talkSummaries.find(t => t.talkTitle === 'Talk B')
      expect(talkB).toBeDefined()
      expect(talkB!.totalRatings).toBe(1)
      expect(talkB!.averageRating).toBe(5)

      // Topic suggestions (normalized to lowercase)
      expect(result.topicSuggestions).toEqual([
        { topic: 'kubernetes', count: 2, willingToPresentCount: 1 },
      ])

      // Event comments (only public)
      expect(result.eventComments).toEqual(['Excellent', 'Nice'])
    })
  })

  describe('deleteFeedback', () => {
    it('should delete feedback by ID', async () => {
      mockRepo.delete.mockResolvedValue(true)

      const result = await service.deleteFeedback('fb-1')

      expect(result).toBe(true)
      expect(mockRepo.delete).toHaveBeenCalledWith('fb-1')
    })
  })
})
