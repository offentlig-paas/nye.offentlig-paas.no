import { describe, it, expect } from 'vitest'
import {
  isUserEventOrganizer,
  getUserEventRole,
  canUserAccessEvent,
} from '../helpers'
import type { Event } from '../types'
import { AttendanceType, Audience } from '../types'

const baseEvent: Event = {
  slug: 'test-event',
  title: 'Test Event',
  ingress: 'Test',
  start: new Date('2024-01-01'),
  end: new Date('2024-01-02'),
  location: 'Oslo',
  audience: Audience.PublicSector,
  registration: {
    disabled: false,
    attendanceTypes: [AttendanceType.Physical],
  },
  organizers: [
    {
      name: 'Organizer',
      url: 'https://offentlig-paas-no.slack.com/team/UORG01',
    },
  ],
  schedule: [],
}

describe('isUserEventOrganizer', () => {
  it('returns true when user matches an organizer URL', () => {
    expect(isUserEventOrganizer(baseEvent, 'UORG01')).toBe(true)
  })

  it('returns false when user does not match', () => {
    expect(isUserEventOrganizer(baseEvent, 'UOTHER')).toBe(false)
  })

  it('returns false for empty string slackId', () => {
    expect(isUserEventOrganizer(baseEvent, '')).toBe(false)
  })

  it('returns false when event has no organizers', () => {
    const event = { ...baseEvent, organizers: [] }
    expect(isUserEventOrganizer(event, 'UORG01')).toBe(false)
  })

  it('handles organizers without URLs', () => {
    const event = {
      ...baseEvent,
      organizers: [{ name: 'No URL Organizer' }],
    }
    expect(isUserEventOrganizer(event, 'UORG01')).toBe(false)
  })

  it('handles multiple organizers and matches any', () => {
    const event = {
      ...baseEvent,
      organizers: [
        {
          name: 'Org 1',
          url: 'https://offentlig-paas-no.slack.com/team/UORG01',
        },
        {
          name: 'Org 2',
          url: 'https://offentlig-paas-no.slack.com/team/UORG02',
        },
      ],
    }
    expect(isUserEventOrganizer(event, 'UORG02')).toBe(true)
    expect(isUserEventOrganizer(event, 'UORG03')).toBe(false)
  })
})

describe('getUserEventRole', () => {
  it('returns organizer for admins', () => {
    expect(getUserEventRole(baseEvent, { isAdmin: true })).toBe('organizer')
  })

  it('returns organizer for matching organizer slackId', () => {
    expect(
      getUserEventRole(baseEvent, { isAdmin: false, slackId: 'UORG01' })
    ).toBe('organizer')
  })

  it('returns null for non-matching user', () => {
    expect(
      getUserEventRole(baseEvent, { isAdmin: false, slackId: 'UOTHER' })
    ).toBeNull()
  })

  it('returns null for user without slackId', () => {
    expect(getUserEventRole(baseEvent, { isAdmin: false })).toBeNull()
  })
})

describe('canUserAccessEvent', () => {
  it('grants access to admins', () => {
    expect(canUserAccessEvent(baseEvent, { isAdmin: true })).toBe(true)
  })

  it('grants access to organizers', () => {
    expect(
      canUserAccessEvent(baseEvent, { isAdmin: false, slackId: 'UORG01' })
    ).toBe(true)
  })

  it('denies access to non-organizers', () => {
    expect(
      canUserAccessEvent(baseEvent, { isAdmin: false, slackId: 'UOTHER' })
    ).toBe(false)
  })

  it('denies access when user has no slackId and is not admin', () => {
    expect(canUserAccessEvent(baseEvent, { isAdmin: false })).toBe(false)
  })
})
