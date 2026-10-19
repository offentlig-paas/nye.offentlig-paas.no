import type {
  QuestionCondition,
  QuestionOption,
  SurveyDefinition,
} from '@/lib/surveys/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { members } from '@/data/members'

/**
 * State of Platforms, Wave 3. Source of truth:
 * offentlig-paas/forskning projects/state-of-platforms/survey/instrument-wave3.md
 *
 * Core questions (Q1–Q31) keep the Wave 2 wording, including its typos, and
 * store the option label as value so answers line up with the 2024 and 2026
 * CSV files. Q2 (Type) is derived from Q3 during analysis and is not asked.
 */

const orgSuggestions = members.map(m => m.name).sort()

/** Core options: the label is also the stored value. */
const core = (labels: string[]): QuestionOption[] =>
  labels.map(label =>
    label === 'Annet'
      ? { label, value: label, allowOtherText: true }
      : { label, value: label }
  )

const scale1to10 = core(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])

const hasPlatform: QuestionCondition[] = [
  { questionId: 'q7-platform', anyOf: ['Ja'] },
]
const usesKubernetes: QuestionCondition[] = [
  { questionId: 'q14-kubernetes', anyOf: ['Ja'] },
]

export const stateOfPlatforms2027: SurveyDefinition = {
  slug: 'state-of-platforms-2027',
  version: 2,
  title: 'Plattformundersøkelsen i offentlig sektor, runde 3',
  estimatedMinutes: '8–14',
  owners: [
    {
      name: 'Hans Kristian Flaatten',
      org: 'Nav',
      url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
    },
  ],
  organizationQuestionId: 'q1-org',
  comparesTo: {
    // Wave 2 exists only as frozen aggregates, built from the 2026 CSV by
    // scripts/import-sop-wave2-aggregates.ts with the same question ids.
    // Mapped: unchanged wording and options. Left out: free text, Q15, Q26,
    // Q28, Q31 (options removed) and Q20 (options differ from wave 2).
    slug: 'state-of-platforms-2026',
    questionMap: Object.fromEntries(
      [
        'q3-org-type',
        'q4-employees',
        'q6-role',
        'q7-platform',
        'q9-why',
        'q10-self-service',
        'q11-teams',
        'q12-languages',
        'q13a-investment',
        'q13b-adoption',
        'q13c-interfaces',
        'q13d-operations',
        'q13e-measurement',
        'q14-kubernetes',
        'q16-k8s-years',
        'q17-clusters',
        'q18-k8s-apps',
        'q19-operators',
        'q21-cloud',
        'q22-primary-cloud',
        'q24-cloud-years',
        'q25-serverless',
        'q29-network-security',
        'q30-app-security',
      ].map(id => [id, id])
    ),
  },
  sensitiveQuestionIds: ['kontakt'],
  description:
    'Vi kartlegger modenhet, verktøyvalg og organisering rundt applikasjonsplattformer i norsk offentlig sektor. I år spør vi også om kunstig intelligens (KI) på plattformen.',
  consent: {
    dataCollectionText:
      'Vi samler inn svar om organisasjonens plattformvalg, modenhet, teknologier, skybruk og KI.',
    checkboxLabel:
      'Jeg har lest informasjonen over og samtykker til at svarene mine brukes som beskrevet.',
    fullText: [
      '**Hva handler undersøkelsen om?**\nVi kartlegger modenhet, verktøyvalg og organisering rundt applikasjonsplattformer i norsk offentlig sektor. I år spør vi også om kunstig intelligens (KI) på plattformen. Undersøkelsen tar ca. 8–14 minutter, avhengig av svarene dine.',
      '**Hvem er ansvarlig?**\nUndersøkelsen gjennomføres av Offentlig PAAS. Behandlingsansvarlig er foreningen Offentlig PAAS. Kontaktperson er styreleder, kontakt@offentlig-paas.no.',
      '**Hva samler vi inn?**\nVi samler inn svar om organisasjonens plattformvalg, modenhet, teknologier, skybruk og KI. Vi spør om organisasjonsnavn for å kunne oppdage duplikater og sammenligne med tidligere år. Vi spør også om din rolle. Organisasjonsnavn og rolle kan til sammen identifisere deg, og vi behandler derfor svarene som personopplysninger. E-postadresse i siste spørsmål er frivillig og brukes bare til å kontakte deg om podkast eller artikkel.',
      '**Hva publiserer vi?**\nVi publiserer bare samlede resultater, i akademiske tidsskrifter og konferanser og på offentlig-paas.no. Navn på organisasjoner eller personer blir ikke publisert. Svar fra enkeltorganisasjoner blir ikke gjort åpent tilgjengelige. Svaralternativer som færre enn tre har valgt, rapporteres som «under 3».',
      '**Behandlingsgrunnlag og lagring**\nBehandlingsgrunnlaget er samtykke (GDPR art. 6 nr. 1 bokstav a). Svarene samles inn i et eget skjema på offentlig-paas.no. Vercel (drift av nettstedet) og Sanity (lagring av svarene) er databehandlere, og svarene lagres i EU/EØS. Leverandørene kan være underlagt amerikansk lov. Eventuelle overføringer sikres etter GDPR kapittel V, gjennom EU–US Data Privacy Framework eller EUs standard personvernbestemmelser. Etter innsamlingen eksporteres svarene til en lukket lagringsplass som bare forskerne har tilgang til, og deretter slettes de fra Sanity. E-postadresser skilles fra svarene før analyse og slettes når eventuell kontakt er avsluttet. Organisasjonsnavn tas vare på mellom bølgene, slik at vi kan koble svar fra samme organisasjon over tid. Studien er hele den gjentatte undersøkelsen (alle bølger), og alle svar slettes senest to år etter siste bølge i studien.',
      '**Dine rettigheter**\nDu har rett til innsyn i, retting av og sletting av opplysningene om deg, og du kan trekke samtykket tilbake når som helst uten å oppgi grunn. Kontakt oss på kontakt@offentlig-paas.no. Svar som allerede inngår i publiserte samlede resultater, kan vi ikke fjerne i ettertid. Du kan klage til Datatilsynet hvis du mener at vi behandler personopplysningene dine i strid med regelverket.',
      '**Frivillig deltakelse**\nDet er helt frivillig å delta, og du kan avslutte når som helst uten å oppgi grunn.',
    ].join('\n\n'),
  },
  thankYouMessage:
    'Takk for at du tok deg tid til å svare! Resultatene publiseres som samlede tall fra Offentlig PAAS. Har du spørsmål, kontakt oss på kontakt@offentlig-paas.no.',
  status: SurveyStatus.Pilot,
  sections: [
    {
      id: 'organization',
      title: 'Organisasjon og demografi',
      questions: [
        {
          id: 'q1-org',
          type: 'typeahead',
          title: 'Organisasjon',
          required: true,
          placeholder: 'Begynn å skrive for å se forslag...',
          suggestions: orgSuggestions,
          visualization: 'hidden',
        },
        {
          id: 'panel',
          type: 'radio',
          title:
            'Deltok organisasjonen din i plattformundersøkelsen i 2023/2024 eller 2025/2026?',
          required: false,
          options: [
            { label: 'Ja, begge gangene', value: 'both' },
            { label: 'Ja, i 2025/2026', value: 'w2' },
            { label: 'Ja, i 2023/2024', value: 'w1' },
            { label: 'Nei, dette er første gang', value: 'no' },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q3-org-type',
          type: 'radio',
          title: 'Type organisasjon',
          required: true,
          options: core([
            'Etat',
            'Direktoratet',
            'Forvaltningsorgan',
            'Offentlig virksomhet',
            'Statseid selskap',
            'Statlig foretak',
            'Kommune',
            'Kommunalt selskap',
            'Universitet',
            'Forskningsinstitusjon',
            'Annet',
          ]).map(o => ({ label: o.label, value: o.value })),
        },
        {
          id: 'q4-employees',
          type: 'radio',
          title: 'Ansatte',
          required: false,
          options: core([
            '<100',
            '100–499',
            '500–999',
            '1000–1999',
            '2000–4999',
            '5000–14999',
            '15000+',
          ]),
        },
        {
          id: 'q6-role',
          type: 'radio',
          title: 'Hva er din primærrolle?',
          required: true,
          options: core([
            'Plattformutvikler',
            'Applikasjonsutvikler',
            'Arkitekt',
            'Techlead',
            'Leder',
            'DevOps',
            'Drift/ops',
            'Sikkerhet',
            'Test/QA',
            'Annet',
          ]).map(o => ({ label: o.label, value: o.value })),
        },
      ],
    },
    {
      id: 'platform',
      title: 'Applikasjonsplattform',
      questions: [
        {
          id: 'q7-platform',
          type: 'radio',
          layout: 'inline',
          title: 'Har dere en applikasjonsplattform?',
          required: true,
          options: core(['Ja', 'Nei']),
        },
        {
          id: 'q8-platform-name',
          type: 'text',
          title: 'Har plattformen deres et navn?',
          required: false,
          showIf: hasPlatform,
          visualization: 'hidden',
        },
        {
          id: 'q9-why',
          type: 'checkbox',
          title: 'Hvorfor lager dere plattform?',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Raskere applikasjonsutvikling',
            'Stabilitet og kvalitet',
            'Sikkerhet',
            'Ressursoptimalisering',
            'Kostoptimalisering',
            'Være attraktiv arbeidsplass for utviklere',
            'Støtte flere teknologier',
            'Noen ville ha en plattform',
            'Alle andre har en plattform!',
            'Annet',
          ]),
        },
        {
          id: 'q10-self-service',
          type: 'checkbox',
          title: 'Hvilke selvbetjente tjenester består plattformen deres av?',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Kildekode og versjonskontroll',
            'Bygg, deploy og kjøre applikasjoner',
            'Logg, metrikker, dashbaords og alarmer',
            'Databaser, meldingskøer og lagring',
            'Sikkerhet- og sårbarhets-scanning',
            'Nettverk/brannmur (interntrafikk)',
            'Nettverk/brannmur (eksterntrafikk)',
            'Annet',
          ]),
        },
        {
          id: 'q11-teams',
          type: 'radio',
          title:
            'Ca. hvor mange applikasjonsteam benytter seg av plattformen deres i dag?',
          required: false,
          showIf: hasPlatform,
          options: core(['0-5', '6-10', '11-50', '51-100', 'Mer enn 100']),
        },
        {
          id: 'q12-languages',
          type: 'checkbox',
          title: 'Topp tre programmeringsspråk for applikasjoner?',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Java',
            'Kotlin',
            'Python',
            'TypeScript',
            'JavaScript',
            '.NET',
            'Go',
            'PHP',
            'Rust',
            'Annet',
          ]),
        },
      ],
    },
    {
      id: 'maturity',
      title: 'CNCF Plattformmodenhet',
      questions: [
        {
          id: 'q13a-investment',
          type: 'radio',
          title: 'Hvordan allokeres ansatte og midler til plattformfunksjoner',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Nivå 1, Provisorisk – Frivillig eller midlertidig',
            'Nivå 2, Operasjonalisert — Dedikert team',
            'Nivå 3, Skalerbar — Som produkt',
            'Nivå 4, Optimalisering — Aktivert økosystem',
            'N/A',
          ]),
        },
        {
          id: 'q13b-adoption',
          type: 'radio',
          title:
            'Hvordan oppdager brukere interne plattformer og plattformfunksjonalitet?',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Nivå 1, Provisorisk — Uregelmessig',
            'Nivå 2, Operasjonalisert — Utvendig dytt',
            'Nivå 3, Skalerbar — Innvendig dragning',
            'Nivå 4, Optimalisering — Deltakende',
            'N/A',
          ]),
        },
        {
          id: 'q13c-interfaces',
          type: 'radio',
          title: 'Hvordan benytter brukere plattformfunksjonalitet?',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Nivå 1, Provisorisk – Tilpassede prosesser',
            'Nivå 2, Operasjonalisert — Standardverktøy',
            'Nivå 3, Skalerbar — Selvbetjeningsløsninger',
            'Nivå 4, Optimalisering — Administrerte tjenester',
            'N/A',
          ]),
        },
        {
          id: 'q13d-operations',
          type: 'radio',
          title:
            'Hvordan planlegges, prioriteres, utvikles og vedlikeholdes plattformer og deres funksjonalitet?',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Nivå 1, Provisorisk — På forespørsel',
            'Nivå 2, Operasjonalisert — Sentralt registrert',
            'Nivå 3, Skalerbar — Sentralt aktivert',
            'Nivå 4, Optimalisering — Administrerte tjenester',
            'N/A',
          ]),
        },
        {
          id: 'q13e-measurement',
          type: 'radio',
          title:
            'Hva er prosessen for å samle inn og lære av tilbakemeldinger?',
          required: false,
          showIf: hasPlatform,
          options: core([
            'Nivå 1, Provisorisk – Ad hoc',
            'Nivå 2, Operasjonalisert — Konsekvent innsamling',
            'Nivå 3, Skalerbar — Innsikt',
            'Nivå 4, Optimalisering — Kvantitativ og kvalitativ',
            'N/A',
          ]),
        },
      ],
    },
    {
      id: 'kubernetes',
      title: 'Kubernetes',
      questions: [
        {
          id: 'q14-kubernetes',
          type: 'radio',
          layout: 'inline',
          title: 'Bruker dere Kubernetes?',
          required: true,
          options: core(['Ja', 'Nei']),
        },
        {
          id: 'q15-distributions',
          type: 'checkbox',
          title: 'Hvilke Kubernetes distribusjoner bruker dere?',
          required: false,
          showIf: usesKubernetes,
          options: core([
            'AKS',
            'OpenShift',
            'GKE',
            'Vanilla Kubernetes (kubeadm/kubespray)',
            'Tanzu',
            'EKS',
            'Nutanix Kubernetes Engine',
            'Talos',
            'Azure RedHat OpenShift (ARO)',
            'Vet ikke',
            'Annet',
          ]),
        },
        {
          id: 'q16-k8s-years',
          type: 'radio',
          layout: 'inline',
          title: 'Hvor mange år har dere kjørt Kubernetes i produksjon?',
          required: false,
          showIf: usesKubernetes,
          options: scale1to10,
        },
        {
          id: 'q17-clusters',
          type: 'radio',
          title: 'Hvor mange Kubernetes clustere har dere?',
          required: false,
          showIf: usesKubernetes,
          options: core(['1-5', '6-10', '10-19', '20-49', '50+', 'Vet ikke']),
        },
        {
          id: 'q18-k8s-apps',
          type: 'radio',
          title:
            'Hvor mange applikasjoner i produksjon har dere på Kubernetes?',
          required: false,
          showIf: usesKubernetes,
          options: core([
            '0-100',
            '100-500',
            '500-1000',
            '1000-2000',
            '2000+',
            'Vet ikke',
          ]),
        },
        {
          id: 'q19-operators',
          type: 'radio',
          layout: 'inline',
          title: 'Utvikler dere egne Kubernetes operators?',
          required: false,
          showIf: usesKubernetes,
          options: core(['Ja', 'Nei', 'Vet ikke']),
        },
        {
          id: 'q20-databases',
          type: 'checkbox',
          title: 'Kjører dere databaser i Kubernetes?',
          required: false,
          showIf: usesKubernetes,
          options: core([
            'Nei',
            'Ja, CloudNativePG',
            'Ja, Zalando Postgres Operator',
            'Ja, CrunchyDB',
            'Ja, men vi bruker ikke en operator',
            'Vet ikke',
            'Annet',
          ]),
        },
      ],
    },
    {
      id: 'cloud',
      title: 'Sky',
      questions: [
        {
          id: 'q21-cloud',
          type: 'radio',
          layout: 'inline',
          title: 'Bruker dere sky for plattformen deres?',
          required: true,
          options: core(['Ja', 'Nei']),
        },
        {
          id: 'q22-primary-cloud',
          type: 'radio',
          title: 'Hva er deres primære sky for applikasjoner?',
          required: false,
          options: core(['Azure', 'Google Cloud', 'AWS', 'Annet']),
        },
        {
          id: 'q24-cloud-years',
          type: 'radio',
          layout: 'inline',
          title: 'Hvor mange år har dere kjørt applikasjoner i sky?',
          required: false,
          options: scale1to10,
        },
        {
          id: 'q25-serverless',
          type: 'checkbox',
          title: 'Benytter dere serverless funksjoner?',
          required: false,
          options: core([
            'Azure Functions',
            'AWS Lambda',
            'Google Cloud Run',
            'Google Cloud Functions',
            'Annet',
          ]),
        },
      ],
    },
    {
      id: 'tooling',
      title: 'Verktøy og teknologistakk',
      questions: [
        {
          id: 'q26-monitoring',
          type: 'checkbox',
          title: 'Hva bruker dere for overvåking av applikasjoner?',
          required: false,
          options: core([
            'Grafana Loki',
            'Grafana Tempo',
            'Grafana Mimir',
            'Grafana',
            'Prometheus',
            'OpenTelemetry',
            'Azure Monitoring',
            'Splunk',
            'Elastic Kibana',
            'Thanos',
            'Google Cloud Monitoring',
            'Kibana',
            'Datadog',
            'Dynatrace',
            'OpenSearch',
            'Appdynamics',
            'Jaeger',
            'Annet',
          ]),
        },
        {
          id: 'q28-deploy',
          type: 'checkbox',
          title: 'Hva bruker dere for deploy av applikasjoner?',
          required: false,
          options: core([
            'GitHub Actions',
            'Argo',
            'Flux',
            'Azure DevOps',
            'Jenkins',
            'GitLab Pipelines',
            'kubectl apply',
            'Annet',
          ]),
        },
        {
          id: 'q29-network-security',
          type: 'checkbox',
          title: 'Hva bruker dere for nettverksikkerhet?',
          required: false,
          options: core([
            'NetworkPolicies',
            'cert-manager',
            'Cilium',
            'Istio',
            'Linkerd',
            'Annet',
          ]),
        },
        {
          id: 'q30-app-security',
          type: 'checkbox',
          title: 'Hva bruker dere for applikasjonsikkerhet?',
          required: false,
          options: core([
            'Kyverno',
            'Open Policy Agent (OPA)',
            'Falco',
            'Sysdig',
            'Trivy',
            'Annet',
          ]),
        },
        {
          id: 'q31-iac',
          type: 'checkbox',
          title: 'Hva bruker dere for infrastruktur-automatisering?',
          required: false,
          options: core([
            'Terraform',
            'Ansible',
            'Azure Bicep',
            'Azure Resource Manager (ARM)',
            'Pulumi',
            'AWS CloudFormation',
            'Crossplane (Kubernetes)',
            'Annet',
          ]),
        },
      ],
    },
    {
      id: 'ai',
      title: 'Plattformen og KI',
      questions: [
        {
          id: 'q32-ai-capabilities',
          type: 'checkbox',
          title:
            'Hvilke tjenester eller hvilken infrastruktur tilbyr plattformen deres for team som utvikler eller kjører KI-løsninger (f.eks. applikasjoner som bruker språkmodeller, eller maskinlæring)?',
          description:
            'Kryss av for det som tilbys i produksjon i dag, som en del av plattformen eller som et standardisert oppsett. Eksempler: *Språkmodeller i sky:* Azure OpenAI, Google Vertex AI, AWS Bedrock. *KI-gateway:* LiteLLM, Envoy AI Gateway, Azure API Management. *Egne modeller:* vLLM, Ollama, KServe. *Vektorsøk:* pgvector, OpenSearch, Qdrant. *MLOps:* MLflow, Kubeflow. *KI-overvåking:* OpenTelemetry for generativ KI, Langfuse.',
          required: true,
          showIf: hasPlatform,
          randomizeOptions: true,
          options: [
            {
              label:
                '**Språkmodeller i sky:** Standardisert tilgang til språkmodeller hos en skyleverandør',
              value: 'cloud-llm-access',
            },
            {
              label:
                '**KI-gateway:** Felles gateway eller proxy foran språkmodellene',
              value: 'ai-gateway',
            },
            {
              label:
                '**GPU:** GPU-noder eller annen akselerert maskinvare på plattformen',
              value: 'gpu-k8s',
            },
            {
              label:
                '**Egne modeller:** Vi kjører egne eller åpne modeller på plattformen',
              value: 'self-hosted-inference',
            },
            {
              label:
                '**Vektorsøk (RAG):** Vektordatabaser eller søkeindekser for KI',
              value: 'vector-rag',
            },
            {
              label:
                '**MLOps:** Verktøy for å trene, versjonere og rulle ut modeller',
              value: 'mlops',
            },
            {
              label: '**KI-overvåking:** Overvåking og evaluering av KI-kall',
              value: 'ai-observability',
            },
            {
              label:
                '**Planlagt:** Vi planlegger eller tester, men ingenting er i produksjon ennå',
              value: 'planned',
              exclusive: true,
              pinPosition: 'last',
            },
            {
              label: '**Ingen:** Plattformen har ingen KI-tjenester i dag',
              value: 'none',
              exclusive: true,
              pinPosition: 'last',
            },
            {
              label: 'Vet ikke',
              value: 'unknown',
              exclusive: true,
              pinPosition: 'last',
            },
            {
              label: 'Annet (spesifiser)',
              value: 'other',
              allowOtherText: true,
              pinPosition: 'last',
            },
          ],
        },
        {
          id: 'q33b-inference-region',
          type: 'checkbox',
          title:
            'Hvor behandles dataene når applikasjonene bruker KI-tjenester hos en ekstern leverandør?',
          description:
            'Eksempler på EU/EØS: Azure OpenAI i EU-region eller Google Vertex AI i Europa.',
          required: false,
          showIf: [
            {
              questionId: 'q32-ai-capabilities',
              anyOf: ['cloud-llm-access', 'ai-gateway'],
            },
          ],
          options: [
            { label: 'I Norge', value: 'norway' },
            { label: 'I EU/EØS utenfor Norge', value: 'eu-eea' },
            {
              label: 'Utenfor EU/EØS eller uten fast region',
              value: 'outside-eu',
            },
            { label: 'Vet ikke', value: 'unknown', exclusive: true },
          ],
        },
      ],
    },
    {
      id: 'agents',
      title: 'KI-agenter',
      questions: [
        {
          id: 'q34-platform-role',
          type: 'checkbox',
          title:
            'Hvilken rolle har plattformteamet (eller et tilsvarende sentralt teknisk miljø) når det gjelder KI-kodeverktøy og KI-agenter for utviklerne i organisasjonen?',
          description:
            'Velg alle som passer. Eksempler: *Ingen rolle:* IT-avdeling, sikkerhet, anskaffelse eller det enkelte team håndterer dette. *Tilgang:* anskaffelse, lisenser eller SSO/IAM. *Felles oppsett for agenter:* `AGENTS.md`, Copilot-instrukser eller ferdige oppsett tilpasset plattformen. *Kontekst fra plattformen:* MCP-servere (Model Context Protocol), CLI-verktøy eller API-er. *Sjekker i CI/CD:* sikkerhetsskanning eller policysjekker.',
          required: true,
          options: [
            {
              label:
                'Vi har ikke plattformteam eller tilsvarende sentralt teknisk miljø',
              value: 'no-platform-team',
              exclusive: true,
            },
            {
              label:
                '**Ingen rolle:** Andre enn plattformteamet håndterer dette',
              value: 'no-role',
              exclusive: true,
            },
            {
              label:
                '**Tilgang:** Skaffer lisenser og styrer tilgang til KI-kodeverktøyene',
              value: 'provisioning',
            },
            {
              label:
                '**Intern KI-gateway:** Drifter en gateway eller egne modeller som utviklerne kan koble verktøyene til',
              value: 'llm-gateway-dev',
            },
            {
              label:
                '**Felles oppsett for agenter:** Lager regler, instrukser eller maler for KI-agenter',
              value: 'golden-paths',
            },
            {
              label:
                '**Kontekst fra plattformen:** Tilbyr verktøy som lar agentene hente informasjon fra plattformen',
              value: 'mcp-context',
            },
            {
              label:
                '**Sjekker i CI/CD:** Automatiske sjekker som også gjelder kode skrevet med KI',
              value: 'ci-guardrails',
            },
            { label: 'Vet ikke', value: 'unknown', exclusive: true },
          ],
        },
        {
          id: 'q35-agent-interfaces',
          type: 'radio',
          title:
            'Hva er det meste utviklernes KI-kodeagenter kan gjøre mot plattformen deres i praksis i dag?',
          description:
            'Svar ut fra hva som faktisk skjer, ikke hva retningslinjene sier. Velg det høyeste nivået. Eksempler på agenter: Claude Code, GitHub Copilot, Cursor. *Lese dokumentasjon:* `llms.txt`, CRD-er, Helm-verdier eller OpenAPI. *Lesetilgang:* logger, status for applikasjoner eller byggfeil. *Endringer via pull request:* GitOps.',
          required: false,
          showIf: hasPlatform,
          options: [
            {
              label:
                '**Ingen tilrettelegging:** Agentene bruker bare utviklerens egne verktøy og tilganger',
              value: 'no-integration',
            },
            {
              label:
                '**Lese dokumentasjon:** Dokumentasjon og skjemaer er lagt til rette for KI-agenter',
              value: 'docs-llms-txt',
            },
            {
              label:
                '**Lesetilgang:** Agentene kan lese fra plattformen via MCP eller CLI',
              value: 'mcp-read',
            },
            {
              label:
                '**Endringer via pull request:** Agentene kan foreslå endringer som et menneske godkjenner',
              value: 'agent-pr',
            },
            {
              label:
                '**Direkte endringer:** Agentene kan endre eller opprette ressurser direkte, med egen tilgangsstyring',
              value: 'agent-direct-write',
            },
            {
              label:
                '**Sperret:** Vi har bevisst sperret KI-agenter ute fra plattformen',
              value: 'restricted',
            },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q37-ai-changes',
          type: 'checkbox',
          title:
            'Har bruk av KI-kodeverktøy eller KI-applikasjoner i organisasjonen ført til endringer for plattformen eller plattformteamet?',
          description:
            'Velg opptil tre alternativer som passer best. Eksempler: *Flere avklaringer:* DPIA eller ROS-analyser. *Etterspørsel etter KI-infrastruktur:* GPU, tilgang til språkmodeller, vektordatabaser eller KI-gateway.',
          required: false,
          maxSelections: 3,
          options: [
            {
              label:
                '**Ingen endring:** Vi merker liten eller ingen endring på plattformnivå så langt',
              value: 'no-change',
              exclusive: true,
            },
            {
              label:
                '**Høyere endringstakt:** Flere pull requests, bygg og deployer',
              value: 'more-deploys-prs',
            },
            {
              label:
                '**Flere nye applikasjoner:** Flere prototyper og småtjenester på plattformen',
              value: 'new-apps-experimentation',
            },
            {
              label:
                '**Behov for sperrer:** Større behov for automatiske sperrer og policysjekker',
              value: 'guardrail-demand',
            },
            {
              label:
                '**Flere avklaringer:** Flere vurderinger av personvern og risiko',
              value: 'compliance-load',
            },
            {
              label:
                '**Etterspørsel etter KI-infrastruktur:** Teamene ber om mer KI-infrastruktur',
              value: 'ai-infra-demand',
            },
            {
              label:
                '**Høyere kostnader:** Økte kostnader til sky, bygg eller API-er',
              value: 'cost-increase',
            },
            {
              label:
                '**Mer brukerstøtte:** Flere henvendelser om KI-generert konfigurasjon',
              value: 'support-burden',
            },
            {
              label: 'Vet ikke / for tidlig å si',
              value: 'unknown',
              exclusive: true,
            },
          ],
        },
        {
          id: 'q38-ai-barrier',
          type: 'radio',
          title:
            'Hva er den største utfordringen eller barrieren for plattformteamet når det gjelder KI (både KI-arbeidslaster og KI-verktøy)?',
          description:
            'Eksempler: *Personvern og jus:* GDPR, KI-forordningen. *Sikkerhet:* tilgangsstyring for agenter, datalekkasje, prompt injection, usikker kode.',
          required: false,
          options: [
            {
              label:
                '**Personvern og jus:** Krav i personvernregler og annen lovgivning',
              value: 'privacy-legal',
            },
            {
              label:
                '**Databehandling i sky:** Usikkerhet om hvordan skyleverandører behandler dataene',
              value: 'cloud-data-processing',
            },
            {
              label:
                '**Sikkerhet:** Sikkerhetsrisiko ved KI-tjenester og KI-agenter',
              value: 'security-risk',
            },
            {
              label:
                '**Kapasitet:** Kjerneplattformen og vanlig drift må prioriteres',
              value: 'capacity-priority',
            },
            {
              label:
                '**Kostnader og maskinvare:** Kostnader for eller tilgang til GPU og skyressurser',
              value: 'cost-hardware',
            },
            {
              label:
                '**Kompetanse:** For lite kompetanse på KI-infrastruktur eller KI-verktøy',
              value: 'competence',
            },
            {
              label: '**Uklare behov:** Applikasjonsteamene har uklare behov',
              value: 'unclear-demand',
            },
            {
              label: '**Lav etterspørsel:** Applikasjonsteamene etterspør lite',
              value: 'low-demand',
            },
            {
              label:
                '**Ingen barrierer:** Vi opplever ingen vesentlige barrierer',
              value: 'no-barrier',
            },
            { label: 'Vet ikke', value: 'unknown' },
            {
              label: 'Annet (spesifiser)',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'kontakt',
          type: 'text',
          title:
            'Kunne du ønske å være med på en episode av plattformpodden eller artikkel på offentlig-paas.no om deres plattform? Skriv epost-adressen din slik at vi kan kontakte deg.',
          required: false,
          format: 'email',
        },
      ],
    },
  ],
  /**
   * Column order for the CSV export. aggregate.py reads columns by position,
   * so the ended series (Q5, Q23, Q27) stay as empty columns and the new
   * questions come after the core columns.
   */
  exportColumns: [
    'q1-org',
    'q3-org-type',
    'q4-employees',
    { header: 'Budsjett (MNOK)' },
    'q6-role',
    'q7-platform',
    'q8-platform-name',
    'q9-why',
    'q10-self-service',
    'q11-teams',
    'q12-languages',
    'q13a-investment',
    'q13b-adoption',
    'q13c-interfaces',
    'q13d-operations',
    'q13e-measurement',
    'q14-kubernetes',
    'q15-distributions',
    'q16-k8s-years',
    'q17-clusters',
    'q18-k8s-apps',
    'q19-operators',
    'q20-databases',
    'q21-cloud',
    'q22-primary-cloud',
    { header: 'Brukere dere flere sky-leverandører?' },
    'q24-cloud-years',
    'q25-serverless',
    'q26-monitoring',
    { header: 'Hva bruker dere for pakking av applikasjoner?' },
    'q28-deploy',
    'q29-network-security',
    'q30-app-security',
    'q31-iac',
    'panel',
    'q32-ai-capabilities',
    'q33b-inference-region',
    'q34-platform-role',
    'q35-agent-interfaces',
    'q37-ai-changes',
    'q38-ai-barrier',
    'kontakt',
  ],
}
