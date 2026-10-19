import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetch = vi.fn()
const del = vi.fn()
const commit = vi.fn()
const createIfNotExists = vi.fn(async (doc: unknown) => doc)

vi.mock('@/lib/sanity/config', () => ({
  sanityClient: {
    fetch,
    createIfNotExists,
    transaction: () => {
      const tx = { delete: (id: string) => (del(id), tx), commit }
      return tx
    },
  },
}))

const { SurveyResponseRepository } = await import('../repository')
const repo = new SurveyResponseRepository()

describe('SurveyResponseRepository pilot handling', () => {
  beforeEach(() => vi.clearAllMocks())

  it('excludes pilot responses from real-data queries', async () => {
    fetch.mockResolvedValue([])
    await repo.countBySurvey('s')
    await repo.findBySurvey('s')
    await repo.countUniqueOrganizations('s')
    await repo.getOrganizationBreakdown('s')
    await repo.getDailyResponseCounts('s')
    await repo.getLatestResponseDate('s')
    for (const [query] of fetch.mock.calls) {
      expect(query).toContain('!(pilot == true)')
    }
  })

  it('lists only pilot responses when asked', async () => {
    fetch.mockResolvedValue([])
    await repo.findBySurveyPaginated('s', 0, 10, true)
    await repo.findBySurvey('s', true)
    await repo.countUniqueOrganizations('s', 'q1-org', true)
    for (const [query] of fetch.mock.calls) {
      expect(query).toContain('&& pilot == true]')
    }
  })

  it('stores the pilot flag on the response and contact info', async () => {
    await repo.create(
      { surveySlug: 's', surveyVersion: 1, answers: [], pilot: true },
      'id1'
    )
    await repo.createContactInfo({
      submissionId: 'id1',
      surveySlug: 's',
      answers: [],
      pilot: true,
    })
    expect(createIfNotExists).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ pilot: true })
    )
    expect(createIfNotExists).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ pilot: true })
    )
  })

  it('deletes only pilot documents', async () => {
    fetch.mockResolvedValue(['survey-response-a', 'survey-contact-s-a'])
    const deleted = await repo.deletePilotBySurvey('s')
    expect(fetch.mock.calls[0]![0]).toContain('&& pilot == true]')
    expect(fetch.mock.calls[0]![1]).toEqual({ surveySlug: 's' })
    expect(del.mock.calls.map(c => c[0])).toEqual([
      'survey-response-a',
      'survey-contact-s-a',
    ])
    expect(commit).toHaveBeenCalledOnce()
    expect(deleted).toBe(2)
  })

  it('does nothing when there are no pilot documents', async () => {
    fetch.mockResolvedValue([])
    expect(await repo.deletePilotBySurvey('s')).toBe(0)
    expect(commit).not.toHaveBeenCalled()
  })
})
