import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPhotosByEventAndSpeaker } from '@/lib/sanity/event-photos'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const eventSlug = searchParams.get('eventSlug')
  const speakerName = searchParams.get('speakerName')

  if (!eventSlug || !speakerName) {
    return NextResponse.json(
      { error: 'Missing eventSlug or speakerName' },
      { status: 400 }
    )
  }

  try {
    const photos = await getPhotosByEventAndSpeaker(eventSlug, speakerName)
    return NextResponse.json(photos)
  } catch (error) {
    console.error('Error fetching photos by speaker:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}
