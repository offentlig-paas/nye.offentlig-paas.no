'use client'

import { Avatar } from '@/components/Avatar'

interface Participant {
  name: string
  slackUserId?: string
}

interface OverlappingAvatarsProps {
  participants: Participant[]
  totalCount: number
  maxVisible?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function OverlappingAvatars({
  participants,
  totalCount,
  maxVisible = 5,
  size = 'sm',
  className = '',
}: OverlappingAvatarsProps) {
  const visibleParticipants = participants.slice(0, maxVisible)
  const remainingCount = totalCount - maxVisible

  if (participants.length === 0) {
    return null
  }

  const getSizeClasses = (avatarSize: string) => {
    switch (avatarSize) {
      case 'xs':
        return 'h-6 w-6'
      case 'sm':
        return 'h-8 w-8'
      case 'md':
        return 'h-10 w-10'
      case 'lg':
        return 'h-12 w-12'
      default:
        return 'h-8 w-8'
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {visibleParticipants.map((participant, index) => (
          <div
            key={`${participant.slackUserId || participant.name}-${index}`}
            className="relative"
            style={{ zIndex: maxVisible - index }}
          >
            <div className="rounded-full ring-2 ring-white dark:ring-gray-800">
              <Avatar
                name={participant.name}
                slackUserId={participant.slackUserId}
                size={size}
                className="relative transition-transform hover:z-10 hover:scale-110"
              />
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className="relative flex items-center justify-center rounded-full bg-gray-100 ring-2 ring-white dark:bg-gray-700 dark:ring-gray-800"
            style={{ zIndex: 0 }}
          >
            <div
              className={`flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 ${getSizeClasses(
                size
              )}`}
            >
              +{remainingCount}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
