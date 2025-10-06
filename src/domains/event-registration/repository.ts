import { sanityClient } from '@/lib/sanity/config'
import type {
  EventRegistration,
  CreateEventRegistrationInput,
  UpdateEventRegistrationInput,
  EventRegistrationQuery,
} from './types'
import groq from 'groq'

/**
 * Repository for managing event registrations in Sanity
 * Follows repository pattern for clean separation of data access
 */
export class EventRegistrationRepository {
  /**
   * Create a new event registration
   */
  async create(
    input: CreateEventRegistrationInput
  ): Promise<EventRegistration> {
    const doc = {
      _type: 'eventRegistration',
      ...input,
      registeredAt: new Date().toISOString(),
      status: 'confirmed' as const,
    }

    const result = await sanityClient.create(doc)
    return this.mapSanityToEventRegistration(result)
  }

  /**
   * Find registration by ID
   */
  async findById(id: string): Promise<EventRegistration | null> {
    const query = groq`*[_type == "eventRegistration" && _id == $id][0]`
    const result = await sanityClient.fetch(query, { id })

    return result ? this.mapSanityToEventRegistration(result) : null
  }

  /**
   * Find registration by event slug and user
   */
  async findByEventAndUser(
    eventSlug: string,
    slackUserId: string
  ): Promise<EventRegistration | null> {
    const query = groq`*[_type == "eventRegistration" && eventSlug == $eventSlug && slackUserId == $slackUserId][0]`
    const result = await sanityClient.fetch(query, {
      eventSlug,
      slackUserId,
    })

    return result ? this.mapSanityToEventRegistration(result) : null
  }

  /**
   * Find all registrations with optional filtering
   */
  async findMany(
    queryParams: EventRegistrationQuery = {}
  ): Promise<EventRegistration[]> {
    let query = groq`*[_type == "eventRegistration"`
    const params: Record<string, unknown> = {}

    // Build query conditions
    const conditions = []
    if (queryParams.eventSlug) {
      conditions.push('eventSlug == $eventSlug')
      params.eventSlug = queryParams.eventSlug
    }
    if (queryParams.status) {
      conditions.push('status == $status')
      params.status = queryParams.status
    }

    if (conditions.length > 0) {
      query += ` && ${conditions.join(' && ')}`
    }

    query += `] | order(registeredAt desc)`

    // Add pagination
    if (queryParams.limit) {
      const offset = queryParams.offset || 0
      query += `[${offset}...${offset + queryParams.limit}]`
    }

    const results = await sanityClient.fetch(query, params)
    return results.map((result: Record<string, unknown>) =>
      this.mapSanityToEventRegistration(result)
    )
  }

  /**
   * Update an existing registration
   */
  async update(
    id: string,
    input: UpdateEventRegistrationInput
  ): Promise<EventRegistration> {
    const result = await sanityClient.patch(id).set(input).commit()

    return this.mapSanityToEventRegistration(result)
  }

  /**
   * Delete a registration
   */
  async delete(id: string): Promise<void> {
    await sanityClient.delete(id)
  }

  /**
   * Get registration count for an event
   */
  async getEventRegistrationCount(
    eventSlug: string,
    status?: string
  ): Promise<number> {
    let query = groq`count(*[_type == "eventRegistration" && eventSlug == $eventSlug`
    const params: Record<string, unknown> = { eventSlug }

    if (status) {
      query += ` && status == $status`
      params.status = status
    }

    query += `])`

    return await sanityClient.fetch(query, params)
  }

  /**
   * Map Sanity document to domain type
   */
  private mapSanityToEventRegistration(
    doc: Record<string, unknown>
  ): EventRegistration {
    return {
      _id: doc._id as string,
      eventSlug: doc.eventSlug as string,
      name: doc.name as string,
      email: doc.email as string,
      slackUserId: doc.slackUserId as string,
      organisation: doc.organisation as string,
      dietary: doc.dietary as string | undefined,
      comments: doc.comments as string | undefined,
      attendanceType: doc.attendanceType as EventRegistration['attendanceType'],
      attendingSocialEvent: doc.attendingSocialEvent as boolean | undefined,
      registeredAt: new Date(doc.registeredAt as string),
      status: doc.status as EventRegistration['status'],
      metadata: doc.metadata as EventRegistration['metadata'],
    }
  }
}
