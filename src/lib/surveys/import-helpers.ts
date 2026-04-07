import { members } from '@/data/members'
import { cleanOrganizationName } from '@/lib/organization-utils'
import type { SurveyResponseAnswer } from '@/domains/survey-response/types'
import type { SurveyDefinition, SurveyQuestion } from '@/lib/surveys/types'

// ---------------------------------------------------------------------------
// Column → Question mapping (CSV column index → question ID)
// ---------------------------------------------------------------------------

export const COLUMN_QUESTION_MAP: Record<number, string> = {
  1: 'q1-org',
  2: 'q2-role',
  3: 'q3-dev-count',
  4: 'q5-adoption-level',
  5: 'q5b-confidence',
  6: 'q6-approved-tools',
  7: 'q6b-confidence',
  8: 'q7-introduction-path',
  9: 'q8-personal-use',
  10: 'q8b-personal-tools',
  11: 'q9-usage-modes',
  12: 'q10-integrations',
  13: 'q11-frequency',
  14: 'q11b-benefit',
  15: 'q12-policy',
  16: 'q12b-confidence',
  17: 'q13-support',
  18: 'q14-decision-authority',
  19: 'q15-data-sovereignty',
  20: 'q16-measurement',
  21: 'q17-code-review',
  22: 'q18-concerns',
  23: 'q19-public-sector-concerns',
  24: 'q20-trust',
  25: 'q21-perception-gap',
  26: 'q23-interview',
  27: 'q24-email',
}

// ---------------------------------------------------------------------------
// Organization normalization
// ---------------------------------------------------------------------------

const ORG_ALIASES: Record<string, string> = {
  digitaliseringsdirektoratet: 'Digdir',
  'digitaliseringsetaten oslo kommune': 'Oslo kommune',
  'politiets it-enhet': 'Politiet',
  'statens pensjonskasse': 'SPK',
  'entur as': 'Entur',
  'telenor norge': 'Telenor',
  'hafslund kraft': 'Hafslund',
  altinn: 'Digdir',
  'direktoratet for høyere utdanning og kompetanse':
    'Direktoratet for Høyere Utdanning og Kompetanse',
  'meteorologisk institutt': 'MET',
}

const memberNames = members.map(m => m.name)
const memberNamesLower = new Map(memberNames.map(n => [n.toLowerCase(), n]))

export function normalizeOrganization(raw: string): string {
  if (!raw) return raw

  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()

  if (ORG_ALIASES[lower]) {
    return ORG_ALIASES[lower]
  }

  if (memberNamesLower.has(lower)) {
    return memberNamesLower.get(lower)!
  }

  const cleaned = cleanOrganizationName(trimmed)
  const cleanedLower = cleaned.toLowerCase()

  if (memberNamesLower.has(cleanedLower)) {
    return memberNamesLower.get(cleanedLower)!
  }

  return cleaned
}

// ---------------------------------------------------------------------------
// Label → value mapping
// ---------------------------------------------------------------------------

type LabelValueMap = Map<string, { value: string; allowOtherText?: boolean }>

function buildLabelMap(question: SurveyQuestion): LabelValueMap {
  const map: LabelValueMap = new Map()
  if (
    question.type === 'text' ||
    question.type === 'textarea' ||
    question.type === 'typeahead'
  ) {
    return map
  }
  for (const opt of question.options) {
    map.set(opt.label, {
      value: opt.value,
      allowOtherText: opt.allowOtherText,
    })
  }
  return map
}

export function buildAllLabelMaps(
  survey: SurveyDefinition
): Map<string, LabelValueMap> {
  const maps = new Map<string, LabelValueMap>()
  for (const section of survey.sections) {
    for (const q of section.questions) {
      maps.set(q.id, buildLabelMap(q))
    }
  }

  // Google Forms labels that differ from the current survey definition
  const q17map = maps.get('q17-code-review')
  if (q17map) {
    q17map.set(
      'Vi har skriftlige retningslinjer og bruker automatiserte verktøy for å sjekke KI-generert kode (f.eks. sikkerhetsskanning)',
      { value: 'written-automated' }
    )
  }

  return maps
}

function findQuestion(
  survey: SurveyDefinition,
  questionId: string
): SurveyQuestion | undefined {
  for (const section of survey.sections) {
    for (const q of section.questions) {
      if (q.id === questionId) return q
    }
  }
  return undefined
}

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

export function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current)
  return fields
}

export function parseCSV(content: string): string[][] {
  const rows: string[][] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      current += ch
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
        i++
      }
      if (current.trim().length > 0) {
        rows.push(parseCSVLine(current))
      }
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim().length > 0) {
    rows.push(parseCSVLine(current))
  }
  return rows
}

// ---------------------------------------------------------------------------
// Timestamp parsing
// ---------------------------------------------------------------------------

export function parseGoogleFormsTimestamp(ts: string): string {
  const match = ts.match(
    /^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)\s+GMT([+-]\d+)$/
  )
  if (!match) {
    throw new Error(`Cannot parse timestamp: ${ts}`)
  }

  const [, year, month, day, hourStr, min, sec, ampm, offsetStr] =
    match as RegExpMatchArray
  let hour = parseInt(hourStr!, 10)
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0

  const offset = parseInt(offsetStr!, 10)
  const offsetSign = offset >= 0 ? '+' : '-'
  const offsetAbs = Math.abs(offset)
  const offsetFormatted = `${offsetSign}${String(offsetAbs).padStart(2, '0')}:00`

  return `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${min}:${sec}${offsetFormatted}`
}

// ---------------------------------------------------------------------------
// Answer mapping
// ---------------------------------------------------------------------------

export interface MappingWarning {
  row: number
  questionId: string
  label: string
  message: string
}

export function mapAnswer(
  survey: SurveyDefinition,
  questionId: string,
  cellValue: string,
  labelMaps: Map<string, LabelValueMap>,
  rowIndex: number,
  warnings: MappingWarning[]
): SurveyResponseAnswer | null {
  if (!cellValue.trim()) return null

  const question = findQuestion(survey, questionId)
  if (!question) {
    warnings.push({
      row: rowIndex,
      questionId,
      label: cellValue,
      message: 'Question not found in survey definition',
    })
    return null
  }

  if (question.type === 'typeahead') {
    return { questionId, value: normalizeOrganization(cellValue) }
  }

  if (question.type === 'text' || question.type === 'textarea') {
    return { questionId, value: cellValue }
  }

  const labelMap = labelMaps.get(questionId)!

  if (question.type === 'radio') {
    const mapped = labelMap.get(cellValue)
    if (mapped) {
      return { questionId, value: mapped.value }
    }

    const otherOption = question.options.find(o => o.allowOtherText)
    if (otherOption) {
      return { questionId, value: otherOption.value, otherText: cellValue }
    }

    warnings.push({
      row: rowIndex,
      questionId,
      label: cellValue,
      message: 'Unmapped radio label',
    })
    return { questionId, value: cellValue }
  }

  if (question.type === 'checkbox') {
    const parts = cellValue
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
    const values: string[] = []
    let otherText: string | undefined

    for (const part of parts) {
      const mapped = labelMap.get(part)
      if (mapped) {
        values.push(mapped.value)
      } else {
        const otherOption = question.options.find(o => o.allowOtherText)
        if (otherOption) {
          if (!values.includes(otherOption.value)) {
            values.push(otherOption.value)
          }
          otherText = otherText ? `${otherText}; ${part}` : part
        } else {
          warnings.push({
            row: rowIndex,
            questionId,
            label: part,
            message: 'Unmapped checkbox label',
          })
          values.push(part)
        }
      }
    }

    const answer: SurveyResponseAnswer = { questionId, arrayValue: values }
    if (otherText) answer.otherText = otherText
    return answer
  }

  return null
}

// ---------------------------------------------------------------------------
// Full row conversion
// ---------------------------------------------------------------------------

export interface ImportedResponse {
  surveySlug: string
  surveyVersion: number
  answers: SurveyResponseAnswer[]
  submittedAt: string
  metadata: {
    submissionSource: string
    deviceCategory: string
    consentVersion: number
  }
}

export function convertRow(
  survey: SurveyDefinition,
  fields: string[],
  rowIndex: number,
  labelMaps: Map<string, LabelValueMap>,
  warnings: MappingWarning[]
): ImportedResponse {
  const submittedAt = parseGoogleFormsTimestamp(fields[0]!)

  const answers: SurveyResponseAnswer[] = []
  for (const [colStr, questionId] of Object.entries(COLUMN_QUESTION_MAP)) {
    const col = parseInt(colStr, 10)
    const cellValue = fields[col] ?? ''
    const answer = mapAnswer(
      survey,
      questionId,
      cellValue,
      labelMaps,
      rowIndex,
      warnings
    )
    if (answer) {
      answers.push(answer)
    }
  }

  return {
    surveySlug: survey.slug,
    surveyVersion: survey.version,
    answers,
    submittedAt,
    metadata: {
      submissionSource: 'google-forms-import',
      deviceCategory: 'unknown',
      consentVersion: survey.version,
    },
  }
}
