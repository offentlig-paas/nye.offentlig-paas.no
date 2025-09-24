export const AVATAR_SIZE_CLASSES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
}

export const AVATAR_SIZE_PX = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
}

export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

export function getBackgroundColor(fullName: string): string {
  const colors = [
    'bg-slate-500',
    'bg-stone-500',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-rose-600',
    'bg-orange-600',
    'bg-amber-600',
    'bg-teal-600',
    'bg-emerald-600',
    'bg-cyan-600',
  ]

  let hash = 0
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length] ?? 'bg-slate-600'
}
