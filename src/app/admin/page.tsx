import { Suspense } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/AdminLayout'
import {
  CalendarDaysIcon,
  BeakerIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const cards = [
  {
    title: 'Fagdager',
    description: 'Administrer arrangementer, påmeldinger og tilbakemeldinger.',
    href: '/admin/events',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Forskning',
    description: 'Se besvarelser og statistikk for undersøkelser.',
    href: '/admin/forskning',
    icon: BeakerIcon,
  },
  {
    title: 'Medlemmer',
    description: 'Se Slack-representasjon per medlemsorganisasjon.',
    href: '/admin/members',
    icon: UserGroupIcon,
  },
]

function AdminLandingSkeleton() {
  return (
    <AdminLayout title="Admin" intro="Administrasjonspanel for Offentlig PaaS.">
      <div className="grid gap-6 sm:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </AdminLayout>
  )
}

async function AdminLandingContent() {
  return (
    <AdminLayout title="Admin" intro="Administrasjonspanel for Offentlig PaaS.">
      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-teal-600 dark:text-zinc-100 dark:group-hover:text-teal-400">
                  {card.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLandingSkeleton />}>
      <AdminLandingContent />
    </Suspense>
  )
}
