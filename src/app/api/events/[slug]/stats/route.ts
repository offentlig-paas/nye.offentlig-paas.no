import { NextRequest, NextResponse } from 'next/server'
import { getEvent } from '@/lib/events/helpers'
import { eventRegistrationService } from '@/domains/event-registration'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const event = getEvent(slug)

  if (!event) {
    return NextResponse.json({ error: 'Fagdag ikke funnet' }, { status: 404 })
  }

  try {
    const registrationCounts =
      await eventRegistrationService.getRegistrationCountsByCategory(slug)

    return NextResponse.json(
      {
        registrationCounts,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching registration stats:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av statistikk' },
      { status: 500 }
    )
  }
}
