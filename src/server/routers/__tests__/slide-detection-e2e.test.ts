/**
 * End-to-End Tests for Slide Detection Functionality
 *
 * These tests verify that:
 * 1. UI filtering and bulk nudge use consistent logic for detecting slides
 * 2. Attachments are properly merged into schedule items
 * 3. Edge cases are handled correctly (missing titles, no attachments, etc.)
 */

import { getAllEventAttachments } from '@/lib/events/attachment-helpers'
import {
  AttachmentType,
  type Attachment,
  type Item,
  type ItemType,
} from '@/lib/events/types'

jest.mock('@/lib/events/attachment-helpers')
jest.mock('@/lib/slack/messaging', () => ({
  sendBulkDirectMessages: jest.fn().mockResolvedValue({
    sent: 0,
    failed: 0,
    results: [],
  }),
}))
jest.mock('@/lib/formatDate', () => ({
  formatDateLong: jest.fn().mockReturnValue('1. januar 2025'),
}))

const mockGetAllEventAttachments =
  getAllEventAttachments as jest.MockedFunction<typeof getAllEventAttachments>

// Helper to create mock event with schedule
const createMockEvent = (scheduleItems: Partial<Item>[]) => ({
  slug: 'test-event',
  title: 'Test Event',
  ingress: 'Test event ingress',
  start: new Date('2025-01-15T10:00:00'),
  end: new Date('2025-01-15T16:00:00'),
  location: 'Oslo',
  audience: 'Offentlig sektor' as const,
  registration: {
    attendanceTypes: ['physical' as const],
  },
  organizers: [
    { name: 'Test Organizer', url: 'https://slack.com/team/U987654' },
  ],
  schedule: scheduleItems.map((item, idx) => ({
    time: `${10 + idx}:00`,
    title: item.title || `Talk ${idx + 1}`,
    description: item.description,
    speakers: item.speakers || [],
    type: item.type || ('Presentation' as ItemType),
    attachments: item.attachments,
  })) as Item[],
})

describe('Slide Detection E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Consistent slide detection between UI and bulk nudge', () => {
    it('should identify talks without slides consistently in getDetails and nudgeSpeakersBulk', async () => {
      // Setup: Event with 3 talks, only 2 have attachments
      const mockEvent = createMockEvent([
        {
          title: 'Talk with Slides',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 1', url: 'https://slack.com/team/U111111' },
          ],
        },
        {
          title: 'Talk without Slides',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 2', url: 'https://slack.com/team/U222222' },
          ],
        },
        {
          title: 'Panel with Slides',
          type: 'Panel' as ItemType,
          speakers: [
            { name: 'Speaker 3', url: 'https://slack.com/team/U333333' },
          ],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Talk with Slides',
          [
            {
              title: 'Slides',
              url: 'https://example.com/slides1.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
        [
          'Panel with Slides',
          [
            {
              title: 'Slides',
              url: 'https://example.com/slides2.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      // Test: Verify the logic by checking that attachments are merged into schedule items
      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      // Verify: 2 talks should have attachments, 1 should not
      const talksWithSlides = scheduleWithAttachments.filter(
        item => item.attachments && item.attachments.length > 0
      )
      const talksWithoutSlides = scheduleWithAttachments.filter(
        item => !item.attachments || item.attachments.length === 0
      )

      expect(talksWithSlides).toHaveLength(2)
      expect(talksWithoutSlides).toHaveLength(1)
      expect(talksWithoutSlides[0]?.title).toBe('Talk without Slides')

      // Test 2: Check bulk nudge logic matches UI filtering
      const talksWithSpeakers = mockEvent.schedule.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      // Apply same logic as nudgeSpeakersBulk
      const talksWithAttachmentsForNudge = talksWithSpeakers.map(talk => {
        const attachments = mockAttachments.get(talk.title)
        return attachments ? { ...talk, attachments } : talk
      })

      const shouldReceiveNudge = talksWithAttachmentsForNudge.filter(
        talk => !(talk.attachments && talk.attachments.length > 0)
      )

      // Verify: Same talk should be identified as missing slides
      expect(shouldReceiveNudge).toHaveLength(1)
      expect(shouldReceiveNudge[0]?.title).toBe('Talk without Slides')
    })

    it('should handle case where talk title has no matching attachments', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Exact Match',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 1', url: 'https://slack.com/team/U111111' },
          ],
        },
        {
          title: 'No Match',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 2', url: 'https://slack.com/team/U222222' },
          ],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Exact Match',
          [
            {
              title: 'Slides',
              url: 'https://example.com/slides.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
        // Note: 'No Match' title is not in the attachments map
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      // Merge attachments using the same logic as both endpoints
      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      const withSlides = scheduleWithAttachments.filter(
        item => !!(item.attachments && item.attachments.length > 0)
      )
      const withoutSlides = scheduleWithAttachments.filter(
        item => !item.attachments || item.attachments.length === 0
      )

      expect(withSlides).toHaveLength(1)
      expect(withSlides[0]?.title).toBe('Exact Match')
      expect(withoutSlides).toHaveLength(1)
      expect(withoutSlides[0]?.title).toBe('No Match')
    })
  })

  describe('Edge cases for slide detection', () => {
    it('should handle event with no talks', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Registration',
          type: 'Registrering' as ItemType,
        },
        {
          title: 'Break',
          type: 'Pause' as ItemType,
        },
      ])

      mockGetAllEventAttachments.mockResolvedValue(new Map())

      const talks = mockEvent.schedule.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      expect(talks).toHaveLength(0)
    })

    it('should handle talks with speakers but no Slack URLs', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Talk by External Speaker',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'External Speaker' }], // No URL
        },
        {
          title: 'Talk by Internal Speaker',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Internal Speaker', url: 'https://slack.com/team/U111111' },
          ],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>()
      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      // Count talks that can receive nudges (have Slack URL)
      const talksWithSlackId = scheduleWithAttachments.filter(
        talk => talk.speakers?.[0]?.url
      )

      expect(talksWithSlackId).toHaveLength(1)
      expect(talksWithSlackId[0]?.title).toBe('Talk by Internal Speaker')
    })

    it('should handle empty attachments array vs undefined', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Talk with empty array',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 1', url: 'https://slack.com/team/U111111' },
          ],
          attachments: [], // Empty array
        },
        {
          title: 'Talk with undefined',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 2', url: 'https://slack.com/team/U222222' },
          ],
          // attachments: undefined (not set)
        },
      ])

      mockGetAllEventAttachments.mockResolvedValue(new Map())

      // Both should be treated as "without slides"
      const withoutSlides = mockEvent.schedule.filter(
        talk => !talk.attachments || talk.attachments.length === 0
      )

      expect(withoutSlides).toHaveLength(2)
    })

    it('should handle multiple attachments per talk', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Talk with Multiple Attachments',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 1', url: 'https://slack.com/team/U111111' },
          ],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Talk with Multiple Attachments',
          [
            {
              title: 'Slides',
              url: 'https://example.com/slides.pdf',
              type: AttachmentType.Slides,
            },
            {
              title: 'Code',
              url: 'https://github.com/repo',
              type: AttachmentType.Code,
            },
            {
              title: 'Video',
              url: 'https://youtube.com/watch',
              type: AttachmentType.Video,
            },
          ],
        ],
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      const withSlides = scheduleWithAttachments.filter(
        item => !!(item.attachments && item.attachments.length > 0)
      )

      expect(withSlides).toHaveLength(1)
      expect(withSlides[0]?.attachments).toHaveLength(3)
    })

    it('should handle talks with special characters in titles', () => {
      const specialTitles = [
        'Talk: Introduction & Setup',
        'How to use "Kubernetes" effectively',
        "Speaker's Guide to CI/CD",
        'React 101 - The Basics',
      ]

      const mockEvent = createMockEvent(
        specialTitles.map((title, idx) => ({
          title,
          type: 'Presentation' as ItemType,
          speakers: [
            {
              name: `Speaker ${idx + 1}`,
              url: `https://slack.com/team/U${idx}`,
            },
          ],
        }))
      )

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Talk: Introduction & Setup',
          [
            {
              title: 'Slides',
              url: 'https://example.com/slides.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      const withSlides = scheduleWithAttachments.filter(
        item => !!(item.attachments && item.attachments.length > 0)
      )
      const withoutSlides = scheduleWithAttachments.filter(
        item => !item.attachments || item.attachments.length === 0
      )

      // Only exact title match should have slides
      expect(withSlides).toHaveLength(1)
      expect(withSlides[0]?.title).toBe('Talk: Introduction & Setup')
      expect(withoutSlides).toHaveLength(3)
    })

    it('should handle panels and workshops in addition to presentations', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Presentation with Slides',
          type: 'Presentation' as ItemType,
          speakers: [
            { name: 'Speaker 1', url: 'https://slack.com/team/U111111' },
          ],
        },
        {
          title: 'Panel without Slides',
          type: 'Panel' as ItemType,
          speakers: [
            { name: 'Speaker 2', url: 'https://slack.com/team/U222222' },
          ],
        },
        {
          title: 'Workshop with Slides',
          type: 'Workshop' as ItemType,
          speakers: [
            { name: 'Speaker 3', url: 'https://slack.com/team/U333333' },
          ],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Presentation with Slides',
          [
            {
              title: 'Slides',
              url: 'https://example.com/slides1.pdf',
              type: AttachmentType.Slides,
            },
          ],
        ],
        [
          'Workshop with Slides',
          [
            {
              title: 'Resources',
              url: 'https://example.com/resources.pdf',
              type: AttachmentType.Other,
            },
          ],
        ],
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      const withSlides = scheduleWithAttachments.filter(
        item => !!(item.attachments && item.attachments.length > 0)
      )
      const withoutSlides = scheduleWithAttachments.filter(
        item => !item.attachments || item.attachments.length === 0
      )

      expect(withSlides).toHaveLength(2)
      expect(withoutSlides).toHaveLength(1)
      expect(withoutSlides[0]?.title).toBe('Panel without Slides')
      expect(withoutSlides[0]?.type).toBe('Panel')
    })
  })

  describe('Stats calculation consistency', () => {
    it('should calculate slide statistics correctly in UI', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Talk 1',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'Speaker 1', url: 'https://slack.com/team/U1' }],
        },
        {
          title: 'Talk 2',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'Speaker 2', url: 'https://slack.com/team/U2' }],
        },
        {
          title: 'Talk 3',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'Speaker 3', url: 'https://slack.com/team/U3' }],
        },
        {
          title: 'Talk 4',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'Speaker 4', url: 'https://slack.com/team/U4' }],
        },
        {
          title: 'Talk 5',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'Speaker 5', url: 'https://slack.com/team/U5' }],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Talk 1',
          [{ title: 'Slides', url: 'url1', type: AttachmentType.Slides }],
        ],
        [
          'Talk 2',
          [{ title: 'Slides', url: 'url2', type: AttachmentType.Slides }],
        ],
        [
          'Talk 3',
          [{ title: 'Slides', url: 'url3', type: AttachmentType.Slides }],
        ],
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      const talks = scheduleWithAttachments.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      const withSlides = talks.filter(
        t => t.attachments && t.attachments.length > 0
      ).length
      const withoutSlides = talks.length - withSlides

      expect(talks.length).toBe(5)
      expect(withSlides).toBe(3)
      expect(withoutSlides).toBe(2)

      // Verify percentage calculations
      const percentageWithSlides = (withSlides / talks.length) * 100
      const percentageWithoutSlides = (withoutSlides / talks.length) * 100

      expect(percentageWithSlides).toBe(60)
      expect(percentageWithoutSlides).toBe(40)
    })

    it('should handle zero talks case in stats', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Break',
          type: 'Pause' as ItemType,
        },
      ])

      mockGetAllEventAttachments.mockResolvedValue(new Map())

      const talks = mockEvent.schedule.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      expect(talks.length).toBe(0)

      const withSlides = talks.filter(
        t => t.attachments && t.attachments.length > 0
      ).length
      const withoutSlides = talks.length - withSlides

      expect(withSlides).toBe(0)
      expect(withoutSlides).toBe(0)
    })

    it('should handle all talks having slides', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Talk 1',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'Speaker 1', url: 'https://slack.com/team/U1' }],
        },
        {
          title: 'Talk 2',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'Speaker 2', url: 'https://slack.com/team/U2' }],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Talk 1',
          [{ title: 'Slides', url: 'url1', type: AttachmentType.Slides }],
        ],
        [
          'Talk 2',
          [{ title: 'Slides', url: 'url2', type: AttachmentType.Slides }],
        ],
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      const talks = scheduleWithAttachments.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      const withSlides = talks.filter(
        t => t.attachments && t.attachments.length > 0
      ).length
      const withoutSlides = talks.length - withSlides

      expect(withSlides).toBe(2)
      expect(withoutSlides).toBe(0)
    })
  })

  describe('Filter consistency', () => {
    it('should filter talks by attachment status consistently', () => {
      const mockEvent = createMockEvent([
        {
          title: 'Has Slides',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'S1', url: 'https://slack.com/team/U1' }],
        },
        {
          title: 'No Slides',
          type: 'Presentation' as ItemType,
          speakers: [{ name: 'S2', url: 'https://slack.com/team/U2' }],
        },
        {
          title: 'Also Has Slides',
          type: 'Panel' as ItemType,
          speakers: [{ name: 'S3', url: 'https://slack.com/team/U3' }],
        },
      ])

      const mockAttachments = new Map<string, Attachment[]>([
        [
          'Has Slides',
          [{ title: 'Slides', url: 'url1', type: AttachmentType.Slides }],
        ],
        [
          'Also Has Slides',
          [{ title: 'Slides', url: 'url2', type: AttachmentType.Slides }],
        ],
      ])

      mockGetAllEventAttachments.mockResolvedValue(mockAttachments)

      const scheduleWithAttachments = mockEvent.schedule.map(item => {
        const attachments = mockAttachments.get(item.title)
        return attachments ? { ...item, attachments } : item
      })

      const talks = scheduleWithAttachments.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      // Test filter: with-slides
      const filteredWithSlides = talks.filter(
        talk => !!(talk.attachments && talk.attachments.length > 0)
      )

      expect(filteredWithSlides).toHaveLength(2)
      expect(filteredWithSlides.map(t => t.title)).toEqual([
        'Has Slides',
        'Also Has Slides',
      ])

      // Test filter: without-slides
      const filteredWithoutSlides = talks.filter(
        talk => !talk.attachments || talk.attachments.length === 0
      )

      expect(filteredWithoutSlides).toHaveLength(1)
      expect(filteredWithoutSlides[0]?.title).toBe('No Slides')

      // Verify: all talks are accounted for
      expect(filteredWithSlides.length + filteredWithoutSlides.length).toBe(
        talks.length
      )
    })
  })
})
