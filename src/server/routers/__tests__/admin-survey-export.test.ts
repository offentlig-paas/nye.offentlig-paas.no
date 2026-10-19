import { vi } from 'vitest'
import type { Session } from 'next-auth'
import { aggregateSurveyResults } from '@/lib/surveys/aggregation'
import { aggregatedToCsv, csvCell, toCsv } from '@/lib/surveys/csv'
import { SurveyStatus, type SurveyDefinition } from '@/lib/surveys/types'

const findBySurvey = vi.fn(async () => [
  { answers: [{ questionId: 'q1-org', value: 'Skatteetaten' }] },
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

describe('csvCell', () => {
  it('quotes commas, quotes and newlines', () => {
    expect(toCsv([['a,b', 'si "hei"', 'linje1\nlinje2']])).toBe(
      '"a,b","si ""hei""","linje1\nlinje2"'
    )
  })

  it.each(['=SUM(A1)', '+1', '-1', '@cmd', ' =x'])(
    'neutralises formula %s',
    v => expect(csvCell(v)).toBe(`"'${v}"`)
  )
})

describe('admin.surveys CSV export', () => {
  it('denies raw export to researchers', async () => {
    await expect(
      caller(false, 'U071L6QLNAZ').exportCsv({ slug: 'ai-agents-2027' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('gives researchers the aggregated export', async () => {
    const { csv } = await caller(false, 'U071L6QLNAZ').exportAggregatedCsv({
      slug: 'ai-agents-2027',
    })
    expect(csv).toContain('"Antall"')
  })
})

describe('aggregatedToCsv', () => {
  it('keeps small buckets suppressed', () => {
    const survey: SurveyDefinition = {
      slug: 't',
      version: 1,
      title: 'T',
      consent: { dataCollectionText: 't' },
      status: SurveyStatus.Open,
      sections: [
        {
          id: 's1',
          title: 'S',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Q',
              required: true,
              options: [
                { label: 'Stor', value: 'a' },
                { label: 'Liten', value: 'b' },
              ],
            },
          ],
        },
      ],
    }
    const responses = ['a', 'a', 'a', 'b'].map(value => ({
      _id: value,
      surveySlug: 't',
      surveyVersion: 1,
      submittedAt: '',
      answers: [{ questionId: 'q1', value }],
    }))
    const csv = aggregatedToCsv(
      aggregateSurveyResults(survey, responses, { minBucketSize: 3 })
    )
    expect(csv).toContain('"Stor","3"')
    expect(csv).not.toContain('Liten')
    expect(csv).toContain('"Andre (for få svar)","1"')
  })
})
