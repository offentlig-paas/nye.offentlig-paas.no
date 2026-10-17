import {
  type ResearchProject,
  ResearchStatus,
  PaperStatus,
} from '@/lib/research/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { type ResearchEthics } from '@/lib/research/types'
import { aiAgents2026 } from '@/data/surveys/ai-agents-2026'
import { aiAgents2027 } from '@/data/surveys/ai-agents-2027'
import { stateOfPlatforms2027 } from '@/data/surveys/state-of-platforms-2027'

const sharedEthics = {
  dataController: 'Hans Kristian Flaatten (styreleder, Offentlig PaaS)',
  contactEmail: 'kontakt@offentlig-paas.no',
} satisfies Partial<ResearchEthics>

/**
 * Ethics for waves collected under the association as data controller.
 * Earlier waves keep the project ethics they were consented under.
 */
const associationEthics = {
  dataController: 'foreningen Offentlig PAAS, ved styreleder',
  contactEmail: 'kontakt@offentlig-paas.no',
  legalBasis: 'Samtykke etter GDPR art. 6 nr. 1 bokstav a',
  siktAssessment: 'Vurderes før datainnsamlingen starter.',
  consentStatus:
    'Deltakerne samtykker ved å krysse av før de starter i skjemaet. Samtykket gjelder bare denne runden.',
  processors:
    'Vercel (drift av nettstedet) og Sanity (lagring av svarene) er databehandlere, og svarene lagres i EU/EØS. Leverandørene kan være underlagt amerikansk lov. Eventuelle overføringer sikres etter GDPR kapittel V, gjennom EU–US Data Privacy Framework eller EUs standard personvernbestemmelser.',
  retentionPeriod: 'Senest to år etter siste bølge i studien',
  rights:
    'Du kan be om innsyn, retting, sletting og begrenset behandling, og om å få utlevert opplysningene i et maskinlesbart format. Du kan trekke samtykket når som helst. Offentlig PAAS har ikke personvernombud. Du kan klage til Datatilsynet.',
} satisfies Omit<ResearchEthics, 'anonymization'>

export const researchProjects: ResearchProject[] = [
  {
    slug: 'state-of-platforms',
    title: 'State of Platforms',
    description:
      'Vi følger utviklingen av interne utviklerplattformer i norsk offentlig sektor over tid: utbredelse, modenhet, motivasjon og teknologivalg.',
    longDescription:
      'Studien måler hvordan offentlige virksomheter bygger og bruker interne utviklerplattformer langs de fem dimensjonene i CNCFs modenhetsmodell: investering, bruk, grensesnitt, drift og måling. Fordi 60 % av virksomhetene fra 2024 også deltok i 2026, kan vi skille faktiske endringer i hver enkelt virksomhet fra endringer i utvalget. Andre runde i 2026 omfatter 48 plattformer i 45 virksomheter med til sammen rundt 240 000 ansatte. Vi planlegger en tredje runde med en ny del om KI på plattformen.',
    stats: [
      {
        value: '92 %',
        label: 'Har intern utviklerplattform',
        subtext: '44 av 48 plattformer, opp fra 86 % i 2024',
      },
      {
        value: '83 %',
        label: 'Bruker Kubernetes',
        subtext: '40 av 48 plattformer, opp fra 66 % i 2024',
      },
      {
        value: '+25 pp',
        label: 'Sikkerhet som motivasjon',
        subtext: '82 % i 2026 mot 57 % i 2024, p = 0,034',
      },
      {
        value: '49 %',
        label: 'Måler effekt ad hoc',
        subtext: '21 av 43 plattformer ligger på nivå 1',
      },
    ],
    sampleFlow: [
      {
        value: '73',
        label: 'Innsendte svar i 2026',
        detail: '38 % plattformutviklere, 17 % tech leads, 15 % ledere',
      },
      {
        value: '48',
        label: 'Plattforminitiativ',
        detail: 'Analyseenhet etter sammenslåing av duplikater',
      },
      {
        value: '45',
        label: 'Offentlige virksomheter',
        detail: '54 % svarprosent, rundt 240 000 ansatte',
      },
      {
        value: '27',
        label: 'Med i begge runder',
        detail: '60 % av virksomhetene fra 2024 deltok på nytt',
      },
    ],
    researchQuestions: [
      'Hvordan har utbredelsen og omfanget av interne utviklerplattformer endret seg fra 2024 til 2026?',
      'Hvorfor bygger offentlige virksomheter interne utviklerplattformer, og hvordan har motivasjonen endret seg over tid?',
      'Hvordan modnes plattformene målt etter de fem dimensjonene i CNCFs modenhetsmodell?',
      'Hvilke teknologier og verktøy velger plattformteamene, og samler sektoren seg om felles løsninger?',
    ],
    methodology:
      'Gjentatt spørreundersøkelse med faste panelvirksomheter i norsk offentlig sektor: 60 % statlige etater, 25 % statsforetak, 8 % kommuner og 4 % universiteter og høyskoler. Skjemaet har 35 spørsmål om plattform, Kubernetes og sky. Analyseenheten er plattforminitiativet. I 2026 kom det inn 73 svar fra 45 virksomheter, som vi slo sammen til 48 unike plattformer etter faste regler: svaret fra rollen tettest på plattformen gjelder ved enkeltvalg, og summen av valg gjelder ved flervalg. Vi tester endringer mellom rundene med Fishers eksakte test, og endringer innad i de 24 panelplattformene med McNemars eksakte test.',
    keyFindings: [
      '83 % av plattformene bruker Kubernetes i 2026, opp fra 66 % i 2024. Andelen plattformer som betjener over 100 team økte fra 10 % til 18 %.',
      '92 % av initiativene har en intern utviklerplattform i drift, og selvbetjening for databaser og meldingskøer økte fra 47 % til 86 %, p < 0,001.',
      'Plattformteamene samler seg om de samme verktøyene uten sentral styring: administrert Kubernetes som AKS på 40 %, OpenShift på 22 % og GKE på 20 %, kombinert med Terraform på 82 %, GitHub Actions på 52 % og ArgoCD på 50 %.',
      'Sikkerhet og etterlevelse økte med 25 prosentpoeng som motivasjon, fra 57 % til 82 %, Fisher p = 0,034. I panelet la ni virksomheter til sikkerhet mens bare én fjernet det, McNemar p = 0,021.',
      'Driftsmodenhet gikk fra nivå 2 til nivå 3 som vanligste nivå på CNCF-modellen, mens halvparten av enkeltvurderingene i panelet byttet nivå mellom 2024 og 2026.',
      '49 % av plattformene måler fortsatt effekt ad hoc på nivå 1, samtidig som kostnadskontroll har blitt viktigere og økte med 15 prosentpoeng til 52 %.',
    ],
    status: ResearchStatus.Ongoing,
    tags: ['state-of-platforms'],
    lead: 'Hans Kristian Flaatten',
    startDate: '2023-10-01',
    lastUpdated: '2026-03-19',
    waves: [
      {
        name: 'Wave 1',
        year: 2024,
        status: ResearchStatus.Published,
        organizations: 35,
        description:
          'Første runde samlet inn høsten 2023 blant 35 virksomheter med rundt 177 000 ansatte. 33 spørsmål.',
      },
      {
        name: 'Wave 2',
        year: 2026,
        status: ResearchStatus.Published,
        organizations: 45,
        invited: 84,
        description:
          'Andre runde samlet inn vinteren 2025 og 2026 blant 45 av 84 medlemsvirksomheter (54 % svarprosent) med 48 plattformer og rundt 240 000 ansatte. 27 av virksomhetene deltok i begge rundene.',
      },
      {
        name: 'Wave 3',
        year: 2027,
        status: ResearchStatus.Planning,
        description:
          'Tredje runde er under planlegging og er ikke åpen for svar ennå. Kjernespørsmålene er de samme som i 2024 og 2026. En ny del spør hvordan plattformteamene legger til rette for KI og KI-kodeagenter. Skjemaet testes før det åpnes.',
        ethics: {
          ...associationEthics,
          publication:
            'Vi publiserer bare samlede resultater. Svar fra enkeltorganisasjoner blir ikke gjort åpent tilgjengelige. Svaralternativer som færre enn tre har valgt, rapporteres som «under 3».',
          anonymization:
            'Navn på organisasjoner, plattformer og personer publiseres ikke. E-postadresser skilles fra svarene før analyse og slettes når eventuell kontakt er avsluttet.',
        },
      },
    ],
    papers: [
      {
        title:
          'The Evolution of Platform Engineering in the Public Sector: A Longitudinal Study of Adoption, Maturity, and Motivations (2024-2026)',
        url: '/papers/flaatten-platform-engineering-public-sector-2026.pdf',
        date: '2026-10-12',
        status: PaperStatus.Draft,
        label: 'Les artikkelen (PDF)',
        authors: [{ name: 'Hans Kristian Flaatten', affiliation: 'Nav' }],
        abstract:
          'Repeated cross-sectional survey of Norwegian public sector organizations: 35 in 2024 and 45 in 2026, with 60% overlap for panel analysis. Internal developer platform adoption reached 92% and Kubernetes reached 83% by 2026. Developer speed remains the top motivation at 91%, while security rose 25 percentage points to 82% (p = 0.034 uncorrected; McNemar p = 0.021 in the paired panel). On the CNCF Platform Maturity Model, the most common operations level shifted from Level 2 to Level 3, while 49% of platforms remain at Level 1 with ad hoc measurement.',
      },
      {
        title:
          'Platform Engineering in the Norwegian Public Sector: A Longitudinal Study of Adoption, Maturity, and Toolchain Convergence (2024-2026)',
        url: '/papers/flaatten-platform-engineering-public-sector-2026-abstract.pdf',
        date: '2026-03-01',
        venue: 'KubeCon + CloudNativeCon Europe 2026, Amsterdam',
        venueDate: 'April 2026',
        status: PaperStatus.Presented,
        authors: [{ name: 'Hans Kristian Flaatten', affiliation: 'Nav' }],
        abstract:
          'Longitudinal survey of internal developer platforms across 45 Norwegian public sector organizations with roughly 240,000 employees and 2.5 trillion NOK in combined budgets. Between 2024 and 2026, Kubernetes adoption rose from 66% to 83%, toolchains converged on Terraform, GitHub Actions, and ArgoCD, and security motivation rose 25 percentage points to 82%. Platform operations advanced to Level 3 on the CNCF model, while measurement stayed at Level 1 for 49% of platforms even as cost pressure grew.',
      },
    ],
    surveys: [
      {
        title: 'Plattformmodenhet Wave 1 (2024)',
        status: SurveyStatus.Closed,
        waveName: 'Wave 1',
      },
      {
        title: 'Plattformmodenhet Wave 2 (2026)',
        status: SurveyStatus.Closed,
        waveName: 'Wave 2',
      },
      {
        surveySlug: stateOfPlatforms2027.slug,
        waveName: 'Wave 3',
        description: 'Under planlegging. Ikke åpen for svar ennå.',
      },
    ],
    datasets: [
      {
        title: 'State of Platforms 2024',
        url: 'https://github.com/offentlig-paas/open-data/tree/main/state-of-platforms/2024',
        format: 'CSV',
        description:
          'Sammenslåtte tabeller og spørreskjema fra 35 virksomheter',
      },
      {
        title: 'State of Platforms 2026',
        url: 'https://github.com/offentlig-paas/open-data/tree/main/state-of-platforms/2026',
        format: 'CSV',
        description:
          'Sammenslåtte tabeller, spørreskjema og analyseskript fra 48 plattformer i 45 virksomheter',
      },
    ],
    ethics: {
      ...sharedEthics,
      legalBasis: 'Samtykke etter GDPR art. 6 nr. 1 bokstav a',
      siktAssessment:
        'Intern vurdering gjennomført. Undersøkelsen samler opplysninger om virksomheter, ikke enkeltpersoner. Frivillig kontaktadresse lagres adskilt og slettes etter oppfølging.',
      consentStatus:
        'Samtykketeksten i runde 1 og 2 gjaldt aggregerte tall. Vi publiserer derfor kun sammenslåtte tabeller der grupper med færre enn tre svar er sladdet. Ny samtykketekst etter NESH § 15 og GDPR art. 13 brukes fra runde 3.',
      anonymization:
        'Vi fjerner virksomhetsnavn og sladder grupper med færre enn tre svar for å hindre bakveisidentifisering.',
    },
  },
  {
    slug: 'state-of-ai-agents',
    title: 'State of AI Agents',
    description:
      'Vi undersøker hvordan norske offentlige virksomheter bruker og styrer KI-kodeverktøy, hvor utbredt uoffisiell bruk er, og hva som bekymrer utviklere og ledere.',
    longDescription:
      'Våren 2026 svarte 115 utviklere, arkitekter og ledere fra 57 offentlige virksomheter på hvilke KI-kodeverktøy de faktisk bruker, hvilke verktøy som er offisielt godkjent, og hvordan bruken styres. Undersøkelsen skiller mellom enkel autofullføring og agenter som selv endrer filer og kjører kommandoer, og måler hvor enige kolleger i samme virksomhet er om egne rammer. Vi planlegger en andre runde som også spør om kodeagenter, plattformstøtte og hvor mye agentene får gjøre på egen hånd.',
    stats: [
      {
        value: '92 %',
        label: 'Bruker KI-kodeverktøy',
        subtext: '106 av 115 svar, og 76 % av dem bruker agenter',
      },
      {
        value: '62 %',
        label: 'Bred skyggebruk',
        subtext: '30 % når vi holder nettprat og åpen kildekode utenfor',
      },
      {
        value: '8 %',
        label: 'Har fast opplæringsprogram',
        subtext: '83 % har retningslinjer, men få gir praktisk støtte',
      },
      {
        value: '71 %',
        label: 'Frykter tap av kompetanse',
        subtext: 'Langt foran sikkerhet på 34 % og personvern på 27 %',
      },
    ],
    sampleFlow: [
      {
        value: '115',
        label: 'Innsendte svar',
        detail: '49 % utviklere, 38 % teknisk ledelse, 13 % ledere',
      },
      {
        value: '106',
        label: 'Bruker KI-kodeverktøy',
        detail: '81 bruker kodeagenter, ingen bruker bare autofullføring',
      },
      {
        value: '57',
        label: 'Offentlige virksomheter',
        detail: 'Flertallsvalg per virksomhet på organisasjonsspørsmål',
      },
      {
        value: '27',
        label: 'Flere svar fra samme sted',
        detail: '2 til 7 svar per virksomhet viser intern enighet',
      },
    ],
    researchQuestions: [
      'Hvilke KI-kodeverktøy bruker utviklere i offentlig sektor, og hvor mange bruker verktøy som ikke er offisielt godkjent?',
      'Hvordan styrer virksomhetene bruken av KI-kodeverktøy, og henger tydelig styring sammen med moden bruk?',
      'Hva bekymrer utviklere, tekniske ledere og virksomhetsledere mest ved bruk av KI-kodeverktøy?',
    ],
    methodology:
      'Anonym spørreundersøkelse gjennomført i april og mai 2026 med 27 spørsmål. På spørsmål om virksomhetens praksis oppga deltakerne også hvor sikre de var på svaret sitt: sikker, ganske sikker eller anslag. Vi analyserer egen bruk og bekymringer på individnivå med 115 svar, og virksomhetspraksis både på individnivå og aggregert på tvers av 57 virksomheter. Sammenhengen mellom styring og bruk måles med Spearmans rangkorrelasjon, rho = 0,439, p < 0,001. I de 27 virksomhetene med flere deltakere sammenligner vi enigheten mellom kolleger med 10 000 tilfeldige trekninger.',
    keyFindings: [
      '115 deltakere fra 57 offentlige virksomheter svarte. Fordi deltakerne er rekruttert gjennom fagnettverket Offentlig PaaS, viser tallene sannsynligvis en høyere bruk enn snittet i offentlig sektor.',
      '92 %, eller 106 av 115, bruker KI-kodeverktøy selv. 76 % av brukerne bruker kodeagenter i terminal eller editor, og ingen bruker kun enkel autofullføring.',
      'GitHub Copilot er oftest godkjent med 82 % (94 av 115). Claude Code brukes av 48 deltakere (42 % av alle, 45 % av verktøybrukerne), mens 40 (35 %) oppgir at det er godkjent. 62 % bruker minst ett verktøy som ikke er godkjent, og 30 % gjør det når nettbaserte språkmodeller og åpen kildekode holdes utenfor.',
      '83 % har retningslinjer for KI-verktøy, men bare 8 % har et fast opplæringsprogram, 11 % måler effekt, og 62 % har ingen egne krav til kodegjennomgang av KI-kode.',
      'Tap av egen fagkompetanse på 71 % og dårligere kodekvalitet på 57 % topper listen over bekymringer, klart foran hallusinasjoner på 40 %, sikkerhet på 34 % og personvern på 27 %.',
      'Kolleger i samme virksomhet svarer langt mer likt enn ved tilfeldig variasjon om retningslinjer og leverandøravklaring, p = 0,001, men svarer sprikende om virksomheten måler effekt.',
    ],
    status: ResearchStatus.Writing,
    tags: ['state-of-ai-agents'],
    lead: 'Hans Kristian Flaatten',
    team: ['Hans Kristian Flaatten', 'Anders Olsen Sandvik'],
    startDate: '2026-01-01',
    lastUpdated: '2026-10-12',
    waves: [
      {
        name: 'Wave 1',
        year: 2026,
        status: ResearchStatus.Writing,
        organizations: 57,
        description:
          'Første runde samlet inn i april og mai 2026: 115 svar fra 57 virksomheter.',
      },
      {
        name: 'Wave 2',
        year: 2027,
        status: ResearchStatus.Planning,
        description:
          'Andre runde er under planlegging og er ikke åpen for svar ennå. Den følger opp spørsmålene fra første runde og spør i tillegg om kodeagenter, plattformstøtte og hvor mye agentene får gjøre på egen hånd. Skjemaet testes før det åpnes.',
        ethics: {
          ...associationEthics,
          publication:
            'Vi publiserer sammenstilte resultater og kan publisere et anonymisert datasett med ett svar per rad. Virksomhetskode er bare med for virksomheter med minst fem svar; de andre får felleskoden «Org-annen». Rollen oppgis som «annen» der færre enn fem fra samme virksomhet har den. Størrelsen på utviklingsmiljøet oppgis bare i grove grupper. Grupper med færre enn fem svar rapporteres ikke.',
          anonymization:
            'Virksomhetsnavn erstattes med koder før analyse, og koblingstabellen lagres adskilt fra svarene. E-postadresser lagres adskilt fra svarene. Fritekst gjennomgås og renses før publisering.',
        },
      },
    ],
    papers: [
      {
        title:
          'AI Coding Agents in the Norwegian Public Sector: Adoption, Governance, and Practitioner Concerns',
        url: '/papers/flaatten-ai-coding-agents-public-sector-2026-preliminary.pdf',
        date: '2026-10-12',
        status: PaperStatus.Draft,
        label: 'Les rapporten (PDF)',
        authors: [
          { name: 'Hans Kristian Flaatten', affiliation: 'Nav' },
          { name: 'Anders Olsen Sandvik', affiliation: 'SPK' },
        ],
        abstract:
          'Survey of 115 practitioners and managers across 57 Norwegian public sector organizations in Q2 2026. Personal use of AI coding tools reached 92%, and 76% of users run coding agents rather than autocomplete alone. GitHub Copilot leads official approval at 82%, while Claude Code has 42% personal use against 35% official approval. While 83% report having guidelines, only 8% have a structured training program and 11% track own impact metrics. Skill loss is the top concern at 71%, well ahead of security at 34% and privacy at 27%.',
      },
    ],
    surveys: [
      {
        surveySlug: aiAgents2026.slug,
        waveName: 'Wave 1',
      },
      {
        surveySlug: aiAgents2027.slug,
        waveName: 'Wave 2',
        description: 'Under planlegging. Ikke åpen for svar ennå.',
      },
    ],
    datasets: [
      {
        title: 'State of AI Agents 2026',
        url: 'https://github.com/offentlig-paas/open-data/tree/main/state-of-ai-agents/2026',
        format: 'CSV',
        description:
          '115 anonymiserte svar med kodebok, tabeller og analyseskript',
      },
    ],
    ethics: {
      ...sharedEthics,
      legalBasis: 'Samtykke etter GDPR art. 6 nr. 1 bokstav a',
      siktAssessment:
        'Intern vurdering gjennomført. Undersøkelsen er anonym og kartlegger praksis i virksomheter, ikke personopplysninger.',
      consentStatus: 'Deltakerne samtykker før start i skjemaet.',
      anonymization:
        'Vi fjerner virksomhetsnavn fra det åpne datasettet. Frivillig e-postadresse for oppfølgingsintervju lagres i en egen tabell adskilt fra svarene og slettes etter intervjuene.',
      retentionPeriod: 'To år etter at studien er avsluttet',
    },
  },
]
