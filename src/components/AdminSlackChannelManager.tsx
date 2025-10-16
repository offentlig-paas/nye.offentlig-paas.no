import { useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { USER_GROUPS, buildDetailedInvitationMessage } from '@/lib/slack/types'
import { trpc } from '@/lib/trpc/client'

interface AdminSlackChannelManagerProps {
  eventSlug: string
  channelId?: string
  channelName?: string
  organizersCount: number
  speakersCount: number
  attendeesCount: number
  onUpdate: () => void
  showError: (title: string, message: string) => void
  showSuccess: (title: string, message: string) => void
}

export function AdminSlackChannelManager({
  eventSlug,
  channelId,
  channelName,
  organizersCount,
  speakersCount,
  attendeesCount,
  onUpdate,
  showError,
  showSuccess,
}: AdminSlackChannelManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const manageChannelMutation = trpc.admin.slackChannel.manage.useMutation()

  const handleCreateChannel = async () => {
    setIsCreating(true)
    try {
      const data = await manageChannelMutation.mutateAsync({
        slug: eventSlug,
        action: 'create',
      })

      showSuccess(
        'Kanal opprettet',
        `Slack-kanalen #${data.channelName} er opprettet`
      )
      onUpdate()
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Kunne ikke opprette kanal'
      showError('Feil', errorMsg)
    } finally {
      setIsCreating(false)
    }
  }

  const handleAddMembers = async (groups: string[]) => {
    setIsAddingMembers(true)
    try {
      const result = await manageChannelMutation.mutateAsync({
        slug: eventSlug,
        action: channelId ? 'add-members' : 'create',
        userGroups: groups,
      })

      const message =
        result.message ||
        buildDetailedInvitationMessage(
          result.invited || 0,
          result.alreadyInChannel || 0,
          result.channelName || ''
        )

      if ((result.failed || 0) > 0) {
        showError(
          'Delvis fullført',
          `${result.invited} medlemmer lagt til, men ${result.failed} feilet. Sjekk loggene for detaljer.`
        )
      } else {
        showSuccess('Medlemmer lagt til', message)
      }
      onUpdate()
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Kunne ikke legge til medlemmer'
      showError('Feil', errorMsg)
    } finally {
      setIsAddingMembers(false)
    }
  }

  const handleArchiveChannel = async () => {
    if (
      !confirm(
        'Er du sikker på at du vil arkivere denne kanalen? Dette kan ikke angres.'
      )
    ) {
      return
    }

    setIsArchiving(true)
    try {
      await manageChannelMutation.mutateAsync({
        slug: eventSlug,
        action: 'archive',
      })

      showSuccess('Kanal arkivert', `Slack-kanalen #${channelName} er arkivert`)
      onUpdate()
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Kunne ikke arkivere kanal'
      showError('Feil', errorMsg)
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <div className="mb-3 flex items-center">
        <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
          Slack-kanal
        </h3>
      </div>

      {channelId && channelName ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              #{channelName}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleAddMembers([USER_GROUPS.ORGANIZERS])}
              disabled={isAddingMembers || organizersCount === 0}
              className="inline-flex w-full items-center justify-center rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors duration-150 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-700 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
            >
              <UserGroupIcon className="mr-2 h-4 w-4" />
              Legg til arrangører ({organizersCount})
            </button>

            <button
              onClick={() => handleAddMembers([USER_GROUPS.SPEAKERS])}
              disabled={isAddingMembers || speakersCount === 0}
              className="inline-flex w-full items-center justify-center rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors duration-150 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-700 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
            >
              <UserGroupIcon className="mr-2 h-4 w-4" />
              Legg til foredragsholdere ({speakersCount})
            </button>

            <button
              onClick={() => handleAddMembers([USER_GROUPS.ATTENDEES])}
              disabled={isAddingMembers || attendeesCount === 0}
              className="inline-flex w-full items-center justify-center rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors duration-150 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-700 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
            >
              <UserGroupIcon className="mr-2 h-4 w-4" />
              Legg til deltakere ({attendeesCount})
            </button>

            <button
              onClick={() =>
                handleAddMembers([
                  USER_GROUPS.ORGANIZERS,
                  USER_GROUPS.SPEAKERS,
                  USER_GROUPS.ATTENDEES,
                ])
              }
              disabled={
                isAddingMembers ||
                (organizersCount === 0 &&
                  speakersCount === 0 &&
                  attendeesCount === 0)
              }
              className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserGroupIcon className="mr-2 h-4 w-4" />
              Legg til alle
            </button>
          </div>

          <button
            onClick={handleArchiveChannel}
            disabled={isArchiving}
            className="inline-flex w-full items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-gray-700"
          >
            <ArchiveBoxIcon className="mr-2 h-4 w-4" />
            Arkiver kanal
          </button>
        </div>
      ) : (
        <button
          onClick={handleCreateChannel}
          disabled={isCreating}
          className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChatBubbleLeftRightIcon className="mr-2 h-4 w-4" />
          Opprett kanal
        </button>
      )}
    </div>
  )
}
