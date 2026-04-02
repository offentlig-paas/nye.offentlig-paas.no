import { vi } from 'vitest'

export const auth = vi.fn()
export const signIn = vi.fn()
export const signOut = vi.fn()
export const handlers = {
  GET: vi.fn(),
  POST: vi.fn(),
}
