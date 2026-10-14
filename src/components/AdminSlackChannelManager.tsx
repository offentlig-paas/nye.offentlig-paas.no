'use client'

import { useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
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
    <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-700/80 dark:bg-zinc-800">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Slack-kanal
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kanal for deltakere og arrangører
              </p>
            </div>
          </div>
          {channelId && channelName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />#
              {channelName}
            </span>
          )}
        </div>

        {channelId && channelName ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={() => handleAddMembers([USER_GROUPS.ORGANIZERS])}
                disabled={isAddingMembers || organizersCount === 0}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <UserGroupIcon className="h-3.5 w-3.5 text-zinc-400" />
                Arrangører ({organizersCount})
              </button>

              <button
                onClick={() => handleAddMembers([USER_GROUPS.SPEAKERS])}
                disabled={isAddingMembers || speakersCount === 0}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <UserGroupIcon className="h-3.5 w-3.5 text-zinc-400" />
                Foredragsholdere ({speakersCount})
              </button>

              <button
                onClick={() => handleAddMembers([USER_GROUPS.ATTENDEES])}
                disabled={isAddingMembers || attendeesCount === 0}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <UserGroupIcon className="h-3.5 w-3.5 text-zinc-400" />
                Deltakere ({attendeesCount})
              </button>
            </div>

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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-700 dark:hover:bg-purple-600"
            >
              <UserGroupIcon className="h-4 w-4" />
              Legg til alle i kanalen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Det er ikke opprettet noen dedikert Slack-kanal for denne fagdagen
              ennå.
            </p>
            <button
              onClick={handleCreateChannel}
              disabled={isCreating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-700 dark:hover:bg-purple-600"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              {isCreating ? 'Oppretter kanal...' : 'Opprett Slack-kanal'}
            </button>
          </div>
        )}
      </div>

      {channelId && channelName && (
        <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-700/50">
          <button
            onClick={handleArchiveChannel}
            disabled={isArchiving}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <ArchiveBoxIcon className="h-3.5 w-3.5" />
            {isArchiving ? 'Arkiverer...' : 'Arkiver kanal'}
          </button>
        </div>
      )}
    </div>
  )
}
