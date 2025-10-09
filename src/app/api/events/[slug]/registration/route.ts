import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getEvent } from '@/lib/events/helpers'
import { eventRegistrationService } from '@/domains/event-registration'
import type {
  EventRegistrationResponse,
  Registration,
} from '@/types/api/registration'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user || !session?.user?.email || !session?.user?.name) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
  }

  if (!session.user.slackId) {
    return NextResponse.json(
      { error: 'Slack ID not found in session' },
      { status: 400 }
    )
  }

  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    return NextResponse.json({ error: 'Fagdag ikke funnet' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const {
      comments,
      dietary,
      organisation,
      attendanceType,
      attendingSocialEvent,
    } = body

    if (!attendanceType) {
      return NextResponse.json(
        { error: 'Attendance type is required' },
        { status: 400 }
      )
    }

    const registration = await eventRegistrationService.registerForEvent({
      eventSlug: slug,
      name: session.user.name,
      email: session.user.email,
      slackUserId: session.user.slackId,
      organisation: organisation || session.user.statusText || 'Ikke oppgitt',
      dietary,
      comments,
      attendanceType,
      attendingSocialEvent,
    })

    revalidatePath(`/fagdag/${slug}`)
    revalidatePath('/profil')

    return NextResponse.json(
      {
        message: 'Påmelding registrert!',
        registration,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Du er allerede påmeldt denne fagdagen' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Feil ved påmelding' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user?.slackId) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const registration =
      await eventRegistrationService.getEventRegistrations(slug)
    const userRegistration = registration.find(
      r => r.slackUserId === session.user.slackId
    )

    if (!userRegistration) {
      return NextResponse.json(
        { error: 'Du er ikke påmeldt denne fagdagen' },
        { status: 404 }
      )
    }

    await eventRegistrationService.cancelRegistration(userRegistration._id!)

    revalidatePath(`/fagdag/${slug}`)
    revalidatePath('/profil')

    return NextResponse.json(
      {
        message: 'Påmelding avmeldt!',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Cancellation error:', error)
    return NextResponse.json({ error: 'Feil ved avmelding' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user?.slackId) {
    return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
  }

  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    return NextResponse.json({ error: 'Fagdag ikke funnet' }, { status: 404 })
  }

  try {
    const registrations =
      await eventRegistrationService.getEventRegistrations(slug)
    const userRegistration = registrations.find(
      r => r.slackUserId === session.user.slackId
    )

    const registrationStatus = userRegistration?.status || null

    const registrationCounts =
      await eventRegistrationService.getRegistrationCountsByCategory(slug)

    // Get active registrations for stats
    const activeRegistrations = registrations.filter(
      r => r.status === 'confirmed' || r.status === 'attended'
    )

    // Build consolidated stats object
    const stats = {
      total: activeRegistrations.length,
      persons: registrationCounts.persons,
      organizations: registrationCounts.organizations,
      uniqueOrganizations: registrationCounts.uniqueOrganizations,
      participants:
        registrationStatus === 'confirmed' || registrationStatus === 'attended'
          ? activeRegistrations.slice(0, 12).map(registration => ({
              name: registration.name,
              slackUserId: registration.slackUserId,
            }))
          : [],
    }

    // Get participant info if actively registered
    let participantInfo = null
    if (
      registrationStatus === 'confirmed' ||
      registrationStatus === 'attended'
    ) {
      const { getEventParticipantInfo } = await import(
        '@/lib/sanity/event-participant-info'
      )
      participantInfo = await getEventParticipantInfo(slug)
    }

    const responseData: EventRegistrationResponse = {
      registrationStatus,
      registration: userRegistration
        ? (userRegistration as unknown as Registration)
        : null,
      stats,
      participantInfo,
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Registration check error:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av påmelding' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user?.slackId) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const registration =
      await eventRegistrationService.getEventRegistrations(slug)
    const userRegistration = registration.find(
      r => r.slackUserId === session.user.slackId
    )

    if (!userRegistration) {
      return NextResponse.json(
        { error: 'Du er ikke påmeldt denne fagdagen' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { attendingSocialEvent, attendanceType, comments } = body

    await eventRegistrationService.updateRegistration(userRegistration._id!, {
      attendingSocialEvent,
      attendanceType,
      comments,
    })

    revalidatePath(`/fagdag/${slug}`)
    revalidatePath('/profil')

    return NextResponse.json(
      {
        message: 'Påmelding oppdatert!',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Feil ved oppdatering av påmelding' },
      { status: 500 }
    )
  }
}
