import {
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { StatCard } from '@/components/StatCard'

interface AdminEventStatsProps {
  eventDetails: {
    registration: { disabled?: boolean }
    startTime: string
    eventStats?: {
      participants: number
      organisations: number
      registrations: number
    }
    registrations: Array<{
      attendanceType?: string
      attendingSocialEvent?: boolean
      status: string
    }>
    stats: {
      activeRegistrations: number
      uniqueOrganisations: number
      totalRegistrations: number
      feedbackSummary?: {
        averageEventRating: number
        totalResponses: number
      }
      statusBreakdown: {
        attended: number
        'no-show'?: number
      }
    }
  }
}

export function AdminEventStats({ eventDetails }: AdminEventStatsProps) {
  const eventDate = new Date(eventDetails.startTime)
  const now = new Date()
  const isFutureEvent = eventDate > now
  const useLegacyStats = eventDetails.registration.disabled === true

  if (useLegacyStats && eventDetails.eventStats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Deltakere"
          value={eventDetails.eventStats.participants}
          icon={UsersIcon}
        />
        <StatCard
          label="Organisasjoner"
          value={eventDetails.eventStats.organisations}
          icon={BuildingOfficeIcon}
        />
        <StatCard
          label="Påmeldinger"
          value={eventDetails.eventStats.registrations}
          icon={CheckCircleIcon}
        />
      </div>
    )
  }

  if (isFutureEvent) {
    const isActiveRegistration = (status: string) =>
      ['confirmed', 'attended'].includes(status)

    const physicalCount = eventDetails.registrations.filter(
      r => r.attendanceType === 'physical' && isActiveRegistration(r.status)
    ).length
    const digitalCount = eventDetails.registrations.filter(
      r => r.attendanceType === 'digital' && isActiveRegistration(r.status)
    ).length
    const socialEventCount = eventDetails.registrations.filter(
      r => r.attendingSocialEvent && isActiveRegistration(r.status)
    ).length

    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Påmeldte"
          value={eventDetails.stats.activeRegistrations}
          icon={UsersIcon}
        />
        <StatCard label="Fysisk" value={physicalCount} icon={UserGroupIcon} />
        <StatCard label="Digitalt" value={digitalCount} icon={UserGroupIcon} />
        <StatCard
          label="Sosialt"
          value={socialEventCount}
          icon={UserGroupIcon}
        />
        <StatCard
          label="Organisasjoner"
          value={eventDetails.stats.uniqueOrganisations}
          icon={BuildingOfficeIcon}
        />
      </div>
    )
  }

  const attendanceRate =
    eventDetails.stats.totalRegistrations > 0
      ? Math.round(
          (eventDetails.stats.statusBreakdown.attended /
            eventDetails.stats.totalRegistrations) *
            100
        )
      : 0

  const feedbackSummary = eventDetails.stats.feedbackSummary
  const feedbackDisplay =
    feedbackSummary && feedbackSummary.totalResponses > 0
      ? `${feedbackSummary.averageEventRating.toFixed(1)} (${feedbackSummary.totalResponses})`
      : '0'

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Deltok"
        value={eventDetails.stats.statusBreakdown.attended}
        icon={CheckCircleIcon}
      />
      <StatCard
        label="Oppmøte %"
        value={`${attendanceRate}%`}
        icon={ChartBarIcon}
      />
      <StatCard
        label="Tilbakemeldinger"
        value={feedbackDisplay}
        icon={StarIcon}
      />
      <StatCard
        label="Organisasjoner"
        value={eventDetails.stats.uniqueOrganisations}
        icon={BuildingOfficeIcon}
      />
    </div>
  )
}
