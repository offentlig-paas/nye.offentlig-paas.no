import { NextRequest, NextResponse } from 'next/server'
import { eventRegistrationService } from '@/domains/event-registration'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import { getDetailedEventInfoFromSlug } from '@/lib/events/helpers'

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

  if (!authResult.success) {
    return authResult.response
  }

  const { auth } = authResult

  try {
    // Get registrations for specific event
    const registrations =
      await eventRegistrationService.getEventRegistrations(slug)

    // Get event info
    const eventInfo = getDetailedEventInfoFromSlug(slug)

    // Handle events with no registrations
    const eventRegistrations = registrations || []
    const uniqueOrganisations = new Set(
      eventRegistrations.map(r => r.organisation)
    ).size

    // Get stats - if no registrations, provide empty stats
    let statusStats
    if (eventRegistrations.length > 0) {
      statusStats =
        await eventRegistrationService.getEventRegistrationStats(slug)
    } else {
      statusStats = {
        confirmed: 0,
        attended: 0,
        cancelled: 0,
        pending: 0,
      }
    }

    return NextResponse.json(
      {
        title: eventInfo.title,
        date: eventInfo.date,
        location: eventInfo.location,
        // Additional event details from events.ts
        ingress: auth.event.ingress,
        description: auth.event.description,
        audience: auth.event.audience,
        price: auth.event.price,
        startTime: auth.event.start.toISOString(),
        endTime: auth.event.end.toISOString(),
        registrationUrl: auth.event.registrationUrl,
        callForPapersUrl: auth.event.callForPapersUrl,
        recordingUrl: auth.event.recordingUrl,
        organizers: auth.event.organizers,
        schedule: auth.event.schedule,
        eventStats: auth.event.stats,
        registration: auth.event.registration,
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
