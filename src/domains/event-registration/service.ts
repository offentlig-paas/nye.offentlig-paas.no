import { EventRegistrationRepository } from './repository'
import type {
  EventRegistration,
  CreateEventRegistrationInput,
  UpdateEventRegistrationInput,
  EventRegistrationQuery,
  RegistrationStatus,
} from './types'

export class EventRegistrationService {
  private repository: EventRegistrationRepository

  constructor() {
    this.repository = new EventRegistrationRepository()
  }

  async registerForEvent(
    input: CreateEventRegistrationInput
  ): Promise<EventRegistration> {
    const existingRegistration = await this.repository.findByEventAndUser(
      input.eventSlug,
      input.slackUserId
    )

    if (existingRegistration) {
      throw new Error('User is already registered for this event')
    }

    this.validateRegistrationInput(input)
    return await this.repository.create(input)
  }

  async getEventRegistrations(eventSlug: string): Promise<EventRegistration[]> {
    return await this.repository.findMany({ eventSlug })
  }

  async getRegistration(id: string): Promise<EventRegistration | null> {
    return await this.repository.findById(id)
  }

  async updateRegistration(
    id: string,
    input: UpdateEventRegistrationInput
  ): Promise<EventRegistration> {
    const existingRegistration = await this.repository.findById(id)
    if (!existingRegistration) {
      throw new Error('Registration not found')
    }

    return await this.repository.update(id, input)
  }

  async updateRegistrationStatus(
    id: string,
    status: RegistrationStatus
  ): Promise<EventRegistration> {
    const existingRegistration = await this.repository.findById(id)
    if (!existingRegistration) {
      throw new Error('Registration not found')
    }

    return await this.repository.update(id, { status })
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

  async cancelRegistration(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'cancelled')
  }

  async deleteRegistration(id: string): Promise<void> {
    const existingRegistration = await this.repository.findById(id)
    if (!existingRegistration) {
      throw new Error('Registration not found')
    }

    return await this.repository.delete(id)
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

  private validateRegistrationInput(input: CreateEventRegistrationInput): void {
    if (!input.name.trim()) {
      throw new Error('Name is required')
    }
    if (!input.email.trim()) {
      throw new Error('Email is required')
    }
    if (!input.slackUserId.trim()) {
      throw new Error('Slack user ID is required')
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
