import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { absolute: 'Book a Barber Online | Cutting Image Staines' },
  description:
    'Book your chair at Cutting Image, Staines-upon-Thames — online booking 7 days a week. Walk-ins also welcome at 2 Kingston Road, TW18 4LG.',
  alternates: { canonical: '/booking' },
  openGraph: {
    title: 'Book a Barber Online | Cutting Image Staines',
    description:
      'Pick your service, date and time — book a barber online at Cutting Image, Staines. Walk-ins welcome too.',
    url: 'https://www.cutting-image.co.uk/booking',
  },
}

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children
}
