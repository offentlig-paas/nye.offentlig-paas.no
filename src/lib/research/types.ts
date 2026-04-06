export enum ResearchStatus {
  Planning = 'Planlegging',
  DataCollection = 'Datainnsamling',
  Analysis = 'Analyse',
  Writing = 'Skriving',
  UnderReview = 'Fagfellevurdering',
  Published = 'Publisert',
  Ongoing = 'Pågående',
}

export enum SurveyStatus {
  Open = 'Åpen',
  Closed = 'Avsluttet',
}

export enum PaperStatus {
  Draft = 'Utkast',
  UnderReview = 'Under fagfellevurdering',
  Accepted = 'Akseptert',
  Published = 'Publisert',
}

export interface ResearchWave {
  name: string
  year: number
  status: ResearchStatus
  organizations?: number
  invited?: number
  description?: string
}

export interface ResearchAuthor {
  name: string
  affiliation?: string
}

export interface ResearchPaper {
  title: string
  url?: string
  date: string
  venue?: string
  venueDate?: string
  status: PaperStatus
  authors?: ResearchAuthor[]
  abstract?: string
  label?: string
}

export interface ResearchSurvey {
  title: string
  url?: string
  status: SurveyStatus
  responses?: number
  waveName?: string
  description?: string
}

export interface ResearchDataset {
  title: string
  url: string
  format: string
  description?: string
}

export interface ResearchEthics {
  dataController: string
  contactEmail: string
  legalBasis: string
  siktAssessment: string
  consentStatus: string
  anonymization: string
  retentionPeriod?: string
}

export interface ResearchProject {
  slug: string
  title: string
  description: string
  longDescription?: string
  researchQuestions?: string[]
  methodology?: string
  keyFindings?: string[]
  status: ResearchStatus
  tags: string[]
  lead: string
  startDate: string
  lastUpdated: string
  callout?: {
    headline: string
    subtitle: string
    linkText: string
    linkHref: string
  }
  waves?: ResearchWave[]
  papers?: ResearchPaper[]
  surveys?: ResearchSurvey[]
  datasets?: ResearchDataset[]
  ethics?: ResearchEthics
}
