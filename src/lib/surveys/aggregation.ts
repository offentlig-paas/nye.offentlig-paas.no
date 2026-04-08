import type {
  SurveyDefinition,
  SurveyQuestion,
  SurveySection,
  RadioQuestion,
  CheckboxQuestion,
} from './types'
import type { SurveyResponse } from '@/domains/survey-response/types'
import { getVisibleSectionIds } from './helpers'
import type { SurveyAnswer } from './types'

export interface AggregatedSurveyResults {
  surveySlug: string
  totalResponses: number
  sections: AggregatedSection[]
}

export interface AggregatedSection {
  id: string
  title: string
  description?: string
  questions: AggregatedQuestion[]
}

export interface AggregatedQuestion {
  id: string
  title: string
  description?: string
  type: SurveyQuestion['type']
  visualization: 'bar' | 'diverging'
  responseCount: number
  options: AggregatedOption[]
  freeTextCount?: number
}

export interface AggregatedOption {
  label: string
  value: string
  count: number
  percentage: number
}

function getEffectiveVisualization(
  question: SurveyQuestion
): 'bar' | 'diverging' | 'hidden' {
  if (question.visualization) return question.visualization
  if (question.type === 'text' || question.type === 'textarea') return 'hidden'
  return 'bar'
}

function buildAnswerMaps(
  responses: SurveyResponse[]
): Map<string, SurveyAnswer>[] {
  return responses.map(r => {
    const map = new Map<string, SurveyAnswer>()
    for (const a of r.answers) {
      const value = a.arrayValue ?? a.value ?? ''
      map.set(a.questionId, {
        questionId: a.questionId,
        value,
        otherText: a.otherText,
      })
    }
    return map
  })
}

function countRespondentsWhoSawQuestion(
  questionId: string,
  section: SurveySection,
  allSections: SurveySection[],
  answerMaps: Map<string, SurveyAnswer>[]
): number {
  let count = 0
  for (const answers of answerMaps) {
    const visibleIds = new Set(getVisibleSectionIds(allSections, answers))
    if (visibleIds.has(section.id)) {
      count++
    }
  }
  return count
}

function aggregateRadioOrCheckbox(
  question: RadioQuestion | CheckboxQuestion,
  answerMaps: Map<string, SurveyAnswer>[],
  respondentCount: number
): AggregatedOption[] {
  const counts = new Map<string, number>()
  let otherCount = 0

  for (const opt of question.options) {
    counts.set(opt.value, 0)
  }

  for (const answers of answerMaps) {
    const answer = answers.get(question.id)
    if (!answer) continue

    const values = Array.isArray(answer.value) ? answer.value : [answer.value]

    for (const v of values) {
      if (counts.has(v)) {
        counts.set(v, (counts.get(v) ?? 0) + 1)
      } else {
        otherCount++
      }
    }
  }

  const options: AggregatedOption[] = question.options.map(opt => ({
    label: opt.label,
    value: opt.value,
    count: counts.get(opt.value) ?? 0,
    percentage:
      respondentCount > 0
        ? Math.round(((counts.get(opt.value) ?? 0) / respondentCount) * 100)
        : 0,
  }))

  if (otherCount > 0) {
    const existingOther = options.find(o => o.value === 'other')
    if (existingOther) {
      existingOther.count += otherCount
      existingOther.percentage =
        respondentCount > 0
          ? Math.round((existingOther.count / respondentCount) * 100)
          : 0
    }
  }

  return options
}

function aggregateTypeahead(
  question: SurveyQuestion,
  answerMaps: Map<string, SurveyAnswer>[],
  respondentCount: number,
  groupingLimit: number
): AggregatedOption[] {
  const counts = new Map<string, number>()

  for (const answers of answerMaps) {
    const answer = answers.get(question.id)
    if (!answer || typeof answer.value !== 'string' || !answer.value) continue
    const val = answer.value.trim()
    counts.set(val, (counts.get(val) ?? 0) + 1)
  }

  const sorted = Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)

  const top = sorted.slice(0, groupingLimit)
  const rest = sorted.slice(groupingLimit)
  const restCount = rest.reduce((sum, r) => sum + r.count, 0)

  const options: AggregatedOption[] = top.map(({ value, count }) => ({
    label: value,
    value,
    count,
    percentage:
      respondentCount > 0 ? Math.round((count / respondentCount) * 100) : 0,
  }))

  if (restCount > 0) {
    options.push({
      label: 'Andre',
      value: '_other',
      count: restCount,
      percentage:
        respondentCount > 0
          ? Math.round((restCount / respondentCount) * 100)
          : 0,
    })
  }

  return options
}

export function aggregateSurveyResults(
  survey: SurveyDefinition,
  responses: SurveyResponse[],
  options?: { excludeQuestionIds?: Set<string> }
): AggregatedSurveyResults {
  const sensitiveIds = new Set(survey.sensitiveQuestionIds ?? [])
  const excludeIds = options?.excludeQuestionIds
  const answerMaps = buildAnswerMaps(responses)
  const groupingLimit = survey.resultsConfig?.typeaheadGroupingLimit ?? 15

  const sections: AggregatedSection[] = []

  for (const section of survey.sections) {
    const questions: AggregatedQuestion[] = []

    for (const question of section.questions) {
      if (sensitiveIds.has(question.id)) continue
      if (excludeIds?.has(question.id)) continue

      const viz = getEffectiveVisualization(question)
      if (viz === 'hidden') continue

      const responseCount = countRespondentsWhoSawQuestion(
        question.id,
        section,
        survey.sections,
        answerMaps
      )

      let options: AggregatedOption[] = []

      if (question.type === 'radio' || question.type === 'checkbox') {
        options = aggregateRadioOrCheckbox(question, answerMaps, responseCount)
      } else if (question.type === 'typeahead') {
        options = aggregateTypeahead(
          question,
          answerMaps,
          responseCount,
          groupingLimit
        )
      }

      questions.push({
        id: question.id,
        title: question.title,
        description: question.description,
        type: question.type,
        visualization: viz,
        responseCount,
        options,
      })
    }

    if (questions.length > 0) {
      sections.push({
        id: section.id,
        title: section.title,
        description: section.description,
        questions,
      })
    }
  }

  return {
    surveySlug: survey.slug,
    totalResponses: responses.length,
    sections,
  }
}
