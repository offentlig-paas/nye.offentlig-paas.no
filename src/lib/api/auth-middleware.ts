import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEventBySlug, canUserAccessEvent } from '@/lib/events/helpers'
import type { Event } from '@/lib/events/types'
import type { Session } from 'next-auth'

interface AuthContext {
  user: NonNullable<Session['user']>
  session: Session
}

export interface EventAuthContext extends AuthContext {
  event: Event
  slug: string
}

interface RequestContext {
  endpoint: string
  method: string
  params?: Record<string, string>
}

interface AuthOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  requireEventAccess?: boolean
  logUnauthorized?: boolean
}

/**
 * Authentication and authorization middleware for API routes
 */
class AuthMiddleware {
  private static logUnauthorizedAccess(
    request: NextRequest,
    context: RequestContext,
    reason: string,
    user?: AuthContext['user'],
    event?: Event,
    additionalData?: Record<string, unknown>
  ) {
    const logData: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      endpoint: context.endpoint,
      method: context.method,
      reason,
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      ...additionalData,
    }

    if (user) {
      logData.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        slackId: user.slackId,
        isAdmin: user.isAdmin,
        adminGroups: user.adminGroups,
      }
    }

    if (event) {
      logData.event = {
        slug: event.slug,
        title: event.title,
        organizers:
          event.organizers?.map(org => ({
            name: org.name,
            org: org.org,
          })) || [],
      }
    }

    console.warn('⚠️  Unauthorized API access attempt:', logData)
  }

  /**
   * Basic authentication check - verifies user is logged in
   */
  static async requireAuthentication(
    request: NextRequest,
    context: RequestContext
  ): Promise<
    | { success: true; auth: AuthContext }
    | { success: false; response: NextResponse }
  > {
    const session = await auth()

    if (!session?.user) {
      this.logUnauthorizedAccess(request, context, 'No authenticated session')

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Ikke autentiseret' },
          { status: 401 }
        ),
      }
    }

    return {
      success: true,
      auth: { user: session.user, session },
    }
  }

  /**
   * Admin authorization check - verifies user has admin privileges
   */
  static async requireAdmin(
    request: NextRequest,
    context: RequestContext
  ): Promise<
    | { success: true; auth: AuthContext }
    | { success: false; response: NextResponse }
  > {
    const authResult = await this.requireAuthentication(request, context)

    if (!authResult.success) {
      return authResult
    }

    const { auth } = authResult

    if (!auth.user.isAdmin) {
      this.logUnauthorizedAccess(
        request,
        context,
        'User does not have admin privileges',
        auth.user
      )

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Ikke autoriseret - kræver admin-rettigheder' },
          { status: 403 }
        ),
      }
    }

    return { success: true, auth }
  }

  /**
   * Event access authorization - verifies user can access specific event (admin or organizer)
   */
  static async requireEventAccess(
    request: NextRequest,
    context: RequestContext,
    slug: string,
    additionalParams?: Record<string, string>
  ): Promise<
    | { success: true; auth: EventAuthContext }
    | { success: false; response: NextResponse }
  > {
    const authResult = await this.requireAuthentication(request, context)

    if (!authResult.success) {
      return authResult
    }

    const { auth } = authResult

    // Get the event
    let event: Event | null = null
    try {
      event = await getEventBySlug(slug)
    } catch (error) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Feil ved henting av fagdag',
            details: (error as Error).message,
          },
          { status: 500 }
        ),
      }
    }
    if (!event) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Fagdag ikke funnet' },
          { status: 404 }
        ),
      }
    }

    // Check access
    if (!canUserAccessEvent(event, auth.user)) {
      this.logUnauthorizedAccess(
        request,
        context,
        'User is not admin or event organizer',
        auth.user,
        event,
        additionalParams
      )

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Ikke autoriseret' },
          { status: 403 }
        ),
      }
    }

    return {
      success: true,
      auth: { ...auth, event, slug },
    }
  }

  /**
   * Flexible authorization middleware with configurable options
   */
  static async authorize(
    request: NextRequest,
    context: RequestContext,
    options: AuthOptions = {},
    slug?: string,
    additionalParams?: Record<string, string>
  ): Promise<
    | {
        success: true
        auth: AuthContext | EventAuthContext | { user: null; session: null }
      }
    | { success: false; response: NextResponse }
  > {
    const {
      requireAuth = true,
      requireAdmin = false,
      requireEventAccess = false,
    } = options

    // Skip all checks if no authentication required
    if (!requireAuth) {
      const session = await auth()
      return {
        success: true,
        auth: session?.user
          ? { user: session.user, session }
          : { user: null, session: null },
      }
    }

    // Admin check (includes authentication)
    if (requireAdmin) {
      return await this.requireAdmin(request, context)
    }

    // Event access check (includes authentication)
    if (requireEventAccess && slug) {
      return await this.requireEventAccess(
        request,
        context,
        slug,
        additionalParams
      )
    }

    // Basic authentication only
    return await this.requireAuthentication(request, context)
  }
}

/**
 * Convenience function for most common pattern: event access authorization
 */
export async function authorizeEventAccess(
  request: NextRequest,
  endpoint: string,
  method: string,
  slug: string,
  additionalParams?: Record<string, string>
): Promise<
  | { success: true; auth: EventAuthContext }
  | { success: false; response: NextResponse }
> {
  return AuthMiddleware.authorize(
    request,
    { endpoint, method, params: additionalParams },
    { requireEventAccess: true },
    slug,
    additionalParams
  ) as Promise<
    | { success: true; auth: EventAuthContext }
    | { success: false; response: NextResponse }
  >
}
