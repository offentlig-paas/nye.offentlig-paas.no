import { NextRequest, NextResponse } from 'next/server'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import {
  getTalkAttachments,
  deleteTalkAttachment,
  getTalkAttachmentById,
  getEventAttachments,
} from '@/lib/sanity/talk-attachments'
import { AttachmentType } from '@/lib/events/types'
import {
  handleFileUpload,
  handleUrlAttachment,
} from '@/lib/services/talk-attachment-service'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/talk-attachments`,
    'GET',
    slug
  )

  if (!authResult.success) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const talkTitle = searchParams.get('talkTitle')

    const attachments = talkTitle
      ? await getTalkAttachments(slug, talkTitle)
      : await getEventAttachments(slug)

    return NextResponse.json({ attachments })
  } catch (error) {
    console.error('Error fetching talk attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/talk-attachments`,
    'POST',
    slug
  )

  if (!authResult.success) {
    return authResult.response
  }

  const { auth } = authResult

  try {
    if (!auth.user.slackId) {
      return NextResponse.json(
        { error: 'User Slack ID not found' },
        { status: 400 }
      )
    }

    const contentType = request.headers.get('content-type')

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const talkTitle = formData.get('talkTitle') as string
      const speakerSlackId = formData.get('speakerSlackId') as string
      const title = formData.get('title') as string | null
      const type =
        (formData.get('type') as AttachmentType) || AttachmentType.Slides

      if (!file || !talkTitle || !speakerSlackId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const result = await handleFileUpload({
        file: buffer,
        filename: file.name,
        mimeType: file.type,
        eventSlug: slug,
        talkTitle,
        speakerSlackId,
        title: title || file.name,
        type,
        uploadedBy: auth.user.slackId,
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json(
        { attachment: result.attachment },
        { status: 201 }
      )
    } else {
      const body = await request.json()
      const { talkTitle, speakerSlackId, title, url, type } = body

      if (!talkTitle || !speakerSlackId || !url || !type) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const result = await handleUrlAttachment({
        eventSlug: slug,
        talkTitle,
        speakerSlackId,
        title,
        url,
        type,
        uploadedBy: auth.user.slackId,
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json(
        { attachment: result.attachment },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Error creating talk attachment:', error)
    return NextResponse.json(
      { error: 'Failed to create attachment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const authResult = await authorizeEventAccess(
    request,
    `/api/admin/events/${slug}/talk-attachments`,
    'DELETE',
    slug
  )

  if (!authResult.success) {
    return authResult.response
  }

  try {
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

    if (attachment.eventSlug !== slug) {
      return NextResponse.json(
        { error: 'Attachment does not belong to this event' },
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
