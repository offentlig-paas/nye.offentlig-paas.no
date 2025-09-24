export function extractSlackUserId(slackUrl: string): string | null {
  const match = slackUrl.match(/\/team\/([A-Z0-9]+)$/)
  return match ? match[1] || null : null
}

export function generateSlackTeamUrl(
  userId: string,
  teamDomain: string = 'offentlig-paas-no'
): string {
  return `https://${teamDomain}.slack.com/team/${userId}`
}

export function isValidSlackUserId(userId: string): boolean {
  return /^U[A-Z0-9]+$/.test(userId)
}
