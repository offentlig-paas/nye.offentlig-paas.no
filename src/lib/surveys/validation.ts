import type { SurveyDefinition, SurveyAnswer, SurveyQuestion } from './types'
import { getVisibleSectionIds } from './helpers'

const MAX_TEXT_LENGTH = 10_000

interface ValidationResult {
  valid: boolean
  errors: string[]
  sanitizedAnswers: SurveyAnswer[]
}

/**
 * Validate a single question–answer pair. Returns the first error message
 * or null if valid. Shared by both client-side section validation and
 * server-side full-survey validation.
 */
export function validateQuestion(
  question: SurveyQuestion,
  answer: SurveyAnswer | undefined
): string | null {
  if (question.required) {
    if (!answer) return 'Dette feltet er påkrevd'
    if (Array.isArray(answer.value) && answer.value.length === 0) {
      return 'Velg minst ett alternativ'
    }
    if (typeof answer.value === 'string' && answer.value.trim() === '') {
      return 'Dette feltet er påkrevd'
    }
  }

  if (!answer || !hasValue(answer)) return null

  switch (question.type) {
    case 'text':
    case 'typeahead': {
      if (typeof answer.value !== 'string') return 'Forventet tekst'
      if (answer.value.length > MAX_TEXT_LENGTH) {
        return `Maks ${MAX_TEXT_LENGTH} tegn`
      }
      if (
        question.type === 'text' &&
        question.format === 'email' &&
        answer.value.trim() &&
        !isValidEmail(answer.value)
      ) {
        return 'Ugyldig e-postadresse'
      }
      return null
    }

    case 'textarea': {
      if (typeof answer.value !== 'string') return 'Forventet tekst'
      if (question.maxLength && answer.value.length > question.maxLength) {
        return `Maks ${question.maxLength} tegn`
      }
      return null
    }

    case 'radio': {
      if (typeof answer.value !== 'string') return 'Forventet ett valg'
      if (!question.options.some(o => o.value === answer.value)) {
        return 'Ugyldig valg'
      }
      return validateOtherText(question.options, [answer.value], answer)
    }

    case 'checkbox': {
      if (!Array.isArray(answer.value)) return 'Forventet liste med valg'
      const validOpts = new Set(question.options.map(o => o.value))
      for (const v of answer.value) {
        if (!validOpts.has(v)) return `Ugyldig valg "${v}"`
      }
      if (
        question.maxSelections &&
        answer.value.length > question.maxSelections
      ) {
        return `Maks ${question.maxSelections} valg`
      }
      if (
        question.minSelections &&
        answer.value.length < question.minSelections
      ) {
        return `Velg minst ${question.minSelections} alternativ`
      }
      const exclusiveOptions = question.options.filter(o => o.exclusive)
      if (exclusiveOptions.length > 0) {
        const selectedExclusive = answer.value.filter(v =>
          exclusiveOptions.some(o => o.value === v)
        )
        if (selectedExclusive.length > 0 && answer.value.length > 1) {
          return 'Et eksklusivt valg kan ikke kombineres med andre'
        }
      }
      return validateOtherText(question.options, answer.value, answer)
    }
  }
}

function validateOtherText(
  options: { value: string; allowOtherText?: boolean }[],
  selectedValues: string[],
  answer: SurveyAnswer
): string | null {
  for (const v of selectedValues) {
    const option = options.find(o => o.value === v)
    if (
      option?.allowOtherText &&
      (!answer.otherText || answer.otherText.trim() === '')
    ) {
      return 'Spesifiser valget ditt'
    }
  }
  return null
}

/**
 * Server-side validation of survey answers against the definition.
 *
 * - Validates each answer via the shared `validateQuestion` function
 * - Enforces required fields for visible (non-skipped) sections
 * - Strips answers for questions in skipped sections
 * - Deduplicates answers (last answer per question wins)
 */
export function validateAnswers(
  survey: SurveyDefinition,
  answers: SurveyAnswer[]
): ValidationResult {
  const errors: string[] = []
  const answerMap = new Map(answers.map(a => [a.questionId, a]))
  const visibleSectionIds = new Set(
    getVisibleSectionIds(survey.sections, answerMap)
  )

  const questionSectionMap = new Map<string, string>()
  for (const section of survey.sections) {
    for (const question of section.questions) {
      questionSectionMap.set(question.id, section.id)
    }
  }

  for (const section of survey.sections) {
    if (!visibleSectionIds.has(section.id)) continue

    for (const question of section.questions) {
      const answer = answerMap.get(question.id)
      const error = validateQuestion(question, answer)
      if (error) {
        errors.push(`"${question.title}": ${error}`)
      }
    }
  }

  const questionMap = new Map<string, SurveyQuestion>()
  for (const section of survey.sections) {
    for (const question of section.questions) {
      questionMap.set(question.id, question)
    }
  }

  const sanitizedAnswers = Array.from(answerMap.values())
    .filter(a => {
      const sectionId = questionSectionMap.get(a.questionId)
      return sectionId && visibleSectionIds.has(sectionId)
    })
    .map(a => {
      const question = questionMap.get(a.questionId)
      if (!question) return a

      const allowsOther =
        (question.type === 'radio' || question.type === 'checkbox') &&
        question.options.some(o => o.allowOtherText)

      if (!allowsOther && a.otherText) {
        const { otherText: _, ...rest } = a
        return rest as SurveyAnswer
      }
      return a
    })

  return {
    valid: errors.length === 0,
    errors,
    sanitizedAnswers,
  }
}

function hasValue(answer: SurveyAnswer | undefined): boolean {
  if (!answer) return false
  if (Array.isArray(answer.value)) return answer.value.length > 0
  return answer.value.trim().length > 0
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}
