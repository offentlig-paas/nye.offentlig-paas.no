import { vi } from 'vitest'
import { TRPCError } from '@trpc/server'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/domains/survey-response/service', () => ({
  surveyResponseService: { submitResponse: vi.fn() },
}))
vi.mock('@/domains/survey-response/repository', () => ({
  SurveyResponseRepository: vi.fn(),
}))

const { surveyRouter } = await import('../survey')
const { surveyResponseService } =
  await import('@/domains/survey-response/service')

const caller = surveyRouter.createCaller({
  session: null,
  headers: new Headers(),
})

const submit = (surveySlug: string) =>
  caller.submit({
    surveySlug,
    surveyVersion: 1,
    submissionId: '00000000-0000-4000-8000-000000000000',
    answers: [],
  })

describe('survey.submit', () => {
  it.each(['ai-agents-2027', 'state-of-platforms-2027', 'ai-agents-2026'])(
    'rejects %s because it is not open',
    async slug => {
      await expect(submit(slug)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      } satisfies Partial<TRPCError>)
      expect(surveyResponseService.submitResponse).not.toHaveBeenCalled()
    }
  )
})
