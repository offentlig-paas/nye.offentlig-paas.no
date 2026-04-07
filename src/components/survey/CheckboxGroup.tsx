'use client'

import { useState, useMemo } from 'react'
import type { CheckboxQuestion } from '@/lib/surveys/types'
import { shuffleOptions } from '@/lib/surveys/helpers'
import { Markdown } from './Markdown'

interface CheckboxGroupProps {
  question: CheckboxQuestion
  value: string[]
  otherText?: string
  onChange: (value: string[], otherText?: string) => void
  error?: string
  sessionSeed: number
}

export function CheckboxGroup({
  question,
  value,
  otherText,
  onChange,
  error,
  sessionSeed,
}: CheckboxGroupProps) {
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

  const atLimit = question.maxSelections
    ? value.length >= question.maxSelections
    : false

  const otherOption = question.options.find(o => o.allowOtherText)
  const showOtherInput = otherOption && value.includes(otherOption.value)

  const hasExclusive = question.options.some(o => o.exclusive)
  const exclusiveSelected = hasExclusive
    ? value.some(v => question.options.find(o => o.value === v)?.exclusive)
    : false

  function toggle(optionValue: string) {
    const option = question.options.find(o => o.value === optionValue)
    if (value.includes(optionValue)) {
      const next = value.filter(v => v !== optionValue)
      if (option?.allowOtherText) {
        onChange(next, undefined)
      } else {
        onChange(next, showOtherInput ? localOtherText : undefined)
      }
    } else {
      if (option?.exclusive) {
        onChange([optionValue])
        return
      }
      if (exclusiveSelected) {
        const next = value
          .filter(v => !question.options.find(o => o.value === v)?.exclusive)
          .concat(optionValue)
        if (option?.allowOtherText) {
          onChange(next, localOtherText)
        } else {
          onChange(next, showOtherInput ? localOtherText : undefined)
        }
        return
      }
      if (atLimit) return
      const next = [...value, optionValue]
      if (option?.allowOtherText) {
        onChange(next, localOtherText)
      } else {
        onChange(next, showOtherInput ? localOtherText : undefined)
      }
    }
  }

  return (
    <fieldset
      aria-required={question.required || undefined}
      aria-describedby={
        [
          question.description ? `${groupId}-desc` : null,
          question.minSelections || question.maxSelections
            ? `${groupId}-count`
            : null,
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
      {(question.minSelections || question.maxSelections) && (
        <p
          id={`${groupId}-count`}
          role="status"
          aria-live="polite"
          className="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
        >
          {question.minSelections && question.maxSelections
            ? `Velg ${question.minSelections}–${question.maxSelections} (${value.length} valgt)`
            : question.maxSelections
              ? `${value.length} av ${question.maxSelections} valgt`
              : `Velg minst ${question.minSelections} (${value.length} valgt)`}
        </p>
      )}
      <div className="mt-3 space-y-4 sm:space-y-3">
        {options.map(option => {
          const optionId = `${groupId}-${option.value}`
          const checked = value.includes(option.value)
          const disabled = option.exclusive
            ? !checked && value.length > 0 && !exclusiveSelected
            : !checked && (atLimit || exclusiveSelected)

          return (
            <div key={option.value}>
              <div className="-mx-2 flex gap-3 rounded-lg px-2 py-2 sm:mx-0 sm:px-0 sm:py-0">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      id={optionId}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      aria-disabled={disabled || undefined}
                      onChange={() => toggle(option.value)}
                      className="col-start-1 row-start-1 appearance-none rounded-sm border border-zinc-300 bg-white checked:border-teal-600 checked:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:border-zinc-200 disabled:bg-zinc-100 disabled:checked:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:checked:border-teal-500 dark:checked:bg-teal-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:checked:bg-white/10 forced-colors:appearance-auto"
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 14 14"
                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-white/25"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-checked:opacity-100"
                      />
                    </svg>
                  </div>
                </div>
                <label
                  htmlFor={optionId}
                  className={`text-base/7 font-medium text-zinc-700 dark:text-zinc-300 ${disabled ? 'opacity-50' : ''}`}
                >
                  {option.label}
                </label>
              </div>
              {option.allowOtherText && checked && (
                <div className="mt-1 ml-7">
                  <input
                    type="text"
                    value={localOtherText}
                    onChange={e => {
                      setLocalOtherText(e.target.value)
                      onChange(value, e.target.value)
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
