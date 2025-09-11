import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { eventRegistrationService } from '@/domains/event-registration'
import { getEventBySlug, canUserAccessEvent } from '@/lib/events/helpers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth()

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
  }

  const { slug, id } = await params

  // Get the event to check organizer access
  const event = getEventBySlug(slug)
  if (!event) {
    return NextResponse.json({ error: 'Fagdag ikke funnet' }, { status: 404 })
  }

  // Check if user is admin or organizer of this event
  if (!canUserAccessEvent(event, session.user)) {
    return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 403 })
  }

  try {
    // Delete the registration
    await eventRegistrationService.deleteRegistration(id)

    return NextResponse.json(
      { message: 'Påmelding slettet' },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Admin registration delete error:', error)
    return NextResponse.json(
      { error: 'Feil ved sletting av påmelding' },
      { status: 500 }
    )
  }
}
