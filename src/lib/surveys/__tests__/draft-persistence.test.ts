// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { loadDraft, useDraftPersistence } from '../useDraftPersistence'

const key = (slug: string) => `survey-draft:${slug}:v1`

beforeEach(() => sessionStorage.clear())

describe('draft persistence', () => {
  it('loads drafts saved before sessionSeed existed', () => {
    sessionStorage.setItem(
      key('s'),
      JSON.stringify({
        answers: [],
        currentSectionIndex: 1,
        consentAccepted: true,
        showConsent: false,
        startTime: null,
        submissionId: 'x',
      })
    )
    const draft = loadDraft('s', 1)
    expect(draft?.currentSectionIndex).toBe(1)
    expect(draft?.sessionSeed).toBeUndefined()
  })

  it('saves the session seed', () => {
    vi.useFakeTimers()
    renderHook(() =>
      useDraftPersistence(
        's',
        1,
        new Map(),
        0,
        true,
        false,
        { current: null },
        false,
        { current: 'x' },
        1234
      )
    )
    vi.advanceTimersByTime(600)
    vi.useRealTimers()
    expect(loadDraft('s', 1)?.sessionSeed).toBe(1234)
  })
})
