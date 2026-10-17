import { vi } from 'vitest'
import type { Session } from 'next-auth'

const deletePilotBySurvey = vi.fn(async () => 3)

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/domains/survey-response/repository', () => ({
  SurveyResponseRepository: vi.fn(function () {
    return { deletePilotBySurvey }
  }),
}))

const { adminSurveyRouter } = await import('../admin-survey')

const caller = (isAdmin: boolean) =>
  adminSurveyRouter.createCaller({
    session: { user: { isAdmin }, expires: '' } as unknown as Session,
    headers: new Headers(),
  })

describe('admin.surveys.deletePilotResponses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes pilot responses for a pilot survey', async () => {
    await expect(
      caller(true).deletePilotResponses({ slug: 'ai-agents-2027' })
    ).resolves.toEqual({ deleted: 3 })
    expect(deletePilotBySurvey).toHaveBeenCalledWith('ai-agents-2027')
  })

  it('refuses when the survey is not in pilot', async () => {
    await expect(
      caller(true).deletePilotResponses({ slug: 'ai-agents-2026' })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(deletePilotBySurvey).not.toHaveBeenCalled()
  })

  it('refuses users without access', async () => {
    await expect(
      caller(false).deletePilotResponses({ slug: 'ai-agents-2027' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(deletePilotBySurvey).not.toHaveBeenCalled()
  })
})
