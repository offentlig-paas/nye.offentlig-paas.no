import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@sanity/client'
import {
  upsertMemberProfileSchema,
  type UpsertMemberProfileInput,
  type ProfileVisibility,
} from '@/domains/member-profile/types'
import { members } from '@/data/members'
import { prepareSanityDocument } from '@/lib/sanity/utils'

function loadEnvLocal() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  } catch {
    // Ignore missing .env.local when environment variables are provided directly
  }
}

const BOOTSTRAP_PROFILES: UpsertMemberProfileInput[] = [
  {
    slug: 'nav',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'NAIS',
    platformDescription:
      'NAIS er Navs applikasjonsplattform som gir utviklere verktøyene de trenger for å levere applikasjoner raskt, sikkert og kontinuerlig med innebygd Zero Trust og Observability.',
    platformHref: 'https://nais.io',
    platformLabel: 'nais.io',
    platformLogo: '/platforms/nais.svg',
    theme: {
      accentColor: 'teal',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Gjør det enkelt for 120+ produktteam å bygge, sikre og drifte samfunnskritiske tjenester i skyen.',
    taglineEn:
      'Empowering 120+ autonomous product teams to build, secure, and run mission-critical public services.',
    about:
      'NAIS (Navs Applikasjonsplattform) er en åpen kildekode-basert utviklerplattform (Internal Developer Platform) bygget på toppen av Google Cloud Platform og Kubernetes. Plattformen abstraherer bort komplekse sikkerhets-, nettverks- og infrastrukturkrav gjennom en deklarativ applikasjonsmodell (Application og Naisjob CRDs), slik at tverrfaglige produktteam kan eie sine tjenester fra kode til produksjon med full selvbetjening — både i Nav og hos eksterne virksomheter gjennom Nais as a Service (NaaS).',
    aboutEn:
      'NAIS is an open-source Internal Developer Platform built on Google Cloud Platform and Kubernetes. It abstracts complex security, networking, and infrastructure requirements behind a declarative application manifest (Application and Naisjob CRDs).',
    cncfEndUserMember: true,
    openSourceFirst: true,
    cloudProviders: [
      'Google Cloud Platform (GCP)',
      'On-prem (OpenStack / Kubernetes)',
    ],
    stats: [
      {
        label: 'Deployments per uke',
        labelEn: 'Weekly deployments',
        value: '2 500+',
        detail: 'Kontinuerlig leveranse på tvers av 120+ produktteam',
      },
      {
        label: 'Produktteam',
        labelEn: 'Product teams',
        value: '120+',
        detail: 'Autonome tverrfaglige team i Nav og SSB',
      },
      {
        label: 'Kjørende arbeidsflater',
        labelEn: 'Running workloads',
        value: '2 800+',
        detail: 'Mikrotjenester og bakgrunnsjobber i produksjon',
      },
      {
        label: 'Time to Hello World',
        labelEn: 'Time to Hello World',
        value: '< 10 min',
        detail:
          'Fra nytt repo til kjørende app med TLS, identitet og telemetri',
      },
    ],
    manifestExample: {
      title: 'Deklarativ Applikasjonskontrakt (nais.yaml)',
      titleEn: 'Declarative Application Contract (nais.yaml)',
      filename: 'nais.yaml',
      description:
        'Ett enkelt manifest provisjonerer kjøremiljø, Zero Trust-tilgangspolicyer, OAuth2/TokenX-identitet, PostgreSQL-database og OpenTelemetry auto-instrumentering.',
      descriptionEn:
        'A single manifest provisions runtime, Zero Trust access policies, OAuth2/TokenX identity, PostgreSQL database, and OpenTelemetry auto-instrumentation.',
      code: `apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: soknad-api
  namespace: dagpenger
spec:
  image: europe-north1-docker.pkg.dev/nais-io/dagpenger/soknad-api:2026.05.12
  port: 8080
  replicas:
    min: 2
    max: 6
  ingresses:
    - https:// www.nav.no/dagpenger/soknad/api
  azure:
    application:
      enabled: true
  tokenx:
    enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: soknad-frontend
    outbound:
      rules:
        - application: inntekt-oppslag
          namespace: inntekt
  gcp:
    sqlInstances:
      - type: POSTGRES_16
        tier: db-custom-2-7680
        databases:
          - name: soknad
  observability:
    autoInstrumentation:
      enabled: true
      runtime: java`,
    },
    capabilities: [
      {
        id: 'zero-trust-mesh',
        title: 'Zero Trust Service Mesh & Identitet',
        titleEn: 'Zero Trust Service Mesh & Identity',
        category: 'security',
        maturity: 'production',
        selfService: true,
        description:
          'Alle applikasjoner kjører isolert som standard (default-deny). Kommunikasjon mellom tjenester krever eksplisitt deklarerte accessPolicy-regler i nais.yaml, håndhevet med mTLS og automatisk utstedte OAuth2/OIDC-tokens.',
        descriptionEn:
          'All workloads run isolated by default. Service-to-service communication requires explicit accessPolicy declarations enforced via mTLS and automated OAuth2/OIDC tokens.',
        highlights: [
          'Automatisk provisjonering av Entra ID (Azure AD), ID-porten, Maskinporten og TokenX (OAuth 2.0 Token Exchange)',
          'Nettverkssegmentering og L7-policyer med Cilium og Istio mTLS',
          'Signerte container-artefakter, SBOM og SLSA provenance i byggepipeline',
        ],
      },
      {
        id: 'declarative-app',
        title: 'Deklarativ Applikasjonsmodell (Naiserator)',
        titleEn: 'Declarative Application Model (Naiserator)',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Kubernetes-operatoren Naiserator oversetter høynivå Application- og Naisjob-manifester til titalls underliggende Kubernetes-, IAM- og skyressurser.',
        descriptionEn:
          'The Naiserator Kubernetes operator reconciles high-level Application and Naisjob manifests into underlying Kubernetes, IAM, and cloud resources.',
        highlights: [
          'Automatisk oppsett av Deployment, HPA, PodDisruptionBudget, NetworkPolicy og ServiceAccount',
          'Ferdigkonfigurert Wonderwall OAuth2/OIDC-sidecar for innlogging uten sikkerhetskode i appen',
          'Støtte for Nais as a Service (NaaS) for deling av plattformen med andre etater som SSB',
        ],
      },
      {
        id: 'managed-data',
        title: 'Selvbetjent Dataplattform & Meldinger',
        titleEn: 'Self-Service Managed Data & Messaging',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Produktteam bestiller databaser, meldingskøer og lagring direkte i applikasjonsmanifestet uten manuelle bestillingsskjemaer.',
        descriptionEn:
          'Product teams provision databases, message brokers, and object storage directly in the application manifest.',
        highlights: [
          'Cloud SQL for PostgreSQL med automatisk nøkkelrotasjon, IAM-autentisering og daglig backup',
          'Aiven-basert Apache Kafka, Valkey (Redis) og OpenSearch deklarert som Kubernetes-ressurser',
          'Google Cloud Storage buckets og BigQuery-datasett provisjonert per applikasjon',
        ],
      },
      {
        id: 'observability-2',
        title: 'Observability 2.0 & Auto-instrumentering',
        titleEn: 'Observability 2.0 & Auto-Instrumentation',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Ett flagg i nais.yaml aktiverer OpenTelemetry auto-instrumentering for Java, Node.js, Python og Go med ferdig korrelerte traces, metrikker og logger.',
        descriptionEn:
          'A single flag in nais.yaml enables OpenTelemetry auto-instrumentation for Java, Node.js, Python, and Go with correlated traces, metrics, and logs.',
        highlights: [
          'OpenTelemetry Operator injiserer agent automatisk ved oppstart',
          'Grafana Tempo for distribuert sporing, Grafana Loki for logger og Prometheus/Mimir for metrikker',
          'Nais APM og ferdige Golden Signals- og kostnadsdashboards per team',
        ],
      },
      {
        id: 'developer-portal',
        title: 'Nais Console, CLI & Selvbetjening',
        titleEn: 'Nais Console, CLI & Self-Service',
        category: 'dx',
        maturity: 'production',
        selfService: true,
        description:
          'Utviklerportalen Nais Console og kommandolinjeverktøyet Nais CLI gir full oversikt over team, tilganger, kjørende applikasjoner, hemmeligheter, sårbarheter og skykostnader.',
        descriptionEn:
          'Nais Console and Nais CLI give teams visibility into workloads, team memberships, secrets, vulnerabilities, and cloud costs.',
        highlights: [
          'Selvbetjent administrasjon av team, medlemmer, prosjekter og hemmeligheter uten tickets',
          'Sanntidsstatus på utrullinger, kjørende instanser og kostnadsfordeling per applikasjon',
          'Nais CLI med lokal utviklingsstøtte, kubeconfig-oppsett og feilsøkingsverktøy',
        ],
      },
      {
        id: 'ai-coding',
        title: 'KI-utviklingsportal & Agentisk Utvikling',
        titleEn: 'AI Development Portal & Agentic Engineering',
        category: 'ai',
        maturity: 'production',
        selfService: true,
        description:
          'Felles rammeverk, KI-utviklingsportal (ki-utvikling.nav.no), tilpassede skills og sikkerhetskontroller for bruk av KI-kodeagenter på tvers av utviklerorganisasjonen.',
        descriptionEn:
          'Shared governance, AI development portal (ki-utvikling.nav.no), reusable skills, and guardrails for AI coding agents across engineering teams.',
        highlights: [
          'KI-utviklingsportal på ki-utvikling.nav.no med dokumenterte mønstre, cplt og beste praksis',
          'Delte agent-skills og instrukser tilpasset NAIS-manifester, Designsystemet (Aksel) og sikkerhetskrav',
          'Utprøving av nav-pilot og tiltak for sikker og kostnadseffektiv bruk av KI-verktøy',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Kjerneplattform for alle kjøremiljøer i GCP (GKE) og on-prem, utvidet med egne Kubernetes-operatorer i Go (Naiserator).',
        usageEn:
          'Core runtime across GKE and on-prem clusters, extended with custom Go operators.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/navikt/nais',
        sinceYear: 2017,
      },
      {
        name: 'Cilium',
        tier: 'Graduated',
        category: 'Networking & Service Mesh',
        usage:
          'eBPF-basert CNI og håndheving av nettverkspolicyer mellom arbeidsflater og eksterne endepunkter.',
        usageEn:
          'eBPF-based CNI and network policy enforcement across clusters.',
        cncfUrl: 'https://www.cncf.io/projects/cilium/',
        sinceYear: 2021,
      },
      {
        name: 'Istio',
        tier: 'Graduated',
        category: 'Networking & Service Mesh',
        usage:
          'Gjensidig TLS (mTLS), tjenesteidentitet og finmasket tilgangskontroll mellom mikrotjenester.',
        usageEn:
          'Mutual TLS, service identity, and fine-grained authorization between microservices.',
        cncfUrl: 'https://www.cncf.io/projects/istio/',
        sinceYear: 2019,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage:
          'Innsamling av applikasjons- og plattformmetrikker med automatisk scraping og varsling.',
        usageEn: 'Metrics collection and alerting for all workloads.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2017,
      },
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage:
          'Standardisert auto-instrumentering og telemetripipeline (Operator + Collector) til Tempo, Loki og Mimir.',
        usageEn:
          'Standardized auto-instrumentation and telemetry pipeline via OpenTelemetry Operator and Collector.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
      {
        name: 'Flux',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'GitOps-basert utrulling og livssyklusstyring av plattformkomponenter på tvers av klynger.',
        usageEn:
          'GitOps reconciliation of platform components across clusters.',
        cncfUrl: 'https://www.cncf.io/projects/flux/',
        sinceYear: 2021,
      },
      {
        name: 'Cert-Manager',
        tier: 'Graduated',
        category: 'Security & Policy',
        usage: 'Automatisk utstedelse og fornyelse av TLS-sertifikater.',
        usageEn: 'Automated TLS certificate issuance and renewal.',
        cncfUrl: 'https://www.cncf.io/projects/cert-manager/',
        sinceYear: 2018,
      },
      {
        name: 'Backstage',
        tier: 'Incubating',
        category: 'Platform & App Definition',
        usage: 'Utviklerportal, tjenestekatalog og teknisk dokumentasjon.',
        usageEn: 'Developer portal, service catalog, and documentation.',
        cncfUrl: 'https://www.cncf.io/projects/backstage/',
        sinceYear: 2022,
      },
    ],
    techStack: [
      {
        category: 'Kjøremiljø & Infrastruktur',
        categoryEn: 'Compute & Infrastructure',
        items: [
          'Google Kubernetes Engine (GKE)',
          'Naiserator (Go Operator)',
          'Terraform',
          'Flux CD',
          'BottleRocket / Container-Optimized OS',
        ],
      },
      {
        category: 'Sikkerhet & Identitet',
        categoryEn: 'Security & Identity',
        items: [
          'Cilium',
          'Istio mTLS',
          'Wonderwall (OIDC Sidecar)',
          'Texas (Token Exchange as a Service)',
          'Entra ID / ID-porten / Maskinporten / TokenX',
          'Trivy / Cosign / SLSA',
        ],
      },
      {
        category: 'Data & Meldinger',
        categoryEn: 'Data & Messaging',
        items: [
          'Cloud SQL (PostgreSQL)',
          'Apache Kafka (Aiven)',
          'Valkey / Redis',
          'OpenSearch',
          'Google BigQuery',
          'Google Cloud Storage',
        ],
      },
      {
        category: 'Observability & Utviklerverktøy',
        categoryEn: 'Observability & Developer Tooling',
        items: [
          'OpenTelemetry',
          'Grafana Tempo / Loki / Mimir',
          'Prometheus',
          'Nais Console (GraphQL + React)',
          'Nais CLI',
          'GitHub Actions',
        ],
      },
    ],
    team: [
      {
        name: 'Audun Fauchald Strand',
        role: 'Plattformleder, NAIS',
        roleEn: 'Head of Platform, NAIS',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U4U0AJ4HM',
        github: 'audunstrand',
      },
      {
        name: 'Hans Kristian Flaatten',
        role: 'Tech Lead, Observability & KI',
        roleEn: 'Tech Lead, Observability & AI',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
        github: 'starefossen',
      },
      {
        name: 'Johnny Horvi',
        role: 'Plattformarkitekt, Nais Console & API',
        roleEn: 'Platform Architect, Nais Console & API',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U4SR1TZC0',
      },
      {
        name: 'Frode Sundby',
        role: 'Plattformutvikler, Nais Console & API',
        roleEn: 'Platform Engineer, Nais Console & API',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U4SNTLV3K',
      },
      {
        name: 'Kyrre Havik Eriksen',
        role: 'Sikkerhetsarkitekt, NAIS',
        roleEn: 'Security Architect, NAIS',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U03799B3K2H',
        github: 'kyrremann',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'NAIS Dokumentasjon',
        description:
          'Fullstendig brukerdokumentasjon, arkitekturprinsipper og guider for utviklere.',
        url: 'https://docs.nais.io',
        type: 'docs',
      },
      {
        title: 'github.com/nais',
        description:
          'Åpen kildekode for Naiserator, Wonderwall, Nais CLI, Console og operatorer.',
        url: 'https://github.com/nais',
        type: 'github',
      },
      {
        title: 'KI-utviklingsportal (ki-utvikling.nav.no)',
        description:
          'Navs åpne portal for utvikling med KI-kodeagenter, retningslinjer og gjenbrukbare skills.',
        url: 'https://ki-utvikling.nav.no',
        type: 'website',
      },
      {
        title: 'Det som betyr noe — Karriere i Nav IT',
        description:
          'Les om teknologi, produktteam og ledige stillinger i Nav.',
        url: 'https://www.detsombetyrnoe.no',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'skatteetaten',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Aurora',
    platformDescription:
      'Aurora er Skatteetatens applikasjonsplattform som håndterer bygging, utrulling og drift av containere i OpenShift og Azure Kubernetes Service — supplert med etatens data- og analyseplattform i Azure.',
    platformHref: 'https://skatteetaten.github.io/aurora/',
    platformLabel: 'skatteetaten.github.io',
    platformLogo: '/platforms/aurora.jpg',
    theme: {
      accentColor: 'blue',
      heroStyle: 'grid',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Robust, høy-skalerbar plattform for kritisk skatte- og avgiftsinfrastruktur på tvers av on-prem og sky.',
    taglineEn:
      'Resilient, high-scale platform powering national tax and revenue infrastructure across on-prem and cloud.',
    about:
      'Aurora er Skatteetatens plattform for mikrotjenester og skybaserte applikasjoner. Den ble etablert i 2016 som en av de første containerplattformene i norsk offentlig sektor, og håndterer i dag tusenvis av containere på tvers av egne datasentre (Red Hat OpenShift) og Microsoft Azure (AKS). I tillegg har Skatteetaten etablert en felles data- og analyseplattform basert på Databricks i Azure og egenutviklede observability-verktøy som Argus.',
    aboutEn:
      'Aurora is the Norwegian Tax Administration application platform, running thousands of containers across on-premise Red Hat OpenShift and Microsoft Azure (AKS), complemented by an Azure Databricks data platform.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Microsoft Azure (AKS)', 'On-prem (Red Hat OpenShift)'],
    stats: [
      {
        label: 'Kjørende containere',
        labelEn: 'Running containers',
        value: '4 000+',
        detail: 'Fordelt på OpenShift on-prem og Azure Kubernetes Service',
      },
      {
        label: 'Utviklere',
        labelEn: 'Developers',
        value: '650+',
        detail: 'Interne og innleide produktutviklere på tvers av etaten',
      },
      {
        label: 'Plattform-historikk',
        labelEn: 'Platform heritage',
        value: 'Siden 2016',
        detail:
          'Blant de første containerplattformene i norsk offentlig sektor',
      },
      {
        label: 'Dataplattform i Azure',
        labelEn: 'Azure Data Platform',
        value: 'Databricks',
        detail: 'I produksjon siden skattesesongen 2023',
      },
    ],
    manifestExample: {
      title: 'Aurora Config — Deklarativ Applikasjonskonfigurasjon',
      titleEn: 'Aurora Config — Declarative Application Configuration',
      filename: 'skattemelding-api.json',
      description:
        'Aurora Config skiller felles miljøkonfigurasjon fra applikasjonsspesifikke overstyringer via Boober-tjenesten.',
      descriptionEn:
        'Aurora Config separates shared environment baselines from application overrides via the Boober reconciler.',
      code: `{
  "schemaVersion": "v1",
  "affiliation": "skattemelding",
  "name": "skattemelding-api",
  "type": "deploy",
  "groupId": "no.skatteetaten.skattemelding",
  "artifactId": "skattemelding-api",
  "version": "2.14.0",
  "replicas": 4,
  "database": {
    "skattemelding_db": {
      "generate": true
    }
  },
  "certificate": true,
  "route": {
    "skattemelding-api": {
      "enabled": true
    }
  },
  "prometheus": {
    "path": "/actuator/prometheus",
    "port": "8081"
  }
}`,
    },
    capabilities: [
      {
        id: 'aurora-config',
        title: 'Deklarativ Konfigurasjon & Hierarkisk Arv',
        titleEn: 'Declarative Config & Hierarchical Inheritance',
        category: 'cicd',
        maturity: 'production',
        selfService: true,
        description:
          'Aurora Config (via Boober og Gobo) lar team definere felles grunnkonfigurasjon på tvers av miljøer og applikasjoner med tørrkjøring, validering og versjonskontroll i Git.',
        descriptionEn:
          'Aurora Config allows teams to define DRY hierarchical configuration across environments and applications with Git validation.',
        highlights: [
          'Hierarkisk arv (global → affiliation → miljø → applikasjon)',
          'CLI-verktøyet ao og web-portalen Aurora Konsoll for rask utrulling og inspeksjon',
          'Automatisk generering av DeploymentConfig, Routes, NetworkPolicy og sertifikater',
        ],
      },
      {
        id: 'hybrid-cloud',
        title: 'Hybrid Kjøremiljø (OpenShift & Azure AKS)',
        titleEn: 'Hybrid Runtime (OpenShift & Azure AKS)',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Sømløs støtte for både sensitive arbeidsflater på egne datasentre og elastiske skytjenester i Microsoft Azure.',
        descriptionEn:
          'Seamless support for sensitive on-prem workloads and elastic cloud services in Microsoft Azure.',
        highlights: [
          'Standardisert utvikleropplevelse på tvers av OpenShift og AKS',
          'Elastisk kapasitet for nasjonale trafikk-topper ved skattemelding og skatteoppgjør',
          'Isolerte navnerom (affiliations) med streng kvotestyring',
        ],
      },
      {
        id: 'observability-argus',
        title: 'Helhetlig Observability & Argus Digital Signage',
        titleEn: 'End-to-End Observability & Argus',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Ferdig oppsatt metrikkinnsamling, loggaggregering, distribuert sporing og det egenutviklede verktøyet Argus for sanntids visning av tilstand i systemlandskapet.',
        descriptionEn:
          'Pre-configured metrics, log aggregation, distributed tracing, and the in-house Argus status visualization platform.',
        highlights: [
          'Prometheus og Grafana for sanntidsmetrikker og SLO-overvåking',
          'OpenTelemetry-basert sporing på tvers av JVM-, Go- og .NET-tjenester',
          'Argus for visuell sanntidsoversikt over helsetilstand i Skatteetatens tjenester',
        ],
      },
      {
        id: 'databricks-platform',
        title: 'Data- og Analyseplattform i Azure',
        titleEn: 'Azure Data & Analytics Platform',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Felles skybasert data- og analyseplattform basert på Databricks i Azure, i produksjon siden skattesesongen 2023.',
        descriptionEn:
          'Shared cloud data and analytics platform powered by Databricks on Azure, in production since 2023.',
        highlights: [
          'Selvbetjent tilgang til strukturerte dataprodukter og analysearbeidsflater i Azure',
          'Innebygd tilgangsstyring, sporbarhet og styresett tilpasset skatte- og folkeregisterdata',
        ],
      },
      {
        id: 'ai-enablement',
        title: 'Trygg KI-adopsjon & Utviklerverktøy',
        titleEn: 'Safe AI Adoption & Developer Enablement',
        category: 'ai',
        maturity: 'production',
        selfService: true,
        description:
          'Strukturert innføring og skalering av kunstig intelligens for utvikling og saksbehandling med ivaretatt sikkerhet, personvern og juridiske rammer.',
        descriptionEn:
          'Structured adoption and scaling of AI tools for engineering and case processing within strict security and legal guardrails.',
        highlights: [
          'Praktiske sikkerhets- og personvernvurderinger for bruk av KI i offentlig forvaltning',
          'Fokus på målbar tidsbesparelse og kvalitet i utviklingshverdagen',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Fundamentet under både Red Hat OpenShift on-prem og Azure Kubernetes Service (AKS) i sky.',
        usageEn:
          'Foundation beneath both on-prem OpenShift and Azure Kubernetes Service.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/Skatteetaten',
        sinceYear: 2016,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage:
          'Standardisert metrikkinnsamling fra alle applikasjoner og klyngekomponenter.',
        usageEn: 'Standardized metrics collection across all clusters.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2017,
      },
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage:
          'Felles standard for distribuert sporing, metrikker og korrelerte logger.',
        usageEn:
          'Unified standard for distributed tracing, metrics, and correlated logs.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
      {
        name: 'Argo CD',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage: 'GitOps-basert leveranse for nye sky-arbeidsflater i Azure.',
        usageEn: 'GitOps delivery for cloud workloads on Azure.',
        cncfUrl: 'https://www.cncf.io/projects/argo/',
        sinceYear: 2022,
      },
      {
        name: 'Helm',
        tier: 'Graduated',
        category: 'Platform & App Definition',
        usage: 'Pakking og utrulling av plattformtjenester i AKS.',
        usageEn: 'Packaging and deployment of platform services in AKS.',
        cncfUrl: 'https://www.cncf.io/projects/helm/',
        sinceYear: 2020,
      },
    ],
    techStack: [
      {
        category: 'Plattformkjerne',
        categoryEn: 'Platform Core',
        items: [
          'Red Hat OpenShift',
          'Azure Kubernetes Service (AKS)',
          'Boober / Gobo (Kotlin & Go)',
          'Aurora Konsoll',
          'ao CLI',
        ],
      },
      {
        category: 'Data & Observability',
        categoryEn: 'Data & Observability',
        items: [
          'Azure Databricks',
          'Prometheus',
          'Grafana',
          'OpenTelemetry',
          'Argus (Digital Signage)',
          'Splunk / Elasticsearch',
        ],
      },
    ],
    team: [
      {
        name: 'Are Vattekar',
        role: 'Plattformleder',
        roleEn: 'Head of Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U4SM25LUQ',
      },
      {
        name: 'Robert Myhren',
        role: 'Tech Lead, Observability & Argus',
        roleEn: 'Tech Lead, Observability & Argus',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U04BEMRE8R2',
      },
      {
        name: 'Tron Magnus Svagård',
        role: 'Plattformarkitekt, Data- og Analyseplattform',
        roleEn: 'Platform Architect, Data & Analytics Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U062T2LSX1R',
      },
      {
        name: 'Johanna Anker Kulmus',
        role: 'Plattformutvikler, Data- og Analyseplattform',
        roleEn: 'Platform Engineer, Data & Analytics Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U058549DJEM',
      },
      {
        name: 'Tor Ivar Asbølmo',
        role: 'Arkitekt, KI & Plattform',
        roleEn: 'Architect, AI & Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U08TXESMU1L',
      },
      {
        name: 'Geir Tore Johansen',
        role: 'Teknologiledelse & KI',
        roleEn: 'Technology Leadership & AI',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U05UZ92SB6G',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'Aurora Dokumentasjon',
        description:
          'Åpen dokumentasjon for Aurora-plattformen og dens arkitektur.',
        url: 'https://skatteetaten.github.io/aurora/',
        type: 'docs',
      },
      {
        title: 'github.com/Skatteetaten',
        description: 'Skatteetatens åpne kildekode-prosjekter på GitHub.',
        url: 'https://github.com/Skatteetaten',
        type: 'github',
      },
      {
        title: 'Jobb i Skatteetaten IT',
        description: 'Utforsk karrieremuligheter innen IT og teknologi.',
        url: 'https://www.skatteetaten.no/jobb/',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'kartverket',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'SKIP',
    platformDescription:
      'SKIP (Statens Kartverks Infrastrukturplattform) gjør det raskt, trygt og enkelt å bygge og drifte applikasjoner og geodata-pipelines på Google Cloud Platform med Skiperator og GitOps.',
    platformHref: 'https://skip.kartverket.no',
    platformLabel: 'skip.kartverket.no',
    platformLogo: '/platforms/skip.png',
    theme: {
      accentColor: 'emerald',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Innebygd sikkerhet og brukervennlighet for Kartverkets produktteam med Skiperator, Istio og Argo CD.',
    taglineEn:
      'Built-in security and developer ergonomics for the Norwegian Mapping Authority with Skiperator, Istio, and Argo CD.',
    about:
      'SKIP (Statens Kartverks Infrastrukturplattform) er Kartverkets skyplattform på Google Cloud Platform (GKE). Kjernen i plattformen er den åpne Kubernetes-operatoren Skiperator (skrevet i Go, inspirert av Naiserator), kombinert med Argo CD for GitOps, Istio service mesh for Zero Trust-nettverk, og standardiserte cluster policies for selvbetjente geodata-pipelines.',
    aboutEn:
      'SKIP is the cloud platform of the Norwegian Mapping Authority on Google Cloud Platform (GKE), powered by the open-source Skiperator Kubernetes operator, Argo CD, and Istio.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Google Cloud Platform (GKE)'],
    stats: [
      {
        label: 'Produktteam',
        labelEn: 'Product teams',
        value: '25+',
        detail: 'Kart-, matrikkel-, tinglysings- og geodatateam',
      },
      {
        label: 'Open Source Operator',
        labelEn: 'Open Source Operator',
        value: 'Skiperator',
        detail: '100 % åpen kildekode i Go på github.com/kartverket/skiperator',
      },
      {
        label: 'GitOps-leveranser',
        labelEn: 'GitOps delivery',
        value: 'Argo CD',
        detail: 'Full deklarativ utrulling fra Git',
      },
      {
        label: 'Zero Trust',
        labelEn: 'Zero Trust',
        value: '100% mTLS',
        detail: 'Istio Service Mesh med default-deny',
      },
    ],
    manifestExample: {
      title: 'Skiperator Application CRD',
      titleEn: 'Skiperator Application CRD',
      filename: 'skiperator.yaml',
      description:
        'Skiperator forenkler Kubernetes-oppsettet til én kompakt Application-ressurs med innebygd sikkerhet og nettverkspolicy.',
      descriptionEn:
        'Skiperator condenses Kubernetes setup into a compact Application custom resource with built-in security.',
      code: `apiVersion: skiperator.kartverket.no/v1alpha1
kind: Application
metadata:
  name: grunnbok-api
  namespace: eiendom
spec:
  image: ghcr.io/kartverket/grunnbok-api:sha-9f4c21a
  port: 8080
  replicas:
    min: 2
    max: 5
  ingresses:
    - grunnbok.kartverket.no
  accessPolicy:
    inbound:
      rules:
        - application: eiendom-frontend
    outbound:
      external:
        - host: matrikkel.no
  prometheus:
    path: /metrics
    port: 8080`,
    },
    capabilities: [
      {
        id: 'skiperator-crd',
        title: 'Skiperator Application Operator',
        titleEn: 'Skiperator Application Operator',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Egenutviklet åpen kildekode Kubernetes-operator i Go som genererer herdede Deployments, NetworkPolicies, Istio-ressurser, HorizontalPodAutoscalers og sertifikater.',
        descriptionEn:
          'Open-source Go Kubernetes operator generating hardened Deployments, NetworkPolicies, Istio resources, HPAs, and certificates.',
        highlights: [
          'Kjører alle containere som non-root med read-only root filesystem som standard',
          'Automatisk oppsett av Istio VirtualService, Gateway og PeerAuthentication',
          'Utviklet åpent på github.com/kartverket/skiperator',
        ],
      },
      {
        id: 'gitops-argocd',
        title: 'GitOps med Argo CD',
        titleEn: 'GitOps with Argo CD',
        category: 'cicd',
        maturity: 'production',
        selfService: true,
        description:
          'Alle applikasjoner og plattformtjenester synkroniseres deklarativt fra Git-repoer via Argo CD.',
        descriptionEn:
          'All workloads and platform services are declaratively reconciled from Git repositories via Argo CD.',
        highlights: [
          'Selvbetjent onboarding av nye team-navnerom og applikasjonsrepoer',
          'Umiddelbar tilbakerulling og full revisjonslogg i Git',
        ],
      },
      {
        id: 'istio-zero-trust',
        title: 'Zero Trust Nettverk med Istio',
        titleEn: 'Zero Trust Networking with Istio',
        category: 'security',
        maturity: 'production',
        selfService: true,
        description:
          'Streng mTLS og nettverksisolasjon mellom alle navnerom og applikasjoner uten at utviklerne må skrive lavnivå Istio-konfigurasjon.',
        descriptionEn:
          'Strict mTLS and network isolation across namespaces and workloads abstracted behind Skiperator.',
        highlights: [
          'Default-deny for både inngående og utgående trafikk',
          'Automatisk provisjonering av Istio ServiceEntry og AuthorizationPolicy fra accessPolicy',
        ],
      },
      {
        id: 'geo-data-pipelines',
        title: 'Cluster Policies for Selvbetjente Geo-Datapipelines',
        titleEn: 'Cluster Policies for Self-Service Geo-Data Pipelines',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Standardiserte cluster policies og kjøremiljøer som lar geodata-team prosessere store kart- og terrengdatasett selvbetjent på Kubernetes og GCP.',
        descriptionEn:
          'Standardized cluster policies and runtimes enabling geo-data teams to run large geospatial pipelines self-service on GKE.',
        highlights: [
          'Sikker tilgang til Cloud Storage og PostGIS/Cloud SQL via Workload Identity',
          'Policy-styrt ressursbruk for tunge geodata-jobber',
        ],
      },
      {
        id: 'observability-stack',
        title: 'Helhetlig Observability med Grafana & OpenTelemetry',
        titleEn: 'Observability with Grafana & OpenTelemetry',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Ferdige dashboards, metrikker, logger og sporing som gir produktteamene oversikt over ytelse og feilrater fra dag én.',
        descriptionEn:
          'Pre-built dashboards, metrics, logs, and traces giving product teams instant visibility.',
        highlights: [
          'Prometheus og Grafana med standardiserte Skiperator-dashboards',
          'Loki og Tempo for korrelerte logger og distribuert sporing',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'GKE-basert plattformkjerne utvidet med Skiperator Custom Resource Definitions.',
        usageEn: 'GKE-based platform core extended with Skiperator CRDs.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/kartverket/skiperator',
        sinceYear: 2021,
      },
      {
        name: 'Argo CD',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage: 'GitOps-motor for både plattformkomponenter og produktteam.',
        usageEn: 'GitOps engine for platform components and product teams.',
        cncfUrl: 'https://www.cncf.io/projects/argo/',
        sinceYear: 2021,
      },
      {
        name: 'Istio',
        tier: 'Graduated',
        category: 'Networking & Service Mesh',
        usage:
          'Service mesh med mTLS, ingress-gateways og eksplisitt trafikkstyring.',
        usageEn:
          'Service mesh providing mTLS, ingress gateways, and traffic control.',
        cncfUrl: 'https://www.cncf.io/projects/istio/',
        sinceYear: 2021,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Metrikkinnsamling fra klynger, Istio og applikasjoner.',
        usageEn: 'Metrics collection from clusters, Istio, and workloads.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2021,
      },
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage: 'Innsamling av traces, metrikker og logger fra applikasjoner.',
        usageEn: 'Collection of traces, metrics, and logs from applications.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
      {
        name: 'Cert-Manager',
        tier: 'Graduated',
        category: 'Security & Policy',
        usage: 'Automatisk sertifikatutstedelse for applikasjons-ingresser.',
        usageEn: 'Automated certificate issuance for application ingresses.',
        cncfUrl: 'https://www.cncf.io/projects/cert-manager/',
        sinceYear: 2021,
      },
      {
        name: 'External Secrets Operator',
        tier: 'Incubating',
        category: 'Security & Policy',
        usage:
          'Synkronisering av hemmeligheter fra Google Secret Manager til Kubernetes.',
        usageEn:
          'Synchronizes secrets from Google Secret Manager into Kubernetes.',
        cncfUrl: 'https://www.cncf.io/projects/external-secrets-operator/',
        sinceYear: 2022,
      },
    ],
    techStack: [
      {
        category: 'Plattform & GitOps',
        categoryEn: 'Platform & GitOps',
        items: [
          'Google Kubernetes Engine (GKE)',
          'Skiperator (Go)',
          'Argo CD',
          'Terraform',
          'GitHub Actions',
        ],
      },
      {
        category: 'Sikkerhet & Observability',
        categoryEn: 'Security & Observability',
        items: [
          'Istio Service Mesh',
          'External Secrets Operator',
          'Cert-Manager',
          'Grafana / Prometheus / Loki / Tempo',
          'OpenTelemetry',
        ],
      },
    ],
    team: [
      {
        name: 'Espen Henriksen',
        role: 'Plattformutvikler, SKIP',
        roleEn: 'Platform Engineer, SKIP',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U02SG8873PC',
        github: 'espenikka',
      },
      {
        name: 'Thomas Berg',
        role: 'Plattformarkitekt & Observability, SKIP',
        roleEn: 'Platform Architect & Observability, SKIP',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UMZGJUW5R',
      },
      {
        name: 'Joachim Haakonsen',
        role: 'Plattformutvikler, SKIP',
        roleEn: 'Platform Engineer, SKIP',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U05Q0GCJPTL',
      },
      {
        name: 'Kay Frode Kristiansen',
        role: 'Plattformutvikler, SKIP',
        roleEn: 'Platform Engineer, SKIP',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U063M7824JG',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'SKIP Dokumentasjon',
        description:
          'Offisiell dokumentasjon, arkitekturbeskrivelser og onboardingsguider for SKIP.',
        url: 'https://skip.kartverket.no',
        type: 'docs',
      },
      {
        title: 'github.com/kartverket/skiperator',
        description:
          'Kildekoden til Skiperator Kubernetes-operatoren på GitHub.',
        url: 'https://github.com/kartverket/skiperator',
        type: 'github',
      },
      {
        title: 'Karriere i Kartverket',
        description:
          'Bli med å bygge Norges digitale kart- og eiendomsgrunnlag.',
        url: 'https://www.kartverket.no/om-kartverket/jobb-i-kartverket',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'equinor',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Radix',
    platformDescription:
      'Radix (Rapid Application Deploymentat Internet Scale) er Equinors interne utviklerplattform på Azure Kubernetes Service som håndterer bygging, utrulling og overvåkning fra radixconfig.yaml.',
    platformHref: 'https://radix.equinor.com',
    platformLabel: 'radix.equinor.com',
    platformLogo: '/platforms/radix.svg',
    theme: {
      accentColor: 'rose',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Fra kildekode i GitHub til kjørende, sikker og overvåket applikasjon i Azure på minutter.',
    taglineEn:
      'From source code in GitHub to running, secured, and monitored workloads in Azure in minutes.',
    about:
      'Omnia Radix er Equinors PaaS- og utviklerplattform bygget på Microsoft Azure (AKS) og Kubernetes. Gjennom én enkelt deklarativ konfigurasjonsfil (radixconfig.yaml) i applikasjonens GitHub-repo håndterer Radix Operator automatisk CI/CD-bygging med Tekton, sårbarhetsskanning, utrulling til flere miljøer, TLS, nettverksisolasjon, KEDA-basert autoskalering og sanntidsmetrikker.',
    aboutEn:
      'Omnia Radix is Equinor’s PaaS and developer platform built on Microsoft Azure (AKS) and Kubernetes. Driven by a single radixconfig.yaml file, Radix Operator automates CI/CD builds, multi-environment deployment, network isolation, KEDA autoscaling, and monitoring.',
    cncfEndUserMember: true,
    openSourceFirst: true,
    cloudProviders: ['Microsoft Azure (AKS)'],
    stats: [
      {
        label: 'Kjørende applikasjoner',
        labelEn: 'Running applications',
        value: '1 000+',
        detail: 'Mikrotjenester, web-apper og batch-jobber i AKS',
      },
      {
        label: 'Radix Operator',
        labelEn: 'Radix Operator',
        value: 'Open Source',
        detail:
          'Tilgjengelig under åpen lisens på github.com/equinor/radix-operator',
      },
      {
        label: 'Konfigurasjonsfil',
        labelEn: 'Configuration contract',
        value: 'radixconfig.yaml',
        detail: 'Én deklarativ fil styrer bygg, miljøer og kjøring',
      },
      {
        label: 'Sikkerhet',
        labelEn: 'Security posture',
        value: 'Least Privilege',
        detail:
          'Rootless containere, nettverksisolasjon og OIDC Workload Identity',
      },
    ],
    manifestExample: {
      title: 'Deklarativ Radix-konfigurasjon (radixconfig.yaml)',
      titleEn: 'Declarative Radix Configuration (radixconfig.yaml)',
      filename: 'radixconfig.yaml',
      description:
        'radixconfig.yaml definerer miljøer, git-branch-mapping, komponenter, hemmeligheter, OAuth2-innlogging og autoskalering.',
      descriptionEn:
        'radixconfig.yaml defines environments, branch mappings, components, secrets, OAuth2 login, and autoscaling.',
      code: `apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: windfarm-telemetry
spec:
  environments:
    - name: dev
      build:
        from: main
    - name: prod
      build:
        from: release
  components:
    - name: api
      src: ./services/api
      ports:
        - name: http
          port: 8080
      publicPort: http
      horizontalScaling:
        minReplicas: 2
        maxReplicas: 10
      identity:
        azure:
          clientId: 00000000-0000-0000-0000-000000000000`,
    },
    capabilities: [
      {
        id: 'radixconfig',
        title: 'Deklarativ Applikasjonsmodell (radixconfig.yaml)',
        titleEn: 'Declarative Application Model (radixconfig.yaml)',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Radix Operator avstemmer radixconfig.yaml til egne Custom Resources (RadixApplication, RadixDeployment, RadixJob) og provisjonerer isolerte navnerom per miljø.',
        descriptionEn:
          'Radix Operator reconciles radixconfig.yaml into Custom Resources and isolated namespaces per environment.',
        highlights: [
          'Støtte for både langtkjørende komponenter og batch-/beregningsjobber (RadixJob)',
          'Ferdig integrert OAuth2-proxy og Azure Workload Identity',
          'Web Console og Radix CLI (rx) for logginspeksjon og miljøstyring',
        ],
      },
      {
        id: 'cicd-tekton',
        title: 'Innebygd CI/CD & Multi-miljø Promotering',
        titleEn: 'Built-in CI/CD & Multi-Environment Promotion',
        category: 'cicd',
        maturity: 'production',
        selfService: true,
        description:
          'Integrert bygge- og utrullingspipeline basert på Tekton som trigges direkte fra GitHub webhooks og støtter promotering av uforanderlige container-images mellom miljøer.',
        descriptionEn:
          'Integrated Tekton build and deployment pipelines triggered via GitHub webhooks with immutable image promotion.',
        highlights: [
          'Bygg én gang i dev, promover samme signerte image til test og prod',
          'Automatisk sårbarhetsskanning av alle bygde container-images',
        ],
      },
      {
        id: 'workload-security',
        title: 'Container-herding & Azure Workload Identity',
        titleEn: 'Container Hardening & Azure Workload Identity',
        category: 'security',
        maturity: 'production',
        selfService: true,
        description:
          'Streng nettverkssegmentering med Cilium, håndheving av non-root containere og passordfri tilgang til Azure-ressurser via OIDC Workload Identity.',
        descriptionEn:
          'Strict network segmentation with Cilium, non-root container enforcement, and passwordless Azure access via OIDC Workload Identity.',
        highlights: [
          'Integrasjon med Azure Key Vault for automatisk rotasjon av hemmeligheter',
          'Kontinuerlig sårbarhetsovervåking med Radix Vulnerability Scanner',
        ],
      },
      {
        id: 'autoscaling-keda',
        title: 'Hendelsesdrevet Autoskalering & Batch-jobber',
        titleEn: 'Event-Driven Autoscaling & Batch Jobs',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Skalerer arbeidsflater dynamisk basert på CPU, minne eller eksterne køer (Azure Service Bus / Event Hub) ved hjelp av KEDA.',
        descriptionEn:
          'Dynamically scales workloads based on CPU, memory, or Azure queues via KEDA.',
        highlights: [
          'Skalering ned til 0 for utviklingsmiljøer og periodiske jobber',
          'Dedikerte GPU- og høyytelses-nodepools for tunge beregningsjobber',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Kjører på Azure Kubernetes Service (AKS) med den åpne Radix Operator i Go.',
        usageEn:
          'Runs on Azure Kubernetes Service (AKS) with the open-source Radix Operator in Go.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/equinor/radix-operator',
        sinceYear: 2018,
      },
      {
        name: 'Flux',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'GitOps-basert synkronisering av plattformkomponenter på tvers av AKS-klynger.',
        usageEn:
          'GitOps synchronization of platform components across AKS clusters.',
        cncfUrl: 'https://www.cncf.io/projects/flux/',
        sinceYear: 2021,
      },
      {
        name: 'Cilium',
        tier: 'Graduated',
        category: 'Networking & Service Mesh',
        usage: 'CNI og nettverkspolicyer i AKS.',
        usageEn: 'CNI and network policies in AKS.',
        cncfUrl: 'https://www.cncf.io/projects/cilium/',
        sinceYear: 2022,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Metrikkinnsamling og applikasjonsdashboards i Grafana.',
        usageEn: 'Metrics collection and application dashboards in Grafana.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2018,
      },
      {
        name: 'KEDA',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Hendelsesdrevet autoskalering av komponenter og jobb-køer i Radix.',
        usageEn: 'Event-driven autoscaling of Radix components and job queues.',
        cncfUrl: 'https://www.cncf.io/projects/keda/',
        sinceYear: 2022,
      },
      {
        name: 'Cert-Manager',
        tier: 'Graduated',
        category: 'Security & Policy',
        usage: 'Automatisert TLS-sertifikathåndtering for alle ingresser.',
        usageEn: 'Automated TLS certificate management for all ingresses.',
        cncfUrl: 'https://www.cncf.io/projects/cert-manager/',
        sinceYear: 2019,
      },
    ],
    techStack: [
      {
        category: 'Kjerne & Orkestrering',
        categoryEn: 'Core & Orchestration',
        items: [
          'Azure Kubernetes Service (AKS)',
          'Radix Operator (Go)',
          'Flux CD',
          'Tekton Pipelines',
          'KEDA',
          'Cilium',
        ],
      },
      {
        category: 'Sikkerhet & Observability',
        categoryEn: 'Security & Observability',
        items: [
          'Entra ID Workload Identity',
          'Azure Key Vault',
          'Trivy Vulnerability Scanner',
          'Prometheus & Grafana',
          'OpenTelemetry',
        ],
      },
    ],
    team: [],
    openPositions: [],
    links: [
      {
        title: 'Radix Dokumentasjon',
        description:
          'Offisiell dokumentasjon, guider og referanse for radixconfig.yaml.',
        url: 'https://radix.equinor.com',
        type: 'docs',
      },
      {
        title: 'github.com/equinor/radix-operator',
        description:
          'Åpen kildekode for Radix Kubernetes Operator og tilhørende komponenter.',
        url: 'https://github.com/equinor/radix-operator',
        type: 'github',
      },
      {
        title: 'Karriere i Equinor Digital & IT',
        description: 'Utforsk ledige teknologistillinger i Equinor.',
        url: 'https://www.equinor.com/careers',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'digdir',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Altinn Studio & Altinn 3',
    platformDescription:
      'Altinn 3 og Altinn Studio er Digdirs felles skybaserte applikasjonsplattform på Kubernetes (AKS) der over 60 offentlige virksomheter utvikler og drifter digitale innbygger- og næringslivstjenester.',
    platformHref: 'https://docs.altinn.studio',
    platformLabel: 'docs.altinn.studio',
    platformLogo: '/platforms/altinn.svg',
    theme: {
      accentColor: 'blue',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Felles skybasert applikasjonsplattform på Kubernetes for over 60 offentlige etater og kommuner.',
    taglineEn:
      'Shared cloud-native application platform on Kubernetes serving 60+ Norwegian public sector agencies.',
    about:
      'Altinn 3 og Altinn Studio er Digitaliseringsdirektoratets (Digdir) åpne plattform for utvikling og drift av digitale offentlige tjenester. Hver tjenesteeier (etat eller kommune) får sitt eget isolerte Kubernetes-kjøremiljø i Azure (AKS), ferdig integrert med nasjonale fellesløsninger som ID-porten, Maskinporten, Ansattporten, Folkeregisteret, Dialogporten og Altinn Events. Alt utvikles som 100 % åpen kildekode på GitHub.',
    aboutEn:
      'Altinn 3 and Altinn Studio form the Norwegian Digitalisation Agency’s open-source platform for developing and running digital public services on isolated Azure Kubernetes Service (AKS) clusters.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Microsoft Azure (AKS)'],
    stats: [
      {
        label: 'Tjenesteeiere',
        labelEn: 'Service owners',
        value: '60+',
        detail: 'Offentlige etater og kommuner på felles plattform',
      },
      {
        label: 'Kildekode',
        labelEn: 'Source code',
        value: '100% Open Source',
        detail: 'Utviklet åpent i github.com/Altinn og github.com/digdir',
      },
      {
        label: 'Kjøremiljø',
        labelEn: 'Runtime isolation',
        value: 'AKS per etat',
        detail: 'Dedikerte Kubernetes-klynger per tjenesteeier',
      },
      {
        label: 'Fellesløsninger',
        labelEn: 'National trust services',
        value: 'Innebygd',
        detail: 'ID-porten, Maskinporten, Dialogporten og eFormidling',
      },
    ],
    manifestExample: {
      title:
        'Altinn 3 Applikasjon — Helm Deployment i Tjenesteeiers AKS-klynge',
      titleEn: 'Altinn 3 Application — Helm Values for Tenant AKS Cluster',
      filename: 'values.yaml',
      description:
        'Tjenesteeiere bygger og ruller ut sine Altinn-applikasjoner som containere fra Altinn Studio til sin dedikerte AKS-klynge.',
      descriptionEn:
        'Service owners build and deploy Altinn applications as containers from Altinn Studio to their dedicated AKS cluster.',
      code: `replicaCount: 2
image:
  repository: altinn3.azurecr.io/skd/formueskatt-melding
  tag: "2026.04.1"
  pullPolicy: IfNotPresent
ingress:
  enabled: true
  path: /skd/formueskatt-melding
platform:
  authentication:
    endpoint: https://platform.altinn.no/authentication/api/v1/
  storage:
    endpoint: https://platform.altinn.no/storage/api/v1/
  events:
    endpoint: https://platform.altinn.no/events/api/v1/
opentelemetry:
  enabled: true`,
    },
    capabilities: [
      {
        id: 'altinn-studio',
        title: 'Altinn Studio — Lavkode og Full Kodefrihet',
        titleEn: 'Altinn Studio — Low-Code & Pro-Code Workflow',
        category: 'dx',
        maturity: 'production',
        selfService: true,
        description:
          'Kombinerer et visuelt verktøy i nettleseren for skjemautvikling, datamodellering og tilgangsregler med full Gitea/Git-arbeidsflyt i C#/.NET og React.',
        descriptionEn:
          'Combines a visual browser studio for forms, data models, and authorization rules with a full Git workflow in C#/.NET and React.',
        highlights: [
          'Tverrfaglig samarbeid mellom fagpersoner, jurister, designere og utviklere i samme repo',
          'Ett-klikks utrulling fra Altinn Studio til test- (TT02) og produksjonsmiljø',
          'Integrert bruk av Norges felles Designsystem (designsystemet.no)',
        ],
      },
      {
        id: 'isolated-aks',
        title: 'Isolerte Kubernetes-klynger per Tjenesteeier',
        titleEn: 'Isolated Kubernetes Clusters per Service Owner',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Hver offentlig virksomhet får sin egen isolerte Azure Kubernetes Service (AKS)-klynge provisjonert med Terraform og Helm, mens Digdir drifter felles plattformtjenester.',
        descriptionEn:
          'Each public agency gets its own isolated Azure Kubernetes Service (AKS) cluster provisioned via Terraform and Helm.',
        highlights: [
          'Sterk tenant-isolasjon mellom ulike offentlige etater',
          'Sentralt forvaltede plattformtjenester for lagring, autentisering, autorisasjon (XACML/Rego) og hendelser',
        ],
      },
      {
        id: 'national-trust',
        title: 'Innebygd Integrasjon med Nasjonale Fellesløsninger',
        titleEn: 'Built-in National Trust & Identity Integrations',
        category: 'security',
        maturity: 'production',
        selfService: true,
        description:
          'Ferdig integrert med ID-porten, Maskinporten, Ansattporten, Altinn Autorisasjon, Dialogporten, Skyporten og kommende EU Digital Identity Wallet (EIDAS 2.0).',
        descriptionEn:
          'Pre-integrated with ID-porten, Maskinporten, Ansattporten, Dialogporten, Skyporten, and the upcoming EU Digital Identity Wallet.',
        highlights: [
          'Delegerbar tilgangsstyring basert på roller og rettigheter fra Enhetsregisteret og Folkeregisteret',
          'Hendelsesdrevet arkitektur med CloudEvents via Altinn Events og Dialogporten',
        ],
      },
      {
        id: 'observability-azure',
        title: 'Telemetri med OpenTelemetry, Prometheus & Azure Monitor',
        titleEn: 'Telemetry with OpenTelemetry, Prometheus & Azure Monitor',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Tjenesteeiere kan eksportere OpenTelemetry-sporing, metrikker og logger fra sine Altinn-applikasjoner til både egne overvåkingsverktøy og Azure Monitor.',
        descriptionEn:
          'Service owners can export OpenTelemetry traces, metrics, and logs from their Altinn apps to their own observability stack.',
        highlights: [
          'Innebygd OpenTelemetry-instrumentering i Altinn App-malen (.NET)',
          'Prometheus og Grafana for klyngeovervåking i AKS',
        ],
      },
      {
        id: 'ai-building-blocks',
        title: 'Felles KI-byggeklosser & Åpen Deling i Forvaltningen',
        titleEn: 'Shared AI Building Blocks & Governance',
        category: 'ai',
        maturity: 'beta',
        selfService: true,
        description:
          'Digdir tilrettelegger for ansvarlig bruk av kunstig intelligens gjennom felles byggeklosser, veiledning, sandkasser og åpen kildekode på tvers av offentlig sektor.',
        descriptionEn:
          'Digdir enables responsible AI across the public sector through shared building blocks, regulatory guidance, and open-source tooling.',
        highlights: [
          'Felles komponenter, styring og erfaringsdeling for KI i offentlig sektor',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Kjører felles plattformkomponenter og dedikerte AKS-klynger for hver av de 60+ tjenesteeierne.',
        usageEn:
          'Runs shared platform services and dedicated AKS clusters for 60+ public sector service owners.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/Altinn/altinn-studio',
        sinceYear: 2018,
      },
      {
        name: 'Helm',
        tier: 'Graduated',
        category: 'Platform & App Definition',
        usage:
          'Standard pakkeformat for utrulling av Altinn-applikasjoner og plattformtjenester i AKS.',
        usageEn:
          'Standard packaging format for deploying Altinn apps and platform components.',
        cncfUrl: 'https://www.cncf.io/projects/helm/',
        sinceYear: 2019,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Innsamling av klynge- og applikasjonsmetrikker i AKS.',
        usageEn: 'Cluster and application metrics collection in AKS.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2019,
      },
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage:
          'Standardisert telemetri og distribuert sporing i .NET-mikrotjenester og Altinn-applikasjoner.',
        usageEn:
          'Standardized telemetry and distributed tracing in .NET microservices and Altinn apps.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
      {
        name: 'Envoy',
        tier: 'Graduated',
        category: 'Networking & Service Mesh',
        usage: 'API-ruting og trafikkstyring i plattformens ingresslag.',
        usageEn:
          'API routing and traffic management in the platform ingress layer.',
        cncfUrl: 'https://www.cncf.io/projects/envoy/',
        sinceYear: 2020,
      },
    ],
    techStack: [
      {
        category: 'Plattform & Infrastruktur',
        categoryEn: 'Platform & Infrastructure',
        items: [
          'Azure Kubernetes Service (AKS)',
          'Terraform',
          'Helm',
          'Gitea',
          'GitHub Actions / Azure DevOps',
          'PostgreSQL / Azure Cosmos DB',
        ],
      },
      {
        category: 'Applikasjon & Fellesløsninger',
        categoryEn: 'Application & National Services',
        items: [
          '.NET / C#',
          'React & Designsystemet',
          'ID-porten & Maskinporten',
          'Dialogporten & Altinn Events (CloudEvents)',
          'OpenTelemetry & Grafana',
        ],
      },
    ],
    team: [
      {
        name: 'Jørgen Binningsbø',
        role: 'Arkitekt, Nasjonale Fellesløsninger & Digital Lommebok',
        roleEn: 'Architect, National Trust Services & Digital Wallet',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U013XSE9RJB',
      },
      {
        name: 'Aamund Bremer',
        role: 'Sikkerhets- og Identitetsarkitekt',
        roleEn: 'Security & Identity Architect',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U954ML3PW',
      },
      {
        name: 'Adi Dahl',
        role: 'KI & Plattformutvikling',
        roleEn: 'AI & Platform Engineering',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U0A7GQSAFV4',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'Altinn Studio Dokumentasjon',
        description:
          'Offisiell dokumentasjon for Altinn 3, Altinn Studio og felleskomponenter.',
        url: 'https://docs.altinn.studio',
        type: 'docs',
      },
      {
        title: 'github.com/Altinn',
        description:
          'Åpen kildekode for Altinn Studio, Altinn Platform, Dialogporten og app-maler.',
        url: 'https://github.com/Altinn',
        type: 'github',
      },
      {
        title: 'github.com/digdir',
        description:
          'Digdirs øvrige åpne prosjekter inkludert Designsystemet og fellesløsninger.',
        url: 'https://github.com/digdir',
        type: 'github',
      },
      {
        title: 'Jobb i Digdir',
        description: 'Se ledige stillinger i Digitaliseringsdirektoratet.',
        url: 'https://www.digdir.no/om-oss/jobb-i-digdir/1392',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'telenor',
    visibility: 'internal',
    platformAccess: 'internal',
    platformName: 'Nova',
    platformDescription:
      'Nova er Telenors interne sky- og utviklerplattform som erstatter manuelle bestillingsporter med selvbetjent Kubernetes, deklarative ressursgrafer med Kro og dataplattform som kode.',
    platformHref: '',
    platformLabel: '',
    platformLogo: '/platforms/nova.png',
    theme: {
      accentColor: 'indigo',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Fra manuelle tollporter og byråkrati til ekte selvbetjening, Cloud Native og KI-agenter i stor skala.',
    taglineEn:
      'From manual tollgates and bureaucracy to self-service cloud-native platforms and AI agents at scale.',
    about:
      'Nova er Telenors interne utviklerplattform som understøtter hundrevis av utviklere på tvers av Telenor Norge og Norden. Gjennom en produktorientert tilnærming ("Pick, Pay, Push") tilbyr plattformen selvbetjent tilgang til Kubernetes- og skyinfrastruktur, deklarative høynivå-abstraksjoner via Kro (Kubernetes Resource Orchestrator), Data as Code med dbt, samt tilrettelegging for over 500 utviklere som benytter KI-kodeagenter i det daglige.',
    aboutEn:
      'Nova is Telenor’s internal developer platform supporting hundreds of engineers across Telenor Norway and the Nordics with self-service Kubernetes, Kro abstractions, dbt data pipelines, and AI coding agents at scale.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: [
      'Amazon Web Services (EKS)',
      'Google Cloud Platform (GKE)',
      'On-prem (Kubernetes)',
    ],
    stats: [
      {
        label: 'Utviklere med KI-agenter',
        labelEn: 'Engineers with AI agents',
        value: '500+',
        detail: 'Systematisk utrulling og erfaringsdeling på tvers av Telenor',
      },
      {
        label: 'Selvbetjeningsmodell',
        labelEn: 'Self-service model',
        value: 'Pick, Pay, Push',
        detail: 'Fra manuelle bestillingsporter til produktorientert plattform',
      },
      {
        label: 'Abstraksjonslag',
        labelEn: 'Abstraction layer',
        value: 'Kro & K8s',
        detail:
          'Deklarative ressursgrafer med Kubernetes Resource Orchestrator',
      },
      {
        label: 'Dataplattform',
        labelEn: 'Data platform',
        value: 'Data as Code',
        detail: 'Standardiserte dataprodukter bygget med dbt',
      },
    ],
    manifestExample: {
      title: 'Deklarativ Applikasjonsressurs via Kro (ResourceGraphDefinition)',
      titleEn: 'Declarative Application via Kro (ResourceGraphDefinition)',
      filename: 'nova-service.yaml',
      description:
        'Ved hjelp av Kro (Kubernetes Resource Orchestrator) eksponerer plattformen skreddersydde, brukervennlige API-er som kompileres til underliggende Kubernetes- og skyressurser.',
      descriptionEn:
        'Using Kro (Kubernetes Resource Orchestrator), the platform exposes ergonomic APIs that compile into underlying Kubernetes and cloud resources.',
      code: `apiVersion: nova.telenor.no/v1alpha1
kind: WebService
metadata:
  name: abonnement-api
  namespace: mobile-core
spec:
  image: registry.telenor.no/mobile/abonnement-api:1.42.0
  port: 8080
  scaling:
    minReplicas: 2
    maxReplicas: 8
  ingress:
    enabled: true
    host: abonnement.internal.telenor.no
  observability:
    otelEnabled: true`,
    },
    capabilities: [
      {
        id: 'kro-abstractions',
        title: 'Forenklet Utvikleropplevelse med Kro',
        titleEn: 'Ergonomic Developer Experience with Kro',
        category: 'dx',
        maturity: 'production',
        selfService: true,
        description:
          'Bruker Kubernetes Resource Orchestrator (Kro) til å samle komplekse sett av Kubernetes- og skyressurser bak enkle, typesikre Custom Resources.',
        descriptionEn:
          'Uses Kubernetes Resource Orchestrator (Kro) to compose complex Kubernetes and cloud resources behind simple Custom Resources.',
        highlights: [
          'Reduserer kognitivt trykk for produktteamene uten å låse dem ute fra Kubernetes-API-et',
          'Standardiserte sikkerhets- og nettverksinnstillinger bakt inn i ressursgrafene',
        ],
      },
      {
        id: 'self-service-portal',
        title: 'Produktdrevet Selvbetjening (Pick, Pay, Push)',
        titleEn: 'Product-Driven Self-Service (Pick, Pay, Push)',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Erstattet tradisjonelle manuelle bestillingsløp og siloer med selvbetjent provisjonering av kjøremiljøer, tilganger og CI/CD.',
        descriptionEn:
          'Replaced traditional manual ticket queues and tollgates with self-service provisioning of runtimes, access, and CI/CD.',
        highlights: [
          'Autonome team som eier hele livssyklusen fra kode til produksjon',
          'Selvbetjent bestilling av infrastruktur via deklarative API-er',
        ],
      },
      {
        id: 'data-as-code',
        title: 'Data as Code med dbt',
        titleEn: 'Data as Code with dbt',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Moderne dataplattformpraksis hvor datatransformasjoner, datakvalitetstester, dokumentasjon og avhengighetsgrafer versjonskontrolleres som kode med dbt.',
        descriptionEn:
          'Modern data platform practices where transformations, data quality tests, and lineage are version-controlled as code using dbt.',
        highlights: [
          'Innebygd testing, versjonskontroll og CI/CD for dataprodukter',
          'Tydelig eierskap og reproduserbare datapipelines',
        ],
      },
      {
        id: 'ai-agents-scale',
        title: 'KI-kodeagenter for 500+ Utviklere',
        titleEn: 'AI Coding Agents for 500+ Engineers',
        category: 'ai',
        maturity: 'production',
        selfService: true,
        description:
          'Bred utrulling og kontinuerlig erfaringsmåling av KI-kodeagenter for over 500 utviklere i Telenor.',
        descriptionEn:
          'Broad rollout and continuous evaluation of AI coding agents across 500+ engineers at Telenor.',
        highlights: [
          'Praktisk læring om hva som gir reell kvalitets- og hastighetsgevinst i store kodebaser',
          'Felles retningslinjer og sikkerhetsrammer for agentisk utvikling',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Felles applikasjonskjøremiljø på tvers av sky og egne datasentre, utvidet med Kro.',
        usageEn:
          'Unified application runtime across cloud and on-prem data centers, extended with Kro.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sinceYear: 2018,
      },
      {
        name: 'Argo CD',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage: 'GitOps-basert leveranse av plattform og applikasjoner.',
        usageEn: 'GitOps delivery for platform services and workloads.',
        cncfUrl: 'https://www.cncf.io/projects/argo/',
        sinceYear: 2021,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Metrikker og overvåking på tvers av plattformmiljøer.',
        usageEn: 'Metrics and monitoring across platform environments.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2018,
      },
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage: 'Standardisert innsamling av traces, metrikker og logger.',
        usageEn: 'Standardized collection of traces, metrics, and logs.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
      {
        name: 'Backstage',
        tier: 'Incubating',
        category: 'Platform & App Definition',
        usage: 'Utviklerportal og tjenestekatalog for selvbetjening.',
        usageEn: 'Developer portal and service catalog for self-service.',
        cncfUrl: 'https://www.cncf.io/projects/backstage/',
        sinceYear: 2022,
      },
    ],
    techStack: [
      {
        category: 'Plattform & Orkestrering',
        categoryEn: 'Platform & Orchestration',
        items: [
          'Kubernetes',
          'Kro (Kubernetes Resource Orchestrator)',
          'Argo CD',
          'Backstage',
          'Terraform',
        ],
      },
      {
        category: 'Data, Observability & KI',
        categoryEn: 'Data, Observability & AI',
        items: [
          'dbt (Data Build Tool)',
          'Prometheus & Grafana',
          'OpenTelemetry',
          'GitHub Actions',
          'AI Coding Agents',
        ],
      },
    ],
    team: [
      {
        name: 'Martin Bergo',
        role: 'Plattformleder',
        roleEn: 'Head of Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U088MG9KPEE',
      },
      {
        name: 'Mats Bækkelund',
        role: 'Plattformarkitekt',
        roleEn: 'Platform Architect',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U04QQLQ7KK8',
      },
      {
        name: 'Eline Henriksen',
        role: 'Plattformutvikler, Developer Experience & Kro',
        roleEn: 'Platform Engineer, Developer Experience & Kro',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U02SG8873PC',
      },
      {
        name: 'Olivier Cloux',
        role: 'Plattformarkitekt, Selvbetjening',
        roleEn: 'Platform Architect, Self-Service',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U05S4LR1S5P',
      },
      {
        name: 'Anders Elton',
        role: 'Data & Plattformarkitekt',
        roleEn: 'Data & Platform Architect',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U09JC8B7FUK',
      },
      {
        name: 'Sindre Lindstad',
        role: 'Plattformprodukt & Selvbetjening',
        roleEn: 'Platform Product & Self-Service',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UUHH03WPK',
      },
      {
        name: 'Frode Bjerkenes',
        role: 'Sky- og Plattformledelse',
        roleEn: 'Cloud & Platform Leadership',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U7CK184RJ',
      },
      {
        name: 'Ronny Pettersen',
        role: 'DevOps Plattform',
        roleEn: 'DevOps Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UMPEMQ4KW',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'github.com/telenornorway',
        description: 'Telenor Norges åpne prosjekter på GitHub.',
        url: 'https://github.com/telenornorway',
        type: 'github',
      },
      {
        title: 'Karriere i Telenor',
        description: 'Utforsk teknologi- og plattformstillinger i Telenor.',
        url: 'https://www.telenor.com/careers/',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'nhn',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'ROR (Release Operate Report)',
    platformDescription:
      'ROR er Norsk Helsenetts egenutviklede åpen kildekode-plattform for selvbetjent utrulling, drift og observerbarhet av 140+ standardiserte Kubernetes-klynger i helsesektoren.',
    platformHref: 'https://github.com/NorskHelsenett/ror',
    platformLabel: 'github.com/NorskHelsenett/ror',
    theme: {
      accentColor: 'teal',
      heroStyle: 'grid',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Selvbetjent multi-cluster Kubernetes-styring og observability for 140+ klynger i nasjonal e-helse.',
    taglineEn:
      'Self-service multi-cluster Kubernetes management and observability for 140+ clusters in national e-health.',
    about:
      'Norsk Helsenett (NHN) leverer og drifter nasjonal digital infrastruktur for helse- og omsorgssektoren. For å la utviklings- og driftsteam selv deploye, drifte og observere standardiserte Kubernetes-klynger med organisasjonens sikkerhets- og driftsverktøy, har NHN bygget og åpen-kildekodet ROR (Release – Operate – Report) — kombinert med en dedikert Observability-plattform for alle leveranseteam.',
    aboutEn:
      'Norsk Helsenett built and open-sourced ROR (Release – Operate – Report) to enable engineering and operations teams across the Norwegian healthcare sector to provision, operate, and observe 140+ standardized Kubernetes clusters.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: [
      'On-prem (Norsk Helsenett Datasenter)',
      'Hybrid Sky (Kubernetes)',
    ],
    stats: [
      {
        label: 'Kubernetes-klynger',
        labelEn: 'Kubernetes clusters',
        value: '140+',
        detail: 'Standardiserte klynger administrert gjennom ROR',
      },
      {
        label: 'Kildekode',
        labelEn: 'Source code',
        value: 'Open Source',
        detail: 'Utviklet åpent på github.com/NorskHelsenett/ror',
      },
      {
        label: 'Arkitektur',
        labelEn: 'Architecture',
        value: 'Multi-Cluster',
        detail: 'Leverandøruavhengig kontrollplan i Go og React',
      },
      {
        label: 'Samfunnsoppdrag',
        labelEn: 'Mission',
        value: 'Nasjonal e-helse',
        detail: 'Sikker plattform for helsetjenesten i Norge',
      },
    ],
    capabilities: [
      {
        id: 'ror-multicluster',
        title: 'Selvbetjent Multi-Cluster Livssyklus (ROR)',
        titleEn: 'Self-Service Multi-Cluster Lifecycle (ROR)',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'ROR lar utviklings- og driftsteam opprette, oppgradere og observere over 140 standardiserte Kubernetes-klynger med ferdig oppsatt sikkerhet og verktøystøtte.',
        descriptionEn:
          'ROR enables teams to provision, upgrade, and observe 140+ standardized Kubernetes clusters with pre-configured security and tooling.',
        highlights: [
          'Sentral oversikt over klyngetilstand, ressursbruk, versjoner og etterlevelse',
          'Agent-basert rapportering fra klynger til ROR API via meldingskø',
          'Fullt åpen kildekode på github.com/NorskHelsenett/ror',
        ],
      },
      {
        id: 'nhn-observability',
        title: 'NHNs Observability-plattform for Leveranseteam',
        titleEn: 'NHN Observability Platform for Delivery Teams',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Sentralisert observability-stack som gir leveranseteam ferdig oppsatt innsamling av metrikker, logger og sporing på tvers av dynamiske helsesystemer.',
        descriptionEn:
          'Centralized observability stack providing delivery teams with metrics, logs, and traces across dynamic healthcare systems.',
        highlights: [
          'Prometheus og Grafana med avansert PromQL-analyse for dynamiske systemer',
          'OpenTelemetry-instrumentering i ROR og helseapplikasjoner',
        ],
      },
      {
        id: 'gitops-standard',
        title: 'Standardisert GitOps & Verktøypakke',
        titleEn: 'Standardized GitOps & Tooling Bundle',
        category: 'cicd',
        maturity: 'production',
        selfService: true,
        description:
          'Automatisk utrulling av NHNs standardiserte sikkerhets-, nettverks- og overvåkingskomponenter til alle opprettede klynger.',
        descriptionEn:
          'Automated rollout of NHN’s standardized security, networking, and monitoring components to every cluster.',
        highlights: [
          'Deklarativ styring med Argo CD og Helm',
          'Reengineering av containerplattformen basert på åpne CNCF-standarder',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          '140+ standardiserte Kubernetes-klynger administrert og observert gjennom ROR.',
        usageEn:
          '140+ standardized Kubernetes clusters managed and observed via ROR.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/NorskHelsenett/ror',
        sinceYear: 2020,
      },
      {
        name: 'Argo CD',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'GitOps-synkronisering av standard klyngekomponenter og applikasjoner.',
        usageEn:
          'GitOps synchronization of baseline cluster components and applications.',
        cncfUrl: 'https://www.cncf.io/projects/argo/',
        sinceYear: 2021,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage:
          'Kjerne i NHNs observability-plattform for metrikker og dynamisk monitorering.',
        usageEn:
          'Core of NHN’s observability platform for metrics and dynamic monitoring.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2020,
      },
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage:
          'Distribuert sporing og telemetri i ROR-økosystemet og helsetjenester.',
        usageEn:
          'Distributed tracing and telemetry across the ROR ecosystem and healthcare services.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
      {
        name: 'Helm',
        tier: 'Graduated',
        category: 'Platform & App Definition',
        usage: 'Pakking og distribusjon av plattformtjenester til klyngene.',
        usageEn: 'Packaging and distribution of platform services to clusters.',
        cncfUrl: 'https://www.cncf.io/projects/helm/',
        sinceYear: 2020,
      },
    ],
    techStack: [
      {
        category: 'ROR Kontrollplan & Kjøremiljø',
        categoryEn: 'ROR Control Plane & Runtime',
        items: [
          'Kubernetes',
          'Go (ROR API & Agents)',
          'React / TypeScript (ROR Web)',
          'Argo CD',
          'MongoDB & RabbitMQ',
          'Redis / Valkey',
        ],
      },
      {
        category: 'Observability & Sikkerhet',
        categoryEn: 'Observability & Security',
        items: [
          'Prometheus',
          'Grafana',
          'OpenTelemetry',
          'Helm',
          'OIDC / OAuth2',
        ],
      },
    ],
    team: [
      {
        name: 'Håvard Elnan',
        role: 'Plattformarkitekt, ROR & Containerplattform',
        roleEn: 'Platform Architect, ROR & Container Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UU4T4283X',
      },
      {
        name: 'Simon Randby',
        role: 'Plattformutvikler, Observability Plattform',
        roleEn: 'Platform Engineer, Observability Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U07HHSZ419N',
      },
      {
        name: 'Juan Piola Sanchez',
        role: 'Plattformutvikler, Monitorering & Observability',
        roleEn: 'Platform Engineer, Monitoring & Observability',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U073L9NGN2Y',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'github.com/NorskHelsenett/ror',
        description:
          'Åpen kildekode for ROR (Release Operate Report) på GitHub.',
        url: 'https://github.com/NorskHelsenett/ror',
        type: 'github',
      },
      {
        title: 'Karriere i Norsk Helsenett',
        description: 'Bli med å utvikle nasjonal e-helseinfrastruktur.',
        url: 'https://www.nhn.no/om-oss/karriere',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'ssb',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Dapla & Nais i SSB',
    platformDescription:
      'Statistisk sentralbyrå (SSB) kombinerer den skybaserte dataplattformen Dapla (med Onyxia på Kubernetes) og Nais as a Service (NaaS) på Google Cloud Platform.',
    platformHref: 'https://manual.dapla.ssb.no',
    platformLabel: 'manual.dapla.ssb.no',
    theme: {
      accentColor: 'emerald',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Åpen skybasert dataplattform med Onyxia og gjenbruk av Nais for moderne offisiell statistikkproduksjon.',
    taglineEn:
      'Open cloud data platform with Onyxia and shared Nais application platform for official statistics.',
    about:
      'Statistisk sentralbyrå (SSB) har bygget den skybaserte dataplattformen Dapla på Google Cloud Platform for å modernisere produksjonen av offisiell statistikk med Python og R. I Dapla bruker SSB den åpne tjenesteplattformen Onyxia (utviklet av det franske statistikkbyrået INSEE) på Kubernetes til å tilby containerbaserte arbeidsflater som Jupyter, RStudio, VS Code og MLFlow. På applikasjonssiden har SSB tatt i bruk Nais (NaaS) i samarbeid med Nav — et forbildeeksempel på plattformdeling i norsk offentlig sektor.',
    aboutEn:
      'Statistics Norway (SSB) combines its cloud-native data platform Dapla (running Onyxia workspaces on Kubernetes in GCP) with Nais as a Service (NaaS) shared with Nav.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Google Cloud Platform (GCP)'],
    stats: [
      {
        label: 'Plattformdeling',
        labelEn: 'Platform sharing',
        value: 'Dapla + Nais',
        detail: 'Kombinerer egen dataplattform med Nais as a Service (NaaS)',
      },
      {
        label: 'Arbeidsflater',
        labelEn: 'Data workspaces',
        value: 'Onyxia',
        detail: 'Jupyter, RStudio, VS Code og MLFlow som containere på K8s',
      },
      {
        label: 'Skyleverandør',
        labelEn: 'Cloud provider',
        value: '100% GCP',
        detail: 'Helhetlig data- og applikasjonsarkitektur i Google Cloud',
      },
      {
        label: 'Kildekode',
        labelEn: 'Open Source',
        value: 'GitHub & INSEE',
        detail: 'Internasjonalt open source-samarbeid med INSEE (Frankrike)',
      },
    ],
    capabilities: [
      {
        id: 'onyxia-workspaces',
        title: 'Selvbetjente Analysearbeidsflater med Onyxia',
        titleEn: 'Self-Service Data Workspaces with Onyxia',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Onyxia bygger på åpne standarder som Kubernetes, Helm og OIDC, og lar statistikere og data scientists starte ferdigkonfigurerte containermiljøer (Jupyter, RStudio, VS Code, MLFlow) på sekunder.',
        descriptionEn:
          'Built on Kubernetes, Helm, and OIDC, Onyxia lets statisticians and data scientists launch containerized Jupyter, RStudio, VS Code, and MLFlow workspaces in seconds.',
        highlights: [
          'Sømløs OIDC-autentisering og automatisk tilkobling til teamets GCP-lagring',
          'Gjenbruk og bidrag tilbake til det åpne Onyxia-prosjektet fra INSEE',
        ],
      },
      {
        id: 'nais-integration',
        title: 'Gjenbruk av Nais som Applikasjonsplattform (NaaS)',
        titleEn: 'Reusing Nais as Application Platform (NaaS)',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'SSB bruker Nais for å gi sine applikasjonsutviklere en felles, selvbetjent plattform på GCP uten å måtte utvikle og vedlikeholde en egen applikasjonsoperator fra bunnen av.',
        descriptionEn:
          'SSB uses Nais on GCP to provide application developers with a standardized self-service platform through cross-agency collaboration.',
        highlights: [
          'Deklarativ utrulling med nais.yaml, Nais Console og innebygd Zero Trust',
          'Betydelig redusert forvaltningsbyrde gjennom deling på tvers av etater',
        ],
      },
      {
        id: 'dapla-data-governance',
        title: 'Sikker Datadeling & Tilgangsstyring i Dapla',
        titleEn: 'Secure Data Sharing & Governance in Dapla',
        category: 'security',
        maturity: 'production',
        selfService: true,
        description:
          'Team-basert organisering og automatisert tilgangsstyring til kildedata, klargjorte data og statistikkprodukter i Google Cloud Storage og BigQuery.',
        descriptionEn:
          'Team-based organization and automated access control for statistical datasets in Google Cloud Storage and BigQuery.',
        highlights: [
          'Standardisert lagring på åpne Parquet-formater med Dapla-verktøypakken for Python og R',
          'Streng verdivurdering og isolasjon av person- og bedriftsdata',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Kjører både Onyxia-analysearbeidsflater i Dapla og mikrotjenester via Nais på GKE.',
        usageEn:
          'Runs both Onyxia analytics workspaces in Dapla and microservices via Nais on GKE.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/statisticsnorway',
        sinceYear: 2018,
      },
      {
        name: 'Helm',
        tier: 'Graduated',
        category: 'Platform & App Definition',
        usage:
          'Brukes av Onyxia-katalogen til å starte interaktive analysecontainere på Kubernetes.',
        usageEn:
          'Used by the Onyxia catalog to provision interactive analytics containers on Kubernetes.',
        cncfUrl: 'https://www.cncf.io/projects/helm/',
        sinceYear: 2021,
      },
      {
        name: 'Argo CD',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage: 'GitOps-utrulling av plattformtjenester i Dapla.',
        usageEn: 'GitOps deployment of platform services in Dapla.',
        cncfUrl: 'https://www.cncf.io/projects/argo/',
        sinceYear: 2021,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Overvåking av klynger, arbeidsflater og tjenester.',
        usageEn: 'Monitoring of clusters, workspaces, and services.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2019,
      },
    ],
    techStack: [
      {
        category: 'Dataplattform (Dapla)',
        categoryEn: 'Data Platform (Dapla)',
        items: [
          'Onyxia (Kubernetes + Helm + OIDC)',
          'Google Cloud Storage & BigQuery',
          'Apache Parquet',
          'JupyterLab / RStudio / VS Code',
          'Python & R (dapla-toolbelt)',
        ],
      },
      {
        category: 'Applikasjonsplattform',
        categoryEn: 'Application Platform',
        items: [
          'Nais (NaaS på GKE)',
          'Terraform',
          'Argo CD / Flux',
          'GitHub Actions',
        ],
      },
    ],
    team: [
      {
        name: 'John Kasper Svergja',
        role: 'Plattformarkitekt, Nais i SSB',
        roleEn: 'Platform Architect, Nais at SSB',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UJJURGQQ1',
      },
      {
        name: 'Øyvind Bruer-Skarsbø',
        role: 'Plattformutvikler, Dapla & Onyxia',
        roleEn: 'Platform Engineer, Dapla & Onyxia',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U04GNLAUPHN',
      },
      {
        name: 'Christian Thindberg',
        role: 'Plattform- og Dataplattformledelse',
        roleEn: 'Platform & Data Platform Leadership',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UE8RCCZHU',
      },
      {
        name: 'Trygve Falch',
        role: 'Plattformarkitekt',
        roleEn: 'Platform Architect',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U52KRMN86',
      },
      {
        name: 'Lars-Roger Billingsø',
        role: 'Plattformarkitekt',
        roleEn: 'Platform Architect',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U060EL496LS',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'Dapla-manualen',
        description:
          'SSBs åpne brukerdokumentasjon for Dapla, Onyxia og skybasert statistikkproduksjon.',
        url: 'https://manual.dapla.ssb.no',
        type: 'docs',
      },
      {
        title: 'github.com/statisticsnorway',
        description:
          'SSBs åpne kildekode-prosjekter og Dapla-verktøy på GitHub.',
        url: 'https://github.com/statisticsnorway',
        type: 'github',
      },
      {
        title: 'Ledige stillinger i SSB',
        description: 'Jobb med data, plattform og samfunnskritisk statistikk.',
        url: 'https://www.ssb.no/omssb/jobb-i-ssb',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'politiet',
    visibility: 'internal',
    platformAccess: 'internal',
    platformName: 'PIT Applikasjons- og Dataplattform',
    platformDescription:
      'Politiets IT-enhet (PIT) bygger og forvalter felles Kubernetes-applikasjonsplattform og selvbetjent dataplattform som gir autonome produktteam fart, flyt og innebygd sikkerhet.',
    platformHref: '',
    platformLabel: '',
    theme: {
      accentColor: 'blue',
      heroStyle: 'grid',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Fart og flyt for autonome produktteam i politiet med Kubernetes, SRE/SLO-styring og selvbetjent dataplattform.',
    taglineEn:
      'Velocity and reliability for autonomous product teams in the Norwegian Police with Kubernetes, SRE/SLOs, and a self-service data platform.',
    about:
      'Politiets IT-enhet (PIT) organiserer utviklingen rundt autonome produktteam med et tydelig shift-left-ansvar. For at teamene skal kunne levere samfunnskritiske polititjenester uten å bygge tung infrastruktur selv, tilbyr PIT felles container- og applikasjonsplattform på Kubernetes, praktisk SRE-verktøystøtte med Prometheus og Pyrra for SLO-styring, samt en moderne dataplattform som skalerer datadeling på tvers av etaten.',
    aboutEn:
      'The Norwegian Police IT Unit (PIT) empowers autonomous product teams with a shared Kubernetes application platform, SRE tooling using Prometheus and Pyrra for SLOs, and a self-service data platform.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['On-prem (Kubernetes / OpenShift)', 'Hybrid Sky'],
    stats: [
      {
        label: 'Teammodell',
        labelEn: 'Team topology',
        value: 'Autonome team',
        detail: 'Shift-left støttet av felles applikasjons- og dataplattform',
      },
      {
        label: 'SRE & Pålitelighet',
        labelEn: 'SRE & Reliability',
        value: 'Pyrra & SLO',
        detail: 'Deklarative Service Level Objectives på toppen av Prometheus',
      },
      {
        label: 'Leveransemodell',
        labelEn: 'Delivery model',
        value: 'GitOps',
        detail: 'Kontinuerlige leveranser til samfunnskritisk infrastruktur',
      },
    ],
    capabilities: [
      {
        id: 'pit-container-platform',
        title: 'Sikker Kubernetes-plattform for Autonome Produktteam',
        titleEn: 'Secure Kubernetes Platform for Autonomous Teams',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Standardisert containerplattform som lar produktteam rulle ut og drifte tjenester med innebygd nettverksisolasjon, tilgangsstyring og kontinuerlige leveranser.',
        descriptionEn:
          'Standardized container platform enabling product teams to deploy and run services with built-in isolation and continuous delivery.',
        highlights: [
          'Reduserer kognitiv belastning ved shift-left i autonome produktteam',
          'Tilpasset politiets strenge sikkerhets- og tilgjengelighetskrav',
        ],
      },
      {
        id: 'sre-pyrra',
        title: 'Praktisk SRE & SLO-styring med Pyrra og Prometheus',
        titleEn: 'Practical SRE & SLO Management with Pyrra and Prometheus',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Deklarativ definisjon av Service Level Objectives (SLO) og feilbudsjetter ved hjelp av Pyrra og Prometheus for målbar tjenestekvalitet.',
        descriptionEn:
          'Declarative Service Level Objectives (SLOs) and error budgets powered by Pyrra and Prometheus.',
        highlights: [
          'Lav terskel for produktteam til å definere tilgjengelighets- og responstidsmål',
          'Automatisk generering av burn-rate-varsler og oversiktsdashboards',
        ],
      },
      {
        id: 'pit-data-platform',
        title: 'Selvbetjent Dataplattform for Fart og Flyt',
        titleEn: 'Self-Service Data Platform',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Felles dataplattform som lar produktteam produsere, dele og konsumere data sikkert og skalerbart på tvers av politiets verdikjeder.',
        descriptionEn:
          'Shared data platform enabling product teams to produce, share, and consume data securely across police value streams.',
        highlights: [
          'Skalerer dataforvaltning og datadeling uten at hvert produktteam må bygge egen datainfrastruktur',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Kjerneplattform for containerbaserte applikasjoner og plattformtjenester i PIT.',
        usageEn:
          'Core runtime for containerized applications and platform services at PIT.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/politiet',
        sinceYear: 2018,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Metrikkinnsamling og motor bak SLO-overvåking med Pyrra.',
        usageEn:
          'Metrics collection and engine behind SLO monitoring with Pyrra.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2018,
      },
      {
        name: 'Argo CD',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage: 'GitOps-baserte leveranser til test- og produksjonsmiljøer.',
        usageEn: 'GitOps deployments across test and production environments.',
        cncfUrl: 'https://www.cncf.io/projects/argo/',
        sinceYear: 2021,
      },
    ],
    techStack: [
      {
        category: 'Plattform & SRE',
        categoryEn: 'Platform & SRE',
        items: [
          'Kubernetes / OpenShift',
          'Argo CD',
          'Prometheus',
          'Pyrra (SLO Management)',
          'Grafana',
        ],
      },
      {
        category: 'Data & Utvikling',
        categoryEn: 'Data & Engineering',
        items: ['Apache Kafka', 'Kotlin / Java', 'Python', 'GitOps CI/CD'],
      },
    ],
    team: [
      {
        name: 'Audun Vindenes Egge',
        role: 'Plattformarkitekt, Dataplattform',
        roleEn: 'Platform Architect, Data Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U04P9STKFKK',
      },
      {
        name: 'Erlend Wiig',
        role: 'Plattformutvikler, Dataplattform',
        roleEn: 'Platform Engineer, Data Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U0326RQ5PHB',
      },
      {
        name: 'Magnus Johansen',
        role: 'Plattformutvikler, Observability & SRE',
        roleEn: 'Platform Engineer, Observability & SRE',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U0475103CTS',
      },
      {
        name: 'Peter Bull Hove',
        role: 'Dataplattform',
        roleEn: 'Data Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U09GM8P459C',
      },
      {
        name: 'Kjetil Hårtveit',
        role: 'Politiets IT-enhet',
        roleEn: 'Norwegian Police IT Unit',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U08STG8LJUB',
      },
      {
        name: 'Roger Karlsson',
        role: 'Politiets IT-enhet',
        roleEn: 'Norwegian Police IT Unit',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U51A07M0V',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'github.com/politiet',
        description: 'Politiets IT-enhets åpne prosjekter på GitHub.',
        url: 'https://github.com/politiet',
        type: 'github',
      },
      {
        title: 'Jobb i Politiets IT-enhet (PIT)',
        description: 'Bli med å utvikle samfunnskritiske digitale tjenester.',
        url: 'https://www.politiet.no/om-politiet/jobb-i-politiet/jobb-med-it-i-politiet/',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'oslo',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Origo Utvikler- og Dataplattform',
    platformDescription:
      'Oslo Origo og UKE tilbyr en brolagt sti ("Golden Path") på AWS med Terraform, den åpne dataplattformen okdata og felles kommunal dataplattform for Oslo kommune.',
    platformHref: 'https://github.com/oslokommune',
    platformLabel: 'github.com/oslokommune',
    theme: {
      accentColor: 'indigo',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Fra sentralisert Kubernetes til en løst koblet, AWS-native "brolagt sti" og åpen dataplattform for hovedstaden.',
    taglineEn:
      'From centralized Kubernetes to a loosely coupled, AWS-native paved path and open data platform for the City of Oslo.',
    about:
      'Oslo Origo (Oslo kommunes digitaliseringsetat) tok et bevisst arkitekturvalg om å gå fra en sentralisert Kubernetes-plattform til en AWS-native "brolagt sti" (Golden Path) basert på Terraform og administrerte AWS-tjenester for å gi produktteamene høyere autonomi og lavere operasjonell kompleksitet. Samtidig utvikles dataplattformen okdata som åpen kildekode på GitHub, supplert av Utviklings- og kompetanseetatens (UKE) arbeid med kommunal fellesdata på Microsoft Fabric.',
    aboutEn:
      'Oslo Origo transitioned from centralized Kubernetes to an AWS-native paved path using Terraform and managed AWS services, alongside the open-source okdata data platform and municipal data capabilities.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: [
      'Amazon Web Services (AWS)',
      'Microsoft Fabric (Kommunal fellesdata)',
    ],
    stats: [
      {
        label: 'Arkitekturvalg',
        labelEn: 'Architecture approach',
        value: 'AWS-Native',
        detail: 'Brolagt sti med Terraform fremfor sentralisert Kubernetes-lag',
      },
      {
        label: 'Dataplattform',
        labelEn: 'Data platform',
        value: 'okdata & Fabric',
        detail: 'Åpen kildekode-verktøy (okdata-cli) og kommunal fellesdata',
      },
      {
        label: 'Åpen kildekode',
        labelEn: 'Open Source',
        value: '70+ repoer',
        detail: 'Delte moduler, CLI og komponenter på github.com/oslokommune',
      },
    ],
    capabilities: [
      {
        id: 'paved-path-aws',
        title: 'Brolagt Sti (Golden Path) på AWS',
        titleEn: 'Paved Path (Golden Path) on AWS',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Ferdige Terraform-moduler, CI/CD-arbeidsflyter og automatisert oppsett av isolerte AWS-kontoer som lar autonome produktteam kjøre serverless- og containerarbeidsflater uten sentrale flaskehalser.',
        descriptionEn:
          'Pre-built Terraform modules, CI/CD workflows, and isolated AWS accounts per team for serverless and container workloads.',
        highlights: [
          'Løst koblede produktteam med egne AWS-kontoer og gjenbrukbare maler (golden-path-boilerplate)',
          'Redusert vedlikeholdsbyrde etter overgang fra egenforvaltet Kubernetes til AWS-native tjenester',
        ],
      },
      {
        id: 'okdata-platform',
        title: 'okdata — Åpen Dataplattform & CLI',
        titleEn: 'okdata — Open Data Platform & CLI',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Åpen kildekode dataplattform og CLI (okdata-cli) for innhenting, validering, tilgangsstyring og deling av datasett i Oslo kommune — kombinert med UKEs fellesdata-plattform på Microsoft Fabric.',
        descriptionEn:
          'Open-source data platform and CLI (okdata-cli) for dataset ingestion, validation, access control, and sharing across the City of Oslo.',
        highlights: [
          'Selvbetjent opplasting og konsumering av datasett via okdata-cli og SDK-er',
          'Felles styresett og arkitektur for en datadrevet kommune',
        ],
      },
      {
        id: 'observability-log',
        title: 'Automatisert Logg- og Telemetrihåndtering',
        titleEn: 'Automated Log & Telemetry Pipeline',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Automatisk abonnement og videresending av logger og metrikker fra AWS CloudWatch og applikasjoner via åpne komponenter som okdata-log-group-subscriber.',
        descriptionEn:
          'Automated log subscription and telemetry forwarding from AWS CloudWatch via okdata-log-group-subscriber.',
        highlights: [
          'Standardisert logging og alarmering ut av boksen for alle nye tjenester',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage:
          'Standardisert sporing og telemetri fra mikrotjenester og serverless-funksjoner.',
        usageEn:
          'Standardized tracing and telemetry across microservices and serverless functions.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Metrikker og overvåking av felleskomponenter.',
        usageEn: 'Metrics and monitoring for shared platform services.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2020,
      },
    ],
    techStack: [
      {
        category: 'Brolagt Sti & Infrastruktur',
        categoryEn: 'Paved Path & Infrastructure',
        items: [
          'AWS (Lambda, ECS, S3, API Gateway, EventBridge)',
          'Terraform',
          'GitHub Actions',
          'Keycloak / OIDC',
        ],
      },
      {
        category: 'Data & Utviklerverktøy',
        categoryEn: 'Data & Developer Tooling',
        items: [
          'okdata-cli & okdata-sdk (Python)',
          'Microsoft Fabric (Fellesdata)',
          'Punktdesignsystemet (Punkt)',
          'OpenTelemetry & CloudWatch',
        ],
      },
    ],
    team: [
      {
        name: 'Endre Midtgård Meckelborg',
        role: 'Plattformarkitekt, Oslo Origo',
        roleEn: 'Platform Architect, Oslo Origo',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U07G8USDNNM',
      },
      {
        name: 'Fredrik Vraalsen',
        role: 'Utvikler & Arkitekt, Oslo kommune',
        roleEn: 'Engineer & Architect, City of Oslo',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UCB71NJE8',
      },
      {
        name: 'Per Kjetil Grotnes',
        role: 'Oslo kommune',
        roleEn: 'City of Oslo',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U6UF56Z0R',
      },
      {
        name: 'Erik Tuv',
        role: 'Arkitekt, Dataplattform UKE',
        roleEn: 'Architect, Data Platform UKE',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U06466106KY',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'github.com/oslokommune',
        description:
          'Oslo kommunes åpne kildekode for okdata, Punkt og golden-path-verktøy.',
        url: 'https://github.com/oslokommune',
        type: 'github',
      },
      {
        title: 'Jobb i Oslo Origo',
        description:
          'Bli med å lage bedre digitale tjenester for innbyggerne i Oslo.',
        url: 'https://www.oslo.kommune.no/etater-foretak-og-ombud/oslo-origo/',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'vy',
    visibility: 'internal',
    platformAccess: 'internal',
    platformName: 'Vy Utviklerplattform',
    platformDescription:
      'Vys AWS-native utviklerplattform støtter over 100 utviklere med et plattformteam på kun to personer gjennom produktfokusert selvbetjening, Terraform og administrerte skytjenester.',
    platformHref: '',
    platformLabel: '',
    theme: {
      accentColor: 'emerald',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Støtter 100+ utviklere med et plattformteam på 2 gjennom AWS-native byggeklosser og produktdrevet selvbetjening.',
    taglineEn:
      'Supporting 100+ developers with a 2-person platform team through AWS-native building blocks and product-minded self-service.',
    about:
      'Vy kjører hele sin produksjon og sin utviklerplattform på Amazon Web Services (AWS). Med over 100 utviklere og kun to personer i utviklerplattformteamet har Vy lykkes ved å behandle plattformen som et produkt: møte utviklerne der de er, gjenbruke administrerte AWS-tjenester fremfor å drifte tung egenutviklet infrastruktur, og legge til rette for ekte "hjelp til selvhjelp" på tvers av alle produktteam.',
    aboutEn:
      'Vy runs its entire production environment and developer platform on AWS, supporting 100+ developers with a 2-person platform team through managed AWS services and product-led self-service.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Amazon Web Services (AWS)'],
    stats: [
      {
        label: 'Utviklere støttet',
        labelEn: 'Supported developers',
        value: '100+',
        detail: 'Produktteam innen tog, buss, kundereise og mobilitet',
      },
      {
        label: 'Plattformteam',
        labelEn: 'Platform team size',
        value: '2 personer',
        detail: 'Høy utveksling via administrerte tjenester og selvbetjening',
      },
      {
        label: 'Skyleverandør',
        labelEn: 'Cloud provider',
        value: '100% AWS',
        detail: 'AWS-native arkitektur med Terraform og GitHub Actions',
      },
    ],
    capabilities: [
      {
        id: 'aws-native-paas',
        title: 'AWS-Native Utviklerplattform',
        titleEn: 'AWS-Native Developer Platform',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Standardiserte AWS-miljøer, nettverk, tilgangsstyring og kjøremiljøer bygget på administrerte AWS-tjenester og gjenbrukbare Terraform-moduler.',
        descriptionEn:
          'Standardized AWS environments, networking, IAM, and runtimes built on managed AWS services and reusable Terraform modules.',
        highlights: [
          'Bevisst valg om å bruke administrerte skytjenester for å holde forvaltningskostnaden minimal',
          'Rask opprettelse av nye miljøer og mikrotjenester uten manuell involvering fra plattformteamet',
        ],
      },
      {
        id: 'product-self-service',
        title: 'Produktdrevet Selvbetjening ("Hjelp til selvhjelp")',
        titleEn: 'Product-Driven Self-Service',
        category: 'dx',
        maturity: 'production',
        selfService: true,
        description:
          'Plattformen utvikles som et internt produkt med kontinuerlig brukerinnsikt, tydelig dokumentasjon og automatiserte arbeidsflyter.',
        descriptionEn:
          'Treats the internal platform as a product with user research, clear documentation, and automated workflows.',
        highlights: [
          'Ingen manuelle bestillingskøer — utviklingsteamene eier og styrer egne ressurser',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage:
          'Distribuert sporing og observabilitet på tvers av mikrotjenester i AWS.',
        usageEn:
          'Distributed tracing and observability across microservices on AWS.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2023,
      },
    ],
    techStack: [
      {
        category: 'Sky & Automatisering',
        categoryEn: 'Cloud & Automation',
        items: [
          'Amazon Web Services (ECS, Lambda, RDS, S3, SQS/SNS)',
          'Terraform',
          'GitHub Actions',
          'OpenTelemetry',
        ],
      },
    ],
    team: [
      {
        name: 'Nicolas Harlem Eide',
        role: 'Plattformutvikler, Vy Utviklerplattform',
        roleEn: 'Platform Engineer, Vy Developer Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U04EKPV8VM2',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'github.com/nsbno',
        description: 'Vys åpne kildekode og designsystem (Spor) på GitHub.',
        url: 'https://github.com/nsbno',
        type: 'github',
      },
      {
        title: 'Jobb med IT og teknologi i Vy',
        description: 'Se ledige stillinger i Vy Utvikling.',
        url: 'https://www.vy.no/om-vy/karriere-i-vy',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'kystverket',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Driftly',
    platformDescription:
      'Driftly er Kystverkets åpne GitOps- og plattformkonsept som kombinerer typesikker konfigurasjon i CUE med Argo CD og Kargo for moderne Kubernetes- og dataplattformdrift.',
    platformHref: 'https://github.com/Kystverket/Driftly',
    platformLabel: 'github.com/Kystverket/Driftly',
    theme: {
      accentColor: 'blue',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Typesikker Kubernetes-konfigurasjon med CUE, Argo CD og Kargo — og skybasert maritim dataplattform.',
    taglineEn:
      'Type-safe Kubernetes configuration with CUE, Argo CD, and Kargo — alongside a cloud-native maritime data platform.',
    about:
      'Kystverket har etablert en moderne skybasert data- og applikasjonsplattform for å støtte samfunnsoppdraget om å gjøre kysten til verdens sikreste og reneste. Gjennom plattformarbeidet utviklet og åpen-kildekodet Kystverket Driftly — et oppsett som erstatter uoversiktlige Helm- og Kustomize-maler med typesikker validering og manifestgenerering i CUE, kombinert med Argo CD for GitOps og Kargo for kontrollert promotering mellom miljøer.',
    aboutEn:
      'The Norwegian Coastal Administration built and open-sourced Driftly, replacing complex Helm and Kustomize templates with type-safe CUE configuration, Argo CD GitOps, and Kargo stage promotion.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Skybasert Kubernetes & Maritim Dataplattform'],
    stats: [
      {
        label: 'Konfigurasjonsspråk',
        labelEn: 'Configuration language',
        value: 'CUE',
        detail: 'Typesikker generering og validering av Kubernetes-manifester',
      },
      {
        label: 'GitOps & Promotering',
        labelEn: 'GitOps & Promotion',
        value: 'Argo CD + Kargo',
        detail: 'Trinnvis, verifisert utrulling mellom miljøer',
      },
      {
        label: 'Kildekode',
        labelEn: 'Source code',
        value: 'Open Source',
        detail: 'Delt åpent på github.com/Kystverket/Driftly',
      },
    ],
    capabilities: [
      {
        id: 'cue-manifests',
        title: 'Typesikker Manifestgenerering med CUE',
        titleEn: 'Type-Safe Manifest Generation with CUE',
        category: 'dx',
        maturity: 'production',
        selfService: true,
        description:
          'Bruker CUE (Configure, Unify, Execute) til å definere skjemaer, regler og applikasjonskonfigurasjon som kompileres til ferdig validerte Kubernetes-manifester.',
        descriptionEn:
          'Uses CUE to define schemas, constraints, and application configs compiled into validated Kubernetes manifests.',
        highlights: [
          'Fanger opp konfigurasjonsfeil før commit i stedet for ved utrulling i klyngen',
          'Støtte for OCI-moduler og gjenbrukbare plattformdefinisjoner',
        ],
      },
      {
        id: 'gitops-kargo',
        title: 'GitOps & Miljøpromotering med Argo CD og Kargo',
        titleEn: 'GitOps & Stage Promotion with Argo CD and Kargo',
        category: 'cicd',
        maturity: 'production',
        selfService: true,
        description:
          'Kombinerer Argo CD for deklarativ avstemming med Kargo for oversiktlig og kontrollert promotering av endringer fra dev til test og produksjon.',
        descriptionEn:
          'Combines Argo CD reconciliation with Kargo for controlled stage-to-stage promotion across environments.',
        highlights: [
          'Full sporbarhet av hvilke versjoner og manifester som kjører i hvert miljø',
        ],
      },
      {
        id: 'maritime-data',
        title: 'Skybasert Maritim Dataplattform ("Et hav av data")',
        titleEn: 'Cloud-Native Maritime Data Platform',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Håndterer både høyvolums sanntidsdata som skipstrafikk (AIS) og mindre fagdatasett i en moderne skybasert dataplattform.',
        descriptionEn:
          'Handles high-volume real-time vessel traffic (AIS) and domain datasets in a cloud-native data platform.',
        highlights: ['Bygget fra bunnen av i skyen uten tung teknisk arv'],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Kjøremiljø for Kystverkets containerbaserte tjenester og Driftly-oppsettet.',
        usageEn: 'Runtime for Kystverket’s containerized services and Driftly.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/Kystverket/Driftly',
        sinceYear: 2023,
      },
      {
        name: 'Argo CD',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'GitOps-synkronisering av CUE-genererte manifester i samspill med Kargo.',
        usageEn:
          'GitOps synchronization of CUE-rendered manifests alongside Kargo.',
        cncfUrl: 'https://www.cncf.io/projects/argo/',
        sinceYear: 2024,
      },
      {
        name: 'OpenTelemetry',
        tier: 'Incubating',
        category: 'Observability',
        usage: 'Telemetri og observabilitet i plattformen.',
        usageEn: 'Telemetry and observability across the platform.',
        cncfUrl: 'https://www.cncf.io/projects/opentelemetry/',
        sinceYear: 2025,
      },
    ],
    techStack: [
      {
        category: 'Plattform & GitOps',
        categoryEn: 'Platform & GitOps',
        items: ['Kubernetes', 'CUE', 'Argo CD', 'Kargo', 'OCI Modules'],
      },
      {
        category: 'Data & Observability',
        categoryEn: 'Data & Observability',
        items: [
          'OpenTelemetry',
          'Prometheus & Grafana',
          'Skybasert Dataplattform',
        ],
      },
    ],
    team: [
      {
        name: 'Kai Hanssen',
        role: 'Plattformarkitekt, Driftly',
        roleEn: 'Platform Architect, Driftly',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U087FNCDVNX',
      },
      {
        name: 'Stefan Ekehaug',
        role: 'Arkitekt, Dataplattform',
        roleEn: 'Architect, Data Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U05B6CGQ0DU',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'github.com/Kystverket/Driftly',
        description:
          'Kildekode og dokumentasjon for Driftly (CUE, Argo CD og Kargo).',
        url: 'https://github.com/Kystverket/Driftly',
        type: 'github',
      },
      {
        title: 'github.com/Kystverket',
        description: 'Kystverkets øvrige åpne prosjekter på GitHub.',
        url: 'https://github.com/Kystverket',
        type: 'github',
      },
      {
        title: 'Jobb i Kystverket',
        description: 'Se ledige stillinger hos Kystverket.',
        url: 'https://www.kystverket.no/om-kystverket/jobb-i-kystverket/',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'met',
    visibility: 'internal',
    platformAccess: 'internal',
    platformName: 'MET Kubernetes-plattform',
    platformDescription:
      'Meteorologisk institutt (MET) drifter en døgnkontinuerlig Kubernetes-plattform for kritiske vær-, klima- og beredskapstjenester med GitOps, Headlamp og regelmessige teamøvelser.',
    platformHref: '',
    platformLabel: '',
    theme: {
      accentColor: 'teal',
      heroStyle: 'grid',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Døgnkontinuerlig Kubernetes-plattform for værvarsling, klimadata og nasjonal beredskap.',
    taglineEn:
      '24/7 Kubernetes platform powering national weather forecasting, climate data, and emergency preparedness.',
    about:
      'Meteorologisk institutt (MET) leverer samfunnskritiske værtjenester, farevarsler, luftfartsmeteorologi og åpne vær-API-er (inkludert baksiden av Yr i samarbeid med NRK). Plattformteamet på MET drifter Kubernetes-klynger med sterk vekt på driftsstabilitet, utvikleropplevelse gjennom CNCF-prosjektet Headlamp, og praktiske teamøvelser (GameDays) for å håndtere feilsituasjoner trygt.',
    aboutEn:
      'The Norwegian Meteorological Institute (MET) operates a Kubernetes platform for mission-critical weather services and open APIs, emphasizing operational resilience, Headlamp developer UX, and regular team GameDays.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: [
      'On-prem (OpenStack / Bare Metal Kubernetes)',
      'Hybrid Sky',
    ],
    stats: [
      {
        label: 'Utviklergrensesnitt',
        labelEn: 'Developer UI',
        value: 'Headlamp',
        detail: 'CNCF Kubernetes web-grensesnitt tilpasset utviklerteamene',
      },
      {
        label: 'Driftskrav',
        labelEn: 'Operational SLA',
        value: '24/7 Beredskap',
        detail: 'Understøtter farevarsler, luftfart og api.met.no',
      },
      {
        label: 'Kildekode',
        labelEn: 'Open Source',
        value: 'github.com/metno',
        detail: 'Lang tradisjon for åpen kildekode og åpne meteorologiske data',
      },
    ],
    capabilities: [
      {
        id: 'headlamp-dx',
        title: 'Utvikleropplevelse i Kubernetes med Headlamp',
        titleEn: 'Kubernetes Developer Experience with Headlamp',
        category: 'dx',
        maturity: 'production',
        selfService: true,
        description:
          'Tilbyr utviklerteamene visuell innsikt og selvbetjening i Kubernetes-klyngene gjennom CNCF-prosjektet Headlamp.',
        descriptionEn:
          'Provides product teams with visual cluster insight and self-service via the CNCF Headlamp UI.',
        highlights: [
          'Senker terskelen for utviklerteam som vil feilsøke pods, logger og ressurser uten dyp kubectl-ekspertise',
        ],
      },
      {
        id: 'resilience-gamedays',
        title: 'Driftsrobusthet & Praktiske Teamøvelser',
        titleEn: 'Operational Resilience & Team GameDays',
        category: 'observability',
        maturity: 'production',
        selfService: true,
        description:
          'Systematiske teamøvelser og rotårsaksanalyser (inkludert dyrekjøpte erfaringer med etcd, Kyverno og Flux) som styrker plattformens evne til å tåle uforutsette hendelser.',
        descriptionEn:
          'Systematic team GameDays and incident reviews strengthening cluster resilience under failure conditions.',
        highlights: [
          'Åpen deling av feilretting og produksjonserfaringer med resten av Offentlig PaaS',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage: 'Kjerneplattform for værtjenester, dataprosessering og API-er.',
        usageEn:
          'Core runtime for weather services, data processing, and APIs.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/metno',
        sinceYear: 2019,
      },
      {
        name: 'Flux',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage: 'GitOps-avstemming av klynge- og applikasjonskonfigurasjon.',
        usageEn: 'GitOps reconciliation of cluster and application config.',
        cncfUrl: 'https://www.cncf.io/projects/flux/',
        sinceYear: 2021,
      },
      {
        name: 'Kyverno',
        tier: 'Incubating',
        category: 'Security & Policy',
        usage: 'Policy-håndheving og sikkerhetskontroller i Kubernetes.',
        usageEn: 'Policy enforcement and security guardrails in Kubernetes.',
        cncfUrl: 'https://www.cncf.io/projects/kyverno/',
        sinceYear: 2022,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Overvåking av klynger, etcd og høytrafikk vær-API-er.',
        usageEn: 'Monitoring of clusters, etcd, and high-traffic weather APIs.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2019,
      },
    ],
    techStack: [
      {
        category: 'Plattform & Verktøy',
        categoryEn: 'Platform & Tooling',
        items: [
          'Kubernetes',
          'Headlamp (CNCF)',
          'Flux CD / Argo CD',
          'Kyverno',
          'Prometheus & Grafana',
        ],
      },
    ],
    team: [
      {
        name: 'Endre Lervik',
        role: 'Plattformarkitekt, MET',
        roleEn: 'Platform Architect, MET',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U02HRG6DMDH',
      },
      {
        name: 'Christian Skarby',
        role: 'Plattform & Infrastruktur, MET',
        roleEn: 'Platform & Infrastructure, MET',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U5649URE1',
      },
      {
        name: 'Tonje Kirkholt',
        role: 'Plattformutvikler, MET',
        roleEn: 'Platform Engineer, MET',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'github.com/metno',
        description:
          'Meteorologisk institutts åpne kildekode-prosjekter på GitHub.',
        url: 'https://github.com/metno',
        type: 'github',
      },
      {
        title: 'Ledige stillinger på MET',
        description: 'Jobb med teknologi, superdatamaskiner og værtjenester.',
        url: 'https://www.met.no/om-oss/ledige-stillinger',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'entur',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Entur Plattform',
    platformDescription:
      'Enturs skybaserte applikasjons- og dataplattform på Google Cloud Platform (GCP) og Kubernetes forvalter over 800 prosjekter fra kode med reaktive datakontrakter.',
    platformHref: 'https://developer.entur.org',
    platformLabel: 'developer.entur.org',
    theme: {
      accentColor: 'indigo',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      '800+ segmenterte GCP-prosjekter fra kode og deklarative datakontrakter for nasjonal kollektivtrafikk.',
    taglineEn:
      '800+ code-provisioned GCP projects and declarative data contracts powering national public transport.',
    about:
      'Entur utvikler og drifter de nasjonale reiseplanleggings-, sanntids- og billetteringsløsningene for kollektiv-Norge. Entur redesignet hele sin skyarkitektur på Google Cloud Platform (GCP) og Kubernetes slik at alle ressurser er segmentert og tilgangsstyrt etter applikasjon og miljø — fullstendig oppsatt fra kode på tvers av over 800 GCP-prosjekter. På datasiden benytter Entur deklarative datakontrakter som kontrollplangrensesnitt i en reaktiv dataplattformarkitektur.',
    aboutEn:
      'Entur operates Norway’s national public transport routing and ticketing systems on GCP and Kubernetes, managing 800+ isolated GCP projects from code and using declarative data contracts as a control plane.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Google Cloud Platform (GCP / GKE)'],
    stats: [
      {
        label: 'GCP-prosjekter',
        labelEn: 'GCP projects',
        value: '800+',
        detail: 'Segmentert og tilgangsstyrt per applikasjon og miljø fra kode',
      },
      {
        label: 'Dataplattform',
        labelEn: 'Data architecture',
        value: 'Datakontrakter',
        detail: 'Kontrakten som kontrollplangrensesnitt i reaktiv arkitektur',
      },
      {
        label: 'Skyleverandør',
        labelEn: 'Cloud provider',
        value: '100% GCP',
        detail: 'GKE, BigQuery, Cloud Pub/Sub og Terraform',
      },
    ],
    capabilities: [
      {
        id: 'gcp-segmentation',
        title: 'Segmentert Multi-Prosjekt Arkitektur fra Kode',
        titleEn: 'Segmented Multi-Project Architecture as Code',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Alle ressurser på GCP og Kubernetes er segmentert og tilgangsstyrt etter applikasjon og miljø, og provisjoneres automatisk fra kode.',
        descriptionEn:
          'All GCP and Kubernetes resources are segmented and access-controlled per application and environment from code.',
        highlights: [
          'Over 800 isolerte GCP-prosjekter med konsistent IAM og nettverk',
          'Forutsigbar sikkerhetsmodell og tydelig kostnadsallokering per tjeneste',
        ],
      },
      {
        id: 'data-contracts',
        title: 'Reaktiv Dataplattform med Datakontrakter',
        titleEn: 'Reactive Data Platform with Data Contracts',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Deklarative datakontrakter fungerer som kontrollplangrensesnitt for dataplattformen og styrer skjema, tilgang og livssyklus mellom produsenter og konsumenter.',
        descriptionEn:
          'Declarative data contracts act as the control plane interface for the data platform, governing schema, access, and lifecycle.',
        highlights: [
          'Reaktiv provisjonering av datastrømmer og tabeller i GCP ut fra kontrakten',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Kjører nasjonale reiseplanleggings- og billetterings-API-er på Google Kubernetes Engine (GKE).',
        usageEn:
          'Runs national journey planning and ticketing APIs on Google Kubernetes Engine (GKE).',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/entur',
        sinceYear: 2018,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Metrikker og overvåking av tjenester i GKE.',
        usageEn: 'Metrics and monitoring for GKE workloads.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2019,
      },
      {
        name: 'Helm',
        tier: 'Graduated',
        category: 'Platform & App Definition',
        usage: 'Pakking og utrulling av plattformtjenester i Kubernetes.',
        usageEn: 'Packaging and deployment of platform services in Kubernetes.',
        cncfUrl: 'https://www.cncf.io/projects/helm/',
        sinceYear: 2019,
      },
    ],
    techStack: [
      {
        category: 'Sky & Kjøremiljø',
        categoryEn: 'Cloud & Runtime',
        items: [
          'Google Cloud Platform (GCP)',
          'Google Kubernetes Engine (GKE)',
          'Terraform',
          'GitHub Actions',
        ],
      },
      {
        category: 'Data & API-er',
        categoryEn: 'Data & APIs',
        items: [
          'Data Contracts',
          'BigQuery & Cloud Pub/Sub',
          'OpenTripPlanner (Open Source)',
          'GraphQL / REST',
        ],
      },
    ],
    team: [
      {
        name: 'Anders Dahlen',
        role: 'Arkitekt, Dataplattform & Datakontrakter',
        roleEn: 'Architect, Data Platform & Data Contracts',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U05PKEZ781J',
      },
      {
        name: 'Sindre Lindstad',
        role: 'Tidligere Plattformarkitekt, Entur',
        roleEn: 'Former Platform Architect, Entur',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UUHH03WPK',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'Entur Developer Portal',
        description:
          'Åpne API-er, sanntidsdata og dokumentasjon for kollektiv-Norge.',
        url: 'https://developer.entur.org',
        type: 'docs',
      },
      {
        title: 'github.com/entur',
        description: 'Enturs åpne kildekode-prosjekter på GitHub.',
        url: 'https://github.com/entur',
        type: 'github',
      },
      {
        title: 'Karriere i Entur',
        description: 'Bli med å bygge fremtidens mobilitetsløsninger.',
        url: 'https://om.entur.no/jobb-i-entur/',
        type: 'careers',
      },
    ],
  },
  {
    slug: 'ks',
    visibility: 'internal',
    platformAccess: 'public',
    platformName: 'Fiks Tjeneste- og Applikasjonsplattform',
    platformDescription:
      'KS Digital fornyer Fiks-plattformen med en moderne applikasjonsplattform som gjør det enklere å utvikle, dele og gjenbruke digitale tjenester på tvers av kommunal sektor.',
    platformHref: 'https://utvikler.ks.no',
    platformLabel: 'utvikler.ks.no',
    theme: {
      accentColor: 'amber',
      heroStyle: 'gradient',
      sectionOrder: [
        'capabilities',
        'cncf',
        'talks',
        'architecture',
        'team',
        'jobs',
      ],
    },
    tagline:
      'Moderne applikasjons- og tjenesteplattform for økt utviklingstakt og gjenbruk på tvers av norske kommuner.',
    taglineEn:
      'Modern application and service platform accelerating development and reuse across Norwegian municipalities.',
    about:
      'KS Digital utvikler og forvalter felles digitale løsninger for kommunal sektor i Norge. Gjennom fornyelsen av Fiks-plattformen til en moderne tjeneste- og applikasjonsplattform legger KS Digital til rette for at kommuner, fylkeskommuner og leverandører enklere kan utvikle, dele og gjenbruke digitale innbygger- og fagtjenester.',
    aboutEn:
      'KS Digital develops and operates shared digital infrastructure for the Norwegian municipal sector, evolving the Fiks platform into a modern application and service platform.',
    cncfEndUserMember: false,
    openSourceFirst: true,
    cloudProviders: ['Skybasert Kubernetes & Hybrid Infrastruktur'],
    stats: [
      {
        label: 'Målgruppe',
        labelEn: 'Target sector',
        value: '357 kommuner',
        detail: 'Felles digitale tjenester for kommuner og fylkeskommuner',
      },
      {
        label: 'Åpen kildekode',
        labelEn: 'Open Source',
        value: '300+ repoer',
        detail: 'Delte protokoller, SDK-er og komponenter på github.com/ks-no',
      },
    ],
    capabilities: [
      {
        id: 'fiks-app-platform',
        title: 'Felles Kommunal Applikasjonsplattform',
        titleEn: 'Shared Municipal Application Platform',
        category: 'compute',
        maturity: 'production',
        selfService: true,
        description:
          'Standardisert applikasjonsplattform som øker utviklingstakten for kommunale fellestjenester og reduserer duplisert infrastrukturarbeid.',
        descriptionEn:
          'Standardized application platform accelerating delivery of shared municipal services.',
        highlights: [
          'Tilrettelegger for deling og gjenbruk av digitale tjenester på tvers av kommunal sektor',
        ],
      },
      {
        id: 'fiks-integrations',
        title: 'Fiks Meldingsformidling & Nasjonale Integrasjoner',
        titleEn: 'Fiks Messaging & National Integrations',
        category: 'data',
        maturity: 'production',
        selfService: true,
        description:
          'Sikker meldingsutveksling, dokumentlager og API-integrasjoner mellom kommunale fagsystemer, innbyggere og statlige fellesløsninger.',
        descriptionEn:
          'Secure messaging, document storage, and API integrations between municipal systems and national services.',
        highlights: [
          'Åpne SDK-er og API-spesifikasjoner på utvikler.ks.no og github.com/ks-no',
        ],
      },
    ],
    cncfProjects: [
      {
        name: 'Kubernetes',
        tier: 'Graduated',
        category: 'Orchestration & GitOps',
        usage:
          'Containerorkestrering for Fiks-plattformens mikrotjenester og applikasjonsplattform.',
        usageEn:
          'Container orchestration for Fiks platform microservices and workloads.',
        cncfUrl: 'https://www.cncf.io/projects/kubernetes/',
        sourceRepoUrl: 'https://github.com/ks-no',
        sinceYear: 2020,
      },
      {
        name: 'Prometheus',
        tier: 'Graduated',
        category: 'Observability',
        usage: 'Metrikker og overvåking av kommunale fellestjenester.',
        usageEn: 'Metrics and monitoring for shared municipal services.',
        cncfUrl: 'https://www.cncf.io/projects/prometheus/',
        sinceYear: 2020,
      },
    ],
    techStack: [
      {
        category: 'Plattform & Integrasjon',
        categoryEn: 'Platform & Integration',
        items: [
          'Kubernetes',
          'Java / Kotlin / .NET',
          'Apache Kafka / RabbitMQ',
          'Prometheus & Grafana',
        ],
      },
    ],
    team: [
      {
        name: 'Børge Nese',
        role: 'Plattformledelse, KS Digital',
        roleEn: 'Platform Leadership, KS Digital',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/UDS102YDU',
      },
      {
        name: 'Bård Singstad',
        role: 'Arkitekt, Fiks Tjenesteplattform',
        roleEn: 'Architect, Fiks Service Platform',
        slackUrl: 'https://offentlig-paas-no.slack.com/team/U07KJVCEATD',
      },
    ],
    openPositions: [],
    links: [
      {
        title: 'KS Utviklerportal (utvikler.ks.no)',
        description: 'Teknisk dokumentasjon og guider for Fiks-plattformen.',
        url: 'https://utvikler.ks.no',
        type: 'docs',
      },
      {
        title: 'github.com/ks-no',
        description: 'KS Digitals åpne kildekode-prosjekter på GitHub.',
        url: 'https://github.com/ks-no',
        type: 'github',
      },
      {
        title: 'Karriere i KS Digital',
        description: 'Bli med å digitalisere Kommune-Norge.',
        url: 'https://ksdigital.no/karriere/',
        type: 'careers',
      },
    ],
  },
]

async function main() {
  loadEnvLocal()

  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const slugArg = args.find(a => a.startsWith('--slug='))?.split('=')[1]
  const visibilityArg = args
    .find(a => a.startsWith('--visibility='))
    ?.split('=')[1] as ProfileVisibility | undefined

  const targetVisibility: ProfileVisibility =
    visibilityArg === 'public' ? 'public' : 'internal'

  const selected = slugArg
    ? BOOTSTRAP_PROFILES.filter(p => p.slug === slugArg.toLowerCase())
    : BOOTSTRAP_PROFILES

  if (selected.length === 0) {
    console.error(`Ingen bootstrap-profiler funnet for slug="${slugArg}"`)
    process.exit(1)
  }

  const validated: UpsertMemberProfileInput[] = []
  for (const raw of selected) {
    const normalized = raw.slug.toLowerCase()
    const member = members.find(
      m =>
        m.getSlug() === normalized ||
        m.slug?.toLowerCase() === normalized ||
        m.github?.toLowerCase() === normalized
    )
    if (!member) {
      throw new Error(`Slug "${raw.slug}" finnes ikke i src/data/members.ts`)
    }
    const parsed = upsertMemberProfileSchema.parse({
      ...raw,
      visibility: targetVisibility,
    })
    validated.push(parsed)
  }

  console.log(
    `Validerte ${validated.length} plattformprofiler (visibility="${targetVisibility}").`
  )

  if (dryRun) {
    for (const p of validated) {
      console.log(
        `[DRY-RUN] ${p.slug.padEnd(14)} | ${p.platformName.padEnd(38)} | access=${p.platformAccess.padEnd(8)} | caps=${p.capabilities.length} | cncf=${p.cncfProjects.length} | team=${p.team.length}`
      )
    }
    return
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId || !token) {
    throw new Error(
      'Mangler NEXT_PUBLIC_SANITY_PROJECT_ID eller SANITY_API_TOKEN i miljøvariabler / .env.local'
    )
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-03-04',
    token,
    useCdn: false,
  })

  const verifiedUpdated = new Date().toISOString().slice(0, 10)

  for (const input of validated) {
    const slug = input.slug.toLowerCase()
    const docId = `memberProfile-${slug}`

    const rawDoc = {
      _id: docId,
      _type: 'memberProfile',
      slug,
      visibility: input.visibility,
      platformAccess: input.platformAccess,
      platformName: input.platformName,
      platformDescription: input.platformDescription,
      platformHref: input.platformHref || '',
      platformLabel: input.platformLabel || '',
      platformLogo: input.platformLogo || undefined,
      verifiedUpdated,
      updatedBy: {
        name: 'Offentlig PaaS Bootstrap',
      },
      theme: input.theme,
      tagline: input.tagline,
      taglineEn: input.taglineEn,
      about: input.about,
      aboutEn: input.aboutEn,
      cncfEndUserMember: input.cncfEndUserMember ?? false,
      openSourceFirst: input.openSourceFirst ?? true,
      cloudProviders: input.cloudProviders ?? [],
      stats: input.stats ?? [],
      manifestExample:
        input.manifestExample && input.manifestExample.code.trim()
          ? input.manifestExample
          : undefined,
      capabilities: input.capabilities ?? [],
      cncfProjects: (input.cncfProjects ?? []).map(p => ({
        ...p,
        sourceRepoUrl: p.sourceRepoUrl || undefined,
      })),
      techStack: input.techStack ?? [],
      team: (input.team ?? []).map(t => ({
        ...t,
        slackUrl: t.slackUrl || undefined,
        github: t.github || undefined,
      })),
      openPositions: input.openPositions ?? [],
      links: input.links ?? [],
    }

    const prepared = prepareSanityDocument(rawDoc)
    await client.createOrReplace(prepared)
    console.log(
      `Lagret ${docId.padEnd(28)} (${input.platformName}) [visibility=${input.visibility}, access=${input.platformAccess}]`
    )
  }

  console.log(
    `\nFullført bootstrap av ${validated.length} plattformprofiler i Sanity (${dataset}).`
  )
}

main().catch(err => {
  console.error('Bootstrap feilet:', err)
  process.exit(1)
})
