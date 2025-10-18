import { EventRegistrationService } from '../service'
import { EventRegistrationRepository } from '../repository'
import { AttendanceType } from '@/lib/events/types'
import type { EventRegistration, CreateEventRegistrationInput } from '../types'

jest.mock('../repository')

/**
 * E2E tests for waitlist functionality
 * Tests the complete flow from registration to confirmation
 */
describe('Waitlist E2E Tests', () => {
  let service: EventRegistrationService
  let mockRepository: jest.Mocked<EventRegistrationRepository>

  const mockEvent = {
    maxCapacity: 2,
    slug: 'test-event',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    service = new EventRegistrationService()
    mockRepository =
      EventRegistrationRepository.prototype as jest.Mocked<EventRegistrationRepository>
  })

  describe('Registration with capacity management', () => {
    it('should confirm first physical registrations until capacity is reached', async () => {
      const input1: CreateEventRegistrationInput = {
        eventSlug: 'test-event',
        name: 'User 1',
        email: 'user1@example.com',
        slackUserId: 'U001',
        organisation: 'Org A',
        attendanceType: AttendanceType.Physical,
      }

      const input2: CreateEventRegistrationInput = {
        eventSlug: 'test-event',
        name: 'User 2',
        email: 'user2@example.com',
        slackUserId: 'U002',
        organisation: 'Org B',
        attendanceType: AttendanceType.Physical,
      }

      // First registration - should be confirmed
      mockRepository.findByEventAndUser.mockResolvedValueOnce(null)
      mockRepository.getPhysicalAttendeesCount.mockResolvedValueOnce(0)
      mockRepository.create.mockResolvedValueOnce({
        ...input1,
        _id: 'reg-1',
        registeredAt: new Date(),
        status: 'confirmed',
      })

      const result1 = await service.registerForEvent(input1, mockEvent)
      expect(result1.status).toBe('confirmed')
      expect(mockRepository.create).toHaveBeenCalledWith(input1, 'confirmed')

      // Second registration - should be confirmed (at capacity)
      mockRepository.findByEventAndUser.mockResolvedValueOnce(null)
      mockRepository.getPhysicalAttendeesCount.mockResolvedValueOnce(1)
      mockRepository.create.mockResolvedValueOnce({
        ...input2,
        _id: 'reg-2',
        registeredAt: new Date(),
        status: 'confirmed',
      })

      const result2 = await service.registerForEvent(input2, mockEvent)
      expect(result2.status).toBe('confirmed')
    })

    it('should place third physical registration on waitlist when at capacity', async () => {
      const input3: CreateEventRegistrationInput = {
        eventSlug: 'test-event',
        name: 'User 3',
        email: 'user3@example.com',
        slackUserId: 'U003',
        organisation: 'Org C',
        attendanceType: AttendanceType.Physical,
      }

      // Third registration - should be waitlisted (capacity = 2)
      mockRepository.findByEventAndUser.mockResolvedValueOnce(null)
      mockRepository.getPhysicalAttendeesCount.mockResolvedValueOnce(2)
      mockRepository.create.mockResolvedValueOnce({
        ...input3,
        _id: 'reg-3',
        registeredAt: new Date(),
        status: 'waitlist',
      })

      const result3 = await service.registerForEvent(input3, mockEvent)
      expect(result3.status).toBe('waitlist')
      expect(mockRepository.create).toHaveBeenCalledWith(input3, 'waitlist')
    })

    it('should always confirm digital registrations regardless of capacity', async () => {
      const digitalInput: CreateEventRegistrationInput = {
        eventSlug: 'test-event',
        name: 'Digital User',
        email: 'digital@example.com',
        slackUserId: 'U004',
        organisation: 'Org D',
        attendanceType: AttendanceType.Digital,
      }

      // Digital registration - should always be confirmed
      mockRepository.findByEventAndUser.mockResolvedValueOnce(null)
      mockRepository.getPhysicalAttendeesCount.mockResolvedValueOnce(2) // At capacity
      mockRepository.create.mockResolvedValueOnce({
        ...digitalInput,
        _id: 'reg-digital',
        registeredAt: new Date(),
        status: 'confirmed',
      })

      const result = await service.registerForEvent(digitalInput, mockEvent)
      expect(result.status).toBe('confirmed')
      // getPhysicalAttendeesCount should not affect digital registrations
    })

    it('should confirm registration when event has no capacity limit', async () => {
      const input: CreateEventRegistrationInput = {
        eventSlug: 'test-event',
        name: 'User',
        email: 'user@example.com',
        slackUserId: 'U005',
        organisation: 'Org E',
        attendanceType: AttendanceType.Physical,
      }

      mockRepository.findByEventAndUser.mockResolvedValueOnce(null)
      mockRepository.create.mockResolvedValueOnce({
        ...input,
        _id: 'reg-5',
        registeredAt: new Date(),
        status: 'confirmed',
      })

      // No event or no maxCapacity means unlimited capacity
      const result = await service.registerForEvent(input)
      expect(result.status).toBe('confirmed')
    })
  })

  describe('Admin confirmation of waitlisted participants', () => {
    it('should move waitlisted participant to confirmed status', async () => {
      const waitlistedRegistration: EventRegistration = {
        _id: 'reg-waitlist',
        eventSlug: 'test-event',
        name: 'Waitlist User',
        email: 'waitlist@example.com',
        slackUserId: 'U006',
        organisation: 'Org F',
        attendanceType: AttendanceType.Physical,
        registeredAt: new Date(),
        status: 'waitlist',
      }

      mockRepository.findById.mockResolvedValueOnce(waitlistedRegistration)
      mockRepository.update.mockResolvedValueOnce({
        ...waitlistedRegistration,
        status: 'confirmed',
      })

      const result = await service.confirmFromWaitlist('reg-waitlist')

      expect(result.status).toBe('confirmed')
      expect(mockRepository.update).toHaveBeenCalledWith('reg-waitlist', {
        status: 'confirmed',
      })
    })

    it('should handle bulk confirmation of multiple waitlisted participants', async () => {
      const waitlistIds = ['reg-w1', 'reg-w2', 'reg-w3']
      const mockWaitlistRegistration: EventRegistration = {
        _id: '',
        eventSlug: 'test-event',
        name: 'Waitlist User',
        email: 'waitlist@example.com',
        slackUserId: 'U007',
        organisation: 'Org G',
        attendanceType: AttendanceType.Physical,
        registeredAt: new Date(),
        status: 'waitlist',
      }

      mockRepository.findById.mockResolvedValue(mockWaitlistRegistration)
      mockRepository.update.mockResolvedValue({
        ...mockWaitlistRegistration,
        status: 'confirmed',
      })

      const results = await service.bulkUpdateStatus(waitlistIds, 'confirmed')

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.status).toBe('confirmed')
      })
      expect(mockRepository.update).toHaveBeenCalledTimes(3)
    })
  })

  describe('Cancellation and re-registration with capacity', () => {
    it('should place re-registering user on waitlist if capacity is reached', async () => {
      const input: CreateEventRegistrationInput = {
        eventSlug: 'test-event',
        name: 'User',
        email: 'user@example.com',
        slackUserId: 'U008',
        organisation: 'Org H',
        attendanceType: AttendanceType.Physical,
      }

      const cancelledRegistration: EventRegistration = {
        ...input,
        _id: 'reg-cancelled',
        registeredAt: new Date(),
        status: 'cancelled',
      }

      mockRepository.findByEventAndUser.mockResolvedValueOnce(
        cancelledRegistration
      )
      mockRepository.getPhysicalAttendeesCount.mockResolvedValueOnce(2) // At capacity
      mockRepository.update.mockResolvedValueOnce({
        ...cancelledRegistration,
        status: 'waitlist',
        metadata: {
          reregisteredAt: expect.any(String),
        },
      })

      const result = await service.registerForEvent(input, mockEvent)

      expect(result.status).toBe('waitlist')
      expect(mockRepository.update).toHaveBeenCalledWith(
        'reg-cancelled',
        expect.objectContaining({
          status: 'waitlist',
          metadata: expect.objectContaining({
            reregisteredAt: expect.any(String),
          }),
        })
      )
    })

    it('should confirm re-registering user if capacity is available', async () => {
      const input: CreateEventRegistrationInput = {
        eventSlug: 'test-event',
        name: 'User',
        email: 'user@example.com',
        slackUserId: 'U009',
        organisation: 'Org I',
        attendanceType: AttendanceType.Physical,
      }

      const cancelledRegistration: EventRegistration = {
        ...input,
        _id: 'reg-cancelled-2',
        registeredAt: new Date(),
        status: 'cancelled',
      }

      mockRepository.findByEventAndUser.mockResolvedValueOnce(
        cancelledRegistration
      )
      mockRepository.getPhysicalAttendeesCount.mockResolvedValueOnce(1) // Space available
      mockRepository.update.mockResolvedValueOnce({
        ...cancelledRegistration,
        status: 'confirmed',
        metadata: {
          reregisteredAt: expect.any(String),
        },
      })

      const result = await service.registerForEvent(input, mockEvent)

      expect(result.status).toBe('confirmed')
    })
  })

  describe('Waitlist statistics', () => {
    it('should correctly count waitlist registrations in stats', async () => {
      const registrations: EventRegistration[] = [
        {
          _id: 'r1',
          eventSlug: 'test-event',
          name: 'User 1',
          email: 'user1@example.com',
          slackUserId: 'U1',
          organisation: 'Org A',
          attendanceType: AttendanceType.Physical,
          registeredAt: new Date(),
          status: 'confirmed',
        },
        {
          _id: 'r2',
          eventSlug: 'test-event',
          name: 'User 2',
          email: 'user2@example.com',
          slackUserId: 'U2',
          organisation: 'Org B',
          attendanceType: AttendanceType.Physical,
          registeredAt: new Date(),
          status: 'confirmed',
        },
        {
          _id: 'r3',
          eventSlug: 'test-event',
          name: 'User 3',
          email: 'user3@example.com',
          slackUserId: 'U3',
          organisation: 'Org C',
          attendanceType: AttendanceType.Physical,
          registeredAt: new Date(),
          status: 'waitlist',
        },
        {
          _id: 'r4',
          eventSlug: 'test-event',
          name: 'User 4',
          email: 'user4@example.com',
          slackUserId: 'U4',
          organisation: 'Org D',
          attendanceType: AttendanceType.Physical,
          registeredAt: new Date(),
          status: 'waitlist',
        },
      ]

      mockRepository.findMany.mockResolvedValueOnce(registrations)

      const stats = await service.getEventRegistrationStats('test-event')

      expect(stats.confirmed).toBe(2)
      expect(stats.waitlist).toBe(2)
      expect(stats.cancelled).toBe(0)
      expect(stats.attended).toBe(0)
      expect(stats['no-show']).toBe(0)
    })
  })
})
