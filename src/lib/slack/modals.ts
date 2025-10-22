import type { Event } from '@/lib/events/types'
import { formatDateLong } from '@/lib/formatDate'

// Use the Slack Web API View type directly by creating a compatible structure
export function buildFeedbackModal(event: Event, eventSlug: string) {
  return {
    type: 'modal' as const,
    callback_id: 'feedback_submission',
    private_metadata: JSON.stringify({ eventSlug }),
    title: {
      type: 'plain_text' as const,
      text: 'Gi tilbakemelding',
    },
    submit: {
      type: 'plain_text' as const,
      text: 'Send inn',
    },
    close: {
      type: 'plain_text' as const,
      text: 'Avbryt',
    },
    blocks: [
      {
        type: 'header' as const,
        text: {
          type: 'plain_text' as const,
          text: event.title,
          emoji: true,
        },
      },
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: `📅 ${formatDateLong(event.start)}`,
          },
        ],
      },
      {
        type: 'divider' as const,
      },
      {
        type: 'input' as const,
        block_id: 'event_rating',
        label: {
          type: 'plain_text' as const,
          text: 'Hvordan vil du vurdere arrangementet?',
        },
        element: {
          type: 'static_select' as const,
          action_id: 'rating_select',
          placeholder: {
            type: 'plain_text' as const,
            text: 'Velg en vurdering',
          },
          options: [
            {
              text: {
                type: 'plain_text' as const,
                text: '⭐⭐⭐⭐⭐ Utmerket',
                emoji: true,
              },
              value: '5',
            },
            {
              text: {
                type: 'plain_text' as const,
                text: '⭐⭐⭐⭐ Veldig bra',
                emoji: true,
              },
              value: '4',
            },
            {
              text: {
                type: 'plain_text' as const,
                text: '⭐⭐⭐ Bra',
                emoji: true,
              },
              value: '3',
            },
            {
              text: {
                type: 'plain_text' as const,
                text: '⭐⭐ Ok',
                emoji: true,
              },
              value: '2',
            },
            {
              text: {
                type: 'plain_text' as const,
                text: '⭐ Dårlig',
                emoji: true,
              },
              value: '1',
            },
          ],
        },
      },
      {
        type: 'input' as const,
        block_id: 'event_comment',
        optional: true,
        label: {
          type: 'plain_text' as const,
          text: 'Tilbakemelding (valgfritt)',
        },
        element: {
          type: 'plain_text_input' as const,
          action_id: 'comment_input',
          multiline: true,
          placeholder: {
            type: 'plain_text' as const,
            text: 'Fortell oss hva du synes om arrangementet...',
          },
        },
      },
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: '💡 Dette er en rask vurdering. Du kan gi mer detaljert tilbakemelding til foredragsholderne via nettsiden senere.',
          },
        ],
      },
    ],
  }
}

export function buildFeedbackSuccessMessage(
  event: Event,
  eventSlug: string,
  rating: number,
  fullFeedbackUrl: string
): string {
  const stars = '⭐'.repeat(rating)
  return [
    `Takk for tilbakemeldingen! ${stars}`,
    '',
    `Din vurdering av *${event.title}* er mottatt.`,
    '',
    `Vil du gi mer detaljert tilbakemelding til foredragsholderne? <${fullFeedbackUrl}|Gå til full tilbakemelding> 📝`,
  ].join('\n')
}

export function buildFeedbackErrorMessage(errorMessage: string): string {
  return `❌ Kunne ikke sende tilbakemelding: ${errorMessage}`
}
