import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, beforeAll } from 'vitest'

import {
  parseCSVLine,
  parseCSV,
  parseGoogleFormsTimestamp,
  buildAllLabelMaps,
  mapAnswer,
  convertRow,
  normalizeOrganization,
  COLUMN_QUESTION_MAP,
  type MappingWarning,
  type ImportedResponse,
} from '../import-helpers'

import { aiAgents2026 } from '@/data/surveys/ai-agents-2026'
import { memberNames } from '@/data/member-names'

const csvPath = resolve(
  __dirname,
  '../../../../State of AI Coding Agents 2026.csv'
)
const csvContent = readFileSync(csvPath, 'utf-8')
const allRows = parseCSV(csvContent)
const header = allRows[0]!
const dataRows = allRows.slice(1)
const labelMaps = buildAllLabelMaps(aiAgents2026)

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------
describe('parseCSVLine', () => {
  it('handles simple quoted fields', () => {
    expect(parseCSVLine('"a","b","c"')).toEqual(['a', 'b', 'c'])
  })

  it('handles empty fields', () => {
    expect(parseCSVLine('"a","","c"')).toEqual(['a', '', 'c'])
  })

  it('handles commas inside quoted fields', () => {
    expect(parseCSVLine('"a, b","c"')).toEqual(['a, b', 'c'])
  })

  it('handles escaped quotes', () => {
    expect(parseCSVLine('"a ""b"" c","d"')).toEqual(['a "b" c', 'd'])
  })

  it('handles semicolons inside fields (checkbox values)', () => {
    expect(parseCSVLine('"GitHub Copilot;Cursor","other"')).toEqual([
      'GitHub Copilot;Cursor',
      'other',
    ])
  })
})

describe('parseCSV', () => {
  it('parses all rows from the real CSV', () => {
    expect(allRows.length).toBe(36) // 1 header + 35 data rows
    expect(dataRows.length).toBe(35)
  })

  it('parses the header with correct column count', () => {
    expect(header.length).toBe(28) // Timestamp + 27 questions
  })

  it('every data row has the same column count as header', () => {
    for (let i = 0; i < dataRows.length; i++) {
      expect(dataRows[i]!.length).toBe(header.length)
    }
  })
})

// ---------------------------------------------------------------------------
// Timestamp parsing
// ---------------------------------------------------------------------------
describe('parseGoogleFormsTimestamp', () => {
  it('parses AM timestamp with positive offset', () => {
    expect(parseGoogleFormsTimestamp('2026/04/05 11:38:03 AM GMT+2')).toBe(
      '2026-04-05T11:38:03+02:00'
    )
  })

  it('parses PM timestamp', () => {
    expect(parseGoogleFormsTimestamp('2026/04/07 2:40:09 PM GMT+2')).toBe(
      '2026-04-07T14:40:09+02:00'
    )
  })

  it('parses 12 PM correctly (noon)', () => {
    expect(parseGoogleFormsTimestamp('2026/01/01 12:00:00 PM GMT+2')).toBe(
      '2026-01-01T12:00:00+02:00'
    )
  })

  it('parses 12 AM correctly (midnight)', () => {
    expect(parseGoogleFormsTimestamp('2026/01/01 12:00:00 AM GMT+2')).toBe(
      '2026-01-01T00:00:00+02:00'
    )
  })

  it('parses all timestamps from the real CSV', () => {
    for (let i = 0; i < dataRows.length; i++) {
      const ts = dataRows[i]![0]!
      const parsed = parseGoogleFormsTimestamp(ts)
      expect(parsed).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/
      )
    }
  })

  it('throws on invalid timestamp', () => {
    expect(() => parseGoogleFormsTimestamp('invalid')).toThrow(
      'Cannot parse timestamp'
    )
  })
})

// ---------------------------------------------------------------------------
// Organization normalization
// ---------------------------------------------------------------------------
describe('normalizeOrganization', () => {
  it('maps known aliases to member names', () => {
    expect(normalizeOrganization('Digitaliseringsdirektoratet')).toBe('Digdir')
    expect(normalizeOrganization('Digitaliseringsetaten Oslo kommune')).toBe(
      'Oslo kommune'
    )
    expect(normalizeOrganization('Politiets IT-enhet')).toBe('Politiet')
    expect(normalizeOrganization('Statens pensjonskasse')).toBe('SPK')
    expect(normalizeOrganization('Entur AS')).toBe('Entur')
    expect(normalizeOrganization('Telenor Norge')).toBe('Telenor')
    expect(normalizeOrganization('Hafslund Kraft')).toBe('Hafslund')
    expect(normalizeOrganization('Altinn')).toBe('Digdir')
  })

  it('matches exact member names (case-insensitive)', () => {
    expect(normalizeOrganization('Nav')).toBe('Nav')
    expect(normalizeOrganization('nav')).toBe('Nav')
    expect(normalizeOrganization('SSB')).toBe('SSB')
    expect(normalizeOrganization('FHI')).toBe('FHI')
    expect(normalizeOrganization('Sikt')).toBe('Sikt')
    expect(normalizeOrganization('Skatteetaten')).toBe('Skatteetaten')
  })

  it('normalizes via cleanOrganizationName for close matches', () => {
    expect(normalizeOrganization('Meteorologisk Institutt')).toBe('MET')
    expect(normalizeOrganization('SPK (Statens pensjonskasse)')).toBe('SPK')
  })

  it('preserves non-member orgs after cleaning', () => {
    expect(normalizeOrganization('Tet Digital')).toBe('Tet Digital')
    expect(normalizeOrganization('Plattform')).toBe('Plattform')
  })

  it('handles empty input', () => {
    expect(normalizeOrganization('')).toBe('')
  })

  it('normalizes all real CSV organizations', () => {
    const orgs = dataRows.map(row => row[1]!)
    for (const org of orgs) {
      const normalized = normalizeOrganization(org)
      expect(normalized).toBeTruthy()
      expect(typeof normalized).toBe('string')
    }
  })

  it('produces member-registry names where possible', () => {
    const memberNameSet = new Set(memberNames)
    const orgs = dataRows.map(row => normalizeOrganization(row[1]!))
    const knownNonMembers = new Set([
      'Tet Digital',
      'Plattform',
      'Norsk Tipping',
      'Å Energi',
    ])

    for (const org of orgs) {
      if (!knownNonMembers.has(org)) {
        expect(memberNameSet.has(org)).toBe(true)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Label → value mapping
// ---------------------------------------------------------------------------
describe('buildAllLabelMaps', () => {
  it('creates maps for all questions', () => {
    const allQuestionIds = aiAgents2026.sections.flatMap(s =>
      s.questions.map(q => q.id)
    )
    for (const id of allQuestionIds) {
      expect(labelMaps.has(id)).toBe(true)
    }
  })

  it('text/textarea/typeahead questions have empty maps', () => {
    expect(labelMaps.get('q1-org')!.size).toBe(0)
    expect(labelMaps.get('q19-public-sector-concerns')!.size).toBe(0)
    expect(labelMaps.get('q24-email')!.size).toBe(0)
  })

  it('radio/checkbox questions have non-empty maps', () => {
    expect(labelMaps.get('q2-role')!.size).toBeGreaterThan(0)
    expect(labelMaps.get('q6-approved-tools')!.size).toBeGreaterThan(0)
    expect(labelMaps.get('q18-concerns')!.size).toBeGreaterThan(0)
  })
})

describe('mapAnswer', () => {
  it('maps a radio label to its value', () => {
    const warnings: MappingWarning[] = []
    const result = mapAnswer(
      aiAgents2026,
      'q2-role',
      'Utvikler / ingeniør',
      labelMaps,
      1,
      warnings
    )
    expect(result).toEqual({ questionId: 'q2-role', value: 'developer' })
    expect(warnings).toHaveLength(0)
  })

  it('maps a checkbox value with semicolons to arrayValue', () => {
    const warnings: MappingWarning[] = []
    const result = mapAnswer(
      aiAgents2026,
      'q6-approved-tools',
      'GitHub Copilot;Cursor',
      labelMaps,
      1,
      warnings
    )
    expect(result).toEqual({
      questionId: 'q6-approved-tools',
      arrayValue: ['copilot', 'cursor'],
    })
    expect(warnings).toHaveLength(0)
  })

  it('maps unmapped checkbox labels to other + otherText', () => {
    const warnings: MappingWarning[] = []
    const result = mapAnswer(
      aiAgents2026,
      'q6-approved-tools',
      'GitHub Copilot;My custom tool description',
      labelMaps,
      1,
      warnings
    )
    expect(result).toEqual({
      questionId: 'q6-approved-tools',
      arrayValue: ['copilot', 'other'],
      otherText: 'My custom tool description',
    })
    expect(warnings).toHaveLength(0)
  })

  it('maps typeahead questions through normalizeOrganization', () => {
    const warnings: MappingWarning[] = []
    const result = mapAnswer(
      aiAgents2026,
      'q1-org',
      'Digitaliseringsdirektoratet',
      labelMaps,
      1,
      warnings
    )
    expect(result).toEqual({ questionId: 'q1-org', value: 'Digdir' })
  })

  it('maps text/textarea verbatim', () => {
    const warnings: MappingWarning[] = []
    const result = mapAnswer(
      aiAgents2026,
      'q19-public-sector-concerns',
      'Some concern text',
      labelMaps,
      1,
      warnings
    )
    expect(result).toEqual({
      questionId: 'q19-public-sector-concerns',
      value: 'Some concern text',
    })
  })

  it('returns null for empty cells', () => {
    const warnings: MappingWarning[] = []
    const result = mapAnswer(
      aiAgents2026,
      'q2-role',
      '',
      labelMaps,
      1,
      warnings
    )
    expect(result).toBeNull()
  })

  it('maps radio "Annet" with free text to other + otherText', () => {
    const warnings: MappingWarning[] = []
    const result = mapAnswer(
      aiAgents2026,
      'q2-role',
      'Data Scientist',
      labelMaps,
      1,
      warnings
    )
    expect(result).toEqual({
      questionId: 'q2-role',
      value: 'other',
      otherText: 'Data Scientist',
    })
  })
})

// ---------------------------------------------------------------------------
// Full row conversion
// ---------------------------------------------------------------------------
describe('convertRow', () => {
  it('converts the first data row with correct structure', () => {
    const warnings: MappingWarning[] = []
    const result = convertRow(
      aiAgents2026,
      dataRows[0]!,
      1,
      labelMaps,
      warnings
    )

    expect(result.surveySlug).toBe('ai-agents-2026')
    expect(result.surveyVersion).toBe(1)
    expect(result._id).toMatch(/^import-ai-agents-2026-[a-f0-9]{12}$/)
    expect(result.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(result.metadata.submissionSource).toBe('google-forms-import')
    expect(result.metadata.deviceCategory).toBe('unknown')
    expect(result.answers.length).toBeGreaterThan(0)
  })

  it('converts all 34 rows without throwing', () => {
    const warnings: MappingWarning[] = []
    const results: ImportedResponse[] = []
    for (let i = 0; i < dataRows.length; i++) {
      const result = convertRow(
        aiAgents2026,
        dataRows[i]!,
        i + 1,
        labelMaps,
        warnings
      )
      results.push(result)
    }
    expect(results.length).toBe(35)
  })

  it('every response has at least the required fields', () => {
    const warnings: MappingWarning[] = []
    for (let i = 0; i < dataRows.length; i++) {
      const result = convertRow(
        aiAgents2026,
        dataRows[i]!,
        i + 1,
        labelMaps,
        warnings
      )
      expect(result.surveySlug).toBe('ai-agents-2026')
      expect(result.surveyVersion).toBe(1)
      expect(result.submittedAt).toBeTruthy()
      expect(result.answers.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Data completeness — zero data loss
// ---------------------------------------------------------------------------
describe('data completeness', () => {
  let allResults: ImportedResponse[]
  let allWarnings: MappingWarning[]

  beforeAll(() => {
    allWarnings = []
    allResults = dataRows.map((row, i) =>
      convertRow(aiAgents2026, row, i + 1, labelMaps, allWarnings)
    )
  })

  it('produces exactly 35 responses', () => {
    expect(allResults.length).toBe(35)
  })

  it('every non-empty CSV cell produces a corresponding answer', () => {
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]!
      const response = allResults[i]!

      for (const [colStr, questionId] of Object.entries(COLUMN_QUESTION_MAP)) {
        const col = parseInt(colStr, 10)
        const cellValue = row[col]?.trim() ?? ''
        const answer = response.answers.find(a => a.questionId === questionId)

        if (cellValue) {
          expect(answer).toBeDefined()
        }
      }
    }
  })

  it('empty CSV cells do NOT produce phantom answers', () => {
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]!
      const response = allResults[i]!

      for (const [colStr, questionId] of Object.entries(COLUMN_QUESTION_MAP)) {
        const col = parseInt(colStr, 10)
        const cellValue = row[col]?.trim() ?? ''
        const answer = response.answers.find(a => a.questionId === questionId)

        if (!cellValue) {
          expect(answer).toBeUndefined()
        }
      }
    }
  })

  it('total answer count matches total non-empty data cells', () => {
    let expectedNonEmpty = 0
    for (const row of dataRows) {
      for (const [colStr] of Object.entries(COLUMN_QUESTION_MAP)) {
        const col = parseInt(colStr, 10)
        if (row[col]?.trim()) expectedNonEmpty++
      }
    }

    const actualAnswers = allResults.reduce(
      (sum, r) => sum + r.answers.length,
      0
    )
    expect(actualAnswers).toBe(expectedNonEmpty)
  })

  it('checkbox answers use arrayValue (not value)', () => {
    const checkboxQuestionIds = new Set<string>()
    for (const section of aiAgents2026.sections) {
      for (const q of section.questions) {
        if (q.type === 'checkbox') checkboxQuestionIds.add(q.id)
      }
    }

    for (const response of allResults) {
      for (const answer of response.answers) {
        if (checkboxQuestionIds.has(answer.questionId)) {
          expect(answer.arrayValue).toBeDefined()
          expect(Array.isArray(answer.arrayValue)).toBe(true)
          expect(answer.value).toBeUndefined()
        }
      }
    }
  })

  it('radio/text/textarea answers use value (not arrayValue)', () => {
    const checkboxQuestionIds = new Set<string>()
    for (const section of aiAgents2026.sections) {
      for (const q of section.questions) {
        if (q.type === 'checkbox') checkboxQuestionIds.add(q.id)
      }
    }

    for (const response of allResults) {
      for (const answer of response.answers) {
        if (!checkboxQuestionIds.has(answer.questionId)) {
          expect(answer.value).toBeDefined()
          expect(typeof answer.value).toBe('string')
          expect(answer.arrayValue).toBeUndefined()
        }
      }
    }
  })

  it('all timestamps are valid ISO dates within expected range', () => {
    const dates = allResults.map(r => new Date(r.submittedAt).getTime())
    for (const d of dates) {
      expect(d).not.toBeNaN()
      expect(d).toBeGreaterThan(new Date('2026-01-01').getTime())
      expect(d).toBeLessThan(new Date('2027-01-01').getTime())
    }
  })

  it('has no unmapped-label errors (all labels resolve or map to other)', () => {
    // If any label was unmapped, convertRow would have thrown during beforeAll
    // This test verifies that the conversion completed without errors
    expect(allResults.length).toBe(35)
  })

  it('includes Q24 email for respondents who provided one', () => {
    const withEmail = allResults.filter(r =>
      r.answers.some(a => a.questionId === 'q24-email')
    )
    expect(withEmail.length).toBeGreaterThan(0)
  })

  it('every organization is normalized', () => {
    for (const response of allResults) {
      const orgAnswer = response.answers.find(a => a.questionId === 'q1-org')
      expect(orgAnswer).toBeDefined()
      expect(orgAnswer!.value).toBeTruthy()
      expect(typeof orgAnswer!.value).toBe('string')
    }
  })

  it('column mapping covers all CSV columns except timestamp', () => {
    const mappedColumns = Object.keys(COLUMN_QUESTION_MAP).map(Number)
    for (let col = 1; col < header.length; col++) {
      expect(mappedColumns).toContain(col)
    }
  })

  it('deterministic IDs are stable across runs', () => {
    const warnings2: MappingWarning[] = []
    const results2 = dataRows.map((row, i) =>
      convertRow(aiAgents2026, row, i + 1, labelMaps, warnings2)
    )
    for (let i = 0; i < allResults.length; i++) {
      expect(results2[i]!._id).toBe(allResults[i]!._id)
    }
  })

  it('all IDs are unique', () => {
    const ids = allResults.map(r => r._id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ---------------------------------------------------------------------------
// Q13 type alignment — verify CSV data matches survey definition type
// ---------------------------------------------------------------------------
describe('question type alignment', () => {
  it('Q13 (support) CSV values are single-value (radio)', () => {
    for (const row of dataRows) {
      const val = row[17]?.trim()
      if (val) {
        expect(val).not.toContain(';')
      }
    }
  })
})
