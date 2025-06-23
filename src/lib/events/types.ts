export interface Event {
  slug: string;
  title: string;
  ingress: string;
  description?: string;
  start: Date
  end: Date
  price?: string;
  audience: Audience;
  location: string;
  registrationUrl?: string;
  callForPapersUrl?: string;
  callForPapersClosedDate?: Date;
  recordingUrl?: string;
  organizers: Organizer[];
  schedule: Item[];
  stats?: Stats;
}

export interface Stats {
  registrations: number;
  participants: number;
  organisations: number;
  feedback?: Feedback;
}

export interface Feedback {
  url: string;
  averageRating: number;
  respondents: number;
  comments: string[];
}

export enum Audience {
  OpenForAll = 'Åpen for alle interesserte',
  PublicSector = 'For ansatte i offentlig sektor',
  InviteOnly = 'For inviterte deltakere',
}

export enum Status {
  Upcoming = 'upcoming',
  Past = 'past',
  Current = 'current',
}

export interface Organizer {
  name: string;
  org?: string;
  url?: string;
}

export interface Item {
  title: string;
  speaker?: string;
  description?: string;
  time: string;
  type: ItemType;
  attachments?: Attachment[];
}

export interface Attachment {
  title?: string;
  url: string;
  type: AttachmentType;
}

export enum AttachmentType {
  Link = 'Link',
  PDF = 'PDF',
  Video = 'Video',
  Slides = 'Slides',
  Code = 'Code',
  Recording = 'Recording',
  Other = 'Other',
}

export enum ItemType {
  Break = 'Pause',
  Info = 'Informasjon',
  Panel = 'Panel',
  Registration = 'Registrering',
  Talk = 'Presentation',
  Workshop = 'Workshop',
}
