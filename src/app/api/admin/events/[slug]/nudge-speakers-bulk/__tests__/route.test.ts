import { NextRequest, NextResponse } from 'next/server'
import {
  Audience,
  AttendanceType,
  AttachmentType,
  ItemType,
} from '@/lib/events/types'
import type { EventAuthContext } from '@/lib/api/auth-middleware'
import type { Session } from 'next-auth'

jest.mock('@/auth')
jest.mock('@/lib/api/auth-middleware')
jest.mock('@/lib/slack/messaging')
jest.mock('@/lib/events/attachment-helpers')

import { POST } from '../route'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import { sendBulkDirectMessages } from '@/lib/slack/messaging'
import { getAllEventAttachments } from '@/lib/events/attachment-helpers'

describe('POST /api/admin/events/[slug]/nudge-speakers-bulk', () => {
  const mockAuthorizeEventAccess = authorizeEventAccess as jest.MockedFunction<
    typeof authorizeEventAccess
  >
  const mockSendBulkDirectMessages =
    sendBulkDirectMessages as jest.MockedFunction<typeof sendBulkDirectMessages>
  const mockGetAllEventAttachments =
    getAllEventAttachments as jest.MockedFunction<typeof getAllEventAttachments>

  const originalPublicUrl = process.env.NEXT_PUBLIC_URL

  afterEach(() => {
    process.env.NEXT_PUBLIC_URL = originalPublicUrl
    jest.clearAllMocks()
  })

  const mockAuthResult: { success: true; auth: EventAuthContext } = {
    success: true as const,
    auth: {
      user: {
        id: 'user-123',
        slackId: 'U123456',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: true,
      },
      session: {
        user: { name: 'Test User', email: 'test@example.com' },
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
            name: 'Hans Hansen',
            url: 'https://offentlig-paas.slack.com/team/U123456',
          },
          {
            name: 'Kari Nordmann',
            url: 'https://offentlig-paas.slack.com/team/U789012',
          },
        ],
        schedule: [
          {
            type: ItemType.Talk,
            title: 'Talk 1',
            time: '10:00 - 11:00',
            speakers: [
              {
                name: 'Speaker One',
                url: 'https://offentlig-paas.slack.com/team/U111',
              },
            ],
          },
          {
            type: ItemType.Talk,
            title: 'Talk 2',
            time: '11:00 - 12:00',
            speakers: [
              {
                name: 'Speaker Two',
                url: 'https://offentlig-paas.slack.com/team/U222',
              },
            ],
          },
          {
            type: ItemType.Talk,
            title: 'Talk 3',
            time: '13:00 - 14:00',
            speakers: [
              {
                name: 'Speaker One',
                url: 'https://offentlig-paas.slack.com/team/U111',
              },
            ],
          },
        ],
        registration: {
          disabled: false,
          attendanceTypes: [AttendanceType.Physical],
        },
      },
      slug: 'test-event',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_URL = 'https://test.example.com'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_URL
  })

  it('should send deduplicated messages to speakers with multiple talks', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetAllEventAttachments.mockResolvedValue(new Map())
    mockSendBulkDirectMessages.mockResolvedValue({
      sent: 1,
      failed: 0,
      results: [{ success: true, userId: 'U111' }],
    })

    const request = new NextRequest(
      'https://test.example.com/api/admin/events/test-event/nudge-speakers-bulk',
      {
        method: 'POST',
        body: JSON.stringify({
          onlyWithoutAttachments: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const context = { params: Promise.resolve({ slug: 'test-event' }) }
    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.sent).toBe(2)
    expect(data.speakerIds).toEqual(['U111', 'U222'])

    expect(mockSendBulkDirectMessages).toHaveBeenCalledTimes(2)

    const firstMessage = mockSendBulkDirectMessages.mock.calls[0]![1] as string
    expect(firstMessage).toContain('2 foredrag')
    expect(firstMessage).toContain('Talk 1')
    expect(firstMessage).toContain('Talk 3')
  })

  it('should skip speakers with attachments when onlyWithoutAttachments is true', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetAllEventAttachments.mockResolvedValue(
      new Map([
        [
          'Talk 1',
          [
            {
              title: 'Slides.pdf',
              url: 'https://example.com/slides.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
      ])
    )
    mockSendBulkDirectMessages.mockResolvedValue({
      sent: 1,
      failed: 0,
      results: [{ success: true, userId: 'U222' }],
    })

    const request = new NextRequest(
      'https://test.example.com/api/admin/events/test-event/nudge-speakers-bulk',
      {
        method: 'POST',
        body: JSON.stringify({
          onlyWithoutAttachments: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const context = { params: Promise.resolve({ slug: 'test-event' }) }
    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sent).toBe(2)
    expect(data.speakerIds).toHaveLength(2)
    expect(data.speakerIds).toContain('U111')
    expect(data.speakerIds).toContain('U222')
  })

  it('should handle speakers with some talks having attachments', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetAllEventAttachments.mockResolvedValue(
      new Map([
        [
          'Talk 1',
          [
            {
              title: 'Slides.pdf',
              url: 'https://example.com/slides.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
      ])
    )
    mockSendBulkDirectMessages.mockResolvedValue({
      sent: 1,
      failed: 0,
      results: [{ success: true, userId: 'U111' }],
    })

    const request = new NextRequest(
      'https://test.example.com/api/admin/events/test-event/nudge-speakers-bulk',
      {
        method: 'POST',
        body: JSON.stringify({
          onlyWithoutAttachments: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const context = { params: Promise.resolve({ slug: 'test-event' }) }
    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    const message = mockSendBulkDirectMessages.mock.calls[0]![1] as string
    expect(message).toContain(
      'Vi ser at du har lastet opp presentasjon for noen foredrag'
    )
  })

  it('should return success with 0 sent when all speakers have attachments', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetAllEventAttachments.mockResolvedValue(
      new Map([
        [
          'Talk 1',
          [
            {
              title: 'Slides 1',
              url: 'https://example.com/slides1.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
        [
          'Talk 2',
          [
            {
              title: 'Slides 2',
              url: 'https://example.com/slides2.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
        [
          'Talk 3',
          [
            {
              title: 'Slides 3',
              url: 'https://example.com/slides3.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
      ])
    )

    const request = new NextRequest(
      'https://test.example.com/api/admin/events/test-event/nudge-speakers-bulk',
      {
        method: 'POST',
        body: JSON.stringify({
          onlyWithoutAttachments: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const context = { params: Promise.resolve({ slug: 'test-event' }) }
    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sent).toBe(0)
    expect(mockSendBulkDirectMessages).not.toHaveBeenCalled()
  })

  it('should return 401 when authorization fails', async () => {
    mockAuthorizeEventAccess.mockResolvedValue({
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const request = new NextRequest(
      'https://test.example.com/api/admin/events/test-event/nudge-speakers-bulk',
      {
        method: 'POST',
        body: JSON.stringify({
          onlyWithoutAttachments: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const context = { params: Promise.resolve({ slug: 'test-event' }) }
    const response = await POST(request, context)

    expect(response.status).toBe(401)
  })

  it('should handle errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetAllEventAttachments.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest(
      'https://test.example.com/api/admin/events/test-event/nudge-speakers-bulk',
      {
        method: 'POST',
        body: JSON.stringify({
          onlyWithoutAttachments: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const context = { params: Promise.resolve({ slug: 'test-event' }) }
    const response = await POST(request, context)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to send nudge')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error sending bulk speaker nudge:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  // Note: Development environment protection only runs when NODE_ENV=development
  // In test environment (NODE_ENV=test), the protection is not active
  // This is tested manually or in integration tests with NODE_ENV=development
})
