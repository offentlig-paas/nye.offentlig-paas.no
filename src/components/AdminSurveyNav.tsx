'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartBarIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline'

interface AdminSurveyNavProps {
  surveySlug: string
}

export function AdminSurveyNav({ surveySlug }: AdminSurveyNavProps) {
  const pathname = usePathname()

  const tabs = [
    {
      name: 'Oversikt',
      href: `/admin/forskning/${surveySlug}`,
      icon: ChartBarIcon,
      current: pathname === `/admin/forskning/${surveySlug}`,
    },
    {
      name: 'Organisasjoner',
      href: `/admin/forskning/${surveySlug}/organisasjoner`,
      icon: BuildingOffice2Icon,
      current: pathname === `/admin/forskning/${surveySlug}/organisasjoner`,
    },
    {
      name: 'Resultater',
      href: `/admin/forskning/${surveySlug}/resultater`,
      icon: PresentationChartBarIcon,
      current: pathname === `/admin/forskning/${surveySlug}/resultater`,
    },
    {
      name: 'Besvarelser',
      href: `/admin/forskning/${surveySlug}/responses`,
      icon: TableCellsIcon,
      current: pathname === `/admin/forskning/${surveySlug}/responses`,
    },
  ]

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                tab.current
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  tab.current
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400'
                }`}
              />
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
