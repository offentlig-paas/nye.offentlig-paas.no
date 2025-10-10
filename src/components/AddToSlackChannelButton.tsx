import { useState } from 'react'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import {
  type UserGroup,
  buildDetailedInvitationMessage,
} from '@/lib/slack/types'

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

  const handleAddToChannel = async () => {
    setIsAdding(true)
    try {
      const response = await fetch(
        `/api/admin/events/${eventSlug}/slack-channel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add-members',
            userGroups: [userGroup],
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()

        const message =
          data.message ||
          buildDetailedInvitationMessage(
            data.invited,
            data.alreadyInChannel,
            channelName
          )

        if (data.failed > 0) {
          showError(
            'Delvis fullført',
            `${data.invited} medlemmer lagt til, men ${data.failed} feilet.`
          )
        } else {
          showSuccess('Lagt til i Slack', message)
        }
        onUpdate()
      } else {
        const error = await response.json()
        const errorMsg =
          error.details || error.error || 'Kunne ikke legge til medlemmer'
        showError('Feil', errorMsg)
      }
    } catch {
      showError('Feil', 'Noe gikk galt ved å legge til medlemmer')
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
