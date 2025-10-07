import type { AttendanceType, EventParticipantInfo } from '@/lib/events/types'

export interface Participant {
  name: string
  slackUserId?: string
}

export interface Registration {
  _id?: string
  attendingSocialEvent?: boolean
  attendanceType?: AttendanceType
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
  isRegistered: boolean
  registration: Registration | null
  stats: RegistrationStats
  participantInfo: EventParticipantInfo | null
}
