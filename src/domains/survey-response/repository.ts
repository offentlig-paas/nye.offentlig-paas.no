import { sanityClient } from '@/lib/sanity/config'
import { prepareSanityDocument } from '@/lib/sanity/utils'
import type { SurveyResponse, CreateSurveyResponseInput } from './types'
import { TRPCError } from '@trpc/server'

export class SurveyResponseRepository {
  async create(
    input: CreateSurveyResponseInput,
    submissionId: string
  ): Promise<SurveyResponse> {
    const doc = prepareSanityDocument({
      _id: `survey-response-${submissionId}`,
      _type: 'surveyResponse' as const,
      surveySlug: input.surveySlug,
      surveyVersion: input.surveyVersion,
      answers: input.answers,
      submittedAt: new Date().toISOString(),
      metadata: input.metadata ?? {},
    })

    try {
      const result = await sanityClient.createIfNotExists(doc)
      return result as unknown as SurveyResponse
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Sanity error'
      console.error('Sanity write failed for survey response:', {
        submissionId,
        surveySlug: input.surveySlug,
        error: message,
      })
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Kunne ikke lagre svaret. Prøv igjen.',
        cause: error,
      })
    }
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
