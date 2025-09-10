interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  // Extract initials from the name
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2) // Only take first 2 initials
  }

  // Generate a consistent background color based on the name
  const getBackgroundColor = (fullName: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-gray-500',
      'bg-orange-500',
      'bg-teal-500',
    ]

    // Create a simple hash from the name to consistently assign colors
    let hash = 0
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length] ?? 'bg-blue-500'
  }

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  }

  const initials = getInitials(name)
  const backgroundColor = getBackgroundColor(name)

  return (
    <div
      className={`flex flex-none items-center justify-center rounded-full font-medium text-white ${sizeClasses[size]} ${backgroundColor} ${className} `}
    >
      {initials}
    </div>
  )
}
