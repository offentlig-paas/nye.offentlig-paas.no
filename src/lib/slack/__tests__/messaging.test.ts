import { WebClient } from '@slack/web-api'

jest.mock('@slack/web-api')

const mockPostMessage = jest.fn()

;(WebClient as jest.MockedClass<typeof WebClient>).mockImplementation(
  () =>
    ({
      chat: {
        postMessage: mockPostMessage,
      },
    }) as unknown as WebClient
)

// Import after mocking
import {
  sendDirectMessage,
  sendBulkDirectMessages,
  queueBulkDirectMessages,
} from '../messaging'

describe('Slack Messaging', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SLACK_BOT_TOKEN = 'test-token'
  })

  afterEach(() => {
    delete process.env.SLACK_BOT_TOKEN
  })

  describe('sendDirectMessage', () => {
    it('should send message successfully', async () => {
      mockPostMessage.mockResolvedValue({
        ok: true,
        ts: '1234567890.123456',
        channel: 'U123456',
      })

      const result = await sendDirectMessage('U123456', 'Test message')

      expect(result).toEqual({
        success: true,
        userId: 'U123456',
      })
      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: 'U123456',
        text: 'Test message',
        unfurl_links: false,
        unfurl_media: false,
      })
    })

    it('should handle Slack API errors', async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: 'user_not_found',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      const result = await sendDirectMessage('U999999', 'Test message')

      expect(result).toEqual({
        success: false,
        userId: 'U999999',
        error: 'user_not_found',
      })
    })

    it('should handle exceptions', async () => {
      mockPostMessage.mockRejectedValue(new Error('Network error'))

      const result = await sendDirectMessage('U123456', 'Test message')

      expect(result).toEqual({
        success: false,
        userId: 'U123456',
        error: 'Network error',
      })
    })

    it('should return error when Slack client not configured', async () => {
      delete process.env.SLACK_BOT_TOKEN

      const result = await sendDirectMessage('U123456', 'Test message')

      expect(result).toEqual({
        success: false,
        userId: 'U123456',
        error: 'Slack client not configured',
      })
      expect(mockPostMessage).not.toHaveBeenCalled()
    })

    it('should send message with blocks when payload object provided', async () => {
      mockPostMessage.mockResolvedValue({
        ok: true,
        ts: '1234567890.123456',
        channel: 'U123456',
      })

      const payload = {
        text: 'Fallback text',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Rich formatted message',
            },
          },
        ],
      }

      const result = await sendDirectMessage('U123456', payload)

      expect(result).toEqual({
        success: true,
        userId: 'U123456',
      })
      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: 'U123456',
        text: 'Fallback text',
        blocks: payload.blocks,
        unfurl_links: false,
        unfurl_media: false,
      })
    })
  })

  describe('sendBulkDirectMessages', () => {
    it('should send messages to multiple users in batches', async () => {
      mockPostMessage.mockResolvedValue({
        ok: true,
        ts: '1234567890.123456',
        channel: 'U123456',
      })

      const userIds = ['U1', 'U2', 'U3', 'U4', 'U5']
      const result = await sendBulkDirectMessages(userIds, 'Bulk message', {
        batchSize: 2,
        delayBetweenBatches: 10,
      })

      expect(result).toEqual({
        sent: 5,
        failed: 0,
        results: expect.arrayContaining([
          { success: true, userId: 'U1' },
          { success: true, userId: 'U2' },
          { success: true, userId: 'U3' },
          { success: true, userId: 'U4' },
          { success: true, userId: 'U5' },
        ]),
      })
      expect(mockPostMessage).toHaveBeenCalledTimes(5)
    })

    it('should handle partial failures', async () => {
      mockPostMessage
        .mockResolvedValueOnce({
          ok: true,
          ts: '1234567890.123456',
          channel: 'U1',
        })
        .mockResolvedValueOnce({
          ok: false,
          error: 'user_not_found',
        })
        .mockResolvedValueOnce({
          ok: true,
          ts: '1234567890.123457',
          channel: 'U3',
        })

      const userIds = ['U1', 'U2', 'U3']
      const result = await sendBulkDirectMessages(userIds, 'Bulk message', {
        batchSize: 10,
        delayBetweenBatches: 0,
      })

      expect(result.sent).toBe(2)
      expect(result.failed).toBe(1)
      expect(result.results).toHaveLength(3)
    })

    it('should process in batches with delays', async () => {
      jest.useFakeTimers()
      mockPostMessage.mockResolvedValue({
        ok: true,
        ts: '1234567890.123456',
        channel: 'U123456',
      })

      const userIds = Array.from({ length: 100 }, (_, i) => `U${i}`)
      const promise = sendBulkDirectMessages(userIds, 'Message', {
        batchSize: 50,
        delayBetweenBatches: 1000,
      })

      // Fast-forward time
      await jest.runAllTimersAsync()

      const result = await promise

      expect(result.sent).toBe(100)
      expect(mockPostMessage).toHaveBeenCalledTimes(100)

      jest.useRealTimers()
    })

    it('should use default options when not provided', async () => {
      mockPostMessage.mockResolvedValue({
        ok: true,
        ts: '1234567890.123456',
        channel: 'U123456',
      })

      const userIds = ['U1', 'U2']
      const result = await sendBulkDirectMessages(userIds, 'Message')

      expect(result.sent).toBe(2)
    })
  })

  describe('queueBulkDirectMessages', () => {
    it('should queue messages and return immediately', async () => {
      mockPostMessage.mockResolvedValue({
        ok: true,
        ts: '1234567890.123456',
        channel: 'U123456',
      })

      const userIds = ['U1', 'U2', 'U3']
      const result = await queueBulkDirectMessages(userIds, 'Queued message')

      expect(result).toEqual({ queued: 3 })
      // Messages are sent asynchronously, so they shouldn't be sent immediately
      expect(mockPostMessage).not.toHaveBeenCalled()
    })
  })
})
