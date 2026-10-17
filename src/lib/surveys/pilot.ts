import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (s: string) => createHash('sha256').update(s).digest()

/** Checks a pilot token against SURVEY_PILOT_TOKEN in constant time. */
export function isValidPilotToken(token: unknown): boolean {
  const expected = process.env.SURVEY_PILOT_TOKEN
  if (!expected || typeof token !== 'string' || !token) return false
  return timingSafeEqual(digest(token), digest(expected))
}
