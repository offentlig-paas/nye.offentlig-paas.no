/**
 * One-shot import script for Google Forms CSV data into the survey engine.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/import-google-forms.ts --dry-run
 *   npx tsx --tsconfig tsconfig.json scripts/import-google-forms.ts
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { aiAgents2026 } from '../src/data/surveys/ai-agents-2026'
import {
  parseCSV,
  buildAllLabelMaps,
  convertRow,
  type ImportedResponse,
  type MappingWarning,
} from '../src/lib/surveys/import-helpers'

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const csvPath = resolve(process.cwd(), 'State of AI Coding Agents 2026.csv')

  console.log(
    dryRun ? '🔍 DRY RUN — no data will be written\n' : '🚀 LIVE IMPORT\n'
  )

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  const header = rows[0]!
  const dataRows = rows.slice(1)

  console.log(`CSV: ${header.length} columns, ${dataRows.length} data rows\n`)

  const labelMaps = buildAllLabelMaps(aiAgents2026)
  const warnings: MappingWarning[] = []
  const responses: ImportedResponse[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const response = convertRow(
      aiAgents2026,
      dataRows[i]!,
      i + 1,
      labelMaps,
      warnings
    )
    responses.push(response)
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warnings:`)
    for (const w of warnings) {
      console.log(`  Row ${w.row}, ${w.questionId}: ${w.message}`)
    }
    console.log()
  }

  console.log(`✅ Converted ${responses.length} responses`)

  const totalAnswers = responses.reduce((sum, r) => sum + r.answers.length, 0)
  console.log(`   Total answers: ${totalAnswers}`)

  const orgs = responses
    .map(r => r.answers.find(a => a.questionId === 'q1-org')?.value)
    .filter(Boolean) as string[]
  const uniqueOrgs = [...new Set(orgs)].sort()
  console.log(`   Unique organizations: ${uniqueOrgs.length}`)
  for (const org of uniqueOrgs) {
    const count = orgs.filter(o => o === org).length
    console.log(`     ${org}${count > 1 ? ` (${count})` : ''}`)
  }

  if (dryRun) {
    console.log('\n📋 Sample response (row 1):')
    console.log(JSON.stringify(responses[0], null, 2))
    return
  }

  const { sanityClient } = await import('../src/lib/sanity/config')
  const { prepareSanityDocument } = await import('../src/lib/sanity/utils')

  // Pre-check: abort if imported docs already exist
  const existingCount = await sanityClient.fetch<number>(
    `count(*[_type == "surveyResponse" && metadata.submissionSource == "google-forms-import" && surveySlug == $slug])`,
    { slug: aiAgents2026.slug }
  )
  if (existingCount > 0) {
    console.log(
      `\n❌ Aborted: ${existingCount} imported responses already exist in Sanity.`
    )
    console.log(
      '   The import uses createIfNotExists (idempotent), but this check prevents accidental re-runs.'
    )
    console.log('   Delete existing imports first if you need to re-import.')
    process.exit(1)
  }

  let created = 0
  let failed = 0

  for (const response of responses) {
    try {
      const doc = prepareSanityDocument({
        _id: response._id,
        _type: 'surveyResponse' as const,
        surveySlug: response.surveySlug,
        surveyVersion: response.surveyVersion,
        answers: response.answers,
        submittedAt: response.submittedAt,
        metadata: response.metadata,
      })
      await sanityClient.createIfNotExists(doc)
      created++
      process.stdout.write(`\r   Imported ${created}/${responses.length}`)
    } catch (err) {
      failed++
      console.error(`\n❌ Failed to import row: ${err}`)
    }
  }

  console.log(`\n\n✅ Import complete: ${created} created, ${failed} failed`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
