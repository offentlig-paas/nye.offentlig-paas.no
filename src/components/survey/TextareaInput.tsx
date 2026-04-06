'use client'

import type { TextareaQuestion } from '@/lib/surveys/types'
import { Markdown } from './Markdown'

interface TextareaInputProps {
  question: TextareaQuestion
  value: string
  onChange: (value: string) => void
  error?: string
}

export function TextareaInput({
  question,
  value,
  onChange,
  error,
}: TextareaInputProps) {
  const inputId = `q-${question.id}`
  const errorId = `${inputId}-error`
  const descId = `${inputId}-desc`
  const countId = `${inputId}-count`
  const describedBy = [
    question.description ? descId : null,
    question.maxLength ? countId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-base/7 font-medium text-zinc-900 dark:text-white"
      >
        {question.title}
        {question.required && (
          <>
            <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden>
              *
            </span>
            <span className="sr-only"> (påkrevd)</span>
          </>
        )}
      </label>
      {question.description && (
        <div
          id={descId}
          className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <Markdown>{question.description}</Markdown>
        </div>
      )}
      <div className="mt-2">
        <textarea
          id={inputId}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          rows={4}
          required={question.required}
          aria-required={question.required || undefined}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 sm:py-1.5 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500 dark:focus:outline-teal-400"
        />
      </div>
      <div className="mt-1 flex justify-between text-sm text-zinc-400 dark:text-zinc-500">
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        ) : (
          <span />
        )}
        {question.maxLength && (
          <span id={countId} role="status" aria-live="polite">
            {value.length} / {question.maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
