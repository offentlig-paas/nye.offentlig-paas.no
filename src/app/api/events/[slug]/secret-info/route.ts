import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEvent } from '@/lib/events/helpers'
import { getEventSecretInfo } from '@/lib/sanity/event-secret-info'
import { eventRegistrationService } from '@/domains/event-registration'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()

  if (!session?.user?.slackId) {
    return NextResponse.json(
      { error: 'Du må være logget inn' },
      { status: 401 }
    )
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

    if (!userRegistration) {
      return NextResponse.json(
        {
          error: 'Du må være påmeldt fagdagen for å få tilgang til denne informasjonen',
        },
        { status: 403 }
      )
    }

    const secretInfo = await getEventSecretInfo(slug)

    if (!secretInfo) {
      return NextResponse.json(
        { error: 'Ingen hemmelig informasjon tilgjengelig' },
        { status: 404 }
      )
    }

    return NextResponse.json(secretInfo, {
      headers: {
        'Cache-Control':
          'private, no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Error fetching secret info:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av hemmelig informasjon' },
      { status: 500 }
    )
  }
}
