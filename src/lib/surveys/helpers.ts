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
  type ConsentContact,
} from './types'

export function getSurvey(slug: string): SurveyDefinition | undefined {
  return surveys.find(s => s.slug === slug)
}

export function getSurveyForProject(
  projectSlug: string
): SurveyDefinition | undefined {
  const project = researchProjects.find(p => p.slug === projectSlug)
  if (!project) return undefined

  const linked = project.surveys?.find(s => 'surveySlug' in s)
  if (!linked || !('surveySlug' in linked)) return undefined

  return getSurvey(linked.surveySlug)
}

export function getProjectForSurvey(
  surveySlug: string
): ResearchProject | undefined {
  return researchProjects.find(p =>
    p.surveys?.some(s => 'surveySlug' in s && s.surveySlug === surveySlug)
  )
}

export function getConsentContact(
  surveySlug: string
): ConsentContact | undefined {
  const project = getProjectForSurvey(surveySlug)
  if (!project?.ethics) return undefined
  return {
    dataController: project.ethics.dataController,
    contactEmail: project.ethics.contactEmail,
    legalBasis: project.ethics.legalBasis,
    retentionPeriod:
      project.ethics.retentionPeriod ??
      'senest to år etter at studien er avsluttet',
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
 * Evaluate section-level branching and return the ordered list of section IDs
 * a respondent should see based on their current answers.
 *
 * Branching works by checking selected answers for `skipToSection`. When a
 * radio/checkbox option with `skipToSection` is selected, the survey jumps
 * directly to that section (skipping everything in between). The special
 * value "end" skips to the end of the survey.
 */
export function getVisibleSectionIds(
  sections: SurveySection[],
  answers: Map<string, SurveyAnswer>
): string[] {
  const result: string[] = []
  let i = 0

  while (i < sections.length) {
    const section = sections[i]!
    result.push(section.id)

    const jumpTarget = findJumpTarget(section, answers)
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

  return result
}

function findJumpTarget(
  section: SurveySection,
  answers: Map<string, SurveyAnswer>
): string | undefined {
  for (const question of section.questions) {
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
 * - Radio/checkbox questions have at least one option
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
      questionIds.add(question.id)

      if (question.type === 'radio' || question.type === 'checkbox') {
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

/**
 * Collect all question IDs that belong to visible (non-skipped) sections.
 */
export function getVisibleQuestionIds(
  sections: SurveySection[],
  answers: Map<string, SurveyAnswer>
): Set<string> {
  const visibleSectionIds = new Set(getVisibleSectionIds(sections, answers))
  const ids = new Set<string>()

  for (const section of sections) {
    if (!visibleSectionIds.has(section.id)) continue
    for (const question of section.questions) {
      ids.add(question.id)
    }
  }

  return ids
}

const SECONDS_PER_QUESTION: Record<SurveyQuestion['type'], number> = {
  radio: 15,
  checkbox: 20,
  text: 20,
  typeahead: 15,
  textarea: 45,
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
 * Shuffle options for a question while keeping pinned options in place.
 * Uses a stable seed derived from the question ID so order is consistent
 * within a session but varies between respondents.
 */
export function shuffleOptions(
  options: QuestionOption[],
  questionId: string,
  sessionSeed: number
): QuestionOption[] {
  const pinnedFirst = options.filter(o => o.pinPosition === 'first')
  const pinnedLast = options.filter(o => o.pinPosition === 'last')
  const unpinned = options.filter(o => !o.pinPosition)

  let seed = sessionSeed
  for (let i = 0; i < questionId.length; i++) {
    seed = (seed * 31 + questionId.charCodeAt(i)) | 0
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
