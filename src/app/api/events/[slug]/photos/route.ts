import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  canUserAccessEvent,
  getEvent,
  getStatus,
  isUserEventSpeaker,
} from '@/lib/events/helpers'
import { Status } from '@/lib/events/types'
import { eventRegistrationService } from '@/domains/event-registration'
import {
  getEventPhotoCountByUser,
  MAX_PARTICIPANT_PHOTOS_PER_EVENT,
  uploadEventPhoto,
  validateEventPhotoFile,
} from '@/lib/sanity/event-photos'

const MAX_FILES_PER_REQUEST = 5
const MAX_CAPTION_LENGTH = 200

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.slackId) {
      return NextResponse.json({ message: 'Ikke autentisert' }, { status: 401 })
    }

    const { slug } = await params
    const event = getEvent(slug)
    if (!event) {
      return NextResponse.json(
        { message: 'Fagdag ikke funnet' },
        { status: 404 }
      )
    }

    if (getStatus(event) === Status.Upcoming) {
      return NextResponse.json(
        { message: 'Bildeopplasting åpner når fagdagen starter' },
        { status: 400 }
      )
    }

    const userSlackId = session.user.slackId
    const isOrganizerOrAdmin = canUserAccessEvent(event, session.user)
    const isSpeaker = isUserEventSpeaker(event, userSlackId)

    if (!isOrganizerOrAdmin && !isSpeaker) {
      const registration =
        await eventRegistrationService.getRegistrationBySlackUserId(
          slug,
          userSlackId
        )
      if (
        !registration ||
        (registration.status !== 'confirmed' &&
          registration.status !== 'attended')
      ) {
        return NextResponse.json(
          { message: 'Kun deltakere kan laste opp bilder' },
          { status: 403 }
        )
      }
    }

    const formData = await request.formData()
    const rawCaption = formData.get('caption')
    const caption =
      typeof rawCaption === 'string' && rawCaption.trim().length > 0
        ? rawCaption.trim().slice(0, MAX_CAPTION_LENGTH)
        : undefined

    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { message: 'Ingen filer valgt' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          message: `Du kan laste opp maks ${MAX_FILES_PER_REQUEST} bilder om gangen`,
        },
        { status: 400 }
      )
    }

    if (!isOrganizerOrAdmin) {
      const existingCount = await getEventPhotoCountByUser(slug, userSlackId)
      if (existingCount + files.length > MAX_PARTICIPANT_PHOTOS_PER_EVENT) {
        return NextResponse.json(
          {
            message: `Du kan laste opp maks ${MAX_PARTICIPANT_PHOTOS_PER_EVENT} bilder per fagdag`,
          },
          { status: 400 }
        )
      }
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
          eventSlug: slug,
          buffer,
          filename: file.name,
          contentType: file.type,
          uploadedBy: userSlackId,
          caption,
          order: 100,
        })
        results.push(result)
      } catch (error) {
        console.error(`Participant photo upload error for ${file.name}:`, error)
        errors.push({ filename: file.name, error: 'Opplasting feilet' })
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { message: errors[0]?.error || 'Opplasting feilet', errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: results.length,
        failed: errors.length,
        results,
        errors,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Participant photo upload error:', error)
    return NextResponse.json({ message: 'Opplasting feilet' }, { status: 500 })
  }
}
