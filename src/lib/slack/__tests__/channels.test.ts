import { describe, it, expect, vi, beforeEach } from 'vitest'

const slack = {
  paginate: vi.fn(),
  conversations: {
    create: vi.fn(),
    join: vi.fn(),
    unarchive: vi.fn(),
  },
}

vi.mock('@slack/web-api', () => ({
  WebClient: vi.fn(function () {
    return slack
  }),
  LogLevel: { ERROR: 'error' },
}))

async function* pages(...p: unknown[]) {
  yield* p
}

describe('createChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SLACK_BOT_TOKEN = 'xoxb-test'
  })

  it('finds an existing channel on a later page', async () => {
    const { createChannel } = await import('../channels')
    slack.paginate.mockReturnValue(
      pages(
        { channels: [{ id: 'C1', name: 'general' }] },
        { channels: [{ id: 'C2', name: 'fagdag-oktober-2026' }] }
      )
    )

    const channel = await createChannel('fagdag-oktober-2026')

    expect(channel).toEqual({ id: 'C2', name: 'fagdag-oktober-2026' })
    expect(slack.conversations.create).not.toHaveBeenCalled()
    expect(slack.conversations.unarchive).not.toHaveBeenCalled()
  })

  it('unarchives an archived channel instead of creating a new one', async () => {
    const { createChannel } = await import('../channels')
    slack.paginate.mockReturnValue(
      pages({
        channels: [
          { id: 'C3', name: 'fagdag-oktober-2026', is_archived: true },
        ],
      })
    )

    const channel = await createChannel('fagdag-oktober-2026')

    expect(channel?.id).toBe('C3')
    expect(slack.conversations.unarchive).toHaveBeenCalledWith({
      channel: 'C3',
    })
    expect(slack.conversations.create).not.toHaveBeenCalled()
  })

  it('creates the channel when no match exists', async () => {
    const { createChannel } = await import('../channels')
    slack.paginate.mockReturnValue(pages({ channels: [] }))
    slack.conversations.create.mockResolvedValue({
      ok: true,
      channel: { id: 'C4' },
    })

    const channel = await createChannel('fagdag-oktober-2026')

    expect(channel?.id).toBe('C4')
  })
})
