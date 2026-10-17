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

const EXCLUSIVE = ' (kan ikke kombineres)'

export const stateOfPlatforms2027: SurveyDefinition = {
  slug: 'state-of-platforms-2027',
  version: 1,
  title: 'Plattformundersøkelsen i offentlig sektor, runde 3',
  owners: [
    {
      name: 'Hans Kristian Flaatten',
      org: 'Nav',
      url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
    },
  ],
  organizationQuestionId: 'q1-org',
  sensitiveQuestionIds: ['kontakt'],
  description:
    'Vi kartlegger modenhet, verktøyvalg og organisering rundt applikasjonsplattformer i norsk offentlig sektor. I år spør vi også om kunstig intelligens (KI) på plattformen.',
  consent: {
    dataCollectionText:
      'Vi samler inn svar om organisasjonens plattformvalg, modenhet, teknologier, skybruk og KI.',
    checkboxLabel:
      'Jeg har lest informasjonen over og samtykker til at svarene mine brukes som beskrevet.',
    fullText: [
      '**Hva handler undersøkelsen om?**\nVi kartlegger modenhet, verktøyvalg og organisering rundt applikasjonsplattformer i norsk offentlig sektor. I år spør vi også om kunstig intelligens (KI) på plattformen. Undersøkelsen tar ca. 12–15 minutter (anslag, verifiseres i pilot).',
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
  status: SurveyStatus.Draft,
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
          id: 'q5-budget',
          type: 'radio',
          title: 'Budsjett (MNOK)',
          required: false,
          options: core([
            '<500',
            '500–999',
            '1000–2999',
            '3000–9999',
            '10000–24999',
            '25000–49999',
            '50000–99999',
            '100000+',
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
            'Anthos',
            'Rancher',
            'Azure RedHat OpenShift (ARO)',
            'K3s',
            'Vet ikke',
            'Annet',
          ]),
        },
        {
          id: 'q16-k8s-years',
          type: 'radio',
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
          id: 'q23-multi-cloud',
          type: 'checkbox',
          title: 'Brukere dere flere sky-leverandører?',
          required: false,
          options: core([
            'Azure',
            'Google Cloud',
            'AWS',
            'Oracle Cloud',
            'Annet',
          ]),
        },
        {
          id: 'q24-cloud-years',
          type: 'radio',
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
            'Zabbix',
            'Victoria Metrics',
            'Annet',
          ]),
        },
        {
          id: 'q27-packaging',
          type: 'checkbox',
          title: 'Hva bruker dere for pakking av applikasjoner?',
          required: false,
          options: core([
            'Helm',
            'Kustomize',
            'JIB',
            'Buildpacks',
            'Packer',
            'Jsonnet',
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
            'Harness',
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
            'Google Cloud Config Connector (Kubernetes)',
            'Puppet',
            'Azure Service Operator (Kubernets)',
            'Annet',
          ]),
        },
      ],
    },
    {
      id: 'ai',
      title: 'KI og plattformen',
      questions: [
        {
          id: 'q32-ai-capabilities',
          type: 'checkbox',
          title:
            'Hvilke tjenester eller hvilken infrastruktur tilbyr plattformen deres for team som utvikler eller kjører KI-løsninger (f.eks. applikasjoner som bruker språkmodeller, eller maskinlæring)?',
          description:
            'Kryss av for det som tilbys i produksjon i dag, som del av plattformen eller som et standardisert oppsett.',
          required: true,
          showIf: hasPlatform,
          options: [
            {
              label: `Ingen KI-tjenester på plattformen i dag${EXCLUSIVE}`,
              value: 'none',
              exclusive: true,
            },
            {
              label:
                'Standardisert tilgang til språkmodeller hos skyleverandør (f.eks. Azure OpenAI, Google Vertex AI, AWS Bedrock)',
              value: 'cloud-llm-access',
            },
            {
              label:
                'Felles KI-gateway eller proxy foran språkmodellene (f.eks. LiteLLM, Envoy AI Gateway, Azure API Management)',
              value: 'ai-gateway',
            },
            {
              label:
                'GPU-noder eller annen akselerert maskinvare på plattformen',
              value: 'gpu-k8s',
            },
            {
              label:
                'Kjøring av egne eller åpne modeller på plattformen (f.eks. vLLM, Ollama, KServe)',
              value: 'self-hosted-inference',
            },
            {
              label:
                'Vektordatabaser eller søkeindekser for RAG (f.eks. pgvector, OpenSearch, Qdrant)',
              value: 'vector-rag',
            },
            {
              label:
                'MLOps-verktøy for trening, versjonering og utrulling av modeller (f.eks. MLflow, Kubeflow)',
              value: 'mlops',
            },
            {
              label:
                'Overvåking og evaluering av KI-kall (f.eks. OpenTelemetry for generativ KI, Langfuse)',
              value: 'ai-observability',
            },
            {
              label: `Vi planlegger eller tester KI-tjenester, men ingenting er i produksjon ennå${EXCLUSIVE}`,
              value: 'planned',
              exclusive: true,
            },
            {
              label: `Vet ikke${EXCLUSIVE}`,
              value: 'unknown',
              exclusive: true,
            },
            {
              label: 'Annet (spesifiser)',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'q33a-inference-model',
          type: 'checkbox',
          title:
            'Bruker applikasjoner på plattformen deres språkmodeller eller annen KI i produksjon? I så fall: hvordan kjøres modellene (inferens)?',
          required: true,
          showIf: hasPlatform,
          options: [
            {
              label: `Ingen applikasjoner på plattformen bruker KI i produksjon ennå${EXCLUSIVE}`,
              value: 'no-prod-ai',
              exclusive: true,
            },
            {
              label:
                'Administrert KI-tjeneste hos en skyleverandør (f.eks. Azure OpenAI, Google Vertex AI, AWS Bedrock)',
              value: 'cloud-managed',
            },
            {
              label:
                'Direkte mot API-et til en modelleverandør (f.eks. OpenAI, Anthropic, Mistral)',
              value: 'vendor-api',
            },
            {
              label:
                'KI som er innebygd i innkjøpt programvare som applikasjonene bruker (f.eks. Microsoft 365 Copilot)',
              value: 'saas-embedded',
            },
            {
              label:
                'Egne modeller på vår egen sky- eller Kubernetes-plattform',
              value: 'own-k8s-cloud',
            },
            { label: 'Egne modeller i eget datasenter', value: 'on-prem' },
            {
              label: `Vet ikke${EXCLUSIVE}`,
              value: 'unknown',
              exclusive: true,
            },
          ],
        },
        {
          id: 'q33b-inference-region',
          type: 'checkbox',
          title:
            'Hvor behandles dataene når applikasjonene bruker KI-tjenester hos en ekstern leverandør?',
          required: false,
          showIf: [
            {
              questionId: 'q33a-inference-model',
              anyOf: ['cloud-managed', 'vendor-api', 'saas-embedded'],
            },
          ],
          options: [
            { label: 'I Norge', value: 'norway' },
            {
              label:
                'I EU/EØS utenfor Norge (f.eks. Azure OpenAI i EU-region, Google Vertex AI i Europa)',
              value: 'eu-eea',
            },
            {
              label: 'Utenfor EU/EØS eller uten fast region',
              value: 'outside-eu',
            },
            {
              label: `Vet ikke${EXCLUSIVE}`,
              value: 'unknown',
              exclusive: true,
            },
          ],
        },
        {
          id: 'q34-platform-role',
          type: 'checkbox',
          title:
            'Hvilken rolle har plattformteamet (eller et tilsvarende sentralt teknisk miljø) når det gjelder KI-kodeverktøy og KI-agenter for utviklerne i organisasjonen?',
          required: true,
          options: [
            {
              label: `Vi har ikke plattformteam / ikke relevant${EXCLUSIVE}`,
              value: 'no-platform-team',
              exclusive: true,
            },
            {
              label: `Ingen rolle – dette håndteres av andre (f.eks. IT-avdelingen, sikkerhet, innkjøp eller det enkelte team)${EXCLUSIVE}`,
              value: 'no-role',
              exclusive: true,
            },
            {
              label:
                'Innkjøp, lisenser eller tilgangsstyring (SSO/IAM) for KI-kodeverktøy',
              value: 'provisioning',
            },
            {
              label:
                'Drifter en intern KI-gateway eller egne modeller som utviklerne kan koble kodeverktøyene til',
              value: 'llm-gateway-dev',
            },
            {
              label:
                'Lager felles regler, instrukser eller maler for KI-agenter (f.eks. AGENTS.md, Copilot-instrukser)',
              value: 'golden-paths',
            },
            {
              label:
                'Tilbyr MCP-servere (Model Context Protocol), CLI-verktøy eller API-er som KI-agenter kan hente informasjon om plattformen fra',
              value: 'mcp-context',
            },
            {
              label:
                'Har automatiske sjekker i CI/CD som også gjelder kode skrevet med KI (f.eks. sikkerhetsskanning, policysjekker)',
              value: 'ci-guardrails',
            },
            {
              label: `Vet ikke${EXCLUSIVE}`,
              value: 'unknown',
              exclusive: true,
            },
          ],
        },
        {
          id: 'q35-agent-interfaces',
          type: 'checkbox',
          title:
            'Hvordan kan utviklernes KI-kodeagenter (f.eks. Claude Code, GitHub Copilot, Cursor) samhandle med plattformen deres i dag?',
          required: true,
          showIf: hasPlatform,
          options: [
            {
              label: `Ingen egen tilrettelegging; agentene bruker bare lokal kildekode og vanlige kommandolinjeverktøy (f.eks. kubectl) med utviklerens egne tilganger${EXCLUSIVE}`,
              value: 'no-integration',
              exclusive: true,
            },
            {
              label:
                'Plattformdokumentasjon og skjemaer (CRD-er, Helm-verdier, OpenAPI) er lagt til rette for at KI-agenter kan lese dem (f.eks. llms.txt)',
              value: 'docs-llms-txt',
            },
            {
              label:
                'Vi tilbyr en egen MCP-server eller et eget verktøy som gir agenter lesetilgang til plattformen (f.eks. logger, status for applikasjoner, byggfeil)',
              value: 'mcp-read',
            },
            {
              label:
                'KI-agenter kan foreslå endringer på plattformen gjennom pull requests som et menneske godkjenner (f.eks. GitOps)',
              value: 'agent-pr',
            },
            {
              label:
                'KI-agenter kan gjøre endringer eller opprette ressurser direkte på plattformen via MCP, CLI eller API, med egen tilgangsstyring',
              value: 'agent-direct-write',
            },
            {
              label:
                'Plattformen tilbyr isolerte, kortvarige testmiljøer der KI-agenter kan kjøre og teste kode',
              value: 'sandbox-env',
            },
            {
              label: `Vi har bevisst sperret KI-agenter ute fra plattformen${EXCLUSIVE}`,
              value: 'restricted',
              exclusive: true,
            },
            {
              label: `Vet ikke${EXCLUSIVE}`,
              value: 'unknown',
              exclusive: true,
            },
          ],
        },
        {
          id: 'q36-ai-for-platform',
          type: 'checkbox',
          title:
            'Hvordan bruker plattformteamet selv KI-verktøy i utvikling og drift av plattformen?',
          required: true,
          options: [
            {
              label: `Plattformteamet bruker ikke KI-verktøy i arbeidet${EXCLUSIVE}`,
              value: 'none',
              exclusive: true,
            },
            {
              label:
                'Skrive og omstrukturere infrastrukturkode (f.eks. Terraform, Bicep, Helm, Kubernetes-manifester, operators)',
              value: 'iac-manifests',
            },
            {
              label:
                'Lage CI/CD-pipelines, skript og interne kommandolinjeverktøy',
              value: 'cicd-scripts',
            },
            {
              label:
                'Feilsøking, hendelseshåndtering og årsaksanalyse (f.eks. analysere logger og metrikker)',
              value: 'troubleshooting',
            },
            {
              label:
                'Skrive plattformdokumentasjon eller svare på spørsmål fra applikasjonsteam (f.eks. en chatbot basert på dokumentasjonen)',
              value: 'docs-support',
            },
            {
              label:
                'Skrive eller kontrollere sikkerhetspolicyer (f.eks. Kyverno, OPA/Rego, NetworkPolicies) og vurdere sårbarheter (CVE-er)',
              value: 'security-policy',
            },
            {
              label:
                'Automatiserte agenter som foreslår oppgraderinger, justerer ressursbruk eller lager pull requests i plattformens kodelagre',
              value: 'autonomous-ops',
            },
            {
              label: `Vi har ikke plattformteam${EXCLUSIVE}`,
              value: 'no-platform-team',
              exclusive: true,
            },
            {
              label: `Vet ikke / jeg er ikke i plattformteamet${EXCLUSIVE}`,
              value: 'unknown',
              exclusive: true,
            },
          ],
        },
        {
          id: 'q37-ai-changes',
          type: 'checkbox',
          title:
            'Har bruk av KI-kodeverktøy eller KI-applikasjoner i organisasjonen ført til endringer for plattformen eller plattformteamet?',
          description: 'Velg opptil tre alternativer som passer best.',
          required: true,
          maxSelections: 3,
          options: [
            {
              label: `Nei, vi merker liten eller ingen endring på plattformnivå så langt${EXCLUSIVE}`,
              value: 'no-change',
              exclusive: true,
            },
            {
              label:
                'Høyere endringstakt – flere pull requests, bygg og deployer gjennom CI/CD',
              value: 'more-deploys-prs',
            },
            {
              label:
                'Flere nye småapplikasjoner, prototyper eller tjenester som settes opp på plattformen',
              value: 'new-apps-experimentation',
            },
            {
              label:
                'Større behov for automatiske sperrer og policysjekker i plattformen',
              value: 'guardrail-demand',
            },
            {
              label:
                'Flere avklaringer om personvern og risiko (f.eks. DPIA, ROS)',
              value: 'compliance-load',
            },
            {
              label:
                'Økt etterspørsel fra teamene etter GPU, tilgang til språkmodeller, vektordatabaser eller KI-gateway',
              value: 'ai-infra-demand',
            },
            {
              label: 'Økte kostnader til sky, bygg eller API-er',
              value: 'cost-increase',
            },
            {
              label: 'Flere henvendelser om KI-generert konfigurasjon',
              value: 'support-burden',
            },
            {
              label: `Vet ikke / for tidlig å si${EXCLUSIVE}`,
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
          required: false,
          options: [
            {
              label:
                'Personvern og juridiske krav (f.eks. GDPR, KI-forordningen)',
              value: 'privacy-legal',
            },
            {
              label: 'Usikkerhet om databehandling hos skyleverandører',
              value: 'cloud-data-processing',
            },
            {
              label:
                'Sikkerhetsrisiko (f.eks. tilgangsstyring for agenter, datalekkasje, prompt injection, usikker kode)',
              value: 'security-risk',
            },
            {
              label:
                'For lite kapasitet i plattformteamet – kjerneplattform og vanlig drift må prioriteres',
              value: 'capacity-priority',
            },
            {
              label:
                'Kostnader for eller tilgang til GPU-maskinvare og skyressurser',
              value: 'cost-hardware',
            },
            {
              label:
                'For lite kompetanse i teamet om KI-infrastruktur eller KI-verktøy for utviklere',
              value: 'competence',
            },
            {
              label: 'Uklare behov fra applikasjonsteamene',
              value: 'unclear-demand',
            },
            {
              label: 'Lav etterspørsel fra applikasjonsteamene',
              value: 'low-demand',
            },
            {
              label: 'Vi opplever ingen vesentlige barrierer',
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
      ],
    },
    {
      id: 'contact',
      title: 'Avslutning og kontakt',
      questions: [
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
}
