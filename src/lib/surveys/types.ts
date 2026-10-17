import type { SlackUser } from '@/lib/types'

export enum SurveyStatus {
  Draft = 'draft',
  /** Only reachable with a pilot token; shown publicly as Draft. */
  Pilot = 'pilot',
  Open = 'open',
  Closed = 'closed',
}

export interface SurveyConsent {
  /** Full consent text (markdown). Replaces the generated text when set. */
  fullText?: string
  checkboxLabel?: string
  aboutText?: string
  dataCollectionText: string
  additionalSections?: { heading: string; body: string }[]
}

export interface ConsentContact {
  dataController: string
  contactEmail: string
  legalBasis: string
  retentionPeriod: string
}

export type SurveyRole = 'owner' | 'researcher'

export interface SurveyDefinition {
  slug: string
  version: number
  title: string
  description?: string
  consent: SurveyConsent
  thankYouMessage?: string
  status: SurveyStatus
  sections: SurveySection[]
  owners?: SlackUser[]
  researchers?: SlackUser[]
  organizationQuestionId?: string
  sensitiveQuestionIds?: string[]
  resultsConfig?: ResultsConfig
}

export interface ResultsConfig {
  published: boolean
  heroText?: string
  methodologyNote?: string
  typeaheadGroupingLimit?: number
  minResponses?: number
  minBucketSize?: number
}

export interface SurveySection {
  id: string
  title: string
  description?: string
  questions: SurveyQuestion[]
}

export type SurveyQuestion =
  | TextQuestion
  | TextareaQuestion
  | RadioQuestion
  | CheckboxQuestion
  | TypeaheadQuestion
  | MatrixQuestion

/**
 * Condition on an earlier question. Met when that question is visible and
 * its answer contains at least one `anyOf` value and no `noneOf` value.
 */
export interface QuestionCondition {
  questionId: string
  anyOf?: string[]
  noneOf?: string[]
}

interface QuestionBase {
  id: string
  title: string
  description?: string
  required: boolean
  /** Show the question only when all conditions are met. */
  showIf?: QuestionCondition[]
  /** Make the question required when all conditions are met. */
  requiredIf?: QuestionCondition[]
  visualization?: 'bar' | 'diverging' | 'hidden'
}

export interface TextQuestion extends QuestionBase {
  type: 'text'
  placeholder?: string
  format?: 'email'
}

export interface TypeaheadQuestion extends QuestionBase {
  type: 'typeahead'
  placeholder?: string
  suggestions: string[]
}

export interface TextareaQuestion extends QuestionBase {
  type: 'textarea'
  placeholder?: string
  maxLength?: number
}

export interface RadioQuestion extends QuestionBase {
  type: 'radio'
  options: QuestionOption[]
  randomizeOptions?: boolean
}

export interface CheckboxQuestion extends QuestionBase {
  type: 'checkbox'
  options: QuestionOption[]
  minSelections?: number
  maxSelections?: number
  randomizeOptions?: boolean
}

/**
 * One choice per row. Answers are stored as `row:column` strings, so the
 * stored shape stays `string[]`.
 */
export interface MatrixQuestion extends QuestionBase {
  type: 'matrix'
  rows: { value: string; label: string }[]
  options: QuestionOption[]
}

export interface QuestionOption {
  label: string
  value: string
  allowOtherText?: boolean
  skipToSection?: string
  pinPosition?: 'first' | 'last'
  exclusive?: boolean
}

export interface SurveyAnswer {
  questionId: string
  value: string | string[]
  otherText?: string
}
