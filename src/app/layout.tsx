import React from 'react'
import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import { AuthSessionProvider } from '@/components/AuthSessionProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  applicationName: 'Offentlig PAAS',
  title: {
    template: '%s - Offentlig PAAS',
    default:
      'Offentlig PAAS – Nettverk for offentlige plattformer og applikasjoner',
  },
  description: `Offentlig PAAS er et nettverk for teknologer i offentlig sektor som bygger og drifter digitale tjenester – med fokus på plattformer, applikasjoner, arkitektur og sikkerhet.

  Startet i 2017 av NAV og Skatteetaten, har nettverket vokst til over 2000 medlemmer fra mer enn 80 offentlige virksomheter.

  Med diskusjoner på Slack, og regelmessige fagdager, hjelper vi hverandre med å løse reelle tekniske utfordringer.`,
  alternates: {
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_URL}/feed.xml`,
    },
  },
  other: {
    githubOrgUrl: 'https://github.com/offentlig-paas',
    githubRepoUrl: 'https://github.com/offentlig-paas/offentlig-paas.no',
    joinSlackUrl: 'https://join.slack.com/t/offentlig-paas-no/signup',
    youtubeUrl: 'https://www.youtube.com/@OffentligPaaS',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <AuthSessionProvider>
          <Providers>
            <div className="flex w-full">
              <Layout>{children}</Layout>
            </div>
          </Providers>
        </AuthSessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
