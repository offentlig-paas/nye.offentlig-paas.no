import Image from 'next/image'
import { extractSlackUserId } from '@/lib/slack/utils'
import {
  getInitials,
  getBackgroundColor,
  AVATAR_SIZE_CLASSES,
  AVATAR_SIZE_PX,
} from '@/lib/avatar-utils'
import { WebClient } from '@slack/web-api'

interface ServerAvatarProps {
  name: string
  slackUserId?: string
  slackUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

interface SlackUserData {
  avatarUrl: string | null
  displayName: string
}

interface SlackUser {
  profile?: {
    image_512?: string
    image_192?: string
    image_72?: string
    image_48?: string
    image_32?: string
    image_24?: string
    real_name?: string
    display_name?: string
  }
  real_name?: string
  name?: string
}

let slackClient: WebClient | null = null

function getSlackClient(): WebClient | null {
  if (!process.env.SLACK_BOT_TOKEN) {
    return null
  }

  if (!slackClient) {
    slackClient = new WebClient(process.env.SLACK_BOT_TOKEN)
  }

  return slackClient
}

async function fetchSlackUserData(
  userId: string
): Promise<SlackUserData | null> {
  const slack = getSlackClient()

  if (!slack) {
    return null
  }

  try {
    const userInfo = await slack.users.info({ user: userId })

    if (!userInfo.ok || !userInfo.user) {
      return null
    }

    const user = userInfo.user as SlackUser

    const avatarUrl =
      user.profile?.image_512 ||
      user.profile?.image_192 ||
      user.profile?.image_72 ||
      user.profile?.image_48 ||
      user.profile?.image_32 ||
      user.profile?.image_24 ||
      null

    const displayName =
      user.profile?.display_name ||
      user.profile?.real_name ||
      user.real_name ||
      user.name ||
      'Unknown User'

    return { avatarUrl, displayName }
  } catch {
    return null
  }
}

export async function ServerAvatar({
  name,
  slackUserId,
  slackUrl,
  size = 'md',
  className = '',
}: ServerAvatarProps) {
  const resolvedSlackUserId =
    slackUserId || (slackUrl ? extractSlackUserId(slackUrl) : null)

  let slackUserData: SlackUserData | null = null
  if (resolvedSlackUserId) {
    try {
      slackUserData = await fetchSlackUserData(resolvedSlackUserId)
    } catch {
      // Fallback to initials if Slack API fails
    }
  }

  if (slackUserData?.avatarUrl) {
    return (
      <div className={`relative ${AVATAR_SIZE_CLASSES[size]} ${className}`}>
        <Image
          src={slackUserData.avatarUrl}
          alt={slackUserData.displayName || name}
          width={AVATAR_SIZE_PX[size]}
          height={AVATAR_SIZE_PX[size]}
          className="rounded-full object-cover"
          unoptimized
        />
      </div>
    )
  }

  const initials = getInitials(name)
  const backgroundColor = getBackgroundColor(name)

  return (
    <div
      className={`flex flex-none items-center justify-center rounded-full font-medium text-white ${AVATAR_SIZE_CLASSES[size]} ${backgroundColor} ${className}`}
    >
      {initials}
    </div>
  )
}
