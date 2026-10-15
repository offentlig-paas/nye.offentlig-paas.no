import { vi, type MockedFunction } from 'vitest'
import { NextRequest } from 'next/server'
import { Audience, AttendanceType, Status } from '@/lib/events/types'

vi.mock('@/auth')
vi.mock('@/lib/events/helpers')
vi.mock('@/domains/event-registration')
vi.mock('@/lib/sanity/config', () => ({
  sanityClient: {
    fetch: vi.fn(),
    assets: { upload: vi.fn() },
    create: vi.fn(),
  },
}))

import { POST } from '../route'
import { auth } from '@/auth'
import {
  canUserAccessEvent,
  getEvent,
  getStatus,
  isUserEventSpeaker,
} from '@/lib/events/helpers'
import { eventRegistrationService } from '@/domains/event-registration'
import { sanityClient } from '@/lib/sanity/config'
import { validateEventPhotoFile } from '@/lib/sanity/event-photos'

const validJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
const validPngBytes = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])

describe('validateEventPhotoFile', () => {
  it('accepts valid JPEG and PNG buffers', () => {
    expect(
      validateEventPhotoFile(
        { name: 'test.jpg', type: 'image/jpeg', size: validJpegBytes.length },
        Buffer.from(validJpegBytes)
      )
    ).toBeNull()

    expect(
      validateEventPhotoFile(
        { name: 'test.png', type: 'image/png', size: validPngBytes.length },
        Buffer.from(validPngBytes)
      )
    ).toBeNull()
  })

  it('rejects SVG and mismatched magic bytes', () => {
    const svgBuffer = Buffer.from('<svg onload="alert(1)"></svg>')
    expect(
      validateEventPhotoFile(
        { name: 'xss.svg', type: 'image/svg+xml', size: svgBuffer.length },
        svgBuffer
      )
    ).toContain('Ugyldig filformat')

    expect(
      validateEventPhotoFile(
        { name: 'fake.jpg', type: 'image/jpeg', size: svgBuffer.length },
        svgBuffer
      )
    ).toContain('samsvarer ikke')
  })
})

describe('POST /api/events/[slug]/photos', () => {
  const mockAuth = auth as unknown as MockedFunction<() => Promise<unknown>>
  const mockGetEvent = getEvent as MockedFunction<typeof getEvent>
  const mockGetStatus = getStatus as MockedFunction<typeof getStatus>
  const mockCanUserAccessEvent = canUserAccessEvent as MockedFunction<
    typeof canUserAccessEvent
  >
  const mockIsUserEventSpeaker = isUserEventSpeaker as MockedFunction<
    typeof isUserEventSpeaker
  >
  const mockGetUserRegistration =
    eventRegistrationService.getRegistrationBySlackUserId as MockedFunction<
      typeof eventRegistrationService.getRegistrationBySlackUserId
    >

  const mockEvent = {
    slug: 'test-event',
    title: 'Test Event',
    ingress: 'Test ingress',
    start: new Date('2025-10-15T09:00:00Z'),
    end: new Date('2025-10-15T15:00:00Z'),
    location: 'Oslo',
    audience: Audience.PublicSector,
    organizers: [],
    schedule: [],
    registration: {
      disabled: false,
      attendanceTypes: [AttendanceType.Physical],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEvent.mockReturnValue(mockEvent)
    mockGetStatus.mockReturnValue(Status.Past)
    mockCanUserAccessEvent.mockReturnValue(false)
    mockIsUserEventSpeaker.mockReturnValue(false)
  })

  function buildUploadRequest(file: File, caption?: string) {
    const formData = new FormData()
    formData.append('file0', file)
    if (caption) {
      formData.append('caption', caption)
    }
    return new NextRequest(
      'http://localhost:3000/api/events/test-event/photos',
      {
        method: 'POST',
        body: formData,
      }
    )
  }

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const file = new File([validJpegBytes], 'photo.jpg', {
      type: 'image/jpeg',
    })
    const response = await POST(buildUploadRequest(file), {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(401)
  })

  it('returns 400 when event is upcoming', async () => {
    mockAuth.mockResolvedValue({ user: { slackId: 'U123' } })
    mockGetStatus.mockReturnValue(Status.Upcoming)
    const file = new File([validJpegBytes], 'photo.jpg', {
      type: 'image/jpeg',
    })

    const response = await POST(buildUploadRequest(file), {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(400)
  })

  it('returns 403 when user is waitlisted or not registered', async () => {
    mockAuth.mockResolvedValue({ user: { slackId: 'U123' } })
    mockGetUserRegistration.mockResolvedValue({
      _id: 'reg-1',
      eventSlug: 'test-event',
      name: 'Waitlisted User',
      email: 'wait@example.com',
      slackUserId: 'U123',
      organisation: 'Nav',
      registeredAt: new Date(),
      status: 'waitlist',
    })

    const file = new File([validJpegBytes], 'photo.jpg', {
      type: 'image/jpeg',
    })
    const response = await POST(buildUploadRequest(file), {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(403)
  })

  it('returns 400 when participant exceeds per-event upload limit', async () => {
    mockAuth.mockResolvedValue({ user: { slackId: 'U123' } })
    mockGetUserRegistration.mockResolvedValue({
      _id: 'reg-1',
      eventSlug: 'test-event',
      name: 'Confirmed User',
      email: 'user@example.com',
      slackUserId: 'U123',
      organisation: 'Nav',
      registeredAt: new Date(),
      status: 'confirmed',
    })
    vi.mocked(sanityClient.fetch).mockResolvedValue(10 as never)

    const file = new File([validJpegBytes], 'photo.jpg', {
      type: 'image/jpeg',
    })
    const response = await POST(buildUploadRequest(file), {
      params: Promise.resolve({ slug: 'test-event' }),
    })

    expect(response.status).toBe(400)
  })

  it('uploads photo with order 100 for confirmed participant', async () => {
    mockAuth.mockResolvedValue({ user: { slackId: 'U123' } })
    mockGetUserRegistration.mockResolvedValue({
      _id: 'reg-1',
      eventSlug: 'test-event',
      name: 'Confirmed User',
      email: 'user@example.com',
      slackUserId: 'U123',
      organisation: 'Nav',
      registeredAt: new Date(),
      status: 'confirmed',
    })
    vi.mocked(sanityClient.fetch).mockResolvedValue(0 as never)
    vi.mocked(sanityClient.assets.upload).mockResolvedValue({
      _id: 'image-asset-1',
    } as never)
    vi.mocked(sanityClient.create).mockResolvedValue({
      _id: 'photo-doc-1',
      eventSlug: 'test-event',
      caption: 'Fra fagdagen',
      order: 100,
    } as never)

    const file = new File([validJpegBytes], 'photo.jpg', {
      type: 'image/jpeg',
    })
    const response = await POST(buildUploadRequest(file, 'Fra fagdagen'), {
      params: Promise.resolve({ slug: 'test-event' }),
    })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(1)
    expect(sanityClient.create).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'eventPhoto',
        eventSlug: 'test-event',
        caption: 'Fra fagdagen',
        uploadedBy: 'U123',
        order: 100,
      })
    )
  })
})
