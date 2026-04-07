'use client'

import { useState, useMemo } from 'react'
import type { RadioQuestion } from '@/lib/surveys/types'
import { shuffleOptions } from '@/lib/surveys/helpers'
import { Markdown } from './Markdown'

interface RadioGroupProps {
  question: RadioQuestion
  value: string
  otherText?: string
  onChange: (value: string, otherText?: string) => void
  error?: string
  sessionSeed: number
}

export function RadioGroup({
  question,
  value,
  otherText,
  onChange,
  error,
  sessionSeed,
}: RadioGroupProps) {
  const groupId = `q-${question.id}`
  const errorId = `${groupId}-error`
  const [localOtherText, setLocalOtherText] = useState(otherText ?? '')

  const options = useMemo(
    () =>
      question.randomizeOptions
        ? shuffleOptions(question.options, question.id, sessionSeed)
        : question.options,
    [question.options, question.randomizeOptions, question.id, sessionSeed]
  )

  return (
    <fieldset
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
      <div className="mt-3 space-y-4 sm:space-y-3">
        {options.map(option => {
          const optionId = `${groupId}-${option.value}`
          return (
            <div key={option.value}>
              <div className="-mx-2 flex items-center gap-x-3 rounded-lg px-2 py-2 sm:mx-0 sm:px-0 sm:py-0">
                <input
                  id={optionId}
                  type="radio"
                  name={groupId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => {
                    if (option.allowOtherText) {
                      onChange(option.value, localOtherText)
                    } else {
                      onChange(option.value)
                    }
                  }}
                  className="relative size-4 appearance-none rounded-full border border-zinc-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-teal-600 checked:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-white/10 dark:bg-white/5 dark:checked:border-teal-500 dark:checked:bg-teal-500 forced-colors:appearance-auto forced-colors:before:hidden"
                />
                <label
                  htmlFor={optionId}
                  className="block text-base/7 font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {option.label}
                </label>
              </div>
              {option.allowOtherText && value === option.value && (
                <div className="mt-1 ml-7">
                  <input
                    type="text"
                    value={localOtherText}
                    onChange={e => {
                      setLocalOtherText(e.target.value)
                      onChange(option.value, e.target.value)
                    }}
                    placeholder="Spesifiser"
                    aria-label={`${option.label}: spesifiser`}
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 sm:py-1.5 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500 dark:focus:outline-teal-400"
                  />
                </div>
              )}
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
