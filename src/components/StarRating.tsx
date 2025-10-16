import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  onRatingChange?: (rating: number) => void
  showLabel?: boolean
  readonly?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  onRatingChange,
  showLabel = false,
  readonly = false,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1)
  const sizeClass = sizeClasses[size]

  if (readonly) {
    return (
      <div className={`flex items-center gap-1 ${className || ''}`}>
        {stars.map(star => (
          <StarIcon
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        {showLabel && rating > 0 && (
          <span className="ml-1 text-sm text-zinc-600 dark:text-zinc-400">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      {stars.map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange?.(star)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} out of ${maxRating}`}
        >
          {star <= rating ? (
            <StarIcon className={`${sizeClass} text-yellow-400`} />
          ) : (
            <StarOutlineIcon
              className={`${sizeClass} text-zinc-300 dark:text-zinc-600`}
            />
          )}
        </button>
      ))}
      {showLabel && rating > 0 && (
        <span className="ml-1 text-sm text-zinc-600 dark:text-zinc-400">
          {rating} av {maxRating}
        </span>
      )}
    </div>
  )
}
