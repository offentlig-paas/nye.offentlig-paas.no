import { sanityClient } from '@/lib/sanity/config'
import { prepareSanityDocument } from '@/lib/sanity/utils'
import type { SurveyResponse, CreateSurveyResponseInput } from './types'

export class SurveyResponseRepository {
  async create(input: CreateSurveyResponseInput): Promise<SurveyResponse> {
    const doc = prepareSanityDocument({
      _type: 'surveyResponse' as const,
      surveySlug: input.surveySlug,
      surveyVersion: input.surveyVersion,
      answers: input.answers,
      submittedAt: new Date().toISOString(),
      metadata: input.metadata ?? {},
    })

    const result = await sanityClient.create(doc)
    return result as unknown as SurveyResponse
  }

  async countBySurvey(surveySlug: string): Promise<number> {
    const query = `count(*[_type == "surveyResponse" && surveySlug == $surveySlug])`
    return await sanityClient.fetch<number>(query, { surveySlug })
  }

  async countUniqueOrganizations(surveySlug: string): Promise<number> {
    const query = `count(array::unique(*[_type == "surveyResponse" && surveySlug == $surveySlug].answers[questionId == "q1-org"].value))`
    return await sanityClient.fetch<number>(query, { surveySlug })
  }

  async findBySurvey(surveySlug: string): Promise<SurveyResponse[]> {
    const query = `*[_type == "surveyResponse" && surveySlug == $surveySlug] | order(submittedAt desc)`
    return await sanityClient.fetch<SurveyResponse[]>(query, { surveySlug })
  }
}
