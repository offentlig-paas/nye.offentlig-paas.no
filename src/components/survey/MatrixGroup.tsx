'use client'

import type { MatrixQuestion } from '@/lib/surveys/types'
import { Markdown } from './Markdown'

interface MatrixGroupProps {
  question: MatrixQuestion
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

/** One radio group per row. Answers are stored as `row:column`. */
export function MatrixGroup({
  question,
  value,
  onChange,
  error,
}: MatrixGroupProps) {
  const groupId = `q-${question.id}`
  const errorId = `${groupId}-error`
  const selected = new Map(
    value.map(v => {
      const [row = '', col = ''] = v.split(':')
      return [row, col]
    })
  )

  function select(row: string, col: string) {
    const next = new Map(selected).set(row, col)
    onChange(
      question.rows
        .filter(r => next.has(r.value))
        .map(r => `${r.value}:${next.get(r.value)}`)
    )
  }

  return (
    <fieldset
      id={groupId}
      tabIndex={-1}
      aria-required={question.required || undefined}
      aria-describedby={
        [
          question.description ? `${groupId}-desc` : null,
          error ? errorId : null,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      aria-invalid={error ? true : undefined}
    >
      <legend className="text-base/7 font-semibold text-zinc-900 dark:text-white">
        {question.title}
        {question.required && (
          <>
            <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden>
              *
            </span>
            <span className="sr-only"> (påkrevd)</span>
          </>
        )}
      </legend>
      {question.description && (
        <div
          id={`${groupId}-desc`}
          className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <Markdown>{question.description}</Markdown>
        </div>
      )}
      <div className="mt-3 space-y-5">
        {question.rows.map(row => {
          const rowId = `${groupId}-${row.value}`
          return (
            <div key={row.value} role="radiogroup" aria-labelledby={rowId}>
              <p
                id={rowId}
                className="text-sm/6 font-semibold text-zinc-800 dark:text-zinc-200"
              >
                {row.label}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                {question.options.map(option => {
                  const optionId = `${rowId}-${option.value}`
                  return (
                    <div key={option.value} className="flex items-center gap-2">
                      <input
                        id={optionId}
                        type="radio"
                        name={rowId}
                        value={option.value}
                        checked={selected.get(row.value) === option.value}
                        onChange={() => select(row.value, option.value)}
                        className="relative size-4 appearance-none rounded-full border border-zinc-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-teal-600 checked:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-white/10 dark:bg-white/5 dark:checked:border-teal-500 dark:checked:bg-teal-500 forced-colors:appearance-auto forced-colors:before:hidden"
                      />
                      <label
                        htmlFor={optionId}
                        className="text-sm/6 text-zinc-700 dark:text-zinc-300"
                      >
                        {option.label}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm/6 text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </fieldset>
  )
}
