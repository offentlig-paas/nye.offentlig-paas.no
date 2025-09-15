import { NextRequest, NextResponse } from 'next/server'
import { eventRegistrationService } from '@/domains/event-registration'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import type { RegistrationStatus } from '@/domains/event-registration/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/registrations/${id}/status`,
    'PATCH',
    slug,
    { registrationId: id }
  )

  if (!authResult.success) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const { status } = body

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

    // Update registration status
    const updatedRegistration =
      await eventRegistrationService.updateRegistrationStatus(id, status)

    return NextResponse.json(
      {
        registration: updatedRegistration,
        message: 'Status oppdatert',
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
    console.error('Status update error:', error)

    if (error instanceof Error && error.message === 'Registration not found') {
      return NextResponse.json(
        { error: 'Påmelding ikke funnet' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Feil ved oppdatering av status' },
      { status: 500 }
    )
  }
}
