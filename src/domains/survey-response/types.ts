export interface SurveyResponse {
  _id: string
  surveySlug: string
  surveyVersion: number
  answers: SurveyResponseAnswer[]
  submittedAt: string
  metadata?: SurveyResponseMetadata
}

export interface SurveyResponseAnswer {
  questionId: string
  value?: string
  arrayValue?: string[]
  otherText?: string
}

export interface SurveyResponseMetadata {
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
