import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEvent } from '@/lib/events/helpers'
import { getEventParticipantInfo } from '@/lib/sanity/event-participant-info'
import { eventRegistrationService } from '@/domains/event-registration'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user?.slackId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  try {
    const registrations =
      await eventRegistrationService.getEventRegistrations(slug)
    const userRegistration = registrations.find(
      r => r.slackUserId === session.user.slackId
    )

    if (!userRegistration) {
      return NextResponse.json(
        { error: 'Not registered for event' },
        { status: 403 }
      )
    }

    const participantInfo = await getEventParticipantInfo(slug)

    if (!participantInfo) {
      return NextResponse.json(
        { error: 'No participant info available' },
        { status: 404 }
      )
    }

    return NextResponse.json(participantInfo, {
      headers: {
        'Cache-Control':
          'private, no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Error fetching participant info:', error)
    return NextResponse.json(
      { error: 'Error fetching participant info' },
      { status: 500 }
    )
  }
}
