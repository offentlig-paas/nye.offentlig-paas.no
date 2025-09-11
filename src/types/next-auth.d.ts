import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      slackId?: string
      slackTeamId?: string
      isAdmin?: boolean
      title?: string
      statusText?: string
      department?: string
      adminGroups?: string[]
      slackProfile?: Record<string, unknown>
    } & DefaultSession['user']
  }

  interface User {
    slackId?: string
    slackTeamId?: string
    isAdmin?: boolean
    title?: string
    statusText?: string
    department?: string
    adminGroups?: string[]
    slackProfile?: Record<string, unknown>
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    slackId?: string
    slackTeamId?: string
    accessToken?: string
    isAdmin?: boolean
    isGroupAdmin?: boolean
    title?: string
    statusText?: string
    department?: string
    adminGroups?: string[]
    slackProfile?: Record<string, unknown>
  }
}
