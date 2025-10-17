import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sanityClient } from '@/lib/sanity/config'
import { canUserAccessEvent, getEvent } from '@/lib/events/helpers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const eventSlug = formData.get('eventSlug') as string

    if (!eventSlug) {
      return NextResponse.json(
        { message: 'Missing eventSlug' },
        { status: 400 }
      )
    }

    const event = getEvent(eventSlug)
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 })
    }

    const hasAccess = canUserAccessEvent(event, session.user)
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { message: 'No files provided' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer()
        const asset = await sanityClient.assets.upload(
          'image',
          Buffer.from(buffer),
          {
            filename: file.name,
          }
        )

        const doc = {
          _type: 'eventPhoto',
          eventSlug,
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
          uploadedAt: new Date().toISOString(),
          uploadedBy: session.user.slackId,
          order: 0,
        }

        const result = await sanityClient.create(doc)
        results.push(result)
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error)
        errors.push({ filename: file.name, error: String(error) })
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: 'Upload failed', error: String(error) },
      { status: 500 }
    )
  }
}
