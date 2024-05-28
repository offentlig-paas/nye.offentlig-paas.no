'use client'

import Image from 'next/image'
import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'
import { members } from '@/data/members'
import { useState } from 'react'
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons'

function ToolsSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <ul role="list" className="space-y-16">
        {children}
      </ul>
    </Section>
  )
}

function Tool({
  title,
  href,
  children,
}: {
  title: string
  href?: string
  children: React.ReactNode
}) {
  return (
    <Card as="li">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Description>{children}</Card.Description>
    </Card>
  )
}

const types = Array.from(new Set(members.map((member) => member.type))).sort(
  (a, b) => a.localeCompare(b),
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

  return (
    <SimpleLayout
      title="Medlemmer av Offentlig PaaS"
      intro="Offentlig PaaS er for alle offentlige virksomheter i stat og kommune, eller private virksomheter hvor offentligheten eier 50%, med interesse for plattformteknologi og kunnskapsdeling."
      gitHubPage='src/data/members.ts'
    >
      <div className="mx-auto max-w-7xl">
        <span className="isolate inline-flex rounded-md shadow-sm">
          {types.map((button, i) => (
            <button
              key={button}
              type="button"
              className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${activeButton === button ? 'bg-gray-100' : 'bg-white'
                } ${i === 0
                  ? 'rounded-l-md'
                  : i === types.length - 1
                    ? '-ml-px rounded-r-md'
                    : '-ml-px'
                }`}
              onClick={() => handleClick(button)}
            >
              {button}
            </button>
          ))}
        </span>
        <ul
          role="list"
          className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-3 lg:mx-0 lg:max-w-none lg:grid-cols-5"
        >
          {members.map(
            (member) =>
              (activeButton === member.type || activeButton === '') && (
                <li key={member.name}>
                  <Image
                    className="aspect-[3/2] w-full rounded-2xl object-cover"
                    src={member.image()}
                    width="200"
                    height="200"
                    alt=""
                  />
                  <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900 dark:text-gray-100">
                    {member.name}
                  </h3>
                  <p className="text-base leading-7 text-gray-600 dark:text-gray-400">
                    {member.type}
                  </p>
                  <ul role="list" className="mt-6 flex gap-x-6">
                    {member.github && (
                      <li>
                        <a href={member.github} className="text-gray-400 hover:text-gray-500">
                          <span className="sr-only">GitHub</span>
                          <GitHubIcon className="h-6 w-6 fill-current" />
                        </a>
                      </li>
                    )}
                    {member.linkedinUrl && (
                      <li>
                        <a
                          href={member.linkedinUrl}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">LinkedIn</span>
                          <LinkedInIcon className="h-6 w-6 fill-current" />
                        </a>
                      </li>
                    )}
                  </ul>
                </li>
              ),
          )}
        </ul>
      </div >
    </SimpleLayout >
  )
}
