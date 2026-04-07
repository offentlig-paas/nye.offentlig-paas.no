import { describe, it, expect } from 'vitest'
import {
  getSurvey,
  getActiveSurveys,
  getVisibleSectionIds,
  getVisibleQuestionIds,
  validateSurveyDefinition,
  getSurveyForProject,
  shuffleOptions,
  buildConsentText,
  buildThankYouMessage,
} from '../helpers'
import { SurveyStatus } from '../types'
import type {
  SurveyDefinition,
  SurveyAnswer,
  SurveySection,
  QuestionOption,
  ConsentContact,
} from '../types'
import { aiAgents2026 } from '@/data/surveys/ai-agents-2026'

describe('getSurvey', () => {
  it('finds a survey by slug', () => {
    const survey = getSurvey('ai-agents-2026')
    expect(survey).toBeDefined()
    expect(survey?.title).toBe('KI-kodeverktøy i norsk offentlig sektor')
  })

  it('returns undefined for unknown slug', () => {
    expect(getSurvey('nonexistent')).toBeUndefined()
  })
})

describe('getSurveyForProject', () => {
  it('finds the survey linked to state-of-ai-agents project', () => {
    const survey = getSurveyForProject('state-of-ai-agents')
    expect(survey).toBeDefined()
    expect(survey?.slug).toBe('ai-agents-2026')
  })

  it('returns undefined for project without surveySlug', () => {
    expect(getSurveyForProject('state-of-platforms')).toBeUndefined()
  })

  it('returns undefined for unknown project', () => {
    expect(getSurveyForProject('nonexistent')).toBeUndefined()
  })
})

describe('getActiveSurveys', () => {
  it('returns surveys with Open status', () => {
    const active = getActiveSurveys()
    expect(active.length).toBeGreaterThan(0)
    active.forEach(s => expect(s.status).toBe(SurveyStatus.Open))
  })
})

describe('validateSurveyDefinition', () => {
  it('validates the AI agents 2026 survey with no errors', () => {
    const errors = validateSurveyDefinition(aiAgents2026)
    expect(errors).toEqual([])
  })

  it('detects duplicate section IDs', () => {
    const bad: SurveyDefinition = {
      slug: 'test',
      version: 1,
      title: 'Test',
      consent: { dataCollectionText: '' },
      status: SurveyStatus.Draft,
      sections: [
        { id: 'dup', title: 'A', questions: [] },
        { id: 'dup', title: 'B', questions: [] },
      ],
    }
    const errors = validateSurveyDefinition(bad)
    expect(errors).toContain('Duplicate section ID: "dup"')
  })

  it('detects duplicate question IDs across sections', () => {
    const bad: SurveyDefinition = {
      slug: 'test',
      version: 1,
      title: 'Test',
      consent: { dataCollectionText: '' },
      status: SurveyStatus.Draft,
      sections: [
        {
          id: 's1',
          title: 'A',
          questions: [{ id: 'q1', type: 'text', title: 'Q', required: false }],
        },
        {
          id: 's2',
          title: 'B',
          questions: [{ id: 'q1', type: 'text', title: 'Q2', required: false }],
        },
      ],
    }
    const errors = validateSurveyDefinition(bad)
    expect(errors).toContain('Duplicate question ID: "q1"')
  })

  it('detects invalid skipToSection references', () => {
    const bad: SurveyDefinition = {
      slug: 'test',
      version: 1,
      title: 'Test',
      consent: { dataCollectionText: '' },
      status: SurveyStatus.Draft,
      sections: [
        {
          id: 's1',
          title: 'A',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Q',
              required: false,
              options: [
                {
                  label: 'Skip',
                  value: 'skip',
                  skipToSection: 'nonexistent',
                },
              ],
            },
          ],
        },
      ],
    }
    const errors = validateSurveyDefinition(bad)
    expect(errors.some(e => e.includes('nonexistent'))).toBe(true)
  })

  it('allows skipToSection: "end"', () => {
    const good: SurveyDefinition = {
      slug: 'test',
      version: 1,
      title: 'Test',
      consent: { dataCollectionText: '' },
      status: SurveyStatus.Draft,
      sections: [
        {
          id: 's1',
          title: 'A',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Q',
              required: false,
              options: [{ label: 'End', value: 'end', skipToSection: 'end' }],
            },
          ],
        },
      ],
    }
    const errors = validateSurveyDefinition(good)
    expect(errors).toEqual([])
  })

  it('detects radio question with no options', () => {
    const bad: SurveyDefinition = {
      slug: 'test',
      version: 1,
      title: 'Test',
      consent: { dataCollectionText: '' },
      status: SurveyStatus.Draft,
      sections: [
        {
          id: 's1',
          title: 'A',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Q',
              required: false,
              options: [],
            },
          ],
        },
      ],
    }
    const errors = validateSurveyDefinition(bad)
    expect(errors).toContain('Question "q1" has no options')
  })

  it('detects multiple branching questions in one section', () => {
    const bad: SurveyDefinition = {
      slug: 'test',
      version: 1,
      title: 'Test',
      consent: { dataCollectionText: '' },
      status: SurveyStatus.Draft,
      sections: [
        {
          id: 's1',
          title: 'A',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Q1',
              required: false,
              options: [{ label: 'A', value: 'a', skipToSection: 's2' }],
            },
            {
              id: 'q2',
              type: 'radio',
              title: 'Q2',
              required: false,
              options: [{ label: 'B', value: 'b', skipToSection: 'end' }],
            },
          ],
        },
        { id: 's2', title: 'B', questions: [] },
      ],
    }
    const errors = validateSurveyDefinition(bad)
    expect(errors.some(e => e.includes('2 branching questions'))).toBe(true)
  })
})

describe('getVisibleSectionIds', () => {
  const sections: SurveySection[] = [
    {
      id: 's1',
      title: 'S1',
      questions: [
        {
          id: 'q1',
          type: 'radio',
          title: 'Q1',
          required: true,
          options: [
            { label: 'A', value: 'a' },
            { label: 'Skip', value: 'skip', skipToSection: 's3' },
          ],
        },
      ],
    },
    { id: 's2', title: 'S2', questions: [] },
    { id: 's3', title: 'S3', questions: [] },
  ]

  it('includes all sections when no branching answers', () => {
    const answers = new Map<string, SurveyAnswer>()
    expect(getVisibleSectionIds(sections, answers)).toEqual(['s1', 's2', 's3'])
  })

  it('skips sections when skipToSection is triggered', () => {
    const answers = new Map<string, SurveyAnswer>([
      ['q1', { questionId: 'q1', value: 'skip' }],
    ])
    expect(getVisibleSectionIds(sections, answers)).toEqual(['s1', 's3'])
  })

  it('stops at "end" skipToSection', () => {
    const endSections: SurveySection[] = [
      {
        id: 's1',
        title: 'S1',
        questions: [
          {
            id: 'q1',
            type: 'radio',
            title: 'Q1',
            required: true,
            options: [{ label: 'End', value: 'end', skipToSection: 'end' }],
          },
        ],
      },
      { id: 's2', title: 'S2', questions: [] },
    ]
    const answers = new Map<string, SurveyAnswer>([
      ['q1', { questionId: 'q1', value: 'end' }],
    ])
    expect(getVisibleSectionIds(endSections, answers)).toEqual(['s1'])
  })
})

describe('getVisibleQuestionIds', () => {
  const sections: SurveySection[] = [
    {
      id: 's1',
      title: 'S1',
      questions: [
        {
          id: 'q1',
          type: 'radio',
          title: 'Q1',
          required: true,
          options: [
            { label: 'A', value: 'a' },
            { label: 'Skip', value: 'skip', skipToSection: 's3' },
          ],
        },
      ],
    },
    {
      id: 's2',
      title: 'S2',
      questions: [{ id: 'q2', type: 'text', title: 'Q2', required: false }],
    },
    {
      id: 's3',
      title: 'S3',
      questions: [{ id: 'q3', type: 'text', title: 'Q3', required: false }],
    },
  ]

  it('excludes questions from skipped sections', () => {
    const answers = new Map<string, SurveyAnswer>([
      ['q1', { questionId: 'q1', value: 'skip' }],
    ])
    const ids = getVisibleQuestionIds(sections, answers)
    expect(ids.has('q1')).toBe(true)
    expect(ids.has('q2')).toBe(false)
    expect(ids.has('q3')).toBe(true)
  })
})

describe('AI agents 2026 survey structure', () => {
  it('has the expected number of sections', () => {
    expect(aiAgents2026.sections).toHaveLength(8)
  })

  it('has 4 branch points', () => {
    let branchCount = 0
    for (const section of aiAgents2026.sections) {
      for (const question of section.questions) {
        if (question.type !== 'radio' && question.type !== 'checkbox') continue
        for (const option of question.options) {
          if (option.skipToSection) branchCount++
        }
      }
    }
    expect(branchCount).toBe(4)
  })

  it('has unique question IDs', () => {
    const ids = new Set<string>()
    for (const section of aiAgents2026.sections) {
      for (const question of section.questions) {
        expect(ids.has(question.id)).toBe(false)
        ids.add(question.id)
      }
    }
  })

  it('has unique section IDs', () => {
    const ids = new Set(aiAgents2026.sections.map(s => s.id))
    expect(ids.size).toBe(aiAgents2026.sections.length)
  })

  it('Q3 "Ingen" skips to end', () => {
    const answers = new Map<string, SurveyAnswer>([
      ['q3-dev-count', { questionId: 'q3-dev-count', value: 'none' }],
    ])
    const visible = getVisibleSectionIds(aiAgents2026.sections, answers)
    expect(visible).toEqual(['demographics'])
  })

  it('Q8 "Nei" skips personal-usage to governance', () => {
    const answers = new Map<string, SurveyAnswer>([
      ['q8-personal-use', { questionId: 'q8-personal-use', value: 'no' }],
    ])
    const visible = getVisibleSectionIds(aiAgents2026.sections, answers)
    expect(visible).not.toContain('personal-usage')
    expect(visible).toContain('governance')
  })

  it('Q23 "Nei" skips contact to end', () => {
    const answers = new Map<string, SurveyAnswer>([
      ['q23-interview', { questionId: 'q23-interview', value: 'no' }],
    ])
    const visible = getVisibleSectionIds(aiAgents2026.sections, answers)
    expect(visible).not.toContain('contact')
  })

  it('Q23 "Ja" shows contact section', () => {
    const answers = new Map<string, SurveyAnswer>([
      ['q23-interview', { questionId: 'q23-interview', value: 'yes' }],
    ])
    const visible = getVisibleSectionIds(aiAgents2026.sections, answers)
    expect(visible).toContain('contact')
  })
})

describe('shuffleOptions', () => {
  const options: QuestionOption[] = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c' },
    { label: 'D', value: 'd' },
    { label: 'E', value: 'e' },
  ]

  it('produces deterministic order for the same seed', () => {
    const a = shuffleOptions(options, 'q1', 42)
    const b = shuffleOptions(options, 'q1', 42)
    expect(a.map(o => o.value)).toEqual(b.map(o => o.value))
  })

  it('produces different order for different seeds', () => {
    const a = shuffleOptions(options, 'q1', 42)
    const b = shuffleOptions(options, 'q1', 999)
    const same = a.every((o, i) => o.value === b[i]?.value)
    expect(same).toBe(false)
  })

  it('preserves pinPosition first', () => {
    const pinned: QuestionOption[] = [
      { label: 'First', value: 'first', pinPosition: 'first' },
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ]
    const result = shuffleOptions(pinned, 'q1', 42)
    expect(result[0]!.value).toBe('first')
    expect(result).toHaveLength(4)
  })

  it('preserves pinPosition last', () => {
    const pinned: QuestionOption[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'Other', value: 'other', pinPosition: 'last' },
    ]
    const result = shuffleOptions(pinned, 'q1', 42)
    expect(result[result.length - 1]!.value).toBe('other')
  })

  it('supports both first and last pins simultaneously', () => {
    const pinned: QuestionOption[] = [
      { label: 'None', value: 'none', pinPosition: 'first' },
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
      { label: 'Other', value: 'other', pinPosition: 'last' },
    ]
    const result = shuffleOptions(pinned, 'q1', 123)
    expect(result[0]!.value).toBe('none')
    expect(result[result.length - 1]!.value).toBe('other')
    expect(result).toHaveLength(5)
  })

  it('contains all original options', () => {
    const result = shuffleOptions(options, 'q1', 42)
    const values = result.map(o => o.value).sort()
    expect(values).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

describe('buildConsentText', () => {
  const contact: ConsentContact = {
    dataController: 'Test Person (lead)',
    contactEmail: 'test@example.com',
    legalBasis: 'samtykke (GDPR art. 6 nr. 1 bokstav a)',
    retentionPeriod: 'senest to år etter studiens slutt',
  }

  const survey: SurveyDefinition = {
    slug: 'test',
    version: 1,
    title: 'Test Survey',
    description: 'A test survey about things.',
    consent: {
      dataCollectionText: 'We collect answers about things.',
    },
    status: SurveyStatus.Open,
    sections: [],
  }

  it('includes all five standard sections', () => {
    const text = buildConsentText(survey, contact)
    expect(text).toContain('**Hva handler undersøkelsen om?**')
    expect(text).toContain('**Hvem er ansvarlig?**')
    expect(text).toContain('**Hva samler vi inn?**')
    expect(text).toContain('**Personvern og GDPR**')
    expect(text).toContain('**Frivillig deltakelse**')
  })

  it('uses description as about text by default', () => {
    const text = buildConsentText(survey, contact)
    expect(text).toContain('A test survey about things.')
  })

  it('uses aboutText override when provided', () => {
    const s = {
      ...survey,
      consent: { ...survey.consent, aboutText: 'Custom about.' },
    }
    const text = buildConsentText(s, contact)
    expect(text).toContain('Custom about.')
    expect(text).not.toContain('A test survey about things.')
  })

  it('injects contact fields into boilerplate', () => {
    const text = buildConsentText(survey, contact)
    expect(text).toContain('Test Person (lead)')
    expect(text).toContain('test@example.com')
    expect(text).toContain('samtykke (GDPR art. 6 nr. 1 bokstav a)')
    expect(text).toContain('senest to år etter studiens slutt')
  })

  it('injects dataCollectionText', () => {
    const text = buildConsentText(survey, contact)
    expect(text).toContain('We collect answers about things.')
  })

  it('includes additional sections when provided', () => {
    const s = {
      ...survey,
      consent: {
        ...survey.consent,
        additionalSections: [
          { heading: 'Oppfølging', body: 'Vi kan kontakte deg.' },
        ],
      },
    }
    const text = buildConsentText(s, contact)
    expect(text).toContain('**Oppfølging**')
    expect(text).toContain('Vi kan kontakte deg.')
  })
})

describe('buildThankYouMessage', () => {
  const contact: ConsentContact = {
    dataController: '',
    contactEmail: 'test@example.com',
    legalBasis: '',
    retentionPeriod: '',
  }

  const base: SurveyDefinition = {
    slug: 'test',
    version: 1,
    title: 'Test',
    consent: { dataCollectionText: '' },
    status: SurveyStatus.Open,
    sections: [],
  }

  it('generates default message with contact email', () => {
    const text = buildThankYouMessage(base, contact)
    expect(text).toContain('Takk for at du tok deg tid')
    expect(text).toContain('test@example.com')
  })

  it('uses custom thankYouMessage when provided', () => {
    const s = { ...base, thankYouMessage: 'Custom thanks!' }
    expect(buildThankYouMessage(s, contact)).toBe('Custom thanks!')
  })
})
