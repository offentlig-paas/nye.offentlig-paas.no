import {
  generateSanityKey,
  addKeysToArrayItems,
  prepareSanityDocument,
} from '../utils'

describe('Sanity Utils', () => {
  describe('generateSanityKey', () => {
    it('should generate unique keys', () => {
      const key1 = generateSanityKey()
      const key2 = generateSanityKey()

      expect(key1).toBeTruthy()
      expect(key2).toBeTruthy()
      expect(key1).not.toBe(key2)
      expect(typeof key1).toBe('string')
    })

    it('should generate keys with only alphanumeric characters', () => {
      const key = generateSanityKey()
      expect(key).toMatch(/^[a-zA-Z0-9]+$/)
    })
  })

  describe('addKeysToArrayItems', () => {
    it('should add _key to each array item', () => {
      const items = [
        { name: 'Item 1', value: 10 },
        { name: 'Item 2', value: 20 },
      ]

      const result = addKeysToArrayItems(items)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('_key')
      expect(result[1]).toHaveProperty('_key')
      expect(result[0]!._key).toBeTruthy()
      expect(result[1]!._key).toBeTruthy()
      expect(result[0]!._key).not.toBe(result[1]!._key)
      expect(result[0]!.name).toBe('Item 1')
      expect(result[1]!.name).toBe('Item 2')
    })

    it('should handle empty arrays', () => {
      const result = addKeysToArrayItems([])
      expect(result).toEqual([])
    })
  })

  describe('prepareSanityDocument', () => {
    it('should add _key to top-level arrays', () => {
      const doc = {
        _type: 'eventFeedback',
        name: 'Test User',
        talkRatings: [
          { talkTitle: 'Talk 1', rating: 5 },
          { talkTitle: 'Talk 2', rating: 4 },
        ],
      }

      const result = prepareSanityDocument(doc)

      expect(result.talkRatings).toHaveLength(2)
      expect(result.talkRatings[0]).toHaveProperty('_key')
      expect(result.talkRatings[1]).toHaveProperty('_key')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.talkRatings[0] as any)._key).not.toBe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result.talkRatings[1] as any)._key
      )
    })

    it('should add _key to nested arrays', () => {
      const doc = {
        _type: 'eventFeedback',
        name: 'Test User',
        talkRatings: [{ talkTitle: 'Talk 1', rating: 5 }],
        topicSuggestions: [
          { topic: 'Topic 1', willingToPresent: true },
          { topic: 'Topic 2', willingToPresent: false },
        ],
      }

      const result = prepareSanityDocument(doc)

      expect(result.talkRatings[0]!).toHaveProperty('_key')
      expect(result.topicSuggestions).toHaveLength(2)
      expect(result.topicSuggestions[0]!).toHaveProperty('_key')
      expect(result.topicSuggestions[1]!).toHaveProperty('_key')
    })

    it('should preserve non-array properties', () => {
      const doc = {
        _type: 'eventFeedback',
        name: 'Test User',
        eventRating: 5,
        eventComment: 'Great event!',
        submittedAt: '2025-10-16T10:00:00Z',
      }

      const result = prepareSanityDocument(doc)

      expect(result.name).toBe('Test User')
      expect(result.eventRating).toBe(5)
      expect(result.eventComment).toBe('Great event!')
      expect(result.submittedAt).toBe('2025-10-16T10:00:00Z')
    })

    it('should handle nested objects with arrays', () => {
      const doc = {
        _type: 'test',
        metadata: {
          tags: [{ name: 'tag1' }, { name: 'tag2' }],
        },
      }

      const result = prepareSanityDocument(doc)

      expect(result.metadata.tags).toHaveLength(2)
      expect(result.metadata.tags[0]!).toHaveProperty('_key')
      expect(result.metadata.tags[1]!).toHaveProperty('_key')
    })

    it('should handle Date objects without modifying them', () => {
      const date = new Date('2025-10-16T10:00:00Z')
      const doc = {
        _type: 'test',
        submittedAt: date,
      }

      const result = prepareSanityDocument(doc)

      expect(result.submittedAt).toBe(date)
    })

    it('should handle empty document', () => {
      const doc = {}
      const result = prepareSanityDocument(doc)
      expect(result).toEqual({})
    })
  })
})
