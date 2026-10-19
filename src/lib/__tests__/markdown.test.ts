import { describe, it, expect } from 'vitest'
import { stripMarkdown } from '../markdown'

describe('stripMarkdown', () => {
  it('removes inline markers and keeps plain text', () => {
    expect(stripMarkdown('**Tap av oversikt:** Ingen i teamet')).toBe(
      'Tap av oversikt: Ingen i teamet'
    )
    expect(stripMarkdown('*kursiv* og `kode`')).toBe('kursiv og kode')
    expect(stripMarkdown('Vet ikke')).toBe('Vet ikke')
  })
})
