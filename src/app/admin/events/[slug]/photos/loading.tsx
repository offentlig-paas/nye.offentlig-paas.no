import { SHIMMER_CLASS as shimmer } from '@/lib/admin-ui'

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={`h-32 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 ${shimmer}`}
      />

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`aspect-4/3 rounded-xl ${shimmer}`} />
            <div className={`h-3 w-20 ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
