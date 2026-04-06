import { SurveyResponseRepository } from './repository'
import type { CreateSurveyResponseInput } from './types'
import type { SurveyDefinition, SurveyAnswer } from '@/lib/surveys/types'
import { validateAnswers } from '@/lib/surveys/validation'
import { TRPCError } from '@trpc/server'

const rateLimit = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5

function categorizeDevice(userAgent?: string): string {
  if (!userAgent) return 'unknown'
  const ua = userAgent.toLowerCase()
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone/i.test(ua)) return 'mobile'
  return 'desktop'
}

class SurveyResponseService {
  private repository: SurveyResponseRepository

  constructor() {
    this.repository = new SurveyResponseRepository()
  }

  async submitResponse(
    survey: SurveyDefinition,
    answers: SurveyAnswer[],
    metadata: { userAgent?: string; ip?: string; durationSeconds?: number }
  ) {
    this.checkRateLimit(metadata.ip)

    const result = validateAnswers(survey, answers)
    if (!result.valid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.errors.join('; '),
      })
    }

    const input: CreateSurveyResponseInput = {
      surveySlug: survey.slug,
      surveyVersion: survey.version,
      answers: result.sanitizedAnswers.map(a => ({
        questionId: a.questionId,
        ...(Array.isArray(a.value)
          ? { arrayValue: a.value }
          : { value: a.value }),
        ...(a.otherText ? { otherText: a.otherText } : {}),
      })),
      metadata: {
        deviceCategory: categorizeDevice(metadata.userAgent),
        submissionSource: 'web',
        consentVersion: survey.version,
        durationSeconds: metadata.durationSeconds,
      },
    }

    return await this.repository.create(input)
  }

  async getResponseCount(surveySlug: string): Promise<number> {
    return await this.repository.countBySurvey(surveySlug)
  }

  private checkRateLimit(ip?: string) {
    if (!ip) return

    const now = Date.now()
    const timestamps = rateLimit.get(ip) ?? []
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)

    if (recent.length >= RATE_LIMIT_MAX) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'For mange innsendinger. Prøv igjen senere.',
      })
    }

    recent.push(now)
    rateLimit.set(ip, recent)
  }
}

export const surveyResponseService = new SurveyResponseService()
