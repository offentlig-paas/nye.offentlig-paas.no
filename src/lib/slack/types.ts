/**
 * Shared types and constants for Slack integration
 */

export const USER_GROUPS = {
  ORGANIZERS: 'organizers',
  SPEAKERS: 'speakers',
  ATTENDEES: 'attendees',
} as const

export type UserGroup = (typeof USER_GROUPS)[keyof typeof USER_GROUPS]

export interface InvitationResult {
  invited: number
  failed: number
  alreadyInChannel: number
  message?: string
}

/**
 * Builds a user-friendly message for invitation results
 */
export function buildInvitationMessage(
  invited: number,
  failed: number,
  alreadyInChannel: number
): string {
  if (failed > 0) {
    return `${invited} medlemmer lagt til, ${failed} feilet`
  }
  if (alreadyInChannel > 0) {
    return `${invited} medlemmer lagt til, ${alreadyInChannel} allerede i kanalen`
  }
  return `${invited} medlemmer lagt til`
}

/**
 * Builds a detailed message for invitation results including already in channel count
 */
export function buildDetailedInvitationMessage(
  invited: number,
  alreadyInChannel: number,
  channelName: string
): string {
  if (alreadyInChannel > 0) {
    return `${invited} nye medlemmer lagt til. ${alreadyInChannel} var allerede i kanalen.`
  }
  return `${invited} medlemmer lagt til i #${channelName}`
}
