'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import type { TypeaheadQuestion as TypeaheadQuestionType } from '@/lib/surveys/types'
import { Markdown } from './Markdown'

interface TypeaheadInputProps {
  question: TypeaheadQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
}

export function TypeaheadInput({
  question,
  value,
  onChange,
  error,
}: TypeaheadInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const inputId = `q-${question.id}`
  const errorId = `${inputId}-error`
  const descId = `${inputId}-desc`
  const listboxId = `${inputId}-listbox`

  const filtered = useMemo(
    () =>
      value.trim()
        ? question.suggestions.filter(s =>
            s.toLowerCase().includes(value.toLowerCase())
          )
        : [],
    [value, question.suggestions]
  )

  const showSuggestions = isOpen && filtered.length > 0

  const describedBy = [
    question.description ? descId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ')

  const select = useCallback(
    (suggestion: string) => {
      onChange(suggestion)
      setIsOpen(false)
      setActiveIndex(-1)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && filtered[activeIndex]) {
            select(filtered[activeIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setActiveIndex(-1)
          break
      }
    },
    [showSuggestions, activeIndex, filtered, select]
  )

  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const option = listboxRef.current.children[activeIndex] as HTMLElement
      option?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  return (
    <div className="relative">
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
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          value={value}
          onChange={e => {
            onChange(e.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200)
          }}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          required={question.required}
          aria-required={question.required || undefined}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 sm:py-1.5 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500 dark:focus:outline-teal-400"
        />
      </div>
      {showSuggestions && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:max-h-60 sm:text-sm dark:bg-zinc-800 dark:ring-white/10"
        >
          {filtered.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={e => {
                e.preventDefault()
                select(suggestion)
              }}
              className={`relative cursor-pointer px-3 py-3 select-none sm:py-2 ${
                index === activeIndex
                  ? 'bg-teal-600 text-white dark:bg-teal-500'
                  : 'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
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
