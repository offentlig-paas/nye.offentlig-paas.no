import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Session } from 'next-auth'
import { SurveyStatus, type SurveyDefinition } from '@/lib/surveys/types'

const slack = (id: string) => [
  { name: id, url: `https://x.slack.com/team/${id}` },
]

const def = (slug: string, researchers: string[]): SurveyDefinition => ({
  slug,
  version: 1,
  title: slug,
  consent: { dataCollectionText: '' },
  status: SurveyStatus.Open,
  sections: [],
  owners: slack('UOWNER'),
  researchers: researchers.flatMap(slack),
})

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/data/surveys', () => ({
  surveys: [def('w1', ['UBOTH']), def('w2', ['UBOTH', 'UNEW'])],
}))
vi.mock('@/data/research', () => ({
  researchProjects: [
    { slug: 'p', surveys: [{ surveySlug: 'w1' }, { surveySlug: 'w2' }] },
  ],
}))

const org = (value: string, memberName?: string) => ({
  answers: [{ questionId: 'q1-org', value }],
  organizationOverride: memberName ? { memberName } : undefined,
})

const responses: Record<string, ReturnType<typeof org>[]> = {
  w1: [
    org('Nav'),
    org('Nav'),
    org('Kartverket'),
    org('Skatteetatn', 'Skatteetaten'),
    org('Ukjent byrå'),
    { answers: [], organizationOverride: undefined },
  ],
  w2: [org('nav'), org('Ukjent byrå')],
}
const findBySurvey = vi.fn(async (slug: string) => responses[slug] ?? [])

vi.mock('@/domains/survey-response/repository', () => ({
  SurveyResponseRepository: vi.fn(function () {
    return { findBySurvey }
  }),
}))

const { adminSurveyRouter } = await import('../admin-survey')

const caller = (slackId: string) =>
  adminSurveyRouter.createCaller({
    session: { user: { slackId }, expires: '' } as unknown as Session,
    headers: new Headers(),
  })

describe('admin.surveys.getOrganizations previousWave', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists organizations from the previous wave that have not responded', async () => {
    const data = await caller('UBOTH').getOrganizations({ slug: 'w2' })

    expect(data.previousWave).toEqual({
      total: 4,
      returned: 2,
      missing: [
        { organization: 'Kartverket', previousCount: 1, isMember: true },
        { organization: 'Skatteetaten', previousCount: 1, isMember: true },
      ],
    })
  })

  it('flags members that responded in the previous wave', async () => {
    const data = await caller('UBOTH').getOrganizations({ slug: 'w2' })
    const byName = new Map(
      data.sectorBreakdown
        .flatMap(s => s.organizations)
        .map(o => [o.name, o.respondedPreviously])
    )

    expect(byName.get('Nav')).toBe(true)
    expect(byName.get('Kartverket')).toBe(true)
    expect(byName.get('Skatteetaten')).toBe(true)
    expect([...byName.values()].filter(Boolean)).toHaveLength(3)
  })

  it('returns null for the first wave', async () => {
    const data = await caller('UBOTH').getOrganizations({ slug: 'w1' })

    expect(data.previousWave).toBeNull()
    expect(findBySurvey).toHaveBeenCalledTimes(1)
  })

  it('hides the previous wave from users without access to it', async () => {
    const data = await caller('UNEW').getOrganizations({ slug: 'w2' })

    expect(data.previousWave).toBeNull()
    expect(findBySurvey).not.toHaveBeenCalledWith('w1')
    expect(
      data.sectorBreakdown
        .flatMap(s => s.organizations)
        .some(o => o.respondedPreviously)
    ).toBe(false)
  })
})
