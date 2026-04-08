import { sanityClient } from '@/lib/sanity/config'
import { prepareSanityDocument } from '@/lib/sanity/utils'
import type {
  SurveyResponse,
  CreateSurveyResponseInput,
  CreateSurveyContactInput,
  OrganizationOverride,
} from './types'
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

  async createContactInfo(input: CreateSurveyContactInput): Promise<void> {
    const doc = prepareSanityDocument({
      _id: `survey-contact-${input.surveySlug}-${input.submissionId}`,
      _type: 'surveyContactInfo' as const,
      submissionId: input.submissionId,
      surveySlug: input.surveySlug,
      answers: input.answers,
      createdAt: new Date().toISOString(),
    })

    try {
      await sanityClient.createIfNotExists(doc)
    } catch (error) {
      console.error('Failed to store survey contact info:', {
        submissionId: input.submissionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async countBySurvey(surveySlug: string): Promise<number> {
    const query = `count(*[_type == "surveyResponse" && surveySlug == $surveySlug])`
    return await sanityClient.fetch<number>(query, { surveySlug })
  }

  async countUniqueOrganizations(
    surveySlug: string,
    orgQuestionId = 'q1-org'
  ): Promise<number> {
    const query = `count(array::unique(*[_type == "surveyResponse" && surveySlug == $surveySlug].answers[questionId == $orgQuestionId].value))`
    return await sanityClient.fetch<number>(query, {
      surveySlug,
      orgQuestionId,
    })
  }

  async findBySurvey(surveySlug: string): Promise<SurveyResponse[]> {
    const query = `*[_type == "surveyResponse" && surveySlug == $surveySlug] | order(submittedAt desc)`
    return await sanityClient.fetch<SurveyResponse[]>(query, { surveySlug })
  }

  async getLatestResponseDate(surveySlug: string): Promise<string | null> {
    const result = await sanityClient.fetch<{ submittedAt: string } | null>(
      `*[_type == "surveyResponse" && surveySlug == $surveySlug] | order(submittedAt desc) [0] { submittedAt }`,
      { surveySlug }
    )
    return result?.submittedAt ?? null
  }

  async findBySurveyPaginated(
    surveySlug: string,
    offset: number,
    limit: number
  ): Promise<{ responses: SurveyResponse[]; total: number }> {
    const [responses, total] = await Promise.all([
      sanityClient.fetch<SurveyResponse[]>(
        `*[_type == "surveyResponse" && surveySlug == $surveySlug] | order(submittedAt desc) [$offset...$end]`,
        { surveySlug, offset, end: offset + limit }
      ),
      this.countBySurvey(surveySlug),
    ])
    return { responses, total }
  }

  async getOrganizationBreakdown(
    surveySlug: string,
    orgQuestionId = 'q1-org'
  ): Promise<{ organization: string; count: number }[]> {
    const query = `*[_type == "surveyResponse" && surveySlug == $surveySlug]{
      "org": answers[questionId == $orgQuestionId][0].value
    }`
    const rows = await sanityClient.fetch<{ org: string | null }[]>(query, {
      surveySlug,
      orgQuestionId,
    })

    const counts = new Map<string, number>()
    for (const row of rows) {
      const org = row.org ?? 'Ukjent'
      counts.set(org, (counts.get(org) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([organization, count]) => ({ organization, count }))
      .sort((a, b) => b.count - a.count)
  }

  async getDailyResponseCounts(
    surveySlug: string
  ): Promise<{ date: string; count: number }[]> {
    const query = `*[_type == "surveyResponse" && surveySlug == $surveySlug]{
      "date": string::split(submittedAt, "T")[0]
    }`
    const rows = await sanityClient.fetch<{ date: string }[]>(query, {
      surveySlug,
    })

    const counts = new Map<string, number>()
    for (const row of rows) {
      counts.set(row.date, (counts.get(row.date) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  async setOrganizationOverride(
    responseId: string,
    override: OrganizationOverride
  ): Promise<void> {
    await sanityClient
      .patch(responseId)
      .set({ organizationOverride: override })
      .commit()
  }

  async findById(responseId: string): Promise<SurveyResponse | null> {
    return await sanityClient.fetch<SurveyResponse | null>(
      `*[_type == "surveyResponse" && _id == $id][0]`,
      { id: responseId }
    )
  }
}
