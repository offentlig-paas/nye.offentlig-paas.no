import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { getEvent } from '@/lib/events/helpers'
import { eventRegistrationService } from '@/domains/event-registration'
import { revalidatePath } from 'next/cache'
import { TRPCError } from '@trpc/server'
import { AttendanceType } from '@/lib/events/types'

const registerSchema = z.object({
  slug: z.string(),
  comments: z.string().optional(),
  dietary: z.string().optional(),
  organisation: z.string().optional(),
  attendanceType: z.nativeEnum(AttendanceType),
  attendingSocialEvent: z.boolean().optional(),
})

const updateRegistrationSchema = z.object({
  slug: z.string(),
  attendingSocialEvent: z.boolean().optional(),
  attendanceType: z.nativeEnum(AttendanceType).optional(),
  comments: z.string().optional(),
})

export const eventRegistrationRouter = router({
  register: protectedProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { slug, ...registrationData } = input

      if (!ctx.user.email || !ctx.user.name) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email and name are required',
        })
      }

      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Slack ID not found in session',
        })
      }

      const event = getEvent(slug)

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fagdag ikke funnet',
        })
      }

      try {
        const registration = await eventRegistrationService.registerForEvent({
          eventSlug: slug,
          name: ctx.user.name,
          email: ctx.user.email,
          slackUserId: ctx.user.slackId,
          organisation:
            registrationData.organisation ||
            ctx.user.statusText ||
            'Ikke oppgitt',
          dietary: registrationData.dietary,
          comments: registrationData.comments,
          attendanceType: registrationData.attendanceType,
          attendingSocialEvent: registrationData.attendingSocialEvent,
        })

        revalidatePath(`/fagdag/${slug}`)
        revalidatePath('/profil')

        return {
          message: 'Påmelding registrert!',
          registration,
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('already registered')) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Du er allerede påmeldt denne fagdagen',
            })
          }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Feil ved påmelding',
        })
      }
    }),

  cancel: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Ikke autentisert',
        })
      }

      const registration = await eventRegistrationService.getEventRegistrations(
        input.slug
      )
      const userRegistration = registration.find(
        r => r.slackUserId === ctx.user.slackId
      )

      if (!userRegistration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Du er ikke påmeldt denne fagdagen',
        })
      }

      await eventRegistrationService.cancelRegistration(userRegistration._id!)

      revalidatePath(`/fagdag/${input.slug}`)
      revalidatePath('/profil')

      return {
        message: 'Påmelding avmeldt!',
      }
    }),

  update: protectedProcedure
    .input(updateRegistrationSchema)
    .mutation(async ({ input, ctx }) => {
      const { slug, ...updates } = input

      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Ikke autentisert',
        })
      }

      const registration =
        await eventRegistrationService.getEventRegistrations(slug)
      const userRegistration = registration.find(
        r => r.slackUserId === ctx.user.slackId
      )

      if (!userRegistration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Du er ikke påmeldt denne fagdagen',
        })
      }

      await eventRegistrationService.updateRegistration(
        userRegistration._id!,
        updates
      )

      revalidatePath(`/fagdag/${slug}`)
      revalidatePath('/profil')

      return {
        message: 'Påmelding oppdatert!',
      }
    }),

  getRegistrationStatus: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user.slackId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Ikke autentisert',
        })
      }

      const event = getEvent(input.slug)

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fagdag ikke funnet',
        })
      }

      const registrations =
        await eventRegistrationService.getEventRegistrations(input.slug)
      const userRegistration = registrations.find(
        r => r.slackUserId === ctx.user.slackId
      )

      const registrationStatus = userRegistration?.status || null

      const registrationCounts =
        await eventRegistrationService.getRegistrationCountsByCategory(
          input.slug
        )

      const activeRegistrations = registrations.filter(
        r => r.status === 'confirmed' || r.status === 'attended'
      )

      const stats = {
        total: activeRegistrations.length,
        persons: registrationCounts.persons,
        organizations: registrationCounts.organizations,
        uniqueOrganizations: registrationCounts.uniqueOrganizations,
        participants:
          registrationStatus === 'confirmed' ||
          registrationStatus === 'attended'
            ? activeRegistrations.slice(0, 12).map(registration => ({
                name: registration.name,
                slackUserId: registration.slackUserId,
              }))
            : [],
      }

      let participantInfo = null
      if (
        registrationStatus === 'confirmed' ||
        registrationStatus === 'attended'
      ) {
        const { getEventParticipantInfo } = await import(
          '@/lib/sanity/event-participant-info'
        )
        participantInfo = await getEventParticipantInfo(input.slug)
      }

      return {
        registrationStatus,
        registration: userRegistration || null,
        stats,
        participantInfo,
      }
    }),

  getStats: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const event = getEvent(input.slug)

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fagdag ikke funnet',
        })
      }

      const registrationCounts =
        await eventRegistrationService.getRegistrationCountsByCategory(
          input.slug
        )

      return {
        registrationCounts,
      }
    }),
})
