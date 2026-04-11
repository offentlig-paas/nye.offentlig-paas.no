import { describe, it, expect } from 'vitest'
import {
  isUserEventOrganizer,
  getUserEventRole,
  canUserAccessEvent,
  isUserEventSpeaker,
  isUserSpeakerForTalk,
} from '../helpers'
import type { Event } from '../types'
import { AttendanceType, Audience, ItemType } from '../types'

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

const eventWithSpeakers: Event = {
  ...baseEvent,
  schedule: [
    {
      time: '09:00',
      title: 'Keynote',
      type: ItemType.Talk,
      speakers: [
        {
          name: 'Speaker A',
          url: 'https://offentlig-paas-no.slack.com/team/USPEAK01',
        },
      ],
    },
    {
      time: '10:00',
      title: 'Workshop Time',
      type: ItemType.Workshop,
      speakers: [
        {
          name: 'Speaker B',
          url: 'https://offentlig-paas-no.slack.com/team/USPEAK02',
        },
      ],
    },
    {
      time: '11:00',
      title: 'Lunch',
      type: ItemType.Break,
    },
    {
      time: '12:00',
      title: 'Panel Discussion',
      type: ItemType.Panel,
      speakers: [
        {
          name: 'Speaker A',
          url: 'https://offentlig-paas-no.slack.com/team/USPEAK01',
        },
        {
          name: 'Speaker C',
          url: 'https://offentlig-paas-no.slack.com/team/USPEAK03',
        },
      ],
    },
  ],
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

describe('isUserEventSpeaker', () => {
  it('returns true when user is a speaker for a talk', () => {
    expect(isUserEventSpeaker(eventWithSpeakers, 'USPEAK01')).toBe(true)
  })

  it('returns true when user is a speaker for a workshop', () => {
    expect(isUserEventSpeaker(eventWithSpeakers, 'USPEAK02')).toBe(true)
  })

  it('returns true when user is a speaker for a panel', () => {
    expect(isUserEventSpeaker(eventWithSpeakers, 'USPEAK03')).toBe(true)
  })

  it('returns false for non-speaker user', () => {
    expect(isUserEventSpeaker(eventWithSpeakers, 'UOTHER')).toBe(false)
  })

  it('returns false for empty slackId', () => {
    expect(isUserEventSpeaker(eventWithSpeakers, '')).toBe(false)
  })

  it('returns false when event has no schedule', () => {
    expect(isUserEventSpeaker(baseEvent, 'USPEAK01')).toBe(false)
  })

  it('ignores non-talk schedule items (breaks)', () => {
    const breakOnlyEvent: Event = {
      ...baseEvent,
      schedule: [
        { time: '11:00', title: 'Lunch', type: ItemType.Break },
      ],
    }
    expect(isUserEventSpeaker(breakOnlyEvent, 'USPEAK01')).toBe(false)
  })

  it('handles speakers without URLs', () => {
    const event: Event = {
      ...baseEvent,
      schedule: [
        {
          time: '09:00',
          title: 'Talk',
          type: ItemType.Talk,
          speakers: [{ name: 'No URL Speaker' }],
        },
      ],
    }
    expect(isUserEventSpeaker(event, 'USPEAK01')).toBe(false)
  })
})

describe('isUserSpeakerForTalk', () => {
  it('returns true when user is speaker for the specified talk', () => {
    expect(isUserSpeakerForTalk(eventWithSpeakers, 'Keynote', 'USPEAK01')).toBe(true)
  })

  it('returns false when user is not speaker for that talk', () => {
    expect(isUserSpeakerForTalk(eventWithSpeakers, 'Keynote', 'USPEAK02')).toBe(false)
  })

  it('returns false for non-existent talk title', () => {
    expect(isUserSpeakerForTalk(eventWithSpeakers, 'Does Not Exist', 'USPEAK01')).toBe(false)
  })

  it('returns false for empty slackId', () => {
    expect(isUserSpeakerForTalk(eventWithSpeakers, 'Keynote', '')).toBe(false)
  })

  it('returns false for empty talk title', () => {
    expect(isUserSpeakerForTalk(eventWithSpeakers, '', 'USPEAK01')).toBe(false)
  })

  it('matches panel speakers correctly', () => {
    expect(isUserSpeakerForTalk(eventWithSpeakers, 'Panel Discussion', 'USPEAK03')).toBe(true)
    expect(isUserSpeakerForTalk(eventWithSpeakers, 'Panel Discussion', 'USPEAK02')).toBe(false)
  })

  it('does not match break items even if title matches', () => {
    expect(isUserSpeakerForTalk(eventWithSpeakers, 'Lunch', 'USPEAK01')).toBe(false)
  })
})
