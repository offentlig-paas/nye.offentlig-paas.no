import { NextRequest, NextResponse } from 'next/server'
import { eventRegistrationService } from '@/domains/event-registration'
import { getEventBySlug } from '@/lib/events/helpers'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const session = await auth()
    if (!session?.user?.slackId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const event = getEventBySlug(slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const isUserRegistered = await eventRegistrationService.isUserRegistered(
      slug,
      session.user.slackId
    )

    if (!isUserRegistered) {
      return NextResponse.json(
        { error: 'You must be registered for this event to view participants' },
        { status: 403 }
      )
    }

    const registrations =
      await eventRegistrationService.getEventRegistrations(slug)
    const activeRegistrations = registrations.filter(
      r => r.status === 'confirmed' || r.status === 'attended'
    )

    const participants = activeRegistrations.slice(0, 12).map(registration => ({
      name: registration.name,
      slackUserId: registration.slackUserId,
    }))

    return NextResponse.json({
      participants,
      totalCount: activeRegistrations.length,
    })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}
