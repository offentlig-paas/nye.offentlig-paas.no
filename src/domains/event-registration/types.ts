import { AttendanceType } from '@/lib/events/types'

// Domain types for event registration
export interface EventRegistration {
  _id?: string
  eventSlug: string
  name: string
  email: string
  slackUserId: string
  organisation: string
  dietary?: string
  comments?: string
  attendanceType?: AttendanceType
  attendingSocialEvent?: boolean
  registeredAt: Date
  status: RegistrationStatus
  metadata?: RegistrationMetadata
}

export type RegistrationStatus =
  | 'confirmed'
  | 'waitlist'
  | 'cancelled'
  | 'attended'
  | 'no-show'

export interface RegistrationMetadata {
  source?: string
  experience?: 'beginner' | 'intermediate' | 'advanced'
  [key: string]: unknown
}

// Input type for creating new registrations
export interface CreateEventRegistrationInput {
  eventSlug: string
  name: string
  email: string
  slackUserId: string
  organisation: string
  dietary?: string
  comments?: string
  attendanceType: AttendanceType
  attendingSocialEvent?: boolean
  metadata?: RegistrationMetadata
}

// Update type for modifying registrations
export interface UpdateEventRegistrationInput {
  name?: string
  email?: string
  slackUserId?: string
  organisation?: string
  status?: RegistrationStatus
  dietary?: string
  comments?: string
  attendanceType?: AttendanceType
  attendingSocialEvent?: boolean
  metadata?: RegistrationMetadata
}

// Query parameters for filtering registrations
export interface EventRegistrationQuery {
  eventSlug?: string
  slackUserId?: string
  status?: RegistrationStatus
  limit?: number
  offset?: number
}
