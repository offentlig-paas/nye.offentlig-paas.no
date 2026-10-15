import { vi, type Mocked } from 'vitest'
import { MemberProfileRepository } from '../repository'
import {
  upsertMemberProfileSchema,
  type MemberProfile,
  type UpsertMemberProfileInput,
} from '../types'

vi.mock('../repository')

const {
  memberProfileService,
  getMemberBySlug,
  getMemberByUserEmail,
  canUserEditMemberProfile,
} = await import('../service')

describe('MemberProfileService & Helpers', () => {
  let mockRepo: Mocked<MemberProfileRepository>

  const mockProfile: MemberProfile = {
    _id: 'memberProfile-nav',
    slug: 'nav',
    visibility: 'public',
    platformAccess: 'public',
    platformName: 'Nais',
    platformDescription: 'Applikasjonsplattformen til Nav',
    platformHref: 'https://nais.io',
    platformLabel: 'nais.io',
    verifiedUpdated: '2026-04-14',
    theme: {
      accentColor: 'teal',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'architecture',
        'team',
        'jobs',
        'talks',
      ],
    },
    tagline: 'Utviklerplattformen som akselererer produktutvikling i Nav',
    taglineEn: 'The developer platform accelerating product delivery at Nav',
    about: 'Om Nais',
    aboutEn: 'About Nais',
    cncfEndUserMember: true,
    openSourceFirst: true,
    cloudProviders: ['Google Cloud Platform (GCP)', 'On-prem Kubernetes'],
    stats: [],
    capabilities: [],
    cncfProjects: [],
    techStack: [],
    team: [],
    openPositions: [],
    links: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo =
      MemberProfileRepository.prototype as Mocked<MemberProfileRepository>
  })

  describe('getMemberBySlug', () => {
    it('finds member by canonical slug (case-insensitive)', () => {
      const nav = getMemberBySlug('NAV')
      expect(nav).toBeDefined()
      expect(nav?.name).toBe('Nav')
    })

    it('returns undefined for unknown slug', () => {
      expect(getMemberBySlug('non-existent-org')).toBeUndefined()
    })
  })

  describe('getMemberByUserEmail', () => {
    it('finds member matching exact or subdomain email', () => {
      expect(getMemberByUserEmail('ola@nav.no')?.getSlug()).toBe('nav')
      expect(getMemberByUserEmail('ola@utvikling.nav.no')?.getSlug()).toBe(
        'nav'
      )
    })

    it('returns undefined for unmatched or invalid emails', () => {
      expect(getMemberByUserEmail('ola@unknown.example')).toBeUndefined()
      expect(getMemberByUserEmail(null)).toBeUndefined()
    })
  })

  describe('canUserEditMemberProfile', () => {
    it('denies unauthenticated users', () => {
      const nav = getMemberBySlug('nav')!
      expect(canUserEditMemberProfile(nav, null)).toEqual({
        canEdit: false,
        reason: 'unauthenticated',
      })
    })

    it('allows site admins regardless of email domain', () => {
      const nav = getMemberBySlug('nav')!
      expect(
        canUserEditMemberProfile(nav, {
          email: 'admin@other-org.no',
          isAdmin: true,
        })
      ).toEqual({
        canEdit: true,
        reason: 'admin',
      })
    })

    it('allows users whose email domain matches member domains', () => {
      const nav = getMemberBySlug('nav')!
      expect(
        canUserEditMemberProfile(nav, {
          email: 'ola.nordmann@nav.no',
          isAdmin: false,
        })
      ).toEqual({
        canEdit: true,
        matchedDomain: 'nav.no',
        reason: 'domain_match',
      })
    })

    it('allows users whose email is a subdomain of a member domain', () => {
      const nav = getMemberBySlug('nav')!
      expect(
        canUserEditMemberProfile(nav, {
          email: 'ola@utvikling.nav.no',
          isAdmin: false,
        })
      ).toEqual({
        canEdit: true,
        matchedDomain: 'nav.no',
        reason: 'domain_match',
      })
    })

    it('denies users from a different organization domain', () => {
      const nav = getMemberBySlug('nav')!
      expect(
        canUserEditMemberProfile(nav, {
          email: 'ola@skatteetaten.no',
          isAdmin: false,
        })
      ).toEqual({
        canEdit: false,
        reason: 'domain_mismatch',
      })
    })

    it('denies multi-@ email spoofing and lookalike domain prefixes', () => {
      const nav = getMemberBySlug('nav')!
      expect(
        canUserEditMemberProfile(nav, {
          email: 'user@evil.com@nav.no',
          isAdmin: false,
        })
      ).toEqual({
        canEdit: false,
        reason: 'domain_mismatch',
      })
      expect(
        canUserEditMemberProfile(nav, {
          email: 'user@evil-nav.no',
          isAdmin: false,
        })
      ).toEqual({
        canEdit: false,
        reason: 'domain_mismatch',
      })
    })

    it('allows users listed in the platform team by Slack ID even with a different email domain', () => {
      const nav = getMemberBySlug('nav')!
      const profileWithTeam: MemberProfile = {
        ...mockProfile,
        team: [
          {
            name: 'Kari Konsulent',
            role: 'Plattformutvikler',
            slackUrl: 'https://offentlig-paas-no.slack.com/team/U12345678/',
          },
        ],
      }
      expect(
        canUserEditMemberProfile(
          nav,
          {
            email: 'kari@konsulenthus.no',
            isAdmin: false,
            slackId: 'u12345678',
          },
          profileWithTeam
        )
      ).toEqual({
        canEdit: true,
        reason: 'team_member',
      })
    })

    it('rejects non-Slack URLs or malformed Slack IDs in team matching', () => {
      const nav = getMemberBySlug('nav')!
      const spoofedProfile: MemberProfile = {
        ...mockProfile,
        team: [
          {
            name: 'Attacker',
            role: 'Lead',
            slackUrl: 'https://evil.example.com/team/U12345678',
          },
        ],
      }
      expect(
        canUserEditMemberProfile(
          nav,
          {
            email: 'attacker@konsulenthus.no',
            isAdmin: false,
            slackId: 'U12345678',
          },
          spoofedProfile
        )
      ).toEqual({
        canEdit: false,
        reason: 'domain_mismatch',
      })
    })
  })

  describe('upsertMemberProfileSchema', () => {
    const validInput: UpsertMemberProfileInput = {
      slug: 'nav',
      visibility: 'public',
      platformAccess: 'public',
      platformName: 'Nais',
      platformDescription: 'Applikasjonsplattformen til Nav',
      platformHref: 'https://nais.io',
      platformLabel: 'nais.io',
      theme: mockProfile.theme,
      tagline: mockProfile.tagline,
      taglineEn: mockProfile.taglineEn,
      about: mockProfile.about,
      aboutEn: mockProfile.aboutEn,
      cncfEndUserMember: true,
      openSourceFirst: true,
      cloudProviders: mockProfile.cloudProviders,
      stats: [],
      capabilities: [],
      cncfProjects: [],
      techStack: [],
      team: [],
      openPositions: [],
      links: [],
    }

    it('allows empty platformHref and platformLabel when platformAccess is internal', () => {
      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          platformAccess: 'internal',
          platformHref: undefined,
          platformLabel: undefined,
        }).success
      ).toBe(true)

      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          platformAccess: 'public',
          platformHref: undefined,
          platformLabel: undefined,
        }).success
      ).toBe(false)
    })

    it('rejects javascript: and data: URLs in link fields', () => {
      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          platformHref: 'javascript:alert(1)',
        }).success
      ).toBe(false)

      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          links: [
            {
              title: 'XSS',
              url: 'data:text/html,<script>alert(1)</script>',
              type: 'docs',
            },
          ],
        }).success
      ).toBe(false)
    })

    it('rejects invalid GitHub handles and protocol-relative logo paths', () => {
      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          team: [{ name: 'Ola', role: 'Lead', github: '../../evil?x=1' }],
        }).success
      ).toBe(false)

      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          cncfProjects: [
            {
              name: 'Kubernetes',
              category: 'Orchestration',
              maturity: 'graduated',
              usageNote: 'Core',
              logo: '//evil.com/payload.svg',
            },
          ],
        }).success
      ).toBe(false)
    })

    it('rejects duplicate section IDs in theme.sectionOrder', () => {
      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          theme: {
            ...validInput.theme,
            sectionOrder: ['cncf', 'cncf'],
          },
        }).success
      ).toBe(false)
    })

    it('normalizes bare Slack IDs and rejects non-Slack URLs in team.slackUrl', () => {
      const parsed = upsertMemberProfileSchema.safeParse({
        ...validInput,
        team: [{ name: 'Ola', role: 'Lead', slackUrl: 'u12345678' }],
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.team[0]?.slackUrl).toBe(
          'https://offentlig-paas-no.slack.com/team/U12345678'
        )
      }

      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          team: [
            {
              name: 'Ola',
              role: 'Lead',
              slackUrl: 'https://evil.com/team/U12345678',
            },
          ],
        }).success
      ).toBe(false)

      expect(
        upsertMemberProfileSchema.safeParse({
          ...validInput,
          team: [{ name: 'Ola', role: 'Lead', slackUrl: '@ola' }],
        }).success
      ).toBe(false)
    })
  })

  describe('memberProfileService', () => {
    it('fetches profile by canonical slug', async () => {
      mockRepo.findBySlug.mockResolvedValue(mockProfile)

      const result = await memberProfileService.getBySlug('NAV')

      expect(result).toEqual(mockProfile)
      expect(mockRepo.findBySlug).toHaveBeenCalledWith('nav')
    })

    it('hides internal profiles by default unless includeInternal is true', async () => {
      const internalProfile: MemberProfile = {
        ...mockProfile,
        visibility: 'internal',
      }
      mockRepo.findBySlug.mockResolvedValue(internalProfile)

      expect(await memberProfileService.getBySlug('nav')).toBeNull()
      expect(
        await memberProfileService.getBySlug('nav', { includeInternal: true })
      ).toEqual(internalProfile)
    })

    it('upserts profile with canonical slug and editor metadata', async () => {
      mockRepo.upsert.mockResolvedValue(mockProfile)

      const input: UpsertMemberProfileInput = {
        slug: 'NAV',
        visibility: 'public',
        platformAccess: 'public',
        platformName: 'Nais',
        platformDescription: 'Applikasjonsplattformen til Nav',
        platformHref: 'https://nais.io',
        platformLabel: 'nais.io',
        theme: mockProfile.theme,
        tagline: mockProfile.tagline,
        taglineEn: mockProfile.taglineEn,
        about: mockProfile.about,
        aboutEn: mockProfile.aboutEn,
        cncfEndUserMember: true,
        openSourceFirst: true,
        cloudProviders: mockProfile.cloudProviders,
        stats: [],
        capabilities: [],
        cncfProjects: [],
        techStack: [],
        team: [],
        openPositions: [],
        links: [],
      }

      const result = await memberProfileService.upsert(input, {
        name: 'Ola Nordmann',
        email: 'ola@nav.no',
      })

      expect(result).toEqual(mockProfile)
      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'nav' }),
        { name: 'Ola Nordmann', email: 'ola@nav.no' }
      )
    })

    it('throws when upserting for unknown member slug', async () => {
      await expect(
        memberProfileService.upsert({
          ...mockProfile,
          slug: 'unknown-org',
        } as UpsertMemberProfileInput)
      ).rejects.toThrow('Member not found for slug: unknown-org')
    })

    it('skips orphaned profiles in findMemberForUser and finds valid member by Slack ID', async () => {
      const orphanedProfile: MemberProfile = {
        ...mockProfile,
        slug: 'deleted-non-existent-org',
        team: [
          {
            name: 'Kari',
            role: 'Dev',
            slackUrl: 'https://offentlig-paas-no.slack.com/team/U99999999',
          },
        ],
      }
      const validNavProfile: MemberProfile = {
        ...mockProfile,
        slug: 'nav',
        team: [
          {
            name: 'Kari',
            role: 'Dev',
            slackUrl: 'https://offentlig-paas-no.slack.com/team/U99999999',
          },
        ],
      }
      mockRepo.findAll.mockResolvedValue([orphanedProfile, validNavProfile])

      const found = await memberProfileService.findMemberForUser({
        email: 'kari@konsulent.no',
        slackId: 'U99999999',
      })

      expect(found?.member.getSlug()).toBe('nav')
      expect(found?.profile).toEqual(validNavProfile)
    })
  })
})
