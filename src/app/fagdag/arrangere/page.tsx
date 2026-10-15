import { type Metadata } from 'next'
import Link from 'next/link'
import { SimpleLayout } from '@/components/SimpleLayout'
import { Section } from '@/components/Section'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'

export const metadata: Metadata = {
  title: 'Arrangere fagdag',
  description:
    'Praktisk veiledning og sjekkliste for deg som vil arrangere en Offentlig PaaS-fagdag.',
}

export default function ArrangereFagdagPage() {
  return (
    <SimpleLayout
      title="Arrangere en Offentlig PaaS-fagdag"
      intro="Offentlig PaaS-fagdager arrangeres av medlemsorganisasjonene selv. Her finner du en praktisk sjekkliste for planlegging, gjennomføring og etterarbeid."
    >
      <div className="mb-8">
        <Link
          href="/fagdag"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Tilbake til fagdager
        </Link>
      </div>

      <div className="space-y-16">
        <Section title="1. Planlegging">
          <div className="space-y-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <p>
              Start gjerne 4 til 8 uker før arrangementet. En typisk fagdag
              varer fra kl. 09:00 til 15:00 med påfølgende sosialt treff, eller
              som et kortere digitalt seminar.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Tema og arbeidsgruppe:</strong> Samle 2 til 4
                medarrangører fra ulike virksomheter i nettverket og bli enige
                om tema, dato og målgruppe.
              </li>
              <li>
                <strong>Lokale og kapasitet:</strong> Avklar møterom, AV-utstyr,
                strømming, matservering og eventuell adgangskontroll eller
                legitimasjonskrav hos vertsorganisasjonen.
              </li>
              <li>
                <strong>Opprett fagdagen på nettsiden:</strong> Legg til
                arrangementet øverst i{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  src/data/events.ts
                </code>{' '}
                via en pull request på{' '}
                <a
                  href="https://github.com/offentlig-paas/nye.offentlig-paas.no/edit/main/src/data/events.ts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  GitHub
                </a>
                . Legg inn Slack-profil-URL på arrangørene slik at dere
                automatisk får tilgang til admin-panelet på nettsiden.
              </li>
              <li>
                <strong>Call for Papers (CFP):</strong> Sett{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  callForPapersEnabled: true
                </code>{' '}
                på arrangementet for å ta imot forslag til foredrag direkte på
                nettsiden, eller inviter foredragsholdere direkte.
              </li>
            </ul>
          </div>
        </Section>

        <Section title="2. Før arrangementet">
          <div className="space-y-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <p>
              Som registrert arrangør får du tilgang til admin-panelet på{' '}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                /admin/events/[slug]
              </code>
              .
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Påmelding og venteliste:</strong> Sett{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  maxCapacity
                </code>{' '}
                for fysiske plasser. Når det er fullt, settes nye fysiske
                påmeldinger automatisk på venteliste og rykker opp ved
                avmelding.
              </li>
              <li>
                <strong>Slack-kanal:</strong> Opprett en egen Slack-kanal
                (f.eks.{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  #fagdag-...
                </code>
                ) fra admin-panelet og inviter påmeldte deltakere og
                foredragsholdere.
              </li>
              <li>
                <strong>Markedsføring:</strong> Annonser fagdagen i{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  #general
                </code>{' '}
                på Offentlig PaaS-Slacken.
              </li>
              <li>
                <strong>Deltakerinformasjon og påminnelse:</strong> Legg inn
                strømmelenke og praktisk informasjon i admin-panelet, og send ut
                påminnelse på Slack 2 til 3 dager før fagdagen.
              </li>
            </ul>
          </div>
        </Section>

        <Section title="3. Under arrangementet">
          <div className="space-y-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Registrering og oppmøte:</strong> Kryss av fysiske
                deltakere i admin-panelet etter hvert som de møter opp, og
                eksporter navneliste til resepsjon/vakt ved behov.
              </li>
              <li>
                <strong>Strømming og opptak:</strong> Sjekk at lyd og
                skjermdeling fungerer for digitale deltakere, og del
                strømmelenken i Slack-kanalen.
              </li>
              <li>
                <strong>Bilder:</strong> Ta bilder av foredragsholdere, sal og
                mingling til oppsummeringsartikkel og bildegalleri.
              </li>
            </ul>
          </div>
        </Section>

        <Section title="4. Etter arrangementet">
          <div className="space-y-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Tilbakemeldinger:</strong> Send ut forespørsel om
                tilbakemelding via Slack fra admin-panelet samme dag eller dagen
                etter. Deltakere som ikke rakk å bli krysset av ved døren kan
                selv bekrefte oppmøte eller gi tilbakemelding direkte.
              </li>
              <li>
                <strong>Presentasjoner og opptak:</strong> Foredragsholdere kan
                selv laste opp lysbilder fra sin profilside, eller arrangører
                kan legge dem inn via admin-panelet. Legg også inn{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  recordingUrl
                </code>{' '}
                hvis opptak er publisert.
              </li>
              <li>
                <strong>Bilder og artikkel:</strong> Last opp bilder i
                admin-panelet og skriv gjerne en kort oppsummeringsartikkel med{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  {'<EmbeddedEvent slug="..." />'}
                </code>
                .
              </li>
            </ul>
          </div>
        </Section>
      </div>
    </SimpleLayout>
  )
}
