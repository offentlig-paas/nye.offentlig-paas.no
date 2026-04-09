import { generateRegistrationsCSV } from '../csv-utils'

describe('generateRegistrationsCSV', () => {
  it('generates CSV with headers', () => {
    const csv = generateRegistrationsCSV([])
    const lines = csv.split('\n')

    expect(lines[0]).toBe(
      'Navn,E-post,Organisasjon,Deltakelse,Kommentarer,Påmeldt,Status'
    )
  })

  it('includes registration data', () => {
    const registrations = [
      {
        name: 'Ola Nordmann',
        email: 'ola@test.no',
        organisation: 'Digdir',
        attendanceType: 'physical',
        comments: 'Ingen',
        registeredAt: '2026-05-01T10:00:00Z',
        status: 'confirmed',
      },
    ]

    const csv = generateRegistrationsCSV(registrations)
    const lines = csv.split('\n')

    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('"Ola Nordmann"')
    expect(lines[1]).toContain('"ola@test.no"')
    expect(lines[1]).toContain('"Digdir"')
    expect(lines[1]).toContain('"physical"')
    expect(lines[1]).toContain('"confirmed"')
  })

  it('handles missing optional fields', () => {
    const registrations = [
      {
        name: 'Kari Hansen',
        email: 'kari@test.no',
        organisation: 'NAV',
        registeredAt: '2026-05-01T10:00:00Z',
        status: 'waitlist',
      },
    ]

    const csv = generateRegistrationsCSV(registrations)
    const lines = csv.split('\n')

    expect(lines[1]).toContain('"Kari Hansen"')
    expect(lines[1]).toContain('""') // empty attendanceType/comments
  })

  it('handles multiple registrations', () => {
    const registrations = [
      {
        name: 'User A',
        email: 'a@test.no',
        organisation: 'Org A',
        registeredAt: '2026-05-01T10:00:00Z',
        status: 'confirmed',
      },
      {
        name: 'User B',
        email: 'b@test.no',
        organisation: 'Org B',
        registeredAt: '2026-05-02T10:00:00Z',
        status: 'waitlist',
      },
    ]

    const csv = generateRegistrationsCSV(registrations)
    const lines = csv.split('\n')

    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('quotes fields to handle commas in data', () => {
    const registrations = [
      {
        name: 'Nordmann, Ola',
        email: 'ola@test.no',
        organisation: 'Direktoratet for forvaltning og IKT',
        comments: 'Vegetar, glutenfri',
        registeredAt: '2026-05-01T10:00:00Z',
        status: 'confirmed',
      },
    ]

    const csv = generateRegistrationsCSV(registrations)

    expect(csv).toContain('"Nordmann, Ola"')
    expect(csv).toContain('"Vegetar, glutenfri"')
  })
})
