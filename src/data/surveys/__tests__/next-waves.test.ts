import { describe, it, expect } from 'vitest'
import {
  getConsentContact,
  getSurveyForProject,
  getVisibleQuestionIds,
  getVisibleSectionIds,
  validateSurveyDefinition,
} from '@/lib/surveys/helpers'
import { SurveyStatus, type SurveyAnswer } from '@/lib/surveys/types'
import { aiAgents2026W2 } from '../ai-agents-2026-w2'
import { stateOfPlatforms2026W3 } from '../state-of-platforms-2026-w3'

const map = (pairs: [string, string | string[]][]) =>
  new Map<string, SurveyAnswer>(
    pairs.map(([questionId, value]) => [questionId, { questionId, value }])
  )

describe.each([aiAgents2026W2, stateOfPlatforms2026W3])('$slug', survey => {
  it('is a valid draft', () => {
    expect(validateSurveyDefinition(survey)).toEqual([])
    expect(survey.status).toBe(SurveyStatus.Draft)
    expect(survey.consent.fullText).toContain('foreningen Offentlig PAAS')
  })

  it('has no ":" in matrix codes (used as row:column separator)', () => {
    for (const q of survey.sections.flatMap(s => s.questions)) {
      if (q.type !== 'matrix') continue
      for (const v of [...q.rows, ...q.options].map(o => o.value)) {
        expect(v).not.toContain(':')
      }
    }
  })
})

describe('AI Agents Wave 2 routing', () => {
  const contactIds = ['q24-email', 'q24-later-rounds']
  const count = (answers: Map<string, SurveyAnswer>) =>
    [...getVisibleQuestionIds(aiAgents2026W2.sections, answers)].filter(
      id => !contactIds.includes(id)
    ).length

  it('matches the question counts in the instrument', () => {
    expect(count(map([['q8-personal-use', 'no']]))).toBe(25)
    expect(
      count(
        map([
          ['q8-personal-use', 'no'],
          ['q20-concerns', ['skill-loss']],
        ])
      )
    ).toBe(26)
    expect(
      count(
        map([
          ['q8-personal-use', 'yes'],
          ['q10b-agent-production', 'no-agents'],
        ])
      )
    ).toBe(31)
    expect(
      count(
        map([
          ['q8-personal-use', 'yes'],
          ['q10b-agent-production', 'regular-prod'],
          ['q20-concerns', ['skill-loss']],
        ])
      )
    ).toBe(35)
  })

  it('ends the survey when there are no developers', () => {
    const ids = getVisibleSectionIds(
      aiAgents2026W2.sections,
      map([['q4-dev-count', 'none']])
    )
    expect(ids).toEqual(['context'])
  })

  it('shows Q20b on its own page only after skill-loss', () => {
    const without = getVisibleSectionIds(
      aiAgents2026W2.sections,
      map([['q20-concerns', ['security']]])
    )
    expect(without).not.toContain('skill-loss')
    const withIt = getVisibleSectionIds(
      aiAgents2026W2.sections,
      map([['q20-concerns', ['skill-loss']]])
    )
    expect(withIt).toContain('skill-loss')
  })
})

describe('State of Platforms Wave 3 routing', () => {
  it('skips platform questions and the maturity page without a platform', () => {
    const answers = map([
      ['q7-platform', 'Nei'],
      ['q14-kubernetes', 'Nei'],
    ])
    const sections = getVisibleSectionIds(
      stateOfPlatforms2026W3.sections,
      answers
    )
    expect(sections).not.toContain('maturity')
    const ids = getVisibleQuestionIds(stateOfPlatforms2026W3.sections, answers)
    for (const id of [
      'q8-platform-name',
      'q15-distributions',
      'q32-ai-capabilities',
      'q33a-inference-model',
      'q35-agent-interfaces',
    ]) {
      expect(ids.has(id)).toBe(false)
    }
    expect(ids.has('q34-platform-role')).toBe(true)
  })

  it('shows Q33b only for external AI services', () => {
    const visible = (q33a: string[]) =>
      getVisibleQuestionIds(
        stateOfPlatforms2026W3.sections,
        map([
          ['q7-platform', 'Ja'],
          ['q33a-inference-model', q33a],
        ])
      ).has('q33b-inference-region')
    expect(visible(['on-prem'])).toBe(false)
    expect(visible(['vendor-api', 'on-prem'])).toBe(true)
  })
})

describe('per-wave data controller', () => {
  it('uses the association for new waves and keeps earlier waves unchanged', () => {
    expect(getConsentContact(aiAgents2026W2.slug)?.dataController).toBe(
      'foreningen Offentlig PAAS, ved styreleder'
    )
    expect(getConsentContact(stateOfPlatforms2026W3.slug)?.dataController).toBe(
      'foreningen Offentlig PAAS, ved styreleder'
    )
    expect(getConsentContact('ai-agents-2026')?.dataController).toBe(
      'Hans Kristian Flaatten (styreleder, Offentlig PaaS)'
    )
  })

  it('keeps the public AI Agents form and results on Wave 1', () => {
    expect(getSurveyForProject('state-of-ai-agents')?.slug).toBe(
      'ai-agents-2026'
    )
  })
})
