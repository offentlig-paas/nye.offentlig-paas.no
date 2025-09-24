import { NextRequest, NextResponse } from 'next/server'
import { eventRegistrationService } from '@/domains/event-registration'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import { getDetailedEventInfoFromSlug } from '@/lib/events/helpers'
import { getUniqueCleanedOrganizations } from '@/lib/organization-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}`,
    'GET',
    slug
  )

  if (!authResult.success) return authResult.response

  try {
    const registrations =
      await eventRegistrationService.getEventRegistrations(slug)
    const eventInfo = getDetailedEventInfoFromSlug(slug)
    const eventRegistrations = registrations || []

    const uniqueOrganisations = getUniqueCleanedOrganizations(
      eventRegistrations.map(r => r.organisation)
    ).size

    const statusStats =
      eventRegistrations.length > 0
        ? await eventRegistrationService.getEventRegistrationStats(slug)
        : { confirmed: 0, attended: 0, cancelled: 0, pending: 0 }

    return NextResponse.json(
      {
        title: eventInfo.title,
        date: eventInfo.date,
        location: eventInfo.location,
        ingress: authResult.auth.event.ingress,
        description: authResult.auth.event.description,
        audience: authResult.auth.event.audience,
        price: authResult.auth.event.price,
        startTime: authResult.auth.event.start.toISOString(),
        endTime: authResult.auth.event.end.toISOString(),
        registrationUrl: authResult.auth.event.registrationUrl,
        callForPapersUrl: authResult.auth.event.callForPapersUrl,
        recordingUrl: authResult.auth.event.recordingUrl,
        organizers: authResult.auth.event.organizers,
        schedule: authResult.auth.event.schedule,
        eventStats: authResult.auth.event.stats,
        registration: authResult.auth.event.registration,
        registrations: eventRegistrations.map(reg => ({
          _id: reg._id,
          name: reg.name,
          email: reg.email,
          organisation: reg.organisation,
          dietary: reg.dietary,
          comments: reg.comments,
          attendanceType: reg.attendanceType,
          registeredAt: reg.registeredAt.toISOString(),
          status: reg.status,
        })),
        stats: {
          totalRegistrations: eventRegistrations.length,
          uniqueOrganisations,
          statusBreakdown: statusStats,
          activeRegistrations: statusStats.confirmed + statusStats.attended,
        },
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
    console.error('Admin event details fetch error:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av fagdagdata' },
      { status: 500 }
    )
  }
}
