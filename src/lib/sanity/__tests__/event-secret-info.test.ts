import { getEventSecretInfo } from '../event-secret-info'
import { sanityClient } from '../config'

jest.mock('../config', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}))

describe('getEventSecretInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return secret info when found', async () => {
    const mockSecretInfo = {
      _id: 'test-id',
      _type: 'eventSecretInfo',
      eventSlug: '2025-10-15-selvbetjening-fagdag',
      streamingUrl: 'https://example.com/stream',
      notes: 'Test notes',
    }

    ;(sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockSecretInfo)

    const result = await getEventSecretInfo('2025-10-15-selvbetjening-fagdag')

    expect(result).toEqual({
      streamingUrl: 'https://example.com/stream',
      notes: 'Test notes',
    })
  })

  it('should return null when no secret info found', async () => {
    ;(sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null)

    const result = await getEventSecretInfo('non-existent-event')

    expect(result).toBeNull()
  })

  it('should return null on error', async () => {
    ;(sanityClient.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const result = await getEventSecretInfo('test-event')

    expect(result).toBeNull()
  })

  it('should handle partial data correctly', async () => {
    const mockSecretInfo = {
      _id: 'test-id',
      _type: 'eventSecretInfo',
      eventSlug: '2025-10-15-selvbetjening-fagdag',
      streamingUrl: 'https://example.com/stream',
    }

    ;(sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockSecretInfo)

    const result = await getEventSecretInfo('2025-10-15-selvbetjening-fagdag')

    expect(result).toEqual({
      streamingUrl: 'https://example.com/stream',
      notes: undefined,
    })
  })
})
