import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  applicationName: 'Offentlig PaaS',
  title: {
    template: '%s - Offentlig PaaS',
    default:
      'Offentlig PaaS - et nettverk for all oss som bygger applikasjonsplattformer',
  },
  description: `Offentlig PaaS er et nettverk for offentlige etater, og offentlig selskaper, som bygger nye og moderne applikasjonsplattformer basert på prinsippene rundt Plattform som en Tjeneste (PaaS).

    Nettverket ble startet som et initiativ mellom NAV og Skatteetaten i 2017 og har senere vokst til mer enn 1000 medlemmer på tvers av 50 offentlige etater og selskaper i Norge.`,
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
