import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { promises as fs } from 'fs'
import path from 'path'

interface SpeakerMatch {
  name: string
  org?: string
  url: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      )
    }

    const session = await auth()

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const { matches } = (await request.json()) as {
      matches: SpeakerMatch[]
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        { error: 'No matches provided' },
        { status: 400 }
      )
    }

    // Read the events.ts file
    const eventsFilePath = path.join(process.cwd(), 'src', 'data', 'events.ts')
    const fileContent = await fs.readFile(eventsFilePath, 'utf-8')

    // Find the event by slug
    const eventRegex = new RegExp(
      `slug:\\s*'${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`,
      'g'
    )
    const eventMatch = eventRegex.exec(fileContent)

    if (!eventMatch) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // For each match, find and update the speaker
    let updatedContent = fileContent
    let updatedCount = 0

    for (const match of matches) {
      // Escape special regex characters in the speaker name
      const escapedName = match.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      const speakerPatterns = [
        new RegExp(
          `\\{[\\s\\n]*name:\\s*['"]${escapedName}['"][\\s\\n]*,[\\s\\n]*org:\\s*['"]([^'"]*)['"][\\s\\n]*,?[\\s\\n]*\\}`,
          'g'
        ),
        new RegExp(
          `\\{\\s*name:\\s*['"]${escapedName}['"]\\s*,\\s*org:\\s*['"]([^'"]*)['"]\\s*\\}`,
          'g'
        ),
        new RegExp(
          `\\{[\\s\\n]*name:\\s*['"]${escapedName}['"][\\s\\n]*,?[\\s\\n]*\\}`,
          'g'
        ),
        new RegExp(`\\{\\s*name:\\s*['"]${escapedName}['"]\\s*\\}`, 'g'),
      ]

      for (const pattern of speakerPatterns) {
        let foundMatch = false
        let workingContent = updatedContent

        while (true) {
          const speakerMatch = pattern.exec(workingContent)

          if (!speakerMatch) {
            break
          }

          const originalSpeaker = speakerMatch[0]

          if (originalSpeaker.includes('url:')) {
            continue
          }

          const isMultiLine = originalSpeaker.includes('\n')
          let updatedSpeaker: string
          if (isMultiLine) {
            // Multi-line format
            if (match.org) {
              updatedSpeaker = `{
            name: '${match.name}',
            org: '${match.org}',
            url: '${match.url}',
          }`
            } else {
              updatedSpeaker = `{
            name: '${match.name}',
            url: '${match.url}',
          }`
            }
          } else {
            if (match.org) {
              updatedSpeaker = `{ name: '${match.name}', org: '${match.org}', url: '${match.url}' }`
            } else {
              updatedSpeaker = `{ name: '${match.name}', url: '${match.url}' }`
            }
          }

          const index = workingContent.indexOf(
            originalSpeaker,
            speakerMatch.index
          )
          if (index !== -1) {
            workingContent =
              workingContent.slice(0, index) +
              updatedSpeaker +
              workingContent.slice(index + originalSpeaker.length)
            updatedCount++
            foundMatch = true
            pattern.lastIndex = 0
          }
        }

        if (foundMatch) {
          updatedContent = workingContent
        }
      }
    }

    if (updatedCount === 0) {
      return NextResponse.json(
        { error: 'No speakers were updated' },
        { status: 400 }
      )
    }

    await fs.writeFile(eventsFilePath, updatedContent, 'utf-8')

    return NextResponse.json(
      {
        success: true,
        message: `Oppdaterte ${updatedCount} foredragsholder${updatedCount === 1 ? '' : 'e'} i events.ts`,
        updatedCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating speakers:', error)
    return NextResponse.json(
      { error: 'Failed to update speakers' },
      { status: 500 }
    )
  }
}
