import { vi } from 'vitest'
import type { Session } from 'next-auth'

const deletePilotBySurvey = vi.fn(async () => 3)

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/domains/survey-response/repository', () => ({
  SurveyResponseRepository: vi.fn(function () {
    return {
      deletePilotBySurvey,
      findBySurveyPaginated: vi.fn(async () => ({ responses: [], total: 0 })),
      countBySurvey: vi.fn(async () => 0),
    }
  }),
}))

const { adminSurveyRouter } = await import('../admin-survey')

const caller = (isAdmin: boolean, slackId?: string) =>
  adminSurveyRouter.createCaller({
    session: { user: { isAdmin, slackId }, expires: '' } as unknown as Session,
    headers: new Headers(),
  })
const researcher = () => caller(false, 'U071L6QLNAZ')
const anonymous = () =>
  adminSurveyRouter.createCaller({ session: null, headers: new Headers() })

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

describe('admin.surveys.getPilotLink', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns the absolute pilot URL for owners and researchers', async () => {
    vi.stubEnv('SURVEY_PILOT_TOKEN', 's3cret')
    vi.stubEnv('NEXT_PUBLIC_URL', 'https://offentlig-paas.no')
    const expected = {
      url: 'https://offentlig-paas.no/forskning/state-of-ai-agents/undersokelse?pilot=s3cret',
    }
    await expect(
      caller(true).getPilotLink({ slug: 'ai-agents-2027' })
    ).resolves.toEqual(expected)
    await expect(
      researcher().getPilotLink({ slug: 'ai-agents-2027' })
    ).resolves.toEqual(expected)
  })

  it('returns no URL when the token is unset', async () => {
    vi.stubEnv('SURVEY_PILOT_TOKEN', '')
    await expect(
      caller(true).getPilotLink({ slug: 'ai-agents-2027' })
    ).resolves.toEqual({ url: null })
  })

  it('returns null when the survey is not in pilot', async () => {
    vi.stubEnv('SURVEY_PILOT_TOKEN', 's3cret')
    await expect(
      caller(true).getPilotLink({ slug: 'ai-agents-2026' })
    ).resolves.toBeNull()
  })

  it('refuses users without a role and unauthenticated users', async () => {
    vi.stubEnv('SURVEY_PILOT_TOKEN', 's3cret')
    await expect(
      caller(false).getPilotLink({ slug: 'ai-agents-2027' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
    await expect(
      anonymous().getPilotLink({ slug: 'ai-agents-2027' })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })
})

describe('researcher access to pilot responses', () => {
  it('can read pilot responses', async () => {
    await expect(
      researcher().getResponses({ slug: 'ai-agents-2027', pilot: true })
    ).resolves.toMatchObject({ total: 0 })
  })

  it('cannot read real responses', async () => {
    await expect(
      researcher().getResponses({ slug: 'ai-agents-2027' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('cannot delete pilot responses', async () => {
    await expect(
      researcher().deletePilotResponses({ slug: 'ai-agents-2027' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(deletePilotBySurvey).not.toHaveBeenCalled()
  })
})
