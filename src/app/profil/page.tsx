import { auth } from '@/auth'
import { Container } from '@/components/Container'
import { redirect } from 'next/navigation'
import { events } from '@/data/events'
import { eventRegistrationService } from '@/domains/event-registration'
import { Status } from '@/lib/events/types'
import {
  getStatus,
  isUserEventOrganizer,
  isUserEventSpeaker,
  getUserTalksFromEvents,
} from '@/lib/events/helpers'
import type { EventRegistration } from '@/domains/event-registration/types'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { UpcomingEventsSection } from '@/components/profile/UpcomingEventsSection'
import { OrganizedEventsSection } from '@/components/profile/OrganizedEventsSection'
import { UserTalksSection } from '@/components/profile/UserTalksSection'
import { PastRegistrationsSection } from '@/components/profile/PastRegistrationsSection'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'

export default async function ProfilePage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/profil')
  }

  const user = session.user

  const userRegistrations = user.slackId
    ? await eventRegistrationService.getUserRegistrations(user.slackId)
    : []

  const upcomingRegistrationsByEvent = new Map(
    userRegistrations
      .filter((r: EventRegistration) => r.status === 'confirmed')
      .map((r: EventRegistration) => [r.eventSlug, r])
  )

  const upcomingEventsWithPriority = events
    .filter(event => {
      const status = getStatus(event)
      return status === Status.Upcoming || status === Status.Current
    })
    .map(event => {
      const isOrganizer = user.slackId
        ? isUserEventOrganizer(event, user.slackId)
        : false
      const isSpeaker = user.slackId
        ? isUserEventSpeaker(event, user.slackId)
        : false
      const isAttending = upcomingRegistrationsByEvent.has(event.slug)

      let priority = 0
      if (isOrganizer) {
        priority = 1
      } else if (isSpeaker) {
        priority = 2
      } else if (isAttending) {
        priority = 3
      }

      return {
        event,
        registration: upcomingRegistrationsByEvent.get(event.slug),
        priority,
        isOrganizer,
        isSpeaker,
        isAttending,
      }
    })
    .filter(item => item.priority > 0)
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return a.event.start.getTime() - b.event.start.getTime()
    })

  const nextUpcomingEvents = upcomingEventsWithPriority.slice(0, 1)

  const allRegistrationsByEvent = new Map(
    userRegistrations.map((r: EventRegistration) => [r.eventSlug, r])
  )

  const pastEvents = events
    .filter(event => {
      const status = getStatus(event)
      return status === Status.Past && allRegistrationsByEvent.has(event.slug)
    })
    .map(event => ({
      event,
      registration: allRegistrationsByEvent.get(event.slug)!,
    }))
    .sort((a, b) => b.event.start.getTime() - a.event.start.getTime())

  const organizedEvents = user.slackId
    ? events
        .filter(event => isUserEventOrganizer(event, user.slackId!))
        .sort((a, b) => b.start.getTime() - a.start.getTime())
    : []

  const userTalks = user.slackId ? getUserTalksFromEvents(user.slackId) : []

  return (
    <Container className="mt-16 sm:mt-24">
      <div className="max-w-7xl">
        <ProfileHeader user={user} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <UpcomingEventsSection
              events={nextUpcomingEvents}
              userSlackId={user.slackId}
            />
            <OrganizedEventsSection events={organizedEvents} />
            <UserTalksSection talks={userTalks} userSlackId={user.slackId!} />
            <PastRegistrationsSection events={pastEvents} />
          </div>

          <ProfileSidebar user={user} />
        </div>
      </div>
    </Container>
  )
}
