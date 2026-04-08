import { vi, type Mocked } from 'vitest'
import { TRPCError } from '@trpc/server'
import { SurveyResponseRepository } from '../repository'
import { SurveyStatus } from '@/lib/surveys/types'
import type { SurveyDefinition } from '@/lib/surveys/types'
import * as validation from '@/lib/surveys/validation'

vi.mock('../repository')

const { surveyResponseService: service } = await import('../service')

const mockSurvey: SurveyDefinition = {
  slug: 'test-survey',
  title: 'Test Survey',
  version: 1,
  status: SurveyStatus.Open,
  consent: { dataCollectionText: 'We collect data for research.' },
  sections: [
    {
      id: 'section-1',
      title: 'Section 1',
      questions: [
        {
          id: 'q1',
          type: 'text',
          title: 'Name',
          required: true,
        },
        {
          id: 'q2',
          type: 'radio',
          title: 'Rating',
          required: true,
          options: [
            { value: 'good', label: 'Good' },
            { value: 'bad', label: 'Bad' },
          ],
        },
      ],
    },
  ],
}

const mockSurveyWithSensitive: SurveyDefinition = {
  ...mockSurvey,
  sensitiveQuestionIds: ['q-email'],
  sections: [
    {
      id: 'section-1',
      title: 'Section 1',
      questions: [
        {
          id: 'q1',
          type: 'text',
          title: 'Name',
          required: true,
        },
        {
          id: 'q-email',
          type: 'text',
          title: 'Email',
          required: false,
        },
      ],
    },
  ],
}

describe('SurveyResponseService', () => {
  let mockRepo: Mocked<SurveyResponseRepository>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo =
      SurveyResponseRepository.prototype as Mocked<SurveyResponseRepository>
  })

  describe('submitResponse', () => {
    it('should submit a valid response', async () => {
      const answers = [
        { questionId: 'q1', value: 'Test Name' },
        { questionId: 'q2', value: 'good' },
      ]

      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: true,
        errors: [],
        sanitizedAnswers: answers,
      })

      const mockResponse = {
        _id: 'resp-1',
        surveySlug: 'test-survey',
        surveyVersion: 1,
        answers: [
          { questionId: 'q1', value: 'Test Name' },
          { questionId: 'q2', value: 'good' },
        ],
        submittedAt: '2026-01-01T00:00:00Z',
      }
      mockRepo.create.mockResolvedValue(mockResponse)

      const result = await service.submitResponse(
        mockSurvey,
        answers,
        { userAgent: 'Mozilla/5.0', ip: '1.2.3.4' },
        'submission-1'
      )

      expect(result).toEqual(mockResponse)
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          surveySlug: 'test-survey',
          surveyVersion: 1,
        }),
        'submission-1'
      )
    })

    it('should throw BAD_REQUEST when validation fails', async () => {
      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: false,
        errors: ['q1 is required'],
        sanitizedAnswers: [],
      })

      await expect(
        service.submitResponse(mockSurvey, [], { ip: '1.2.3.5' }, 'sub-2')
      ).rejects.toThrow(TRPCError)

      try {
        await service.submitResponse(
          mockSurvey,
          [],
          { ip: '1.2.3.50' },
          'sub-2b'
        )
      } catch (e) {
        expect((e as TRPCError).code).toBe('BAD_REQUEST')
        expect((e as TRPCError).message).toContain('q1 is required')
      }
    })

    it('should separate sensitive answers into contact info', async () => {
      const answers = [
        { questionId: 'q1', value: 'Ola' },
        { questionId: 'q-email', value: 'ola@test.no' },
      ]

      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: true,
        errors: [],
        sanitizedAnswers: answers,
      })

      const mockResponse = {
        _id: 'resp-2',
        surveySlug: 'test-survey',
        surveyVersion: 1,
        answers: [{ questionId: 'q1', value: 'Ola' }],
        submittedAt: '2026-01-01T00:00:00Z',
      }
      mockRepo.create.mockResolvedValue(mockResponse)
      mockRepo.createContactInfo.mockResolvedValue()

      await service.submitResponse(
        mockSurveyWithSensitive,
        answers,
        { ip: '2.3.4.5' },
        'sub-sensitive'
      )

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          answers: [expect.objectContaining({ questionId: 'q1' })],
        }),
        'sub-sensitive'
      )

      expect(mockRepo.createContactInfo).toHaveBeenCalledWith({
        submissionId: 'sub-sensitive',
        surveySlug: 'test-survey',
        answers: [expect.objectContaining({ questionId: 'q-email' })],
      })
    })

    it('should not call createContactInfo when no sensitive answers', async () => {
      const answers = [{ questionId: 'q1', value: 'Test' }]

      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: true,
        errors: [],
        sanitizedAnswers: answers,
      })

      mockRepo.create.mockResolvedValue({
        _id: 'resp-3',
        surveySlug: 'test-survey',
        surveyVersion: 1,
        answers: [{ questionId: 'q1', value: 'Test' }],
        submittedAt: '2026-01-01T00:00:00Z',
      })

      await service.submitResponse(
        mockSurvey,
        answers,
        { ip: '3.4.5.6' },
        'sub-no-sensitive'
      )

      expect(mockRepo.createContactInfo).not.toHaveBeenCalled()
    })

    it('should categorize device from user agent', async () => {
      const answers = [{ questionId: 'q1', value: 'Test' }]

      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: true,
        errors: [],
        sanitizedAnswers: answers,
      })

      mockRepo.create.mockResolvedValue({
        _id: 'resp-4',
        surveySlug: 'test-survey',
        surveyVersion: 1,
        answers: [],
        submittedAt: '2026-01-01T00:00:00Z',
      })

      // Desktop
      await service.submitResponse(
        mockSurvey,
        answers,
        {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          ip: '10.0.0.1',
        },
        'sub-desktop'
      )

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ deviceCategory: 'desktop' }),
        }),
        'sub-desktop'
      )

      // Mobile
      await service.submitResponse(
        mockSurvey,
        answers,
        { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS)', ip: '10.0.0.2' },
        'sub-mobile'
      )

      expect(mockRepo.create).toHaveBeenLastCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ deviceCategory: 'mobile' }),
        }),
        'sub-mobile'
      )

      // Tablet
      await service.submitResponse(
        mockSurvey,
        answers,
        { userAgent: 'Mozilla/5.0 (iPad; CPU OS)', ip: '10.0.0.3' },
        'sub-tablet'
      )

      expect(mockRepo.create).toHaveBeenLastCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ deviceCategory: 'tablet' }),
        }),
        'sub-tablet'
      )

      // Unknown
      await service.submitResponse(
        mockSurvey,
        answers,
        { ip: '10.0.0.4' },
        'sub-unknown'
      )

      expect(mockRepo.create).toHaveBeenLastCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ deviceCategory: 'unknown' }),
        }),
        'sub-unknown'
      )
    })

    it('should enforce rate limiting per IP', async () => {
      const answers = [{ questionId: 'q1', value: 'Test' }]

      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: true,
        errors: [],
        sanitizedAnswers: answers,
      })

      mockRepo.create.mockResolvedValue({
        _id: 'resp-rl',
        surveySlug: 'test-survey',
        surveyVersion: 1,
        answers: [],
        submittedAt: '2026-01-01T00:00:00Z',
      })

      const rateLimitIp = '99.99.99.99'

      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        await service.submitResponse(
          mockSurvey,
          answers,
          { ip: rateLimitIp },
          `sub-rl-${i}`
        )
      }

      // 6th should fail
      await expect(
        service.submitResponse(
          mockSurvey,
          answers,
          { ip: rateLimitIp },
          'sub-rl-6'
        )
      ).rejects.toThrow(TRPCError)

      try {
        await service.submitResponse(
          mockSurvey,
          answers,
          { ip: rateLimitIp },
          'sub-rl-7'
        )
      } catch (e) {
        expect((e as TRPCError).code).toBe('TOO_MANY_REQUESTS')
      }
    })

    it('should not rate limit when no IP provided', async () => {
      const answers = [{ questionId: 'q1', value: 'Test' }]

      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: true,
        errors: [],
        sanitizedAnswers: answers,
      })

      mockRepo.create.mockResolvedValue({
        _id: 'resp-noip',
        surveySlug: 'test-survey',
        surveyVersion: 1,
        answers: [],
        submittedAt: '2026-01-01T00:00:00Z',
      })

      // Should succeed more than 5 times without IP
      for (let i = 0; i < 10; i++) {
        await service.submitResponse(mockSurvey, answers, {}, `sub-noip-${i}`)
      }

      expect(mockRepo.create).toHaveBeenCalledTimes(10)
    })

    it('should handle array values in answers', async () => {
      const answers = [
        {
          questionId: 'q1',
          value: ['option-a', 'option-b'] as unknown as string,
        },
      ]

      vi.spyOn(validation, 'validateAnswers').mockReturnValue({
        valid: true,
        errors: [],
        sanitizedAnswers: [
          { questionId: 'q1', value: ['option-a', 'option-b'] },
        ],
      })

      mockRepo.create.mockResolvedValue({
        _id: 'resp-array',
        surveySlug: 'test-survey',
        surveyVersion: 1,
        answers: [{ questionId: 'q1', arrayValue: ['option-a', 'option-b'] }],
        submittedAt: '2026-01-01T00:00:00Z',
      })

      await service.submitResponse(
        mockSurvey,
        answers,
        { ip: '20.0.0.1' },
        'sub-array'
      )

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          answers: [
            expect.objectContaining({
              questionId: 'q1',
              arrayValue: ['option-a', 'option-b'],
            }),
          ],
        }),
        'sub-array'
      )
    })
  })

  describe('getResponseCount', () => {
    it('should return count from repository', async () => {
      mockRepo.countBySurvey.mockResolvedValue(42)

      const result = await service.getResponseCount('test-survey')

      expect(result).toBe(42)
      expect(mockRepo.countBySurvey).toHaveBeenCalledWith('test-survey')
    })
  })

  describe('getUniqueOrganizationCount', () => {
    it('should return unique org count from repository', async () => {
      mockRepo.countUniqueOrganizations.mockResolvedValue(7)

      const result = await service.getUniqueOrganizationCount('test-survey')

      expect(result).toBe(7)
      expect(mockRepo.countUniqueOrganizations).toHaveBeenCalledWith(
        'test-survey'
      )
    })
  })
})
