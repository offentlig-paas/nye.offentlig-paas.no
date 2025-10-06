import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEvent } from '@/lib/events/helpers'
import {
  getEventParticipantInfo,
  upsertEventParticipantInfo,
} from '@/lib/sanity/event-participant-info'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  try {
    const participantInfo = await getEventParticipantInfo(slug)
    return NextResponse.json(participantInfo || {})
  } catch (error) {
    console.error('Error fetching participant info:', error)
    return NextResponse.json(
      { error: 'Error fetching participant info' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { streamingUrl, notes } = body

    const result = await upsertEventParticipantInfo(slug, {
      streamingUrl,
      notes,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update participant info' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating participant info:', error)
    return NextResponse.json(
      { error: 'Error updating participant info' },
      { status: 500 }
    )
  }
}
