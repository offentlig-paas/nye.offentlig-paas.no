import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BanknotesIcon,
  LinkIcon,
  PresentationChartLineIcon,
  VideoCameraIcon,
  StarIcon,
  GlobeAltIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { Avatar } from './Avatar'
import { AddToSlackChannelButton } from './AddToSlackChannelButton'
import { formatDateTime } from '@/lib/formatDate'
import { getUniqueSpeakers } from '@/lib/events/helpers'

interface AdminEventDetailsSidebarProps {
  eventDetails: {
    startTime: string
    location: string
    audience: string
    registration: {
      disabled?: boolean
      attendanceTypes: string[]
    }
    price?: string
    registrationUrl?: string
    callForPapersUrl?: string
    recordingUrl?: string
    eventStats?: {
      participants: number
      organisations: number
      registrations: number
      feedback?: {
        url: string
        averageRating: number
      }
    }
    organizers: Array<{
      name: string
      url?: string
      org?: string
    }>
    schedule: Array<{
      time: string
      speakers?: Array<{
        name: string
        url?: string
        org?: string
      }>
    }>
  }
  eventSlug?: string
  slackChannelName?: string
  onUpdate?: () => void
  showError?: (title: string, message: string) => void
  showSuccess?: (title: string, message: string) => void
}

const AttendanceTypeDisplay: Record<string, string> = {
  physical: 'Fysisk',
  digital: 'Digitalt',
}

export function AdminEventDetailsSidebar({
  eventDetails,
  eventSlug,
  slackChannelName,
  onUpdate,
  showError,
  showSuccess,
}: AdminEventDetailsSidebarProps) {
  const speakers = getUniqueSpeakers(eventDetails.schedule)
  const hasSlackIntegration =
    eventSlug && slackChannelName && onUpdate && showError && showSuccess

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Fagdagdetaljer
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <CalendarIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Tid
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(eventDetails.startTime)}
              </dd>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Sted
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {eventDetails.location}
              </dd>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <UserGroupIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Målgruppe
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {eventDetails.audience}
              </dd>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Påmeldingssystem
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  <div className="flex flex-wrap items-center gap-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        !eventDetails.registration.disabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {!eventDetails.registration.disabled
                        ? 'Aktivert'
                        : 'Deaktivert'}
                    </span>
                    {eventDetails.registration.attendanceTypes.map(
                      (type, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {AttendanceTypeDisplay[type] || type}
                        </span>
                      )
                    )}
                  </div>
                </dd>
              </div>
            </div>

            {eventDetails.price && (
              <div className="flex items-start space-x-2">
                <BanknotesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Pris
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {eventDetails.price}
                  </dd>
                </div>
              </div>
            )}
          </div>
        </div>

        {(eventSlug ||
          eventDetails.registrationUrl ||
          eventDetails.callForPapersUrl ||
          eventDetails.recordingUrl ||
          eventDetails.eventStats?.feedback?.url) && (
          <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
            <dt className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Lenker
            </dt>
            <dd className="flex flex-wrap gap-3">
              {eventSlug && (
                <>
                  <a
                    href={`/fagdag/${eventSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <GlobeAltIcon className="mr-1 h-3 w-3" />
                    Offentlig side
                  </a>
                  <a
                    href={`/admin/events/${eventSlug}/photos`}
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <PhotoIcon className="mr-1 h-3 w-3" />
                    Bilder
                  </a>
                </>
              )}
              {eventDetails.registrationUrl && (
                <a
                  href={eventDetails.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <LinkIcon className="mr-1 h-3 w-3" />
                  Påmelding
                </a>
              )}
              {eventDetails.callForPapersUrl && (
                <a
                  href={eventDetails.callForPapersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <PresentationChartLineIcon className="mr-1 h-3 w-3" />
                  Call for Papers
                </a>
              )}
              {eventDetails.recordingUrl && (
                <a
                  href={eventDetails.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <VideoCameraIcon className="mr-1 h-3 w-3" />
                  Opptak
                </a>
              )}
              {eventDetails.eventStats?.feedback?.url && (
                <a
                  href={eventDetails.eventStats.feedback.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <StarIcon className="mr-1 h-3 w-3" />
                  Tilbakemeldinger (
                  {eventDetails.eventStats.feedback.averageRating.toFixed(1)}/5)
                </a>
              )}
            </dd>
          </div>
        )}

        {eventDetails.organizers.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Arrangører
              </dt>
              {hasSlackIntegration && (
                <AddToSlackChannelButton
                  eventSlug={eventSlug!}
                  userGroup="organizers"
                  count={eventDetails.organizers.length}
                  channelName={slackChannelName!}
                  onUpdate={onUpdate!}
                  showError={showError!}
                  showSuccess={showSuccess!}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {eventDetails.organizers.map((organizer, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Avatar
                    name={organizer.name}
                    slackUrl={organizer.url}
                    size="xs"
                  />
                  <div className="text-sm">
                    {organizer.url ? (
                      <a
                        href={organizer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {organizer.name}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {organizer.name}
                      </span>
                    )}
                    {organizer.org && (
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        ({organizer.org})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {speakers.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Foredragsholdere
              </dt>
              {hasSlackIntegration && (
                <AddToSlackChannelButton
                  eventSlug={eventSlug!}
                  userGroup="speakers"
                  count={speakers.length}
                  channelName={slackChannelName!}
                  onUpdate={onUpdate!}
                  showError={showError!}
                  showSuccess={showSuccess!}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {speakers.map((speaker, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Avatar
                    name={speaker.name}
                    slackUrl={speaker.url}
                    size="xs"
                  />
                  <div className="text-sm">
                    {speaker.url ? (
                      <a
                        href={speaker.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {speaker.name}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {speaker.name}
                      </span>
                    )}
                    {speaker.org && (
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        ({speaker.org})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {eventDetails.eventStats && (
          <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
            <dt className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Statistikk fra arrangementet
            </dt>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {eventDetails.eventStats.participants}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Deltakere
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {eventDetails.eventStats.organisations}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Organisasjoner
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {eventDetails.eventStats.registrations}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Påmeldinger
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
