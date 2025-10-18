import {
  computeStatsFromRegistrations,
  computeCountsFromRegistrations,
  resolveEventStats,
} from '../helpers'
import type { Event } from '../types'
import type { EventRegistration } from '@/domains/event-registration/types'
import type { EventFeedbackSummary } from '@/domains/event-feedback/types'
import { AttendanceType, Audience } from '../types'

describe('Event Stats Helpers', () => {
  describe('computeStatsFromRegistrations', () => {
    it('should compute stats correctly from registrations with mixed statuses', () => {
      const registrations: EventRegistration[] = [
        {
          _id: '1',
          eventSlug: 'test-event',
          name: 'User 1',
          email: 'user1@example.com',
          slackUserId: 'U1',
          organisation: 'Org A',
          status: 'confirmed',
          registeredAt: new Date(),
        },
        {
          _id: '2',
          eventSlug: 'test-event',
          name: 'User 2',
          email: 'user2@example.com',
          slackUserId: 'U2',
          organisation: 'Org B',
          status: 'attended',
          registeredAt: new Date(),
        },
        {
          _id: '3',
          eventSlug: 'test-event',
          name: 'User 3',
          email: 'user3@example.com',
          slackUserId: 'U3',
          organisation: 'Org A',
          status: 'cancelled',
          registeredAt: new Date(),
        },
        {
          _id: '4',
          eventSlug: 'test-event',
          name: 'User 4',
          email: 'user4@example.com',
          slackUserId: 'U4',
          organisation: 'Org C',
          status: 'waitlist',
          registeredAt: new Date(),
        },
        {
          _id: '5',
          eventSlug: 'test-event',
          name: 'User 5',
          email: 'user5@example.com',
          slackUserId: 'U5',
          organisation: 'Org A',
          status: 'no-show',
          registeredAt: new Date(),
        },
      ]

      const stats = computeStatsFromRegistrations(registrations)

      expect(stats).toEqual({
        confirmed: 1,
        attended: 1,
        cancelled: 1,
        waitlist: 1,
        'no-show': 1,
      })
    })

    it('should handle empty registrations array', () => {
      const stats = computeStatsFromRegistrations([])

      expect(stats).toEqual({
        confirmed: 0,
        attended: 0,
        cancelled: 0,
        waitlist: 0,
        'no-show': 0,
      })
    })
  })

  describe('computeCountsFromRegistrations', () => {
    it('should compute counts correctly with physical and digital attendance', () => {
      const registrations: EventRegistration[] = [
        {
          _id: '1',
          eventSlug: 'test-event',
          name: 'User 1',
          email: 'user1@example.com',
          slackUserId: 'U1',
          organisation: 'Org A',
          status: 'confirmed',
          attendanceType: AttendanceType.Physical,
          attendingSocialEvent: true,
          registeredAt: new Date(),
        },
        {
          _id: '2',
          eventSlug: 'test-event',
          name: 'User 2',
          email: 'user2@example.com',
          slackUserId: 'U2',
          organisation: 'Org B',
          status: 'attended',
          attendanceType: AttendanceType.Physical,
          attendingSocialEvent: true,
          registeredAt: new Date(),
        },
        {
          _id: '3',
          eventSlug: 'test-event',
          name: 'User 3',
          email: 'user3@example.com',
          slackUserId: 'U3',
          organisation: 'Org C',
          status: 'confirmed',
          attendanceType: AttendanceType.Digital,
          attendingSocialEvent: false,
          registeredAt: new Date(),
        },
        {
          _id: '4',
          eventSlug: 'test-event',
          name: 'User 4',
          email: 'user4@example.com',
          slackUserId: 'U4',
          organisation: 'Org D',
          status: 'cancelled',
          attendanceType: AttendanceType.Physical,
          registeredAt: new Date(),
        },
      ]

      const counts = computeCountsFromRegistrations(registrations)

      expect(counts).toEqual({
        totalActive: 3,
        persons: 3,
        organizations: 3,
        uniqueOrganizations: 3,
        physicalCount: 2,
        digitalCount: 1,
        socialEventCount: 2,
      })
    })

    it('should count unique organizations correctly', () => {
      const registrations: EventRegistration[] = [
        {
          _id: '1',
          eventSlug: 'test-event',
          name: 'User 1',
          email: 'user1@example.com',
          slackUserId: 'U1',
          organisation: 'Org A',
          status: 'confirmed',
          registeredAt: new Date(),
        },
        {
          _id: '2',
          eventSlug: 'test-event',
          name: 'User 2',
          email: 'user2@example.com',
          slackUserId: 'U2',
          organisation: 'Org A  ', // Extra spaces should be trimmed
          status: 'confirmed',
          registeredAt: new Date(),
        },
        {
          _id: '3',
          eventSlug: 'test-event',
          name: 'User 3',
          email: 'user3@example.com',
          slackUserId: 'U3',
          organisation: 'Org B',
          status: 'confirmed',
          registeredAt: new Date(),
        },
      ]

      const counts = computeCountsFromRegistrations(registrations)

      expect(counts.uniqueOrganizations).toBe(2)
    })

    it('should exclude cancelled registrations from counts', () => {
      const registrations: EventRegistration[] = [
        {
          _id: '1',
          eventSlug: 'test-event',
          name: 'User 1',
          email: 'user1@example.com',
          slackUserId: 'U1',
          organisation: 'Org A',
          status: 'confirmed',
          registeredAt: new Date(),
        },
        {
          _id: '2',
          eventSlug: 'test-event',
          name: 'User 2',
          email: 'user2@example.com',
          slackUserId: 'U2',
          organisation: 'Org B',
          status: 'cancelled',
          registeredAt: new Date(),
        },
      ]

      const counts = computeCountsFromRegistrations(registrations)

      expect(counts.persons).toBe(1)
      expect(counts.uniqueOrganizations).toBe(1)
    })
  })

  describe('resolveEventStats', () => {
    const mockEvent: Event = {
      slug: 'test-event',
      title: 'Test Event',
      ingress: 'Test ingress',
      start: new Date('2024-01-01'),
      end: new Date('2024-01-02'),
      location: 'Test Location',
      audience: Audience.PublicSector,
      registration: {
        disabled: false,
        attendanceTypes: [AttendanceType.Physical],
      },
      organizers: [],
      schedule: [],
    }

    const emptyFeedbackSummary: EventFeedbackSummary = {
      eventSlug: 'test-event',
      totalResponses: 0,
      averageEventRating: 0,
      ratingDistribution: [],
      talkSummaries: [],
      topicSuggestions: [],
      eventComments: [],
    }

    it('should use dynamic data when available', () => {
      const registrations: EventRegistration[] = [
        {
          _id: '1',
          eventSlug: 'test-event',
          name: 'User 1',
          email: 'user1@example.com',
          slackUserId: 'U1',
          organisation: 'Org A',
          status: 'confirmed',
          attendanceType: AttendanceType.Physical,
          registeredAt: new Date(),
        },
      ]

      const feedbackSummary: EventFeedbackSummary = {
        eventSlug: 'test-event',
        totalResponses: 5,
        averageEventRating: 4.5,
        ratingDistribution: [],
        talkSummaries: [],
        topicSuggestions: [],
        eventComments: [],
      }

      const result = resolveEventStats(
        mockEvent,
        registrations,
        feedbackSummary
      )

      expect(result.registrations.total).toBe(1)
      expect(result.registrations.participants).toBe(1)
      expect(result.feedback.averageRating).toBe(4.5)
      expect(result.feedback.totalResponses).toBe(5)
      expect(result.feedback.hasLegacyData).toBe(false)
      expect(result.feedback.historicalComments).toEqual([])
    })

    it('should fall back to legacy stats when no dynamic data exists', () => {
      const eventWithLegacyStats: Event = {
        ...mockEvent,
        stats: {
          registrations: 100,
          participants: 85,
          organisations: 20,
          feedback: {
            url: 'https://example.com/feedback',
            averageRating: 4.2,
            respondents: 30,
            comments: ['Great event!', 'Very informative', 'Well organized'],
          },
        },
      }

      const result = resolveEventStats(
        eventWithLegacyStats,
        [],
        emptyFeedbackSummary
      )

      expect(result.registrations.total).toBe(100)
      expect(result.registrations.participants).toBe(85)
      expect(result.registrations.organizations).toBe(20)
      expect(result.feedback.averageRating).toBe(4.2)
      expect(result.feedback.totalResponses).toBe(30)
      expect(result.feedback.hasLegacyData).toBe(true)
      expect(result.feedback.historicalComments).toEqual([
        'Great event!',
        'Very informative',
        'Well organized',
      ])
      expect(result.feedback.historicalFeedbackUrl).toBe(
        'https://example.com/feedback'
      )
    })

    it('should prefer dynamic data over legacy stats when both exist', () => {
      const eventWithLegacyStats: Event = {
        ...mockEvent,
        stats: {
          registrations: 100,
          participants: 85,
          organisations: 20,
          feedback: {
            url: 'https://example.com/feedback',
            averageRating: 4.2,
            respondents: 30,
            comments: ['Old feedback'],
          },
        },
      }

      const registrations: EventRegistration[] = [
        {
          _id: '1',
          eventSlug: 'test-event',
          name: 'User 1',
          email: 'user1@example.com',
          slackUserId: 'U1',
          organisation: 'Org A',
          status: 'confirmed',
          registeredAt: new Date(),
        },
      ]

      const feedbackSummary: EventFeedbackSummary = {
        eventSlug: 'test-event',
        totalResponses: 5,
        averageEventRating: 4.8,
        ratingDistribution: [],
        talkSummaries: [],
        topicSuggestions: [],
        eventComments: [],
      }

      const result = resolveEventStats(
        eventWithLegacyStats,
        registrations,
        feedbackSummary
      )

      // Should use dynamic data
      expect(result.registrations.total).toBe(1)
      expect(result.registrations.participants).toBe(1)
      expect(result.feedback.averageRating).toBe(4.8)
      expect(result.feedback.totalResponses).toBe(5)
      expect(result.feedback.hasLegacyData).toBe(false)
      expect(result.feedback.historicalComments).toEqual([])
    })

    it('should handle empty legacy comments array', () => {
      const eventWithLegacyStats: Event = {
        ...mockEvent,
        stats: {
          registrations: 100,
          participants: 85,
          organisations: 20,
          feedback: {
            url: 'https://example.com/feedback',
            averageRating: 4.2,
            respondents: 30,
            comments: [],
          },
        },
      }

      const result = resolveEventStats(
        eventWithLegacyStats,
        [],
        emptyFeedbackSummary
      )

      expect(result.feedback.historicalComments).toEqual([])
    })

    it('should return zeros when no data exists at all', () => {
      const result = resolveEventStats(mockEvent, [], emptyFeedbackSummary)

      expect(result.registrations.total).toBe(0)
      expect(result.registrations.participants).toBe(0)
      expect(result.registrations.organizations).toBe(0)
      expect(result.feedback.averageRating).toBe(0)
      expect(result.feedback.totalResponses).toBe(0)
      expect(result.feedback.hasLegacyData).toBe(false)
      expect(result.feedback.historicalComments).toEqual([])
    })
  })
})
