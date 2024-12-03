import { Audience, Event, ItemType } from "@/lib/events/types";

export const events: Event[] = [
  {
    slug: "2024-12-12-offentlig-paas-digital",
    title: "Offentlig PaaS heldigital fagdag",
    ingress: "Årets siste fagdag arrangeres digitalt. Velkommen!",
    description: "Velkommenn til årets siste fagdag med en rekke spennende foredrag! Dagen starter med en introduksjon til CloudNativePG, etterfulgt av erfaringer fra Vy om å støtte utviklere med et lite plattformteam. Etter en kort pause vil Norsk Tipping dele sine erfaringer med OpenTelemetry.",
    start: new Date('2024-12-12T10:00+01:00'),
    end: new Date('2024-12-12T14:00+01:00'),
    audience: Audience.PublicSector,
    location: "Zoom",
    registrationUrl: 'https://forms.gle/xdGHJ3L1o7hbqWs77',
    organizers: [
      {
        name: 'Hans Kristian Flaatten',
        org: 'NAV',
        url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY'
      }
    ],
    schedule: [
      {
        time: "12:00 - 12:45",
        title: "CloudNativePG - PostgreSQL on Kubernetes",
        description: "CloudNativePG is a PostgreSQL Operator for Kubernetes. It is designed to be a simple, reliable, and easy-to-use way to run highly available PostgreSQL clusters on Kubernetes. We will hear from the creator of CloudNativePG, Gabriele Bartolini, about the project and technical details.",
        speaker: "Gabriele Bartolini (EnterpriseDB)",
        type: ItemType.Talk,
      },
      {
        time: "12:45 - 13:00",
        title: "Erfaringer fra å støtte 100 utviklere med et platformteam på 2",
        description: "Vy har et team av over 100 utviklere, men bare to personer i plattformteamet. Hvordan får vi dette til å fungere? I dette foredraget deler vi våre erfaringer med å drive et lite plattformteam i en større utviklingsorganisasjon. Vi ser på hvordan skytjenester lar oss opprettholde høy hastighet og effektivitet, hvilke områder vi velger å bygge egne løsninger på, og hvordan vi skaper verdi ved å møte utviklerne der de er – gjennom en produktfokusert tilnærming. Bli med og få innblikk i våre suksesser, fallgruver og annen læring vi har fått fra reisen så langt.",
        speaker: "Nicolas Harlem Eide (Vy / Capra Consulting)",
        type: ItemType.Talk,
      },
      {
        time: "13:00 - 13:15",
        title: "Pause",
        type: ItemType.Break,
      },
      {
        time: "13:15 - 13:45",
        title: "OpenTelemetry hos Norsk Tipping på vei til sky",
        description: "Tittel må sies å være en arbeidstittel... Norsk Tipping deler litt erfaringer de har sett med innføring av OpenTelemetry for å få innsikt ende-til-ende på tvers av sky (aws) og on-prem (wlp,k8s). Utfordringer, fordeler og veien videre. (Med håp om å finne noen som har vært i samme situasjon eller er på vei)",
        speaker: "Tom Andre Ska (Norsk Tipping)",
        type: ItemType.Talk,
      },
    ]
  },
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
        description: 'OpenTelemetry is a set of APIs, libraries, agents, and instrumentation to provide observability in your applications. In this this talk, we will introduce OpenTelemetry and how it can be used to instrument your applications to collect traces, metrics, and logs. We will also show how to use OpenTelemetry with Grafana to visualize the collected data.',
        speaker: 'Grafana Labs & Sopra Steria',
        type: ItemType.Talk,
      },
      {
        time: '10:20 - 11:00',
        title: 'Observability i Skatteetaten',
        description: 'Skatteetaten presenterer hvordan de jobber med robusthet og innsikt i sine systemer og applikasjoner.',
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
        title: 'Observability 2.0 i NAV',
        description: 'I år startet NAV med å rulle ut støtte for OpenTelemetry for applikasjoner i NAIS med OpenTelemetry Operator, Grafana Tempo og Grafana Loki. I dette foredraget vil vi dele erfaringer og resultater fra dette arbeidet så langt, og kaste litt lys over hva som er planen videre.',
        speaker: 'Hans Kristian Flaatten (NAV)',
        type: ItemType.Talk,
      },
      {
        time: '12:40 - 13:05',
        title: 'Med kart og kompass på leting etter oversikt',
        description: 'Kartverket presenterer sin erfaring med observability.Kartverkets reise mot helhetlig observability og de erfaringer som er gjort på veien.',
        speaker: 'Thomas Berg (Kartverket)',
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
        title: 'Argus - Digital signage',
        description: 'Argus er en egenutviklet løsning for å vise frem observabilitydata i landskapet til Skatteetaten. Vi vil vise hvordan vi har bygget Argus, og hvordan vi bruker det i hverdagen.',
        speaker: 'Robert Myhren (Skatteetaten)',
        type: ItemType.Talk,
      },
    ]
  },
  {
    slug: '2024-05-24-dataplattform-fagdag',
    title: 'Offentlig PaaS Fagdag om dataplattform',
    ingress: `Vi inviterer til en dag fylt med spennende foredrag og erfaringsdeling om dataplattform i offentlig sektor.`,
    start: new Date('2024-05-24T09:00+02:00'),
    end: new Date('2024-05-24T15:00+02:00'),
    audience: Audience.PublicSector,
    location: 'UKE, Grensesvingen 6, 0661 Oslo',
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
      }
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
        description: 'Hvordan UKE skrur sammen teknologi og styresett for fellesdata i kommunen basert på Microsoft Fabric. Vi deler våre erfaringer og tanker for implementering av felles dataplattform for Oslo Kommune.',
        speaker: 'Erik Tuv & Andre Gulbrandsen (UKE)',
        type: ItemType.Talk,
      },
      {
        time: '09:10 - 09:40',
        title: 'Dataplattformer for fart og flyt i politiet',
        description: 'Politiets IT Enhet organiserer seg rundt autonome produktteam for å skape mest mulig verdi for politiet og samfunnet. Med shift-left tankesett må autonome produktteam ta eit langt større ansvar for sine produkter enn før. Korleis kan dette skalere uten å lage enormt store team? Bli med og hør korleis PIT bygger dataplattformer for å skape fart og flyt!',
        speaker: 'Audun Vindenes Egge & Erlend Wiig (PIT)',
        type: ItemType.Talk,
      },
      {
        time: '09:40 - 09:50',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '09:50 - 10:20',
        title: 'Datadeling med nasjonale felleskomponenter fra DigDir',
        description: 'Samferdselsdata (Tverrsektorielt datasamarbeid for samferdsel) forteller om vårt samarbeid med DigDir og samferdselsvirksomhetene om å benytte DigDir sine nasjonale fellestjenester som data.norge.no, maskinporten, altinn og ansattporten for å muliggjøre datadeling på nasjonalt plan.',
        speaker: 'Tine Kleivane (Samferdselsdata)',
        type: ItemType.Talk,
      },
      {
        time: '10:20 - 10:50',
        title: 'Et hav av data – Kystverket',
        description: 'Kystverket startet i 2023 arbeidet med en skybasert dataplattform. Vi har mye forskjellig data - store datasett som skipstrafikk og mindre datasett som hvor fisk kan landes. Uten særlig teknisk gjeld i skyen stilte vi relativt fritt. Underveis har vi tatt veivalg, angret veivalg, testet teknologier og fått våre forventninger utfordret. Alt vi gjør skal bidra til å utføre vårt samfunnsoppdrag om å gjøre kysten til verdens sikreste og reneste.',
        speaker: 'Stefan Ekehaug (Kystverket)',
        type: ItemType.Talk,
      },
      {
        time: '10:50 - 11:00',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '11:00 - 11:30',
        title: 'En Open Source datastack basert på Onyxia',
        description: 'SSB presenterer arbeidet sitt med å implementere tjenesteplattform Onyxia i sin skybaserte dataplattform, Dapla. Onyxia er utviklet av det franske statistikkbyrået (INSEE) og bygger på åpne standarder som kubernetes, helm og oidc. Den gjør det lett å tilby open source verktøy pakket som containere, slik som Jupyter, RStudio, VS Code, MLFlow osv. på en enkel og brukervennlig måte.',
        speaker: 'Øyvind Bruer-Skarsbø (SSB)',
        type: ItemType.Talk,
      },
      {
        time: '11:30 - 12:15',
        title: 'Lunsj',
        description: 'Lunsj fra Tortas el Tommy',
        type: ItemType.Break,
      },
      {
        time: '12:15 - 12:45',
        title: 'Skatteetatens Data- og Analyseplattform - 1 år inn i produksjon',
        description: 'Siden fjorårets «skattesesong» har Skatteetaten vært i produksjon med sin data- og analyseplattform basert på Databricks i Azure. (Ja, vi vet, en «navnekonkurranse» er long overdue.) Vi mistenker at det vi lager og gjør, hver eneste dag, er noe mange andre foreløpig har som visjon. Så vi deler gjerne av våre erfaringer. I løpet av noen heseblesende minutter vil vi på Offentlig PaaS’ fagdag prøve å formidle: - Hvorfor vi bygger en plattform - Hvordan den er utviklet og videreutvikles - i smått og i stort - Hvordan vi organiserer arbeidet - i smått og i stort - Hva den brukes til akkurat nå',
        speaker: 'Tron Magnus Svagård & Johanna Anker Kulmus (Skatt)',
        type: ItemType.Talk,
      },
      {
        time: '12:45 - 13:15',
        title: 'Foredrag: Data as Code – hvorfor snakker alle om dbt og hva er det?',
        description: 'Data build tool er et meget populært verktøy i datalandskapet, og det har sett en utrolig vekst de siste årene. Det har nesten blitt standard å bruke dbt på plattformer som BigQuery, Snowflake og Databricks. Hva er det egentlig som gjør dette så fett? Hvordan passer dbt inn i en dataplattform og hvordan lar det deg jobbe?',
        speaker: 'Anders Elton (Telenor)',
        type: ItemType.Talk,
      },
      {
        time: '13:15 - 13:25',
        title: 'Pause',
        type: ItemType.Break,
      },
      {
        time: '13:25 - 13:55',
        title: 'Datakontrakter',
        description: 'Entur implementerer Data kontrakter på GCP. Her forteller de om implikasjonene dette har for reaktiv-arkitektur, der kontrakten blir et kontrollplangrensesnitt for dataplattform-arkitekturen.',
        speaker: 'Anders Dahlen (Entur)',
        type: ItemType.Talk,
      },
      {
        time: '13:55 - 14:25',
        title: 'MLOps hos Posten',
        description: 'Posten Bring har i flere år utviklet maskinlæringsløsninger for produksjon og merket at forvaltning av disse løsningene begynte å stjele all kapasiteten til vår data science avdeling. Vi har derfor i over ett år nå jobbet med å bygge en MLOps plattform for å effektivisere utviklingen og forvaltningen av maskinlærings- og dataprodukter. I dette foredraget skal vi gi et innblikk i våre motivasjoner og erfaringer så langt, samt ta et dypdykk ned i vår tekniske arkitektur.',
        speaker: 'Ella Johnsen & Simen Larsen (Posten Bring AS)',
        type: ItemType.Talk,
      },
      {
        time: '14:25 - 14:30',
        title: 'Avslutning',
        type: ItemType.Info,
      }
    ]
  }
];
