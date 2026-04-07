import '@testing-library/jest-dom/vitest'

if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn()
}
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
}
