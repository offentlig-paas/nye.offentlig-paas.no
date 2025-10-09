import type { Event } from '@/lib/events/types'
import {
  AttachmentType,
  Audience,
  ItemType,
  AttendanceType,
} from '@/lib/events/types'

export const events: Event[] = [
  {
    slug: '2025-10-15-selvbetjening-fagdag',
    title: 'Offentlig PaaS Fagdag Selvbetjening',
    ingress:
      'Vi inviterer til fagdag om selvbetjening og autonome team hos Telenor på Fornebu.',
    description:
      'En dag fokusert på selvbetjening og autonome team i offentlig sektor. Vi utforsker hvordan selvbetjeningsløsninger kan gi utviklerteam økt fart og flyt, med praktiske erfaringer fra Telenor, Vy og Nav. Programmet dekker alt fra filosofien bak selvbetjening til konkrete implementasjoner av utviklerportaler og API-er. Arrangementet er gratis og åpent for alle med tilknytning til offentlig sektor.',
    start: new Date('2025-10-15T11:00+02:00'),
    end: new Date('2025-10-15T15:00+02:00'),
    audience: Audience.OpenForAll,
    location: 'Telenor Fornebu, Snarøyveien 30, 1360 Fornebu',
    registration: {
      attendanceTypes: [AttendanceType.Physical, AttendanceType.Digital],
    },
    organizers: [
      {
        name: 'Mats Bækkelund',
        org: 'Telenor Norge',
        url: 'https://offentlig-paas-no.slack.com/team/U04QQLQ7KK8',
      },
      {
        name: 'Hans Kristian Flaatten',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
    ],
    socialEvent: {
      description:
        'Bli med på mingling og nettverksbygging på Telenors Café Expo. En uformell anledning til å møte andre deltakere, dele erfaringer og bygge nettverk over pizza og drikke.',
      start: new Date('2025-10-15T16:00+02:00'),
      location: 'Café Expo, Telenor Fornebu',
    },
    schedule: [
      {
        time: '11:00 - 11:30',
        title: 'Registrering og velkommen',
        type: ItemType.Registration,
      },
      {
        time: '11:30 - 12:00',
        title: 'Self-Service: A Schizophrenic historical review',
        speakers: [
          {
            name: 'Olivier Cloux',
            org: 'Telenor',
            url: 'https://offentlig-paas-no.slack.com/team/U05S4LR1S5P',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '12:00 - 12:10',
        title: 'After success comes failure',
        description:
          'Running fast and winning - then breaking a leg. A tale of self-service',
        speakers: [
          {
            name: 'Anders Elton',
            org: 'Telenor',
            url: 'https://offentlig-paas-no.slack.com/team/U09JC8B7FUK',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '12:10 - 12:20',
        title: 'Towards better UX - Straight as the Kro flies',
        speakers: [
          {
            name: 'Eline Henriksen',
            org: 'Telenor',
            url: 'https://offentlig-paas-no.slack.com/team/U02SG8873PC',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '12:20 - 12:30',
        title:
          'Pick, Pay, Push - The rise of self-service, from Retail isles to Developer platform',
        speakers: [
          {
            name: 'Sindre Lindstad',
            org: 'Telenor',
            url: 'https://offentlig-paas-no.slack.com/team/UUHH03WPK',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '12:30 - 13:30',
        title: 'Lunsj',
        type: ItemType.Break,
      },
      {
        time: '13:30 - 14:10',
        title:
          'Selvbetjening er ikke bare en utviklerportal, men det er en del av kaka',
        description:
          'Hos Vy har vi lenge fokusert på hvordan vi kan bruke de få ressursene vi har til rådighet i utviklerplattformteamet best mulig. En stor del av dette er selvbetjening og hjelp til selvhjelp hos utviklerne i de forskjellige teamene. Hvilke metoder og strategier bruker vi for å få til dette, og hvordan kan man implementere en selvbetjeningsstrategi som faktisk er selvbetjent?',
        speakers: [
          {
            name: 'Nicolas Harlem Eid',
            org: 'Vy',
            url: 'https://offentlig-paas-no.slack.com/team/U04EKPV8VM2',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '14:10 - 14:50',
        title: 'Nais API og Console - veien til selvbetjening',
        description:
          'Hvordan Nais har jobbet med å lage en selvbetjeningsportal for utviklere i offentlig sektor. Vi vil gå gjennom arkitektur, utfordringer og løsninger vi har funnet på veien.',
        speakers: [
          {
            name: 'Jonny Horvi',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U4SR1TZC0',
          },
          {
            name: 'Frode Sundby',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U4SNTLV3K',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '14:50 - 16:00',
        title: 'Nettverksbygging og avslutning',
        type: ItemType.Info,
      },
    ],
  },
  {
    slug: '2025-09-02-trondheim-fagdag',
    title: 'Offentlig PaaS Fagdag Trondheim',
    ingress:
      'Vi inviterer til fagdag sammen med Norsk helsenett SF i Trondheim fylt med spennende foredrag og erfaringsdeling om plattform i offentlig sektor.',
    description:
      'Vi jobber med å lage agenda og vil oppdatere denne siden fortløpende. Arrangementet er gratis og åpent for alle med tilknyttning til offentlig sektor',
    registrationUrl: 'https://forms.cloud.microsoft/e/Z4QU9a8um9',
    callForPapersUrl: 'https://forms.cloud.microsoft/e/zZJq2nKFPs',
    callForPapersClosedDate: new Date('2025-09-02T09:00+02:00'),
    start: new Date('2025-09-02T09:00+02:00'),
    end: new Date('2025-09-02T14:30+02:00'),
    audience: Audience.PublicSector,
    location: 'Digs - Mesh community, Krambugata 2, 7011 Trondheim',
    registration: {
      attendanceTypes: [AttendanceType.Physical, AttendanceType.Digital],
    },
    stats: {
      registrations: 34,
      participants: 31,
      organisations: 12,
    },
    organizers: [
      {
        name: 'Atle Meistad',
        org: 'Norsk Helsenett SF',
        url: 'https://offentlig-paas-no.slack.com/team/U0836NTGBQW',
      },
      {
        name: 'Håvard Elnan',
        org: 'Norsk Helsenett SF',
        url: 'https://offentlig-paas-no.slack.com/team/UU4T4283X',
      },
    ],
    schedule: [
      {
        time: '09:00 - 09:30',
        title: 'Registrering',
        type: ItemType.Registration,
      },
      {
        time: '09:30 - 10:15',
        title: 'Reengineering the stack',
        description:
          'NHN jobber med en helt ny containerplattform og vi vil presentere hvordan vi har tenkt.',
        speakers: [{ name: 'Håvard Elnan', org: 'NHN' }],
        type: ItemType.Talk,
      },
      {
        time: '10:15 - 11:00',
        title: 'Kunstig intelligens i Skatteetaten',
        description:
          'Fra sparsom bruk av KI til innovasjon og faktisk tidsbesparelse / effektivisering. Skatteetaten presenterer reisen med vurderinger gjort underveis. Vi prater om blant annet sikkerhet, skalering, juridiske utfordringer, og gulroten i enden av tunnelen 🥕',
        speakers: [
          {
            name: 'Tor Ivar Asbølmo',
            org: 'Skatteetaten',
          },
          {
            name: 'Geir Tore Johansen',
            org: 'Skatteetaten',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '11:00 - 11:45',
        title: 'Lunch',
        type: ItemType.Break,
      },
      {
        time: '11:45 - 12:30',
        title: 'NHNs Observability Plattform — Design & Erfaringer',
        description:
          'NHN har mange forskjellige team og ulike produkter vi lager som understøtter helsesektoren. I denne sesjonen ser vi på observability stack-en vi tilbyr til leveranseteamene våre. Vi kikker først på hva det er vi har satt opp, og hvordan det funker i praksis. Så litt på designet og tankene bak, før vi til slutt deler et innblikk i erfaringer med hvordan observability plattformen har oppført seg.',
        speakers: [{ name: 'Simon Randby', org: 'Norsk helsenett' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://docs.google.com/presentation/d/1m5PYOx-ldNSqZfUFNOUA9T9r4hUbIIWM/edit?usp=drive_link&ouid=109381646868227443677&rtpof=true&sd=true',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '12:30 - 13:15',
        title: 'TBA / Openspace',
        description:
          'Meld deg gjerne til å bidra med temaer eller spørsmål du ønsker å ta opp.',
        speakers: [{ name: 'TBA' }],
        type: ItemType.Talk,
      },
      {
        time: '13:15 - 14:00',
        title: 'TBA / Openspace',
        description:
          'Meld deg gjerne til å bidra med temaer eller spørsmål du ønsker å ta opp.',
        speakers: [{ name: 'TBA' }],
        type: ItemType.Talk,
      },
    ],
  },
  {
    slug: '2025-04-24-arsmote',
    title: 'Årsmøte for Offentlig PaaS',
    ingress: 'Digitalt årsmøtet for Offentlig PaaS.',
    description: `Styret i Offenlig PaaS innkaller til årsmøte for 2025. Årsmøtet er åpent for alle medlemmer av Offentlig PaaS.

    På årsmøtet vil vi gå gjennom følgende saker: gjennomgang av årsmelding, regnskap og budsjett, samt valg av styre. Det vil også bli en gjennomgang av reviderte vedtekter som adresserer noen mangler med de initielle vedtektene som ble påpekt på Slack.

    Eventuelle andre saker må sendes skriftlig til styret senest to uker før årsmøtet.`,
    start: new Date('2025-04-24T12:00+02:00'),
    end: new Date('2025-04-24T13:00+02:00'),
    audience: Audience.PublicSector,
    location: 'Zoom',
    registration: {
      attendanceTypes: [AttendanceType.Digital],
    },
    organizers: [
      {
        name: 'Hans Kristian Flaatten',
        org: 'Offentlig PAAS',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
      {
        name: 'Audun Fauchald Strand',
        org: 'Offentlig PAAS',
        url: 'https://offentlig-paas-no.slack.com/team/U4U0AJ4HM',
      },
      {
        name: 'Are Vattekar',
        org: 'Offentlig PAAS',
        url: 'https://offentlig-paas-no.slack.com/team/U4SM25LUQ',
      },
    ],
    schedule: [
      {
        time: '12:00 - 12:10',
        title: 'Velkommen',
        speakers: [
          {
            name: 'Hans Kristian Flaatten',
            org: 'Offentlig PAAS',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Info,
      },
      {
        time: '12:10 - 12:20',
        title: 'Godkjenning av årsmelding for 2024',
        type: ItemType.Talk,
      },
      {
        time: '12:20 - 12:25',
        title: 'Godkjenning av regnskap',
        description:
          'Ingen regnskap foreligger da Offentlig PaaS ikke har noen midler.',
        type: ItemType.Talk,
      },
      {
        time: '12:25 - 12:30',
        title: 'Godkjenning av budsjett',
        description:
          'Ingen budsjett foreligger da Offentlig PaaS ikke har noen midler.',
        type: ItemType.Talk,
      },
      {
        time: '12:30 - 13:00',
        title: 'Reviderte vedtekter',
        description:
          'Gjennomgang av reviderte vedtekter (offentlig-paas/organisasjon#1) som adresserer mangler med de initielle vedtektene.',
        type: ItemType.Talk,
      },
      {
        time: '13:00 - 13:25',
        title: 'Valg av styre',
        description: 'Valg av styreleder, nestleder og styremedlem.',
        type: ItemType.Talk,
      },
      {
        time: '13:25 - 13:30',
        title: 'Eventuelt og avslutning',
        type: ItemType.Info,
      },
    ],
  },
  {
    slug: '2025-02-04-fagdag-i-bergen',
    title: 'Offentlig PaaS Fagdag (i Bergen)',
    ingress:
      'Vi inviterer til fagdag sammen med KS Digital i Bergen fylt med spennende foredrag og erfaringsdeling om plattform i offentlig sektor.',
    description:
      'Vi jobber med å lage agenda og vil oppdatere denne siden fortløpende. Arrangementet er gratis og åpent for alle med tilknyttning til offentlig sektor.',
    start: new Date('2025-02-04T09:00+02:00'),
    end: new Date('2025-02-04T15:00+02:00'),
    audience: Audience.PublicSector,
    location: 'KS Digital, Nøstegaten 58, 5011 Bergen',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    registrationUrl: 'https://forms.gle/758mQFx6jG8jFp5D9',
    recordingUrl:
      'https://www.youtube.com/playlist?list=PLjI_oey9FG7T3jpWDXuCMyaht_ONKkLjx',
    organizers: [
      {
        name: 'Børge Nese',
        org: 'KS Digital',
        url: 'https://offentlig-paas-no.slack.com/team/UDS102YDU',
      },
      {
        name: 'Hans Kristian Flaatten',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
    ],
    schedule: [
      {
        time: '09:00 - 09:30',
        title: 'Registrering',
        type: ItemType.Registration,
      },
      {
        time: '09:30 - 09:45',
        title: 'Velkommen',
        speakers: [
          {
            name: 'Børge Nese',
            org: 'KS Digital',
          },
          {
            name: 'Hans Kristian Flaatten',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Info,
      },
      {
        time: '09:45 - 10:30',
        title:
          'Fra Fiks-plattform til moderne tjenesteplattform: Økt fart på kommunal tjenesteutvikling',
        description:
          'KS Digital fornyer Fiks-plattformen til en moderne tjenesteplattform for kommunal sektor. En sentral del av denne fornyelsen er applikasjonsplattformen, som skal gjøre det enklere å utvikle, dele og gjenbruke digitale tjenester.\n\nPresentasjonen vil vise reisen fra dagens Fiks-plattform til fremtidens tjenesteplattform, med særlig fokus på den nye applikasjonsplattformen og hvordan den tilrettelegger for økt utviklingstakt og bedre samarbeid på tvers av sektoren.',
        speakers: [
          { name: 'Børge Nese', org: 'KS Digital' },
          { name: 'Bård Singstad', org: 'KS Digital' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=W4ZpLMqx25c&list=PLjI_oey9FG7T3jpWDXuCMyaht_ONKkLjx&index=3',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/11D_j7Ou9uPjz0MY3T0R49u9obeq76FFy/view',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '10:30 - 11:00',
        title: 'Korleis virkar EUs digitale identitetslommebok?',
        description:
          'Alle medlemsland i EU er pålagda å ila 2026 kunne tilby innbyggere ei digital identitslommebok.  Lommeboka skal vere gratis å motta og gratis å bruke,  og offentleg sektor pliktar å ta den i bruk til pålogging og datadeling.\n\nI dette føredraget vil me fortelje litt om det nye regelverket og kva det innebærer, me vil demonstrere lommeboka slik den føreligg no, og gje ein overfladisk gjennomgang av sentrale protokollar og dataformat som vert nytta(OpenID4VCI, OpenID4VP og SD- jwt)',
        speakers: [
          { name: 'Jørgen Binningsbø', org: 'Digdir' },
          { name: 'Aamund Bremer', org: 'Digdir' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=OQuE2Y66tzo&list=PLjI_oey9FG7T3jpWDXuCMyaht_ONKkLjx&index=2',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1pttZPYqznxOxKb0BKAw11qB5GSxnc9bS/view',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '11:00 - 12:00',
        title: 'Lunsj',
        type: ItemType.Break,
      },
      {
        time: '12:00 - 12:40',
        title: 'Framtidens PaaS',
        description:
          'En no-bullshit approach til framtiden av plattformene våre i Telenor og hvordan disse vil utvikle seg drastisk de kommende årene.',
        speakers: [{ name: 'Martin Bergo', org: 'Telenor' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=wTwRw8MNvv8&list=PLjI_oey9FG7T3jpWDXuCMyaht_ONKkLjx&index=1',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://docs.google.com/presentation/d/1OzqwlnWM9OG64kUyTMRuiZ6owk7KUtMM/view',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '12:45 - 13:30',
        title: 'Managed Kubernetes service and clusters',
        description:
          "It's about AKS automatic, and Azure K8s Fleet Manager how that can simplify even more how we work with PaaS K8s. This will come with demo and detailed architecture.",
        speakers: [
          { name: 'Majid Hajian', org: 'Microsoft' },
          { name: 'Nicholas Mork', org: 'Microsoft' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://drive.google.com/file/d/12xPOQ6SZSms_MPoUdzMaRaXi0U8fex8L/view',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '14:00 - 14:40',
        title: 'Hvordan få 100+ team til å jobbe selvstendig',
        description:
          'Hvordan vi har laget en selvbetjent plattform i Nav som gjør at teamene selv kan administrere sitt team og sine applikasjoner uten å vente på tickets eller tilganger!',
        speakers: [
          {
            name: 'Hans Kristian Flaatten',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=l1Pf94xlcLg&list=PLjI_oey9FG7T3jpWDXuCMyaht_ONKkLjx&index=4',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1Q6_-x16RQyWn7iazexPvNl7S8P3pLFUX/view',
            type: AttachmentType.Slides,
          },
        ],
      },
    ],
    stats: {
      registrations: 75,
      participants: 85,
      organisations: 20,
      feedback: {
        url: 'https://forms.gle/nmWzcGNUupLKVWoc8',
        averageRating: 4.33,
        respondents: 21,
        comments: [
          'Kjekt at det er aktivitet i Bergen :-)',
          'Var ikke klar over at skyleverandørene har opinionated auto mode på toppen av Kubernetes.',
          'Innsikt i arbeid på tvers av organisasjonar/institusjonar.',
        ],
      },
    },
  },
  {
    slug: '2024-12-12-offentlig-paas-digital',
    title: 'Offentlig PaaS heldigital fagdag',
    ingress:
      'Årets siste fagdag arrangeres digitalt. Vi får blant annet besøk av Gabriele Bartolini, skaperen av CloudNativePG. Velkommen!',
    description:
      'Vi inviterer til en heldigital fagdag om plattformstrategi i offentlig sektor. Vi har et spennende program med foredrag fra blant annet Gabriele Bartolini, skaperen av CloudNativePG, UiO, Vy og Norsk Tipping, og en paneldebatt om plattformstrategi i offentlig sektor.',
    start: new Date('2024-12-12T10:00+01:00'),
    end: new Date('2024-12-12T14:00+01:00'),
    audience: Audience.PublicSector,
    location: 'Zoom',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Digital],
    },
    registrationUrl: 'https://forms.gle/xdGHJ3L1o7hbqWs77',
    recordingUrl:
      'https://youtube.com/playlist?list=PLjI_oey9FG7QgEE_vqFY7RYDCj4a9UYh4',
    organizers: [
      {
        name: 'Hans Kristian Flaatten',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
    ],
    schedule: [
      {
        time: '10:00 - 10:30',
        title: 'Det er Nais å være utvikler i SSB',
        description:
          'SSB har tatt i bruk Nais for å tilby en felles plattform for utviklere. I dette foredraget vil vi dele erfaringer fra prosessen og hvordan vi i Nav har jobbet med å gjøre Nais tilgjengelig for alle i offentlig sektor under Nais as a Service (NaaS).',
        speakers: [
          {
            name: 'John Kasper Svergja',
            org: 'SSB',
          },
          {
            name: 'Hans Kristian Flaatten',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=gIBBbNCAWfQ&list=PLjI_oey9FG7QgEE_vqFY7RYDCj4a9UYh4&index=1&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://docs.google.com/presentation/d/1djO4tizaLao0iXYO_jYsiUWz4yptQjNu0n9aVcVuEf0/edit?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '10:30 - 11:00',
        title: 'Paneldebatt: Plattformstrategi i offentlig sektor',
        description:
          'Hvordan jobber offentlig sektor med plattformstrategi? Hva er de største utfordringene og mulighetene? Vi har invitert en rekke eksperter til en paneldebatt om temaet.',
        speakers: [{ name: 'PIT, Skatteetaten, Nav, MET, og Oslo Origo' }],
        type: ItemType.Panel,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=mZDrKhGujlM&list=PLjI_oey9FG7QgEE_vqFY7RYDCj4a9UYh4&index=2&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '11:00 - 11:30',
        title: 'Plattformtjenester på UiO',
        description:
          'UiO har bygget en plattform for utviklere og ansatte på IT-avdelingen til å tilby tjenester til forskere og studenter. I dette foredraget vil vi høre mer om hvordan plattformen er bygget og hvilke tjenester som tilbys.',
        speakers: [{ name: 'Halvor Utby', org: 'UiO' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=luFDtrt0JvA&list=PLjI_oey9FG7QgEE_vqFY7RYDCj4a9UYh4&index=3&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1eABnl5ABN_knfqDfgHgJtJzhhSf7TlGu/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '11:30 - 12:00',
        title: 'Lunsj',
        type: ItemType.Break,
      },
      {
        time: '12:00 - 12:45',
        title: 'CloudNativePG - PostgreSQL on Kubernetes',
        description:
          'CloudNativePG is a PostgreSQL Operator for Kubernetes. It is designed to be a simple, reliable, and easy-to-use way to run highly available PostgreSQL clusters on Kubernetes. We will hear from the creator of CloudNativePG, Gabriele Bartolini, about the project and technical details.',
        speakers: [{ name: 'Gabriele Bartolini', org: 'EnterpriseDB' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=N_1lbt2e1Wk&list=PLjI_oey9FG7QgEE_vqFY7RYDCj4a9UYh4&index=4&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '12:50 - 13:05',
        title: 'Erfaringer fra å støtte 100 utviklere med et platformteam på 2',
        description:
          'Vy har et team av over 100 utviklere, men bare to personer i plattformteamet. Hvordan får vi dette til å fungere? I dette foredraget deler vi våre erfaringer med å drive et lite plattformteam i en større utviklingsorganisasjon. Vi ser på hvordan skytjenester lar oss opprettholde høy hastighet og effektivitet, hvilke områder vi velger å bygge egne løsninger på, og hvordan vi skaper verdi ved å møte utviklerne der de er – gjennom en produktfokusert tilnærming. Bli med og få innblikk i våre suksesser, fallgruver og annen læring vi har fått fra reisen så langt.',
        speakers: [
          { name: 'Nicolas Harlem Eide', org: 'Vy / Capra Consulting' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=MULI8qeevME&list=PLjI_oey9FG7QgEE_vqFY7RYDCj4a9UYh4&index=5&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1t50cf9Qm20aKoUisptgUOjhW6G2oIpWD/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '13:05 - 13:20',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '13:20 - 13:50',
        title: 'OpenTelemetry hos Norsk Tipping på vei til sky',
        description:
          'Tittel må sies å være en arbeidstittel... Norsk Tipping deler litt erfaringer de har sett med innføring av OpenTelemetry for å få innsikt ende-til-ende på tvers av sky (aws) og on-prem (wlp,k8s). Utfordringer, fordeler og veien videre. (Med håp om å finne noen som har vært i samme situasjon eller er på vei)',
        speakers: [{ name: 'Tom Andre Ska', org: 'Norsk Tipping' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=L0lJsuYfsNw&list=PLjI_oey9FG7QgEE_vqFY7RYDCj4a9UYh4&index=6&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1b73YBv3PgyldY1VyexiSKdk8wOtq4mFq/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '13:55 - 14:00',
        title: 'Avsluttning og god jul',
        description:
          'Tusen takk til alle som har vært med å gjøre Offentlig PaaS til nettverket for alle som er interessert i plattform i offentlig sektor i Norge.',
        speakers: [
          {
            name: 'Hans Kristian Flaatten',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Info,
      },
    ],
    stats: {
      registrations: 234,
      participants: 175,
      organisations: 53,
      feedback: {
        url: 'https://forms.gle/TBomJhjm7jvSnTEw6',
        averageRating: 4.68,
        respondents: 22,
        comments: [
          'Stor inspirasjon å høre om Cloud Native PG. Vi hadde en chat gående mens vi lyttet og kom overens at vi er frelste og skal bruke det i fremtiden fremfor DBaaS.',
          'Effektiv gjennomføring og aktuelle tema',
          'Veldig smooth og fungerte flott. Knall med talk fra CNPG-dev!',
        ],
      },
    },
  },
  {
    slug: '2024-06-20-observability-dag',
    title: 'Offentlig Observability Dag',
    ingress:
      'Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om observability, OpenTelemetry og Grafana i offentlig sektor.',
    description: `For aller første gang arrangerer vi Offentlig Observability Dag i samarbeid med Skatteetaten og Nav. Vi har et spennende program med foredrag fra Grafana, Skatteetaten, Nav, Kartverket, NHN og PIT som vil dele sine erfaringer.

    Som vanlig blir det god tid til erfaringsdeling og nettverksbygging. Arrangement er gratis og åpent for alle ansatte i offentlig sektor. Vi gleder oss til å se deg!`,
    start: new Date('2024-06-20T09:00+02:00'),
    end: new Date('2024-06-20T15:00+02:00'),
    audience: Audience.PublicSector,
    location: 'Nav, Fyrstikkalleen 1, 0661 Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    registrationUrl: 'https://forms.office.com/e/srPkwVU5rH',
    recordingUrl:
      'https://youtube.com/playlist?list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf',
    organizers: [
      {
        name: 'Robert Myhren',
        org: 'Skatteetaten',
        url: 'https://offentlig-paas-no.slack.com/team/U04BEMRE8R2',
      },
      {
        name: 'Hans Kristian Flaatten',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
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
        speakers: [{ name: 'Nav og Skatt' }],
        type: ItemType.Info,
      },
      {
        time: '09:35 - 10:20',
        title: 'Introduction to OpenTelemetry & Tracing (in English)',
        description:
          'OpenTelemetry is a set of APIs, libraries, agents, and instrumentation to provide observability in your applications. In this this talk, we will introduce OpenTelemetry and how it can be used to instrument your applications to collect traces, metrics, and logs. We will also show how to use OpenTelemetry with Grafana to visualize the collected data.',
        speakers: [{ name: 'Grafana Labs' }, { name: 'Sopra Steria' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=Z8UQM9lZsVU&list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://docs.google.com/presentation/d/1wNLwa-2edFGH3hp7poTw8Bsd62YQjtmIN730q94_2LA/edit?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '10:20 - 11:00',
        title: 'Observability i Skatteetaten',
        description:
          'Skatteetaten presenterer hvordan de jobber med robusthet og innsikt i sine systemer og applikasjoner.',
        speakers: [{ name: 'Skatteetaten' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=fhFZx2vnxcs&list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf&index=2',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://docs.google.com/presentation/d/18L2e5Knpqos8-M_dgCkaO2yYe6Kxn9nj/edit?usp=drive_link&ouid=109381646868227443677&rtpof=true&sd=true',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '11:00 - 12:00',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '12:00 - 12:40',
        title: 'Observability 2.0 i Nav',
        description:
          'I år startet Nav med å rulle ut støtte for OpenTelemetry for applikasjoner i NAIS med OpenTelemetry Operator, Grafana Tempo og Grafana Loki. I dette foredraget vil vi dele erfaringer og resultater fra dette arbeidet så langt, og kaste litt lys over hva som er planen videre.',
        speakers: [
          {
            name: 'Hans Kristian Flaatten',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=ZjNkpgMOarA&list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf&index=3',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1bljMnHFrutKOR-JZc8EEzZBUoqK4Ik68/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '12:40 - 13:05',
        title: 'Med kart og kompass på leting etter oversikt',
        description:
          'Kartverket presenterer sin erfaring med observability.Kartverkets reise mot helhetlig observability og de erfaringer som er gjort på veien.',
        speakers: [{ name: 'Thomas Berg', org: 'Kartverket' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=0wWt8knXs94&list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf&index=4',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1FPVExcmLEEHyXpPWdWYflftMUW6kPsk3/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '13:05 - 13:30',
        title: 'Praktisk SLO med Pyrra - "first steps to SRE"',
        description:
          'Hvordan kan vi bruke Pyrra til å overvåke tjenester og applikasjoner? Pyrra er et verktøy for å overvåke tjenester og applikasjoner, og gir deg mulighet til å sette opp Service Level Objectives (SLO).',
        speakers: [{ name: 'Magnus Johansen', org: 'PIT' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=appTKEyEO_Y&list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf&index=5',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://drive.google.com/file/d/1sWECdFHOf2LRfA9q5qZmShXqysp_z3SY/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '13:30 - 14:00',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '14:00 - 14:30',
        title: 'Utfordringer ved monitorering av dynamiske systemer',
        description:
          'Hvordan kan vi monitorere et system som er dynamisk og stadig endrer seg? Bygg dashbord som gir relevant tilbakemelding, ved å bruke OFFSET i PromQL for å sammenligne metrikker med tidligere data.',
        speakers: [{ name: 'Juan Piola Sanchez', org: 'NHN' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=_ZqHn6m2DAs&list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf&index=7&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '14:30 - 15:00',
        title: 'Argus - Digital signage',
        description:
          'Argus er en egenutviklet løsning for å vise frem observabilitydata i landskapet til Skatteetaten. Vi vil vise hvordan vi har bygget Argus, og hvordan vi bruker det i hverdagen.',
        speakers: [{ name: 'Robert Myhren', org: 'Skatteetaten' }],
        type: ItemType.Info,
        attachments: [
          {
            url: 'https://youtube.com/watch?v=1oHiHWUJLgw&list=PLjI_oey9FG7RjrV--OaG9MfCcNtNpP7rf&index=6&pp=gAQBiAQB',
            type: AttachmentType.Recording,
          },
          {
            url: 'https://docs.google.com/presentation/d/1Z7dakgPqfKkBAgBx7hXvuOzNBdiK6q5c/edit?usp=drive_link&ouid=109381646868227443677&rtpof=true&sd=true',
            type: AttachmentType.Slides,
          },
        ],
      },
    ],
    stats: {
      registrations: 212,
      participants: 150,
      organisations: 37,
      feedback: {
        url: 'https://forms.office.com/e/RsBK4J4kvc',
        averageRating: 4.54,
        respondents: 35,
        comments: [
          'Møte andre etater, erfare at andre også har lignende utfordringer som oss, tips og triks, inspirasjon',
          'Networking, og å høre om andres erfaringer rundt observability!',
          'Passe lavterskel og spennende selv for meg som utvikler.',
        ],
      },
    },
  },
  {
    slug: '2024-05-24-dataplattform-fagdag',
    title: 'Offentlig PaaS Fagdag om dataplattform',
    ingress: `Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om dataplattform i offentlig sektor.`,
    start: new Date('2024-05-24T09:00+02:00'),
    end: new Date('2024-05-24T15:00+02:00'),
    audience: Audience.PublicSector,
    location: 'UKE, Grensesvingen 6, 0661 Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    recordingUrl:
      'https://www.youtube.com/watch?v=Tp8t41Xofwg&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ',
    organizers: [
      {
        name: 'Tine Kleivan',
        org: 'Samferdselsdata',
        url: 'https://offentlig-paas-no.slack.com/team/U04HS5XGGGP',
      },
      {
        name: 'Pål de Vibe',
        org: 'Samferdselsdata',
        url: 'https://offentlig-paas-no.slack.com/team/U03GY5ENCSF',
      },
      {
        name: 'John Kasper Svergja',
        org: 'SSB',
        url: 'https://offentlig-paas-no.slack.com/team/UJJURGQQ1',
      },
    ],
    schedule: [
      {
        time: '08:00 - 08:30',
        title: 'Dørene åpner, mingling, kaffe, enkle mexicanske frokost-snacks',
        type: ItemType.Registration,
      },
      {
        time: '08:30 - 08:40',
        title: 'Velkommen /UKE, SSB og Datasamarbeidet i samferdsel',
        type: ItemType.Info,
      },
      {
        time: '08:40 - 09:10',
        title: 'Veien mot en datadrevet kommune',
        description:
          'Hvordan UKE skrur sammen teknologi og styresett for fellesdata i kommunen basert på Microsoft Fabric. Vi deler våre erfaringer og tanker for implementering av felles dataplattform for Oslo kommune.',
        speakers: [
          { name: 'Erik Tuv', org: 'UKE' },
          { name: 'Andre Gulbrandsen', org: 'UKE' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=Tp8t41Xofwg&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=1&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '09:10 - 09:40',
        title: 'Dataplattformer for fart og flyt i politiet',
        description:
          'Politiets IT Enhet organiserer seg rundt autonome produktteam for å skape mest mulig verdi for politiet og samfunnet. Med shift-left tankesett må autonome produktteam ta eit langt større ansvar for sine produkter enn før. Korleis kan dette skalere uten å lage enormt store team? Bli med og hør korleis PIT bygger dataplattformer for å skape fart og flyt!',
        speakers: [
          { name: 'Audun Vindenes Egge', org: 'PIT' },
          { name: 'Erlend Wiig', org: 'PIT' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=yqCiZ0CO03k&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=3&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '09:40 - 09:50',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '09:50 - 10:20',
        title: 'Datadeling med nasjonale felleskomponenter fra DigDir',
        description:
          'Samferdselsdata (Tverrsektorielt datasamarbeid for samferdsel) forteller om vårt samarbeid med DigDir og samferdselsvirksomhetene om å benytte DigDir sine nasjonale fellestjenester som data.norge.no, maskinporten, altinn og ansattporten for å muliggjøre datadeling på nasjonalt plan.',
        speakers: [{ name: 'Tine Kleivane', org: 'Samferdselsdata' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=yjHvCLwDa6c&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=2&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '10:20 - 10:50',
        title: 'Et hav av data – Kystverket',
        description:
          'Kystverket startet i 2023 arbeidet med en skybasert dataplattform. Vi har mye forskjellig data - store datasett som skipstrafikk og mindre datasett som hvor fisk kan landes. Uten særlig teknisk gjeld i skyen stilte vi relativt fritt. Underveis har vi tatt veivalg, angret veivalg, testet teknologier og fått våre forventninger utfordret. Alt vi gjør skal bidra til å utføre vårt samfunnsoppdrag om å gjøre kysten til verdens sikreste og reneste.',
        speakers: [{ name: 'Stefan Ekehaug', org: 'Kystverket' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=rcq8O5C6YvE&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=4&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '10:50 - 11:00',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '11:00 - 11:30',
        title: 'En Open Source datastack basert på Onyxia',
        description:
          'SSB presenterer arbeidet sitt med å implementere tjenesteplattform Onyxia i sin skybaserte dataplattform, Dapla. Onyxia er utviklet av det franske statistikkbyrået (INSEE) og bygger på åpne standarder som kubernetes, helm og oidc. Den gjør det lett å tilby open source verktøy pakket som containere, slik som Jupyter, RStudio, VS Code, MLFlow osv. på en enkel og brukervennlig måte.',
        speakers: [{ name: 'Øyvind Bruer-Skarsbø', org: 'SSB' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=7SuXRfQqdGM&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=5&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '11:30 - 12:15',
        title: 'Lunsj',
        description: 'Lunsj fra Tortas el Tommy',
        type: ItemType.Break,
      },
      {
        time: '12:15 - 12:45',
        title:
          'Skatteetatens Data- og Analyseplattform - 1 år inn i produksjon',
        description:
          'Siden fjorårets «skattesesong» har Skatteetaten vært i produksjon med sin data- og analyseplattform basert på Databricks i Azure. (Ja, vi vet, en «navnekonkurranse» er long overdue.) Vi mistenker at det vi lager og gjør, hver eneste dag, er noe mange andre foreløpig har som visjon. Så vi deler gjerne av våre erfaringer. I løpet av noen heseblesende minutter vil vi på Offentlig PaaS’ fagdag prøve å formidle: - Hvorfor vi bygger en plattform - Hvordan den er utviklet og videreutvikles - i smått og i stort - Hvordan vi organiserer arbeidet - i smått og i stort - Hva den brukes til akkurat nå',
        speakers: [
          { name: 'Tron Magnus Svagård', org: 'Skatt' },
          { name: 'Johanna Anker Kulmus', org: 'Skatt' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '12:45 - 13:15',
        title:
          'Foredrag: Data as Code – hvorfor snakker alle om dbt og hva er det?',
        description:
          'Data build tool er et meget populært verktøy i datalandskapet, og det har sett en utrolig vekst de siste årene. Det har nesten blitt standard å bruke dbt på plattformer som BigQuery, Snowflake og Databricks. Hva er det egentlig som gjør dette så fett? Hvordan passer dbt inn i en dataplattform og hvordan lar det deg jobbe?',
        speakers: [{ name: 'Anders Elton', org: 'Telenor' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=Ra_awsiBBVQ&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=6&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '13:15 - 13:25',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '13:25 - 13:55',
        title: 'Datakontrakter',
        description:
          'Entur implementerer Data kontrakter på GCP. Her forteller de om implikasjonene dette har for reaktiv-arkitektur, der kontrakten blir et kontrollplangrensesnitt for dataplattform-arkitekturen.',
        speakers: [{ name: 'Anders Dahlen', org: 'Entur' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=B34_u5xKTJc&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=7&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '13:55 - 14:25',
        title: 'MLOps hos Posten',
        description:
          'Posten Bring har i flere år utviklet maskinlæringsløsninger for produksjon og merket at forvaltning av disse løsningene begynte å stjele all kapasiteten til vår data science avdeling. Vi har derfor i over ett år nå jobbet med å bygge en MLOps plattform for å effektivisere utviklingen og forvaltningen av maskinlærings- og dataprodukter. I dette foredraget skal vi gi et innblikk i våre motivasjoner og erfaringer så langt, samt ta et dypdykk ned i vår tekniske arkitektur.',
        speakers: [
          { name: 'Ella Johnsen', org: 'Posten Bring AS' },
          { name: 'Simen Larsen', org: 'Posten Bring AS' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://www.youtube.com/watch?v=cC6E5S1KGVs&list=PLjI_oey9FG7Qr9IO8m0nf-pM-xR0jUcOJ&index=8&pp=iAQB',
            type: AttachmentType.Recording,
          },
        ],
      },
      {
        time: '14:25 - 14:30',
        title: 'Avslutning',
        type: ItemType.Info,
      },
    ],
    stats: {
      organisations: 35,
      participants: 93,
      registrations: 93,
    },
  },
  {
    slug: '2023-09-14-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om plattformer i offentlig sektor i Telenor sine fine lokaler på Fornebu.',
    start: new Date('2023-09-14T11:30+02:00'),
    end: new Date('2023-09-14T17:00+02:00'),
    audience: Audience.PublicSector,
    location: 'Telenor, Snarøyveien 30, 1360 Fornebu',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Mats Bækkelund',
        org: 'Telenor',
        url: 'https://offentlig-paas-no.slack.com/team/U04QQLQ7KK8',
      },
      {
        name: 'Hans Kristian Flaatten',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
    ],
    schedule: [
      {
        time: '11:30 - 12:00',
        title: 'Dørene åpner, mingling.',
        type: ItemType.Registration,
      },
      {
        time: '12:00 - 12:10',
        title: 'Velkommen',
        type: ItemType.Info,
        attachments: [
          {
            url: 'https://docs.google.com/presentation/d/19AqTGy8vPKOg-USBUlj10BitlxcRoyAK/edit?usp=drive_link&ouid=109381646868227443677&rtpof=true&sd=true',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '12:10 - 13:00',
        title:
          'Creating a software company out of a 168 year old Telco company',
        description:
          'What Telenor have done in the last couple of years going from being driven by toll gates and bureaucracy to autonomy and cloud native.',
        speakers: [
          { name: 'Frode Bjerkenes', org: 'Telenor' },
          { name: 'Vaibhav Bansal', org: 'Telenor' },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://docs.google.com/presentation/d/1_7vEoW1CUlO-o97hqPr7bo6ULc4wEhfl/edit?usp=drive_link&ouid=109381646868227443677&rtpof=true&sd=true',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '13:10 - 14:00',
        title: 'Infrastructure as Software',
        description:
          'Nav sin reise fra konfigurasjonsstyring av servere, til infrastruktur som kode (terraform) og videre til det vi i dag kaller infrastruktur som software som tar hele livssyklusen til infrastruktur – ikke bare det å sette den opp.',
        speakers: [
          {
            name: 'Hans Kristian Flaatten',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://drive.google.com/file/d/1Nk0Sv5IqwQjHTMJw28_wBkhnr7XdO9i5/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '14:00 - 14:30',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '14:30 - 15:00',
        title: 'Containers are awesome',
        description:
          'Technology finds more and more adaptation in our daily IT lifes. They are fast, agile and shareable. All those positives bring a downside to it - visibility. Can I trust every container content? Is my container behaving like it should? How do I detect anomalies in containers that are ephemeral by nature? We want to tackle those questions in our session and show you what Open-Source Falco and Sysdig can do for you to win back container visibility without compromising on the benefit of containers.',
        speakers: [{ name: 'Stefan Trimborn', org: 'Sysdig' }],
        type: ItemType.Talk,
      },
      {
        time: '15:00 - 15:30',
        title: 'Entur sin reise til GCP',
        description:
          'I Entur har vi redesignet hele arkitekturen vår på GCP, og det siste året har vi satt det i drift. Alt ble rullet ut på nytt, og alle ressurser på GCP og Kubernetes er nå segmentert og tilgangsstyrt etter applikasjon og miljø, og alt er satt opp fra kode. I skrivende stund har vi 800 prosjekter, og flere skal det bli. Hva er det vi driver med?',
        speakers: [{ name: 'Sindre Lindstad', org: 'Entur' }],
        type: ItemType.Talk,
      },
      {
        time: '15:30 - 16:00',
        title: '140+ cluster med ROR',
        description:
          'Se og hør hvordan NHN drifter 140+ cluster vårt egenutviklede verktøy ROR. ROR (Release - Operate - Report) er et verktøy som lar utviklere og driftsteam selv deploye, drifte og observere standardiserte cluster med organisasjonens tooling.',
        speakers: [{ name: 'Håvard Elnan', org: 'NHN' }],
        type: ItemType.Talk,
      },
      {
        time: '16:00 - 16:15',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '16:15 - 16:45',
        title: 'Trøbbel med Skatteetatens nettsider',
        description:
          'Flere brukere rapporterte om problemer med innlevering av Skattemeldingen sin. Hva var bakgrunnen og hvilken lærdom tok vi?',
        speakers: [{ name: 'Are Vattekar', org: 'Skatteetaten' }],
        type: ItemType.Talk,
      },
      {
        time: '16:45 - 17:00',
        title: 'Enklere onboarding til Maskinporten og Skyporten',
        description:
          'Vi lanserer i disse dager en pilot sammen med Digdir; en løsning for å forenkle onboarding til Maskinporten, og Skyporten for å dele store datamengder. Dette kan være aktuelt for virksomheter som enten tilbyr eller konsumerer Maskinporten-apier eller skal dele data ut i offentlig sektor.',
        speakers: [
          { name: 'Tine Kleivane', org: 'Tverrsektorielt datasamarbeid' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '17:00 - 20:30',
        title: 'Ut og spise?',
        description: 'NB! Husk å svare i påmelding',
        type: ItemType.Info,
      },
    ],
    stats: {
      organisations: 26,
      participants: 90,
      registrations: 90,
    },
  },
  {
    slug: '2023-05-04-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om plattformer i offentlig sektor i Skatteetatens sine fine lokaler.',
    start: new Date('2023-05-04T11:30+02:00'),
    end: new Date('2023-05-04T17:00+02:00'),
    audience: Audience.PublicSector,
    location: 'Skatteetaten, Fredrik Selmers vei 4, 0663 Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Are Vattekar',
        org: 'Skatteetaten',
        url: 'https://offentlig-paas-no.slack.com/team/U4SM25LUQ',
      },
      {
        name: 'Ala Mehersia',
        org: 'Skatteetaten',
        url: 'https://offentlig-paas-no.slack.com/team/U052S0R4ZEZ',
      },
      {
        name: 'Hans Kristian Flaatten',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
    ],
    schedule: [
      {
        time: '11:30 - 12:00',
        title: 'Dørene åpner, mingling',
        type: ItemType.Registration,
      },
      {
        time: '12:00 - 12:10',
        title: 'Velkommen',
        description:
          'Thomas Heiskel, avdelingsdirektør for plattformer Skatteetaten ønsker velkommen.',
        type: ItemType.Info,
      },
      {
        time: '12:10 - 13:00',
        title: 'Introduksjon til ny applikasjonsplattform på Azure',
        speakers: [{ name: 'Skatteetaten' }],
        type: ItemType.Talk,
      },
      {
        time: '13:00 - 14:00',
        title: 'Adopting Network Policies in Highly Secure Environments',
        description:
          'In the world of distributed computing, everything goes over the network, but only some things should be public - especially in highly secured environments like financial services or telecommunications. Unfortunately, Kubernetes networking is open by default, and it is up to you to adopt network policies to secure it.',
        speakers: [{ name: 'Stephane Karagulmez', org: 'Isovalent' }],
        type: ItemType.Talk,
      },
      {
        time: '14:00 - 14:30',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '14:30 - 15:00',
        title: 'Introduksjon til ny data og analyseplattform på Azure',
        speakers: [{ name: 'Skatteetaten' }],
        type: ItemType.Talk,
      },
      {
        time: '15:00 - 15:30',
        title: 'Innebygget brukervennlighet i SKIP',
        description:
          'Det er et kjent dilemma at sikkerhet og lettvinthet ligger på en akse, og at høyere sikkerhet fører til lavere lettvinthet. Men må det være sånn? Plattform-teamet SKIP fra Statens Kartverk forteller om sine erfaringer med å bygge en plattform for en organisasjon som i varierende grad er kjent med sky og verktøyene vi bygget underveis for å sørge for innebygget sikkerhet',
        speakers: [{ name: 'Espen Henriksen', org: 'Kartverket' }],
        type: ItemType.Talk,
      },
      {
        time: '15:30 - 16:00',
        title:
          'Datasamarbeid i samferdselssektoren: erfaringer og fellesløsninger',
        description:
          'Tverrsektorielt datasamarbeid jobber for å støtte datadeling mellom virksomheter i samferdselssektoren. Hvilke utfordringer går igjen på tvers av virksomhetene her? Og hvilke utfordringer er egentlig nasjonale? Vi forsøker å adressere to av disse; tilgangsstyring og distribusjon; i en pilot sammen med Digdir.',
        speakers: [
          {
            name: 'Tine Kleivane',
            org: 'Samferdselsdata',
          },
          {
            name: 'Pål de Vibe',
            org: 'Samferdselsdata',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '16:00 - 16:15',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '16:15 - 16:45',
        title: 'Vy sin AWS Native Utvikler plattform',
        description:
          'Vy kjører hele produksjonen sin med AWS, og dermed også utviklerplattformen. Her går jeg inn i hvordan utviklerne arbeider med miljøene, og hvordan vi har snekret sammen plattformen med hjelp av AWS tjenester!',
        speakers: [{ name: 'Nicolas Harlem Eide', org: 'Vy' }],
        type: ItemType.Talk,
      },
      {
        time: '16:45 - 17:00',
        title: 'Mitt skip er lastet med …',
        description:
          'Kubernetes etcd panic mode: konsekvens, feilretting og hvorfor Kyverno + fluxcd var en uheldig kombinasjon.',
        speakers: [{ name: 'Endre Lervik', org: 'Meteorologisk institutt' }],
        type: ItemType.Talk,
      },
      {
        time: '17:00 - 20:30',
        title: 'Ut og spise?',
        description: 'NB! Husk å svare i påmelding',
        type: ItemType.Info,
      },
    ],
    stats: {
      organisations: 29,
      participants: 87,
      registrations: 87,
    },
  },
  {
    slug: '2023-02-16-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om plattformer i offentlig sektor.',
    start: new Date('2023-02-16T11:30+01:00'),
    end: new Date('2023-02-16T16:00+01:00'),
    audience: Audience.PublicSector,
    location: 'Politiets IT-enhet (PIT), Fridtjof Nansens vei 14, 0031 Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    registrationUrl: 'https://forms.gle/hoUYRFyiVzydS5ej6',
    organizers: [
      {
        name: 'Erlend Wiig',
        org: 'Politiets IT-enhet',
        url: 'https://offentlig-paas-no.slack.com/team/U0326RQ5PHB',
      },
      {
        name: 'Roger Karlsson',
        org: 'Politiets IT-enhet',
        url: 'https://offentlig-paas-no.slack.com/team/U51A07M0V',
      },
      {
        name: 'Hans Kristian Flaatten',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
    ],
    schedule: [
      {
        time: '11:30',
        title: 'Dørene åpner, mingling',
        type: ItemType.Registration,
      },
      {
        time: '12:00',
        title: 'Velkommen (Menti)',
        type: ItemType.Info,
      },
      {
        time: '12:15',
        title: 'Foredrag',
        speakers: [{ name: 'PIT' }],
        type: ItemType.Talk,
      },
      {
        time: '12:50',
        title: 'Consul / Boundary',
        speakers: [{ name: 'Hashicorp' }],
        type: ItemType.Talk,
      },
      {
        time: '13:30',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '14:15',
        title: 'Deling av plattform i almen sky',
        speakers: [{ name: 'Nav, PIT, Skatt, Digdir, Mattilsynet, NSM' }],
        type: ItemType.Panel,
      },
      {
        time: '15:00',
        title: 'Brolagt sti i Oslo Origo - fra Kubernetes til AWS-native',
        speakers: [{ name: 'Endre Midtgård Meckelborg', org: 'Oslo Origo' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://drive.google.com/file/d/1i9OaIECbYiPNjTFQ-WSyBUi6ayns-BTg/view?usp=drive_link',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '15:30',
        title: 'Som utvikler forventer jeg dette fra en god plattform',
        speakers: [{ name: 'Johannes Brodwall', org: 'PIT' }],
        type: ItemType.Talk,
        attachments: [
          {
            url: 'https://docs.google.com/presentation/d/1Mx_dCchSZ8nxCmMeT0DbKD1qAr1kF-Di/edit?usp=drive_link&ouid=109381646868227443677&rtpof=true&sd=true',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '16:00',
        title: 'Ut og spise?',
        description: 'NB! Husk å svare i påmelding',
        type: ItemType.Info,
      },
    ],
    stats: {
      organisations: 29,
      participants: 110,
      registrations: 110,
    },
  },
  {
    slug: '2020-12-08-fagdag',
    title: 'Offentlig PaaS Digital Fagdag',
    ingress:
      'Vi inviterer til digital fagdag med fokus på sikkerhet i skyen og statusoppdateringer fra offentlige organisasjoner.',
    description:
      'En heldigital fagdag under pandemien med foredrag fra NSM om skytjenester og sikkerhet, Nav om Device Un-management, samt statusoppdateringer fra 8 forskjellige etater. Gjennomført som Microsoft Teams Live Event med over 100 deltakere.',
    start: new Date('2020-12-08T12:00+01:00'),
    end: new Date('2020-12-08T15:00+01:00'),
    audience: Audience.PublicSector,
    location: 'Microsoft Teams Live Event',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Digital],
    },
    organizers: [
      {
        name: 'Are Egner-Kaupang',
        org: 'SSB',
        url: 'https://offentlig-paas-no.slack.com/team/U4TE7DAQX',
      },
    ],
    schedule: [
      {
        time: '12:00 - 12:45',
        title: 'Innlegg fra SSB',
        description:
          'Velkommen og presentasjon av SSB sine plattforminitiativ og dataplattform.',
        speakers: [
          { name: 'Christian Thindberg', org: 'SSB' },
          { name: 'Trygve Falch', org: 'SSB' },
          { name: 'Team Stratus', org: 'SSB' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '13:00 - 14:00',
        title: 'Skytjenester og sikkerhet',
        description:
          'Nasjonal sikkerhetsmyndighet presenterer sikkerhetsperspektiver ved bruk av skytjenester i offentlig sektor.',
        speakers: [{ name: 'John Bothner', org: 'NSM' }],
        type: ItemType.Talk,
      },
      {
        time: '14:10 - 14:30',
        title: 'Device Un-management',
        description:
          'Nav presenterer tilnærmingen til enhetshåndtering og hvordan de jobber med moderne workplace-løsninger.',
        speakers: [{ name: 'Torbjørn Hallenberg', org: 'Nav' }],
        type: ItemType.Talk,
      },
      {
        time: '14:30 - 15:00',
        title: 'Statusinnlegg fra organisasjonene',
        description:
          'Rask status og utfordringer fra 8 etater: Posten Norge (Digipost), Norsk Helsenett SF, Oslo Kommune Origo, Husbanken, Nav, Skatteetaten, Politiets IKT-tjenester og Fiskeridirektoratet.',
        speakers: [
          { name: 'Posten Norge (Digipost)' },
          { name: 'Norsk Helsenett SF' },
          { name: 'Oslo Kommune Origo' },
          { name: 'Husbanken' },
          { name: 'Nav' },
          { name: 'Skatteetaten' },
          { name: 'Politiets IKT-tjenester' },
          { name: 'Fiskeridirektoratet' },
        ],
        type: ItemType.Panel,
        attachments: [
          {
            url: 'https://docs.google.com/presentation/d/10u62Ozc9SnLG7gA0YrL9ipqWpQ1gaR3I_o-AFVWho80/edit?usp=sharing',
            type: AttachmentType.Slides,
          },
        ],
      },
    ],
    stats: {
      registrations: 110,
      participants: 110,
      organisations: 18,
    },
  },
  {
    slug: '2020-02-11-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til fagdag om erfaringer med sky hos Oslo kommune på Rådhusplassen med besøk fra Google, Amazon og Microsoft.',
    description:
      'En dag fokusert på erfaringer med å ta steget ut i skyen. Vi får besøk av de tre store skyleverandørene Google, Amazon og Microsoft som deler erfaringer fra nordiske kunder. I tillegg blir det lyntaler om markedsplass for skytjenester, GCP-verktøy og SRE-prinsipper.',
    start: new Date('2020-02-11T08:30+01:00'),
    end: new Date('2020-02-11T16:00+01:00'),
    audience: Audience.PublicSector,
    location: 'Oslo kommune, Rådhusplassen 1, Auditoriet',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Fredrik Vraalsen',
        org: 'Oslo kommune',
      },
      {
        name: 'Per Kjetil Grotnes',
        org: 'Oslo kommune',
        url: 'https://offentlig-paas-no.slack.com/team/U6UF56Z0R',
      },
    ],
    stats: {
      organisations: 30,
      participants: 100,
      registrations: 114,
    },
    schedule: [
      {
        time: '08:30 - 09:00',
        title: 'Registrering',
        description: 'Kaffe/te og frukt',
        type: ItemType.Registration,
      },
      {
        time: '09:00 - 09:15',
        title: 'Velkommen',
        speakers: [
          { name: 'Per Kjetil Grotnes', org: 'Oslo kommune' },
          { name: 'Fredrik Vraalsen', org: 'Oslo kommune' },
        ],
        type: ItemType.Info,
      },
      {
        time: '09:15 - 09:45',
        title: 'Oppdatering',
        description: 'Status fra alle deltagende organisasjoner',
        speakers: [{ name: 'Alle' }],
        type: ItemType.Panel,
      },
      {
        time: '09:45 - 10:00',
        title: 'Pause',
        description: 'Kaffe/te og frukt',
        type: ItemType.Break,
      },
      {
        time: '10:00 - 11:00',
        title:
          'Migrating customers to Google Public Cloud, learning from the field',
        description:
          'Experiences and learning from migrating Nordic companies to Google Cloud. Focus on important use cases covering different industries with various requirements, different cultures and structures. Deep dive into where Cloud works well and where it breaks.',
        speakers: [{ name: 'Abdel Sghiouar', org: 'Google' }],
        type: ItemType.Talk,
      },
      {
        time: '11:00 - 11:15',
        title: 'Pause',
        description: 'Kaffe/te og frukt',
        type: ItemType.Break,
      },
      {
        time: '11:15 - 12:15',
        title: 'Sky arkitektur med AWS',
        description:
          'Beste praksis for utvikling i skyen med AWS. Prinsipper og eksempler på referanse arkitekturer for skybasert utvikling.',
        speakers: [{ name: 'Ragnar Harper', org: 'Amazon' }],
        type: ItemType.Talk,
      },
      {
        time: '12:15 - 13:00',
        title: 'Lunsj',
        description: 'Baguetter',
        type: ItemType.Break,
      },
      {
        time: '13:00 - 14:00',
        title: 'Running government level secure solutions on Microsoft Azure',
        description:
          'How running applications on Azure Kubernetes Services can help you stay compliant and secure. Latest features in Azure and customer cases running open source based solutions in Azure.',
        speakers: [{ name: 'Mikkel Hegnhøj', org: 'Microsoft' }],
        type: ItemType.Talk,
      },
      {
        time: '14:00 - 14:15',
        title: 'Pause',
        description: 'Kaffe/te og frukt',
        type: ItemType.Break,
      },
      {
        time: '14:15 - 14:50',
        title: 'Lyntaler',
        description: 'Tre korte presentasjoner om aktuelle tema',
        speakers: [
          { name: 'Håvard Reknes', org: 'Digitaliseringsdirektoratet' },
          { name: 'Frode Sundby', org: 'Nav' },
          { name: 'Johnny Horvi', org: 'Nav' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '14:50 - 15:10',
        title: 'Pause',
        description: 'Kanelboller og kaffe/te',
        type: ItemType.Break,
      },
      {
        time: '15:10 - 15:50',
        title: 'Lyntaler',
        description: 'Tre korte presentasjoner om hybrid sky og serverless',
        speakers: [
          { name: 'Harald Alexander Kulø', org: 'Oslo kommune' },
          { name: 'Fredrik Vraalsen', org: 'Oslo kommune' },
          {
            name: 'Hans Kristian Flaatten',
            org: 'Fiskeridirektoratet',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '15:50 - 16:00',
        title: 'Avslutning',
        type: ItemType.Info,
      },
    ],
  },
  {
    slug: '2019-09-10-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til fagdag hos EVRY Academy på Fornebu fylt med spennende foredrag og erfaringsdeling om plattform i offentlig sektor.',
    description:
      'En dag med OpenShift, DevOps plattformer, container images, Open Spaces diskusjoner og Knative demo. Vi får besøk av RedHat, KMD, FINN og får høre om Telenors skysatsing. Over 100 deltakere fra mer enn 20 forskjellige etater og selskaper.',
    start: new Date('2019-09-10T08:30+02:00'),
    end: new Date('2019-09-10T17:00+02:00'),
    audience: Audience.PublicSector,
    location: 'EVRY Academy, Snarøyveien 30, 1360 Fornebu',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Hans Kristian Flaatten',
        org: 'EVRY / Fiskeridirektoratet',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
      },
      {
        name: 'Frode Bjerkenes',
        org: 'Telenor',
        url: 'https://offentlig-paas-no.slack.com/team/U7CK184RJ',
      },
    ],
    stats: {
      organisations: 22,
      participants: 90,
      registrations: 94,
      feedback: {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSf_C8mmHLGkJKqIqrU3aLjsYbTpZQluTog-MggRIHhlOrdu5Q/viewform',
        respondents: 18,
        averageRating: 4.6,
        comments: [
          'Veldig bra med kort status fra etatene. Det gjør at man kan følge progresjonen.',
          'Varierte talks. Fint at statssekretæren tok seg en tur.',
          'Veldig bra for nettverk og informasjonsutveksling',
        ],
      },
    },
    schedule: [
      {
        time: '08:30 - 09:00',
        title: 'Registrering',
        speakers: [
          {
            name: 'Hans Kristian Flaatten',
            org: 'EVRY / Fiskeridirektoratet',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
          { name: 'Erik Eggen' },
          { name: 'Terje Husby' },
        ],
        type: ItemType.Registration,
      },
      {
        time: '09:00 - 09:15',
        title: 'Velkommen',
        speakers: [
          { name: 'Frode Bjerkenes', org: 'Telenor' },
          {
            name: 'Hans Kristian Flaatten',
            org: 'EVRY / Fiskeridirektoratet',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Info,
      },
      {
        time: '09:15 - 09:45',
        title: 'RedHat OpenShift – The Kubernetes Platform for Big Ideas',
        speakers: [{ name: 'Vikram Singh', org: 'RedHat' }],
        type: ItemType.Talk,
      },
      {
        time: '09:45 - 10:15',
        title: 'Oppdatering',
        description: 'Status fra alle deltagende organisasjoner',
        speakers: [{ name: 'Alle' }],
        type: ItemType.Panel,
      },
      {
        time: '10:15 - 10:30',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '10:30 - 10:50',
        title: 'Telenor DevOps Platform; dchub/bsshub',
        speakers: [{ name: 'Ronny Pettersen', org: 'Telenor' }],
        type: ItemType.Talk,
      },
      {
        time: '10:50 - 11:10',
        title: 'Bygging av container images: Jib vs Kaniko',
        speakers: [{ name: 'Øyvind Ødegård' }],
        type: ItemType.Talk,
      },
      {
        time: '11:10 - 11:30',
        title: 'Telenors skysatsing',
        speakers: [
          { name: 'Arnstein Schei', org: 'Telenor' },
          { name: 'Bosse', org: 'Telenor' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '11:30 - 12:30',
        title: 'Lunsj',
        type: ItemType.Break,
      },
      {
        time: '12:30 - 13:00',
        title: 'Foredrag',
        speakers: [
          {
            name: 'Paul Chaffey',
            org: 'Kommunal og Moderniseringsdepartementet',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '13:00 - 13:30',
        title: 'En plattform for fart',
        speakers: [
          { name: 'Henning Spjelkavik', org: 'FINN' },
          { name: 'Ivar Conradi Østhus', org: 'FINN' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '13:30 - 15:30',
        title: 'Open Spaces',
        description:
          'Fire parallelle spor: Monitoring/Observability, Erfaringer med Sky og Cloud Native arkitektur, Metodologi (Lean/Agile/DevOps), og Leder-spor',
        type: ItemType.Panel,
      },
      {
        time: '15:30 - 16:30',
        title: 'Knative – Serverless Demo',
        speakers: [
          {
            name: 'Hans Kristian Flaatten',
            org: 'EVRY / Fiskeridirektoratet',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Talk,
      },
      {
        time: '16:30 - 16:40',
        title: 'Avslutning',
        speakers: [
          { name: 'Frode Bjerkenes', org: 'Telenor' },
          {
            name: 'Hans Kristian Flaatten',
            org: 'EVRY / Fiskeridirektoratet',
            url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
          },
        ],
        type: ItemType.Info,
      },
    ],
  },
  {
    slug: '2019-06-20-testing-minifagdag',
    title: 'Mini fagdag: Testing av plattform',
    ingress:
      'Pizza-lunsj hos SSB i Oslo for å prate om testing av plattform. Vi får besøk av konsulent med praktisk erfaring som holder kort introduksjon.',
    description:
      'BIP-teamet inviterer til en uformell fagdag om testing av plattform. Vi snakker om testing av infrastruktur som kode og testing av kjørende skyplattform. En konsulent med praktisk erfaring holder en kort introduksjon for å sette i gang diskusjonen. Lunsjen har plass til 30 personer og følger "førstemann til mølla"-prinsippet.',
    start: new Date('2019-06-20T11:00+02:00'),
    end: new Date('2019-06-20T13:00+02:00'),
    audience: Audience.PublicSector,
    location: 'SSB, Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Lise Wold Eriksen',
        org: 'SSB',
        url: 'https://offentlig-paas-no.slack.com/team/U77K15333',
      },
    ],
    schedule: [
      {
        time: '11:00 - 11:15',
        title: 'Velkommen og pizza',
        type: ItemType.Registration,
      },
      {
        time: '11:15 - 11:45',
        title: 'Introduksjon til testing av plattform',
        description:
          'Kort introduksjon til testing av infrastruktur som kode og testing av kjørende skyplattform.',
        speakers: [{ name: 'Ekstern konsulent' }],
        type: ItemType.Talk,
      },
      {
        time: '11:45 - 13:00',
        title: 'Diskusjon og erfaringsdeling',
        description:
          'Åpen diskusjon om utfordringer og erfaringer med testing av plattform.',
        type: ItemType.Panel,
      },
    ],
  },
  {
    slug: '2018-10-31-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til fagdag hos SSB i Oslo med fokus på sikkerhet i sky, ID-porten og Maskinporten, og prosessen med Nav i offentlig sky.',
    description:
      'En dag med foredrag om sikkerhetsperspektiver i skyen, erfaringer med ID-porten og Maskinporten fra Skatteetaten, Nav sin prosess med offentlig sky, Open Space diskusjoner og presentasjon av SSB sin BIP (Byråets IT-Platform).',
    start: new Date('2018-10-31T08:45+02:00'),
    end: new Date('2018-10-31T17:00+02:00'),
    audience: Audience.PublicSector,
    location: 'SSB, Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Lars-Roger Billingsø',
        org: 'SSB',
        url: 'https://offentlig-paas-no.slack.com/team/U4SPU630R',
      },
      {
        name: 'Lise Wold Eriksen',
        org: 'SSB',
        url: 'https://offentlig-paas-no.slack.com/team/U77K15333',
      },
      {
        name: 'Erik Øvrum',
        org: 'SSB',
        url: 'https://offentlig-paas-no.slack.com/team/U4TE8E3AN',
      },
    ],
    schedule: [
      {
        time: '08:45 - 09:00',
        title: 'Kaffehenting og plassfinning',
        type: ItemType.Registration,
      },
      {
        time: '09:00 - 09:15',
        title: 'Velkommen, agenda og fasiliteter',
        speakers: [{ name: 'Lars-Roger Billingsø', org: 'SSB' }],
        type: ItemType.Info,
      },
      {
        time: '09:15 - 10:00',
        title: 'ID-porten/Maskinporten og SKDs bruk av denne',
        speakers: [
          {
            name: 'Are Vattekar',
            org: 'Skatteetaten',
            url: 'https://offentlig-paas-no.slack.com/team/U4SM25LUQ',
          },
          { name: 'Jørgen Binningsbø', org: 'Difi' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '10:00 - 10:15',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '10:15 - 12:00',
        title:
          'A Perspective of a Motivated Hacker: Can Cloud Manage Security Better?',
        speakers: [{ name: 'Mike Jankowski-Lorek' }],
        type: ItemType.Talk,
      },
      {
        time: '12:00 - 13:00',
        title: 'Lunsj',
        type: ItemType.Break,
      },
      {
        time: '13:00 - 13:45',
        title: 'Prosessen med Nav i public sky',
        speakers: [
          {
            name: 'Audun Fauchald Strand',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U4U0AJ4HM',
          },
          { name: 'Jørgen Solberg', org: 'Nav' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '14:00 - 16:00',
        title: 'Open Space med eget lederspor',
        type: ItemType.Panel,
      },
      {
        time: '16:00 - 16:30',
        title: 'Presentasjon av BIP (Byrâets IT-Platform) og sikring av denne',
        speakers: [
          { name: 'Lars-Roger Billingsø', org: 'SSB' },
          { name: 'Bjørn Vestli', org: 'SSB' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '16:30 - 17:00',
        title: 'Avslutning, kommentarer fra salen, sted og tid for neste møte',
        speakers: [{ name: 'Lars-Roger Billingsø', org: 'SSB' }],
        type: ItemType.Info,
      },
    ],
  },
  {
    slug: '2018-02-15-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til fagdag hos Politiets IKT-tjenester i Oslo med fokus på DevOps, Kubernetes og Open Space diskusjoner.',
    description:
      'En dag med lynstatus fra alle etater, foredrag om hvordan få med ledelsen på DevOps og kontinuerlige leveranser, demo av Organa plattformen, og Open Space diskusjoner. Avslutter med Google og Kubernetes presentasjon.',
    start: new Date('2018-02-15T08:45+01:00'),
    end: new Date('2018-02-15T17:00+01:00'),
    audience: Audience.PublicSector,
    location: 'Politiets IKT-tjenester, Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Roger Karlsson',
        org: 'Politiets IKT-tjenester',
        url: 'https://offentlig-paas-no.slack.com/team/U51A07M0V',
      },
    ],
    socialEvent: {
      description:
        'Felles middag et sted i sentrum for de som ønsker å fortsette diskusjonene.',
      start: new Date('2018-02-15T17:00+01:00'),
      location: 'Oslo sentrum',
    },
    schedule: [
      {
        time: '08:45 - 09:00',
        title: 'Alle finner sin plass',
        type: ItemType.Registration,
      },
      {
        time: '09:00 - 09:15',
        title: 'Velkommen og gjennomgang av agenda',
        speakers: [
          {
            name: 'Roger Karlsson',
            org: 'Politiets IKT-tjenester',
            url: 'https://offentlig-paas-no.slack.com/team/U51A07M0V',
          },
        ],
        type: ItemType.Info,
      },
      {
        time: '09:15 - 10:15',
        title: 'Lynstatus fra etatene',
        description:
          'Maks 3 minutter per etat: Siden forrige fagdag har vi fått til... Planen vår videre er... Vi kan evt hjelpe andre her med... Vi trenger evt hjelp med...',
        type: ItemType.Panel,
      },
      {
        time: '10:15 - 10:45',
        title: 'Pause',
        description: 'Kaffe og snacks',
        type: ItemType.Break,
      },
      {
        time: '10:45 - 11:30',
        title: 'Hvordan få med ledelsen på DevOps og kontinuerlige leveranser',
        speakers: [
          { name: 'Karl-Henning Rorstad', org: 'Politiets IKT-tjenester' },
          { name: 'Stian Kaasa', org: 'Politiets IKT-tjenester' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '11:30 - 12:00',
        title: 'Demo Organa',
        description: 'Presentasjon av PIT Organa plattformen',
        speakers: [{ name: 'PIT Organa plattformteam' }],
        type: ItemType.Talk,
      },
      {
        time: '12:00 - 13:00',
        title: 'Lunsj',
        type: ItemType.Break,
      },
      {
        time: '13:00 - 14:00',
        title: 'Open Space',
        speakers: [{ name: 'Jan Helge Salvesen' }],
        type: ItemType.Panel,
      },
      {
        time: '14:00 - 14:15',
        title: 'Pause',
        description: 'Kaffe og snacks',
        type: ItemType.Break,
      },
      {
        time: '14:15 - 15:15',
        title: 'Open Space (fortsettelse)',
        type: ItemType.Panel,
      },
      {
        time: '15:15 - 16:50',
        title: 'Google og Kubernetes',
        speakers: [
          { name: 'Craig Box', org: 'Google' },
          { name: 'Daniel Aasen Andersen', org: 'Google' },
        ],
        type: ItemType.Talk,
      },
      {
        time: '16:50 - 17:00',
        title: 'Oppsummering',
        speakers: [
          {
            name: 'Roger Karlsson',
            org: 'Politiets IKT-tjenester',
            url: 'https://offentlig-paas-no.slack.com/team/U51A07M0V',
          },
        ],
        type: ItemType.Info,
      },
    ],
    stats: {
      registrations: 60,
      participants: 60,
      organisations: 25,
    },
  },
  {
    slug: '2017-10-16-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til fagdag hos Nav i Oslo med fokus på GDPR og statusrunde fra alle organisasjoner.',
    description:
      'En dag med statusrunde fra alle deltagende organisasjoner, Open Space diskusjoner, foredrag om GDPR og Nav sitt NAIS. Over 50 deltakere fra 20 forskjellige etater og organisasjoner.',
    start: new Date('2017-10-16T09:00+02:00'),
    end: new Date('2017-10-16T16:00+02:00'),
    audience: Audience.PublicSector,
    location: 'Nav, Sannergata 2, Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Are Vattekar',
        org: 'Skatteetaten',
        url: 'https://offentlig-paas-no.slack.com/team/U4SM25LUQ',
      },
      {
        name: 'Audun Fauchald Strand',
        org: 'Nav',
        url: 'https://offentlig-paas-no.slack.com/team/U4U0AJ4HM',
      },
    ],
    socialEvent: {
      description:
        'Bli med på middag og nettverksbygging på Villa Paradiso Grünerløkka. En uformell anledning til å møte andre deltakere, dele erfaringer og bygge nettverk over autentisk napolitansk pizza. Bord er booket for klokka 17:00.',
      start: new Date('2017-10-16T17:00+02:00'),
      location: 'Villa Paradiso Grünerløkka, Olaf Ryes plass 8, 0552 Oslo',
    },
    stats: {
      registrations: 65,
      participants: 65,
      organisations: 20,
    },
    schedule: [
      {
        time: '09:00 - 09:10',
        title: 'Velkommen',
        speakers: [
          {
            name: 'Are Vattekar',
            org: 'Skatteetaten',
            url: 'https://offentlig-paas-no.slack.com/team/U4SM25LUQ',
          },
          {
            name: 'Audun Fauchald Strand',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U4U0AJ4HM',
          },
        ],
        type: ItemType.Info,
      },
      {
        time: '09:10 - 10:00',
        title: 'Statusrunde del 1',
        description:
          'Minst en fra hver organisasjon presenterer status for PaaS-arbeid.',
        type: ItemType.Panel,
      },
      {
        time: '10:00 - 10:30',
        title: 'Pause',
        description: 'Oppskåret frukt, nøtter, kaffe/te og vann',
        type: ItemType.Break,
      },
      {
        time: '10:30 - 11:30',
        title: 'Statusrunde del 2',
        description:
          'Fortsettelse av statusrunde og eventuell planlegging av Open Space.',
        type: ItemType.Panel,
      },
      {
        time: '11:30 - 12:30',
        title: 'Lunsj',
        description: 'Baguetter',
        type: ItemType.Break,
      },
      {
        time: '12:30 - 13:45',
        title: 'Open Space',
        description:
          'Åpne diskusjoner om erfaringsrapporter, datasikkerhet og sky, open sourcing, testmiljøer/testdata og andre aktuelle tema.',
        type: ItemType.Panel,
      },
      {
        time: '13:45 - 14:00',
        title: 'Pause',
        description: 'Kaffe/te, kake eller grønnsaker med dip',
        type: ItemType.Break,
      },
      {
        time: '14:00 - 15:00',
        title: 'GDPR',
        description:
          'Foredrag om GDPR fra et teknologisk perspektiv og hva det vil si for utviklere og plattformer.',
        speakers: [{ name: 'Johannes Brodwall', org: 'Steria' }],
        type: ItemType.Talk,
      },
      {
        time: '15:00 - 15:10',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '15:10 - 16:00',
        title: 'NAIS',
        description: 'Presentasjon av Nav sin applikasjonsinfrastruktur NAIS.',
        speakers: [
          {
            name: 'Johnny Horvi',
            org: 'Nav',
            url: 'https://offentlig-paas-no.slack.com/team/U4SR1TZC0',
          },
        ],
        type: ItemType.Talk,
      },
    ],
  },
  {
    slug: '2017-06-01-fagdag',
    title: 'Offentlig PaaS Fagdag',
    ingress:
      'Vi inviterer til fagdag hos Skatteetaten på Helsfyr i Oslo med fokus på PaaS-status og Open Space diskusjoner.',
    description:
      'En dag dedikert til å høre hvor ulike etater står i forhold til PaaS og veien videre. Etter lunsj blir det Open Space med mulighet for diskusjoner om applikasjonsarkitektur, infrastrukturarkitektur og sikkerhetsutfordringer ved bruk av PaaS.',
    start: new Date('2017-06-01T09:00+02:00'),
    end: new Date('2017-06-01T18:00+02:00'),
    audience: Audience.PublicSector,
    location: 'Skatteetaten, Helsfyr, Oslo',
    registration: {
      disabled: true,
      attendanceTypes: [AttendanceType.Physical],
    },
    organizers: [
      {
        name: 'Are Vattekar',
        org: 'Skatteetaten',
        url: 'https://offentlig-paas-no.slack.com/team/U4SM25LUQ',
      },
    ],
    socialEvent: {
      description:
        'Mulighet for å gå ut og spise middag sammen etter den faglige delen.',
      start: new Date('2017-06-01T18:00+02:00'),
      location: 'TBA',
    },
    //stats: {
    //  registrations: 70,
    //  participants: 60,
    //  organisations: 10,
    //},
    schedule: [
      {
        time: '08:30 - 09:00',
        title: 'Registrering og kaffe',
        type: ItemType.Registration,
      },
      {
        time: '09:00 - 12:00',
        title: 'Status fra etatene',
        description:
          'Alle etater presenterer hvor de står i forhold til PaaS og hva som er veien videre.',
        type: ItemType.Panel,
        attachments: [
          {
            url: 'https://docs.google.com/presentation/d/1Cjny0F72wugtS-w_ULz_gSLz5VtdL__bqzyIvlwK_p0/edit?slide=id.p#slide=id.p',
            type: AttachmentType.Slides,
          },
          {
            url: 'https://docs.google.com/presentation/d/1DjnF20_txiP9mtSqBkgyY-L1KijpVaY5JyOykm3SAyc/edit?slide=id.p3#slide=id.p3',
            type: AttachmentType.Slides,
          },
        ],
      },
      {
        time: '12:00 - 13:00',
        title: 'Lunsj',
        type: ItemType.Break,
      },
      {
        time: '13:00 - 16:00',
        title: 'Open Space',
        description:
          'Åpen diskusjon om applikasjonsarkitektur, infrastrukturarkitektur og sikkerhetsutfordringer ved bruk av PaaS.',
        type: ItemType.Talk,
      },
      {
        time: '16:00 - 18:00',
        title: 'Foredrag med ekstern foredragsholder',
        description: 'Mulig foredrag med ekstern deltaker.',
        speakers: [{ name: 'TBA' }],
        type: ItemType.Talk,
      },
    ],
  },
]
