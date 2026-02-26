import './globals.css'
import type { ReactNode } from 'react'
import { Poppins, Inter } from 'next/font/google'
import Nav from './Components/Nav'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap'
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-body',
  display: 'swap'
})

export const metadata = {
  title: 'Barber Shop',
  description: 'Modern barber shop with stylish UI and animations'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Nav />
        {children}</body>
    </html>
  )
}