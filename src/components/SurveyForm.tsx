'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { trpc } from '@/lib/trpc/client'
import type {
  SurveyDefinition,
  SurveySection,
  SurveyQuestion,
  SurveyAnswer,
  ConsentContact,
} from '@/lib/surveys/types'
import {
  getVisibleSectionIds,
  getVisibleQuestionIds,
  isQuestionRequired,
  resolveQuestion,
  surveyProgress,
  estimateCompletionMinutes,
  buildConsentText,
  buildThankYouMessage,
} from '@/lib/surveys/helpers'
import { validateQuestion } from '@/lib/surveys/validation'
import { TextInput } from './survey/TextInput'
import { TextareaInput } from './survey/TextareaInput'
import { RadioGroup } from './survey/RadioGroup'
import { CheckboxGroup } from './survey/CheckboxGroup'
import { TypeaheadInput } from './survey/TypeaheadInput'
import { MatrixGroup } from './survey/MatrixGroup'
import { Markdown } from './survey/Markdown'
import {
  useDraftPersistence,
  loadDraft,
  clearDraft,
} from '@/lib/surveys/useDraftPersistence'

interface SurveyFormProps {
  survey: SurveyDefinition
  contact: ConsentContact
  /** Render without submitting answers (admin preview of drafts). */
  preview?: boolean
  /** Pilot token from the tester's link; marks the submission as pilot. */
  pilotToken?: string
}

export function SurveyForm({
  survey,
  contact,
  preview,
  pilotToken,
}: SurveyFormProps) {
  // Preview and pilot drafts use their own key so they never prefill the public form.
  const draftKey = preview
    ? `${survey.slug}:preview`
    : pilotToken
      ? `${survey.slug}:pilot`
      : survey.slug
  const draft = useMemo(
    () => loadDraft(draftKey, survey.version),
    [draftKey, survey.version]
  )
  const [answers, setAnswers] = useState<Map<string, SurveyAnswer>>(() =>
    draft ? new Map(draft.answers) : new Map()
  )
  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    draft?.currentSectionIndex ?? 0
  )
  const [errors, setErrors] = useState<Map<string, string>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [consentAccepted, setConsentAccepted] = useState(
    draft?.consentAccepted ?? false
  )
  const [showConsent, setShowConsent] = useState(draft?.showConsent ?? true)
  const formTopRef = useRef<HTMLDivElement>(null)
  const sectionHeadingRef = useRef<HTMLHeadingElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const submissionIdRef = useRef(draft?.submissionId ?? crypto.randomUUID())
  const startTimeRef = useRef<number | null>(draft?.startTime ?? null)
  const [sessionSeed] = useState(
    () => draft?.sessionSeed ?? Math.floor(Math.random() * 2147483647)
  )
  const [stepAnnouncement, setStepAnnouncement] = useState('')

  const estimatedMinutes = useMemo(
    () => estimateCompletionMinutes(survey),
    [survey]
  )

  const consentText = useMemo(
    () => buildConsentText(survey, contact),
    [survey, contact]
  )
  const thankYouText = useMemo(
    () => buildThankYouMessage(survey, contact),
    [survey, contact]
  )

  const scrollToTop = useCallback(() => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Focus section heading after React commits the new section DOM.
  // This ensures Tab order starts within the section, not the footer.
  const [focusTrigger, setFocusTrigger] = useState(0)
  useEffect(() => {
    if (focusTrigger === 0) return
    // Scroll after the new section is in the DOM; a plain focus() would
    // jump-scroll and cancel the smooth scroll.
    scrollToTop()
    sectionHeadingRef.current?.focus({ preventScroll: true })
  }, [focusTrigger, scrollToTop])

  useDraftPersistence(
    draftKey,
    survey.version,
    answers,
    currentSectionIndex,
    consentAccepted,
    showConsent,
    startTimeRef,
    isSuccess,
    submissionIdRef,
    sessionSeed
  )

  const submitMutation = trpc.survey.submit.useMutation()

  const visibleSectionIds = useMemo(
    () => getVisibleSectionIds(survey.sections, answers),
    [survey.sections, answers]
  )

  const visibleSections = useMemo(
    () => survey.sections.filter(s => visibleSectionIds.includes(s.id)),
    [survey.sections, visibleSectionIds]
  )

  const visibleQuestionIds = useMemo(
    () => getVisibleQuestionIds(survey.sections, answers),
    [survey.sections, answers]
  )

  const progress = useMemo(
    () => surveyProgress(survey.sections, answers, survey.estimatedMinutes),
    [survey.sections, answers, survey.estimatedMinutes]
  )

  const currentSection = visibleSections[currentSectionIndex]
  const isLastSection = currentSectionIndex === visibleSections.length - 1

  const updateAnswer = useCallback(
    (questionId: string, value: string | string[], otherText?: string) => {
      setAnswers(prev => {
        const next = new Map(prev)
        next.set(questionId, { questionId, value, otherText })
        return next
      })
      setErrors(prev => {
        if (!prev.has(questionId)) return prev
        const next = new Map(prev)
        next.delete(questionId)
        return next
      })
    },
    []
  )

  const validateCurrentSection = useCallback((): boolean => {
    if (!currentSection) return true
    const newErrors = new Map<string, string>()

    for (const original of currentSection.questions) {
      if (!visibleQuestionIds.has(original.id)) continue
      const { question, answer } = resolveQuestion(
        original,
        answers.get(original.id),
        answers,
        visibleQuestionIds
      )
      const error = validateQuestion(
        question,
        answer,
        isQuestionRequired(question, answers, visibleQuestionIds)
      )
      if (error) {
        newErrors.set(question.id, error)
      }
    }

    setErrors(newErrors)
    if (newErrors.size > 0) {
      const firstErrorId = `q-${[...newErrors.keys()][0]}`
      const el = document.getElementById(firstErrorId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      requestAnimationFrame(() => {
        el?.focus()
      })
    }
    return newErrors.size === 0
  }, [currentSection, answers, visibleQuestionIds])

  const handleNext = useCallback(() => {
    if (!validateCurrentSection()) return

    const newVisibleIds = getVisibleSectionIds(survey.sections, answers)
    const newVisible = survey.sections.filter(s => newVisibleIds.includes(s.id))

    const currentId = currentSection?.id
    if (!currentId) return

    const nextIdx = newVisible.findIndex(s => s.id === currentId) + 1
    if (nextIdx < newVisible.length) {
      setCurrentSectionIndex(nextIdx)
      setStepAnnouncement(
        `Seksjon ${nextIdx + 1} av ${newVisible.length}: ${newVisible[nextIdx]!.title}`
      )
      setFocusTrigger(t => t + 1)
    }
  }, [validateCurrentSection, survey.sections, answers, currentSection])

  const handleBack = useCallback(() => {
    if (currentSectionIndex > 0) {
      const prevIdx = currentSectionIndex - 1
      setCurrentSectionIndex(prevIdx)
      setStepAnnouncement(
        `Seksjon ${prevIdx + 1} av ${visibleSections.length}: ${visibleSections[prevIdx]!.title}`
      )
      setFocusTrigger(t => t + 1)
    }
  }, [currentSectionIndex, visibleSections])

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentSection()) return
    if (submittingRef.current) return
    submittingRef.current = true

    setIsSubmitting(true)
    setSubmitError(null)

    if (preview) {
      setIsSuccess(true)
      clearDraft(draftKey, survey.version)
      setIsSubmitting(false)
      return
    }

    try {
      const answerArray = Array.from(answers.values())
      const durationSeconds = startTimeRef.current
        ? Math.round((Date.now() - startTimeRef.current) / 1000)
        : undefined
      const result = await submitMutation.mutateAsync({
        surveySlug: survey.slug,
        surveyVersion: survey.version,
        submissionId: submissionIdRef.current,
        answers: answerArray,
        honeypot: honeypotRef.current?.value ?? '',
        durationSeconds,
        pilotToken,
      })
      if ('honeypot' in result && result.honeypot) {
        return
      }
      setIsSuccess(true)
      clearDraft(draftKey, survey.version)
    } catch (error) {
      submittingRef.current = false
      setSubmitError(
        error instanceof Error ? error.message : 'Noe gikk galt. Prøv igjen.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    validateCurrentSection,
    answers,
    submitMutation,
    survey.slug,
    survey.version,
    preview,
    draftKey,
    pilotToken,
  ])

  if (isSuccess) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center dark:border-teal-800 dark:bg-teal-900/20"
      >
        <h2 className="text-xl font-semibold text-teal-800 dark:text-teal-200">
          Takk for ditt svar!
        </h2>
        <div className="mt-4 text-base text-teal-700 dark:text-teal-300">
          <Markdown>
            {preview
              ? 'Dette var en forhåndsvisning. Svarene ble ikke lagret.'
              : thankYouText}
          </Markdown>
        </div>
      </div>
    )
  }

  if (showConsent) {
    return (
      <section aria-label="Samtykke" className="space-y-6">
        <div
          ref={formTopRef}
          className="text-base text-zinc-700 dark:text-zinc-300"
        >
          {survey.consent.fullText ? (
            <>
              <Markdown>{survey.consent.dataCollectionText}</Markdown>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-teal-700 dark:text-teal-400">
                  Les mer
                </summary>
                <div className="mt-3">
                  <Markdown>{consentText}</Markdown>
                </div>
              </details>
            </>
          ) : (
            <Markdown>{consentText}</Markdown>
          )}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Estimert tid: ca. {estimatedMinutes} minutter
        </p>
        <div className="-mx-2 flex gap-3 rounded-lg px-2 py-2 sm:mx-0 sm:px-0 sm:py-0">
          <div className="flex h-6 shrink-0 items-center">
            <div className="group grid size-4 grid-cols-1">
              <input
                id="consent"
                type="checkbox"
                checked={consentAccepted}
                aria-required
                onChange={e => setConsentAccepted(e.target.checked)}
                className="col-start-1 row-start-1 appearance-none rounded-sm border border-zinc-300 bg-white checked:border-teal-600 checked:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-white/10 dark:bg-white/5 dark:checked:border-teal-500 dark:checked:bg-teal-500 forced-colors:appearance-auto"
              />
              <svg
                fill="none"
                viewBox="0 0 14 14"
                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
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
            htmlFor="consent"
            className="text-base/7 font-medium text-zinc-700 dark:text-zinc-300"
          >
            {survey.consent.checkboxLabel ??
              'Jeg har lest informasjonen over og samtykker til å delta i undersøkelsen.'}
          </label>
        </div>
        <button
          onClick={() => {
            startTimeRef.current = Date.now()
            setShowConsent(false)
            scrollToTop()
            setFocusTrigger(t => t + 1)
          }}
          disabled={!consentAccepted}
          className="rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5 dark:bg-teal-500 dark:hover:bg-teal-400"
        >
          Start undersøkelsen
        </button>
      </section>
    )
  }

  return (
    <form
      noValidate
      onSubmit={e => e.preventDefault()}
      aria-label={survey.title}
      className="space-y-8"
    >
      <div
        ref={formTopRef}
        className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400"
      >
        <span aria-current="step">
          Seksjon {currentSectionIndex + 1} av {visibleSections.length}
        </span>
        <div
          className="mx-4 h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-200 sm:h-2 dark:bg-zinc-700"
          role="progressbar"
          aria-valuenow={Math.round(progress.fraction * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Fremdrift: andel besvarte spørsmål"
        >
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300 dark:bg-teal-400"
            style={{ width: `${progress.fraction * 100}%` }}
          />
        </div>
        {progress.minutesLeft !== undefined && (
          <span className="whitespace-nowrap">
            ca. {progress.minutesLeft} min igjen
          </span>
        )}
      </div>

      <div aria-live="polite" aria-atomic className="sr-only">
        {stepAnnouncement}
      </div>

      {currentSection && (
        <SectionRenderer
          section={currentSection}
          answers={answers}
          visibleQuestionIds={visibleQuestionIds}
          errors={errors}
          onAnswer={updateAnswer}
          sessionSeed={sessionSeed}
          headingRef={sectionHeadingRef}
        />
      )}

      {submitError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
        >
          {submitError}
        </div>
      )}

      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentSectionIndex === 0}
          className="rounded-md px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:invisible sm:py-2 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <span aria-hidden>← </span>Tilbake
        </button>

        {isLastSection ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5 dark:bg-teal-500 dark:hover:bg-teal-400"
          >
            {isSubmitting ? 'Sender...' : 'Send inn svar'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:py-2.5 dark:bg-teal-500 dark:hover:bg-teal-400"
          >
            Neste<span aria-hidden> →</span>
          </button>
        )}
      </div>
    </form>
  )
}

function SectionRenderer({
  section,
  answers,
  visibleQuestionIds,
  errors,
  onAnswer,
  sessionSeed,
  headingRef,
}: {
  section: SurveySection
  answers: Map<string, SurveyAnswer>
  visibleQuestionIds: Set<string>
  errors: Map<string, string>
  onAnswer: (id: string, value: string | string[], otherText?: string) => void
  sessionSeed: number
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold text-zinc-900 outline-none dark:text-zinc-100"
        >
          {section.title}
        </h2>
        {section.description && (
          <div className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            <Markdown>{section.description}</Markdown>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {section.questions
          .filter(q => visibleQuestionIds.has(q.id))
          .map(original => {
            const { question, answer } = resolveQuestion(
              original,
              answers.get(original.id),
              answers,
              visibleQuestionIds
            )
            return (
              <QuestionRenderer
                key={question.id}
                question={{
                  ...question,
                  required: isQuestionRequired(
                    question,
                    answers,
                    visibleQuestionIds
                  ),
                }}
                answer={answer}
                error={errors.get(question.id)}
                onAnswer={onAnswer}
                sessionSeed={sessionSeed}
              />
            )
          })}
      </div>
    </div>
  )
}

function QuestionRenderer({
  question,
  answer,
  error,
  onAnswer,
  sessionSeed,
}: {
  question: SurveyQuestion
  answer: SurveyAnswer | undefined
  error: string | undefined
  onAnswer: (id: string, value: string | string[], otherText?: string) => void
  sessionSeed: number
}) {
  switch (question.type) {
    case 'text':
      return (
        <TextInput
          question={question}
          value={(answer?.value as string) ?? ''}
          onChange={v => onAnswer(question.id, v)}
          error={error}
        />
      )
    case 'typeahead':
      return (
        <TypeaheadInput
          question={question}
          value={(answer?.value as string) ?? ''}
          onChange={v => onAnswer(question.id, v)}
          error={error}
        />
      )
    case 'textarea':
      return (
        <TextareaInput
          question={question}
          value={(answer?.value as string) ?? ''}
          onChange={v => onAnswer(question.id, v)}
          error={error}
        />
      )
    case 'radio':
      return (
        <RadioGroup
          question={question}
          value={(answer?.value as string) ?? ''}
          otherText={answer?.otherText}
          onChange={(v, ot) => onAnswer(question.id, v, ot)}
          error={error}
          sessionSeed={sessionSeed}
        />
      )
    case 'checkbox':
      return (
        <CheckboxGroup
          question={question}
          value={(answer?.value as string[]) ?? []}
          otherText={answer?.otherText}
          onChange={(v, ot) => onAnswer(question.id, v, ot)}
          error={error}
          sessionSeed={sessionSeed}
        />
      )
    case 'matrix':
      return (
        <MatrixGroup
          question={question}
          value={(answer?.value as string[]) ?? []}
          onChange={v => onAnswer(question.id, v)}
          error={error}
        />
      )
  }
}
