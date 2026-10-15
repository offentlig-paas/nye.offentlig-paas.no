import { EventRegistrationRepository } from './repository'
import type {
  EventRegistration,
  CreateEventRegistrationInput,
  CreateManualRegistrationInput,
  UpdateEventRegistrationInput,
  EventRegistrationQuery,
  RegistrationStatus,
} from './types'
import { getAllEvents } from '@/lib/events/helpers'
import { sendDirectMessage } from '@/lib/slack/messaging'

interface OrphanedRegistrationGroup {
  eventSlug: string
  count: number
  registrations: Array<{
    _id: string
    name: string
    email: string
    organisation: string
    status: RegistrationStatus
    attendanceType?: string
  }>
}

export class EventRegistrationService {
  private repository: EventRegistrationRepository

  constructor() {
    this.repository = new EventRegistrationRepository()
  }

  async registerForEvent(
    input: CreateEventRegistrationInput,
    event?: { maxCapacity?: number }
  ): Promise<EventRegistration> {
    const existingRegistration = input.slackUserId
      ? await this.repository.findByEventAndUser(
          input.eventSlug,
          input.slackUserId
        )
      : null

    if (existingRegistration && existingRegistration.status !== 'cancelled') {
      throw new Error('User is already registered for this event')
    }

    this.validateRegistrationInput(input)

    let registrationStatus: RegistrationStatus = 'confirmed'

    // Check capacity only for physical attendance when limit is defined
    if (
      input.attendanceType === 'physical' &&
      event?.maxCapacity !== undefined
    ) {
      const currentPhysicalCount =
        await this.repository.getPhysicalAttendeesCount(input.eventSlug)

      if (currentPhysicalCount >= event.maxCapacity) {
        registrationStatus = 'waitlist'
      }
    }

    if (existingRegistration && existingRegistration.status === 'cancelled') {
      return await this.repository.update(existingRegistration._id!, {
        ...input,
        status: registrationStatus,
        metadata: {
          ...existingRegistration.metadata,
          reregisteredAt: new Date().toISOString(),
        },
      })
    }

    return await this.repository.create(input, registrationStatus)
  }

  async registerManually(
    input: CreateManualRegistrationInput,
    event?: { maxCapacity?: number }
  ): Promise<EventRegistration> {
    const normalizedEmail = input.email.trim().toLowerCase()

    const existingRegistration = await this.repository.findByEventAndEmail(
      input.eventSlug,
      normalizedEmail
    )

    if (existingRegistration && existingRegistration.status !== 'cancelled') {
      throw new Error('En påmelding med denne e-postadressen finnes allerede')
    }

    if (!input.name.trim()) throw new Error('Navn er påkrevd')
    if (!normalizedEmail) throw new Error('E-post er påkrevd')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail))
      throw new Error('Ugyldig e-postformat')
    if (!input.organisation.trim()) throw new Error('Organisasjon er påkrevd')
    if (!input.attendanceType) throw new Error('Deltakertype er påkrevd')

    let registrationStatus: RegistrationStatus = 'confirmed'

    if (
      input.attendanceType === 'physical' &&
      event?.maxCapacity !== undefined
    ) {
      const currentPhysicalCount =
        await this.repository.getPhysicalAttendeesCount(input.eventSlug)
      if (currentPhysicalCount >= event.maxCapacity) {
        registrationStatus = 'waitlist'
      }
    }

    const createInput: CreateEventRegistrationInput = {
      ...input,
      email: normalizedEmail,
      metadata: { source: 'admin' },
    }

    if (existingRegistration && existingRegistration.status === 'cancelled') {
      return await this.repository.update(existingRegistration._id!, {
        ...createInput,
        status: registrationStatus,
        metadata: {
          source: 'admin',
          reregisteredAt: new Date().toISOString(),
        },
      })
    }

    return await this.repository.create(createInput, registrationStatus)
  }

  async getEventRegistrations(eventSlug: string): Promise<EventRegistration[]> {
    return await this.repository.findMany({ eventSlug })
  }

  async getRegistration(id: string): Promise<EventRegistration | null> {
    return await this.repository.findById(id)
  }

  async updateRegistration(
    id: string,
    input: UpdateEventRegistrationInput,
    event?: { maxCapacity?: number; title?: string; end?: Date }
  ): Promise<EventRegistration> {
    const existingRegistration = await this.repository.findById(id)
    if (!existingRegistration) {
      throw new Error('Registration not found')
    }

    const resolvedEvent =
      event ??
      getAllEvents().find(e => e.slug === existingRegistration.eventSlug)
    const updatePayload: UpdateEventRegistrationInput = { ...input }

    if (
      input.attendanceType === 'physical' &&
      existingRegistration.attendanceType !== 'physical'
    ) {
      if (resolvedEvent?.maxCapacity !== undefined) {
        const currentPhysicalCount =
          (await this.repository.getPhysicalAttendeesCount(
            existingRegistration.eventSlug
          )) ?? 0
        if (currentPhysicalCount >= resolvedEvent.maxCapacity) {
          updatePayload.status = 'waitlist'
        } else if (existingRegistration.status === 'waitlist') {
          updatePayload.status = 'confirmed'
        }
      } else if (existingRegistration.status === 'waitlist') {
        updatePayload.status = 'confirmed'
      }
    } else if (
      input.attendanceType === 'digital' &&
      existingRegistration.attendanceType !== 'digital' &&
      existingRegistration.status === 'waitlist'
    ) {
      updatePayload.status = 'confirmed'
    }

    const updated = await this.repository.update(id, updatePayload)

    if (
      input.attendanceType === 'digital' &&
      existingRegistration.attendanceType === 'physical' &&
      existingRegistration.status === 'confirmed'
    ) {
      await this.promoteNextFromWaitlist(
        existingRegistration.eventSlug,
        resolvedEvent
      )
    }

    return updated
  }

  async updateRegistrationStatus(
    id: string,
    status: RegistrationStatus
  ): Promise<EventRegistration> {
    const existingRegistration = await this.repository.findById(id)
    if (!existingRegistration) {
      throw new Error('Registration not found')
    }

    const updated = await this.repository.update(id, { status })

    if (
      status === 'cancelled' &&
      existingRegistration.status === 'confirmed' &&
      existingRegistration.attendanceType === 'physical'
    ) {
      await this.promoteNextFromWaitlist(existingRegistration.eventSlug)
    }

    return updated
  }

  async confirmFromWaitlist(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'confirmed')
  }

  async markAsAttended(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'attended')
  }

  async markAsNoShow(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'no-show')
  }

  async bulkUpdateStatus(
    ids: string[],
    status: RegistrationStatus
  ): Promise<EventRegistration[]> {
    const updates = await Promise.all(
      ids.map(id => this.updateRegistrationStatus(id, status))
    )
    return updates
  }

  async getEventRegistrationStats(
    eventSlug: string
  ): Promise<Record<RegistrationStatus, number>> {
    const registrations = await this.repository.findMany({ eventSlug })

    const stats = {
      confirmed: 0,
      waitlist: 0,
      cancelled: 0,
      attended: 0,
      'no-show': 0,
    } as Record<RegistrationStatus, number>

    registrations.forEach(registration => {
      stats[registration.status] = (stats[registration.status] || 0) + 1
    })

    return stats
  }

  async getActiveRegistrationCount(eventSlug: string): Promise<number> {
    const registrations = await this.repository.findMany({ eventSlug })
    return registrations.filter(
      r => r.status === 'confirmed' || r.status === 'attended'
    ).length
  }

  async cancelRegistration(
    id: string,
    event?: { maxCapacity?: number; title?: string; end?: Date }
  ): Promise<EventRegistration> {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Registration not found')
    }

    const cancelled = await this.repository.update(id, { status: 'cancelled' })

    if (
      existing.status === 'confirmed' &&
      existing.attendanceType === 'physical'
    ) {
      await this.promoteNextFromWaitlist(existing.eventSlug, event)
    }

    return cancelled
  }

  async promoteNextFromWaitlist(
    eventSlug: string,
    event?: { maxCapacity?: number; title?: string; end?: Date }
  ): Promise<EventRegistration | null> {
    const resolvedEvent =
      event ?? getAllEvents().find(e => e.slug === eventSlug)
    if (resolvedEvent?.end && new Date() > resolvedEvent.end) {
      return null
    }

    const waitlisted =
      (await this.repository.findMany({
        eventSlug,
        status: 'waitlist',
      })) ?? []

    const physicalWaitlisted = waitlisted
      .filter(r => r.attendanceType === 'physical' && r._id)
      .sort(
        (a, b) =>
          new Date(a.metadata?.reregisteredAt ?? a.registeredAt).getTime() -
          new Date(b.metadata?.reregisteredAt ?? b.registeredAt).getTime()
      )

    const nextInLine = physicalWaitlisted[0]
    if (!nextInLine?._id) {
      return null
    }

    if (resolvedEvent?.maxCapacity !== undefined) {
      const currentPhysicalCount =
        (await this.repository.getPhysicalAttendeesCount(eventSlug)) ?? 0
      if (currentPhysicalCount >= resolvedEvent.maxCapacity) {
        return null
      }
    }

    const promoted = await this.repository.update(nextInLine._id, {
      status: 'confirmed',
    })

    if (promoted?.slackUserId) {
      try {
        const title = resolvedEvent?.title || eventSlug
        await sendDirectMessage(
          promoted.slackUserId,
          `🎉 En fysisk plass har blitt ledig på *${title}*, og du har nå fått bekreftet plass fra ventelisten!`
        )
      } catch (error) {
        console.error('Failed to send waitlist promotion DM:', error)
      }
    }

    return promoted
  }

  async deleteRegistration(id: string): Promise<void> {
    const existingRegistration = await this.repository.findById(id)
    if (!existingRegistration) {
      throw new Error('Registration not found')
    }

    await this.repository.delete(id)

    if (
      existingRegistration.status === 'confirmed' &&
      existingRegistration.attendanceType === 'physical'
    ) {
      await this.promoteNextFromWaitlist(existingRegistration.eventSlug)
    }
  }

  async isUserRegistered(
    eventSlug: string,
    slackUserId: string
  ): Promise<boolean> {
    const registration = await this.repository.findByEventAndUser(
      eventSlug,
      slackUserId
    )
    return registration !== null && registration.status !== 'cancelled'
  }

  async getRegistrationCount(eventSlug: string): Promise<number> {
    return await this.getActiveRegistrationCount(eventSlug)
  }

  async getAllRegistrations(
    query: EventRegistrationQuery = {}
  ): Promise<EventRegistration[]> {
    return await this.repository.findMany(query)
  }

  async getRegistrationsByEvent(): Promise<
    Record<string, EventRegistration[]>
  > {
    const allRegistrations = await this.repository.findMany()

    return allRegistrations.reduce(
      (acc, registration) => {
        if (!acc[registration.eventSlug]) {
          acc[registration.eventSlug] = []
        }
        acc[registration.eventSlug]!.push(registration)
        return acc
      },
      {} as Record<string, EventRegistration[]>
    )
  }

  async getRegistrationCountsByCategory(eventSlug: string): Promise<{
    totalActive: number
    persons: number
    organizations: number
    uniqueOrganizations: number
  }> {
    const registrations = await this.repository.findMany({ eventSlug })
    const activeRegistrations = registrations.filter(
      r => r.status === 'confirmed' || r.status === 'attended'
    )

    const organizationCounts = new Map<string, number>()

    activeRegistrations.forEach(registration => {
      const org = registration.organisation.trim()
      if (org) {
        organizationCounts.set(org, (organizationCounts.get(org) || 0) + 1)
      }
    })

    return {
      totalActive: activeRegistrations.length,
      persons: activeRegistrations.length,
      organizations: Array.from(organizationCounts.keys()).length,
      uniqueOrganizations: organizationCounts.size,
    }
  }

  async getOrganizationBreakdown(eventSlug: string): Promise<
    Array<{
      organization: string
      count: number
    }>
  > {
    const registrations = await this.repository.findMany({ eventSlug })
    const activeRegistrations = registrations.filter(
      r => r.status === 'confirmed' || r.status === 'attended'
    )

    const organizationCounts = new Map<string, number>()

    activeRegistrations.forEach(registration => {
      const org = registration.organisation.trim()
      if (org) {
        organizationCounts.set(org, (organizationCounts.get(org) || 0) + 1)
      }
    })

    return Array.from(organizationCounts.entries())
      .map(([organization, count]) => ({ organization, count }))
      .sort((a, b) => b.count - a.count)
  }

  async getUserRegistrations(
    slackUserId: string
  ): Promise<EventRegistration[]> {
    return await this.repository.findMany({ slackUserId })
  }

  async getRegistrationBySlackUserId(
    eventSlug: string,
    slackUserId: string
  ): Promise<EventRegistration | null> {
    return await this.repository.findByEventAndUser(eventSlug, slackUserId)
  }

  /**
   * Anonymize all registrations for a user (GDPR right to be forgotten)
   * Keeps registrations for capacity/statistics but removes personal data
   */
  async anonymizeUserData(slackUserId: string): Promise<number> {
    const registrations = await this.repository.findMany({ slackUserId })

    await Promise.all(
      registrations.map(registration =>
        this.repository.update(registration._id!, {
          name: 'Anonymisert bruker',
          email: 'anonymized@offentlig-paas.no',
          slackUserId: `anonymized_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          dietary: undefined,
          comments: undefined,
          metadata: {
            ...registration.metadata,
            anonymized: true,
            anonymizedAt: new Date().toISOString(),
          },
        })
      )
    )

    return registrations.length
  }

  async getOrphanedRegistrationGroups(): Promise<OrphanedRegistrationGroup[]> {
    const slugCounts = await this.repository.getEventSlugCounts()
    const knownSlugs = new Set(getAllEvents().map(e => e.slug))
    const orphanedSlugs = slugCounts.filter(sc => !knownSlugs.has(sc.eventSlug))

    const groups = await Promise.all(
      orphanedSlugs.map(async ({ eventSlug }) => {
        const registrations = await this.repository.findMany({ eventSlug })
        const activeRegistrations = registrations.filter(
          r => r.status !== 'cancelled'
        )
        return {
          eventSlug,
          count: activeRegistrations.length,
          registrations: activeRegistrations.map(r => ({
            _id: r._id!,
            name: r.name,
            email: r.email,
            organisation: r.organisation,
            status: r.status,
            attendanceType: r.attendanceType,
          })),
        }
      })
    )

    return groups.filter(g => g.count > 0)
  }

  async importRegistrations(
    fromSlug: string,
    toSlug: string
  ): Promise<{ imported: number; skipped: number }> {
    if (fromSlug === toSlug) {
      throw new Error('Kan ikke importere påmeldinger til samme arrangement')
    }

    const knownSlugs = new Set(getAllEvents().map(e => e.slug))
    if (knownSlugs.has(fromSlug)) {
      throw new Error(
        'Kan bare importere fra foreldreløse arrangementer som ikke lenger finnes'
      )
    }

    const sourceRegistrations = await this.repository.findMany({
      eventSlug: fromSlug,
    })
    const targetRegistrations = await this.repository.findMany({
      eventSlug: toSlug,
    })

    const activeSource = sourceRegistrations.filter(
      r => r.status !== 'cancelled'
    )

    const activeTargetEmails = new Set(
      targetRegistrations
        .filter(r => r.status !== 'cancelled')
        .map(r => r.email.toLowerCase())
    )
    const activeTargetSlackIds = new Set(
      targetRegistrations
        .filter(r => r.status !== 'cancelled' && r.slackUserId)
        .map(r => r.slackUserId!)
    )

    const toImport = activeSource.filter(r => {
      if (activeTargetEmails.has(r.email.toLowerCase())) return false
      if (r.slackUserId && activeTargetSlackIds.has(r.slackUserId)) return false
      return true
    })
    const skipped = activeSource.length - toImport.length

    await this.repository.reassignEventSlug(
      toSlug,
      toImport.map(r => r._id!)
    )

    return { imported: toImport.length, skipped }
  }

  private validateRegistrationInput(input: CreateEventRegistrationInput): void {
    if (!input.name.trim()) {
      throw new Error('Name is required')
    }
    if (!input.email.trim()) {
      throw new Error('Email is required')
    }
    if (!input.organisation.trim()) {
      throw new Error('Organisation is required')
    }
    if (!input.eventSlug.trim()) {
      throw new Error('Event slug is required')
    }
    if (!input.attendanceType) {
      throw new Error('Attendance type is required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      throw new Error('Invalid email format')
    }
  }
}

export const eventRegistrationService = new EventRegistrationService()
