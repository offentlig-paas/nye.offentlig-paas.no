import { describe, it, expect, vi } from 'vitest'
import { SurveyStatus, type SurveyDefinition } from '../types'

const def = (
  slug: string,
  status: SurveyStatus,
  published = false
): SurveyDefinition => ({
  slug,
  version: 1,
  title: slug,
  consent: { dataCollectionText: '' },
  status,
  sections: [],
  resultsConfig: { published },
})

vi.mock('@/data/surveys', () => ({
  surveys: [
    def('w1', SurveyStatus.Closed, true),
    def('w2', SurveyStatus.Closed, true),
    def('w3', SurveyStatus.Open),
    def('w4', SurveyStatus.Draft),
  ],
}))
vi.mock('@/data/research', () => ({
  researchProjects: [
    {
      slug: 'p',
      surveys: ['w1', 'w2', 'w3', 'w4'].map(surveySlug => ({ surveySlug })),
    },
  ],
}))

const { getSurveyForProject } = await import('../helpers')

describe('getSurveyForProject rule', () => {
  it('form: newest open survey, never a draft', () => {
    expect(getSurveyForProject('p', 'form')?.slug).toBe('w3')
  })

  it('results: newest survey with published results', () => {
    expect(getSurveyForProject('p', 'results')?.slug).toBe('w2')
  })
})
