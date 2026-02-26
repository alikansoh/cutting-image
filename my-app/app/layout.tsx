import './globals.css'
import type { ReactNode } from 'react'
import { Bebas_Neue, Cormorant_Garamond, DM_Sans } from 'next/font/google'
import Nav from '@/app/Components/Nav'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
})

const cormorant = Cormorant_Garamond({
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-corm',
})

const dmSans = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm',
})

export const metadata = {
  title: 'Cutting Image | Premium Barbershop · Staines',
  description: 'Expert cuts, hot towel shaves & beard sculpting at 173 High Street, Staines.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${cormorant.variable} ${dmSans.variable}`}>
      <head>
        {/* Preload hero poster to fix LCP delay */}
        <link
          rel="preload"
          as="image"
          href="/hero-poster.png"
          fetchPriority="high"
        />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}