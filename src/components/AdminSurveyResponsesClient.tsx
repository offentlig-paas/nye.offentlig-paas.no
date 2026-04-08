'use client'

import { useState } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { trpc } from '@/lib/trpc/client'
import { downloadCSV } from '@/lib/csv-utils'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type ResponsesData =
  inferRouterOutputs<AppRouter>['admin']['surveys']['getResponses']
type ResponseRow = ResponsesData['responses'][0]

export function AdminSurveyResponsesClient({
  slug,
  initialData,
}: {
  slug: string
  initialData: ResponsesData
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const exportCsv = trpc.admin.surveys.exportCsv.useQuery(
    { slug },
    { enabled: false }
  )

  async function handleExport() {
    setIsExporting(true)
    try {
      const result = await exportCsv.refetch()
      if (result.data) {
        downloadCSV(result.data.csv, result.data.filename)
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {initialData.total} besvarelser totalt
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          {isExporting ? 'Eksporterer…' : 'Eksporter CSV'}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Organisasjon
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Tidspunkt
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Enhet
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Varighet
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
            {initialData.responses.map(response => (
              <ResponseRow
                key={response.id}
                response={response}
                isExpanded={expandedId === response.id}
                onToggle={() =>
                  setExpandedId(prev =>
                    prev === response.id ? null : response.id
                  )
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ResponseRow({
  response,
  isExpanded,
  onToggle,
}: {
  response: ResponseRow
  isExpanded: boolean
  onToggle: () => void
}) {
  const duration = response.durationSeconds
    ? `${Math.round(response.durationSeconds / 60)} min`
    : '–'

  const date = new Date(response.submittedAt).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
          )}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {response.organization}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
          {date}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
          {response.deviceCategory}
        </td>
        <td className="px-4 py-3 text-right text-sm text-zinc-500 dark:text-zinc-400">
          {duration}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="bg-zinc-50 px-4 py-4 dark:bg-zinc-800/50">
            <div className="space-y-2">
              {response.answers.map(answer => (
                <div key={answer.questionId} className="text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {answer.questionId}:
                  </span>{' '}
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {answer.arrayValue
                      ? answer.arrayValue.join(', ')
                      : (answer.value ?? '–')}
                    {answer.otherText && (
                      <span className="italic"> ({answer.otherText})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
