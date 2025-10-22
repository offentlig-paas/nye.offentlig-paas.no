'use client'

import { useState } from 'react'
import { Button } from './Button'
import { StarRating } from './StarRating'
import { Avatar } from './Avatar'
import { SuccessMessage } from './SuccessMessage'
import type {
  TalkRating,
  TopicSuggestion,
} from '@/domains/event-feedback/types'
import type { Item, SlackUser } from '@/lib/events/types'
import { trpc } from '@/lib/trpc/client'

interface EventFeedbackFormProps {
  eventSlug: string
  talks: Item[]
  organizers: SlackUser[]
  onSubmit?: () => void
  isUpgrade?: boolean
  existingFeedback?: {
    eventRating: number
    eventComment?: string
  } | null
}

interface FormState {
  talkRatings: Map<string, { rating: number; comment: string }>
  eventRating: number
  eventComment: string
  topicSuggestions: Array<{ topic: string; willingToPresent: boolean }>
  isPublic: boolean
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
}

export function EventFeedbackForm({
  eventSlug,
  talks,
  organizers,
  onSubmit,
  isUpgrade = false,
  existingFeedback = null,
}: EventFeedbackFormProps) {
  const submitFeedbackMutation = trpc.eventFeedback.submit.useMutation()

  const [state, setState] = useState<FormState>({
    talkRatings: new Map(talks.map(t => [t.title, { rating: 0, comment: '' }])),
    eventRating: existingFeedback?.eventRating || 0,
    eventComment: existingFeedback?.eventComment || '',
    topicSuggestions: [{ topic: '', willingToPresent: false }],
    isPublic: false,
    isSubmitting: false,
    isSuccess: false,
    error: null,
  })

  const updateTalkRating = (
    title: string,
    field: 'rating' | 'comment',
    value: number | string
  ) => {
    setState(prev => {
      const newRatings = new Map(prev.talkRatings)
      const current = newRatings.get(title) || { rating: 0, comment: '' }
      newRatings.set(title, { ...current, [field]: value })
      return { ...prev, talkRatings: newRatings }
    })
  }

  const addTopicSuggestion = () => {
    setState(prev => ({
      ...prev,
      topicSuggestions: [
        ...prev.topicSuggestions,
        { topic: '', willingToPresent: false },
      ],
    }))
  }

  const updateTopicSuggestion = (
    index: number,
    field: 'topic' | 'willingToPresent',
    value: string | boolean
  ) => {
    setState(prev => {
      const newSuggestions = [...prev.topicSuggestions]
      const current = newSuggestions[index]
      if (!current) return prev

      newSuggestions[index] = {
        ...current,
        [field]: value,
      }
      return { ...prev, topicSuggestions: newSuggestions }
    })
  }

  const removeTopicSuggestion = (index: number) => {
    setState(prev => ({
      ...prev,
      topicSuggestions: prev.topicSuggestions.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const talkRatings: TalkRating[] = Array.from(state.talkRatings.entries())
        .filter(([_, data]) => data.rating > 0)
        .map(([title, data]) => ({
          talkTitle: title,
          rating: data.rating,
          comment: data.comment || undefined,
        }))

      const topicSuggestions: TopicSuggestion[] = state.topicSuggestions
        .filter(ts => ts.topic.trim() !== '')
        .map(ts => ({
          topic: ts.topic.trim(),
          willingToPresent: ts.willingToPresent,
        }))

      await submitFeedbackMutation.mutateAsync({
        slug: eventSlug,
        talkRatings,
        eventRating: state.eventRating,
        eventComment: state.eventComment || undefined,
        topicSuggestions,
        isPublic: state.isPublic,
      })

      setState(prev => ({ ...prev, isSubmitting: false, isSuccess: true }))

      // Show success for 2 seconds before calling onSubmit
      setTimeout(() => {
        onSubmit?.()
      }, 2000)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Noe gikk galt',
        isSubmitting: false,
      }))
    }
  }

  const canSubmit =
    state.eventRating > 0 &&
    Array.from(state.talkRatings.values()).some(t => t.rating > 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Talk Ratings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Vurder foredragene
        </h3>
        <div className="space-y-3">
          {talks.map(talk => {
            const rating = state.talkRatings.get(talk.title) || {
              rating: 0,
              comment: '',
            }
            return (
              <div
                key={talk.title}
                className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    {talk.speakers && talk.speakers.length > 0 && (
                      <div className="flex -space-x-2 pt-0.5">
                        {talk.speakers.map((speaker, idx) => (
                          <Avatar
                            key={idx}
                            name={speaker.name}
                            slackUrl={speaker.url}
                            size="sm"
                            className="ring-2 ring-white dark:ring-zinc-800"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {talk.title}
                      </div>
                      {talk.speakers && talk.speakers.length > 0 && (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {talk.speakers.map(s => s.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <StarRating
                    rating={rating.rating}
                    onRatingChange={r =>
                      updateTalkRating(talk.title, 'rating', r)
                    }
                    showLabel={false}
                    className="shrink-0"
                  />
                </div>
                <textarea
                  id={`talk-comment-${talk.title}`}
                  rows={2}
                  value={rating.comment}
                  onChange={e =>
                    updateTalkRating(talk.title, 'comment', e.target.value)
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="Tilbakemelding om foredraget..."
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Rating */}
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          {organizers.length > 0 && (
            <div className="flex -space-x-2">
              {organizers.map((organizer, idx) => (
                <Avatar
                  key={idx}
                  name={organizer.name}
                  slackUrl={organizer.url}
                  size="sm"
                  className="ring-2 ring-white dark:ring-zinc-800"
                />
              ))}
            </div>
          )}
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Hvor fornøyd er du med fagdagen?
          </h3>
          {isUpgrade && existingFeedback && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Din tidligere vurdering fra Slack:{' '}
              <span className="font-medium">
                {existingFeedback.eventRating} stjerne
                {existingFeedback.eventRating !== 1 ? 'r' : ''}
              </span>
            </p>
          )}
        </div>
        <StarRating
          rating={state.eventRating}
          size="lg"
          onRatingChange={rating =>
            setState(prev => ({ ...prev, eventRating: rating }))
          }
          showLabel
        />
        <div className="space-y-2">
          <textarea
            id="eventComment"
            rows={3}
            value={state.eventComment}
            onChange={e =>
              setState(prev => ({ ...prev, eventComment: e.target.value }))
            }
            className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            placeholder="Hva synes du om arrangementet?"
          />
          {isUpgrade && existingFeedback?.eventComment && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Din tidligere kommentar: &ldquo;{existingFeedback.eventComment}
              &rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Topic Suggestions */}
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Forslag til temaer for fremtidige arrangementer
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Hva ønsker du å høre mer om på fremtidige fagdager?
        </p>
        {state.topicSuggestions.map((suggestion, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={suggestion.topic}
                onChange={e =>
                  updateTopicSuggestion(index, 'topic', e.target.value)
                }
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                placeholder="F.eks. Kubernetes sikkerhet, CI/CD best practices..."
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={suggestion.willingToPresent}
                  onChange={e =>
                    updateTopicSuggestion(
                      index,
                      'willingToPresent',
                      e.target.checked
                    )
                  }
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Jeg kan tenke meg å presentere om dette
                </span>
              </label>
            </div>
            {state.topicSuggestions.length > 1 && (
              <button
                type="button"
                onClick={() => removeTopicSuggestion(index)}
                className="self-start rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Fjern
              </button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addTopicSuggestion}
          className="w-full"
        >
          + Legg til flere forslag
        </Button>
      </div>

      {/* Public Display Checkbox */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={state.isPublic}
            onChange={e =>
              setState(prev => ({ ...prev, isPublic: e.target.checked }))
            }
            className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700"
          />
          <div className="flex-1">
            <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Jeg ønsker at min vurdering av fagdagen vises offentlig
            </span>
            <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Din vurdering og kommentar om fagdagen er privat som standard.
              Kryss av her hvis du ønsker at navnet ditt og tilbakemeldingen
              vises på arrangementets side. Dine vurderinger av individuelle
              foredrag er alltid private. Les mer i våre{' '}
              <a
                href="/vilkar#tilbakemelding"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                vilkår
              </a>
              .
            </span>
          </div>
        </label>
      </div>

      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {state.error}
        </div>
      )}

      {state.isSuccess && (
        <SuccessMessage
          title="Takk for tilbakemeldingen!"
          description="Din tilbakemelding er mottatt og hjelper oss å forbedre fremtidige arrangementer."
        >
          <Button variant="secondary" href={`/fagdag/${eventSlug}`}>
            Tilbake
          </Button>
        </SuccessMessage>
      )}

      {!state.isSuccess && (
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit || state.isSubmitting}
            className="flex-1"
          >
            {state.isSubmitting ? 'Sender...' : 'Send tilbakemelding'}
          </Button>
        </div>
      )}
    </form>
  )
}
