import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { eventRegistrationService } from '@/domains/event-registration'
import { getEventBySlug, canUserAccessEvent } from '@/lib/events/helpers'
import type { RegistrationStatus } from '@/domains/event-registration/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
  }

  const { slug } = await params

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
    const body = await request.json()
    const { ids, status } = body

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs må være en ikke-tom array' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses: RegistrationStatus[] = [
      'confirmed',
      'waitlist',
      'cancelled',
      'attended',
      'no-show',
    ]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            'Ugyldig status. Tillatte verdier: ' + validStatuses.join(', '),
        },
        { status: 400 }
      )
    }

    // Update registration statuses
    const updatedRegistrations =
      await eventRegistrationService.bulkUpdateStatus(ids, status)

    return NextResponse.json(
      {
        registrations: updatedRegistrations,
        message: `${updatedRegistrations.length} påmeldinger oppdatert`,
      },
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
    console.error('Bulk status update error:', error)
    return NextResponse.json(
      { error: 'Feil ved bulk-oppdatering av status' },
      { status: 500 }
    )
  }
}
