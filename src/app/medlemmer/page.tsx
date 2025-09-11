'use client'

import React from 'react'
import Image from 'next/image'
import { SimpleLayout } from '@/components/SimpleLayout'
import { members } from '@/data/members'
import { useState } from 'react'
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

const types = Array.from(new Set(members.map(member => member.type))).sort(
  (a, b) => a.localeCompare(b, 'nb-NO')
)

export default function Uses() {
  const [activeButton, setActiveButton] = useState('')

  function handleClick(button: string) {
    if (activeButton === button) {
      setActiveButton('')
      return
    }
    setActiveButton(button)
  }

  const filteredMembers = members
    .filter(member => activeButton === '' || activeButton === member.type)
    .sort((a, b) => a.name.localeCompare(b.name, 'nb-NO'))

  return (
    <SimpleLayout
      title="Medlemmer av Offentlig PaaS"
      intro="Offentlig PaaS er for alle offentlige virksomheter i stat og kommune, eller private virksomheter hvor offentligheten eier 50%, med interesse for plattformteknologi og kunnskapsdeling. Dette er en grasrotbevegelse for de som jobber med plattformer og det er ingen kostnad eller forpliktelser ved å være medlem."
      gitHubPage="src/data/members.ts"
    >
      <div className="mx-auto max-w-7xl">
        {/* Filter buttons */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
            Filtrer etter organisasjonstype:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                activeButton === ''
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveButton('')}
            >
              Alle ({members.length})
            </button>
            {types.map(button => {
              const count = members.filter(m => m.type === button).length
              return (
                <button
                  key={button}
                  type="button"
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeButton === button
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleClick(button)}
                >
                  {button} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Viser {filteredMembers.length} av {members.length} medlemmer
        </p>

        {/* Members grid */}
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredMembers.map(member => (
            <li
              key={member.name}
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:shadow-md hover:ring-gray-300 dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-gray-600"
            >
              <div className="p-6">
                {/* Logo */}
                <div className="mb-4 flex justify-center">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-xl shadow-sm"
                    style={{
                      backgroundColor: member.logoBackgroundColor ?? '#ffffff',
                    }}
                  >
                    {member.image() ? (
                      <Image
                        className="h-16 w-16 object-contain"
                        src={member.image()}
                        width="64"
                        height="64"
                        alt={`Logo for ${member.name}`}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center text-2xl font-bold text-gray-400 dark:text-gray-500">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name and type */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {member.type}
                  </p>
                </div>

                {/* Links */}
                <div className="mt-4 flex justify-center space-x-3">
                  {member.github && (
                    <a
                      href={`https://github.com/${member.github}`}
                      className="text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">GitHub for {member.name}</span>
                      <GitHubIcon className="h-5 w-5" />
                    </a>
                  )}
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      className="text-gray-400 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">
                        LinkedIn for {member.name}
                      </span>
                      <LinkedInIcon className="h-5 w-5" />
                    </a>
                  )}
                  {member.homepage && (
                    <a
                      href={member.homepage}
                      className="text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">
                        Hjemmeside for {member.name}
                      </span>
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SimpleLayout>
  )
}
