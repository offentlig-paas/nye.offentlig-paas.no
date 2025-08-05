export async function getUserCount(): Promise<number> {
  const getHost = (): string => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}://${window.location.hostname}`
    }
    return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  }

  const fetchUserCount = async (host: string): Promise<number> => {
    try {
      const response = await fetch(`${host}/api/slack/userCount`)
      if (!response.ok) {
        console.error('Failed to fetch user count:', response.statusText)
        return 0
      }
      const data = await response.json()
      if (data.error) {
        console.error('Error in response data:', data.error)
        return 0
      }
      return data.userCount
    } catch (error) {
      console.error('Error fetching user count:', error)
      return 0
    }
  }

  const host = getHost()
  return fetchUserCount(host)
}
