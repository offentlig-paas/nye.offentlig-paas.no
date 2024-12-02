import React from 'react';
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import {
  GitHubIcon,
  SlackIcon,
  YouTubeIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'

import { metadata as globalMetadata } from '@/app/layout'

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: {
  className?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'Historien om Offentlig PaaS',
  description: `Offentlig PaaS ble startet som et initiativ mellom NAV og Skatteetaten etter at Audun Fauchald Strand og Are Vattekar møttes på KubeCon Europe i 2017 i Berlin og hørte andre norske stemmer.`,
}

export default function About() {
  const githubUrl = `${globalMetadata.other?.githubOrgUrl || '#'}`
  const slackUrl = `${globalMetadata.other?.joinSlackUrl || '#'}`
  const youtubeUrl = `${globalMetadata.other?.youtubeUrl || '#'}`

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Historien om hvordan {globalMetadata.applicationName} ble til
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              Offentlig PaaS ble startet som et initiativ mellom NAV og
              Skatteetaten etter at Audun Fauchald Strand og Are Vattekar møttes
              på KubeCon Europe i 2017 i Berlin og hørte andre norske stemmer.
              Det viste seg at både NAV og Skatteetaten hadde samme tanken om å
              bygge en applikasjonsplattform for sine utviklere med mål om å få
              opp fart og kvaliteten på applikasjonene.
            </p>
            <p>
              Like etter at KubeCon var over ble Offentlig PaaS Slacken
              opprettet og den første fagdagen ble avholdt hos
              Skattedirektoratet, senere på året var NAV vertskap for den andre
              fagdagen. I 2018 var det duket for fagdag hos Politiet og senere
              på året hos SSB og i 2019 hos Telenor. I 2019 ble nettstedet
              offentlig-paas.no lansert.
            </p>
            <p>
              Fagdagen er en dag hvor vi møtes for å dele erfaringer og lære av
              hverandre. Fagdagen er som regel en halv dags arrangement med
              presentasjoner og diskusjoner. Det er også en god anledning til å
              bli kjent med likesinnede som jobber med de samme utfordringene.
            </p>
            <p>
              Like før pandemien traff oss i 2020 var det duket for fagdag hos
              Oslo Kommune i Oslo Rådhus, neste fagdag ble avhold digitalt hos
              SSB da det ikke var mulig å møtes fysisk. Etter en lang pause ble
              Offentlig PaaS fagdagen rebootet i 2023 og det ble avholdt fagdager
              hos Politiet, Skatteetaten og Telenor med rekordmange deltakere.
            </p>
            <p>
              Ved utgangen av 2023 hadde Offentlig PaaS Slacken over 1.100
              brukere på tvers av mer enn 50 forskjellige organisasjoner.
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialLink href={githubUrl} icon={GitHubIcon} className="mt-4">
              Følg på GitHub
            </SocialLink>
            <SocialLink href={slackUrl} icon={SlackIcon} className="mt-4">
              Bli med på Slack
            </SocialLink>
            <SocialLink href={youtubeUrl} icon={YouTubeIcon} className="mt-4">
              Følg på YouTube
            </SocialLink>
            <SocialLink
              href="mailto:kontakt@offentlig-paas.no"
              icon={MailIcon}
              className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
            >
              kontakt@offentlig-paas.no
            </SocialLink>
          </ul>
        </div>
      </div>
    </Container>
  )
}
