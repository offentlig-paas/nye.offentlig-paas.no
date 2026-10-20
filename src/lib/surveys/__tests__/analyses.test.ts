import { describe, expect, it, vi } from 'vitest'
import {
  aggregateByOrganization,
  panelAnalysis,
  segmentBreakdowns,
  withinOrgAgreement,
} from '../analyses'
import { SurveyStatus, type SurveyDefinition } from '../types'
import type { SurveyResponse } from '@/domains/survey-response/types'

vi.mock('server-only', () => ({}))

const survey: SurveyDefinition = {
  slug: 's',
  version: 1,
  title: 'S',
  status: SurveyStatus.Open,
  consent: { dataCollectionText: '' },
  organizationQuestionId: 'org',
  segmentQuestionIds: ['role'],
  sections: [
    {
      id: 'x',
      title: 'X',
      questions: [
        { id: 'org', type: 'text', title: 'Org', required: true },
        {
          id: 'role',
          type: 'radio',
          title: 'Rolle',
          required: true,
          options: [
            { value: 'dev', label: 'Utvikler' },
            { value: 'lead', label: 'Leder' },
          ],
        },
        {
          id: 'q',
          type: 'radio',
          title: 'Q',
          required: true,
          options: [
            { value: 'yes', label: 'Ja' },
            { value: 'no', label: 'Nei' },
          ],
        },
      ],
    },
  ],
}

let id = 0
const resp = (org: string, role: string, q: string): SurveyResponse => ({
  _id: String(id++),
  surveySlug: 's',
  surveyVersion: 1,
  submittedAt: '',
  answers: [
    { questionId: 'org', value: org },
    { questionId: 'role', value: role },
    { questionId: 'q', value: q },
  ],
})

describe('aggregateByOrganization', () => {
  it('uses majority vote and marks ties', () => {
    const r = aggregateByOrganization(survey, [
      resp('A', 'dev', 'yes'),
      resp('A', 'dev', 'yes'),
      resp('A', 'lead', 'no'),
      resp('B', 'dev', 'yes'),
      resp('B', 'dev', 'no'),
    ])
    const q = r.sections[0]!.questions.find(x => x.id === 'q')!
    expect(r.totalResponses).toBe(2)
    expect(q.options.find(o => o.value === 'yes')!.count).toBe(1)
    expect(q.options.find(o => o.value === 'uavklart')!.count).toBe(1)
  })
})

describe('withinOrgAgreement', () => {
  it('needs five orgs with several respondents', () => {
    const four = ['A', 'B', 'C', 'D'].flatMap(o => [
      resp(o, 'dev', 'yes'),
      resp(o, 'dev', 'yes'),
    ])
    expect(withinOrgAgreement(survey, four)).toEqual([])
    const rows = withinOrgAgreement(survey, [
      ...four,
      resp('E', 'dev', 'no'),
      resp('E', 'dev', 'yes'),
    ])
    expect(rows.find(r => r.id === 'q')!.observed).toBeCloseTo(0.2)
  })
})

describe('segmentBreakdowns', () => {
  it('hides small segments and suppresses small cells', () => {
    const rs = [
      ...Array.from({ length: 12 }, (_, i) => resp(`o${i}`, 'dev', 'yes')),
      ...Array.from({ length: 10 }, (_, i) =>
        resp(`p${i}`, 'lead', i < 2 ? 'yes' : 'no')
      ),
    ]
    const [seg] = segmentBreakdowns(survey, rs)
    const q = seg!.questions.find(x => x.id === 'q')!
    expect(q.segments.map(s => s.n)).toEqual([12, 10])
    const yes = q.segments[1]!.options.find(o => o.value === 'yes')!
    expect(yes.suppressed).toBe(true)
    expect(q.test!.p).toBeLessThan(0.001)
    expect(segmentBreakdowns(survey, rs.slice(0, 15))).toEqual([])
  })
})

describe('panelAnalysis', () => {
  it('pairs returning orgs and counts changes', () => {
    const orgs = ['A', 'B', 'C', 'D', 'E', 'F']
    const prev = orgs.map(o => resp(o, 'dev', 'no'))
    const cur = [
      ...orgs.map(o => resp(o, 'dev', 'yes')),
      resp('G', 'dev', 'no'),
    ]
    const p = panelAnalysis(survey, cur, survey, prev, { q: 'q' })!
    expect(p.returning).toBe(6)
    expect(p.newOrgs).toBe(1)
    const yes = p.questions[0]!.options!.find(o => o.label === 'Ja')!
    expect(yes.gained).toBe(6)
    expect(yes.p).toBeCloseTo(0.03125)
    expect(panelAnalysis(survey, cur, survey, prev.slice(0, 4), {})).toBeNull()
  })

  it('hides the whole row and p-value when any count is 1 or 2', () => {
    const orgs = ['A', 'B', 'C', 'D', 'E', 'F']
    const prev = orgs.map(o => resp(o, 'dev', 'no'))
    const cur = orgs.map((o, i) => resp(o, 'dev', i < 2 ? 'yes' : 'no'))
    const p = panelAnalysis(survey, cur, survey, prev, { q: 'q' })!
    const yes = p.questions[0]!.options!.find(o => o.label === 'Ja')!
    expect(yes.gained).toBe('<3')
    expect(yes.after).toBe('<3')
    expect(yes.lost).toBe('skjult')
    expect(yes.before).toBe('skjult')
    expect(yes.p).toBeNull()
    expect(yes.significant).toBe(false)
  })
})

describe('panelAnalysis masking', () => {
  it('hides the other counts of a row when one is small (before 10, after 9, gained 1, lost 2)', () => {
    const orgs = Array.from({ length: 20 }, (_, i) => `O${i}`)
    // 10 yes before: 2 drop to no (lost 2), 8 stay; 1 no becomes yes (gained 1)
    const prev = orgs.map((o, i) => resp(o, 'dev', i < 10 ? 'yes' : 'no'))
    const cur = orgs.map((o, i) =>
      resp(o, 'dev', i < 8 || i === 10 ? 'yes' : 'no')
    )
    const p = panelAnalysis(survey, cur, survey, prev, { q: 'q' })!
    const yes = p.questions[0]!.options!.find(o => o.label === 'Ja')!
    expect([yes.before, yes.after, yes.gained, yes.lost]).toEqual([
      'skjult',
      'skjult',
      '<3',
      '<3',
    ])
    expect(yes.p).toBeNull()
  })
})
