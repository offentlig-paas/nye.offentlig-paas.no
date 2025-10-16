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
  registrationUrl?: string
  callForPapersUrl?: string
  callForPapersClosedDate?: Date
  recordingUrl?: string
  organizers: SlackUser[]
  schedule: Item[]
  stats?: Stats
  socialEvent?: SocialEvent
  participantInfo?: EventParticipantInfo
  slackChannel?: SlackChannel
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
