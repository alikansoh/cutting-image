import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { absolute: 'Barber Services & Prices in Staines | Cutting Image' },
  description:
    'Skin fades, hot towel shaves, beard trims & hair colouring from £13. Walk-ins welcome at 2 Kingston Road, Staines TW18 4LG. Call 01784 449005.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Barber Services & Prices in Staines | Cutting Image',
    description:
      'The full range of precision grooming — skin fades, hot towel shaves, beard sculpting & colouring. Walk-ins welcome in Staines-upon-Thames.',
    url: 'https://www.cutting-image.co.uk/services',
  },
}

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return children
}
