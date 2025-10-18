import { EventRegistrationService } from '../service'
import { EventRegistrationRepository } from '../repository'
import { AttendanceType } from '@/lib/events/types'
import type {
  EventRegistration,
  CreateEventRegistrationInput,
  RegistrationStatus,
} from '../types'

jest.mock('../repository')

describe('EventRegistrationService', () => {
  let service: EventRegistrationService
  let mockRepository: jest.Mocked<EventRegistrationRepository>

  const mockRegistration: EventRegistration = {
    _id: 'reg-123',
    eventSlug: 'test-event',
    name: 'Test User',
    email: 'test@example.com',
    slackUserId: 'U123456',
    organisation: 'Test Org',
    dietary: 'None',
    comments: 'Test comment',
    attendanceType: AttendanceType.Physical,
    attendingSocialEvent: true,
    registeredAt: new Date('2025-10-13T10:00:00Z'),
    status: 'confirmed',
    metadata: {},
  }

  const validInput: CreateEventRegistrationInput = {
    eventSlug: 'test-event',
    name: 'Test User',
    email: 'test@example.com',
    slackUserId: 'U123456',
    organisation: 'Test Org',
    attendanceType: AttendanceType.Physical,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    service = new EventRegistrationService()
    mockRepository =
      EventRegistrationRepository.prototype as jest.Mocked<EventRegistrationRepository>
  })

  describe('registerForEvent', () => {
    it('should create new registration when user has no existing registration', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue(mockRegistration)

      const result = await service.registerForEvent(validInput)

      expect(result).toEqual(mockRegistration)
      expect(mockRepository.findByEventAndUser).toHaveBeenCalledWith(
        'test-event',
        'U123456'
      )
      expect(mockRepository.create).toHaveBeenCalledWith(
        validInput,
        'confirmed'
      )
    })

    it('should throw error when user already has active registration', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(mockRegistration)

      await expect(service.registerForEvent(validInput)).rejects.toThrow(
        'User is already registered for this event'
      )

      expect(mockRepository.create).not.toHaveBeenCalled()
    })

    it('should allow re-registration when previous registration was cancelled', async () => {
      const cancelledRegistration = {
        ...mockRegistration,
        status: 'cancelled' as RegistrationStatus,
      }
      mockRepository.findByEventAndUser.mockResolvedValue(cancelledRegistration)
      mockRepository.update.mockResolvedValue({
        ...mockRegistration,
        status: 'confirmed',
      })

      const result = await service.registerForEvent(validInput)

      expect(result.status).toBe('confirmed')
      expect(mockRepository.update).toHaveBeenCalledWith(
        'reg-123',
        expect.objectContaining({
          status: 'confirmed',
          metadata: expect.objectContaining({
            reregisteredAt: expect.any(String),
          }),
        })
      )
    })

    it('should throw error when name is missing', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(null)
      const invalidInput = { ...validInput, name: '' }

      await expect(service.registerForEvent(invalidInput)).rejects.toThrow(
        'Name is required'
      )
    })

    it('should throw error when email is missing', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(null)
      const invalidInput = { ...validInput, email: '' }

      await expect(service.registerForEvent(invalidInput)).rejects.toThrow(
        'Email is required'
      )
    })

    it('should throw error when email format is invalid', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(null)
      const invalidInput = { ...validInput, email: 'invalid-email' }

      await expect(service.registerForEvent(invalidInput)).rejects.toThrow(
        'Invalid email format'
      )
    })

    it('should throw error when organisation is missing', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(null)
      const invalidInput = { ...validInput, organisation: '' }

      await expect(service.registerForEvent(invalidInput)).rejects.toThrow(
        'Organisation is required'
      )
    })

    it('should throw error when attendanceType is missing', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidInput = { ...validInput, attendanceType: undefined as any }

      await expect(service.registerForEvent(invalidInput)).rejects.toThrow(
        'Attendance type is required'
      )
    })
  })

  describe('getEventRegistrations', () => {
    it('should return all registrations for an event', async () => {
      const registrations = [mockRegistration]
      mockRepository.findMany.mockResolvedValue(registrations)

      const result = await service.getEventRegistrations('test-event')

      expect(result).toEqual(registrations)
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        eventSlug: 'test-event',
      })
    })
  })

  describe('getRegistration', () => {
    it('should return registration by ID', async () => {
      mockRepository.findById.mockResolvedValue(mockRegistration)

      const result = await service.getRegistration('reg-123')

      expect(result).toEqual(mockRegistration)
      expect(mockRepository.findById).toHaveBeenCalledWith('reg-123')
    })

    it('should return null when registration not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.getRegistration('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('updateRegistration', () => {
    it('should update registration', async () => {
      const updatedRegistration = {
        ...mockRegistration,
        name: 'Updated Name',
      }
      mockRepository.findById.mockResolvedValue(mockRegistration)
      mockRepository.update.mockResolvedValue(updatedRegistration)

      const result = await service.updateRegistration('reg-123', {
        name: 'Updated Name',
      })

      expect(result).toEqual(updatedRegistration)
      expect(mockRepository.update).toHaveBeenCalledWith('reg-123', {
        name: 'Updated Name',
      })
    })

    it('should throw error when registration not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        service.updateRegistration('nonexistent', { name: 'Test' })
      ).rejects.toThrow('Registration not found')
    })
  })

  describe('updateRegistrationStatus', () => {
    it('should update registration status', async () => {
      const updatedRegistration: EventRegistration = {
        ...mockRegistration,
        status: 'attended',
      }
      mockRepository.findById.mockResolvedValue(mockRegistration)
      mockRepository.update.mockResolvedValue(updatedRegistration)

      const result = await service.updateRegistrationStatus(
        'reg-123',
        'attended'
      )

      expect(result.status).toBe('attended')
      expect(mockRepository.update).toHaveBeenCalledWith('reg-123', {
        status: 'attended',
      })
    })
  })

  describe('confirmFromWaitlist', () => {
    it('should confirm registration from waitlist', async () => {
      const waitlistRegistration = {
        ...mockRegistration,
        status: 'waitlist' as RegistrationStatus,
      }
      const confirmedRegistration = {
        ...mockRegistration,
        status: 'confirmed' as RegistrationStatus,
      }
      mockRepository.findById.mockResolvedValue(waitlistRegistration)
      mockRepository.update.mockResolvedValue(confirmedRegistration)

      const result = await service.confirmFromWaitlist('reg-123')

      expect(result.status).toBe('confirmed')
    })
  })

  describe('markAsAttended', () => {
    it('should mark registration as attended', async () => {
      const attendedRegistration = {
        ...mockRegistration,
        status: 'attended' as RegistrationStatus,
      }
      mockRepository.findById.mockResolvedValue(mockRegistration)
      mockRepository.update.mockResolvedValue(attendedRegistration)

      const result = await service.markAsAttended('reg-123')

      expect(result.status).toBe('attended')
    })
  })

  describe('markAsNoShow', () => {
    it('should mark registration as no-show', async () => {
      const noShowRegistration = {
        ...mockRegistration,
        status: 'no-show' as RegistrationStatus,
      }
      mockRepository.findById.mockResolvedValue(mockRegistration)
      mockRepository.update.mockResolvedValue(noShowRegistration)

      const result = await service.markAsNoShow('reg-123')

      expect(result.status).toBe('no-show')
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should update status for multiple registrations', async () => {
      mockRepository.findById.mockResolvedValue(mockRegistration)
      mockRepository.update.mockResolvedValue({
        ...mockRegistration,
        status: 'attended',
      })

      const result = await service.bulkUpdateStatus(
        ['reg-123', 'reg-456'],
        'attended'
      )

      expect(result).toHaveLength(2)
      expect(result[0]!.status).toBe('attended')
      expect(mockRepository.update).toHaveBeenCalledTimes(2)
    })
  })

  describe('getEventRegistrationStats', () => {
    it('should return registration statistics', async () => {
      const registrations = [
        { ...mockRegistration, status: 'confirmed' as RegistrationStatus },
        { ...mockRegistration, status: 'confirmed' as RegistrationStatus },
        { ...mockRegistration, status: 'waitlist' as RegistrationStatus },
        { ...mockRegistration, status: 'cancelled' as RegistrationStatus },
        { ...mockRegistration, status: 'attended' as RegistrationStatus },
      ]
      mockRepository.findMany.mockResolvedValue(registrations)

      const result = await service.getEventRegistrationStats('test-event')

      expect(result).toEqual({
        confirmed: 2,
        waitlist: 1,
        cancelled: 1,
        attended: 1,
        'no-show': 0,
      })
    })
  })

  describe('getActiveRegistrationCount', () => {
    it('should return count of active registrations', async () => {
      const registrations = [
        { ...mockRegistration, status: 'confirmed' as RegistrationStatus },
        { ...mockRegistration, status: 'attended' as RegistrationStatus },
        { ...mockRegistration, status: 'cancelled' as RegistrationStatus },
        { ...mockRegistration, status: 'waitlist' as RegistrationStatus },
      ]
      mockRepository.findMany.mockResolvedValue(registrations)

      const result = await service.getActiveRegistrationCount('test-event')

      expect(result).toBe(2) // confirmed + attended
    })
  })

  describe('cancelRegistration', () => {
    it('should cancel registration', async () => {
      const cancelledRegistration = {
        ...mockRegistration,
        status: 'cancelled' as RegistrationStatus,
      }
      mockRepository.findById.mockResolvedValue(mockRegistration)
      mockRepository.update.mockResolvedValue(cancelledRegistration)

      const result = await service.cancelRegistration('reg-123')

      expect(result.status).toBe('cancelled')
    })
  })

  describe('deleteRegistration', () => {
    it('should delete registration', async () => {
      mockRepository.findById.mockResolvedValue(mockRegistration)
      mockRepository.delete.mockResolvedValue(undefined)

      await service.deleteRegistration('reg-123')

      expect(mockRepository.delete).toHaveBeenCalledWith('reg-123')
    })

    it('should throw error when registration not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(service.deleteRegistration('nonexistent')).rejects.toThrow(
        'Registration not found'
      )
    })
  })

  describe('isUserRegistered', () => {
    it('should return true when user has active registration', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(mockRegistration)

      const result = await service.isUserRegistered('test-event', 'U123456')

      expect(result).toBe(true)
    })

    it('should return false when user has no registration', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue(null)

      const result = await service.isUserRegistered('test-event', 'U123456')

      expect(result).toBe(false)
    })

    it('should return false when user registration is cancelled', async () => {
      mockRepository.findByEventAndUser.mockResolvedValue({
        ...mockRegistration,
        status: 'cancelled',
      })

      const result = await service.isUserRegistered('test-event', 'U123456')

      expect(result).toBe(false)
    })
  })

  describe('getRegistrationCountsByCategory', () => {
    it('should return counts by category', async () => {
      const registrations = [
        { ...mockRegistration, organisation: 'Org A' },
        { ...mockRegistration, organisation: 'Org A' },
        { ...mockRegistration, organisation: 'Org B' },
        {
          ...mockRegistration,
          organisation: 'Org C',
          status: 'cancelled' as RegistrationStatus,
        },
      ]
      mockRepository.findMany.mockResolvedValue(registrations)

      const result = await service.getRegistrationCountsByCategory('test-event')

      expect(result).toEqual({
        totalActive: 3,
        persons: 3,
        organizations: 2,
        uniqueOrganizations: 2,
      })
    })
  })

  describe('getOrganizationBreakdown', () => {
    it('should return organization breakdown sorted by count', async () => {
      const registrations = [
        {
          ...mockRegistration,
          organisation: 'Org A',
          status: 'confirmed' as RegistrationStatus,
        },
        {
          ...mockRegistration,
          organisation: 'Org A',
          status: 'confirmed' as RegistrationStatus,
        },
        {
          ...mockRegistration,
          organisation: 'Org A',
          status: 'confirmed' as RegistrationStatus,
        },
        {
          ...mockRegistration,
          organisation: 'Org B',
          status: 'confirmed' as RegistrationStatus,
        },
        {
          ...mockRegistration,
          organisation: 'Org B',
          status: 'confirmed' as RegistrationStatus,
        },
        {
          ...mockRegistration,
          organisation: 'Org C',
          status: 'confirmed' as RegistrationStatus,
        },
      ]
      mockRepository.findMany.mockResolvedValue(registrations)

      const result = await service.getOrganizationBreakdown('test-event')

      expect(result).toEqual([
        { organization: 'Org A', count: 3 },
        { organization: 'Org B', count: 2 },
        { organization: 'Org C', count: 1 },
      ])
    })
  })

  describe('getUserRegistrations', () => {
    it('should return all registrations for a user', async () => {
      const registrations = [mockRegistration]
      mockRepository.findMany.mockResolvedValue(registrations)

      const result = await service.getUserRegistrations('U123456')

      expect(result).toEqual(registrations)
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        slackUserId: 'U123456',
      })
    })
  })

  describe('anonymizeUserData', () => {
    it('should anonymize all user registrations', async () => {
      const userRegistrations = [
        { ...mockRegistration, _id: 'reg-1' },
        { ...mockRegistration, _id: 'reg-2' },
      ]
      mockRepository.findMany.mockResolvedValue(userRegistrations)
      mockRepository.update.mockResolvedValue({
        ...mockRegistration,
        name: 'Anonymisert bruker',
        email: 'anonymized@offentlig-paas.no',
      })

      const result = await service.anonymizeUserData('U123456')

      expect(result).toBe(2)
      expect(mockRepository.update).toHaveBeenCalledTimes(2)
      expect(mockRepository.update).toHaveBeenCalledWith(
        'reg-1',
        expect.objectContaining({
          name: 'Anonymisert bruker',
          email: 'anonymized@offentlig-paas.no',
          slackUserId: expect.stringContaining('anonymized_'),
          dietary: undefined,
          comments: undefined,
          metadata: expect.objectContaining({
            anonymized: true,
            anonymizedAt: expect.any(String),
          }),
        })
      )
    })

    it('should return 0 when user has no registrations', async () => {
      mockRepository.findMany.mockResolvedValue([])

      const result = await service.anonymizeUserData('U123456')

      expect(result).toBe(0)
      expect(mockRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('getRegistrationsByEvent', () => {
    it('should group registrations by event slug', async () => {
      const registrations = [
        { ...mockRegistration, eventSlug: 'event-1' },
        { ...mockRegistration, eventSlug: 'event-1' },
        { ...mockRegistration, eventSlug: 'event-2' },
      ]
      mockRepository.findMany.mockResolvedValue(registrations)

      const result = await service.getRegistrationsByEvent()

      expect(result).toEqual({
        'event-1': [
          { ...mockRegistration, eventSlug: 'event-1' },
          { ...mockRegistration, eventSlug: 'event-1' },
        ],
        'event-2': [{ ...mockRegistration, eventSlug: 'event-2' }],
      })
    })
  })
})
