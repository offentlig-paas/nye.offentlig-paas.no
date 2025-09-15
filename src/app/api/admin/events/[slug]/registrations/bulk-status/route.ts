import { NextRequest, NextResponse } from 'next/server'
import { eventRegistrationService } from '@/domains/event-registration'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import type { RegistrationStatus } from '@/domains/event-registration/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/registrations/bulk-status`,
    'PATCH',
    slug
  )

  if (!authResult.success) {
    return authResult.response
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
