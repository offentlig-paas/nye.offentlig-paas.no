import { sanityClient } from '@/lib/sanity/config'
import type {
  TalkSubmission,
  TalkSubmissionStatus,
  CreateTalkSubmissionInput,
} from './types'
import groq from 'groq'

export class TalkSubmissionRepository {
  async create(input: CreateTalkSubmissionInput): Promise<TalkSubmission> {
    const doc = {
      _type: 'talkSubmission',
      ...input,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString(),
    }

    const result = await sanityClient.create(doc)
    return this.mapToTalkSubmission(result)
  }

  async findById(id: string): Promise<TalkSubmission | null> {
    const query = groq`*[_type == "talkSubmission" && _id == $id][0]`
    const result = await sanityClient.fetch(
      query,
      { id },
      { cache: 'no-store', next: { revalidate: 0 } }
    )

    return result ? this.mapToTalkSubmission(result) : null
  }

  async findByEventSlug(eventSlug: string): Promise<TalkSubmission[]> {
    const query = groq`*[_type == "talkSubmission" && eventSlug == $eventSlug] | order(submittedAt desc)`
    const results = await sanityClient.fetch(
      query,
      { eventSlug },
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    )
    return results.map((r: Record<string, unknown>) =>
      this.mapToTalkSubmission(r)
    )
  }

  async findByEventAndUser(
    eventSlug: string,
    slackUserId: string
  ): Promise<TalkSubmission[]> {
    const query = groq`*[_type == "talkSubmission" && eventSlug == $eventSlug && speakerSlackId == $slackUserId] | order(submittedAt desc)`
    const results = await sanityClient.fetch(
      query,
      { eventSlug, slackUserId },
      { cache: 'no-store', next: { revalidate: 0 } }
    )
    return results.map((r: Record<string, unknown>) =>
      this.mapToTalkSubmission(r)
    )
  }

  async updateStatus(
    id: string,
    status: TalkSubmissionStatus
  ): Promise<TalkSubmission> {
    const result = await sanityClient.patch(id).set({ status }).commit()
    return this.mapToTalkSubmission(result)
  }

  async delete(id: string): Promise<void> {
    await sanityClient.delete(id)
  }

  async getCountByEventSlug(eventSlug: string): Promise<number> {
    const query = groq`count(*[_type == "talkSubmission" && eventSlug == $eventSlug && status != "withdrawn"])`
    return await sanityClient.fetch(
      query,
      { eventSlug },
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    )
  }

  private mapToTalkSubmission(doc: Record<string, unknown>): TalkSubmission {
    return {
      _id: doc._id as string,
      eventSlug: doc.eventSlug as string,
      title: doc.title as string,
      abstract: doc.abstract as string,
      format: doc.format as TalkSubmission['format'],
      duration: doc.duration as string | undefined,
      speakerName: doc.speakerName as string,
      speakerEmail: doc.speakerEmail as string,
      speakerSlackId: doc.speakerSlackId as string,
      speakerOrganisation: doc.speakerOrganisation as string,
      speakerBio: doc.speakerBio as string | undefined,
      notes: doc.notes as string | undefined,
      status: doc.status as TalkSubmission['status'],
      submittedAt: new Date(doc.submittedAt as string),
    }
  }
}
