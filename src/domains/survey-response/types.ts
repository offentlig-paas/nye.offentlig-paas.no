export interface SurveyResponse {
  _id: string
  surveySlug: string
  surveyVersion: number
  answers: SurveyResponseAnswer[]
  submittedAt: string
  metadata?: SurveyResponseMetadata
  organizationOverride?: OrganizationOverride
}

export interface OrganizationOverride {
  memberName: string
  originalValue: string
  overriddenBy: string
  overriddenAt: string
}

interface SurveyResponseAnswer {
  questionId: string
  value?: string
  arrayValue?: string[]
  otherText?: string
}

interface SurveyResponseMetadata {
  deviceCategory?: string
  submissionSource?: string
  consentVersion?: number
  durationSeconds?: number
  environment?: string
}

export interface CreateSurveyResponseInput {
  surveySlug: string
  surveyVersion: number
  answers: SurveyResponseAnswer[]
  metadata?: SurveyResponseMetadata
}

export interface CreateSurveyContactInput {
  submissionId: string
  surveySlug: string
  answers: SurveyResponseAnswer[]
}
