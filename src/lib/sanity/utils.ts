import { randomBytes } from 'crypto'

/**
 * Generates a unique key for Sanity array items.
 * Sanity requires array items to have a unique `_key` property.
 */
export function generateSanityKey(): string {
  return randomBytes(12)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
}

/**
 * Adds `_key` properties to array items for Sanity compatibility.
 * Each item in Sanity arrays must have a unique `_key` string.
 */
export function addKeysToArrayItems<T extends Record<string, unknown>>(
  items: T[]
): Array<T & { _key: string }> {
  return items.map(item => ({
    ...item,
    _key: generateSanityKey(),
  }))
}

/**
 * Prepares an object with arrays for Sanity by adding `_key` to all array items.
 * Recursively processes nested objects and arrays.
 *
 * @example
 * ```typescript
 * const feedback = {
 *   _type: 'eventFeedback',
 *   name: 'John Doe',
 *   talkRatings: [
 *     { talkTitle: 'Talk 1', rating: 5 },
 *     { talkTitle: 'Talk 2', rating: 4 }
 *   ],
 *   topicSuggestions: [
 *     { topic: 'Topic 1', willingToPresent: true }
 *   ]
 * }
 *
 * const preparedDoc = prepareSanityDocument(feedback)
 * // All array items now have unique _key properties
 * await sanityClient.create(preparedDoc)
 * ```
 */
export function prepareSanityDocument<T extends Record<string, unknown>>(
  doc: T
): T {
  const result = { ...doc }

  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value)) {
      // Add keys to array items
      result[key as keyof T] = addKeysToArrayItems(
        value as Record<string, unknown>[]
      ) as T[keyof T]
    } else if (value && typeof value === 'object' && !isDate(value)) {
      // Recursively process nested objects
      result[key as keyof T] = prepareSanityDocument(
        value as Record<string, unknown>
      ) as T[keyof T]
    }
  }

  return result
}

function isDate(value: unknown): boolean {
  return (
    value instanceof Date ||
    Object.prototype.toString.call(value) === '[object Date]'
  )
}
