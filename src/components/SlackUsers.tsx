'use client'

import { trpc } from '@/lib/trpc/client'
import { InfoCard } from './Stats'

export function SlackUsers() {
  const { data, isLoading, error } = trpc.slack.userCount.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <InfoCard title="Antall brukere på Slack" number="–" label="laster..." />
    )
  }

  if (error || !data) {
    return (
      <InfoCard
        title="Antall brukere på Slack"
        number="–"
        label="utilgjengelig"
      />
    )
  }

  return (
    <InfoCard
      title="Antall brukere på Slack"
      number={data.userCount}
      label="kontoer"
    />
  )
}
