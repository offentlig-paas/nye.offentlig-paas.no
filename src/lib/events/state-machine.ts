import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/root'

type RouterOutput = inferRouterOutputs<AppRouter>
type EventDetails = RouterOutput['admin']['events']['getDetails']

enum EventState {
  PRE_EVENT = 'PRE_EVENT',
  POST_EVENT = 'POST_EVENT',
}

export function getEventState(eventDate: Date | string): EventState {
  const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  const now = new Date()

  return date > now ? EventState.PRE_EVENT : EventState.POST_EVENT
}

export interface ChecklistItem {
  id: string
  label: string
  isComplete: (eventDetails: EventDetails) => boolean
  actionLink?: string
  actionLabel?: string
}

const PRE_EVENT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'schedule-published',
    label: 'Program publisert',
    isComplete: eventDetails =>
      !!eventDetails.schedule && eventDetails.schedule.length > 0,
    actionLink: '/agenda',
    actionLabel: 'Administrer program',
  },
  {
    id: 'speakers-matched',
    label: 'Alle foredragsholdere koblet til Slack',
    isComplete: eventDetails => {
      if (!eventDetails.schedule) return true

      const speakersWithoutUrls = eventDetails.schedule
        .filter(item => item.speakers && item.speakers.length > 0)
        .flatMap(item => item.speakers!)
        .filter(
          (speaker, index, self) =>
            index === self.findIndex(s => s.name === speaker.name)
        )
        .filter(speaker => !speaker.url)

      return speakersWithoutUrls.length === 0
    },
    actionLink: '/agenda',
    actionLabel: 'Koble foredragsholdere',
  },
  {
    id: 'slack-channel-created',
    label: 'Slack-kanal opprettet',
    isComplete: eventDetails => !!eventDetails.slackChannel?.id,
    actionLabel: 'Opprett kanal',
  },
  {
    id: 'participant-info',
    label: 'Deltakerinformasjon lagt til',
    isComplete: _eventDetails => {
      // This will be evaluated with participantInfo passed separately in component
      return false
    },
    actionLabel: 'Legg til info',
  },
  {
    id: 'registrations-active',
    label: 'Påmelding åpen',
    isComplete: eventDetails =>
      !eventDetails.registration.disabled &&
      eventDetails.stats.activeRegistrations > 0,
    actionLink: '/attendees',
    actionLabel: 'Se påmeldinger',
  },
]

const POST_EVENT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'feedback-collected',
    label: 'Tilbakemeldinger samlet inn (5+)',
    isComplete: eventDetails =>
      (eventDetails.stats.feedbackSummary?.totalResponses ?? 0) >= 5,
    actionLink: '/feedback',
    actionLabel: 'Se tilbakemeldinger',
  },
  {
    id: 'slides-uploaded',
    label: 'Presentasjoner lastet opp (50%+)',
    isComplete: eventDetails => {
      if (!eventDetails.schedule) return false

      const talksWithSpeakers = eventDetails.schedule.filter(
        item =>
          (item.type === 'Presentation' ||
            item.type === 'Panel' ||
            item.type === 'Workshop') &&
          item.speakers &&
          item.speakers.length > 0
      )

      if (talksWithSpeakers.length === 0) return true

      const talksWithAttachments = talksWithSpeakers.filter(
        talk => talk.attachments && talk.attachments.length > 0
      )

      return talksWithAttachments.length / talksWithSpeakers.length >= 0.5
    },
    actionLink: '/agenda',
    actionLabel: 'Last opp presentasjoner',
  },
  {
    id: 'photos-uploaded',
    label: 'Bilder lastet opp',
    isComplete: _eventDetails => {
      // This will be checked via Sanity photos count in the component
      return false // Default to incomplete, component will override
    },
    actionLink: '/photos',
    actionLabel: 'Last opp bilder',
  },
  {
    id: 'recording-added',
    label: 'Opptak-lenke lagt til',
    isComplete: _eventDetails => false,
    actionLabel: 'Legg til opptak',
  },
  {
    id: 'slack-archived',
    label: 'Slack-kanal arkivert',
    isComplete: _eventDetails => {
      // Slack doesn't provide archive status easily, so we'll skip this check
      return false // Default to incomplete
    },
    actionLabel: 'Arkiver kanal',
  },
]

export function getChecklistForState(state: EventState): ChecklistItem[] {
  return state === EventState.PRE_EVENT
    ? PRE_EVENT_CHECKLIST
    : POST_EVENT_CHECKLIST
}
