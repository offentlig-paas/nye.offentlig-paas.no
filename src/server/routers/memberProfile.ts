import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { revalidatePath } from 'next/cache'
import {
  memberProfileService,
  getMemberBySlug,
  canUserEditMemberProfile,
  upsertMemberProfileSchema,
  CNCF_PROJECT_CATALOG,
  type CncfCatalogItem,
  type CncfMaturityTier,
  type CncfProjectCategory,
} from '@/domains/member-profile'
import { getSlackUsersForMember } from '@/lib/members-slack'
import { aggregateSlackUsersByDomain } from '@/lib/slack/users'

interface RawLandscapeProject {
  name?: string
  maturity?: string
  category?: string
  subcategory?: string
  logo_url?: string
  homepage_url?: string
  lfx_slug?: string
  description?: string
  repositories?: Array<{ url?: string; primary?: boolean }>
}

let cachedLandscapeProjects: CncfCatalogItem[] | null = null
let cachedLandscapeAt = 0
const LANDSCAPE_CACHE_TTL_MS = 24 * 60 * 60 * 1000

function mapLandscapeCategory(
  category?: string,
  subcategory?: string
): CncfProjectCategory {
  const sub = (subcategory ?? '').toLowerCase()
  const cat = (category ?? '').toLowerCase()
  if (
    sub.includes('mesh') ||
    sub.includes('network') ||
    sub.includes('proxy') ||
    sub.includes('gateway') ||
    sub.includes('remote procedure')
  ) {
    return 'Networking & Service Mesh'
  }
  if (
    cat.includes('observability') ||
    sub.includes('observability') ||
    sub.includes('chaos') ||
    sub.includes('optimization')
  ) {
    return 'Observability'
  }
  if (
    sub.includes('security') ||
    sub.includes('key management') ||
    sub.includes('registry')
  ) {
    return 'Security & Policy'
  }
  if (
    sub.includes('storage') ||
    sub.includes('database') ||
    sub.includes('streaming') ||
    sub.includes('messaging')
  ) {
    return 'Storage & Data'
  }
  if (
    sub.includes('scheduling') ||
    sub.includes('orchestration') ||
    sub.includes('automation') ||
    sub.includes('container runtime') ||
    sub.includes('coordination')
  ) {
    return 'Orchestration & GitOps'
  }
  return 'Platform & App Definition'
}

async function fetchCncfLandscapeCatalog(): Promise<CncfCatalogItem[]> {
  if (
    cachedLandscapeProjects &&
    Date.now() - cachedLandscapeAt < LANDSCAPE_CACHE_TTL_MS
  ) {
    return cachedLandscapeProjects
  }

  try {
    const res = await fetch('https://landscape.cncf.io/api/projects/all.json', {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return CNCF_PROJECT_CATALOG

    const raw = (await res.json()) as RawLandscapeProject[]
    const byLowerName = new Map<string, CncfCatalogItem>()
    for (const curated of CNCF_PROJECT_CATALOG) {
      byLowerName.set(curated.name.toLowerCase(), curated)
      for (const alias of curated.aliases ?? []) {
        byLowerName.set(alias.toLowerCase(), curated)
      }
    }

    const merged: CncfCatalogItem[] = [...CNCF_PROJECT_CATALOG]

    for (const item of raw) {
      const name = item.name?.trim()
      if (!name) continue
      const maturityRaw = item.maturity?.toLowerCase()
      const tier: CncfMaturityTier | null =
        maturityRaw === 'graduated'
          ? 'Graduated'
          : maturityRaw === 'incubating'
            ? 'Incubating'
            : maturityRaw === 'sandbox'
              ? 'Sandbox'
              : null
      if (!tier) continue

      if (byLowerName.has(name.toLowerCase())) continue

      const primaryRepo =
        item.repositories?.find(r => r.primary)?.url ??
        item.repositories?.[0]?.url ??
        ''
      const slug =
        item.lfx_slug?.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      const cncfUrl = `https://www.cncf.io/projects/${slug}/`

      const entry: CncfCatalogItem = {
        name,
        tier,
        category: mapLandscapeCategory(item.category, item.subcategory),
        cncfUrl,
        sourceRepoUrl: primaryRepo,
        logoUrl: item.logo_url ?? '',
        description: item.description?.trim() ?? '',
      }
      byLowerName.set(name.toLowerCase(), entry)
      merged.push(entry)
    }

    cachedLandscapeProjects = merged
    cachedLandscapeAt = Date.now()
    return merged
  } catch {
    return CNCF_PROJECT_CATALOG
  }
}

export const memberProfileRouter = router({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(80) }))
    .query(async ({ input, ctx }) => {
      return await memberProfileService.getBySlug(input.slug, {
        includeInternal: Boolean(ctx.session?.user),
      })
    }),

  listPlatforms: publicProcedure.query(async ({ ctx }) => {
    return await memberProfileService.listPlatformSummaries({
      includeInternal: Boolean(ctx.session?.user),
    })
  }),

  getMyMembership: publicProcedure.query(async ({ ctx }) => {
    const matched = await memberProfileService.findMemberForUser(
      ctx.session?.user
    )
    if (!matched) return null
    const { member, profile } = matched
    const slug = member.getSlug()
    return {
      slug,
      name: member.name,
      hasProfile: Boolean(profile?.platformName),
      platformName: profile?.platformName ?? null,
      visibility: profile?.visibility ?? null,
      platformAccess: profile?.platformAccess ?? null,
    }
  }),

  getPermissions: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(80) }))
    .query(async ({ input, ctx }) => {
      const user = ctx.session?.user
      const emailParts = user?.email?.toLowerCase().trim().split('@')
      const emailDomain =
        emailParts?.length === 2 && emailParts[0] && emailParts[1]
          ? emailParts[1]
          : undefined
      const isAdmin = Boolean(user?.isAdmin)
      const currentUser = user
        ? {
            name: user.name ?? '',
            email: user.email ?? '',
            slackId: user.slackId ?? '',
            title: user.title ?? '',
          }
        : null
      const member = getMemberBySlug(input.slug)
      if (!member) {
        return {
          canEdit: false,
          reason: 'domain_mismatch' as const,
          isAuthenticated: Boolean(user),
          isAdmin,
          emailDomain,
          matchedDomain: undefined as string | undefined,
          requiredDomains: [] as string[],
          currentUser,
        }
      }
      const existingProfile = user
        ? await memberProfileService.getBySlug(member.getSlug(), {
            includeInternal: true,
          })
        : null
      const perm = canUserEditMemberProfile(member, user, existingProfile)
      return {
        ...perm,
        isAuthenticated: Boolean(user),
        isAdmin,
        emailDomain,
        requiredDomains: member.domains,
        currentUser,
      }
    }),

  upsert: protectedProcedure
    .input(upsertMemberProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const member = getMemberBySlug(input.slug)
      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Medlemsorganisasjon ikke funnet',
        })
      }

      const existingProfile = await memberProfileService.getBySlug(
        member.getSlug(),
        { includeInternal: true }
      )
      const perm = canUserEditMemberProfile(member, ctx.user, existingProfile)
      if (!perm.canEdit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Du må være innlogget med en e-postadresse fra ${member.domains.join(' eller ')} eller være registrert i plattformteamet for å redigere plattformprofilen til ${member.name}`,
        })
      }

      const profile = await memberProfileService.upsert(input, {
        name: ctx.user.name ?? ctx.user.email ?? 'Ukjent',
        email: ctx.user.email ?? undefined,
        slackId: ctx.user.slackId ?? undefined,
      })

      const canonicalSlug = member.getSlug()
      revalidatePath('/plattformer')
      revalidatePath('/medlemmer')
      revalidatePath(`/medlemmer/${canonicalSlug}`)
      revalidatePath(`/medlemmer/${canonicalSlug}/rediger`)

      return profile
    }),

  getSlackColleagues: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(80),
        query: z.string().max(80).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = getMemberBySlug(input.slug)
      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Medlemsorganisasjon ikke funnet',
        })
      }

      const existingProfile = await memberProfileService.getBySlug(
        member.getSlug(),
        { includeInternal: true }
      )
      const perm = canUserEditMemberProfile(member, ctx.user, existingProfile)
      if (!perm.canEdit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Ingen tilgang',
        })
      }

      const detail = await getSlackUsersForMember(member.name)
      const orgUsers = detail?.member.users ?? []
      const orgUserIds = new Set(orgUsers.map(u => u.id))

      const trimmedQuery = input.query?.trim().toLowerCase() ?? ''
      const results = orgUsers
        .filter(u => {
          if (!trimmedQuery) return true
          return [u.realName, u.displayName, u.name, u.title ?? ''].some(f =>
            f.toLowerCase().includes(trimmedQuery)
          )
        })
        .map(u => ({
          id: u.id,
          name: u.name,
          realName: u.realName,
          displayName: u.displayName,
          title: u.title,
          avatar: u.avatar,
          url: `https://offentlig-paas-no.slack.com/team/${u.id}`,
          fromOrg: true,
        }))

      if (trimmedQuery.length >= 2 && results.length < 30) {
        const { domains, status } = await aggregateSlackUsersByDomain()
        if (status === 'ok') {
          for (const bucket of domains.values()) {
            for (const u of bucket.users) {
              if (results.length >= 30) break
              if (orgUserIds.has(u.id)) continue
              const matches = [
                u.realName,
                u.displayName,
                u.name,
                u.title ?? '',
              ].some(f => f.toLowerCase().includes(trimmedQuery))
              if (matches) {
                results.push({
                  id: u.id,
                  name: u.name,
                  realName: u.realName,
                  displayName: u.displayName,
                  title: u.title,
                  avatar: u.avatar,
                  url: `https://offentlig-paas-no.slack.com/team/${u.id}`,
                  fromOrg: false,
                })
              }
            }
            if (results.length >= 30) break
          }
        }
      }

      return {
        users: results.slice(0, 50),
        totalOrgUsers: orgUsers.length,
      }
    }),

  getCncfLandscape: publicProcedure.query(async () => {
    return await fetchCncfLandscapeCatalog()
  }),
})
