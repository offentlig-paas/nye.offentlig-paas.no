/**
 * Environment utilities for server-side code
 */

/**
 * Checks if the current environment is development
 */
function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Checks if the application URL is a development URL (localhost/127.0.0.1)
 */
function isDevelopmentUrl(url?: string): boolean {
  const targetUrl =
    url || process.env.NEXT_PUBLIC_URL || 'https://offentlig-paas.no'
  const host = targetUrl.replace(/^https?:\/\//, '')
  return host.includes('localhost') || host.includes('127.0.0.1')
}

/**
 * Checks if messaging operations are allowed in the current environment
 * Returns true if messaging should be blocked
 */
export function shouldBlockMessaging(testMode?: boolean): boolean {
  return isDevelopmentEnvironment() && !testMode && isDevelopmentUrl()
}

/**
 * Gets the application URL with protocol
 */
export function getAppUrl(): { protocol: string; host: string; url: string } {
  const protocol = 'https'
  const host =
    process.env.NEXT_PUBLIC_URL?.replace(/^https?:\/\//, '') ||
    'offentlig-paas.no'
  return {
    protocol,
    host,
    url: `${protocol}://${host}`,
  }
}
