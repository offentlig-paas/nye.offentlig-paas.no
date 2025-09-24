'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { extractSlackUserId } from '@/lib/slack/utils'
import {
  getInitials,
  getBackgroundColor,
  AVATAR_SIZE_CLASSES,
  AVATAR_SIZE_PX,
} from '@/lib/avatar-utils'

interface AvatarProps {
  name: string
  slackUserId?: string
  slackUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

interface SlackUserData {
  userId: string
  avatarUrl: string | null
  displayName: string
}

export function Avatar({
  name,
  slackUserId,
  slackUrl,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [slackUserData, setSlackUserData] = useState<SlackUserData | null>(null)
  const [hasError, setHasError] = useState(false)

  const resolvedSlackUserId =
    slackUserId || (slackUrl ? extractSlackUserId(slackUrl) : null)

  useEffect(() => {
    if (resolvedSlackUserId && !slackUserData && !hasError) {
      fetchSlackUserData(resolvedSlackUserId)
        .then(data => {
          setSlackUserData(data)
          setHasError(false)
        })
        .catch(() => {
          setHasError(true)
        })
    }
  }, [resolvedSlackUserId, slackUserData, hasError])

  if (slackUserData?.avatarUrl && !hasError) {
    return (
      <Image
        src={slackUserData.avatarUrl}
        alt={slackUserData.displayName || name}
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

async function fetchSlackUserData(userId: string): Promise<SlackUserData> {
  const response = await fetch(`/api/slack/user/${userId}/avatar`)

  if (!response.ok) {
    throw new Error('Failed to fetch user data')
  }

  return response.json()
}
