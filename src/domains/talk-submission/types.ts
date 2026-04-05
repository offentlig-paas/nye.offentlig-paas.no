export type TalkSubmissionStatus =
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export type TalkFormat =
  | 'Presentation'
  | 'Workshop'
  | 'Panel'
  | 'Lightning talk'

export const TalkFormatDisplay: Record<TalkFormat, string> = {
  Presentation: 'Presentasjon',
  Workshop: 'Workshop',
  Panel: 'Panel',
  'Lightning talk': 'Lyntale',
}

export const TalkSubmissionStatusDisplay: Record<TalkSubmissionStatus, string> =
  {
    submitted: 'Innsendt',
    accepted: 'Godkjent',
    rejected: 'Avslått',
    withdrawn: 'Trukket',
  }

export interface TalkSubmission {
  _id: string
  eventSlug: string
  title: string
  abstract: string
  format: TalkFormat
  duration?: string
  speakerName: string
  speakerEmail: string
  speakerSlackId: string
  speakerOrganisation: string
  speakerBio?: string
  notes?: string
  status: TalkSubmissionStatus
  submittedAt: Date
}

export interface CreateTalkSubmissionInput {
  eventSlug: string
  title: string
  abstract: string
  format: TalkFormat
  duration?: string
  speakerName: string
  speakerEmail: string
  speakerSlackId: string
  speakerOrganisation: string
  speakerBio?: string
  notes?: string
}
