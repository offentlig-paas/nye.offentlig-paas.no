import {
  cleanOrganizationName,
  getUniqueCleanedOrganizations,
} from '../organization-utils'

describe('cleanOrganizationName', () => {
  describe('basic input validation', () => {
    it('should return empty string for falsy inputs', () => {
      expect(cleanOrganizationName('')).toBe('')
      expect(cleanOrganizationName(null as unknown as string)).toBe('')
      expect(cleanOrganizationName(undefined as unknown as string)).toBe('')
    })

    it('should handle non-string inputs', () => {
      expect(cleanOrganizationName(123 as unknown as string)).toBe('123')
      expect(cleanOrganizationName({} as unknown as string)).toBe(
        '[object Object]'
      )
    })

    it('should trim whitespace', () => {
      expect(cleanOrganizationName('  NAV  ')).toBe('NAV')
      expect(cleanOrganizationName('\t\nFHI\r\n')).toBe('FHI')
    })
  })

  describe('pattern extraction', () => {
    it('should extract organization from " - " patterns', () => {
      expect(cleanOrganizationName('FHI - Skybert')).toBe('FHI')
      expect(cleanOrganizationName('NAV - IT-avdelingen')).toBe('NAV')
      expect(cleanOrganizationName('Multiple - words - here')).toBe('Multiple')
    })

    it('should extract organization from " hos " patterns', () => {
      expect(cleanOrganizationName('Systemadministrator hos MET')).toBe('MET')
      expect(cleanOrganizationName('Senior utvikler hos DNB')).toBe('DNB')
      expect(cleanOrganizationName('Konsulent hos Statens vegvesen')).toBe(
        'Statens vegvesen'
      )
    })

    it('should extract organization from " @ " patterns', () => {
      expect(cleanOrganizationName('Plattformutvikler @ SPK')).toBe('SPK')
      expect(cleanOrganizationName('Tech Lead @ BEKK')).toBe('BEKK')
      expect(cleanOrganizationName('Developer @ Some Company')).toBe(
        'Some Company'
      )
    })

    it('should extract short acronyms from " i " patterns', () => {
      expect(cleanOrganizationName('Utvikler i NAV')).toBe('NAV')
      expect(cleanOrganizationName('Arkitekt i SSB')).toBe('SSB')
    })

    it('should not extract long names from " i " patterns', () => {
      expect(cleanOrganizationName('Utvikler i Very Long Company Name')).toBe(
        'i Very Long Company Name'
      )
    })
  })

  describe('parentheses and comma handling', () => {
    it('should extract acronyms from parentheses', () => {
      expect(
        cleanOrganizationName(
          'Direktoratet for forvaltning og økonomistyring (DFØ)'
        )
      ).toBe('DFØ')
      expect(cleanOrganizationName('Folkehelseinstituttet (FHI)')).toBe('FHI')
      expect(cleanOrganizationName('Some Organization (ABC)')).toBe('ABC')
    })

    it('should handle comma with parentheses', () => {
      expect(
        cleanOrganizationName(
          'Senior konsulent, Direktoratet for forvaltning og økonomistyring (DFØ)'
        )
      ).toBe('DFØ')
      expect(
        cleanOrganizationName('Lead Developer, Norwegian Health Network (NHN)')
      ).toBe('NHN')
    })

    it('should handle comma without parentheses', () => {
      expect(cleanOrganizationName('Senior konsulent, NAV')).toBe('NAV')
      expect(cleanOrganizationName('Developer, Some Company')).toBe(
        'Some Company'
      )
    })

    it('should remove trailing parentheses without acronyms', () => {
      expect(cleanOrganizationName('Company Name (some description)')).toBe(
        'Company Name'
      )
      expect(cleanOrganizationName('NAV (arbeids- og velferdsetaten)')).toBe(
        'NAV'
      )
    })
  })

  describe('job title removal', () => {
    it('should remove Norwegian job titles', () => {
      expect(cleanOrganizationName('senior utvikler hos NAV')).toBe('NAV')
      expect(cleanOrganizationName('systemadministrator i FHI')).toBe('FHI')
      expect(cleanOrganizationName('konsulent ved DNB')).toBe('ved DNB')
      expect(cleanOrganizationName('rådgiver hos SSB')).toBe('SSB')
      expect(cleanOrganizationName('leder i BEKK')).toBe('BEKK')
    })

    it('should remove English job titles', () => {
      expect(cleanOrganizationName('senior developer @ FINN')).toBe('FINN')
      expect(cleanOrganizationName('tech lead hos EVRY')).toBe('EVRY')
      expect(cleanOrganizationName('product owner ved VISMA')).toBe('ved VISMA')
      expect(cleanOrganizationName('scrum master i ATEA')).toBe('ATEA')
    })

    it('should handle "ved" prefix', () => {
      expect(cleanOrganizationName('ved NAV')).toBe('NAV')
      expect(cleanOrganizationName('Ved Universitetet i Oslo')).toBe('Oslo')
    })
  })

  describe('known acronym normalization', () => {
    it('should normalize common Norwegian organizations', () => {
      expect(cleanOrganizationName('nav')).toBe('NAV')
      expect(cleanOrganizationName('fhi')).toBe('FHI')
      expect(cleanOrganizationName('ssb')).toBe('SSB')
      expect(cleanOrganizationName('dfø')).toBe('DFØ')
      expect(cleanOrganizationName('nhn')).toBe('NHN')
    })

    it('should normalize tech companies', () => {
      expect(cleanOrganizationName('bekk')).toBe('BEKK')
      expect(cleanOrganizationName('finn')).toBe('FINN')
      expect(cleanOrganizationName('evry')).toBe('EVRY')
      expect(cleanOrganizationName('visma')).toBe('VISMA')
      expect(cleanOrganizationName('atea')).toBe('ATEA')
    })

    it('should normalize financial institutions', () => {
      expect(cleanOrganizationName('dnb')).toBe('DNB')
      expect(cleanOrganizationName('spk')).toBe('SPK')
      expect(cleanOrganizationName('klp')).toBe('KLP')
      expect(cleanOrganizationName('storebrand')).toBe('STOREBRAND')
    })

    it('should leave unknown organizations unchanged', () => {
      expect(cleanOrganizationName('Unknown Company')).toBe('Unknown Company')
      expect(cleanOrganizationName('Some Random Org')).toBe('Some Random Org')
    })
  })

  describe('complex real-world examples', () => {
    it('should handle complex patterns correctly', () => {
      expect(cleanOrganizationName('Senior Platform Engineer @ NAV - IT')).toBe(
        'Platform Engineer @ NAV'
      )
      expect(
        cleanOrganizationName('Lead Developer, Folkehelseinstituttet (FHI)')
      ).toBe('FHI')
      expect(
        cleanOrganizationName('Systemadministrator hos Meteorologisk institutt')
      ).toBe('MET')
      expect(
        cleanOrganizationName(
          'ved Direktoratet for forvaltning og økonomistyring'
        )
      ).toBe('DFØ')
    })

    it('should process patterns in correct order', () => {
      // Should process " - " before other patterns
      expect(cleanOrganizationName('Senior hos NAV - Team')).toBe('hos NAV')
    })
  })

  describe('edge cases', () => {
    it('should handle empty patterns', () => {
      expect(cleanOrganizationName(' - ')).toBe('-')
      expect(cleanOrganizationName(' hos ')).toBe('hos')
      expect(cleanOrganizationName(' @ ')).toBe('@')
    })

    it('should handle single characters', () => {
      expect(cleanOrganizationName('A')).toBe('A')
      expect(cleanOrganizationName('X @ Y')).toBe('Y')
    })

    it('should handle special characters', () => {
      expect(cleanOrganizationName('Org-with-dashes')).toBe('Org-with-dashes')
      expect(cleanOrganizationName('Org_with_underscores')).toBe(
        'Org_with_underscores'
      )
    })
  })
})

describe('getUniqueCleanedOrganizations', () => {
  it('should return unique cleaned organization names', () => {
    const input = [
      'FHI - Skybert',
      'Systemadministrator hos MET',
      'fhi',
      'Senior utvikler @ NAV',
      'nav',
      'Plattformutvikler hos NAV',
    ]

    const result = getUniqueCleanedOrganizations(input)

    expect(result.size).toBe(3)
    expect(result.has('fhi')).toBe(true)
    expect(result.has('met')).toBe(true)
    expect(result.has('nav')).toBe(true)
  })

  it('should filter out empty names', () => {
    const input = [
      'NAV',
      '',
      '   ',
      'FHI',
      null as unknown as string,
      undefined as unknown as string,
    ]

    const result = getUniqueCleanedOrganizations(input)

    expect(result.size).toBe(2)
    expect(result.has('nav')).toBe(true)
    expect(result.has('fhi')).toBe(true)
  })

  it('should handle case insensitive deduplication', () => {
    const input = ['NAV', 'nav', 'Nav', 'NAv']

    const result = getUniqueCleanedOrganizations(input)

    expect(result.size).toBe(1)
    expect(result.has('nav')).toBe(true)
  })

  it('should handle empty input', () => {
    expect(getUniqueCleanedOrganizations([]).size).toBe(0)
  })

  it('should preserve original case for display while deduplicating', () => {
    const input = [
      'Direktoratet for forvaltning og økonomistyring (DFØ)',
      'dfø',
      'Senior hos DFØ',
    ]

    const result = getUniqueCleanedOrganizations(input)

    expect(result.size).toBe(1)
    expect(result.has('dfø')).toBe(true)
  })

  describe('performance with large datasets', () => {
    it('should handle large arrays efficiently', () => {
      const largeInput = Array.from({ length: 10000 }, (_, i) =>
        i % 100 === 0 ? 'NAV' : `Company${i % 50}`
      )

      const start = performance.now()
      const result = getUniqueCleanedOrganizations(largeInput)
      const end = performance.now()

      expect(result.size).toBeGreaterThanOrEqual(50) // At least 50 unique companies
      expect(result.size).toBeLessThanOrEqual(51) // Allow for NAV duplicates
      expect(end - start).toBeLessThan(100) // Should complete in under 100ms
    })
  })
})
