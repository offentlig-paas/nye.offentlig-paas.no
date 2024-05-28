import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function SpeakingSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <div className="space-y-16">{children}</div>
    </Section>
  )
}

function Appearance({
  title,
  description,
  date,
  cta,
  href,
}: {
  title: string
  description: string
  date: string
  cta: string
  href: string
}) {
  return (
    <Card as="article">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Eyebrow decorate>{date}</Card.Eyebrow>
      <Card.Description>{description}</Card.Description>
      {cta && (<Card.Cta>{cta}</Card.Cta>)}
    </Card>
  )
}

export const metadata: Metadata = {
  title: 'Fagdager',
  description:
    'Fagdager er Offentlig PaaS nettverket sin helt egen dag hvor vi inviterer til faglig påfyll, erfaringsdeling og nettverksbygging.',
}

export default function Fagdager() {
  return (
    <SimpleLayout
      title="Offentlig PaaS Fangdager"
      intro="Fagdager er Offentlig PaaS nettverket sin helt egen dag hvor vi inviterer til faglig påfyll, erfaringsdeling og nettverksbygging. Her finner du en oversikt over neste og tidligere arrangementer. Denne siden er fortsatt under utvikling og vi jobber med å lage en enda bedre oversikt over kommende fagdager."
    >
      <div className="space-y-20">
        <SpeakingSection title="Fagdager">
          <Appearance
            href="https://forms.office.com/e/srPkwVU5rH"
            title="Offentlig Observability Dag"
            description="Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om observability, OpenTelemetry og Grafana i offentlig sektor."
            date="20. juni 2024"
            cta="Registrer deg"
          />
          <Appearance
            href="#"
            title="Offentlig PaaS Fagdag om dataplattform"
            description="Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om dataplattform i offentlig sektor."
            date="24. mai 2024"
            cta=""
          />
        </SpeakingSection>
      </div>
    </SimpleLayout>
  )
}
