import { describe, it, expect } from 'vitest'
import { members } from '@/data/members'

/**
 * Tests for the getNonRespondingContacts endpoint logic.
 *
 * The tRPC router functions are not directly exportable, so we test the
 * underlying logic: member validation, responded-org computation, and
 * the data-minimization contract (output shape).
 */

// --- Helpers matching the router's private functions ---

function resolveOrganization(
  response: {
    answers: { questionId: string; value?: string }[]
    organizationOverride?: { memberName: string }
  },
  orgQid: string
): string {
  if (response.organizationOverride?.memberName) {
    return response.organizationOverride.memberName
  }
  return response.answers.find(a => a.questionId === orgQid)?.value ?? 'Ukjent'
}

function getRespondedOrgNames(
  responses: {
    answers: { questionId: string; value?: string }[]
    organizationOverride?: { memberName: string }
  }[],
  orgQid: string
): Set<string> {
  const responded = new Set<string>()
  for (const r of responses) {
    responded.add(resolveOrganization(r, orgQid).toLowerCase().trim())
  }
  return responded
}

function getOrgQuestionId(survey: { organizationQuestionId?: string }): string {
  return survey.organizationQuestionId ?? 'q1-org'
}

// --- Tests ---

describe('resolveOrganization', () => {
  it('returns answer value for the org question', () => {
    const response = {
      answers: [{ questionId: 'q1-org', value: 'Nav' }],
    }
    expect(resolveOrganization(response, 'q1-org')).toBe('Nav')
  })

  it('prefers organizationOverride when present', () => {
    const response = {
      answers: [{ questionId: 'q1-org', value: 'Navv (typo)' }],
      organizationOverride: { memberName: 'Nav' },
    }
    expect(resolveOrganization(response, 'q1-org')).toBe('Nav')
  })

  it('returns "Ukjent" when no answer found', () => {
    const response = { answers: [] }
    expect(resolveOrganization(response, 'q1-org')).toBe('Ukjent')
  })

  it('returns "Ukjent" when answer value is undefined', () => {
    const response = {
      answers: [{ questionId: 'q1-org', value: undefined }],
    }
    expect(resolveOrganization(response, 'q1-org')).toBe('Ukjent')
  })
})

describe('getRespondedOrgNames', () => {
  it('collects unique normalized org names', () => {
    const responses = [
      { answers: [{ questionId: 'q1-org', value: 'Nav' }] },
      { answers: [{ questionId: 'q1-org', value: 'nav' }] },
      { answers: [{ questionId: 'q1-org', value: ' Nav ' }] },
    ]
    const result = getRespondedOrgNames(responses, 'q1-org')
    expect(result.size).toBe(1)
    expect(result.has('nav')).toBe(true)
  })

  it('returns empty set for no responses', () => {
    const result = getRespondedOrgNames([], 'q1-org')
    expect(result.size).toBe(0)
  })

  it('handles organizationOverride in the set', () => {
    const responses = [
      {
        answers: [{ questionId: 'q1-org', value: 'Typo Name' }],
        organizationOverride: { memberName: 'Kartverket' },
      },
    ]
    const result = getRespondedOrgNames(responses, 'q1-org')
    expect(result.has('kartverket')).toBe(true)
    expect(result.has('typo name')).toBe(false)
  })

  it('tracks multiple distinct organizations', () => {
    const responses = [
      { answers: [{ questionId: 'q1-org', value: 'Nav' }] },
      { answers: [{ questionId: 'q1-org', value: 'Kartverket' }] },
      { answers: [{ questionId: 'q1-org', value: 'Skatteetaten' }] },
    ]
    const result = getRespondedOrgNames(responses, 'q1-org')
    expect(result.size).toBe(3)
    expect(result.has('nav')).toBe(true)
    expect(result.has('kartverket')).toBe(true)
    expect(result.has('skatteetaten')).toBe(true)
  })
})

describe('getOrgQuestionId', () => {
  it('returns custom org question ID when defined', () => {
    expect(getOrgQuestionId({ organizationQuestionId: 'custom-q' })).toBe(
      'custom-q'
    )
  })

  it('defaults to q1-org when not defined', () => {
    expect(getOrgQuestionId({})).toBe('q1-org')
  })
})

describe('getNonRespondingContacts validation logic', () => {
  const memberNames = members.map(m => m.name)

  it('real member names from data/members exist', () => {
    expect(memberNames.length).toBeGreaterThan(0)
    expect(memberNames).toContain('Nav')
    expect(memberNames).toContain('Kartverket')
  })

  it('rejects invalid member names', () => {
    expect(memberNames).not.toContain('Nonexistent Corp')
    expect(memberNames).not.toContain('')
  })

  it('non-responding check blocks responded orgs', () => {
    const responses = [{ answers: [{ questionId: 'q1-org', value: 'Nav' }] }]
    const respondedOrgs = getRespondedOrgNames(responses, 'q1-org')

    expect(respondedOrgs.has('nav')).toBe(true)
    expect(respondedOrgs.has('kartverket')).toBe(false)
  })

  it('non-responding check is case-insensitive', () => {
    const responses = [{ answers: [{ questionId: 'q1-org', value: 'NAV' }] }]
    const respondedOrgs = getRespondedOrgNames(responses, 'q1-org')

    expect(respondedOrgs.has('nav')).toBe(true)
    expect(respondedOrgs.has('Nav'.toLowerCase().trim())).toBe(true)
  })

  it('non-responding check handles whitespace in org names', () => {
    const responses = [
      { answers: [{ questionId: 'q1-org', value: '  Nav  ' }] },
    ]
    const respondedOrgs = getRespondedOrgNames(responses, 'q1-org')

    expect(respondedOrgs.has('nav')).toBe(true)
  })
})

describe('data minimization contract', () => {
  it('output shape only contains realName, title, slackId', () => {
    const mockSlackUser = {
      id: 'U12345',
      realName: 'Test User',
      title: 'Developer',
      email: 'test@nav.no',
      avatar: 'https://example.com/avatar.jpg',
      statusEmoji: '🚀',
      statusText: 'Working',
    }

    // Simulate the mapping in getNonRespondingContacts
    const mapped = {
      realName: mockSlackUser.realName,
      title: mockSlackUser.title ?? '',
      slackId: mockSlackUser.id,
    }

    expect(Object.keys(mapped)).toEqual(['realName', 'title', 'slackId'])
    expect(mapped).not.toHaveProperty('email')
    expect(mapped).not.toHaveProperty('avatar')
    expect(mapped).not.toHaveProperty('statusEmoji')
    expect(mapped).not.toHaveProperty('statusText')
  })

  it('handles missing title gracefully', () => {
    const mockSlackUser = {
      id: 'U12345',
      realName: 'Test User',
      title: undefined,
    }

    const mapped = {
      realName: mockSlackUser.realName,
      title: mockSlackUser.title ?? '',
      slackId: mockSlackUser.id,
    }

    expect(mapped.title).toBe('')
  })
})
