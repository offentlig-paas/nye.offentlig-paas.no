import Image from 'next/image'
import type { Session } from 'next-auth'

interface ProfileHeaderProps {
  user: NonNullable<Session['user']>
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-6 pb-8">
      {user.image && (
        <Image
          src={user.image}
          alt={user.name || 'Bruker'}
          width={120}
          height={120}
          className="rounded-full bg-zinc-100 dark:bg-zinc-800"
        />
      )}
      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          {user.name}
        </h1>
        {user.email && (
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {user.email}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {user.isAdmin && (
            <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-red-600/10 ring-inset dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20">
              Administrator
            </span>
          )}
          {user.adminGroups &&
            user.adminGroups.length > 0 &&
            user.adminGroups.map(group => (
              <span
                key={group}
                className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30"
              >
                @{group}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}
