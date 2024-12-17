import React from 'react';
import { type Metadata } from 'next'
import Image from 'next/image'
import { members } from '@/data/styre'

import { Container } from '@/components/Container'
import {
  BlueskyIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  SlackIcon,
  SocialLink,
  YouTubeIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'

import { metadata as globalMetadata } from '@/app/layout'

export const metadata: Metadata = {
  title: 'Historien om Offentlig PaaS',
  description: `Offentlig PaaS ble startet som et initiativ mellom Nav og Skatteetaten etter at Audun Fauchald Strand og Are Vattekar møttes på KubeCon Europe i 2017 i Berlin og hørte andre norske stemmer.`,
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
              Offentlig PaaS ble startet som et initiativ mellom Nav og
              Skatteetaten etter at Audun Fauchald Strand og Are Vattekar møttes
              på KubeCon Europe i 2017 i Berlin og hørte andre norske stemmer.
              Det viste seg at både Nav og Skatteetaten hadde samme tanken om å
              bygge en applikasjonsplattform for sine utviklere med mål om å få
              opp fart og kvaliteten på applikasjonene.
            </p>
            <p>
              Like etter at KubeCon var over ble Offentlig PaaS Slacken
              opprettet og den første fagdagen ble avholdt hos
              Skattedirektoratet, senere på året var Nav vertskap for den andre
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
              brukere og ett år senere var det tallet nesten bikket 2.000. I
              2024 ble det arrangert tre fagdager hver med flere delakere enn
              den forrige. Nytt av året var opptakt av foredragene som ble
              publisert på Offentlig PaaS sin kanal på YouTube.
            </p>
            <p>
              I 2024 ble den første undersøkelsen om plattform modenhet i norsk
              offentlig sektor publisert og Offentlig PaaS fikk helt nye
              nettsider og formelt etablert som en forening og met et initielle
              styret bestående av Audun Fauchald Strand, Are Vattekar, og Hans
              Kristian Flaatten.
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
      <div className="mt-16 sm:mt-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 id="styret" className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl">
              Styret i Offentlig PaaS
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600 dark:text-zinc-400">
              Styret er Offentlig PaaS sitt øverste organ og består av representanter fra flere offentlige virksomheter.
              Styret velges formelt på årsmøtet som avholdes innen april hvert år.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {members.map((person) => (
              <li key={person.name}>
                <Image alt={`Bilde av ${person.name}`} src={person.imageUrl} width={300} height={200} className="aspect-[3/2] w-full rounded-2xl object-cover" />
                <h3 className="mt-6 text-lg/8 font-semibold tracking-tight text-gray-900 dark:text-zinc-100">{person.name}</h3>
                <p className="text-base/7 text-gray-600 dark:text-zinc-400">{person.role}</p>
                <ul role="list" className="mt-6 flex gap-x-4">
                  <li>
                    <SocialLink href={person.slackUrl} icon={SlackIcon} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400">
                      <span className="sr-only">Slack</span>
                    </SocialLink>
                  </li>
                  <li>
                    <SocialLink href={person.githubUrl} icon={GitHubIcon} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400">
                      <span className="sr-only">GitHub</span>
                    </SocialLink>
                  </li>
                  <li>
                    <SocialLink href={person.linkedinUrl} icon={LinkedInIcon} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400">
                      <span className="sr-only">LinkedIn</span>
                    </SocialLink>
                  </li>
                  {person.bskyUrl && (
                    <li>
                      <SocialLink href={person.bskyUrl} icon={BlueskyIcon} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400">
                        <span className="sr-only">Bluesky</span>
                      </SocialLink>
                    </li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  )
}
