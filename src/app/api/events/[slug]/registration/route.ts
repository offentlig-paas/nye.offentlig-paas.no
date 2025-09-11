import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEvent } from '@/lib/events/helpers'
import { eventRegistrationService } from '@/domains/event-registration'

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
    const { comments, dietary, organisation, attendanceType } = body

    if (!attendanceType) {
      return NextResponse.json(
        { error: 'Attendance type is required' },
        { status: 400 }
      )
    }

    // Create registration with user data from session
    const registration = await eventRegistrationService.registerForEvent({
      eventSlug: slug,
      name: session.user.name,
      email: session.user.email,
      slackUserId: session.user.slackId,
      organisation: organisation || session.user.statusText || 'Ikke oppgitt',
      dietary,
      comments,
      attendanceType,
    })

    return NextResponse.json({
      message: 'Påmelding registrert!',
      registration,
    })
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
    // Find the user's registration
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

    // Cancel the registration
    await eventRegistrationService.cancelRegistration(userRegistration._id!)

    return NextResponse.json({
      message: 'Påmelding avmeldt!',
    })
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

  try {
    const isRegistered = await eventRegistrationService.isUserRegistered(
      slug,
      session.user.slackId
    )

    const registrationCount =
      await eventRegistrationService.getRegistrationCount(slug)

    return NextResponse.json(
      {
        isRegistered,
        registrationCount,
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
    console.error('Registration check error:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av påmelding' },
      { status: 500 }
    )
  }
}
