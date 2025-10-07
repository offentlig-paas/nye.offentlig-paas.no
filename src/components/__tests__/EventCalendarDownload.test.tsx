import { getGoogleCalendarUrl, getIcsFileContent } from '@/lib/calendar-utils'
import type { Event } from '@/lib/events/types'
import { AttendanceType, Audience } from '@/lib/events/types'

describe('Calendar download with participant info', () => {
  const mockEvent: Event = {
    slug: 'test-event',
    title: 'Test Event',
    ingress: 'Test ingress',
    description: 'Test description',
    start: new Date('2025-10-15T10:00:00Z'),
    end: new Date('2025-10-15T16:00:00Z'),
    location: 'Oslo',
    price: '0',
    audience: Audience.OpenForAll,
    registration: {
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [],
    schedule: [],
  }

  const mockUrl = 'https://example.com/fagdag/test-event'

  describe('getGoogleCalendarUrl', () => {
    it('generates Google Calendar URL with basic event info', () => {
      const url = getGoogleCalendarUrl(mockEvent)

      expect(url).toContain('https://www.google.com/calendar/render')
      expect(url).toContain('text=Test+Event')
      expect(url).toContain('location=Oslo')
      expect(url).toContain('details=Test+description')
    })

    it('includes streaming URL in description when provided', () => {
      const streamingUrl = 'https://stream.example.com/event-123'
      const description = `${mockEvent.description}\n\nStreaming: ${streamingUrl}`
      const url = getGoogleCalendarUrl(mockEvent, description)

      const decodedUrl = decodeURIComponent(url)
      expect(decodedUrl).toContain(streamingUrl)
    })

    it('handles events without description', () => {
      const eventWithoutDesc = { ...mockEvent, description: undefined }
      const url = getGoogleCalendarUrl(eventWithoutDesc)

      expect(url).toContain('details=')
      expect(url).toContain('https://www.google.com/calendar/render')
    })
  })

  describe('getIcsFileContent', () => {
    it('generates ICS file with basic event info', () => {
      const ics = getIcsFileContent(mockEvent, mockUrl)

      expect(ics).toContain('BEGIN:VCALENDAR')
      expect(ics).toContain('VERSION:2.0')
      expect(ics).toContain('SUMMARY:Test Event')
      expect(ics).toContain('LOCATION:Oslo')
      expect(ics).toContain('DESCRIPTION:Test description')
      expect(ics).toContain(`URL:${mockUrl}`)
      expect(ics).toContain('END:VEVENT')
      expect(ics).toContain('END:VCALENDAR')
    })

    it('includes streaming URL in description when provided', () => {
      const streamingUrl = 'https://stream.example.com/event-123'
      const ics = getIcsFileContent(mockEvent, mockUrl, streamingUrl)

      expect(ics).toContain('DESCRIPTION:Test description\\n\\nStreaming:')
      expect(ics).toContain(streamingUrl)
    })

    it('handles events without description', () => {
      const eventWithoutDesc = { ...mockEvent, description: undefined }
      const ics = getIcsFileContent(eventWithoutDesc, mockUrl)

      expect(ics).toContain('DESCRIPTION:')
      expect(ics).toContain('BEGIN:VCALENDAR')
    })

    it('appends streaming URL to empty description', () => {
      const eventWithoutDesc = { ...mockEvent, description: '' }
      const streamingUrl = 'https://stream.example.com/event-123'
      const ics = getIcsFileContent(eventWithoutDesc, mockUrl, streamingUrl)

      expect(ics).toContain('DESCRIPTION:\\n\\nStreaming:')
      expect(ics).toContain(streamingUrl)
    })

    it('formats dates correctly', () => {
      const ics = getIcsFileContent(mockEvent, mockUrl)

      expect(ics).toContain('DTSTART:20251015T100000Z')
      expect(ics).toContain('DTEND:20251015T160000Z')
    })
  })
})
