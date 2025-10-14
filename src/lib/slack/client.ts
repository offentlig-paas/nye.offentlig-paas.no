export async function getUserCount(): Promise<number> {
  const getHost = (): string => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}://${window.location.hostname}`
    }
    return process.env.NEXT_PUBLIC_URL || 'https://offentlig-paas.no'
  }

  const fetchUserCount = async (host: string): Promise<number> => {
    try {
      const response = await fetch(`${host}/api/slack/userCount`)
      if (!response.ok) {
        return 0
      }
      const data = await response.json()
      if (data.error) {
        return 0
      }
      return data.userCount
    } catch {
      return 0
    }
  }

  const host = getHost()
  return fetchUserCount(host)
}
