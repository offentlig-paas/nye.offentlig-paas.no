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
    input: CreateEventRegistrationInput,
    status: import('./types').RegistrationStatus = 'confirmed'
  ): Promise<EventRegistration> {
    const doc = {
      _type: 'eventRegistration',
      ...input,
      registeredAt: new Date().toISOString(),
      status,
    }

    const result = await sanityClient.create(doc)
    return this.mapSanityToEventRegistration(result)
  }

  /**
   * Find registration by ID
   */
  async findById(id: string): Promise<EventRegistration | null> {
    const query = groq`*[_type == "eventRegistration" && _id == $id][0]`
    const result = await sanityClient.fetch(
      query,
      { id },
      { cache: 'no-store', next: { revalidate: 0 } }
    )

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
    const result = await sanityClient.fetch(
      query,
      {
        eventSlug,
        slackUserId,
      },
      { cache: 'no-store', next: { revalidate: 0 } }
    )

    return result ? this.mapSanityToEventRegistration(result) : null
  }

  /**
   * Find registration by event slug and user email
   */
  async findByEventAndEmail(
    eventSlug: string,
    email: string
  ): Promise<EventRegistration | null> {
    const normalizedEmail = email.trim().toLowerCase()
    const query = groq`*[_type == "eventRegistration" && eventSlug == $eventSlug && lower(email) == $email][0]`
    const result = await sanityClient.fetch(
      query,
      {
        eventSlug,
        email: normalizedEmail,
      },
      { cache: 'no-store', next: { revalidate: 0 } }
    )

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
    const conditions = []

    if (queryParams.eventSlug) {
      conditions.push('eventSlug == $eventSlug')
      params.eventSlug = queryParams.eventSlug
    }
    if (queryParams.slackUserId) {
      conditions.push('slackUserId == $slackUserId')
      params.slackUserId = queryParams.slackUserId
    }
    if (queryParams.status) {
      conditions.push('status == $status')
      params.status = queryParams.status
    }

    if (conditions.length > 0) {
      query += ` && ${conditions.join(' && ')}`
    }

    query += `] | order(registeredAt desc)`

    if (queryParams.limit) {
      const offset = queryParams.offset || 0
      query += `[${offset}...${offset + queryParams.limit}]`
    }

    const results = await sanityClient.fetch(query, params, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
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

    return await sanityClient.fetch(query, params, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
  }

  /**
   * Get count of physical attendees with confirmed or attended status
   * Used for enforcing event capacity limits
   * @param eventSlug - The event slug to count attendees for
   * @returns Number of physical attendees (confirmed or attended)
   */
  async getPhysicalAttendeesCount(eventSlug: string): Promise<number> {
    const query = groq`count(*[_type == "eventRegistration" && eventSlug == $eventSlug && attendanceType == "physical" && (status == "confirmed" || status == "attended")])`
    return await sanityClient.fetch(
      query,
      { eventSlug },
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    )
  }

  /**
   * Get all unique event slugs with their registration counts
   */
  async getEventSlugCounts(): Promise<
    Array<{ eventSlug: string; count: number }>
  > {
    const query = groq`*[_type == "eventRegistration"]{ eventSlug }`
    const results: Array<{ eventSlug: string }> = await sanityClient.fetch(
      query,
      {},
      { cache: 'no-store', next: { revalidate: 0 } }
    )

    const counts = new Map<string, number>()
    for (const r of results) {
      counts.set(r.eventSlug, (counts.get(r.eventSlug) || 0) + 1)
    }

    return Array.from(counts.entries()).map(([eventSlug, count]) => ({
      eventSlug,
      count,
    }))
  }

  /**
   * Reassign all registrations from one event slug to another
   */
  async reassignEventSlug(
    fromSlug: string,
    toSlug: string,
    registrationIds: string[]
  ): Promise<number> {
    await Promise.all(
      registrationIds.map(id =>
        sanityClient.patch(id).set({ eventSlug: toSlug }).commit()
      )
    )
    return registrationIds.length
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
      slackUserId: (doc.slackUserId as string) || undefined,
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
