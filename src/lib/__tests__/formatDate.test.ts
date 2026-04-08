import {
  formatDateTime,
  formatDate,
  formatDateLong,
  formatDateShort,
  formatTime,
  formatTimeRange,
  NORWEGIAN_MONTHS,
} from '../formatDate'

describe('formatDate utilities', () => {
  describe('NORWEGIAN_MONTHS', () => {
    it('has all 12 months', () => {
      expect(Object.keys(NORWEGIAN_MONTHS)).toHaveLength(12)
    })

    it('maps correct month names', () => {
      expect(NORWEGIAN_MONTHS[1]).toBe('januar')
      expect(NORWEGIAN_MONTHS[6]).toBe('juni')
      expect(NORWEGIAN_MONTHS[12]).toBe('desember')
    })
  })

  describe('formatDateTime', () => {
    it('formats a Date object', () => {
      const result = formatDateTime(new Date('2026-05-12T11:00:00+02:00'))
      expect(result).toContain('12')
      expect(result).toContain('mai')
      expect(result).toContain('2026')
      expect(result).toContain('11')
    })

    it('formats a string date', () => {
      const result = formatDateTime('2026-05-12T11:00:00+02:00')
      expect(result).toContain('12')
      expect(result).toContain('mai')
      expect(result).toContain('2026')
    })
  })

  describe('formatDate', () => {
    it('formats date without time', () => {
      const result = formatDate('2026-05-12')
      expect(result).toContain('12')
      expect(result).toContain('mai')
      expect(result).toContain('2026')
    })

    it('accepts Date object', () => {
      const result = formatDate(new Date('2026-01-15T00:00:00Z'))
      expect(result).toContain('15')
      expect(result).toContain('januar')
    })
  })

  describe('formatDateLong', () => {
    it('includes weekday', () => {
      const result = formatDateLong('2026-05-12T12:00:00+02:00')
      expect(result).toMatch(/tirsdag/i)
      expect(result).toContain('12')
      expect(result).toContain('mai')
      expect(result).toContain('2026')
    })
  })

  describe('formatDateShort', () => {
    it('formats without weekday', () => {
      const result = formatDateShort('2026-05-12T12:00:00+02:00')
      expect(result).toContain('12')
      expect(result).toContain('mai')
      expect(result).toContain('2026')
      expect(result).not.toMatch(/tirsdag/i)
    })
  })

  describe('formatTime', () => {
    it('formats time in HH:MM', () => {
      const result = formatTime('2026-05-12T11:30:00+02:00')
      expect(result).toBe('11:30')
    })

    it('accepts Date object', () => {
      const d = new Date('2026-05-12T13:45:00+02:00')
      const result = formatTime(d)
      expect(result).toBe('13:45')
    })
  })

  describe('formatTimeRange', () => {
    it('formats start and end time with dash', () => {
      const result = formatTimeRange(
        '2026-05-12T11:00:00+02:00',
        '2026-05-12T15:00:00+02:00'
      )
      expect(result).toBe('11:00 - 15:00')
    })
  })
})
