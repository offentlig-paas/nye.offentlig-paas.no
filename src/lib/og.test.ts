import { describe, expect, it } from 'vitest'
import { truncate } from './og'

describe('truncate', () => {
  it('keeps short text', () => expect(truncate('Kort', 10)).toBe('Kort'))
  it('cuts on a word boundary', () =>
    expect(truncate('Plattformer i offentlig sektor', 20)).toBe(
      'Plattformer i…'
    ))
})
