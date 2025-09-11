import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { eventRegistrationService } from '@/domains/event-registration'
import {
  getDetailedEventInfoFromSlug,
  getEventBySlug,
  canUserAccessEvent,
} from '@/lib/events/helpers'

export async function GET(
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
        ingress: event.ingress,
        description: event.description,
        audience: event.audience,
        price: event.price,
        startTime: event.start.toISOString(),
        endTime: event.end.toISOString(),
        registrationUrl: event.registrationUrl,
        callForPapersUrl: event.callForPapersUrl,
        recordingUrl: event.recordingUrl,
        organizers: event.organizers,
        schedule: event.schedule,
        eventStats: event.stats,
        registrations: eventRegistrations.map(reg => ({
          _id: reg._id,
          name: reg.name,
          email: reg.email,
          organisation: reg.organisation,
          dietary: reg.dietary,
          comments: reg.comments,
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
