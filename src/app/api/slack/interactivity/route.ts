import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { App, type BlockAction } from '@slack/bolt'
import { createHmac, timingSafeEqual } from 'crypto'
import { getEventBySlug } from '@/lib/events/helpers'
import { eventFeedbackService } from '@/domains/event-feedback/service'
import { eventRegistrationService } from '@/domains/event-registration/service'
import {
  buildFeedbackModal,
  buildFeedbackSuccessMessage,
  buildFeedbackErrorMessage,
} from '@/lib/slack/modals'
import { getAppUrl } from '@/server/lib/environment'

// Disable Next.js body parsing to preserve raw body for signature verification
export const runtime = 'nodejs'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET

if (!SLACK_BOT_TOKEN || !SLACK_SIGNING_SECRET) {
  const errorMsg = `Missing required Slack environment variables: ${!SLACK_BOT_TOKEN ? 'SLACK_BOT_TOKEN ' : ''}${!SLACK_SIGNING_SECRET ? 'SLACK_SIGNING_SECRET' : ''}`
  console.error(errorMsg)
  throw new Error(errorMsg)
}

const slackApp = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
})

slackApp.action('quick_feedback', async ({ ack, body, client }) => {
  await ack()

  try {
    const action = body as BlockAction
    const eventSlug =
      'message' in action && action.message?.metadata?.event_payload?.eventSlug

    if (!eventSlug) {
      throw new Error('Event slug not found in action payload')
    }

    const event = getEventBySlug(eventSlug)
    if (!event) {
      throw new Error(`Event not found: ${eventSlug}`)
    }

    const modal = buildFeedbackModal(event, eventSlug)

    await client.views.open({
      trigger_id: action.trigger_id,
      view: modal,
    })
  } catch (error) {
    console.error('Error opening feedback modal:', error)
  }
})

slackApp.view('feedback_submission', async ({ ack, body, view, client }) => {
  try {
    const privateMetadata = JSON.parse(view.private_metadata)
    const eventSlug = privateMetadata.eventSlug

    const event = getEventBySlug(eventSlug)
    if (!event) {
      await ack({
        response_action: 'errors',
        errors: {
          event_rating: 'Arrangementet ble ikke funnet',
        },
      })
      return
    }

    const viewState = view.state.values
    const userId = body.user.id

    const registration =
      await eventRegistrationService.getRegistrationBySlackUserId(
        eventSlug,
        userId
      )

    if (!registration || registration.status !== 'attended') {
      await ack({
        response_action: 'errors',
        errors: {
          event_rating:
            'Du må ha deltatt på arrangementet for å gi tilbakemelding',
        },
      })
      return
    }

    const ratingValue =
      viewState.event_rating?.rating_select?.selected_option?.value

    if (!ratingValue) {
      await ack({
        response_action: 'errors',
        errors: {
          event_rating: 'Vennligst velg en vurdering',
        },
      })
      return
    }

    const selectedRating = parseInt(ratingValue, 10)

    const eventComment =
      viewState.event_comment?.comment_input?.value || undefined

    // Check for existing feedback before acknowledging
    const existingFeedback = await eventFeedbackService.getUserFeedback(
      eventSlug,
      userId
    )

    // Always acknowledge immediately to close the modal
    await ack()

    // If user already submitted, just return - they already got their success DM
    if (existingFeedback) {
      return
    }

    // Do the work asynchronously after acknowledging
    setImmediate(async () => {
      try {
        await eventFeedbackService.submitQuickFeedback(
          {
            eventSlug,
            slackUserId: userId,
            eventRating: selectedRating,
            eventComment,
          },
          registration
        )

        const { url } = getAppUrl()
        const fullFeedbackUrl = `${url}/fagdag/${eventSlug}/tilbakemelding`

        const successMessage = buildFeedbackSuccessMessage(
          event,
          eventSlug,
          selectedRating,
          fullFeedbackUrl
        )

        await client.chat.postMessage({
          channel: userId,
          text: successMessage,
        })
      } catch (asyncError) {
        console.error('Error in async feedback processing:', asyncError)

        try {
          let errorMessage = 'Ukjent feil'
          if (asyncError instanceof Error) {
            if (asyncError.message === 'ALREADY_SUBMITTED_QUICK') {
              errorMessage =
                'Du har allerede gitt en rask vurdering. Du kan gi mer detaljert tilbakemelding via nettsiden.'
            } else if (asyncError.message === 'ALREADY_SUBMITTED_FULL') {
              errorMessage =
                'Du har allerede gitt full tilbakemelding for dette arrangementet.'
            } else {
              errorMessage = asyncError.message
            }
          }

          await client.chat.postMessage({
            channel: userId,
            text: buildFeedbackErrorMessage(errorMessage),
          })
        } catch (chatError) {
          console.error('Error sending error message:', chatError)
        }
      }
    })
  } catch (error) {
    // This catch is only for errors before ack() is called
    console.error('Error before acknowledgment:', error)

    // If we haven't acked yet, we need to handle the error properly
    // If ack was already called, this won't do anything
  }
})

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-slack-signature')
    const timestamp = request.headers.get('x-slack-request-timestamp')

    if (!signature || !timestamp) {
      console.error('Missing Slack headers:', {
        signature: !!signature,
        timestamp: !!timestamp,
      })
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verify request signature
    if (!verifySlackRequest(rawBody, signature, timestamp)) {
      console.error('Slack signature verification failed', {
        timestampAge: Math.floor(Date.now() / 1000) - parseInt(timestamp, 10),
        bodyLength: rawBody.length,
        bodyPreview: rawBody.substring(0, 100),
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    let payload: string | undefined

    if (rawBody.startsWith('payload=')) {
      payload = decodeURIComponent(rawBody.substring('payload='.length))
    } else {
      payload = rawBody
    }

    const parsedPayload = JSON.parse(payload)

    let ackResponse: unknown

    await slackApp.processEvent({
      body: parsedPayload,
      ack: async (response?: unknown) => {
        ackResponse = response
        return response
      },
    } as Parameters<typeof slackApp.processEvent>[0])

    // Return the acknowledgment response
    // For successful modal submissions, Slack expects an empty response or {}
    // For errors, return the response_action object
    if (ackResponse !== undefined && typeof ackResponse === 'object') {
      return NextResponse.json(ackResponse)
    }

    // Empty JSON object for successful acknowledgment
    return NextResponse.json({})
  } catch (error) {
    console.error('Error processing Slack interaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function verifySlackRequest(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  if (!SLACK_SIGNING_SECRET) {
    console.error('SLACK_SIGNING_SECRET not configured')
    return false
  }

  // Reject old requests (older than 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000)
  const requestTime = parseInt(timestamp, 10)
  if (Math.abs(currentTime - requestTime) > 60 * 5) {
    console.error('Request timestamp too old', {
      currentTime,
      requestTime,
      diff: Math.abs(currentTime - requestTime),
    })
    return false
  }

  // Create signature base string
  const sigBasestring = `v0:${timestamp}:${body}`

  // Create HMAC SHA256 hash
  const hmac = createHmac('sha256', SLACK_SIGNING_SECRET)
  hmac.update(sigBasestring)
  const computedSignature = `v0=${hmac.digest('hex')}`

  // Compare signatures using timing-safe comparison
  try {
    const isValid = timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature)
    )

    if (!isValid) {
      console.error('Signature mismatch', {
        received: signature.substring(0, 20) + '...',
        computed: computedSignature.substring(0, 20) + '...',
      })
    }

    return isValid
  } catch (error) {
    console.error('Signature comparison failed', error)
    return false
  }
}
