import { afterEach, describe, expect, it, vi } from 'vitest'
import { isValidPilotToken } from '../pilot'

describe('isValidPilotToken', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('accepts the configured token', () => {
    vi.stubEnv('SURVEY_PILOT_TOKEN', 'secret-token')
    expect(isValidPilotToken('secret-token')).toBe(true)
  })

  it('rejects a wrong or missing token', () => {
    vi.stubEnv('SURVEY_PILOT_TOKEN', 'secret-token')
    expect(isValidPilotToken('wrong')).toBe(false)
    expect(isValidPilotToken('')).toBe(false)
    expect(isValidPilotToken(undefined)).toBe(false)
  })

  it('rejects everything when no token is configured', () => {
    vi.stubEnv('SURVEY_PILOT_TOKEN', '')
    expect(isValidPilotToken('')).toBe(false)
    expect(isValidPilotToken('anything')).toBe(false)
  })
})
