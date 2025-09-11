import { WebClient } from '@slack/web-api'

interface SlackUserInfo {
  id: string
  name: string
  real_name?: string
  profile?: {
    title?: string
    email?: string
    display_name?: string
    status_text?: string
    fields?: {
      [key: string]: {
        value?: string
      }
    }
  }
  is_admin?: boolean
  is_owner?: boolean
  is_primary_owner?: boolean
}

// Create a singleton Slack client
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

/**
 * Check if a user is an admin based on Slack workspace roles and usergroup membership
 */
export async function checkUserAdminStatus(userId: string): Promise<{
  isAdmin: boolean
  isWorkspaceAdmin: boolean
  isGroupAdmin: boolean
  adminGroups: string[]
  userInfo?: SlackUserInfo
}> {
  const slack = getSlackClient()

  if (!slack) {
    console.warn('SLACK_BOT_TOKEN not configured, cannot check admin status')
    return {
      isAdmin: false,
      isWorkspaceAdmin: false,
      isGroupAdmin: false,
      adminGroups: [],
    }
  }

  try {
    // Get user info to check workspace-level admin roles
    const userInfoResult = await slack.users.info({
      user: userId,
    })

    if (!userInfoResult.ok || !userInfoResult.user) {
      console.error('Failed to fetch user info:', userInfoResult.error)
      return {
        isAdmin: false,
        isWorkspaceAdmin: false,
        isGroupAdmin: false,
        adminGroups: [],
      }
    }

    const userInfo = userInfoResult.user as SlackUserInfo
    const isWorkspaceAdmin = !!(
      userInfo.is_admin ||
      userInfo.is_owner ||
      userInfo.is_primary_owner
    )

    // Check usergroup membership for admin groups
    const userGroupsResult = await slack.usergroups.list()

    if (!userGroupsResult.ok || !userGroupsResult.usergroups) {
      console.error('Failed to fetch usergroups:', userGroupsResult.error)
      // Return workspace admin status even if usergroups check fails
      return {
        isAdmin: isWorkspaceAdmin,
        isWorkspaceAdmin,
        isGroupAdmin: false,
        adminGroups: [],
        userInfo,
      }
    }

    // Find admin groups - specifically looking for Styret
    const adminGroups = userGroupsResult.usergroups.filter(
      (group: { handle?: string; name?: string }) => {
        const handle = group.handle?.toLowerCase() || ''
        const name = group.name?.toLowerCase() || ''

        return (
          handle === 'styret' ||
          handle === '@styret' ||
          name === 'styret' ||
          name === '@styret' ||
          handle.includes('admin') ||
          name.includes('admin')
        )
      }
    )

    let isGroupAdmin = false
    const userAdminGroups: string[] = []

    // Check if user is in any admin groups
    for (const group of adminGroups) {
      try {
        const membersResult = await slack.usergroups.users.list({
          usergroup: group.id!,
        })

        if (membersResult.ok && membersResult.users?.includes(userId)) {
          isGroupAdmin = true
          if (group.handle) {
            userAdminGroups.push(group.handle)
          }
        }
      } catch (error) {
        console.error(
          `Failed to check membership for group ${group.id}:`,
          error
        )
      }
    }

    return {
      isAdmin: isWorkspaceAdmin || isGroupAdmin,
      isWorkspaceAdmin,
      isGroupAdmin,
      adminGroups: userAdminGroups,
      userInfo,
    }
  } catch (error) {
    console.error('Error checking user admin status:', error)
    return {
      isAdmin: false,
      isWorkspaceAdmin: false,
      isGroupAdmin: false,
      adminGroups: [],
    }
  }
}
