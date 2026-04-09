import { vi, type Mocked } from 'vitest'
import { TalkSubmissionRepository } from '../repository'
import type { TalkSubmission, CreateTalkSubmissionInput } from '../types'

vi.mock('../repository')

// Import after mock so the singleton picks up the mocked repository
const { talkSubmissionService: service } = await import('../service')

describe('TalkSubmissionService', () => {
  let mockRepo: Mocked<TalkSubmissionRepository>

  const mockSubmission: TalkSubmission = {
    _id: 'sub-1',
    eventSlug: 'fagdag-2026',
    title: 'Intro to Platform Engineering',
    abstract: 'A talk about platforms',
    format: 'Presentation',
    duration: '30 min',
    speakerName: 'Ola Nordmann',
    speakerEmail: 'ola@example.com',
    speakerSlackId: 'U111',
    speakerOrganisation: 'Digitaliseringsdirektoratet',
    speakerBio: 'Platform engineer',
    notes: 'Needs projector',
    status: 'submitted',
    submittedAt: new Date('2026-03-01T10:00:00Z'),
  }

  const validInput: CreateTalkSubmissionInput = {
    eventSlug: 'fagdag-2026',
    title: 'Intro to Platform Engineering',
    abstract: 'A talk about platforms',
    format: 'Presentation',
    duration: '30 min',
    speakerName: 'Ola Nordmann',
    speakerEmail: 'ola@example.com',
    speakerSlackId: 'U111',
    speakerOrganisation: 'Digitaliseringsdirektoratet',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo =
      TalkSubmissionRepository.prototype as Mocked<TalkSubmissionRepository>
  })

  describe('submitTalk', () => {
    it('should create a new talk submission', async () => {
      mockRepo.create.mockResolvedValue(mockSubmission)

      const result = await service.submitTalk(validInput)

      expect(result).toEqual(mockSubmission)
      expect(mockRepo.create).toHaveBeenCalledWith(validInput)
    })
  })

  describe('getEventSubmissions', () => {
    it('should return all submissions for an event', async () => {
      mockRepo.findByEventSlug.mockResolvedValue([mockSubmission])

      const result = await service.getEventSubmissions('fagdag-2026')

      expect(result).toEqual([mockSubmission])
      expect(mockRepo.findByEventSlug).toHaveBeenCalledWith('fagdag-2026')
    })

    it('should return empty array when no submissions exist', async () => {
      mockRepo.findByEventSlug.mockResolvedValue([])

      const result = await service.getEventSubmissions('empty-event')

      expect(result).toEqual([])
    })
  })

  describe('getUserSubmissions', () => {
    it('should return submissions for a specific user and event', async () => {
      mockRepo.findByEventAndUser.mockResolvedValue([mockSubmission])

      const result = await service.getUserSubmissions('fagdag-2026', 'U111')

      expect(result).toEqual([mockSubmission])
      expect(mockRepo.findByEventAndUser).toHaveBeenCalledWith(
        'fagdag-2026',
        'U111'
      )
    })
  })

  describe('getSubmission', () => {
    it('should return a submission by ID', async () => {
      mockRepo.findById.mockResolvedValue(mockSubmission)

      const result = await service.getSubmission('sub-1')

      expect(result).toEqual(mockSubmission)
    })

    it('should return null when submission not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const result = await service.getSubmission('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('updateStatus', () => {
    it('should update status of an existing submission', async () => {
      const accepted = { ...mockSubmission, status: 'accepted' as const }
      mockRepo.findById.mockResolvedValue(mockSubmission)
      mockRepo.updateStatus.mockResolvedValue(accepted)

      const result = await service.updateStatus('sub-1', 'accepted')

      expect(result.status).toBe('accepted')
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('sub-1', 'accepted')
    })

    it('should throw when submission not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      await expect(
        service.updateStatus('nonexistent', 'accepted')
      ).rejects.toThrow('Talk submission not found')
    })
  })

  describe('withdrawSubmission', () => {
    it('should withdraw own submission', async () => {
      const withdrawn = { ...mockSubmission, status: 'withdrawn' as const }
      mockRepo.findById.mockResolvedValue(mockSubmission)
      mockRepo.updateStatus.mockResolvedValue(withdrawn)

      const result = await service.withdrawSubmission(
        'sub-1',
        'U111',
        'fagdag-2026'
      )

      expect(result.status).toBe('withdrawn')
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('sub-1', 'withdrawn')
    })

    it('should throw when submission not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      await expect(
        service.withdrawSubmission('nonexistent', 'U111', 'fagdag-2026')
      ).rejects.toThrow('Talk submission not found')
    })

    it('should throw when submission belongs to different event', async () => {
      mockRepo.findById.mockResolvedValue(mockSubmission)

      await expect(
        service.withdrawSubmission('sub-1', 'U111', 'other-event')
      ).rejects.toThrow('Submission does not belong to this event')
    })

    it('should throw when user is not the speaker', async () => {
      mockRepo.findById.mockResolvedValue(mockSubmission)

      await expect(
        service.withdrawSubmission('sub-1', 'U999', 'fagdag-2026')
      ).rejects.toThrow('Not authorized to withdraw this submission')
    })

    it('should throw when submission is already withdrawn', async () => {
      const withdrawn = { ...mockSubmission, status: 'withdrawn' as const }
      mockRepo.findById.mockResolvedValue(withdrawn)

      await expect(
        service.withdrawSubmission('sub-1', 'U111', 'fagdag-2026')
      ).rejects.toThrow('Submission is already withdrawn')
    })
  })

  describe('getSubmissionCount', () => {
    it('should return count of submissions for event', async () => {
      mockRepo.getCountByEventSlug.mockResolvedValue(5)

      const result = await service.getSubmissionCount('fagdag-2026')

      expect(result).toBe(5)
    })
  })

  describe('deleteSubmission', () => {
    it('should delete an existing submission', async () => {
      mockRepo.findById.mockResolvedValue(mockSubmission)
      mockRepo.delete.mockResolvedValue()

      await service.deleteSubmission('sub-1')

      expect(mockRepo.delete).toHaveBeenCalledWith('sub-1')
    })

    it('should throw when submission not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      await expect(service.deleteSubmission('nonexistent')).rejects.toThrow(
        'Talk submission not found'
      )
    })
  })
})
