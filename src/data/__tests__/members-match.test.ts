import { describe, it, expect } from 'vitest'
import { findMemberByName, canonicalOrgName } from '@/data/members'

describe('findMemberByName', () => {
  it('matches name, short name and aliases', () => {
    for (const text of [
      'Brønnøysundregistrene',
      'BRREG',
      'Bronnoysundregistrene',
      'Brønnøysund',
    ]) {
      expect(findMemberByName(text)?.slug).toBe('brreg')
    }
  })

  it('ignores case and surrounding or repeated whitespace', () => {
    expect(findMemberByName('  brreg ')?.slug).toBe('brreg')
    expect(findMemberByName('BRØNNØYSUNDREGISTRENE')?.slug).toBe('brreg')
    expect(findMemberByName('statens  vegvesen')?.slug).toBe('vegvesen')
  })

  it('resolves the old stored name "Brreg"', () => {
    expect(canonicalOrgName('Brreg')).toBe('Brønnøysundregistrene')
  })

  it('treats "brreg" as a member and unknown text as not', () => {
    expect(findMemberByName('brreg')).toBeDefined()
    expect(findMemberByName('Nonexistent Corp')).toBeUndefined()
    expect(canonicalOrgName('Nonexistent Corp')).toBe('Nonexistent Corp')
  })

  it('short display name falls back to name', () => {
    expect(findMemberByName('brreg')?.getDisplayName(true)).toBe('BRREG')
    expect(findMemberByName('brreg')?.getDisplayName()).toBe(
      'Brønnøysundregistrene'
    )
    expect(findMemberByName('Nav')?.getDisplayName(true)).toBe('Nav')
  })
})
