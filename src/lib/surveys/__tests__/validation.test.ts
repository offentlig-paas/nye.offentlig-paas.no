import { describe, it, expect } from 'vitest'
import { validateAnswers, validateQuestion } from '../validation'
import { SurveyStatus } from '../types'
import type { SurveyDefinition, SurveyAnswer, SurveyQuestion } from '../types'

const testSurvey: SurveyDefinition = {
  slug: 'test',
  version: 1,
  title: 'Test Survey',
  consent: { dataCollectionText: '' },
  status: SurveyStatus.Open,
  sections: [
    {
      id: 's1',
      title: 'Section 1',
      questions: [
        { id: 'name', type: 'text', title: 'Name', required: true },
        {
          id: 'email',
          type: 'text',
          title: 'Email',
          required: false,
          format: 'email',
        },
        {
          id: 'role',
          type: 'radio',
          title: 'Role',
          required: true,
          options: [
            { label: 'Dev', value: 'dev' },
            {
              label: 'Skip',
              value: 'skip',
              skipToSection: 'end',
            },
          ],
        },
      ],
    },
    {
      id: 's2',
      title: 'Section 2',
      questions: [
        {
          id: 'tools',
          type: 'checkbox',
          title: 'Tools',
          required: true,
          maxSelections: 2,
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
            { label: 'C', value: 'c' },
          ],
        },
        {
          id: 'comments',
          type: 'textarea',
          title: 'Comments',
          required: false,
          maxLength: 100,
        },
      ],
    },
  ],
}

describe('validateQuestion', () => {
  it('returns error for missing required text', () => {
    const q: SurveyQuestion = {
      id: 'q1',
      type: 'text',
      title: 'Name',
      required: true,
    }
    expect(validateQuestion(q, undefined)).toBe('Dette feltet er påkrevd')
  })

  it('returns null for valid optional answer', () => {
    const q: SurveyQuestion = {
      id: 'q1',
      type: 'text',
      title: 'Name',
      required: false,
    }
    expect(validateQuestion(q, undefined)).toBeNull()
  })

  it('validates email format', () => {
    const q: SurveyQuestion = {
      id: 'q1',
      type: 'text',
      title: 'Email',
      required: false,
      format: 'email',
    }
    expect(validateQuestion(q, { questionId: 'q1', value: 'bad' })).toBe(
      'Ugyldig e-postadresse'
    )
    expect(validateQuestion(q, { questionId: 'q1', value: 'a@b.c' })).toBeNull()
  })

  it('validates radio option values', () => {
    const q: SurveyQuestion = {
      id: 'q1',
      type: 'radio',
      title: 'Pick',
      required: true,
      options: [{ label: 'A', value: 'a' }],
    }
    expect(validateQuestion(q, { questionId: 'q1', value: 'bad' })).toBe(
      'Ugyldig valg'
    )
    expect(validateQuestion(q, { questionId: 'q1', value: 'a' })).toBeNull()
  })

  it('validates checkbox min/max selections', () => {
    const q: SurveyQuestion = {
      id: 'q1',
      type: 'checkbox',
      title: 'Pick',
      required: true,
      minSelections: 2,
      maxSelections: 3,
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
        { label: 'D', value: 'd' },
      ],
    }
    expect(validateQuestion(q, { questionId: 'q1', value: ['a'] })).toMatch(
      /minst 2/
    )
    expect(
      validateQuestion(q, { questionId: 'q1', value: ['a', 'b', 'c', 'd'] })
    ).toMatch(/Maks 3/)
    expect(
      validateQuestion(q, { questionId: 'q1', value: ['a', 'b'] })
    ).toBeNull()
  })

  it('requires otherText when allowOtherText option is selected', () => {
    const q: SurveyQuestion = {
      id: 'q1',
      type: 'radio',
      title: 'Pick',
      required: true,
      options: [
        { label: 'A', value: 'a' },
        { label: 'Other', value: 'other', allowOtherText: true },
      ],
    }
    expect(validateQuestion(q, { questionId: 'q1', value: 'other' })).toBe(
      'Spesifiser valget ditt'
    )
    expect(
      validateQuestion(q, {
        questionId: 'q1',
        value: 'other',
        otherText: 'my answer',
      })
    ).toBeNull()
    expect(validateQuestion(q, { questionId: 'q1', value: 'a' })).toBeNull()
  })
})

describe('validateAnswers', () => {
  it('passes with valid complete answers', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test User' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a', 'b'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('fails when required field is missing', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Name'))).toBe(true)
  })

  it('fails when required field is empty string', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: '   ' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(false)
  })

  it('validates email format', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'email', value: 'not-an-email' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('e-postadresse'))).toBe(true)
  })

  it('accepts valid email', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'email', value: 'test@example.com' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(true)
  })

  it('rejects invalid radio value', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'role', value: 'invalid-option' },
      { questionId: 'tools', value: ['a'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Ugyldig valg'))).toBe(true)
  })

  it('enforces maxSelections on checkbox', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a', 'b', 'c'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Maks 2'))).toBe(true)
  })

  it('rejects invalid checkbox values', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a', 'invalid'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('"invalid"'))).toBe(true)
  })

  it('enforces textarea maxLength', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a'] },
      { questionId: 'comments', value: 'x'.repeat(101) },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('100'))).toBe(true)
  })

  it('strips answers from skipped sections', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'role', value: 'skip' },
      { questionId: 'tools', value: ['a'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(true)
    expect(
      result.sanitizedAnswers.find(a => a.questionId === 'tools')
    ).toBeUndefined()
  })

  it('does not require fields from skipped sections', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'Test' },
      { questionId: 'role', value: 'skip' },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(true)
  })

  it('enforces minSelections on checkbox', () => {
    const surveyWithMin: SurveyDefinition = {
      slug: 'min-test',
      version: 1,
      title: 'Min Test',
      consent: { dataCollectionText: '' },
      status: SurveyStatus.Open,
      sections: [
        {
          id: 's1',
          title: 'S1',
          questions: [
            {
              id: 'multi',
              type: 'checkbox',
              title: 'Pick several',
              required: true,
              minSelections: 2,
              options: [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
                { label: 'C', value: 'c' },
              ],
            },
          ],
        },
      ],
    }
    const tooFew: SurveyAnswer[] = [{ questionId: 'multi', value: ['a'] }]
    const result = validateAnswers(surveyWithMin, tooFew)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('minst 2'))).toBe(true)

    const enough: SurveyAnswer[] = [{ questionId: 'multi', value: ['a', 'b'] }]
    const ok = validateAnswers(surveyWithMin, enough)
    expect(ok.valid).toBe(true)
  })

  it('deduplicates answers (last wins)', () => {
    const answers: SurveyAnswer[] = [
      { questionId: 'name', value: 'First' },
      { questionId: 'name', value: 'Second' },
      { questionId: 'role', value: 'dev' },
      { questionId: 'tools', value: ['a'] },
    ]
    const result = validateAnswers(testSurvey, answers)
    expect(result.valid).toBe(true)
    const nameAnswer = result.sanitizedAnswers.find(
      a => a.questionId === 'name'
    )
    expect(nameAnswer?.value).toBe('Second')
    expect(
      result.sanitizedAnswers.filter(a => a.questionId === 'name')
    ).toHaveLength(1)
  })
})

describe('exclusive options', () => {
  const exclusiveQuestion: SurveyQuestion = {
    id: 'q1',
    type: 'checkbox',
    title: 'Pick',
    required: true,
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'None', value: 'none', exclusive: true },
    ],
  }

  it('accepts exclusive option alone', () => {
    expect(
      validateQuestion(exclusiveQuestion, {
        questionId: 'q1',
        value: ['none'],
      })
    ).toBeNull()
  })

  it('rejects exclusive option combined with others', () => {
    expect(
      validateQuestion(exclusiveQuestion, {
        questionId: 'q1',
        value: ['a', 'none'],
      })
    ).toMatch(/eksklusivt/)
  })

  it('accepts multiple non-exclusive options', () => {
    expect(
      validateQuestion(exclusiveQuestion, {
        questionId: 'q1',
        value: ['a', 'b'],
      })
    ).toBeNull()
  })
})
