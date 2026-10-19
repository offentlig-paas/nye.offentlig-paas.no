'use client'

export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Lagre som PDF
    </button>
  )
}
