import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  getTalkAttachments,
  createTalkAttachment,
  uploadTalkAttachmentFile,
  createTalkAttachmentWithFile,
  deleteTalkAttachment,
  getTalkAttachmentById,
} from '@/lib/sanity/talk-attachments'
import { getEventBySlug, isUserSpeakerForTalk } from '@/lib/events/helpers'
import { AttachmentType } from '@/lib/events/types'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventSlug = searchParams.get('eventSlug')
    const talkTitle = searchParams.get('talkTitle')

    if (!eventSlug || !talkTitle) {
      return NextResponse.json(
        { error: 'Missing eventSlug or talkTitle' },
        { status: 400 }
      )
    }

    const attachments = await getTalkAttachments(eventSlug, talkTitle)

    return NextResponse.json({ attachments })
  } catch (error) {
    console.error('Error fetching talk attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !session.user.slackId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type')

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const eventSlug = formData.get('eventSlug') as string
      const talkTitle = formData.get('talkTitle') as string
      const speakerSlackId = formData.get('speakerSlackId') as string
      const title = formData.get('title') as string | null
      const type =
        (formData.get('type') as AttachmentType) || AttachmentType.Slides

      if (!file || !eventSlug || !talkTitle || !speakerSlackId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const event = getEventBySlug(eventSlug)
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      if (!isUserSpeakerForTalk(event, talkTitle, session.user.slackId)) {
        return NextResponse.json(
          { error: 'Not authorized to upload for this talk' },
          { status: 403 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadResult = await uploadTalkAttachmentFile(
        buffer,
        file.name,
        file.type
      )

      if (!uploadResult) {
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        )
      }

      const attachment = await createTalkAttachmentWithFile(
        {
          eventSlug,
          talkTitle,
          speakerSlackId,
          title: title || file.name,
          type,
          uploadedBy: session.user.slackId,
        },
        uploadResult.assetId
      )

      if (!attachment) {
        return NextResponse.json(
          { error: 'Failed to create attachment' },
          { status: 500 }
        )
      }

      return NextResponse.json({ attachment }, { status: 201 })
    } else {
      const body = await request.json()
      const { eventSlug, talkTitle, speakerSlackId, title, url, type } = body

      if (!eventSlug || !talkTitle || !speakerSlackId || !url || !type) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const event = getEventBySlug(eventSlug)
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      if (!isUserSpeakerForTalk(event, talkTitle, session.user.slackId)) {
        return NextResponse.json(
          { error: 'Not authorized to add attachment for this talk' },
          { status: 403 }
        )
      }

      const attachment = await createTalkAttachment({
        eventSlug,
        talkTitle,
        speakerSlackId,
        title,
        url,
        type,
        uploadedBy: session.user.slackId,
      })

      if (!attachment) {
        return NextResponse.json(
          { error: 'Failed to create attachment' },
          { status: 500 }
        )
      }

      return NextResponse.json({ attachment }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating talk attachment:', error)
    return NextResponse.json(
      { error: 'Failed to create attachment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !session.user.slackId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('id')

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Missing attachment ID' },
        { status: 400 }
      )
    }

    const attachment = await getTalkAttachmentById(attachmentId)

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    const event = getEventBySlug(attachment.eventSlug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (
      !isUserSpeakerForTalk(event, attachment.talkTitle, session.user.slackId)
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this attachment' },
        { status: 403 }
      )
    }

    const success = await deleteTalkAttachment(attachmentId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete attachment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting talk attachment:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}
