import { useState } from 'react'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import {
  type UserGroup,
  buildDetailedInvitationMessage,
} from '@/lib/slack/types'
import { trpc } from '@/lib/trpc/client'

interface AddToSlackChannelButtonProps {
  eventSlug: string
  userGroup: UserGroup
  count: number
  channelName: string
  onUpdate: () => void
  showError: (title: string, message: string) => void
  showSuccess: (title: string, message: string) => void
}

export function AddToSlackChannelButton({
  eventSlug,
  userGroup,
  count,
  channelName,
  onUpdate,
  showError,
  showSuccess,
}: AddToSlackChannelButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const manageChannelMutation = trpc.admin.slackChannel.manage.useMutation()

  const handleAddToChannel = async () => {
    setIsAdding(true)
    try {
      const result = await manageChannelMutation.mutateAsync({
        slug: eventSlug,
        action: 'add-members',
        userGroups: [userGroup],
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
          `${result.invited} medlemmer lagt til, men ${result.failed} feilet.`
        )
      } else {
        showSuccess('Lagt til i Slack', message)
      }
      onUpdate()
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Kunne ikke legge til medlemmer'
      showError('Feil', errorMsg)
    } finally {
      setIsAdding(false)
    }
  }

  if (count === 0) {
    return null
  }

  return (
    <button
      onClick={handleAddToChannel}
      disabled={isAdding}
      className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
      title={`Legg til i #${channelName}`}
    >
      <ChatBubbleLeftRightIcon className="h-3 w-3" />
      {isAdding ? 'Legger til...' : 'Legg til i kanal'}
    </button>
  )
}
