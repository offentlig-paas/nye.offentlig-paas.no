import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/auth'
import { getEventBySlug, canUserAccessEvent } from '@/lib/events/helpers'
import type { Session } from 'next-auth'
import type { Event } from '@/lib/events/types'
import superjson from 'superjson'

export interface Context {
  session: Session | null
  headers: Headers
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth()

  return {
    session,
    headers: opts.headers,
  }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Ikke autentisert',
    })
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  })
})

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Ikke autentisert',
    })
  }

  if (!ctx.session.user.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Ikke autorisert - krever admin-rettigheter',
    })
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)

export const createEventAccessMiddleware = (
  slugExtractor: (input: unknown) => string
) =>
  t.middleware(async ({ ctx, next, input }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Ikke autentisert',
      })
    }

    const slug = slugExtractor(input)

    let event: Event | null = null
    try {
      event = await getEventBySlug(slug)
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Feil ved henting av fagdag',
        cause: error,
      })
    }

    if (!event) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Fagdag ikke funnet',
      })
    }

    if (!canUserAccessEvent(event, ctx.session.user)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Ikke autorisert',
      })
    }

    return next({
      ctx: {
        session: ctx.session,
        user: ctx.session.user,
        event,
        slug,
      },
    })
  })
