import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { canUserAccessEvent, getEvent } from '@/lib/events/helpers'
import {
  uploadEventPhoto,
  validateEventPhotoFile,
} from '@/lib/sanity/event-photos'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.slackId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
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
        const buffer = Buffer.from(await file.arrayBuffer())
        const validationError = validateEventPhotoFile(file, buffer)
        if (validationError) {
          errors.push({ filename: file.name, error: validationError })
          continue
        }

        const result = await uploadEventPhoto({
          eventSlug,
          buffer,
          filename: file.name,
          contentType: file.type,
          uploadedBy: session.user.slackId,
          order: 0,
        })
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
