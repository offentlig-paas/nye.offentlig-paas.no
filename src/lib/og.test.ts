import { describe, expect, it } from 'vitest'
import { siteUrl, truncate } from './og'

describe('siteUrl', () => {
  it.each(['', 'https://', undefined])('falls back for %s', v =>
    expect(siteUrl({ NEXT_PUBLIC_URL: v }).href).toBe(
      'https://offentlig-paas.no/'
    )
  )
  it('uses a valid URL', () =>
    expect(siteUrl({ NEXT_PUBLIC_URL: 'https://x.vercel.app' }).host).toBe(
      'x.vercel.app'
    ))
})

describe('truncate', () => {
  it('keeps short text', () => expect(truncate('Kort', 10)).toBe('Kort'))
  it('cuts on a word boundary', () =>
    expect(truncate('Plattformer i offentlig sektor', 20)).toBe(
      'Plattformer i…'
    ))
})
