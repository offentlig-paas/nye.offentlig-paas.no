import { vi } from 'vitest'
import type { Session } from 'next-auth'

const findBySurvey = vi.fn(async () => [
  {
    answers: [
      { questionId: 'q1-org', value: 'Skatteetaten' },
      { questionId: 'q19-public-sector-concerns', value: 'Personvern' },
      { questionId: 'q24-email', value: 'a@b.no' },
    ],
  },
  { answers: [{ questionId: 'q19-public-sector-concerns', value: '  ' }] },
])

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/domains/survey-response/repository', () => ({
  SurveyResponseRepository: vi.fn(function () {
    return { findBySurvey }
  }),
}))

const { adminSurveyRouter } = await import('../admin-survey')

const caller = (isAdmin: boolean, slackId?: string) =>
  adminSurveyRouter.createCaller({
    session: { user: { isAdmin, slackId }, expires: '' } as unknown as Session,
    headers: new Headers(),
  })

describe('admin.surveys.getFreeText', () => {
  it('returns non-empty answers without sensitive questions or org', async () => {
    const result = await caller(true).getFreeText({ slug: 'ai-agents-2026' })
    expect(result).toEqual([
      {
        id: 'q19-public-sector-concerns',
        title: expect.any(String),
        answers: ['Personvern'],
      },
    ])
    expect(JSON.stringify(result)).not.toContain('Skatteetaten')
  })

  it('allows researchers', async () => {
    await expect(
      caller(false, 'U071L6QLNAZ').getFreeText({ slug: 'ai-agents-2027' })
    ).resolves.toEqual([])
  })

  it('refuses non-members', async () => {
    await expect(
      caller(false).getFreeText({ slug: 'ai-agents-2027' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
