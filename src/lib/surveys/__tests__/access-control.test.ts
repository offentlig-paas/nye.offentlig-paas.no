import { describe, it, expect } from 'vitest'
import {
  canUserAccessSurvey,
  getAccessibleSurveys,
  getUserSurveyRole,
  hasAnySurveyAccess,
} from '../helpers'
import type { SurveyDefinition } from '../types'
import { SurveyStatus } from '../types'

const baseSurvey: SurveyDefinition = {
  slug: 'test-survey',
  version: 1,
  title: 'Test',
  consent: { dataCollectionText: 'test' },
  status: SurveyStatus.Open,
  sections: [],
}

describe('getUserSurveyRole', () => {
  it('returns owner for global admins', () => {
    expect(getUserSurveyRole(baseSurvey, { isAdmin: true })).toBe('owner')
  })

  it('returns owner when user slackId matches an owner URL', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Owner',
          url: 'https://offentlig-paas-no.slack.com/team/U12345',
        },
      ],
    }
    expect(
      getUserSurveyRole(survey, { isAdmin: false, slackId: 'U12345' })
    ).toBe('owner')
  })

  it('returns researcher when user slackId matches a researcher URL', () => {
    const survey = {
      ...baseSurvey,
      researchers: [
        {
          name: 'Researcher',
          url: 'https://offentlig-paas-no.slack.com/team/URES01',
        },
      ],
    }
    expect(
      getUserSurveyRole(survey, { isAdmin: false, slackId: 'URES01' })
    ).toBe('researcher')
  })

  it('returns owner over researcher when user matches both', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Both',
          url: 'https://offentlig-paas-no.slack.com/team/UBOTH1',
        },
      ],
      researchers: [
        {
          name: 'Both',
          url: 'https://offentlig-paas-no.slack.com/team/UBOTH1',
        },
      ],
    }
    expect(
      getUserSurveyRole(survey, { isAdmin: false, slackId: 'UBOTH1' })
    ).toBe('owner')
  })

  it('returns null when user has no matching role', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Owner',
          url: 'https://offentlig-paas-no.slack.com/team/U12345',
        },
      ],
    }
    expect(
      getUserSurveyRole(survey, { isAdmin: false, slackId: 'U99999' })
    ).toBeNull()
  })

  it('returns null when user has no slackId', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Owner',
          url: 'https://offentlig-paas-no.slack.com/team/U12345',
        },
      ],
    }
    expect(getUserSurveyRole(survey, { isAdmin: false })).toBeNull()
  })

  it('returns null when owner/researcher has no URL', () => {
    const survey = {
      ...baseSurvey,
      owners: [{ name: 'Owner without URL' }],
      researchers: [{ name: 'Researcher without URL' }],
    }
    expect(
      getUserSurveyRole(survey, { isAdmin: false, slackId: 'U12345' })
    ).toBeNull()
  })
})

describe('canUserAccessSurvey', () => {
  it('grants access to global admins regardless of ownership', () => {
    const survey = { ...baseSurvey }
    expect(canUserAccessSurvey(survey, { isAdmin: true })).toBe(true)
  })

  it('grants access to global admins even when owners list is empty', () => {
    const survey = { ...baseSurvey, owners: [] }
    expect(canUserAccessSurvey(survey, { isAdmin: true })).toBe(true)
  })

  it('grants access when user slackId matches an owner URL', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Owner',
          url: 'https://offentlig-paas-no.slack.com/team/U12345',
        },
      ],
    }
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'U12345' })
    ).toBe(true)
  })

  it('grants access when user slackId matches a researcher URL', () => {
    const survey = {
      ...baseSurvey,
      researchers: [
        {
          name: 'Researcher',
          url: 'https://offentlig-paas-no.slack.com/team/URES01',
        },
      ],
    }
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'URES01' })
    ).toBe(true)
  })

  it('denies access when user slackId does not match any owner', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Owner',
          url: 'https://offentlig-paas-no.slack.com/team/U12345',
        },
      ],
    }
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'U99999' })
    ).toBe(false)
  })

  it('denies access when survey has no owners and user is not admin', () => {
    const survey = { ...baseSurvey }
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'U12345' })
    ).toBe(false)
  })

  it('denies access when owners list is empty and user is not admin', () => {
    const survey = { ...baseSurvey, owners: [] }
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'U12345' })
    ).toBe(false)
  })

  it('denies access when owner has no URL', () => {
    const survey = {
      ...baseSurvey,
      owners: [{ name: 'Owner without URL' }],
    }
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'U12345' })
    ).toBe(false)
  })

  it('denies access when user has no slackId', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Owner',
          url: 'https://offentlig-paas-no.slack.com/team/U12345',
        },
      ],
    }
    expect(canUserAccessSurvey(survey, { isAdmin: false })).toBe(false)
  })

  it('handles multiple owners and matches any', () => {
    const survey = {
      ...baseSurvey,
      owners: [
        {
          name: 'Owner 1',
          url: 'https://offentlig-paas-no.slack.com/team/U11111',
        },
        {
          name: 'Owner 2',
          url: 'https://offentlig-paas-no.slack.com/team/U22222',
        },
      ],
    }
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'U22222' })
    ).toBe(true)
    expect(
      canUserAccessSurvey(survey, { isAdmin: false, slackId: 'U33333' })
    ).toBe(false)
  })
})

describe('hasAnySurveyAccess', () => {
  it('returns true for admin users', () => {
    expect(hasAnySurveyAccess({ isAdmin: true })).toBe(true)
  })

  it('returns true for survey owners', () => {
    expect(
      hasAnySurveyAccess({ isAdmin: false, slackId: 'U7DQV0KUY' })
    ).toBe(true)
  })

  it('returns false for users with no survey access', () => {
    expect(
      hasAnySurveyAccess({ isAdmin: false, slackId: 'UNONEXISTENT' })
    ).toBe(false)
  })
})

describe('getAccessibleSurveys', () => {
  it('returns all surveys for admin users', () => {
    const surveys = getAccessibleSurveys({ isAdmin: true })
    expect(surveys.length).toBeGreaterThan(0)
  })

  it('returns only owned surveys for non-admin users', () => {
    const surveys = getAccessibleSurveys({
      isAdmin: false,
      slackId: 'U7DQV0KUY',
    })
    expect(surveys.some(s => s.slug === 'ai-agents-2026')).toBe(true)
  })

  it('returns empty for non-admin user with no matching ownership', () => {
    const surveys = getAccessibleSurveys({
      isAdmin: false,
      slackId: 'UNONEXISTENT',
    })
    expect(surveys).toHaveLength(0)
  })
})
