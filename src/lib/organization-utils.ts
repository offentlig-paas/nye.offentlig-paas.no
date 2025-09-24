export function cleanOrganizationName(organisation: string): string {
  if (!organisation) {
    return ''
  }

  // Convert to string if not already
  const orgString =
    typeof organisation === 'string' ? organisation : String(organisation)
  let cleaned = orgString.trim()

  const patterns = [
    { sep: ' - ', takeLast: false },
    { sep: ' hos ', takeLast: true },
    { sep: ' @ ', takeLast: true },
    { sep: ' i ', takeLast: true, maxLength: 10 },
  ]

  for (const { sep, takeLast, maxLength } of patterns) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep)
      const target = takeLast ? parts[parts.length - 1] : parts[0]
      if (target && (!maxLength || target.trim().length <= maxLength)) {
        cleaned = target.trim()
        break
      }
    }
  }

  const acronymMatch = cleaned.match(/\(([A-ZÆØÅ]{2,6})\)$/)
  if (acronymMatch?.[1]) {
    cleaned = acronymMatch[1]
  } else if (cleaned.includes(', ')) {
    const afterComma = cleaned.split(', ').slice(1).join(', ').trim()
    const commaAcronym = afterComma.match(/\(([A-ZÆØÅ]{2,6})\)$/)
    cleaned = commaAcronym?.[1] || afterComma || cleaned
  } else {
    cleaned = cleaned.replace(/\([^)]*\)$/, '').trim()
  }

  const jobPrefixes =
    /^(senior|junior|lead|principal|systemadministrator|utvikler|konsulent|rådgiver|arkitekt|designer|manager|leder|sjef|direktør|avdelingsleder|teamlead|tech lead|technical lead|product owner|scrum master|devops|sre|platform engineer|software engineer|fullstack|frontend|backend|cloud|ved)\s+/i
  cleaned = cleaned.replace(jobPrefixes, '')

  // Map known Norwegian organizations to their acronyms
  const orgMappings = new Map([
    ['meteorologisk institutt', 'MET'],
    ['direktoratet for forvaltning og økonomistyring', 'DFØ'],
    ['folkehelseinstituttet', 'FHI'],
    ['norsk helsenett', 'NHN'],
    ['statistisk sentralbyrå', 'SSB'],
    ['arbeids- og velferdsetaten', 'NAV'],
  ])

  const lowerCleaned = cleaned.toLowerCase()
  if (orgMappings.has(lowerCleaned)) {
    cleaned = orgMappings.get(lowerCleaned)!
  }

  const knownAcronyms = new Set([
    'NAV',
    'SSB',
    'DSS',
    'DFØ',
    'FHI',
    'NHN',
    'SKD',
    'KMD',
    'BFD',
    'HOD',
    'NFD',
    'JD',
    'UD',
    'FIN',
    'KLD',
    'LMD',
    'NRK',
    'FINN',
    'NTNU',
    'UiO',
    'UiB',
    'NMBU',
    'HiOA',
    'BI',
    'DNB',
    'SEB',
    'EVRY',
    'ATEA',
    'BEKK',
    'NETS',
    'VISMA',
    'SOPRA',
    'STERIA',
    'ACCENTURE',
    'CGI',
    'TCS',
    'CAPGEMINI',
    'IBM',
    'MICROSOFT',
    'GOOGLE',
    'AMAZON',
    'ORACLE',
    'SAP',
    'SALESFORCE',
    'TELENOR',
    'TELIA',
    'ICE',
    'GET',
    'ALTIBOX',
    'NEXTGENTEL',
    'SPK',
    'KLP',
    'STOREBRAND',
    'NORDEA',
    'HANDELSBANKEN',
    'MET',
    'NVE',
    'NPD',
    'DSA',
    'NKOM',
    'NAOB',
    'DIFI',
    'ALTINN',
  ])

  const upper = cleaned.toUpperCase()
  if (knownAcronyms.has(upper)) {
    cleaned = upper
  }

  return cleaned
}

export function getUniqueCleanedOrganizations(
  organisations: string[]
): Set<string> {
  return new Set(
    organisations
      .map(cleanOrganizationName)
      .filter(name => name.length > 0)
      .map(name => name.toLowerCase())
  )
}
