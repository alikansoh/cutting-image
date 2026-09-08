import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { absolute: 'Haircut & Beard Gallery | Cutting Image Staines' },
  description:
    'See our work — skin fades, sharp line-ups, classic cuts and beard sculpting from the Cutting Image team in Staines-upon-Thames.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Haircut & Beard Gallery | Cutting Image Staines',
    description:
      'Decades of craft in every frame — fades, shaves and beard sculpting by Cutting Image, Staines.',
    url: 'https://www.cutting-image.co.uk/gallery',
  },
}

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return children
}
