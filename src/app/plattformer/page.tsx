import React from 'react'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRightIcon,
  LockClosedIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  ServerStackIcon,
} from '@heroicons/react/24/outline'

import { auth } from '@/auth'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { memberProfileService, getMemberBySlug } from '@/domains/member-profile'

function LinkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'Plattformer',
  description: 'Norske applikasjonsplattformer',
}

export default async function Plattformer() {
  const session = await auth()
  const [profiles, matchedOrg] = await Promise.all([
    memberProfileService.getAll({
      includeInternal: Boolean(session?.user),
    }),
    memberProfileService.findMemberForUser(session?.user),
  ])
  const myMember = matchedOrg?.member
  const myProfile =
    matchedOrg?.profile ??
    (myMember ? profiles.find(p => p.slug === myMember.getSlug()) : undefined)

  const plattformer = profiles
    .map(profile => {
      const member = getMemberBySlug(profile.slug)
      if (!member || !profile.platformName) return null
      return {
        member,
        profile,
      }
    })
    .filter(
      (
        item
      ): item is {
        member: NonNullable<ReturnType<typeof getMemberBySlug>>
        profile: (typeof profiles)[number]
      } => item !== null
    )
    .sort((a, b) =>
      a.profile.platformName.localeCompare(b.profile.platformName, 'nb-NO')
    )

  return (
    <SimpleLayout
      title="Norske applikasjonsplattformer"
      intro="Offentlig sektor i Norge har flere spennende applikasjonsplattformer som gjør det enklere for utviklere å lage og drifte applikasjoner. Klikk på en plattform for å utforske plattformkapabiliteter, CNCF-teknologi og teamet bak."
      gitHubPage="src/app/plattformer/page.tsx"
    >
      <div className="mb-12 rounded-2xl border border-teal-500/20 bg-teal-50/50 p-5 dark:border-teal-500/20 dark:bg-teal-950/20">
        {myMember && myProfile ? (
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Din virksomhet: {myMember.name} ({myProfile.platformName})
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Du kan når som helst oppdatere kapabiliteter, teknologistabel og
                styre om profilen er offentlig eller kun synlig for medlemmer.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <Link
                href={`/medlemmer/${myMember.getSlug()}/rediger`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Rediger plattform
              </Link>
              <Link
                href={`/medlemmer/${myMember.getSlug()}`}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Se profil
              </Link>
            </div>
          </div>
        ) : myMember ? (
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Har {myMember.name} en applikasjonsplattform?
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Publiser virksomhetens plattformprofil på 2 minutter med ferdige
                maler. Du velger selv om profilen skal være offentlig eller kun
                synlig for innloggede medlemmer.
              </p>
            </div>
            <Link
              href={`/medlemmer/${myMember.getSlug()}/rediger`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Opprett plattformprofil
            </Link>
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Savner du virksomheten din sin plattform?
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Ansatte i medlemsvirksomheter kan logge inn med Slack og
                opprette eller redigere sin plattformprofil direkte i
                nettleseren — både åpne og interne plattformer.
              </p>
            </div>
            <Link
              href="/medlemmer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-600/30 bg-white px-3.5 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 dark:border-teal-400/30 dark:bg-zinc-900 dark:text-teal-300 dark:hover:bg-zinc-800"
            >
              Finn din virksomhet
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {plattformer.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 text-center sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
          <LockClosedIcon className="mx-auto h-8 w-8 text-teal-600 dark:text-teal-400" />
          <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Plattformprofilene er tilgjengelige for innloggede medlemmer
          </h2>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
            Flere medlemsvirksomheter har klargjort sine plattformprofiler som
            interne utkast. Logg inn med Slack for å utforske interne
            plattformprofiler, eller for å publisere din virksomhets profil
            offentlig.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signin?callbackUrl=/plattformer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-500"
            >
              Logg inn med Slack
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/medlemmer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Se alle medlemmer
            </Link>
          </div>
        </div>
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {plattformer.map(({ member, profile }) => {
            const logo = profile.platformLogo || member.image()
            return (
              <Card as="li" key={profile.slug}>
                <div className="relative z-10 flex w-full items-center justify-between gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                    {logo ? (
                      <Image
                        src={logo}
                        alt=""
                        className="h-8 w-8 object-contain"
                        width={32}
                        height={32}
                        unoptimized
                      />
                    ) : (
                      <ServerStackIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {profile.visibility === 'internal' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-300">
                        <LockClosedIcon className="h-3 w-3" />
                        Kun medlemmer
                      </span>
                    )}
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {member.name}
                    </span>
                  </div>
                </div>
                <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                  <Card.Link href={`/medlemmer/${member.getSlug()}`}>
                    {profile.platformName}
                  </Card.Link>
                </h2>
                <Card.Description>
                  {profile.platformDescription}
                </Card.Description>
                {(profile.capabilities.length > 0 ||
                  profile.cncfProjects.length > 0) && (
                  <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
                    {profile.capabilities.length > 0 && (
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                        {profile.capabilities.length} kapabiliteter
                      </span>
                    )}
                    {profile.cncfProjects.length > 0 && (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-teal-950/50 dark:text-blue-300">
                        {profile.cncfProjects.length} CNCF-prosjekter
                      </span>
                    )}
                  </div>
                )}
                <div className="relative z-10 mt-6 flex w-full items-center justify-between gap-2 text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200">
                  {profile.platformAccess === 'internal' ||
                  !profile.platformLabel ? (
                    <span className="inline-flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                      <LockClosedIcon className="h-4 w-4 flex-none" />
                      <span className="ml-1.5">Intern plattform</span>
                    </span>
                  ) : (
                    <span className="inline-flex min-w-0 items-center">
                      <LinkIcon className="h-6 w-6 flex-none" />
                      <span className="ml-2 truncate">
                        {profile.platformLabel}
                      </span>
                    </span>
                  )}
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                    Utforsk profil
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Card>
            )
          })}
        </ul>
      )}
    </SimpleLayout>
  )
}
