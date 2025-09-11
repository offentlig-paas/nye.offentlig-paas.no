import { EventRegistrationRepository } from './repository'
import type {
  EventRegistration,
  CreateEventRegistrationInput,
  UpdateEventRegistrationInput,
  EventRegistrationQuery,
  RegistrationStatus,
} from './types'

/**
 * Service layer for event registration business logic
 * Handles validation, business rules, and coordination between components
 */
export class EventRegistrationService {
  private repository: EventRegistrationRepository

  constructor() {
    this.repository = new EventRegistrationRepository()
  }

  /**
   * Register a user for an event
   * Includes business logic like duplicate checking
   */
  async registerForEvent(
    input: CreateEventRegistrationInput
  ): Promise<EventRegistration> {
    // Check if user is already registered for this event
    const existingRegistration = await this.repository.findByEventAndUser(
      input.eventSlug,
      input.slackUserId
    )

    if (existingRegistration) {
      throw new Error('User is already registered for this event')
    }

    // Validate required fields
    this.validateRegistrationInput(input)

    return await this.repository.create(input)
  }

  /**
   * Get all registrations for an event
   */
  async getEventRegistrations(eventSlug: string): Promise<EventRegistration[]> {
    return await this.repository.findMany({ eventSlug })
  }

  /**
   * Get registration by ID
   */
  async getRegistration(id: string): Promise<EventRegistration | null> {
    return await this.repository.findById(id)
  }

  /**
   * Update a registration
   */
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

  /**
   * Update registration status
   */
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

  /**
   * Move registration from waitlist to confirmed
   */
  async confirmFromWaitlist(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'confirmed')
  }

  /**
   * Mark registration as attended
   */
  async markAsAttended(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'attended')
  }

  /**
   * Mark registration as no-show
   */
  async markAsNoShow(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'no-show')
  }

  /**
   * Bulk update registration statuses
   */
  async bulkUpdateStatus(
    ids: string[],
    status: RegistrationStatus
  ): Promise<EventRegistration[]> {
    const updates = await Promise.all(
      ids.map(id => this.updateRegistrationStatus(id, status))
    )
    return updates
  }

  /**
   * Get registration statistics by status for an event
   */
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

  /**
   * Get active registrations count (confirmed + attended)
   */
  async getActiveRegistrationCount(eventSlug: string): Promise<number> {
    const registrations = await this.repository.findMany({ eventSlug })
    return registrations.filter(
      r => r.status === 'confirmed' || r.status === 'attended'
    ).length
  }

  /**
   * Cancel a registration
   */
  async cancelRegistration(id: string): Promise<EventRegistration> {
    return await this.updateRegistrationStatus(id, 'cancelled')
  }

  /**
   * Delete a registration permanently
   */
  async deleteRegistration(id: string): Promise<void> {
    const existingRegistration = await this.repository.findById(id)
    if (!existingRegistration) {
      throw new Error('Registration not found')
    }

    return await this.repository.delete(id)
  }

  /**
   * Check if user is registered for an event
   */
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

  /**
   * Get registration count for an event
   */
  async getRegistrationCount(eventSlug: string): Promise<number> {
    return await this.getActiveRegistrationCount(eventSlug)
  }

  /**
   * Get all registrations with optional filtering
   */
  async getAllRegistrations(
    query: EventRegistrationQuery = {}
  ): Promise<EventRegistration[]> {
    return await this.repository.findMany(query)
  }

  /**
   * Get registrations grouped by event slug
   */
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

  /**
   * Validate registration input
   */
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      throw new Error('Invalid email format')
    }
  }
}

// Export singleton instance for use throughout the application
export const eventRegistrationService = new EventRegistrationService()
