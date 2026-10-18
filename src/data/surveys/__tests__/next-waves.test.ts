import { describe, it, expect } from 'vitest'
import {
  getConsentContact,
  getVisibleQuestionIds,
  getVisibleSectionIds,
  validateSurveyDefinition,
} from '@/lib/surveys/helpers'
import { SurveyStatus, type SurveyAnswer } from '@/lib/surveys/types'
import { aiAgents2027 } from '../ai-agents-2027'
import { stateOfPlatforms2027 } from '../state-of-platforms-2027'

const map = (pairs: [string, string | string[]][]) =>
  new Map<string, SurveyAnswer>(
    pairs.map(([questionId, value]) => [questionId, { questionId, value }])
  )

describe.each([aiAgents2027, stateOfPlatforms2027])('$slug', survey => {
  it('is a valid pilot', () => {
    expect(validateSurveyDefinition(survey)).toEqual([])
    expect(survey.status).toBe(SurveyStatus.Pilot)
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
    [...getVisibleQuestionIds(aiAgents2027.sections, answers)].filter(
      id => !contactIds.includes(id)
    ).length

  it('matches the question counts in the instrument', () => {
    expect(count(map([['q8-personal-use', 'no']]))).toBe(26)
    expect(
      count(
        map([
          ['q8-personal-use', 'no'],
          ['q20-concerns', ['skill-loss']],
        ])
      )
    ).toBe(27)
    expect(
      count(
        map([
          ['q8-personal-use', 'yes'],
          ['q10b-agent-production', 'no-agents'],
        ])
      )
    ).toBe(32)
    expect(
      count(
        map([
          ['q8-personal-use', 'yes'],
          ['q10b-agent-production', 'regular-prod'],
          ['q20-concerns', ['skill-loss']],
        ])
      )
    ).toBe(36)
  })

  it('offers indirect access in the Q26b matrix', () => {
    const q = aiAgents2027.sections
      .flatMap(s => s.questions)
      .find(q => q.id === 'q26b-system-access')
    expect(q?.type === 'matrix' && q.options.map(o => o.value)).toEqual([
      'none',
      'indirect',
      'read',
      'read-write',
      'not-used',
      'unknown',
    ])
  })

  it('ends the survey when there are no developers', () => {
    const ids = getVisibleSectionIds(
      aiAgents2027.sections,
      map([['q4-dev-count', 'none']])
    )
    expect(ids).toEqual(['context'])
  })

  it('shows Q20b on its own page only after skill-loss', () => {
    const without = getVisibleSectionIds(
      aiAgents2027.sections,
      map([['q20-concerns', ['security']]])
    )
    expect(without).not.toContain('skill-loss')
    const withIt = getVisibleSectionIds(
      aiAgents2027.sections,
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
      stateOfPlatforms2027.sections,
      answers
    )
    expect(sections).not.toContain('maturity')
    const ids = getVisibleQuestionIds(stateOfPlatforms2027.sections, answers)
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
        stateOfPlatforms2027.sections,
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
    expect(getConsentContact(aiAgents2027.slug)?.dataController).toBe(
      'foreningen Offentlig PAAS, ved styreleder'
    )
    expect(getConsentContact(stateOfPlatforms2027.slug)?.dataController).toBe(
      'foreningen Offentlig PAAS, ved styreleder'
    )
    expect(getConsentContact('ai-agents-2026')?.dataController).toBe(
      'Hans Kristian Flaatten (styreleder, Offentlig PaaS)'
    )
  })
})
