import { getEventParticipantInfo } from '../event-participant-info'
import { sanityClient } from '../config'

jest.mock('../config', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
  sanityWriteClient: {
    patch: jest.fn(),
    create: jest.fn(),
  },
}))

describe('getEventParticipantInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return participant info when found', async () => {
    const mockParticipantInfo = {
      _id: 'test-id',
      _type: 'eventParticipantInfo',
      eventSlug: '2025-10-15-selvbetjening-fagdag',
      streamingUrl: 'https://example.com/stream',
      notes: 'Test notes',
    }

    ;(sanityClient.fetch as jest.Mock).mockResolvedValueOnce(
      mockParticipantInfo
    )

    const result = await getEventParticipantInfo(
      '2025-10-15-selvbetjening-fagdag'
    )

    expect(result).toEqual({
      streamingUrl: 'https://example.com/stream',
      notes: 'Test notes',
    })
  })

  it('should return null when no participant info found', async () => {
    ;(sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null)

    const result = await getEventParticipantInfo('non-existent-event')

    expect(result).toBeNull()
  })

  it('should return null on error', async () => {
    ;(sanityClient.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const result = await getEventParticipantInfo('test-event')

    expect(result).toBeNull()
  })

  it('should handle partial data correctly', async () => {
    const mockParticipantInfo = {
      _id: 'test-id',
      _type: 'eventParticipantInfo',
      eventSlug: '2025-10-15-selvbetjening-fagdag',
      streamingUrl: 'https://example.com/stream',
    }

    ;(sanityClient.fetch as jest.Mock).mockResolvedValueOnce(
      mockParticipantInfo
    )

    const result = await getEventParticipantInfo(
      '2025-10-15-selvbetjening-fagdag'
    )

    expect(result).toEqual({
      streamingUrl: 'https://example.com/stream',
      notes: undefined,
    })
  })
})
