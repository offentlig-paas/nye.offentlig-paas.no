import { getEventState, getChecklistForState } from '../events/state-machine'

describe('Event State Machine', () => {
  describe('getEventState', () => {
    it('returns PRE_EVENT for future dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const state = getEventState(futureDate)

      expect(state).toBe('PRE_EVENT')
    })

    it('returns POST_EVENT for past dates', () => {
      const pastDate = new Date('2020-01-01')

      const state = getEventState(pastDate)

      expect(state).toBe('POST_EVENT')
    })

    it('accepts string dates', () => {
      const state = getEventState('2020-01-01')

      expect(state).toBe('POST_EVENT')
    })

    it('accepts ISO string dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const state = getEventState(futureDate.toISOString())

      expect(state).toBe('PRE_EVENT')
    })
  })

  describe('getChecklistForState', () => {
    it('returns pre-event checklist items', () => {
      const items = getChecklistForState('PRE_EVENT' as never)

      expect(items.length).toBeGreaterThan(0)

      const ids = items.map(i => i.id)
      expect(ids).toContain('schedule-published')
      expect(ids).toContain('speakers-matched')
      expect(ids).toContain('slack-channel-created')
      expect(ids).toContain('registrations-active')
    })

    it('returns post-event checklist items', () => {
      const items = getChecklistForState('POST_EVENT' as never)

      expect(items.length).toBeGreaterThan(0)

      const ids = items.map(i => i.id)
      expect(ids).toContain('feedback-collected')
      expect(ids).toContain('slides-uploaded')
      expect(ids).toContain('photos-uploaded')
      expect(ids).toContain('recording-added')
      expect(ids).toContain('slack-archived')
    })

    it('pre-event items have labels', () => {
      const items = getChecklistForState('PRE_EVENT' as never)

      for (const item of items) {
        expect(item.label).toBeTruthy()
        expect(item.id).toBeTruthy()
      }
    })

    it('post-event items have labels', () => {
      const items = getChecklistForState('POST_EVENT' as never)

      for (const item of items) {
        expect(item.label).toBeTruthy()
        expect(item.id).toBeTruthy()
      }
    })

    it('checklist items have isComplete function', () => {
      const preItems = getChecklistForState('PRE_EVENT' as never)
      const postItems = getChecklistForState('POST_EVENT' as never)

      for (const item of [...preItems, ...postItems]) {
        expect(typeof item.isComplete).toBe('function')
      }
    })

    it('pre-event schedule-published checks schedule length', () => {
      const items = getChecklistForState('PRE_EVENT' as never)
      const scheduleItem = items.find(i => i.id === 'schedule-published')!

      expect(
        scheduleItem.isComplete({
          schedule: [{ title: 'Talk' }],
        } as never)
      ).toBe(true)

      expect(
        scheduleItem.isComplete({
          schedule: [],
        } as never)
      ).toBe(false)

      expect(
        scheduleItem.isComplete({
          schedule: null,
        } as never)
      ).toBe(false)
    })

    it('post-event feedback-collected requires 5+ responses', () => {
      const items = getChecklistForState('POST_EVENT' as never)
      const fbItem = items.find(i => i.id === 'feedback-collected')!

      expect(
        fbItem.isComplete({
          stats: { feedbackSummary: { totalResponses: 5 } },
        } as never)
      ).toBe(true)

      expect(
        fbItem.isComplete({
          stats: { feedbackSummary: { totalResponses: 4 } },
        } as never)
      ).toBe(false)

      expect(
        fbItem.isComplete({
          stats: { feedbackSummary: null },
        } as never)
      ).toBe(false)
    })
  })
})
