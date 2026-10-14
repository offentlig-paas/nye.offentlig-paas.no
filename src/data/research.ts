import {
  type ResearchProject,
  ResearchStatus,
  PaperStatus,
} from '@/lib/research/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { type ResearchEthics } from '@/lib/research/types'
import { aiAgents2026 } from '@/data/surveys/ai-agents-2026'

const sharedEthics = {
  dataController: 'Hans Kristian Flaatten (styreleder, Offentlig PaaS)',
  contactEmail: 'kontakt@offentlig-paas.no',
} satisfies Partial<ResearchEthics>

export const researchProjects: ResearchProject[] = [
  {
    slug: 'state-of-platforms',
    title: 'State of Platforms',
    description:
      'Longitudinell studie som kartlegger utbredelse, modenhet etter CNCF-modellen, strategisk motivasjon og teknologivalg for interne utviklerplattformer i offentlig sektor.',
    longDescription:
      'Vi måler utviklingen av interne utviklerplattformer i norsk offentlig sektor på tvers av fem dimensjoner i CNCFs modenhetsmodell: investering, adopsjon, grensesnitt, drift og måling. Ved å følge de samme virksomhetene over flere bølger kan vi skille reelle endringer fra utvalgseffekter. Bølge 2 (2026) dekker 45 virksomheter (48 plattformer) som til sammen representerer rundt 240 000 ansatte og budsjetter på 2,5 billioner kroner.',
    stats: [
      {
        value: '92 %',
        label: 'Har intern utviklerplattform',
        subtext: '44 av 48 plattformer (opp fra 86 % i 2024)',
      },
      {
        value: '83 %',
        label: 'Bruker Kubernetes',
        subtext: 'Opp fra 66 % i 2024 (+17 pp, p = 0,074)',
      },
      {
        value: '+25 pp',
        label: 'Sikkerhet som motivasjon',
        subtext: '82 % i 2026 (Fisher p = 0,034, panel p = 0,021)',
      },
      {
        value: '49 %',
        label: 'På nivå 1 for måling',
        subtext: 'Ad hoc effektmåling (21 av 43 plattformer)',
      },
    ],
    sampleFlow: [
      {
        value: '73',
        label: 'Innsendte svar (2026)',
        detail: '38 % plattformutviklere, 17 % tech leads, 15 % ledere',
      },
      {
        value: '48',
        label: 'Plattforminitiativ',
        detail: 'Analyseenhet etter normalisering av duplikater',
      },
      {
        value: '45',
        label: 'Unike virksomheter',
        detail: '54 % svarprosent (~240 000 ansatte)',
      },
      {
        value: '27',
        label: 'I longitudinelt panel',
        detail: '60 % deltok også i 2024-bølgen (n = 35)',
      },
    ],
    researchQuestions: [
      'Hvordan har adopsjonen og organisatorisk omfang av interne utviklerplattformer utviklet seg over toårsperioden?',
      'Hva er de viktigste organisatoriske driverne for å bygge interne utviklerplattformer, og hvordan har disse endret seg over tid?',
      'Hvordan utvikler plattformmodenhet seg i praksis, spesielt målt etter den flerdimensjonale CNCF-modenhetsmodellen?',
      'Hvilke teknologivalg og verktøykjeder dominerer moderne plattformstakker, og hvordan konsoliderer de seg?',
    ],
    methodology:
      'Gjentatt tverrsnittsundersøkelse med longitudinelt panelutvalg blant offentlige virksomheter i Norge (statlige etater 60 %, statsforetak 25 %, kommuner 8 %, akademia 4 %). Spørreskjema med 35 spørsmål fordelt på plattform, Kubernetes og sky. Analyseenheten er plattforminitiativet: 73 innsendte svar fra 45 virksomheter i 2026 ble normalisert til 48 plattformer etter forhåndsdefinerte regler ( teknisk nærhet ved enkeltvalg, union ved flervalg). Endringer på tvers av bølger testes med Fishers eksakte test, og parede endringer i panelet (n = 24 med plattform i begge bølger) med McNemars eksakte test.',
    keyFindings: [
      'Kubernetes-adopsjon økte fra 66 % (23/35) til 83 % (40/48) mellom 2024 og 2026, mens andelen plattformer som betjener over 100 team økte fra 10 % til 18 %',
      '92 % (44/48) av plattforminitiativene har nå en intern utviklerplattform, og selvbetjening for databaser og meldingskøer økte fra 47 % til 86 % (p < 0,001)',
      'Teknologistakken konvergerte rundt administrert Kubernetes (AKS 40 %, OpenShift 22 %, GKE 20 %), Terraform (82 %), GitHub Actions (52 %) og ArgoCD (50 %, +24 pp) uten sentral koordinering',
      'Sikkerhet som motivasjon økte 25 prosentpoeng fra 57 % til 82 % (Fisher p = 0,034 ukorrigert; McNemar p = 0,021 i paret panel der 9 la til sikkerhet og 1 fjernet det)',
      'Driftsmodenhet skiftet typetall fra nivå 2 til nivå 3 (skalerbar, 47 %) på CNCF-modellen, mens 52 % av enkeltvurderingene i panelet skiftet nivå mellom bølgene',
      '49 % (21/43) ligger fortsatt på nivå 1 (ad hoc) for måling, som skaper et styringsgap når kostoptimalisering (+15 pp til 52 %) blir viktigere',
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
        invited: 65,
        description:
          'Nullpunktsmåling samlet inn i Q4 2023 blant 35 virksomheter (~177 000 ansatte) med 33 spørsmål.',
      },
      {
        name: 'Wave 2',
        year: 2026,
        status: ResearchStatus.Published,
        organizations: 45,
        invited: 80,
        description:
          'Oppfølging i Q4 2025 til Q1 2026 blant 45 virksomheter (48 plattformer, ~240 000 ansatte). 27 virksomheter (60 %) deltok i begge bølgene.',
      },
    ],
    papers: [
      {
        title:
          'The Evolution of Platform Engineering in the Public Sector: A Longitudinal Study of Adoption, Maturity, and Motivations (2024–2026)',
        url: '/papers/flaatten-platform-engineering-public-sector-2026.pdf',
        date: '2026-10-12',
        status: PaperStatus.Draft,
        label: 'Les hele artikkelen (PDF)',
        authors: [{ name: 'Hans Kristian Flaatten', affiliation: 'Nav' }],
        abstract:
          'Repeated cross-sectional survey of Norwegian public sector organizations: 35 in 2024 and 45 in 2026, with 60% overlap enabling panel analysis. IDP adoption reached 92% and Kubernetes 83% by 2026. Developer agility remains the primary motivation (91%), while security rose 25 percentage points to 82%, the only change significant at α=0.05. On the CNCF Platform Maturity Model, modal operational maturity shifted from Level 2 to Level 3, while measurement maturity remains at Level 1, with 49% of platform entries reporting ad hoc practices.',
      },
      {
        title:
          'Platform Engineering in the Norwegian Public Sector: A Longitudinal Study of Adoption, Maturity, and Toolchain Convergence (2024–2026)',
        url: '/papers/flaatten-platform-engineering-public-sector-2026-abstract.pdf',
        date: '2026-03-01',
        venue: 'KubeCon + CloudNativeCon Europe 2026, Amsterdam',
        venueDate: 'April 2026',
        status: PaperStatus.Presented,
        authors: [{ name: 'Hans Kristian Flaatten', affiliation: 'Nav' }],
        abstract:
          'We present a longitudinal survey of Internal Developer Platform adoption across 45 Norwegian public sector organizations representing approximately 240,000 employees and 2.5 trillion NOK in organizational budgets. Between 2024 and 2026, Kubernetes adoption rose from 66% to 83%, the toolchain converged around a common stack, and security motivation surged 25 percentage points to 82%. Platform operations maturity advanced to Level 3 on the CNCF model, while measurement remained at Level 1 for 49% of organizations — creating a widening gap as cost optimization pressure grows.',
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
    ],
    datasets: [
      {
        title: 'State of Platforms 2024 (aggregerte tabeller)',
        url: 'https://github.com/offentlig-paas/open-data/tree/main/state-of-platforms/2024',
        format: 'CSV',
        description: 'Aggregerte tabeller og spørreskjema fra 35 virksomheter',
      },
      {
        title: 'State of Platforms 2026 (aggregerte tabeller)',
        url: 'https://github.com/offentlig-paas/open-data/tree/main/state-of-platforms/2026',
        format: 'CSV',
        description:
          'Aggregerte tabeller, spørreskjema og analyseskript fra 45 virksomheter (48 plattformer)',
      },
    ],
    ethics: {
      ...sharedEthics,
      legalBasis: 'Samtykke (GDPR art. 6 nr. 1 bokstav a)',
      siktAssessment:
        'Gjennomført (intern). Samler fakta om organisasjoner, ikke enkeltpersoner. Frivillig kontaktinfo (~20 %) er lagret adskilt og slettes etter oppfølging.',
      consentStatus:
        'Samtykketekst i bølge 1 og 2 informerte kun om aggregerte resultater. Kun aggregerte frekvenstabeller publiseres (celler < 3 er maskert). Ny samtykketekst etter NESH §15 og GDPR art. 13 er klar for bølge 3.',
      anonymization:
        'Organisasjonsnavn fjernes og små celler (< 3) maskeres for å hindre bakveisidentifisering.',
    },
  },
  {
    slug: 'state-of-ai-agents',
    title: 'State of AI Agents',
    description:
      'Tverrsnittsstudie av hvordan norske offentlige virksomheter tar i bruk og styrer KI-kodeagenter, med måling av skyggebruk, styringsmodenhet og bekymringer på tvers av roller.',
    longDescription:
      'KI-kodeverktøy har på få måneder gått fra autofullføring i editoren til autonome agenter som planlegger, endrer filer og kjører tester på egen hånd. Denne studien kartlegger faktisk verktøybruk, formell godkjenning, styringsmekanismer og bekymringer blant 115 utviklere og tekniske ledere fra 57 offentlige virksomheter i Norge (Q2 2026).',
    stats: [
      {
        value: '92 %',
        label: 'Bruker KI-kodeverktøy',
        subtext: '106 av 115 (95 % KI: 86–96 %), 76 % bruker agenter',
      },
      {
        value: '62 %',
        label: 'Bred skyggebruk',
        subtext:
          '30 % smal definisjon (ekskl. nettleser-LLM og åpen kildekode)',
      },
      {
        value: '8 %',
        label: 'Har strukturert støtteprogram',
        subtext: 'Til tross for at 83 % har retningslinjer (styringsgap)',
      },
      {
        value: '71 %',
        label: 'Frykter kompetansetap',
        subtext:
          'Rangert i topp 3 langt foran sikkerhet (34 %) og personvern (27 %)',
      },
    ],
    sampleFlow: [
      {
        value: '115',
        label: 'Respondenter (N = 115)',
        detail:
          '49 % praktikere, 38 % teknisk ledelse, 13 % virksomhetsledelse',
      },
      {
        value: '106',
        label: 'Aktive verktøybrukere',
        detail: '81 bruker lokale/skybaserte agenter, 0 kun autofullføring',
      },
      {
        value: '57',
        label: 'Identifiserte virksomheter',
        detail: 'Organisasjonsnivå aggregert med flertallsvotering og union',
      },
      {
        value: '27',
        label: 'Med flere svar (2–7 svar)',
        detail: 'Brukt til permutasjonstest (10 000 trekk) av intern enighet',
      },
    ],
    researchQuestions: [
      'Hvordan tar norske offentlige virksomheter i bruk KI-kodeverktøy, og hvor omfattende er uoffisiell skyggebruk?',
      'Hvilke styringsstrukturer har virksomhetene etablert for KI-kodeverktøy, og hvordan henger disse sammen med adopsjonsmodenhet?',
      'Hvilke bekymringer og barrierer opplever utøvere, og varierer disse mellom utviklere og ledere?',
    ],
    methodology:
      'Anonym tverrsnittsundersøkelse (Q2 2026, april og mai) med 27 spørsmål og tre usikkerhetsindikatorer (sikker, ganske sikker, anslag) på sentrale organisasjonsspørsmål. Individnivå (N = 115) brukes for egen bruk og bekymringer, mens organisasjonsnivå (N = 57) bruker flertallsvotering for enkeltvalg og union for flervalg. Sammenheng mellom styring og adopsjon er testet med Spearmans rangkorrelasjon (ρ = 0,439, permutasjons-p < 0,001). Intern enighet i virksomheter med flere svar (n = 27) er testet mot en permutasjons-nullfordeling med 10 000 trekk.',
    keyFindings: [
      '115 svar fra 57 offentlige virksomheter. Utvalget er selvselektert fra et teknisk engasjert fagmiljø, så adopsjonstallene representerer et øvre anslag for sektoren',
      '92 % (106/115, 95 % KI: 86–96 %) bruker KI-kodeverktøy personlig, og 76 % av brukerne (81/106) bruker autonome agenter. Ingen bruker bare autofullføring',
      'GitHub Copilot dominerer anskaffelsene (82 % godkjent), mens Claude Code har tydelig skyggebruk (42 % personlig brukt mot 35 % godkjent). 62 % (60/96) bruker minst ett ikke-godkjent verktøy, og 30 % (29/96) når nettleser-LLM og åpen kildekode holdes utenfor',
      'Styringen henger etter adopsjonen: 83 % har retningslinjer, men bare 8 % har et strukturert støtteprogram, 11 % har egne effektmål, og 62 % har ingen særskilt kodegjennomgang for KI-generert kode',
      'Kompetansetap (71 %, 95 % KI: 62–79 %) og kodekvalitet (57 %) er de klart vanligste bekymringene i topp tre, foran hallusinasjoner (40 %), sikkerhet (34 %) og personvern (27 %)',
      'Mot en permutasjons-nullfordeling (10 000 trekk) er kolleger i samme virksomhet signifikant mer enige enn tilfeldig om retningslinjer (p = 0,001) og leverandøravklaring (p = 0,001), og kun marginalt mer uenige om effektmåling (96 % mot 83 % forventet, P ≈ 0,033)',
    ],
    status: ResearchStatus.Writing,
    tags: ['state-of-ai-agents'],
    lead: 'Hans Kristian Flaatten',
    team: ['Hans Kristian Flaatten', 'Anders Olsen Sandvik'],
    startDate: '2026-01-01',
    lastUpdated: '2026-10-12',
    papers: [
      {
        title:
          'AI Coding Agents in the Norwegian Public Sector: Adoption, Governance, and Practitioner Concerns',
        url: '/papers/flaatten-ai-coding-agents-public-sector-2026-preliminary.pdf',
        date: '2026-10-12',
        status: PaperStatus.Draft,
        label: 'Les den foreløpige rapporten (PDF)',
        authors: [
          { name: 'Hans Kristian Flaatten', affiliation: 'Nav' },
          { name: 'Anders Olsen Sandvik', affiliation: 'SPK' },
        ],
        abstract:
          'Cross-sectional survey of 115 respondents from 57 Norwegian public sector organizations (Q2 2026). We find broad personal adoption of AI coding tools (92%), with 76% of users employing agentic capabilities. GitHub Copilot dominates procurement, while Claude Code shows substantial shadow adoption. Governance lags: 83% have some policy, but only 8% report a structured support program and 11% have own effect metrics. Skill loss is the most frequently selected concern (71%), well ahead of security (34%) and privacy (27%).',
      },
    ],
    surveys: [
      {
        surveySlug: aiAgents2026.slug,
      },
    ],
    datasets: [
      {
        title: 'State of AI Agents 2026 (anonymisert datasett)',
        url: 'https://github.com/offentlig-paas/open-data/tree/main/state-of-ai-agents/2026',
        format: 'CSV',
        description:
          'Anonymiserte svar (115) med kodebok, aggregerte tabeller og analyseskript',
      },
    ],
    ethics: {
      ...sharedEthics,
      legalBasis: 'Samtykke (GDPR art. 6 nr. 1 bokstav a)',
      siktAssessment:
        'Gjennomført (intern) — sannsynligvis ikke meldepliktig for anonym versjon. Organisasjonsdata, ikke persondata. E-post for intervju samles i separat seksjon.',
      consentStatus: 'Dekkende samtykketekst dokumentert i instrumentet.',
      anonymization:
        'Organisasjonsnavn fjernes. E-post for intervju separeres fra surveysvar og slettes etter intervjuene.',
      retentionPeriod: 'To år etter studiens avslutning',
    },
  },
]
