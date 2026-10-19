import { describe, it, expect } from 'vitest'
import {
  getVisibleQuestionIds,
  shuffleOptions,
  surveyProgress,
} from '../helpers'
import { validateAnswers } from '../validation'
import {
  SurveyStatus,
  type SurveyAnswer,
  type SurveyDefinition,
  type SurveySection,
} from '../types'

const answersOf = (...a: SurveyAnswer[]) =>
  new Map(a.map(x => [x.questionId, x]))

describe('surveyProgress', () => {
  const sections: SurveySection[] = [
    {
      id: 's',
      title: 'S',
      questions: [
        { id: 'a', type: 'text', title: 'A', required: false },
        { id: 'b', type: 'text', title: 'B', required: false },
        {
          id: 'c',
          type: 'text',
          title: 'C',
          required: false,
          showIf: [{ questionId: 'a', anyOf: ['x'] }],
        },
      ],
    },
  ]

  it('weights by visible questions answered', () => {
    expect(surveyProgress(sections, answersOf()).fraction).toBe(0)
    const half = surveyProgress(
      sections,
      answersOf({ questionId: 'b', value: 'y' }),
      '10–15'
    )
    expect(half).toEqual({ fraction: 0.5, minutesLeft: 8 })
  })

  it('counts newly visible questions and keeps at least one minute', () => {
    const p = surveyProgress(
      sections,
      answersOf(
        { questionId: 'a', value: 'x' },
        { questionId: 'b', value: 'y' },
        { questionId: 'c', value: 'z' }
      ),
      '10–15'
    )
    expect(p).toEqual({ fraction: 1, minutesLeft: 1 })
  })

  it('omits minutes without an estimate', () => {
    expect(surveyProgress(sections, answersOf()).minutesLeft).toBeUndefined()
  })
})

describe('shuffleOptions across questions', () => {
  const tools = ['a', 'b', 'c', 'd', 'e', 'f'].map(v => ({
    label: v,
    value: v,
  }))
  const pin = (value: string) => ({
    label: value,
    value,
    pinPosition: 'last' as const,
  })

  it('shares order for equal option sets, ignoring pinned options', () => {
    const q6 = shuffleOptions([...tools, pin('none'), pin('other')], 7)
    const q9 = shuffleOptions([...tools, pin('other')], 7)
    expect(q6.slice(0, 6).map(o => o.value)).toEqual(
      q9.slice(0, 6).map(o => o.value)
    )
    expect(q6.at(-1)!.value).toBe('other')
  })
})

describe('matrix rowsFrom', () => {
  const survey: SurveyDefinition = {
    slug: 't',
    version: 1,
    title: 'T',
    status: SurveyStatus.Open,
    consent: { dataCollectionText: '' },
    sections: [
      {
        id: 's',
        title: 'S',
        questions: [
          {
            id: 'tools',
            type: 'checkbox',
            title: 'Tools',
            required: false,
            options: ['x', 'y', 'both'].map(v => ({ label: v, value: v })),
          },
          {
            id: 'm',
            type: 'matrix',
            title: 'M',
            required: true,
            rowsFrom: { questionId: 'tools', map: { both: ['x', 'y'] } },
            rows: ['x', 'y'].map(v => ({ label: v, value: v })),
            options: [
              { label: '1', value: '1' },
              { label: '2', value: '2' },
            ],
          },
        ],
      },
    ],
  }

  it('hides the matrix when no rows are selected', () => {
    const ids = getVisibleQuestionIds(
      survey.sections,
      answersOf({ questionId: 'tools', value: [] })
    )
    expect(ids.has('m')).toBe(false)
  })

  it('requires only visible rows and strips hidden rows', () => {
    const r = validateAnswers(survey, [
      { questionId: 'tools', value: ['x'] },
      { questionId: 'm', value: ['x:1', 'y:2'] },
    ])
    expect(r.valid).toBe(true)
    expect(r.sanitizedAnswers.find(a => a.questionId === 'm')!.value).toEqual([
      'x:1',
    ])
  })

  it('expands codes through map', () => {
    const r = validateAnswers(survey, [
      { questionId: 'tools', value: ['both'] },
      { questionId: 'm', value: ['x:1'] },
    ])
    expect(r.valid).toBe(false)
  })
})
