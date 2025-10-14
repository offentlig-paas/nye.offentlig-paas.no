import { NextRequest, NextResponse } from 'next/server'
import { Audience, AttendanceType, AttachmentType } from '@/lib/events/types'
import type { EventAuthContext } from '@/lib/api/auth-middleware'
import type { Session } from 'next-auth'

jest.mock('@/auth')
jest.mock('@/lib/api/auth-middleware')
jest.mock('@/lib/sanity/talk-attachments')

import { GET, POST, DELETE } from '../route'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import {
  getTalkAttachments,
  getEventAttachments,
  createTalkAttachment,
  deleteTalkAttachment,
  getTalkAttachmentById,
} from '@/lib/sanity/talk-attachments'

describe('Admin Talk Attachments API', () => {
  const mockAuthorizeEventAccess = authorizeEventAccess as jest.MockedFunction<
    typeof authorizeEventAccess
  >
  const mockGetTalkAttachments = getTalkAttachments as jest.MockedFunction<
    typeof getTalkAttachments
  >
  const mockGetEventAttachments = getEventAttachments as jest.MockedFunction<
    typeof getEventAttachments
  >
  const mockCreateTalkAttachment = createTalkAttachment as jest.MockedFunction<
    typeof createTalkAttachment
  >
  const mockDeleteTalkAttachment = deleteTalkAttachment as jest.MockedFunction<
    typeof deleteTalkAttachment
  >
  const mockGetTalkAttachmentById =
    getTalkAttachmentById as jest.MockedFunction<typeof getTalkAttachmentById>

  const mockAuthResult: { success: true; auth: EventAuthContext } = {
    success: true as const,
    auth: {
      user: {
        id: 'user-123',
        slackId: 'U123456',
        name: 'Test Organizer',
        email: 'organizer@example.com',
        isAdmin: false,
      },
      session: {
        user: { name: 'Test Organizer', email: 'organizer@example.com' },
        expires: '2025-12-31',
      } as Session,
      event: {
        slug: 'test-event',
        title: 'Test Event',
        ingress: 'Test ingress',
        start: new Date('2025-10-15'),
        end: new Date('2025-10-15'),
        location: 'Test Location',
        audience: Audience.OpenForAll,
        organizers: [
          {
            name: 'Test Organizer',
            org: 'Test Org',
            url: 'https://slack.com/team/U123456',
          },
        ],
        schedule: [],
        registration: {
          disabled: false,
          attendanceTypes: [AttendanceType.Physical],
        },
      },
      slug: 'test-event',
    },
  }

  const mockTalkAttachment = {
    id: 'attachment-1',
    eventSlug: 'test-event',
    talkTitle: 'Test Talk',
    speakerSlackId: 'U789012',
    title: 'Test Slides',
    url: 'https://example.com/slides.pdf',
    fileUrl: 'https://cdn.sanity.io/files/project/dataset/slides.pdf',
    type: AttachmentType.Slides,
    uploadedAt: '2025-10-13T10:00:00Z',
    uploadedBy: 'U123456',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/events/[slug]/talk-attachments', () => {
    it('should return attachments for a specific talk', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockGetTalkAttachments.mockResolvedValue([mockTalkAttachment])

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments?talkTitle=Test%20Talk'
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await GET(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.attachments).toHaveLength(1)
      expect(data.attachments[0]).toEqual(mockTalkAttachment)
      expect(mockGetTalkAttachments).toHaveBeenCalledWith(
        'test-event',
        'Test Talk'
      )
    })

    it('should return all attachments for an event', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockGetEventAttachments.mockResolvedValue([mockTalkAttachment])

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments'
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await GET(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.attachments).toHaveLength(1)
      expect(mockGetEventAttachments).toHaveBeenCalledWith('test-event')
    })

    it('should return 401 when not authenticated', async () => {
      mockAuthorizeEventAccess.mockResolvedValue({
        success: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments'
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await GET(request, context)

      expect(response.status).toBe(401)
    })

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockGetEventAttachments.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments'
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await GET(request, context)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch attachments')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching talk attachments:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('POST /api/admin/events/[slug]/talk-attachments', () => {
    it('should create attachment with URL', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockCreateTalkAttachment.mockResolvedValue(mockTalkAttachment)

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            talkTitle: 'Test Talk',
            speakerSlackId: 'U789012',
            title: 'Test Slides',
            url: 'https://example.com/slides.pdf',
            type: AttachmentType.Slides,
          }),
        }
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.attachment).toEqual(mockTalkAttachment)
      expect(mockCreateTalkAttachment).toHaveBeenCalledWith({
        eventSlug: 'test-event',
        talkTitle: 'Test Talk',
        speakerSlackId: 'U789012',
        title: 'Test Slides',
        url: 'https://example.com/slides.pdf',
        type: AttachmentType.Slides,
        uploadedBy: 'U123456',
      })
    })

    it('should return 400 when missing required fields', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            talkTitle: 'Test Talk',
            // Missing required fields
          }),
        }
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await POST(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })
  })

  describe('DELETE /api/admin/events/[slug]/talk-attachments', () => {
    it('should delete attachment', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockGetTalkAttachmentById.mockResolvedValue(mockTalkAttachment)
      mockDeleteTalkAttachment.mockResolvedValue(true)

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments?id=attachment-1',
        { method: 'DELETE' }
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockDeleteTalkAttachment).toHaveBeenCalledWith('attachment-1')
    })

    it('should return 400 when attachment ID is missing', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments',
        { method: 'DELETE' }
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing attachment ID')
    })

    it('should return 404 when attachment not found', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockGetTalkAttachmentById.mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments?id=nonexistent',
        { method: 'DELETE' }
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Attachment not found')
    })

    it('should return 403 when attachment belongs to different event', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockGetTalkAttachmentById.mockResolvedValue({
        ...mockTalkAttachment,
        eventSlug: 'different-event',
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments?id=attachment-1',
        { method: 'DELETE' }
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Attachment does not belong to this event')
    })

    it('should return 500 when deletion fails', async () => {
      mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
      mockGetTalkAttachmentById.mockResolvedValue(mockTalkAttachment)
      mockDeleteTalkAttachment.mockResolvedValue(false)

      const request = new NextRequest(
        'http://localhost:3000/api/admin/events/test-event/talk-attachments?id=attachment-1',
        { method: 'DELETE' }
      )
      const context = { params: Promise.resolve({ slug: 'test-event' }) }

      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete attachment')
    })
  })
})
