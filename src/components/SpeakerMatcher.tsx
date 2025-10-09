'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  UserIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

interface SlackUser {
  id: string
  name: string
  realName: string
  displayName: string
  email?: string
  url: string
  avatar?: string
}

interface Speaker {
  name: string
  org?: string
  url?: string
}

type AutoSearchStatus =
  | 'idle'
  | 'searching'
  | 'found'
  | 'not-found'
  | 'duplicate'

interface SpeakerMatch {
  speaker: Speaker
  suggestedUser?: SlackUser
  autoSearchStatus?: AutoSearchStatus
  duplicateMatches?: SlackUser[]
}

interface SpeakerMatcherProps {
  eventSlug: string
  speakers: Speaker[]
}

const savedSpeakersGlobal = new Set<string>()
const speakerStatusGlobal = new Map<string, AutoSearchStatus>()
const duplicateMatchesGlobal = new Map<string, SlackUser[]>()

export function SpeakerMatcher({ eventSlug, speakers }: SpeakerMatcherProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SlackUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [matches, setMatches] = useState<SpeakerMatch[]>([])
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [isAutoSearching, setIsAutoSearching] = useState(false)
  const [autoSearchProgress, setAutoSearchProgress] = useState(0)
  const [savedSpeakerNames, setSavedSpeakerNames] = useState<Set<string>>(
    () => new Set(savedSpeakersGlobal)
  )

  useEffect(() => {
    const speakersWithoutUrls = speakers.filter(
      s => !s.url && !savedSpeakerNames.has(s.name)
    )
    setMatches(
      speakersWithoutUrls.map(speaker => ({
        speaker,
        autoSearchStatus: speakerStatusGlobal.get(speaker.name),
        duplicateMatches: duplicateMatchesGlobal.get(speaker.name),
      }))
    )
  }, [speakers, savedSpeakerNames])

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/admin/slack/search-users?query=${encodeURIComponent(query)}`
      )
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, searchUsers])

  const handleSelectUser = (speaker: Speaker, user: SlackUser) => {
    setSelectedSpeaker(null)
    setSearchQuery('')
    setSearchResults([])
    saveSingleMatch(speaker, user)
  }

  const handleRemoveMatch = (speaker: Speaker) => {
    setMatches(prev => prev.map(m => (m.speaker === speaker ? { speaker } : m)))
  }

  const saveSingleMatch = useCallback(
    async (speaker: Speaker, user: SlackUser) => {
      try {
        const response = await fetch(
          `/api/admin/events/${eventSlug}/update-speakers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              matches: [
                {
                  name: speaker.name,
                  org: speaker.org,
                  url: user.url,
                },
              ],
            }),
          }
        )

        if (response.ok) {
          await response.json()
          savedSpeakersGlobal.add(speaker.name)
          setSavedSpeakerNames(prev => new Set(prev).add(speaker.name))
          speakerStatusGlobal.delete(speaker.name)
          duplicateMatchesGlobal.delete(speaker.name)
          setMatches(prev => prev.filter(m => m.speaker.name !== speaker.name))
        } else {
          const error = await response.json()
          console.error(`Failed to save match: ${error.error}`)
          alert(`Kunne ikke lagre ${speaker.name}: ${error.error}`)
        }
      } catch (error) {
        console.error('Error saving match:', error)
        alert(`Feil ved lagring av ${speaker.name}`)
      }
    },
    [eventSlug]
  )

  const handleSave = useCallback(async () => {
    const validMatches = matches
      .filter(m => m.suggestedUser)
      .map(m => ({
        name: m.speaker.name,
        org: m.speaker.org,
        url: m.suggestedUser!.url,
      }))

    if (validMatches.length === 0) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(
        `/api/admin/events/${eventSlug}/update-speakers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ matches: validMatches }),
        }
      )

      if (response.ok) {
        await response.json()
        const savedSpeakerNames = new Set(validMatches.map(m => m.name))
        setMatches(prev =>
          prev.filter(m => !savedSpeakerNames.has(m.speaker.name))
        )
      } else {
        const error = await response.json()
        alert(`Feil ved lagring: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving speakers:', error)
      alert('Noe gikk galt ved lagring av foredragsholdere')
    } finally {
      setIsSaving(false)
    }
  }, [matches, eventSlug])

  const autoSearchSpeakers = useCallback(async () => {
    setIsAutoSearching(true)
    setAutoSearchProgress(0)

    const unmatchedSpeakers = matches.filter(m => !m.suggestedUser)

    setMatches(prev =>
      prev.map(m =>
        !m.suggestedUser ? { ...m, autoSearchStatus: undefined } : m
      )
    )

    let currentDelay = 300 // Start with 300ms delay
    const maxDelay = 60000 // Max delay of 60 seconds

    for (let i = 0; i < unmatchedSpeakers.length; i++) {
      const match = unmatchedSpeakers[i]
      if (!match) continue

      setAutoSearchProgress(i)

      speakerStatusGlobal.set(match.speaker.name, 'searching')
      setMatches(prev =>
        prev.map(m =>
          m.speaker === match.speaker
            ? { ...m, autoSearchStatus: 'searching' as AutoSearchStatus }
            : m
        )
      )

      let retryCount = 0
      const maxRetries = 3
      let success = false

      while (!success && retryCount < maxRetries) {
        try {
          const response = await fetch(
            `/api/admin/slack/search-users?query=${encodeURIComponent(match.speaker.name)}`
          )

          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After')
            const waitTime = retryAfter
              ? parseInt(retryAfter) * 1000
              : currentDelay * 2

            console.log(`Rate limited. Waiting ${waitTime}ms before retry...`)
            currentDelay = Math.min(waitTime, maxDelay)
            await new Promise(resolve => setTimeout(resolve, currentDelay))
            retryCount++
            continue
          }

          if (response.ok) {
            const data = await response.json()
            const users = data.users || []

            const exactMatches = users.filter(
              (user: SlackUser) =>
                user.realName.toLowerCase() ===
                  match.speaker.name.toLowerCase() ||
                user.displayName.toLowerCase() ===
                  match.speaker.name.toLowerCase()
            )

            if (exactMatches.length === 1) {
              speakerStatusGlobal.set(match.speaker.name, 'found')
              await saveSingleMatch(match.speaker, exactMatches[0])
            } else if (exactMatches.length > 1) {
              speakerStatusGlobal.set(match.speaker.name, 'duplicate')
              duplicateMatchesGlobal.set(match.speaker.name, exactMatches)
              setMatches(prev =>
                prev.map(m =>
                  m.speaker === match.speaker
                    ? {
                        ...m,
                        autoSearchStatus: 'duplicate' as AutoSearchStatus,
                        duplicateMatches: exactMatches,
                      }
                    : m
                )
              )
            } else {
              speakerStatusGlobal.set(match.speaker.name, 'not-found')
              setMatches(prev =>
                prev.map(m =>
                  m.speaker === match.speaker
                    ? {
                        ...m,
                        autoSearchStatus: 'not-found' as AutoSearchStatus,
                      }
                    : m
                )
              )
            }

            currentDelay = Math.max(300, currentDelay * 0.5)
            success = true
          } else {
            speakerStatusGlobal.set(match.speaker.name, 'not-found')
            setMatches(prev =>
              prev.map(m =>
                m.speaker === match.speaker
                  ? { ...m, autoSearchStatus: 'not-found' as AutoSearchStatus }
                  : m
              )
            )
            success = true
          }
        } catch (error) {
          console.error('Error auto-searching speaker:', error)
          if (retryCount < maxRetries - 1) {
            currentDelay = Math.min(currentDelay * 2, maxDelay)
            await new Promise(resolve => setTimeout(resolve, currentDelay))
            retryCount++
          } else {
            speakerStatusGlobal.set(match.speaker.name, 'not-found')
            setMatches(prev =>
              prev.map(m =>
                m.speaker === match.speaker
                  ? { ...m, autoSearchStatus: 'not-found' as AutoSearchStatus }
                  : m
              )
            )
            success = true
          }
        }
      }

      if (i < unmatchedSpeakers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, currentDelay))
      }

      setAutoSearchProgress(i + 1)
    }

    setIsAutoSearching(false)
    setAutoSearchProgress(0)

    console.group('Auto-search completed')
    unmatchedSpeakers.forEach(match => {
      const status = speakerStatusGlobal.get(match.speaker.name)
      const emoji =
        status === 'found' ? '✅' : status === 'duplicate' ? '⚠️' : '❌'
      const message =
        status === 'found'
          ? 'Saved'
          : status === 'duplicate'
            ? `${duplicateMatchesGlobal.get(match.speaker.name)?.length || 0} duplicates`
            : 'Not found'
      console.log(`${emoji} ${match.speaker.name}: ${message}`)
    })
    console.groupEnd()
  }, [matches, saveSingleMatch])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          Ingen foredragsholdere å matche
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Alle foredragsholdere i denne fagdagen har allerede Slack-brukere.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Foredragsholdere uten Slack-bruker
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Søk etter Slack-brukere og koble dem til foredragsholderne i
              programmet.
            </p>
          </div>
          {!isAutoSearching && matches.some(m => !m.suggestedUser) && (
            <button
              onClick={autoSearchSpeakers}
              disabled={isSaving}
              className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-all hover:bg-green-700 hover:shadow focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-700 dark:hover:bg-green-600 dark:focus:ring-offset-gray-800"
            >
              Auto-søk alle
            </button>
          )}
        </div>

        {isAutoSearching && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Søker automatisk etter foredragsholdere...
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {autoSearchProgress} av{' '}
                  {matches.filter(m => !m.suggestedUser).length} fullført
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow dark:border-gray-600 dark:bg-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {match.speaker.name}
                    </h4>
                    {match.speaker.org && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({match.speaker.org})
                      </span>
                    )}
                    {match.autoSearchStatus === 'searching' && (
                      <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 dark:bg-blue-900/30">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400"></div>
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          Søker...
                        </span>
                      </div>
                    )}
                    {match.autoSearchStatus === 'found' &&
                      !match.suggestedUser && (
                        <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 dark:bg-green-900/30">
                          <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">
                            Funnet
                          </span>
                        </div>
                      )}
                    {match.autoSearchStatus === 'not-found' &&
                      !match.suggestedUser && (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
                          <XCircleIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Ikke funnet
                          </span>
                        </div>
                      )}
                    {match.autoSearchStatus === 'duplicate' &&
                      !match.suggestedUser && (
                        <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 dark:bg-orange-900/30">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                            Flere treff
                          </span>
                        </div>
                      )}
                  </div>

                  {match.suggestedUser ? (
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-3 shadow-sm transition-shadow dark:border-green-800 dark:bg-green-900/20">
                      {match.suggestedUser.avatar && (
                        <Image
                          src={match.suggestedUser.avatar}
                          alt={match.suggestedUser.displayName}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-900 dark:text-green-100">
                            {match.suggestedUser.displayName}
                          </span>
                        </div>
                        {match.suggestedUser.email && (
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {match.suggestedUser.email}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          {match.suggestedUser.url}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveMatch(match.speaker)}
                        disabled={isAutoSearching}
                        className="cursor-pointer text-sm font-medium text-red-600 transition-colors hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300 dark:focus:ring-offset-gray-800"
                      >
                        Fjern
                      </button>
                    </div>
                  ) : match.duplicateMatches &&
                    match.duplicateMatches.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Velg riktig bruker:
                      </p>
                      <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                        {match.duplicateMatches.map(user => (
                          <button
                            key={user.id}
                            onClick={() =>
                              handleSelectUser(match.speaker, user)
                            }
                            className="flex w-full cursor-pointer items-center gap-3 rounded p-3 text-left transition-colors hover:bg-gray-50 focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset dark:hover:bg-gray-700 dark:focus:bg-gray-600 dark:focus:ring-blue-400"
                          >
                            {user.avatar && (
                              <Image
                                src={user.avatar}
                                alt={user.displayName}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full"
                              />
                            )}
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate font-medium text-gray-900 dark:text-white">
                                {user.displayName}
                              </p>
                              {user.email && (
                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSpeaker(match.speaker)
                        setSearchQuery(match.speaker.name)
                      }}
                      disabled={isAutoSearching}
                      className="mt-2 cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300 dark:focus:ring-offset-gray-800"
                    >
                      Søk etter bruker →
                    </button>
                  )}
                </div>
              </div>

              {selectedSpeaker === match.speaker && (
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Søk på navn..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      autoFocus
                    />
                  </div>

                  {isSearching && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Søker...
                      </p>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                      {searchResults.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(match.speaker, user)}
                          className="flex w-full cursor-pointer items-center gap-3 rounded p-3 text-left transition-colors hover:bg-gray-50 focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset dark:hover:bg-gray-700 dark:focus:bg-gray-600 dark:focus:ring-blue-400"
                        >
                          {user.avatar && (
                            <Image
                              src={user.avatar}
                              alt={user.displayName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full"
                            />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate font-medium text-gray-900 dark:text-white">
                              {user.displayName}
                            </p>
                            {user.email && (
                              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!isSearching &&
                    searchQuery.length >= 2 &&
                    searchResults.length === 0 && (
                      <p className="text-center text-sm text-gray-500">
                        Ingen brukere funnet
                      </p>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>

        {matches.some(m => m.suggestedUser) && !isAutoSearching && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-600 disabled:hover:shadow-sm dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
            >
              {isSaving && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              )}
              {isSaving
                ? 'Lagrer...'
                : `Lagre ${matches.filter(m => m.suggestedUser).length} til events.ts`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
