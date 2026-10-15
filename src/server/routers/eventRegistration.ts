import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import {
  getEvent,
  getStatus,
  isAcceptingRegistrations,
} from '@/lib/events/helpers'
import { eventRegistrationService } from '@/domains/event-registration'
import { revalidatePath } from 'next/cache'
import { TRPCError } from '@trpc/server'
import { AttendanceType, Status } from '@/lib/events/types'

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
  dietary: z.string().optional(),
  organisation: z.string().optional(),
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

      if (!isAcceptingRegistrations(event)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Påmelding er stengt for denne fagdagen',
        })
      }

      if (
        !event.registration.attendanceTypes.includes(
          registrationData.attendanceType
        )
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ugyldig deltakelsestype for denne fagdagen',
        })
      }

      try {
        const registration = await eventRegistrationService.registerForEvent(
          {
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
          },
          event
        )

        revalidatePath(`/fagdag/${slug}`)
        revalidatePath('/profil')

        const message =
          registration.status === 'waitlist'
            ? 'Påmelding registrert på venteliste!'
            : 'Påmelding registrert!'

        return {
          message,
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

      const event = getEvent(input.slug)
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fagdag ikke funnet',
        })
      }

      if (getStatus(event) === Status.Past) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kan ikke melde av etter at fagdagen er avsluttet',
        })
      }

      const registration = await eventRegistrationService.getEventRegistrations(
        input.slug
      )
      const userRegistration = registration.find(
        r => r.slackUserId === ctx.user.slackId
      )

      if (!userRegistration || userRegistration.status === 'cancelled') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Du er ikke påmeldt denne fagdagen',
        })
      }

      await eventRegistrationService.cancelRegistration(
        userRegistration._id!,
        event
      )

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

      const event = getEvent(slug)
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fagdag ikke funnet',
        })
      }

      if (getStatus(event) === Status.Past) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Kan ikke oppdatere påmelding etter at fagdagen er avsluttet',
        })
      }

      if (
        updates.attendanceType &&
        !event.registration.attendanceTypes.includes(updates.attendanceType)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ugyldig deltakelsestype for denne fagdagen',
        })
      }

      const registration =
        await eventRegistrationService.getEventRegistrations(slug)
      const userRegistration = registration.find(
        r => r.slackUserId === ctx.user.slackId
      )

      if (
        !userRegistration ||
        (userRegistration.status !== 'confirmed' &&
          userRegistration.status !== 'waitlist')
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Du er ikke påmeldt denne fagdagen',
        })
      }

      const updated = await eventRegistrationService.updateRegistration(
        userRegistration._id!,
        updates,
        event
      )

      revalidatePath(`/fagdag/${slug}`)
      revalidatePath('/profil')

      const movedToWaitlist =
        updated.status === 'waitlist' && userRegistration.status !== 'waitlist'

      return {
        message: movedToWaitlist
          ? 'Fysiske plasser er fullbooket. Du er satt på venteliste.'
          : 'Påmelding oppdatert!',
        registration: updated,
      }
    }),

  updateAttendance: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        status: z.enum(['attended', 'no-show']),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      const eventStatus = getStatus(event)
      if (eventStatus === Status.Upcoming) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kan ikke oppdatere oppmøte før fagdagen har startet',
        })
      }

      const userRegistration =
        await eventRegistrationService.getRegistrationBySlackUserId(
          input.slug,
          ctx.user.slackId
        )

      if (
        !userRegistration ||
        (userRegistration.status !== 'confirmed' &&
          userRegistration.status !== 'attended' &&
          userRegistration.status !== 'no-show')
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun deltakere med bekreftet plass kan oppdatere oppmøte',
        })
      }

      const updated = await eventRegistrationService.updateRegistrationStatus(
        userRegistration._id!,
        input.status
      )

      revalidatePath(`/fagdag/${input.slug}`)
      revalidatePath('/profil')

      return {
        message:
          input.status === 'attended'
            ? 'Oppmøte bekreftet!'
            : 'Registrert at du ikke kunne delta.',
        registration: updated,
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
