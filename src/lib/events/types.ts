export interface SocialEvent {
  description: string
  start: Date
  location: string
}

export interface EventParticipantInfo {
  streamingUrl?: string
  notes?: string
}

interface SlackChannel {
  id: string
  name: string
}

export interface Event {
  slug: string
  title: string
  ingress: string
  description?: string
  start: Date
  end: Date
  price?: string
  audience: Audience
  location: string
  registration: RegistrationSettings
  registrationUrl?: string // legacy registration from before we had a registration system
  callForPapersUrl?: string
  callForPapersClosedDate?: Date
  recordingUrl?: string
  organizers: SlackUser[]
  schedule: Item[]
  stats?: Stats // legacy stats before we had a registration and feedback system
  socialEvent?: SocialEvent
  participantInfo?: EventParticipantInfo
  slackChannel?: SlackChannel
  maxCapacity?: number // Maximum physical attendees allowed
}

interface RegistrationSettings {
  disabled?: boolean
  attendanceTypes: AttendanceType[]
}

export enum AttendanceType {
  Physical = 'physical',
  Digital = 'digital',
}

export const AttendanceTypeDisplay: Record<AttendanceType, string> = {
  [AttendanceType.Physical]: 'Fysisk oppmøte',
  [AttendanceType.Digital]: 'Digitalt',
}

interface Stats {
  registrations: number
  participants: number
  organisations: number
  feedback?: Feedback
}

interface Feedback {
  url: string
  averageRating: number
  respondents: number
  comments: string[]
}

export enum Audience {
  PublicSector = 'Offentlig sektor',
}

export enum Status {
  Upcoming = 'upcoming',
  Past = 'past',
  Current = 'current',
}

export interface SlackUser {
  name: string
  org?: string
  url?: string
}

export interface Item {
  time: string
  title: string
  description?: string
  speakers?: SlackUser[]
  type: ItemType
  attachments?: Attachment[]
}

export interface Attachment {
  title?: string
  url: string
  type: AttachmentType
}

export enum AttachmentType {
  Link = 'Link',
  PDF = 'PDF',
  Video = 'Video',
  Slides = 'Slides',
  Code = 'Code',
  Recording = 'Recording',
  Other = 'Other',
}

export enum ItemType {
  Break = 'Pause',
  Info = 'Informasjon',
  Panel = 'Panel',
  Registration = 'Registrering',
  Talk = 'Presentation',
  Workshop = 'Workshop',
}

export interface EventDynamicStats {
  registrations: {
    total: number
    confirmed: number
    attended: number
    cancelled: number
    pending: number
    waitlist: number
    organizations: number
    participants: number
    physicalCount: number
    digitalCount: number
    socialEventCount: number
  }
  feedback: {
    averageRating: number
    totalResponses: number
    hasLegacyData: boolean
    historicalComments: string[]
    historicalFeedbackUrl?: string
  }
}

export interface EventWithDynamicData extends Event {
  dynamicStats: EventDynamicStats
  userRegistration?: Pick<
    import('@/domains/event-registration/types').EventRegistration,
    | '_id'
    | 'status'
    | 'attendanceType'
    | 'attendingSocialEvent'
    | 'comments'
    | 'dietary'
    | 'registeredAt'
  > | null
  participantInfo?: EventParticipantInfo
  participants?: Array<{
    name: string
    slackUserId: string
  }>
}
