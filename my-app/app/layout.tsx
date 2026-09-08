import './globals.css'
import type { ReactNode } from 'react'
import { Bebas_Neue, Cormorant_Garamond, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import type { Metadata } from 'next'
import Nav from '@/app/Components/Nav'
import Footer from '@/app/Components/Footer'

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

// ── SEO metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  // ── Core ──
  title: {
    default: 'Cutting Image | Premium Barbershop in Staines-upon-Thames',
    template: '%s | Cutting Image Barbershop · Staines',
  },
  description:
    'Cutting Image — Staines\'s premier barbershop since 1990. Expert haircuts, hot towel shaves, skin fades, beard sculpting & hair colouring at 2 Kingston Road, TW18 4LG. Walk-ins always welcome. Call 01784 449005.',

  // ── Keywords ──
  keywords: [
    // Core service + location
    'barber Staines',
    'barbershop Staines',
    'barber Staines-upon-Thames',
    'haircut Staines',
    'mens haircut Staines',
    'barber near me Staines',
    'barbers TW18',
    'barbershop TW18 4LG',
    // Services
    'skin fade Staines',
    'hot towel shave Staines',
    'beard trim Staines',
    'beard sculpting Staines',
    'hair colouring barber Staines',
    'Brazilian blow dry Staines',
    'crew cut Staines',
    'clipper cut Staines',
    'boys haircut Staines',
    'kids barber Staines',
    'mens facial Staines',
    'nose waxing Staines',
    // Nearby towns
    'barber Egham',
    'barber Ashford Surrey',
    'barber Shepperton',
    'barber Feltham',
    'barber Sunbury-on-Thames',
    'barber Chertsey',
    'barber Wraysbury',
    'barber Stanwell',
    // Brand
    'Cutting Image',
    'Cutting Image Staines',
    'Cutting Image barbershop',
    'best barber Staines',
    'top barber Staines',
    'premium barbershop Surrey',
    'traditional barber Surrey',
    'mens grooming Staines',
  ],

  // ── Canonical & locale ──
  alternates: {
    canonical: 'https://www.cutting-image.co.uk',
  },
  metadataBase: new URL('https://www.cutting-image.co.uk'),

  // ── Open Graph ──
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.cutting-image.co.uk',
    siteName: 'Cutting Image Barbershop',
    title: 'Cutting Image | Premium Barbershop · Staines-upon-Thames',
    description:
      'Expert haircuts, hot towel shaves, skin fades & beard sculpting since 1990. Walk-ins welcome at 2 Kingston Road, Staines TW18 4LG. Open 7 days a week.',
    images: [
      {
        url: '/og-image.png',   // 1200×630 recommended — add to /public
        width: 1200,
        height: 630,
        alt: 'Cutting Image — Premium Barbershop in Staines-upon-Thames',
      },
    ],
  },

  // ── Twitter / X ──
  twitter: {
    card: 'summary_large_image',
    title: 'Cutting Image | Premium Barbershop · Staines',
    description:
      'Expert haircuts, hot towel shaves & beard sculpting in Staines-upon-Thames. Walk-ins welcome. Call 01784 449005.',
    images: ['/og-image.png'],
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  // ── Verification (add your codes when ready) ──
  // verification: {
  //   google: 'YOUR_GOOGLE_SEARCH_CONSOLE_CODE',
  //   yandex: 'YOUR_YANDEX_CODE',
  // },

  // ── App / PWA ──
  applicationName: 'Cutting Image',
  authors: [{ name: 'Cutting Image', url: 'https://www.cutting-image.co.uk' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  category: 'barbershop',
}

// ── JSON-LD structured data (Local Business) ─────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Barber',
  name: 'Cutting Image',
  image: 'https://www.cutting-image.co.uk/og-image.png',
  url: 'https://www.cutting-image.co.uk',
  telephone: '+441784449005',
  email: 'cutting.image.staines@gmail.com',
  priceRange: '££',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '2 Kingston Road',
    addressLocality: 'Staines-upon-Thames',
    addressRegion: 'Surrey',
    postalCode: 'TW18 4LG',
    addressCountry: 'GB',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.4350981,
    longitude: -0.5060818,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday',   opens: '10:00', closes: '17:00' },
  ],
  hasMap: 'https://www.google.com/maps/place/Cutting+Image/@51.4350981,-0.5086567,17z/data=!3m1!4b1!4m6!3m5!1s0x487676cac16c3115:0x78edc50a61e9f190!8m2!3d51.4350981!4d-0.5060818!16s%2Fg%2F1tcz7tw9?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D',
  description: 'Premier barbershop in Staines-upon-Thames since 1990. Expert cuts, hot towel shaves, skin fades & beard sculpting. Walk-ins always welcome.',
  foundingDate: '1990',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    reviewCount: '529',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: [
    'https://www.instagram.com/cutting_image_staines/',   // ← replace with your actual Instagram URL
    'https://www.google.com/maps/place/Cutting+Image/@51.4350981,-0.5086567,17z/data=!3m1!4b1!4m6!3m5!1s0x487676cac16c3115:0x78edc50a61e9f190!8m2!3d51.4350981!4d-0.5060818!16s%2Fg%2F1tcz7tw9?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D',
  ],
  makesOffer: [
    { '@type': 'Offer', name: 'Wash, Haircut & Styling',       price: '18', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Skin Fade',                      price: '21', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Hot Towel Shave',                price: '16', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Beard Trim',                     price: '12', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Wash, Haircut, Styling & Beard', price: '33', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Brazilian Blow Dry',             price: '60', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Hair Colouring',                 price: '26', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Boys Dry Haircut',               price: '12', priceCurrency: 'GBP' },
    { '@type': 'Offer', name: 'Men\'s Facial',                  price: '30', priceCurrency: 'GBP' },
  ],
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${cormorant.variable} ${dmSans.variable}`}>
      <head>
        {/* Preload hero poster to fix LCP delay */}
        <link rel="preload" as="image" href="/hero-poster.webp" fetchPriority="high" />

        {/* JSON-LD — Local Business structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Microsoft Clarity */}
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "wu9ep5quda");
            `,
          }}
        />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}