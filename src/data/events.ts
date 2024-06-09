import { Audience, Event, ItemType } from "@/lib/events/types";

export const events: Event[] = [
  {
    slug: '2024-06-20-observability-dag',
    title: 'Offentlig Observability Dag',
    ingress: 'Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om observability, OpenTelemetry og Grafana i offentlig sektor.',
    description: `For aller første gang arrangerer vi Offentlig Observability Dag i samarbeid med Skatteetaten og NAV. Vi har et spennende program med foredrag fra Grafana, Skatteetaten, NAV, Kartverket, NHN og PIT som vil dele sine erfaringer.

    Som vanlig blir det god tid til erfaringsdeling og nettverksbygging. Arrangement er gratis og åpent for alle ansatte i offentlig sektor. Vi gleder oss til å se deg!`,
    start: new Date('2024-06-20T09:00+02:00'),
    end: new Date('2024-06-20T15:00+02:00'),
    audience: Audience.PublicSector,
    location: 'NAV, Fyrstikkalleen 1, 0661 Oslo',
    registrationUrl: 'https://forms.office.com/e/srPkwVU5rH',
    organizers: [
      {
        name: 'Robert Myhren',
        org: 'Skatteetaten',
        url: 'https://offentlig-paas-no.slack.com/team/U04BEMRE8R2'
      },
      {
        name: 'Hans Kristian Flaatten',
        org: 'NAV',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY'
      }
    ],
    schedule: [
      {
        time: '09:00 - 09:30',
        title: 'Registrering',
        type: ItemType.Registration,
      },
      {
        time: '09:30 - 09:35',
        title: 'Velkommen',
        description: 'Vi ønsker velkommen til Offentlig Observability Dag!',
        speaker: 'NAV og Skatt',
        type: ItemType.Info,
      },
      {
        time: '09:35 - 10:20',
        title: 'Introduction to OpenTelemetry & Tracing (in English)',
        description: 'OpenTelemetry is a set of APIs, libraries, agents, and instrumentation to provide observability in your applications.',
        speaker: 'Grafana Labs & Sopra Steria',
        type: ItemType.Talk,
      },
      {
        time: '10:20 - 11:00',
        title: 'Observability i Skatteetaten',
        description: 'Skatteetaten presenterer hvordan de jobber med robustet og innsikt i sine systemer.',
        speaker: 'Skatteetaten',
        type: ItemType.Talk,
      },
      {
        time: '11:00 - 12:00',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '12:00 - 12:40',
        title: 'Observability i NAV',
        description: 'NAV presenterer hvordan de jobber med robustet og innsikt i sine systemer.',
        speaker: 'Hans Kristian Flaatten (NAV)',
        type: ItemType.Talk,
      },
      {
        time: '12:40 - 13:05',
        title: 'Kartverket presenterer',
        description: 'Kartverket presenterer sin erfaring med observability.',
        speaker: 'Thomas Berg & Eline Henriksen (Kartverket)',
        type: ItemType.Talk,
      },
      {
        time: '13:05 - 13:30',
        title: 'Praktisk SLO med Pyrra - "first steps to SRE"',
        description: 'Hvordan kan vi bruke Pyrra til å overvåke tjenester og applikasjoner? Pyrra er et verktøy for å overvåke tjenester og applikasjoner, og gir deg mulighet til å sette opp Service Level Objectives (SLO).',
        speaker: 'Magnus Johansen (PIT)',
        type: ItemType.Talk,
      },
      {
        time: '13:30 - 14:00',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '14:00 - 14:30',
        title: 'Utfordringer ved monitorering av dynamiske systemer',
        description: 'Hvordan kan vi monitorere et system som er dynamisk og stadig endrer seg? Bygg dashbord som gir relevant tilbakemelding, ved å bruke OFFSET i PromQL for å sammenligne metrikker med tidligere data.',
        speaker: 'Juan Piola Sanchez (NHN)',
        type: ItemType.Talk,
      },
      {
        time: '14:30 - 15:00',
        title: 'TBA',
        description: 'TBA',
        speaker: 'TBA',
        type: ItemType.Talk,
      },
    ]
  }, {
    slug: '2024-05-24-dataplattform-fagdag',
    title: 'Offentlig PaaS Fagdag om dataplattform',
    ingress: `Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om dataplattform i offentlig sektor.`,
    start: new Date('2024-05-24T09:00+02:00'),
    end: new Date('2024-05-24T15:00+02:00'),
    audience: Audience.PublicSector,
    location: 'Digitalt',
    organizers: [
      {
        name: 'Offentlig PaaS',
        url: 'https://offentligpaas.no'
      }
    ],
    schedule: [
      {
        title: 'Velkommen til Offentlig PaaS Fagdag om dataplattform',
        speaker: 'Offentlig PaaS',
        description: 'Velkommen til Offentlig PaaS Fagdag om dataplattform!',
        time: '09:00',
        type: ItemType.Talk,
      },
      {
        title: 'Foredrag om dataplattform',
        speaker: 'Offentlig PaaS',
        description: 'En dataplattform er en plattform for å lagre, prosessere og tilgjengeliggjøre data.',
        time: '09:15',
        type: ItemType.Talk,
      },
      {
        title: 'Erfaringsdeling fra Difi',
        speaker: 'Difi',
        description: 'Difi har tatt i bruk en dataplattform for å samle inn og analysere data.',
        time: '10:00',
        type: ItemType.Talk,
      }
    ]
  },
];
