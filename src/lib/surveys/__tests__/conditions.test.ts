import { describe, it, expect } from 'vitest'
import { validateAnswers, validateQuestion } from '../validation'
import {
  getVisibleQuestionIds,
  getVisibleSectionIds,
  validateSurveyDefinition,
} from '../helpers'
import { SurveyStatus } from '../types'
import type { SurveyDefinition, SurveyAnswer, MatrixQuestion } from '../types'

const yesNo = [
  { label: 'Ja', value: 'yes' },
  { label: 'Nei', value: 'no' },
]

const survey: SurveyDefinition = {
  slug: 'conditions',
  version: 1,
  title: 'Conditions',
  consent: { dataCollectionText: '' },
  status: SurveyStatus.Draft,
  sections: [
    {
      id: 's1',
      title: 'S1',
      questions: [
        {
          id: 'use',
          type: 'radio',
          title: 'Use',
          required: true,
          options: yesNo,
        },
        {
          id: 'why-not',
          type: 'text',
          title: 'Why not',
          required: true,
          showIf: [{ questionId: 'use', anyOf: ['no'] }],
        },
        {
          id: 'mode',
          type: 'checkbox',
          title: 'Mode',
          required: true,
          showIf: [{ questionId: 'use', anyOf: ['yes'] }],
          options: [
            { label: 'Agent', value: 'agent' },
            { label: 'None', value: 'none', exclusive: true },
          ],
        },
      ],
    },
    {
      id: 's2',
      title: 'Only for agents',
      questions: [
        {
          id: 'autonomy',
          type: 'text',
          title: 'Autonomy',
          required: true,
          showIf: [
            { questionId: 'use', anyOf: ['yes'] },
            { questionId: 'mode', noneOf: ['none'] },
          ],
        },
      ],
    },
    {
      id: 's3',
      title: 'S3',
      questions: [
        {
          id: 'platform',
          type: 'text',
          title: 'Platform',
          required: false,
          requiredIf: [{ questionId: 'use', anyOf: ['yes'] }],
        },
      ],
    },
  ],
}

const map = (answers: SurveyAnswer[]) =>
  new Map(answers.map(a => [a.questionId, a]))

describe('showIf', () => {
  it('shows follow-ups based on earlier answers', () => {
    const ids = getVisibleQuestionIds(
      survey.sections,
      map([{ questionId: 'use', value: 'no' }])
    )
    expect(ids.has('why-not')).toBe(true)
    expect(ids.has('mode')).toBe(false)
    expect(ids.has('autonomy')).toBe(false)
  })

  it('skips a section whose questions are all hidden', () => {
    const answers = map([
      { questionId: 'use', value: 'yes' },
      { questionId: 'mode', value: ['none'] },
    ])
    expect(getVisibleSectionIds(survey.sections, answers)).toEqual(['s1', 's3'])
  })

  it('ignores stale answers to hidden questions', () => {
    // mode was answered while use=yes, then use changed to no
    const answers = map([
      { questionId: 'use', value: 'no' },
      { questionId: 'mode', value: ['agent'] },
    ])
    expect(
      getVisibleQuestionIds(survey.sections, answers).has('autonomy')
    ).toBe(false)
  })

  it('validates required only for visible questions and strips hidden', () => {
    const result = validateAnswers(survey, [
      { questionId: 'use', value: 'no' },
      { questionId: 'why-not', value: 'policy' },
      { questionId: 'mode', value: ['agent'] },
    ])
    expect(result.valid).toBe(true)
    expect(result.sanitizedAnswers.map(a => a.questionId)).toEqual([
      'use',
      'why-not',
    ])
  })

  it('enforces requiredIf', () => {
    const base: SurveyAnswer[] = [{ questionId: 'mode', value: ['none'] }]
    expect(
      validateAnswers(survey, [{ questionId: 'use', value: 'yes' }, ...base])
        .valid
    ).toBe(false)
    expect(
      validateAnswers(survey, [
        { questionId: 'use', value: 'no' },
        { questionId: 'why-not', value: 'x' },
      ]).valid
    ).toBe(true)
  })

  it('rejects conditions on later or unknown questions', () => {
    const bad: SurveyDefinition = {
      ...survey,
      sections: [
        {
          id: 's',
          title: 'S',
          questions: [
            {
              id: 'a',
              type: 'text',
              title: 'A',
              required: false,
              showIf: [{ questionId: 'b', anyOf: ['x'] }],
            },
            { id: 'b', type: 'text', title: 'B', required: false },
          ],
        },
      ],
    }
    expect(validateSurveyDefinition(bad)).toHaveLength(1)
    expect(validateSurveyDefinition(survey)).toEqual([])
  })
})

describe('matrix', () => {
  const q: MatrixQuestion = {
    id: 'access',
    type: 'matrix',
    title: 'Access',
    required: true,
    rows: [
      { value: 'scm', label: 'Kode' },
      { value: 'db', label: 'Databaser' },
    ],
    options: [
      { label: 'Ingen', value: 'none' },
      { label: 'Lese', value: 'read' },
    ],
  }
  const answer = (value: string[]) => ({ questionId: 'access', value })

  it('accepts one valid answer per row', () => {
    expect(validateQuestion(q, answer(['scm:read', 'db:none']))).toBeNull()
  })

  it('requires all rows when required', () => {
    expect(validateQuestion(q, answer(['scm:read']))).toBe(
      'Svar på alle radene'
    )
    expect(validateQuestion(q, answer(['scm:read']), false)).toBeNull()
    expect(validateQuestion(q, answer([]))).toBe('Svar på alle radene')
    expect(validateQuestion(q, undefined)).toBe('Svar på alle radene')
  })

  it('rejects unknown cells and duplicate rows', () => {
    expect(validateQuestion(q, answer(['scm:write', 'db:none']))).toMatch(
      /Ugyldig/
    )
    expect(validateQuestion(q, answer(['scm:read', 'scm:none']))).toBe(
      'Velg ett svar per rad'
    )
  })
})
