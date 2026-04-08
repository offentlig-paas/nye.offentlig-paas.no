'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { trpc } from '@/lib/trpc/client'
import { downloadCSV } from '@/lib/csv-utils'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type ResponsesData =
  inferRouterOutputs<AppRouter>['admin']['surveys']['getResponses']
type ResponseRow = ResponsesData['responses'][0]

export interface QuestionMeta {
  title: string
  sectionTitle: string
  optionLabels: Record<string, string>
}

function resolveValue(
  value: string,
  optionLabels: Record<string, string>
): string {
  return optionLabels[value] ?? value
}

function resolveValues(
  values: string[],
  optionLabels: Record<string, string>
): string {
  return values.map(v => resolveValue(v, optionLabels)).join(', ')
}

export function AdminSurveyResponsesClient({
  slug,
  initialData,
  questionMeta,
  memberNames,
}: {
  slug: string
  initialData: ResponsesData
  questionMeta: Record<string, QuestionMeta>
  memberNames: string[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [linkingId, setLinkingId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const exportCsv = trpc.admin.surveys.exportCsv.useQuery(
    { slug },
    { enabled: false }
  )
  const linkMutation = trpc.admin.surveys.linkOrganization.useMutation({
    onSuccess: () => {
      setLinkingId(null)
      router.refresh()
    },
  })

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
              <ResponseRowView
                key={response.id}
                response={response}
                questionMeta={questionMeta}
                isExpanded={expandedId === response.id}
                onToggle={() =>
                  setExpandedId(prev =>
                    prev === response.id ? null : response.id
                  )
                }
                isLinking={linkingId === response.id}
                onStartLink={() => setLinkingId(response.id)}
                onCancelLink={() => setLinkingId(null)}
                onLink={memberName => {
                  linkMutation.mutate({
                    slug,
                    responseId: response.id,
                    memberName,
                  })
                }}
                linkPending={linkMutation.isPending}
                memberNames={memberNames}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function groupAnswersBySection(
  answers: ResponseRow['answers'],
  questionMeta: Record<string, QuestionMeta>
): Map<string, { questionId: string; meta?: QuestionMeta }[]> {
  const groups = new Map<
    string,
    { questionId: string; meta?: QuestionMeta }[]
  >()

  for (const answer of answers) {
    const meta = questionMeta[answer.questionId]
    const section = meta?.sectionTitle ?? 'Annet'
    const group = groups.get(section) ?? []
    group.push({ questionId: answer.questionId, meta })
    groups.set(section, group)
  }

  return groups
}

function ResponseRowView({
  response,
  questionMeta,
  isExpanded,
  onToggle,
  isLinking,
  onStartLink,
  onCancelLink,
  onLink,
  linkPending,
  memberNames,
}: {
  response: ResponseRow
  questionMeta: Record<string, QuestionMeta>
  isExpanded: boolean
  onToggle: () => void
  isLinking: boolean
  onStartLink: () => void
  onCancelLink: () => void
  onLink: (memberName: string) => void
  linkPending: boolean
  memberNames: string[]
}) {
  const [search, setSearch] = useState('')
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

  const answerMap = new Map(response.answers.map(a => [a.questionId, a]))
  const sections = groupAnswersBySection(response.answers, questionMeta)

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
          <span className="inline-flex items-center gap-1.5">
            {response.organization}
            {response.organizationOverride && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Koblet
              </span>
            )}
            {!response.isMember && !response.organizationOverride && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Ikke medlem
              </span>
            )}
          </span>
          {response.organizationOverride && (
            <span className="ml-2 text-[10px] text-zinc-400 dark:text-zinc-500">
              (opprinnelig: {response.organizationOverride.originalValue})
            </span>
          )}
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
            <div className="space-y-5">
              {Array.from(sections.entries()).map(
                ([sectionTitle, questions]) => (
                  <div key={sectionTitle}>
                    <h4 className="mb-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
                      {sectionTitle}
                    </h4>
                    <div className="space-y-1.5">
                      {questions.map(({ questionId, meta }) => {
                        const answer = answerMap.get(questionId)
                        if (!answer) return null
                        const labels = meta?.optionLabels ?? {}
                        const displayValue = answer.arrayValue
                          ? resolveValues(answer.arrayValue, labels)
                          : resolveValue(answer.value ?? '–', labels)

                        return (
                          <div
                            key={questionId}
                            className="grid grid-cols-[minmax(200px,1fr)_2fr] gap-2 text-sm"
                          >
                            <span className="text-zinc-500 dark:text-zinc-400">
                              {meta?.title ?? questionId}
                            </span>
                            <span className="text-zinc-900 dark:text-zinc-100">
                              {displayValue}
                              {answer.otherText && (
                                <span className="ml-1 text-zinc-500 italic dark:text-zinc-400">
                                  ({answer.otherText})
                                </span>
                              )}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              )}
              {!response.isMember && (
                <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
                  {isLinking ? (
                    <LinkOrganizationForm
                      memberNames={memberNames}
                      search={search}
                      onSearchChange={setSearch}
                      onSelect={onLink}
                      onCancel={() => {
                        onCancelLink()
                        setSearch('')
                      }}
                      pending={linkPending}
                    />
                  ) : (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onStartLink()
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      {response.organizationOverride
                        ? 'Endre kobling'
                        : 'Koble til medlem'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function LinkOrganizationForm({
  memberNames,
  search,
  onSearchChange,
  onSelect,
  onCancel,
  pending,
}: {
  memberNames: string[]
  search: string
  onSearchChange: (v: string) => void
  onSelect: (name: string) => void
  onCancel: () => void
  pending: boolean
}) {
  const filtered = search.trim()
    ? memberNames.filter(n =>
        n.toLowerCase().includes(search.toLowerCase().trim())
      )
    : memberNames

  return (
    <div className="space-y-2" onClick={e => e.stopPropagation()}>
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Velg medlem å koble til
      </label>
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Søk etter medlem…"
        className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        autoFocus
        disabled={pending}
      />
      {filtered.length > 0 && (
        <ul className="max-h-48 max-w-sm overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          {filtered.slice(0, 20).map(name => (
            <li key={name}>
              <button
                onClick={() => onSelect(name)}
                disabled={pending}
                className="w-full px-3 py-1.5 text-left text-sm text-zinc-700 transition hover:bg-teal-50 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-teal-900/20"
              >
                {name}
              </button>
            </li>
          ))}
          {filtered.length > 20 && (
            <li className="px-3 py-1.5 text-xs text-zinc-400">
              +{filtered.length - 20} flere…
            </li>
          )}
        </ul>
      )}
      {filtered.length === 0 && search.trim() && (
        <p className="text-xs text-zinc-400">Ingen treff</p>
      )}
      <button
        onClick={onCancel}
        disabled={pending}
        className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
      >
        Avbryt
      </button>
    </div>
  )
}
