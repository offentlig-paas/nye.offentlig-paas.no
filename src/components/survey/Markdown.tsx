'use client'

import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  children: string
  className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                className="text-teal-600 underline hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                {children}
                {isExternal && (
                  <span className="sr-only"> (åpnes i ny fane)</span>
                )}
              </a>
            )
          },
          ul: ({ children }) => (
            <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
