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
const { surveys } = await import('@/data/surveys')

const caller = surveyRouter.createCaller({
  session: null,
  headers: new Headers(),
})

const submit = (surveySlug: string, pilotToken?: string) =>
  caller.submit({
    surveySlug,
    surveyVersion: surveys.find(s => s.slug === surveySlug)?.version ?? 1,
    submissionId: '00000000-0000-4000-8000-000000000000',
    answers: [],
    pilotToken,
  })

describe('survey.submit', () => {
  it.each(['state-of-platforms-2027', 'ai-agents-2026'])(
    'rejects %s because it is not open',
    async slug => {
      await expect(submit(slug)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      } satisfies Partial<TRPCError>)
      expect(surveyResponseService.submitResponse).not.toHaveBeenCalled()
    }
  )

  describe('pilot', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.stubEnv('SURVEY_PILOT_TOKEN', 'pilot-secret')
    })
    afterEach(() => vi.unstubAllEnvs())

    it.each([undefined, 'wrong'])(
      'rejects a pilot survey with token %s',
      async token => {
        await expect(
          submit('state-of-platforms-2027', token)
        ).rejects.toMatchObject({
          code: 'BAD_REQUEST',
        })
        expect(surveyResponseService.submitResponse).not.toHaveBeenCalled()
      }
    )

    it('accepts a pilot survey with a valid token and flags it', async () => {
      await expect(
        submit('state-of-platforms-2027', 'pilot-secret')
      ).resolves.toMatchObject({ success: true })
      expect(surveyResponseService.submitResponse).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'state-of-platforms-2027' }),
        [],
        expect.anything(),
        '00000000-0000-4000-8000-000000000000',
        true
      )
    })

    it('does not open a closed survey with a valid token', async () => {
      await expect(
        submit('ai-agents-2026', 'pilot-secret')
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    })
  })
})
