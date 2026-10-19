import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medlemmer',
  description:
    'Offentlige virksomheter som er med i Offentlig PAAS: direktorater, etater, kommuner, universiteter og statlige selskaper.',
}

export default function MedlemmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
