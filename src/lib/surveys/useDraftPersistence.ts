'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { SurveyAnswer } from './types'

interface DraftState {
  answers: [string, SurveyAnswer][]
  currentSectionIndex: number
  consentAccepted: boolean
  showConsent: boolean
  startTime: number | null
  submissionId: string
}

function storageKey(slug: string, version: number): string {
  return `survey-draft:${slug}:v${version}`
}

export function loadDraft(
  slug: string,
  version: number
): DraftState | undefined {
  try {
    const raw = sessionStorage.getItem(storageKey(slug, version))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as DraftState
    if (
      !parsed ||
      !Array.isArray(parsed.answers) ||
      typeof parsed.currentSectionIndex !== 'number' ||
      typeof parsed.consentAccepted !== 'boolean' ||
      typeof parsed.showConsent !== 'boolean'
    ) {
      sessionStorage.removeItem(storageKey(slug, version))
      return undefined
    }
    if (parsed.currentSectionIndex < 0) {
      parsed.currentSectionIndex = 0
    }
    return parsed
  } catch {
    try {
      sessionStorage.removeItem(storageKey(slug, version))
    } catch {
      // ignore
    }
    return undefined
  }
}

export function clearDraft(slug: string, version: number): void {
  try {
    sessionStorage.removeItem(storageKey(slug, version))
  } catch {
    // ignore
  }
}

export function useDraftPersistence(
  slug: string,
  version: number,
  answers: Map<string, SurveyAnswer>,
  currentSectionIndex: number,
  consentAccepted: boolean,
  showConsent: boolean,
  startTime: number | null,
  isSuccess: boolean,
  submissionId: string
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(() => {
    if (isSuccess) return
    try {
      const state: DraftState = {
        answers: Array.from(answers.entries()),
        currentSectionIndex,
        consentAccepted,
        showConsent,
        startTime,
        submissionId,
      }
      sessionStorage.setItem(storageKey(slug, version), JSON.stringify(state))
    } catch {
      // quota exceeded or SSR — ignore
    }
  }, [
    slug,
    version,
    answers,
    currentSectionIndex,
    consentAccepted,
    showConsent,
    startTime,
    isSuccess,
    submissionId,
  ])

  useEffect(() => {
    if (isSuccess) {
      clearDraft(slug, version)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(save, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [save, isSuccess, slug, version])
}
