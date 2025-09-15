import NextAuth from 'next-auth'
import Slack from 'next-auth/providers/slack'
import { checkUserAdminStatus } from '@/lib/slack-admin'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Slack({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Restrict to specific Slack workspace
      if (account?.provider === 'slack') {
        const expectedTeamId = process.env.SLACK_TEAM_ID

        let userTeamId: string | undefined

        if (
          account.team &&
          typeof account.team === 'object' &&
          'id' in account.team
        ) {
          userTeamId = account.team.id as string
        }

        if (!userTeamId && profile && typeof profile === 'object') {
          userTeamId = (profile as Record<string, unknown>)?.[
            'https://slack.com/team_id'
          ] as string | undefined
        }

        if (expectedTeamId && userTeamId && userTeamId !== expectedTeamId) {
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        const slackUserId = account.providerAccountId || user.id

        token.slackId = slackUserId
        token.picture = user.image

        if (
          account.team &&
          typeof account.team === 'object' &&
          'id' in account.team
        ) {
          token.slackTeamId = account.team.id as string
        }

        // Check admin status using bot token (with usergroups:read scope)
        if (slackUserId) {
          try {
            const adminStatus = await checkUserAdminStatus(slackUserId)
            token.isAdmin = adminStatus.isWorkspaceAdmin
            token.isGroupAdmin = adminStatus.isGroupAdmin
            token.adminGroups = adminStatus.adminGroups

            if (adminStatus.userInfo) {
              token.title = adminStatus.userInfo.profile?.title
              token.statusText = adminStatus.userInfo.profile?.status_text
              token.department =
                adminStatus.userInfo.profile?.fields?.department?.value
              token.slackProfile = adminStatus.userInfo.profile
            }
          } catch {
            // Silently handle admin status check errors
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!
        session.user.slackId = token.slackId as string
        session.user.slackTeamId = token.slackTeamId as string
        session.user.image = token.picture as string
        session.user.isAdmin = (token.isAdmin || token.isGroupAdmin) as boolean
        session.user.title = token.title as string
        session.user.statusText = token.statusText as string
        session.user.department = token.department as string
        session.user.adminGroups = token.adminGroups as string[]
        session.user.slackProfile = token.slackProfile as Record<
          string,
          unknown
        >
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
