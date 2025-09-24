'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'

export function AuthButton() {
  const { data: session, status } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (status === 'loading') {
    return (
      <Button variant="primary" disabled>
        Laster...
      </Button>
    )
  }

  if (session) {
    const firstName = session.user.name?.split(' ')[0] || 'Bruker'

    return (
      <div className="group relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur transition hover:bg-white/95 hover:ring-zinc-900/10 dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:bg-zinc-800/95 dark:hover:ring-white/20"
        >
          {session.user.image ? (
            <div className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-white/20">
              <Image
                src={session.user.image}
                alt={session.user.name || 'User avatar'}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
          ) : (
            <Avatar
              name={session.user.name || 'Bruker'}
              size="xs"
              className="ring-1 ring-white/20"
            />
          )}
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {firstName}
          </span>
          <svg
            className={`h-4 w-4 text-zinc-500 transition-all group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {session.user.name}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.user.email}
              </p>
              {session.user.title && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {session.user.title}
                </p>
              )}
              {session.user.isAdmin && (
                <span className="mt-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Admin
                </span>
              )}
            </div>
            <div className="p-1">
              <button
                onClick={() => {
                  signOut()
                  setIsDropdownOpen(false)
                }}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <svg
                  className="mr-3 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logg ut
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="primary"
      onClick={() => {
        const teamId = process.env.NEXT_PUBLIC_SLACK_TEAM_ID
        if (teamId) {
          signIn('slack', undefined, { team: teamId })
        } else {
          signIn('slack')
        }
      }}
      className="flex items-center gap-2"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
      <span className="hidden md:inline xl:hidden">Logg inn</span>
      <span className="hidden xl:inline">Logg inn med Slack</span>
    </Button>
  )
}
