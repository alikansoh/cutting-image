import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { absolute: 'Traditional Staines Barbershop Since 1990 | Cutting Image' },
  description:
    'A traditional gentlemen’s barbershop in the heart of Staines since 1990. Skilled barbers, complimentary drinks and walk-ins welcome at 2 Kingston Road.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Traditional Staines Barbershop Since 1990 | Cutting Image',
    description:
      'Founded in 1990 on Kingston Road — a traditional barbershop built to give every gentleman a place to call his own.',
    url: 'https://www.cutting-image.co.uk/about',
  },
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children
}
