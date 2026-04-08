'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { members } from '@/data/members'

const ORGANISATION_NAMES = members
  .map(m => m.name)
  .sort((a, b) => a.localeCompare(b, 'nb'))

interface OrganisationTypeaheadProps {
  id: string
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  labelClassName?: string
}

export function OrganisationTypeahead({
  id,
  value,
  onChange,
  label = 'Organisasjon',
  required = false,
  disabled = false,
  placeholder = 'Søk etter organisasjon...',
  className,
  labelClassName,
}: OrganisationTypeaheadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const listboxId = `${id}-listbox`

  const filtered = useMemo(
    () =>
      value.trim()
        ? ORGANISATION_NAMES.filter(name =>
            name.toLowerCase().includes(value.toLowerCase())
          )
        : ORGANISATION_NAMES,
    [value]
  )

  const showSuggestions = isOpen && filtered.length > 0

  const select = useCallback(
    (name: string) => {
      onChange(name)
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

  const defaultInputClassName =
    'block w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500'

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className={
            labelClassName ||
            'block text-sm/6 font-medium text-zinc-900 dark:text-white'
          }
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className={label ? 'mt-2' : undefined}>
        <input
          ref={inputRef}
          id={id}
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
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={className || defaultInputClassName}
        />
      </div>
      {showSuggestions && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:max-h-60 sm:text-sm dark:bg-zinc-800 dark:ring-white/10"
        >
          {filtered.map((name, index) => (
            <li
              key={name}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={e => {
                e.preventDefault()
                select(name)
              }}
              className={`relative cursor-pointer px-3 py-2 select-none ${
                index === activeIndex
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
