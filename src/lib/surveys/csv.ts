import { stripMarkdown } from '@/lib/markdown'
import type { AggregatedSurveyResults } from './aggregation'

/** Quotes a cell and neutralises spreadsheet formulas (= + - @ tab CR). */
export function csvCell(value: unknown): string {
  const s = String(value ?? '').replace(/"/g, '""')
  return /^\s*[=+\-@\t\r]/.test(s) ? `"'${s}"` : `"${s}"`
}

export function toCsv(rows: unknown[][]): string {
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n')
}

/** One row per option per question: the same numbers the results page shows. */
export function aggregatedToCsv(results: AggregatedSurveyResults): string {
  const rows: unknown[][] = [
    [
      'Seksjon',
      'Spørsmål',
      'Svaralternativ',
      'Antall',
      'Prosent',
      'Antall svar på spørsmålet',
    ],
  ]
  for (const section of results.sections) {
    for (const q of section.questions) {
      for (const o of q.options) {
        // Suppressed options carry count 0; only the bucket row is real.
        if (o.suppressed) continue
        rows.push([
          stripMarkdown(section.title),
          stripMarkdown(q.title),
          o.label,
          o.count,
          o.percentage,
          q.nIsLowerBound ? `minst ${q.responseCount}` : q.responseCount,
        ])
      }
    }
  }
  return toCsv(rows)
}

/** UTF-8 BOM so Excel reads æøå. */
export function csvResponse(csv: string, filename: string): Response {
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
