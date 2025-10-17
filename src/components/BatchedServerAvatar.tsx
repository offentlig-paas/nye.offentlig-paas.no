import Image from 'next/image'
import {
  getInitials,
  getBackgroundColor,
  AVATAR_SIZE_CLASSES,
  AVATAR_SIZE_PX,
} from '@/lib/avatar-utils'

interface BatchedServerAvatarProps {
  name: string
  slackUserId?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  userData?: {
    avatarUrl: string | null
    displayName: string
  } | null
}

/**
 * Optimized ServerAvatar that accepts pre-fetched user data
 * Use with batchFetchSlackUsers for better performance
 */
export function BatchedServerAvatar({
  name,
  slackUserId: _slackUserId,
  size = 'md',
  className = '',
  userData,
}: BatchedServerAvatarProps) {
  if (userData?.avatarUrl) {
    return (
      <Image
        src={userData.avatarUrl}
        alt={userData.displayName || name}
        width={AVATAR_SIZE_PX[size]}
        height={AVATAR_SIZE_PX[size]}
        className={`${AVATAR_SIZE_CLASSES[size]} rounded-full object-cover ${className}`}
        unoptimized
      />
    )
  }

  const initials = getInitials(name)
  const backgroundColor = getBackgroundColor(name)

  return (
    <div
      className={`${AVATAR_SIZE_CLASSES[size]} flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white ${backgroundColor} ${className}`}
    >
      {initials}
    </div>
  )
}
