import { CheckCircleIcon } from '@heroicons/react/24/outline'

interface SuccessMessageProps {
  title: string
  description: string
  children?: React.ReactNode
}

export function SuccessMessage({
  title,
  description,
  children,
}: SuccessMessageProps) {
  return (
    <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 dark:border-green-400 dark:bg-green-900/20">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            {title}
          </h3>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            {description}
          </p>
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
