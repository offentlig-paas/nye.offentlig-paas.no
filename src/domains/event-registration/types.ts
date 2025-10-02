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
  | 'confirmed' // Default confirmed registration
  | 'waitlist' // On waiting list
  | 'cancelled' // User cancelled their registration
  | 'attended' // Marked as attended
  | 'no-show' // Marked as no-show

export interface RegistrationMetadata {
  source?: string
  experience?: 'beginner' | 'intermediate' | 'advanced'
  [key: string]: unknown // Allow for future extensions
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
  attendanceType: AttendanceType // Required - must be set based on event configuration
  attendingSocialEvent?: boolean
  metadata?: RegistrationMetadata
}

// Update type for modifying registrations
export interface UpdateEventRegistrationInput {
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
  status?: RegistrationStatus
  limit?: number
  offset?: number
}
