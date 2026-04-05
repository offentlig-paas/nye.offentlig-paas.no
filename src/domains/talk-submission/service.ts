import { TalkSubmissionRepository } from './repository'
import type {
  TalkSubmission,
  TalkSubmissionStatus,
  CreateTalkSubmissionInput,
} from './types'

class TalkSubmissionService {
  private repository: TalkSubmissionRepository

  constructor(repository?: TalkSubmissionRepository) {
    this.repository = repository ?? new TalkSubmissionRepository()
  }

  async submitTalk(input: CreateTalkSubmissionInput): Promise<TalkSubmission> {
    return await this.repository.create(input)
  }

  async getEventSubmissions(eventSlug: string): Promise<TalkSubmission[]> {
    return await this.repository.findByEventSlug(eventSlug)
  }

  async getUserSubmissions(
    eventSlug: string,
    slackUserId: string
  ): Promise<TalkSubmission[]> {
    return await this.repository.findByEventAndUser(eventSlug, slackUserId)
  }

  async updateStatus(
    id: string,
    status: TalkSubmissionStatus
  ): Promise<TalkSubmission> {
    const submission = await this.repository.findById(id)
    if (!submission) {
      throw new Error('Talk submission not found')
    }
    return await this.repository.updateStatus(id, status)
  }

  async withdrawSubmission(
    id: string,
    slackUserId: string,
    eventSlug: string
  ): Promise<TalkSubmission> {
    const submission = await this.repository.findById(id)
    if (!submission) {
      throw new Error('Talk submission not found')
    }
    if (submission.eventSlug !== eventSlug) {
      throw new Error('Submission does not belong to this event')
    }
    if (submission.speakerSlackId !== slackUserId) {
      throw new Error('Not authorized to withdraw this submission')
    }
    if (submission.status === 'withdrawn') {
      throw new Error('Submission is already withdrawn')
    }
    return await this.repository.updateStatus(id, 'withdrawn')
  }

  async getSubmissionCount(eventSlug: string): Promise<number> {
    return await this.repository.getCountByEventSlug(eventSlug)
  }

  async deleteSubmission(id: string): Promise<void> {
    const submission = await this.repository.findById(id)
    if (!submission) {
      throw new Error('Talk submission not found')
    }
    await this.repository.delete(id)
  }
}

export const talkSubmissionService = new TalkSubmissionService()
