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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          value={eventDetails.eventStats.participants}
          label="Deltakere"
        />
        <StatCard
          value={eventDetails.eventStats.organisations}
          label="Organisasjoner"
        />
        <StatCard
          value={eventDetails.eventStats.registrations}
          label="Påmeldinger"
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          value={eventDetails.stats.activeRegistrations}
          label="Påmeldte"
        />
        <StatCard value={physicalCount} label="Fysisk" />
        <StatCard value={digitalCount} label="Digitalt" />
        <StatCard value={socialEventCount} label="Sosialt" />
        <StatCard
          value={eventDetails.stats.uniqueOrganisations}
          label="Organisasjoner"
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
  const noShowCount = eventDetails.stats.statusBreakdown['no-show'] || 0

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        value={eventDetails.stats.statusBreakdown.attended}
        label="Deltok"
      />
      <StatCard value={`${attendanceRate}%`} label="Oppmøte %" />
      <StatCard value={noShowCount} label="Ikke møtt" />
      <StatCard
        value={eventDetails.stats.uniqueOrganisations}
        label="Organisasjoner"
      />
    </div>
  )
}

interface StatCardProps {
  value: number | string
  label: string
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4">
        <div className="flex flex-col items-center text-center">
          <dd className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </dd>
          <dt className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            {label}
          </dt>
        </div>
      </div>
    </div>
  )
}
