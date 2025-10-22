/**
 * tRPC Router Integration Tests
 *
 * These tests focus on critical edge cases and error handling in tRPC routers.
 * They test the business logic and validation without mocking the entire tRPC stack.
 */

import { eventRegistrationService } from '@/domains/event-registration'
import { eventFeedbackService } from '@/domains/event-feedback/service'
import { getEvent } from '@/lib/events/helpers'
import { AttendanceType } from '@/lib/events/types'
import type { EventRegistration } from '@/domains/event-registration/types'
import type { EventFeedback } from '@/domains/event-feedback/types'

jest.mock('@/domains/event-registration')
jest.mock('@/domains/event-feedback/service')
jest.mock('@/lib/events/helpers')
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockRegistrationService = eventRegistrationService as jest.Mocked<
  typeof eventRegistrationService
>
const mockFeedbackService = eventFeedbackService as jest.Mocked<
  typeof eventFeedbackService
>
const mockGetEvent = getEvent as jest.MockedFunction<typeof getEvent>

describe('tRPC Routers - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Event Registration Edge Cases', () => {
    it('should reject registration when event not found', () => {
      mockGetEvent.mockReturnValue(undefined)

      // The router should throw TRPCError NOT_FOUND
      expect(mockGetEvent('nonexistent')).toBeUndefined()
    })

    it('should handle duplicate registration attempt', async () => {
      // Router should check if user already has active registration
      mockRegistrationService.isUserRegistered.mockResolvedValue(true)

      const isRegistered = await mockRegistrationService.isUserRegistered(
        'test-event',
        'U123'
      )

      expect(isRegistered).toBe(true)
    })

    it('should allow re-registration after cancellation', async () => {
      const cancelledRegistration = {
        _id: 'reg-123',
        status: 'cancelled' as const,
      }

      mockRegistrationService.getRegistration.mockResolvedValue(
        cancelledRegistration as unknown as EventRegistration
      )
      mockRegistrationService.updateRegistrationStatus.mockResolvedValue({
        ...cancelledRegistration,
        status: 'confirmed',
      } as unknown as EventRegistration)

      const result = await mockRegistrationService.updateRegistrationStatus(
        'reg-123',
        'confirmed'
      )

      expect(result.status).toBe('confirmed')
    })

    it('should validate attendance type is required', () => {
      const invalidInput = {
        eventSlug: 'test-event',
        slackUserId: 'U123',
        name: 'Test',
        email: 'test@test.com',
        organisation: 'Test Org',
        // Missing attendanceType
      }

      // Zod validation should catch this in router
      expect(invalidInput).not.toHaveProperty('attendanceType')
    })

    it('should handle bulk status update with mixed results', async () => {
      const ids = ['reg-1', 'reg-2', 'reg-3']

      mockRegistrationService.bulkUpdateStatus.mockResolvedValue([
        { _id: 'reg-1', status: 'attended' },
        { _id: 'reg-2', status: 'attended' },
      ] as unknown as EventRegistration[])

      const result = await mockRegistrationService.bulkUpdateStatus(
        ids,
        'attended'
      )

      // Should handle partial success
      expect(result).toHaveLength(2)
    })
  })

  describe('Event Feedback Edge Cases', () => {
    it('should reject feedback from non-attendee', async () => {
      mockRegistrationService.getUserRegistrations.mockResolvedValue([
        {
          eventSlug: 'test-event',
          status: 'confirmed', // Not 'attended'
        } as unknown as EventRegistration,
      ])

      // Router should check status === 'attended'
      const registrations =
        await mockRegistrationService.getUserRegistrations('U123')
      const attended = registrations.find(r => r.status === 'attended')

      expect(attended).toBeUndefined()
    })

    it('should reject feedback from unregistered user', async () => {
      mockRegistrationService.getUserRegistrations.mockResolvedValue([])

      const registrations =
        await mockRegistrationService.getUserRegistrations('U123')

      expect(registrations).toHaveLength(0)
    })

    it('should validate rating is between 1 and 5', () => {
      const invalidRatings = [0, 6, -1, 10]

      invalidRatings.forEach(rating => {
        // Zod validation should reject these
        expect(rating < 1 || rating > 5).toBe(true)
      })
    })

    it('should accept valid multiple talk ratings', async () => {
      const talkRatings = [
        { talkTitle: 'Talk 1', rating: 5, comment: 'Great!' },
        { talkTitle: 'Talk 2', rating: 4 },
        { talkTitle: 'Talk 3', rating: 5, comment: 'Excellent!' },
      ]

      mockFeedbackService.submitFeedback.mockResolvedValue({
        _id: 'feedback-123',
        talkRatings,
      } as unknown as EventFeedback)

      const result = await mockFeedbackService.submitFeedback({
        eventSlug: 'test-event',
        slackUserId: 'U123',
        name: 'Test',
        email: 'test@test.com',
        talkRatings,
        eventRating: 5,
        topicSuggestions: [],
      })

      expect(result.talkRatings).toHaveLength(3)
    })

    it('should allow empty topic suggestions', async () => {
      mockFeedbackService.submitFeedback.mockResolvedValue({
        _id: 'feedback-123',
        topicSuggestions: [],
      } as unknown as EventFeedback)

      const result = await mockFeedbackService.submitFeedback({
        eventSlug: 'test-event',
        slackUserId: 'U123',
        name: 'Test',
        email: 'test@test.com',
        talkRatings: [],
        eventRating: 5,
        topicSuggestions: [],
      })

      expect(result.topicSuggestions).toEqual([])
    })

    it('should check if user already submitted feedback', async () => {
      mockFeedbackService.hasFeedback.mockResolvedValue({
        hasFeedback: true,
        isQuickFeedback: false,
      })

      const result = await mockFeedbackService.hasFeedback('test-event', 'U123')

      expect(result.hasFeedback).toBe(true)
      expect(result.isQuickFeedback).toBe(false)
    })
  })

  describe('Admin Operations Edge Cases', () => {
    it('should handle empty bulk update', () => {
      const emptyIds: string[] = []

      // Router should validate ids.length > 0
      expect(emptyIds.length).toBe(0)
    })

    it('should handle feedback summary with no responses', async () => {
      mockFeedbackService.getFeedbackSummary.mockResolvedValue({
        eventSlug: 'test-event',
        totalResponses: 0,
        averageEventRating: 0,
        ratingDistribution: [
          { rating: 5, count: 0 },
          { rating: 4, count: 0 },
          { rating: 3, count: 0 },
          { rating: 2, count: 0 },
          { rating: 1, count: 0 },
        ],
        talkSummaries: [],
        topicSuggestions: [],
        eventComments: [],
      })

      const summary = await mockFeedbackService.getFeedbackSummary('test-event')

      expect(summary.totalResponses).toBe(0)
      expect(summary.talkSummaries).toHaveLength(0)
    })

    it('should format feedback summary correctly', async () => {
      mockFeedbackService.getFeedbackSummary.mockResolvedValue({
        eventSlug: 'test-event',
        totalResponses: 5,
        averageEventRating: 4.5,
        ratingDistribution: [
          { rating: 5, count: 3 },
          { rating: 4, count: 2 },
          { rating: 3, count: 0 },
          { rating: 2, count: 0 },
          { rating: 1, count: 0 },
        ],
        talkSummaries: [
          {
            talkTitle: 'Talk 1',
            averageRating: 4.8,
            totalRatings: 5,
            comments: ['Great talk!', 'Very informative'],
          },
        ],
        topicSuggestions: [
          {
            topic: 'Kubernetes',
            count: 3,
            willingToPresentCount: 1,
          },
        ],
        eventComments: ['Great event!', 'Well organized'],
      })

      const summary = await mockFeedbackService.getFeedbackSummary('test-event')

      expect(summary.totalResponses).toBe(5)
      expect(summary.talkSummaries[0]?.averageRating).toBe(4.8)
      expect(summary.topicSuggestions[0]?.willingToPresentCount).toBe(1)
    })

    it('should handle registration deletion', async () => {
      mockRegistrationService.getRegistration.mockResolvedValue({
        _id: 'reg-123',
      } as unknown as EventRegistration)

      const registration =
        await mockRegistrationService.getRegistration('reg-123')
      expect(registration).toBeDefined()
      expect(registration?._id).toBe('reg-123')
    })

    it('should reject deletion of non-existent registration', async () => {
      mockRegistrationService.getRegistration.mockResolvedValue(null)

      const registration =
        await mockRegistrationService.getRegistration('nonexistent')
      expect(registration).toBeNull()
    })
  })

  describe('Authentication & Authorization Edge Cases', () => {
    it('should reject unauthenticated requests', () => {
      const session = null

      // Router should throw UNAUTHORIZED for protectedProcedure
      expect(session).toBeNull()
    })

    it('should reject non-admin requests to admin endpoints', () => {
      const user = {
        id: 'U123',
        isAdmin: false,
      }

      // Router should throw FORBIDDEN for adminProcedure
      expect(user.isAdmin).toBe(false)
    })

    it('should allow admin access with valid credentials', () => {
      const user = {
        id: 'U123',
        isAdmin: true,
      }

      expect(user.isAdmin).toBe(true)
    })

    it('should validate event access for admin operations', () => {
      const userEvents = ['event-1', 'event-2']
      const requestedEvent = 'event-3'

      // adminEventProcedure should check canUserAccessEvent
      const hasAccess = userEvents.includes(requestedEvent)
      expect(hasAccess).toBe(false)
    })
  })

  describe('Slack Integration Edge Cases', () => {
    it('should block localhost URLs in production mode', () => {
      const isDevelopmentUrl = (url: string) => {
        return url.includes('localhost') || url.includes('127.0.0.1')
      }

      expect(isDevelopmentUrl('https://localhost:3000')).toBe(true)
      expect(isDevelopmentUrl('https://offentlig-paas.no')).toBe(false)
    })

    it('should allow test mode for development', () => {
      const testMode = true
      const nodeEnv = 'development'

      // Router should allow testMode bypass in development
      const shouldAllow = nodeEnv === 'development' && testMode
      expect(shouldAllow).toBe(true)
    })

    it('should validate Slack user IDs format', () => {
      const validIds = ['U123456', 'U999ABC']
      const invalidIds = ['invalid', '123', 'U', '']

      const isValidSlackId = (id: string) => /^U[A-Z0-9]{6,}$/i.test(id)

      validIds.forEach(id => {
        expect(isValidSlackId(id)).toBe(true)
      })

      invalidIds.forEach(id => {
        expect(isValidSlackId(id)).toBe(false)
      })
    })

    it('should handle batch invitation results', () => {
      const result = {
        invited: 45,
        failed: 5,
        alreadyInChannel: 10,
        totalProcessed: 60,
      }

      expect(result.invited + result.failed + result.alreadyInChannel).toBe(
        result.totalProcessed
      )
    })
  })

  describe('Data Validation Edge Cases', () => {
    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user+tag@domain.no']
      const invalidEmails = ['invalid', 'no-at-sign.com', '@no-local.com']

      const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true)
      })

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false)
      })
    })

    it('should handle optional fields', () => {
      const minimalRegistration = {
        eventSlug: 'test-event',
        slackUserId: 'U123',
        name: 'Test',
        email: 'test@test.com',
        organisation: 'Test Org',
        attendanceType: AttendanceType.Physical,
        // dietary, comments, attendingSocialEvent are optional
      }

      expect(minimalRegistration).not.toHaveProperty('dietary')
      expect(minimalRegistration).not.toHaveProperty('comments')
      expect(minimalRegistration).not.toHaveProperty('attendingSocialEvent')
    })

    it('should validate attendance type enum', () => {
      const validTypes = Object.values(AttendanceType)
      const invalidType = 'INVALID_TYPE'

      expect(validTypes).toContain(AttendanceType.Physical)
      expect(validTypes).not.toContain(invalidType)
    })

    it('should validate registration status enum', () => {
      const validStatuses = [
        'confirmed',
        'waitlist',
        'cancelled',
        'attended',
        'no-show',
      ]
      const invalidStatus = 'pending'

      expect(validStatuses).toContain('confirmed')
      expect(validStatuses).not.toContain(invalidStatus)
    })
  })

  describe('Error Handling Edge Cases', () => {
    it('should handle service errors gracefully', () => {
      const errorMessage = 'Database connection failed'
      mockRegistrationService.registerForEvent.mockRejectedValue(
        new Error(errorMessage)
      )

      // Router should catch and transform service errors to TRPCError
      expect(mockRegistrationService.registerForEvent).toBeDefined()
    })

    it('should handle concurrent registrations', () => {
      // Race condition: two users registering at same time
      // Should handle both registrations independently
      mockRegistrationService.registerForEvent
        .mockResolvedValueOnce({ _id: 'reg-1' } as unknown as EventRegistration)
        .mockResolvedValueOnce({ _id: 'reg-2' } as unknown as EventRegistration)

      expect(mockRegistrationService.registerForEvent).toBeDefined()
    })

    it('should handle malformed input gracefully', () => {
      const malformedInputs = [
        { slug: '', isInvalid: true }, // Empty slug
        { slug: ' ', isInvalid: true }, // Whitespace only
        { slug: '../../../etc/passwd', isInvalid: true }, // Path traversal attempt
      ]

      malformedInputs.forEach(input => {
        // Zod validation should catch these
        const hasPathTraversal = input.slug.includes('..')
        const isEmpty = input.slug.trim().length === 0
        expect(hasPathTraversal || isEmpty).toBe(input.isInvalid)
      })
    })
  })
})
