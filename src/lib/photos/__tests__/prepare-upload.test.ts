import { describe, it, expect } from 'vitest'
import { readUploadResponse } from '../prepare-upload'

describe('readUploadResponse', () => {
  it('turns a plain-text 413 into a readable message', async () => {
    const data = await readUploadResponse(
      new Response('Request Entity Too Large', { status: 413 })
    )
    expect(data.message).toBe('Bildet er for stort til å lastes opp')
  })

  it('keeps the server message from a JSON error', async () => {
    const data = await readUploadResponse(
      Response.json({ message: 'Forbidden' }, { status: 403 })
    )
    expect(data.message).toBe('Forbidden')
  })

  it('returns the JSON body on success', async () => {
    const data = await readUploadResponse(Response.json({ success: 1 }))
    expect(data).toEqual({ success: 1 })
  })
})
