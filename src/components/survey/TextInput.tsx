'use client'

import type { TextQuestion as TextQuestionType } from '@/lib/surveys/types'
import { Markdown } from './Markdown'

interface TextInputProps {
  question: TextQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
}

export function TextInput({
  question,
  value,
  onChange,
  error,
}: TextInputProps) {
  const inputId = `q-${question.id}`
  const errorId = `${inputId}-error`
  const descId = `${inputId}-desc`
  const describedBy = [
    question.description ? descId : null,
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
        <input
          id={inputId}
          type={question.format === 'email' ? 'email' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder}
          required={question.required}
          aria-required={question.required || undefined}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 sm:py-1.5 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500 dark:focus:outline-teal-400"
        />
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
    </div>
  )
}
