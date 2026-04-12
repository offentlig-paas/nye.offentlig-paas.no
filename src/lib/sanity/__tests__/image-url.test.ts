import { describe, it, expect, beforeEach, vi } from 'vitest'

const MOCK_PROJECT_ID = 'test-project'

describe('image-url', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exports urlForImage and prepareEventThumbnailUrls', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', MOCK_PROJECT_ID)
    const mod = await import('../image-url')
    expect(mod.urlForImage).toBeDefined()
    expect(mod.prepareEventThumbnailUrls).toBeDefined()
  })

  it('urlForImage throws when NEXT_PUBLIC_SANITY_PROJECT_ID is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', '')
    const mod = await import('../image-url')
    expect(() => mod.urlForImage({} as never)).toThrow(
      'Missing NEXT_PUBLIC_SANITY_PROJECT_ID'
    )
  })

  it('urlForImage returns an image builder when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', MOCK_PROJECT_ID)
    const mod = await import('../image-url')
    const imageRef = {
      _type: 'image' as const,
      asset: { _ref: 'image-abc-200x200-png', _type: 'reference' as const },
    }
    const result = mod.urlForImage(imageRef)
    expect(result).toBeDefined()
    expect(typeof result.width).toBe('function')
    expect(typeof result.url).toBe('function')
  })
})
