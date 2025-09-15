import { NextRequest, NextResponse } from 'next/server'
import { eventRegistrationService } from '@/domains/event-registration'
import { getAllEvents, canUserAccessEvent } from '@/lib/events/helpers'
import { AuthMiddleware } from '@/lib/api/auth-middleware'

export async function GET(request: NextRequest) {
  const authResult = await AuthMiddleware.requireAuthentication(request, {
    endpoint: '/api/admin/events',
    method: 'GET',
  })

  if (!authResult.success) {
    return authResult.response
  }

  const { auth } = authResult
  // Non-admins need to be checked for organizer access per event
  const isAdmin = auth.user.isAdmin || false

  try {
    // Get all events from events.ts
    const allEvents = getAllEvents()

    // Get all registrations grouped by event to add registration data
    const registrationsByEvent =
      await eventRegistrationService.getRegistrationsByEvent()

    // Transform into events list with comprehensive stats
    const eventsWithStats = allEvents.map(event => {
      // Get registrations for this event (try different slug formats)
      const eventRegistrations = registrationsByEvent[event.slug] || []
      const registrations = Array.isArray(eventRegistrations)
        ? eventRegistrations
        : []

      // Calculate registration metrics
      const totalRegistrations = registrations.length
      const uniqueOrganisations = new Set(
        registrations.map(r => r.organisation)
      ).size

      // Extract key metrics from event data
      const organizerCount = event.organizers?.length || 0
      const scheduleItemCount = event.schedule?.length || 0
      const hasRecording = !!event.recordingUrl
      const hasCallForPapers = !!event.callForPapersUrl
      const feedbackRating = event.stats?.feedback?.averageRating
      const feedbackRespondents = event.stats?.feedback?.respondents || 0

      return {
        slug: event.slug,
        title: event.title,
        date: event.start.toLocaleDateString('nb-NO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        location: event.location,
        audience: event.audience,
        totalRegistrations,
        uniqueOrganisations,
        organizerCount,
        scheduleItemCount,
        hasRecording,
        hasCallForPapers,
        feedbackRating,
        feedbackRespondents,
        price: event.price,
        // Include stats from events.ts if available
        statsRegistrations: event.stats?.registrations,
        statsParticipants: event.stats?.participants,
        statsOrganisations: event.stats?.organisations,
      }
    })

    // Filter events based on user access rights
    const accessibleEvents = eventsWithStats.filter(eventData => {
      if (isAdmin) {
        return true // Admins can see all events
      }

      // Check if user is organizer of this event
      const event = allEvents.find(e => e.slug === eventData.slug)
      return event && canUserAccessEvent(event, auth.user)
    })

    // Calculate total stats based on accessible events
    const totalRegistrations = accessibleEvents.reduce(
      (sum, e) => sum + e.totalRegistrations,
      0
    )
    const uniqueOrganisations = new Set(
      accessibleEvents.flatMap(e =>
        (registrationsByEvent[e.slug] || []).map(r => r.organisation)
      )
    ).size

    // Sort events by date (newest first)
    const events = accessibleEvents.sort((a, b) => {
      const aEvent = allEvents.find(e => e.slug === a.slug)
      const bEvent = allEvents.find(e => e.slug === b.slug)
      return (bEvent?.start.getTime() || 0) - (aEvent?.start.getTime() || 0)
    })

    return NextResponse.json(
      {
        events,
        totalStats: {
          totalRegistrations,
          uniqueOrganisations,
          totalEvents: events.length,
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
    console.error('Admin events fetch error:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av fagdager' },
      { status: 500 }
    )
  }
}
