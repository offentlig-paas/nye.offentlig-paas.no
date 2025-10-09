import type { AttendanceType, EventParticipantInfo } from '@/lib/events/types'
import type { RegistrationStatus } from '@/domains/event-registration/types'

export interface Participant {
  name: string
  slackUserId?: string
}

export interface Registration {
  _id?: string
  attendingSocialEvent?: boolean
  attendanceType?: AttendanceType
  status?: RegistrationStatus
  [key: string]: unknown
}

export interface RegistrationStats {
  total: number
  persons: number
  organizations: number
  uniqueOrganizations: number
  participants: Participant[]
}

export interface EventRegistrationResponse {
  registrationStatus: RegistrationStatus | null
  registration: Registration | null
  stats: RegistrationStats
  participantInfo: EventParticipantInfo | null
}
