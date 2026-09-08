import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { absolute: 'Contact & Opening Hours | Cutting Image, 2 Kingston Rd' },
  description:
    'Visit Cutting Image at 2 Kingston Road, Staines-upon-Thames TW18 4LG. Open 7 days a week. Call 01784 449005 or send us a message.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact & Opening Hours | Cutting Image, Staines',
    description:
      'Find us at 2 Kingston Road, Staines TW18 4LG — 5 minutes from the station. Open 7 days a week.',
    url: 'https://www.cutting-image.co.uk/contact',
  },
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
