import { NextRequest, NextResponse } from 'next/server'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import { sendBulkDirectMessages } from '@/lib/slack/messaging'
import { extractSlackUserId } from '@/lib/slack/utils'
import { getAllEventAttachments } from '@/lib/events/attachment-helpers'
import { formatDateLong } from '@/lib/formatDate'
import type { Item } from '@/lib/events/types'

interface SpeakerTalks {
  speakerId: string
  talks: Array<{
    title: string
    time: string
    hasAttachments: boolean
  }>
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/nudge-speakers-bulk`,
    'POST',
    slug
  )

  if (!authResult.success) {
    return authResult.response
  }

  const { auth } = authResult

  try {
    const body = await request.json()
    const { onlyWithoutAttachments } = body

    const talksWithSpeakers = auth.event.schedule.filter(
      (item: Item) =>
        (item.type === 'Presentation' ||
          item.type === 'Panel' ||
          item.type === 'Workshop') &&
        item.speakers &&
        item.speakers.length > 0
    )

    if (talksWithSpeakers.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: 'No talks with speakers found',
      })
    }

    const allAttachments = await getAllEventAttachments(slug)

    const speakerTalksMap = new Map<string, SpeakerTalks>()

    for (const talk of talksWithSpeakers) {
      const hasAttachments = allAttachments.has(talk.title)

      if (onlyWithoutAttachments && hasAttachments) {
        continue
      }

      for (const speaker of talk.speakers || []) {
        if (!speaker.url) continue

        const speakerId = extractSlackUserId(speaker.url)
        if (!speakerId) continue

        if (!speakerTalksMap.has(speakerId)) {
          speakerTalksMap.set(speakerId, {
            speakerId,
            talks: [],
          })
        }

        speakerTalksMap.get(speakerId)!.talks.push({
          title: talk.title,
          time: talk.time,
          hasAttachments,
        })
      }
    }

    if (speakerTalksMap.size === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: onlyWithoutAttachments
          ? 'All speakers have uploaded presentations'
          : 'No speakers to notify',
      })
    }

    const eventDate = formatDateLong(auth.event.start)
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://offentlig-paas.no'
    const profileUrl = `${baseUrl}/profil`

    const organizerNames = auth.event.organizers
      .map(org => org.name.split(' ')[0])
      .join(', ')
      .replace(/,([^,]*)$/, ' og$1')

    const speakerMessages: Array<{ speakerId: string; message: string }> = []

    for (const [speakerId, speakerTalks] of speakerTalksMap.entries()) {
      const multipleTalks = speakerTalks.talks.length > 1
      const allHaveAttachments = speakerTalks.talks.every(t => t.hasAttachments)
      const someHaveAttachments = speakerTalks.talks.some(t => t.hasAttachments)

      let talksList = ''
      if (multipleTalks) {
        talksList = speakerTalks.talks
          .map(t => `\n• "${t.title}" - ${t.time}`)
          .join('')
      } else {
        const talk = speakerTalks.talks[0]!
        talksList = `"${talk.title}"\n📅 ${talk.time}`
      }

      let attachmentNote = ''
      if (allHaveAttachments) {
        attachmentNote =
          '\n✅ Vi ser at du allerede har lastet opp presentasjon, takk!'
      } else if (someHaveAttachments && multipleTalks) {
        attachmentNote = `\n📊 Vi ser at du har lastet opp presentasjon for noen foredrag. Husk å laste opp for de andre også på ${profileUrl}`
      } else {
        attachmentNote = `\n📊 Hvis du har en presentasjon kan du laste den opp på ${profileUrl}`
      }

      const message = multipleTalks
        ? `Hei! 👋

Påminnelse om at du holder ${speakerTalks.talks.length} foredrag på ${auth.event.title} ${eventDate}:${talksList}

📍 ${auth.event.location}${attachmentNote}

Mvh ${organizerNames}`
        : `Hei! 👋

Påminnelse om at du holder foredraget ${talksList} på ${auth.event.title} ${eventDate}.

📍 ${auth.event.location}${attachmentNote}

Mvh ${organizerNames}`

      speakerMessages.push({ speakerId, message })
    }

    const speakerIds = speakerMessages.map(sm => sm.speakerId)

    const results = await Promise.all(
      speakerMessages.map(({ speakerId, message }) =>
        sendBulkDirectMessages([speakerId], message)
      )
    )

    const totalSent = results.reduce((sum, r) => sum + r.sent, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)

    return NextResponse.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      speakerIds,
    })
  } catch (error) {
    console.error('Error sending bulk speaker nudge:', error)
    return NextResponse.json({ error: 'Failed to send nudge' }, { status: 500 })
  }
}
