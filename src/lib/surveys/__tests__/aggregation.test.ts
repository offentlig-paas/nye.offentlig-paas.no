import { describe, it, expect } from 'vitest'
import { aggregateSurveyResults } from '../aggregation'
import type { SurveyDefinition } from '../types'
import { SurveyStatus } from '../types'
import type { SurveyResponse } from '@/domains/survey-response/types'

function makeResponse(
  answers: { questionId: string; value?: string; arrayValue?: string[] }[]
): SurveyResponse {
  return {
    _id: `survey-response-${Math.random()}`,
    surveySlug: 'test',
    surveyVersion: 1,
    answers: answers.map(a => ({
      questionId: a.questionId,
      value: a.value,
      arrayValue: a.arrayValue,
    })),
    submittedAt: new Date().toISOString(),
  }
}

const baseSurvey: SurveyDefinition = {
  slug: 'test',
  version: 1,
  title: 'Test Survey',
  consent: { dataCollectionText: 'test' },
  status: SurveyStatus.Open,
  sections: [],
}

describe('aggregateSurveyResults', () => {
  it('counts radio options correctly', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Favorite color?',
              required: true,
              options: [
                { label: 'Red', value: 'red' },
                { label: 'Blue', value: 'blue' },
                { label: 'Green', value: 'green' },
              ],
            },
          ],
        },
      ],
    }

    const responses = [
      makeResponse([{ questionId: 'q1', value: 'red' }]),
      makeResponse([{ questionId: 'q1', value: 'blue' }]),
      makeResponse([{ questionId: 'q1', value: 'red' }]),
    ]

    const result = aggregateSurveyResults(survey, responses)

    expect(result.totalResponses).toBe(3)
    expect(result.sections).toHaveLength(1)

    const q = result.sections[0]!.questions[0]!
    expect(q.responseCount).toBe(3)
    expect(q.options).toHaveLength(3)
    expect(q.options[0]).toEqual({
      label: 'Red',
      value: 'red',
      count: 2,
      percentage: 67,
    })
    expect(q.options[1]).toEqual({
      label: 'Blue',
      value: 'blue',
      count: 1,
      percentage: 33,
    })
    expect(q.options[2]).toEqual({
      label: 'Green',
      value: 'green',
      count: 0,
      percentage: 0,
    })
  })

  it('counts checkbox multi-select options', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'checkbox',
              title: 'Tools?',
              required: true,
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

    const responses = [
      makeResponse([{ questionId: 'q1', arrayValue: ['a', 'b'] }]),
      makeResponse([{ questionId: 'q1', arrayValue: ['a', 'c'] }]),
      makeResponse([{ questionId: 'q1', arrayValue: ['b'] }]),
    ]

    const result = aggregateSurveyResults(survey, responses)
    const q = result.sections[0]!.questions[0]!

    expect(q.options[0]).toMatchObject({ value: 'a', count: 2 })
    expect(q.options[1]).toMatchObject({ value: 'b', count: 2 })
    expect(q.options[2]).toMatchObject({ value: 'c', count: 1 })
  })

  it('groups typeahead values and limits to top N', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      resultsConfig: { published: true, typeaheadGroupingLimit: 2 },
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'typeahead',
              title: 'Org?',
              required: true,
              suggestions: [],
            },
          ],
        },
      ],
    }

    const responses = [
      makeResponse([{ questionId: 'q1', value: 'Nav' }]),
      makeResponse([{ questionId: 'q1', value: 'Nav' }]),
      makeResponse([{ questionId: 'q1', value: 'Skatt' }]),
      makeResponse([{ questionId: 'q1', value: 'Politi' }]),
    ]

    const result = aggregateSurveyResults(survey, responses)
    const q = result.sections[0]!.questions[0]!

    expect(q.options).toHaveLength(3)
    expect(q.options[0]).toMatchObject({ label: 'Nav', count: 2 })
    expect(q.options[1]).toMatchObject({ label: 'Skatt', count: 1 })
    expect(q.options[2]).toMatchObject({
      label: 'Andre',
      value: '_other',
      count: 1,
    })
  })

  it('excludes sensitive questions', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sensitiveQuestionIds: ['q2'],
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Q1',
              required: true,
              options: [{ label: 'A', value: 'a' }],
            },
            {
              id: 'q2',
              type: 'text',
              title: 'Email',
              required: false,
            },
          ],
        },
      ],
    }

    const result = aggregateSurveyResults(survey, [])
    expect(
      result.sections[0]!.questions.find(q => q.id === 'q2')
    ).toBeUndefined()
  })

  it('excludes questions with visualization: hidden', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Visible',
              required: true,
              options: [{ label: 'A', value: 'a' }],
            },
            {
              id: 'q2',
              type: 'radio',
              title: 'Hidden confidence',
              required: true,
              visualization: 'hidden',
              options: [{ label: 'A', value: 'a' }],
            },
          ],
        },
      ],
    }

    const result = aggregateSurveyResults(survey, [])
    expect(result.sections[0]!.questions).toHaveLength(1)
    expect(result.sections[0]!.questions[0]!.id).toBe('q1')
  })

  it('hides text and textarea by default', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'text',
              title: 'Free text',
              required: false,
            },
            {
              id: 'q2',
              type: 'textarea',
              title: 'Long text',
              required: false,
            },
            {
              id: 'q3',
              type: 'radio',
              title: 'Radio',
              required: true,
              options: [{ label: 'A', value: 'a' }],
            },
          ],
        },
      ],
    }

    const result = aggregateSurveyResults(survey, [])
    expect(result.sections[0]!.questions).toHaveLength(1)
    expect(result.sections[0]!.questions[0]!.id).toBe('q3')
  })

  it('sets diverging visualization when configured', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Trust?',
              required: true,
              visualization: 'diverging',
              options: [
                { label: 'Never', value: 'never' },
                { label: 'Sometimes', value: 'sometimes' },
                { label: 'Always', value: 'always' },
              ],
            },
          ],
        },
      ],
    }

    const result = aggregateSurveyResults(survey, [])
    expect(result.sections[0]!.questions[0]!.visualization).toBe('diverging')
  })

  it('handles branching — reduces N for skipped sections', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Screening',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Use AI?',
              required: true,
              options: [
                { label: 'Yes', value: 'yes' },
                {
                  label: 'No',
                  value: 'no',
                  skipToSection: 'end',
                },
              ],
            },
          ],
        },
        {
          id: 's2',
          title: 'Usage',
          questions: [
            {
              id: 'q2',
              type: 'radio',
              title: 'Which tool?',
              required: true,
              options: [
                { label: 'Copilot', value: 'copilot' },
                { label: 'Cursor', value: 'cursor' },
              ],
            },
          ],
        },
      ],
    }

    const responses = [
      makeResponse([
        { questionId: 'q1', value: 'yes' },
        { questionId: 'q2', value: 'copilot' },
      ]),
      makeResponse([{ questionId: 'q1', value: 'no' }]),
      makeResponse([
        { questionId: 'q1', value: 'yes' },
        { questionId: 'q2', value: 'cursor' },
      ]),
    ]

    const result = aggregateSurveyResults(survey, responses)

    expect(result.sections[0]!.questions[0]!.responseCount).toBe(3)
    expect(result.sections[1]!.questions[0]!.responseCount).toBe(2)
  })

  it('omits sections with no visible questions', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sensitiveQuestionIds: ['q1'],
      sections: [
        {
          id: 's1',
          title: 'Sensitive only',
          questions: [
            {
              id: 'q1',
              type: 'text',
              title: 'Email',
              required: false,
            },
          ],
        },
        {
          id: 's2',
          title: 'Visible',
          questions: [
            {
              id: 'q2',
              type: 'radio',
              title: 'Q',
              required: true,
              options: [{ label: 'A', value: 'a' }],
            },
          ],
        },
      ],
    }

    const result = aggregateSurveyResults(survey, [])
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0]!.id).toBe('s2')
  })

  it('preserves option order from definition', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Size?',
              required: true,
              options: [
                { label: '1-10', value: '1-10' },
                { label: '11-50', value: '11-50' },
                { label: '51-200', value: '51-200' },
              ],
            },
          ],
        },
      ],
    }

    const responses = [
      makeResponse([{ questionId: 'q1', value: '51-200' }]),
      makeResponse([{ questionId: 'q1', value: '1-10' }]),
    ]

    const result = aggregateSurveyResults(survey, responses)
    const opts = result.sections[0]!.questions[0]!.options

    expect(opts[0]!.value).toBe('1-10')
    expect(opts[1]!.value).toBe('11-50')
    expect(opts[2]!.value).toBe('51-200')
  })

  it('handles empty responses', () => {
    const survey: SurveyDefinition = {
      ...baseSurvey,
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          questions: [
            {
              id: 'q1',
              type: 'radio',
              title: 'Q',
              required: true,
              options: [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
              ],
            },
          ],
        },
      ],
    }

    const result = aggregateSurveyResults(survey, [])
    expect(result.totalResponses).toBe(0)
    expect(result.sections[0]!.questions[0]!.responseCount).toBe(0)
    expect(result.sections[0]!.questions[0]!.options[0]!.percentage).toBe(0)
  })
})
