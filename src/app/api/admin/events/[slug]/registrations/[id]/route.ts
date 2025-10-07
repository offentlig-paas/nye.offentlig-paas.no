import { NextRequest, NextResponse } from 'next/server'
import { eventRegistrationService } from '@/domains/event-registration'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/registrations/${id}`,
    'DELETE',
    slug,
    { registrationId: id }
  )

  if (!authResult.success) {
    return authResult.response
  }

  try {
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
