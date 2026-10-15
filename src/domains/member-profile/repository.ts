import 'server-only'
import groq from 'groq'
import { sanityClient } from '@/lib/sanity/config'
import { prepareSanityDocument } from '@/lib/sanity/utils'
import type {
  MemberProfile,
  MemberPlatformSummary,
  UpsertMemberProfileInput,
} from './types'

export class MemberProfileRepository {
  async findBySlug(slug: string): Promise<MemberProfile | null> {
    const normalized = slug.toLowerCase()
    const query = groq`*[_type == "memberProfile" && slug == $slug][0]`
    try {
      const result = await sanityClient.fetch<Record<string, unknown> | null>(
        query,
        { slug: normalized },
        { cache: 'no-store', next: { revalidate: 0 } }
      )
      return result ? this.mapToMemberProfile(result) : null
    } catch {
      return null
    }
  }

  async findAll(): Promise<MemberProfile[]> {
    const query = groq`*[_type == "memberProfile"] | order(platformName asc)`
    try {
      const results = await sanityClient.fetch<Record<string, unknown>[]>(
        query,
        {},
        { cache: 'no-store', next: { revalidate: 0 } }
      )
      return (results ?? []).map(r => this.mapToMemberProfile(r))
    } catch {
      return []
    }
  }

  async listPlatformSummaries(): Promise<MemberPlatformSummary[]> {
    const query = groq`*[_type == "memberProfile" && defined(platformName) && platformName != ""] | order(platformName asc) {
      slug,
      "name": platformName,
      "description": platformDescription,
      "href": coalesce(platformHref, ""),
      "label": coalesce(platformLabel, ""),
      "logo": platformLogo,
      "visibility": coalesce(visibility, "public"),
      "platformAccess": coalesce(platformAccess, select(defined(platformHref) && platformHref != "" => "public", "internal"))
    }`
    try {
      const results = await sanityClient.fetch<MemberPlatformSummary[]>(
        query,
        {},
        { cache: 'no-store', next: { revalidate: 0 } }
      )
      return results ?? []
    } catch {
      return []
    }
  }

  async upsert(
    input: UpsertMemberProfileInput,
    updatedBy?: { name: string; email?: string; slackId?: string }
  ): Promise<MemberProfile> {
    const slug = input.slug.toLowerCase()
    const docId = `memberProfile-${slug}`
    const verifiedUpdated = new Date().toISOString().slice(0, 10)

    const rawDoc = {
      _id: docId,
      _type: 'memberProfile',
      slug,
      visibility: input.visibility ?? 'public',
      platformAccess: input.platformAccess ?? 'public',
      platformName: input.platformName,
      platformDescription: input.platformDescription,
      platformHref: input.platformHref || '',
      platformLabel: input.platformLabel || '',
      platformLogo: input.platformLogo || undefined,
      verifiedUpdated,
      updatedBy: updatedBy
        ? {
            name: updatedBy.name,
            email: updatedBy.email,
            slackId: updatedBy.slackId,
          }
        : undefined,
      theme: input.theme,
      tagline: input.tagline,
      taglineEn: input.taglineEn,
      about: input.about,
      aboutEn: input.aboutEn,
      cncfEndUserMember: input.cncfEndUserMember ?? false,
      openSourceFirst: input.openSourceFirst ?? true,
      cloudProviders: input.cloudProviders ?? [],
      stats: input.stats ?? [],
      manifestExample:
        input.manifestExample && input.manifestExample.code.trim()
          ? input.manifestExample
          : undefined,
      capabilities: input.capabilities ?? [],
      cncfProjects: (input.cncfProjects ?? []).map(p => ({
        ...p,
        sourceRepoUrl: p.sourceRepoUrl || undefined,
        logoUrl: p.logoUrl || undefined,
      })),
      techStack: input.techStack ?? [],
      team: (input.team ?? []).map(t => ({
        ...t,
        slackUrl: t.slackUrl || undefined,
        github: t.github || undefined,
      })),
      openPositions: input.openPositions ?? [],
      links: input.links ?? [],
    }

    const prepared = prepareSanityDocument(rawDoc)
    const saved = await sanityClient.createOrReplace(prepared)
    return this.mapToMemberProfile(saved as unknown as Record<string, unknown>)
  }

  private mapToMemberProfile(doc: Record<string, unknown>): MemberProfile {
    const themeRaw = (doc.theme as Record<string, unknown> | undefined) ?? {}
    const updatedByRaw = doc.updatedBy as { name?: string } | undefined
    const platformHref = (doc.platformHref as string) ?? ''

    return {
      _id: doc._id as string | undefined,
      slug: (doc.slug as string) ?? '',
      visibility: doc.visibility === 'internal' ? 'internal' : 'public',
      platformAccess:
        doc.platformAccess === 'internal' ||
        (!doc.platformAccess && !platformHref)
          ? 'internal'
          : 'public',
      platformName: (doc.platformName as string) ?? '',
      platformDescription: (doc.platformDescription as string) ?? '',
      platformHref,
      platformLabel: (doc.platformLabel as string) ?? '',
      platformLogo: (doc.platformLogo as string) || undefined,
      verifiedUpdated:
        (doc.verifiedUpdated as string) ??
        new Date().toISOString().slice(0, 10),
      updatedBy: updatedByRaw?.name ? { name: updatedByRaw.name } : undefined,
      theme: {
        accentColor:
          (themeRaw.accentColor as MemberProfile['theme']['accentColor']) ??
          'teal',
        heroStyle:
          (themeRaw.heroStyle as MemberProfile['theme']['heroStyle']) ??
          'gradient',
        sectionOrder:
          (themeRaw.sectionOrder as MemberProfile['theme']['sectionOrder']) ?? [
            'capabilities',
            'cncf',
            'talks',
            'architecture',
            'team',
            'jobs',
          ],
      },
      tagline: (doc.tagline as string) ?? '',
      taglineEn: (doc.taglineEn as string) ?? '',
      about: (doc.about as string) ?? '',
      aboutEn: (doc.aboutEn as string) ?? '',
      cncfEndUserMember: Boolean(doc.cncfEndUserMember),
      openSourceFirst:
        doc.openSourceFirst === undefined ? true : Boolean(doc.openSourceFirst),
      cloudProviders: (doc.cloudProviders as string[]) ?? [],
      stats: (doc.stats as MemberProfile['stats']) ?? [],
      manifestExample: doc.manifestExample as MemberProfile['manifestExample'],
      capabilities: (doc.capabilities as MemberProfile['capabilities']) ?? [],
      cncfProjects: (doc.cncfProjects as MemberProfile['cncfProjects']) ?? [],
      techStack: (doc.techStack as MemberProfile['techStack']) ?? [],
      team: (doc.team as MemberProfile['team']) ?? [],
      openPositions:
        (doc.openPositions as MemberProfile['openPositions']) ?? [],
      links: (doc.links as MemberProfile['links']) ?? [],
    }
  }
}
