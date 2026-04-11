import { describe, it, expect } from 'vitest'
import { extractSlackUserId, matchesSlackUser } from '../utils'

describe('extractSlackUserId', () => {
  it('extracts user ID from a valid Slack team URL', () => {
    expect(
      extractSlackUserId('https://offentlig-paas-no.slack.com/team/U7DQV0KUY')
    ).toBe('U7DQV0KUY')
  })

  it('returns null for URL without team path', () => {
    expect(
      extractSlackUserId('https://offentlig-paas-no.slack.com/messages')
    ).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractSlackUserId('')).toBeNull()
  })
})

describe('matchesSlackUser', () => {
  const users = [
    { name: 'User A', url: 'https://workspace.slack.com/team/U11111' },
    { name: 'User B', url: 'https://workspace.slack.com/team/U22222' },
  ]

  it('returns true when slackId matches a user URL', () => {
    expect(matchesSlackUser('U11111', users)).toBe(true)
    expect(matchesSlackUser('U22222', users)).toBe(true)
  })

  it('returns false when slackId does not match any user', () => {
    expect(matchesSlackUser('U99999', users)).toBe(false)
  })

  it('returns false when slackId is undefined', () => {
    expect(matchesSlackUser(undefined, users)).toBe(false)
  })

  it('returns false when users array is undefined', () => {
    expect(matchesSlackUser('U11111', undefined)).toBe(false)
  })

  it('returns false when users array is empty', () => {
    expect(matchesSlackUser('U11111', [])).toBe(false)
  })

  it('skips users without URL', () => {
    const usersWithMissing = [
      { name: 'No URL' },
      { name: 'Has URL', url: 'https://workspace.slack.com/team/U33333' },
    ]
    expect(matchesSlackUser('U33333', usersWithMissing)).toBe(true)
    expect(matchesSlackUser('U44444', usersWithMissing)).toBe(false)
  })

  it('handles users with invalid URLs', () => {
    const badUsers = [{ name: 'Bad', url: 'not-a-valid-url' }]
    expect(matchesSlackUser('U11111', badUsers)).toBe(false)
  })
})
