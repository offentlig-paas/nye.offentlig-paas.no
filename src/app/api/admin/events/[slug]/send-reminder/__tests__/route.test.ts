import { NextRequest, NextResponse } from 'next/server'
import { Audience, AttendanceType } from '@/lib/events/types'
import type { EventAuthContext } from '@/lib/api/auth-middleware'
import type { Session } from 'next-auth'

// Mock modules before importing the route
jest.mock('@/auth') // Mock the auth module to avoid next-auth ESM issues
jest.mock('@/lib/api/auth-middleware')
jest.mock('@/domains/event-registration')
jest.mock('@/lib/slack/messaging')

// Now import the mocked modules and route
import { POST } from '../route'
import { authorizeEventAccess } from '@/lib/api/auth-middleware'
import { eventRegistrationService } from '@/domains/event-registration'
import { sendBulkDirectMessages } from '@/lib/slack/messaging'

describe('POST /api/admin/events/[slug]/send-reminder', () => {
  const mockAuthorizeEventAccess = authorizeEventAccess as jest.MockedFunction<
    typeof authorizeEventAccess
  >
  const mockGetEventRegistrations =
    eventRegistrationService.getEventRegistrations as jest.MockedFunction<
      typeof eventRegistrationService.getEventRegistrations
    >
  const mockSendBulkDirectMessages =
    sendBulkDirectMessages as jest.MockedFunction<typeof sendBulkDirectMessages>

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
        organizers: [],
        schedule: [],
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
    process.env.NEXT_PUBLIC_SITE_URL = 'https://test.example.com'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  it('should send reminder to all confirmed participants', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetEventRegistrations.mockResolvedValue([
      {
        _id: '1',
        eventSlug: 'test-event',
        name: 'User 1',
        email: 'user1@example.com',
        slackUserId: 'U111',
        organisation: 'Org 1',
        status: 'confirmed',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
      {
        _id: '2',
        eventSlug: 'test-event',
        name: 'User 2',
        email: 'user2@example.com',
        slackUserId: 'U222',
        organisation: 'Org 2',
        status: 'attended',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
      {
        _id: '3',
        eventSlug: 'test-event',
        name: 'User 3',
        email: 'user3@example.com',
        slackUserId: 'U333',
        organisation: 'Org 3',
        status: 'cancelled',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
    ])
    mockSendBulkDirectMessages.mockResolvedValue({
      sent: 2,
      failed: 0,
      results: [
        { success: true, userId: 'U111' },
        { success: true, userId: 'U222' },
      ],
    })

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test reminder message',
        statusFilter: 'all',
        testMode: false,
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sent).toBe(2)
    expect(data.failed).toBe(0)
    expect(data.total).toBe(2)
    expect(mockSendBulkDirectMessages).toHaveBeenCalledWith(
      ['U111', 'U222'],
      expect.objectContaining({
        text: expect.stringContaining('Test reminder message'),
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'section',
            text: expect.objectContaining({
              text: 'Test reminder message',
            }),
          }),
        ]),
      }),
      { batchSize: 50, delayBetweenBatches: 1000 }
    )
  })

  it('should filter by status when provided', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetEventRegistrations.mockResolvedValue([
      {
        _id: '1',
        eventSlug: 'test-event',
        name: 'User 1',
        email: 'user1@example.com',
        slackUserId: 'U111',
        organisation: 'Org 1',
        status: 'confirmed',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
      {
        _id: '2',
        eventSlug: 'test-event',
        name: 'User 2',
        email: 'user2@example.com',
        slackUserId: 'U222',
        organisation: 'Org 2',
        status: 'attended',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
    ])
    mockSendBulkDirectMessages.mockResolvedValue({
      sent: 1,
      failed: 0,
      results: [{ success: true, userId: 'U111' }],
    })

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        statusFilter: 'confirmed',
        testMode: false,
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })
    const data = await response.json()

    expect(data.sent).toBe(1)
    expect(mockSendBulkDirectMessages).toHaveBeenCalledWith(
      ['U111'],
      expect.objectContaining({
        text: expect.any(String),
        blocks: expect.any(Array),
      }),
      expect.any(Object)
    )
  })

  it('should send test message to current user only', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockSendBulkDirectMessages.mockResolvedValue({
      sent: 1,
      failed: 0,
      results: [{ success: true, userId: 'U123456' }],
    })

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        statusFilter: 'all',
        testMode: true,
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Test-påminnelse sendt til deg')
    expect(mockSendBulkDirectMessages).toHaveBeenCalledWith(
      ['U123456'],
      expect.objectContaining({
        text: expect.any(String),
        blocks: expect.any(Array),
      }),
      expect.any(Object)
    )
    expect(mockGetEventRegistrations).not.toHaveBeenCalled()
  })

  it('should return 400 when message is missing', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        statusFilter: 'all',
        testMode: false,
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Message is required')
  })

  it('should return 400 when no users with Slack IDs found', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetEventRegistrations.mockResolvedValue([
      {
        _id: '1',
        eventSlug: 'test-event',
        name: 'User 1',
        email: 'user1@example.com',
        slackUserId: '',
        organisation: 'Org 1',
        status: 'confirmed',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
    ])

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        statusFilter: 'all',
        testMode: false,
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('No registered users with Slack IDs found')
  })

  it('should return 400 when test mode but no slackId', async () => {
    const authWithoutSlackId = {
      ...mockAuthResult,
      auth: {
        ...mockAuthResult.auth,
        user: {
          ...mockAuthResult.auth.user,
          slackId: undefined,
        },
      },
    }
    mockAuthorizeEventAccess.mockResolvedValue(authWithoutSlackId)

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        testMode: true,
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Slack ID not found for current user')
  })

  it('should return 403 when not authorized', async () => {
    mockAuthorizeEventAccess.mockResolvedValue({
      success: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    })

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(403)
  })

  it('should skip registrations without slackUserId', async () => {
    mockAuthorizeEventAccess.mockResolvedValue(mockAuthResult)
    mockGetEventRegistrations.mockResolvedValue([
      {
        _id: '1',
        eventSlug: 'test-event',
        name: 'User 1',
        email: 'user1@example.com',
        slackUserId: 'U111',
        organisation: 'Org 1',
        status: 'confirmed',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
      {
        _id: '2',
        eventSlug: 'test-event',
        name: 'User 2',
        email: 'user2@example.com',
        slackUserId: '',
        organisation: 'Org 2',
        status: 'confirmed',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
      {
        _id: '3',
        eventSlug: 'test-event',
        name: 'User 3',
        email: 'user3@example.com',
        slackUserId: '',
        organisation: 'Org 3',
        status: 'confirmed',
        registeredAt: new Date(),
        attendanceType: AttendanceType.Physical,
      },
    ])
    mockSendBulkDirectMessages.mockResolvedValue({
      sent: 1,
      failed: 0,
      results: [{ success: true, userId: 'U111' }],
    })

    const request = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        statusFilter: 'all',
        testMode: false,
      }),
    })

    const response = await POST(request, {
      params: Promise.resolve({ slug: 'test-event' }),
    })
    const data = await response.json()

    expect(data.total).toBe(1)
    expect(mockSendBulkDirectMessages).toHaveBeenCalledWith(
      ['U111'],
      expect.objectContaining({
        text: expect.any(String),
        blocks: expect.any(Array),
      }),
      expect.any(Object)
    )
  })
})
