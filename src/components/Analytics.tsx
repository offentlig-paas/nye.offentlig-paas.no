'use client'

import { Analytics as VercelAnalytics } from '@vercel/analytics/react'

/** Vercel Analytics without the secret pilot token in reported URLs. */
export function Analytics() {
  return (
    <VercelAnalytics
      beforeSend={event => {
        const url = new URL(event.url)
        url.searchParams.delete('pilot')
        return { ...event, url: url.toString() }
      }}
    />
  )
}
