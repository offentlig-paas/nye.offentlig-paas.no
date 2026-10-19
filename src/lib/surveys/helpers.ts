import { surveys } from '@/data/surveys'
import { researchProjects } from '@/data/research'
import type { ResearchProject } from '@/lib/research/types'
import { matchesSlackUser } from '@/lib/slack/utils'
import {
  SurveyStatus,
  type SurveyRole,
  type SurveyDefinition,
  type SurveyAnswer,
  type SurveySection,
  type SurveyQuestion,
  type QuestionOption,
  type RadioQuestion,
  type MatrixQuestion,
  type ConsentContact,
  type QuestionCondition,
} from './types'

/** CSV export columns, without sensitive questions. Placeholders have no question. */
export function getExportColumns(
  survey: SurveyDefinition
): { header: string; question?: SurveyQuestion }[] {
  const sensitive = new Set(survey.sensitiveQuestionIds ?? [])
  const questions = survey.sections.flatMap(s => s.questions)
  const byId = new Map(questions.map(q => [q.id, q]))
  const spec = survey.exportColumns ?? questions.map(q => q.id)
  return spec.flatMap(c => {
    if (typeof c !== 'string') return [{ header: c.header }]
    const question = byId.get(c)
    if (!question) throw new Error(`Unknown export column: ${c}`)
    return sensitive.has(c) ? [] : [{ header: question.title, question }]
  })
}

export function getSurvey(slug: string): SurveyDefinition | undefined {
  return surveys.find(s => s.slug === slug)
}

/**
 * Pick a project's survey, newest (last listed) first.
 * - `form`: the open survey, else the newest non-draft one (shown as not
 *   open). Drafts are never returned.
 * - `results`: the newest survey with published results.
 */
export function getSurveyForProject(
  projectSlug: string,
  purpose: 'form' | 'results' | 'pilot'
): SurveyDefinition | undefined {
  const project = researchProjects.find(p => p.slug === projectSlug)
  const linked = (project?.surveys ?? [])
    .flatMap(s => ('surveySlug' in s ? [getSurvey(s.surveySlug)] : []))
    .filter((s): s is SurveyDefinition => s !== undefined)
    .reverse()

  if (purpose === 'results') {
    return linked.find(s => s.resultsConfig?.published)
  }
  if (purpose === 'pilot') {
    return linked.find(s => s.status === SurveyStatus.Pilot)
  }
  return (
    linked.find(s => s.status === SurveyStatus.Open) ??
    linked.find(
      s => s.status !== SurveyStatus.Draft && s.status !== SurveyStatus.Pilot
    )
  )
}

export function getProjectForSurvey(
  surveySlug: string
): ResearchProject | undefined {
  return researchProjects.find(p =>
    p.surveys?.some(s => 'surveySlug' in s && s.surveySlug === surveySlug)
  )
}

export function getPreviousSurvey(
  surveySlug: string
): SurveyDefinition | undefined {
  const linked = getProjectForSurvey(surveySlug)?.surveys ?? []
  const index = linked.findIndex(
    s => 'surveySlug' in s && s.surveySlug === surveySlug
  )
  const previous = linked[index - 1]
  return previous && 'surveySlug' in previous
    ? getSurvey(previous.surveySlug)
    : undefined
}

export function getConsentContact(
  surveySlug: string
): ConsentContact | undefined {
  const project = getProjectForSurvey(surveySlug)
  const waveName = project?.surveys?.find(
    s => 'surveySlug' in s && s.surveySlug === surveySlug
  )?.waveName
  const ethics =
    project?.waves?.find(w => w.name === waveName)?.ethics ?? project?.ethics
  if (!ethics) return undefined
  return {
    dataController: ethics.dataController,
    contactEmail: ethics.contactEmail,
    legalBasis: ethics.legalBasis,
    retentionPeriod:
      ethics.retentionPeriod ?? 'senest to år etter at studien er avsluttet',
  }
}

export function getActiveSurveys(): SurveyDefinition[] {
  return surveys.filter(s => s.status === SurveyStatus.Open)
}

export function getUserSurveyRole(
  survey: SurveyDefinition,
  user: { isAdmin?: boolean; slackId?: string }
): SurveyRole | null {
  if (user.isAdmin) return 'owner'

  if (matchesSlackUser(user.slackId, survey.owners)) return 'owner'
  if (matchesSlackUser(user.slackId, survey.researchers)) return 'researcher'

  return null
}

export function canUserAccessSurvey(
  survey: SurveyDefinition,
  user: { isAdmin?: boolean; slackId?: string }
): boolean {
  return getUserSurveyRole(survey, user) !== null
}

export function hasAnySurveyAccess(user: {
  isAdmin?: boolean
  slackId?: string
}): boolean {
  if (user.isAdmin) return true
  return surveys.some(s => getUserSurveyRole(s, user) !== null)
}

export function getAccessibleSurveys(user: {
  isAdmin?: boolean
  slackId?: string
}): SurveyDefinition[] {
  if (user.isAdmin) return surveys
  return surveys.filter(s => canUserAccessSurvey(s, user))
}

/**
 * Evaluate branching and return the ordered section IDs and the set of
 * question IDs a respondent should see based on their current answers.
 *
 * Section branching: when a radio/checkbox option with `skipToSection` is
 * selected, the survey jumps directly to that section. The special value
 * "end" skips to the end of the survey.
 *
 * Question conditions: a question with `showIf` is visible only when every
 * condition is met against an earlier visible question. A section whose
 * questions are all hidden is skipped.
 */
function getVisibility(
  sections: SurveySection[],
  answers: Map<string, SurveyAnswer>
): { sectionIds: string[]; questionIds: Set<string> } {
  const sectionIds: string[] = []
  const questionIds = new Set<string>()
  let i = 0

  while (i < sections.length) {
    const section = sections[i]!
    const visibleQuestions = section.questions.filter(q => {
      const visible =
        conditionsMet(q.showIf, answers, questionIds) &&
        (q.type !== 'matrix' ||
          getMatrixRows(q, answers, questionIds).length > 0)
      if (visible) questionIds.add(q.id)
      return visible
    })
    if (section.questions.length === 0 || visibleQuestions.length > 0) {
      sectionIds.push(section.id)
    }

    const jumpTarget = findJumpTarget(visibleQuestions, answers)
    if (jumpTarget === 'end') break
    if (jumpTarget) {
      const targetIdx = sections.findIndex(s => s.id === jumpTarget)
      if (targetIdx > i) {
        i = targetIdx
        continue
      }
    }

    i++
  }

  return { sectionIds, questionIds }
}

export function getVisibleSectionIds(
  sections: SurveySection[],
  answers: Map<string, SurveyAnswer>
): string[] {
  return getVisibility(sections, answers).sectionIds
}

/**
 * Collect all question IDs that are visible: in a visible section and with
 * all `showIf` conditions met.
 */
export function getVisibleQuestionIds(
  sections: SurveySection[],
  answers: Map<string, SurveyAnswer>
): Set<string> {
  return getVisibility(sections, answers).questionIds
}

/** Matrix rows to show, narrowed by `rowsFrom` when set. */
export function getMatrixRows(
  question: MatrixQuestion,
  answers: Map<string, SurveyAnswer>,
  visibleQuestionIds: Set<string>
): MatrixQuestion['rows'] {
  const from = question.rowsFrom
  if (!from) return question.rows
  const answer = visibleQuestionIds.has(from.questionId)
    ? answers.get(from.questionId)
    : undefined
  const codes = !answer
    ? []
    : Array.isArray(answer.value)
      ? answer.value
      : [answer.value]
  const wanted = new Set(codes.flatMap(c => from.map?.[c] ?? [c]))
  return question.rows.filter(r => wanted.has(r.value))
}

/**
 * The question as the respondent sees it (matrix rows narrowed by
 * `rowsFrom`), and the answer with values for hidden rows dropped.
 */
export function resolveQuestion(
  question: SurveyQuestion,
  answer: SurveyAnswer | undefined,
  answers: Map<string, SurveyAnswer>,
  visibleQuestionIds: Set<string>
): { question: SurveyQuestion; answer: SurveyAnswer | undefined } {
  if (question.type !== 'matrix' || !question.rowsFrom) {
    return { question, answer }
  }
  const rows = getMatrixRows(question, answers, visibleQuestionIds)
  const rowValues = new Set(rows.map(r => r.value))
  return {
    question: { ...question, rows },
    answer:
      answer && Array.isArray(answer.value)
        ? {
            ...answer,
            value: answer.value.filter(v => rowValues.has(v.split(':')[0]!)),
          }
        : answer,
  }
}

/**
 * Share of visible questions answered, and minutes left scaled from the
 * upper bound of `estimatedMinutes` (e.g. "10–15"). Minutes are undefined
 * when no estimate is given.
 */
export function surveyProgress(
  sections: SurveySection[],
  answers: Map<string, SurveyAnswer>,
  estimatedMinutes?: string
): { fraction: number; minutesLeft?: number } {
  const visible = [...getVisibleQuestionIds(sections, answers)]
  const answered = visible.filter(id => {
    const v = answers.get(id)?.value
    return Array.isArray(v) ? v.length > 0 : !!v?.trim()
  }).length
  const fraction = visible.length ? answered / visible.length : 0
  const upper = Math.max(...(estimatedMinutes?.match(/\d+/g) ?? []).map(Number))
  const minutesLeft = Number.isFinite(upper)
    ? Math.max(1, Math.ceil(upper * (1 - fraction)))
    : undefined
  return { fraction, minutesLeft }
}

/** Whether a question is required given the current answers. */
export function isQuestionRequired(
  question: SurveyQuestion,
  answers: Map<string, SurveyAnswer>,
  visibleQuestionIds: Set<string>
): boolean {
  if (question.required) return true
  if (!question.requiredIf) return false
  return conditionsMet(question.requiredIf, answers, visibleQuestionIds)
}

function conditionsMet(
  conditions: QuestionCondition[] | undefined,
  answers: Map<string, SurveyAnswer>,
  visibleQuestionIds: Set<string>
): boolean {
  if (!conditions) return true
  return conditions.every(c => {
    if (!visibleQuestionIds.has(c.questionId)) return false
    const answer = answers.get(c.questionId)
    const selected = !answer
      ? []
      : Array.isArray(answer.value)
        ? answer.value
        : [answer.value]
    if (c.anyOf && !c.anyOf.some(v => selected.includes(v))) return false
    if (c.noneOf?.some(v => selected.includes(v))) return false
    return true
  })
}

function findJumpTarget(
  questions: SurveyQuestion[],
  answers: Map<string, SurveyAnswer>
): string | undefined {
  for (const question of questions) {
    if (question.type !== 'radio' && question.type !== 'checkbox') continue

    const answer = answers.get(question.id)
    if (!answer) continue

    const selectedValues = Array.isArray(answer.value)
      ? answer.value
      : [answer.value]

    for (const option of (question as RadioQuestion).options) {
      if (option.skipToSection && selectedValues.includes(option.value)) {
        return option.skipToSection
      }
    }
  }
  return undefined
}

/**
 * Validate that a survey definition is structurally correct:
 * - Section IDs are unique
 * - Question IDs are unique across all sections
 * - skipToSection references valid section IDs or "end"
 * - Radio/checkbox/matrix questions have at least one option
 * - Matrix questions have at least one row
 * - showIf/requiredIf reference an earlier question
 */
export function validateSurveyDefinition(survey: SurveyDefinition): string[] {
  const errors: string[] = []
  const sectionIds = new Set<string>()
  const questionIds = new Set<string>()

  for (const section of survey.sections) {
    if (sectionIds.has(section.id)) {
      errors.push(`Duplicate section ID: "${section.id}"`)
    }
    sectionIds.add(section.id)
  }

  for (const section of survey.sections) {
    for (const question of section.questions) {
      if (questionIds.has(question.id)) {
        errors.push(`Duplicate question ID: "${question.id}"`)
      }

      for (const c of [
        ...(question.showIf ?? []),
        ...(question.requiredIf ?? []),
      ]) {
        if (!questionIds.has(c.questionId)) {
          errors.push(
            `Question "${question.id}" has a condition on "${c.questionId}", which is not an earlier question`
          )
        }
      }
      questionIds.add(question.id)

      if (
        question.type === 'matrix' &&
        question.rowsFrom &&
        !questionIds.has(question.rowsFrom.questionId)
      ) {
        errors.push(
          `Question "${question.id}" takes rows from "${question.rowsFrom.questionId}", which is not an earlier question`
        )
      }

      if (question.type === 'matrix' && question.rows.length === 0) {
        errors.push(`Question "${question.id}" has no rows`)
      }

      if (
        question.type === 'radio' ||
        question.type === 'checkbox' ||
        question.type === 'matrix'
      ) {
        if (question.options.length === 0) {
          errors.push(`Question "${question.id}" has no options`)
        }

        for (const option of question.options) {
          if (
            option.skipToSection &&
            option.skipToSection !== 'end' &&
            !sectionIds.has(option.skipToSection)
          ) {
            errors.push(
              `Question "${question.id}" option "${option.value}" references unknown section "${option.skipToSection}"`
            )
          }
        }
      }
    }

    const branchQuestions = section.questions.filter(
      q =>
        (q.type === 'radio' || q.type === 'checkbox') &&
        q.options.some(o => o.skipToSection)
    )
    if (branchQuestions.length > 1) {
      errors.push(
        `Section "${section.id}" has ${branchQuestions.length} branching questions; max 1 allowed`
      )
    }
  }

  return errors
}

const SECONDS_PER_QUESTION: Record<SurveyQuestion['type'], number> = {
  radio: 15,
  checkbox: 20,
  text: 20,
  typeahead: 15,
  textarea: 45,
  matrix: 60,
}

/**
 * Estimate survey completion time in minutes based on question types.
 * Uses average response times per question type from survey methodology research.
 */
export function estimateCompletionMinutes(survey: SurveyDefinition): number {
  let totalSeconds = 0
  for (const section of survey.sections) {
    totalSeconds += 10
    for (const question of section.questions) {
      totalSeconds += SECONDS_PER_QUESTION[question.type]
    }
  }
  return Math.ceil(totalSeconds / 60)
}

/**
 * Simple seeded PRNG (mulberry32). Produces deterministic shuffles
 * so the same user sees the same order on Back navigation.
 */
function seededRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Shuffle options while keeping pinned options in place. The seed combines
 * the session seed with the option set, so order is stable within a session,
 * varies between respondents, and questions with the same options share it.
 */
export function shuffleOptions(
  options: QuestionOption[],
  sessionSeed: number
): QuestionOption[] {
  const pinnedFirst = options.filter(o => o.pinPosition === 'first')
  const pinnedLast = options.filter(o => o.pinPosition === 'last')
  const unpinned = options.filter(o => !o.pinPosition)

  const signature = unpinned
    .map(o => o.value)
    .sort()
    .join('|')
  let seed = sessionSeed
  for (let i = 0; i < signature.length; i++) {
    seed = (seed * 31 + signature.charCodeAt(i)) | 0
  }

  const rng = seededRng(seed)
  const shuffled = [...unpinned]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!]
  }

  return [...pinnedFirst, ...shuffled, ...pinnedLast]
}

export function buildConsentText(
  survey: SurveyDefinition,
  contact: ConsentContact
): string {
  const { consent } = survey
  if (consent.fullText) return consent.fullText

  const aboutSection = consent.aboutText ?? survey.description ?? ''

  const additional = consent.additionalSections ?? []
  const additionalText = additional
    .map(s => `**${s.heading}**\n${s.body}`)
    .join('\n\n')

  const parts = [
    `**Hva handler undersøkelsen om?**\n${aboutSection}`,

    `**Hvem er ansvarlig?**\nUndersøkelsen gjennomføres av Offentlig PaaS. Behandlingsansvarlig er ${contact.dataController}, ${contact.contactEmail}.`,

    `**Hva samler vi inn?**\n${consent.dataCollectionText}`,

    additionalText,

    `**Personvern og GDPR**\nBehandlingsgrunnlaget er ${contact.legalBasis}. Ingen enkeltpersoner eller organisasjoner vil bli identifisert i publikasjoner. Svarene lagres og slettes ${contact.retentionPeriod}.\n\nDu har rett til å be om innsyn, retting eller sletting av dine opplysninger. Du kan også klage til Datatilsynet. Kontakt oss på ${contact.contactEmail} hvis du har spørsmål.`,

    `**Frivillig deltakelse**\nDet er helt frivillig å delta, og du kan avslutte når som helst uten å oppgi grunn. Ved å gå videre samtykker du til deltakelse.`,
  ]

  return parts.filter(Boolean).join('\n\n')
}

export function buildThankYouMessage(
  survey: SurveyDefinition,
  contact: ConsentContact
): string {
  return (
    survey.thankYouMessage ??
    `Takk for at du tok deg tid til å svare! Resultatene vil bli publisert som en del av en forskningsstudie fra Offentlig PaaS. Har du spørsmål, kontakt oss på ${contact.contactEmail}.`
  )
}
