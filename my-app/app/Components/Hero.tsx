"use client"

import Link from 'next/link'
import { JSX, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
//  PERF CHANGES vs original:
//
//  1. FONTS: @import removed from <style>. Move to layout.tsx <head> as:
//       <link rel="preconnect" href="https://fonts.googleapis.com" />
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//       <link rel="stylesheet"
//         href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap"
//         media="print" onLoad="this.media='all'"
//       />
//     Or better: use next/font/google (zero render-blocking, self-hosted).
//
//  2. ENTRANCE ANIMATIONS: Replaced GSAP timeline with pure CSS @keyframes +
//     animation-delay. No JS needed for the visual entrance — eliminates GSAP
//     from TBT entirely for above-fold content. FCP drops because elements
//     are visible immediately via CSS, not gated on a 70 KiB script.
//
//  3. GSAP retained ONLY for: scroll-dot bounce + badge spin (both decorative,
//     non-blocking, idle-loaded). These run after LCP with requestIdleCallback.
//
//  4. VIDEO: Added `preload="none"` — video should not compete with the poster
//     image (the actual LCP candidate) for bandwidth on mobile/slow 4G.
//     The poster is what users see; video plays once bandwidth is available.
//
//  5. POSTER PRELOAD: Add to layout.tsx <head>:
//       <link rel="preload" as="image" href="/hero-poster.webp" fetchPriority="high" />
//
//  6. will-change: Removed from static elements. Only kept on badge-ring SVG
//     (actively animating) and scroll-dot. Fewer compositing layers = less
//     GPU memory pressure on mobile.
//
//  7. COLOR: Gold replaced with crimson palette matching About section.
//     --cr: #8B1A28  --cr-b: #B02235  --cr-light: #C03050
// ─────────────────────────────────────────────────────────────────────────────

export default function Hero(): JSX.Element {
  const badgeRingRef = useRef<SVGSVGElement>(null)
  const scrollDotRef = useRef<HTMLSpanElement>(null)
  const hasLoaded    = useRef(false)

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true

    const scheduleLoad = () => {
      const filename = 'gsap.min.js'
      if (document.querySelector(`script[src*="${filename}"]`)) {
        initDecorative()
        return
      }
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
      s.async = true
      s.crossOrigin = 'anonymous'
      s.onload = initDecorative
      document.head.appendChild(s)
    }

    if ('requestIdleCallback' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).requestIdleCallback(scheduleLoad, { timeout: 4000 })
    } else {
      setTimeout(scheduleLoad, 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initDecorative = () => {
    const gsap = window.gsap
    if (!gsap) return

    if (scrollDotRef.current) {
      gsap.to(scrollDotRef.current, {
        y: 10, repeat: -1, yoyo: true, duration: 0.9, ease: 'sine.inOut', delay: 0.5,
      })
    }

    if (window.innerWidth >= 640 && badgeRingRef.current) {
      gsap.to(badgeRingRef.current, {
        rotation: 360, repeat: -1, duration: 18, ease: 'none', transformOrigin: '50% 50%',
      })
    }
  }

  return (
    <>
      <style>{`
        :root {
          --cr:        #8B1A28;
          --cr-b:      #B02235;
          --cr-light:  #C03050;
          --cr-dim:    #6E1020;
          --ink:       #080705;
        }

        .font-bebas { font-family: 'Bebas Neue', sans-serif; }
        .font-corm  { font-family: 'Cormorant Garamond', serif; }
        .font-dm    { font-family: 'DM Sans', sans-serif; }

        .grain::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 5;
        }

        /* Crimson gradient accent — mirrors About's .ci-heading-accent */
        .cr-static {
          background: linear-gradient(110deg, #6E1020 0%, #8B1A28 28%, #C03050 50%, #8B1A28 72%, #6E1020 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ── CSS-only entrance animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleInLeft {
          from { opacity: 0; transform: scaleX(0); transform-origin: left center; }
          to   { opacity: 1; transform: scaleX(1); transform-origin: left center; }
        }
        @keyframes scaleInRight {
          from { opacity: 0; transform: scaleX(0); transform-origin: right center; }
          to   { opacity: 1; transform: scaleX(1); transform-origin: right center; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6) rotate(-20deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .anim-video   { animation: fadeIn   1.2s ease-out both; }
        .anim-overlay { animation: fadeIn   1.0s ease-out 0.2s both; }
        .anim-line-l  { animation: scaleInLeft  0.9s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .anim-line-r  { animation: scaleInRight 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .anim-tag     { animation: fadeUp   0.8s ease-out 0.5s both; }
        .anim-h1      { animation: fadeUp   0.9s ease-out 0.65s both; }
        .anim-sub     { animation: fadeUp   0.8s ease-out 0.8s both; }
        .anim-cta-1   { animation: fadeUp   0.7s ease-out 0.9s both; }
        .anim-cta-2   { animation: fadeUp   0.7s ease-out 1.0s both; }
        .anim-stats   { animation: fadeUp   0.7s ease-out 1.1s both; }
        .anim-badge   { animation: popIn    0.8s cubic-bezier(0.34,1.56,0.64,1) 1.2s both; }
        .anim-scroll  { animation: fadeUp   0.6s ease-out 1.3s both; }

        @media (prefers-reduced-motion: reduce) {
          .anim-video, .anim-overlay, .anim-line-l, .anim-line-r,
          .anim-tag, .anim-h1, .anim-sub, .anim-cta-1, .anim-cta-2,
          .anim-stats, .anim-badge, .anim-scroll {
            animation: none;
          }
        }

        /* Primary CTA — crimson fill */
        .btn-primary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: background 0.3s, transform 0.25s, box-shadow 0.3s;
        }
        .btn-primary:hover {
          background: var(--cr-b) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(139,26,40,0.45);
        }

        /* Secondary CTA — crimson border */
        .btn-secondary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          border: 1px solid rgba(139,26,40,0.45);
          transition: border-color 0.3s, background 0.3s, transform 0.25s;
        }
        .btn-secondary:hover {
          border-color: var(--cr);
          background: rgba(139,26,40,0.1);
          transform: translateY(-2px);
        }

        .hero-cut {
          position: absolute; bottom: -1px; left: 0; right: 0;
          height: 60px; background: #080705;
          clip-path: polygon(0 100%, 100% 0, 100% 100%); z-index: 20;
        }

        .badge-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 6.2px; fill: var(--cr-b);
          letter-spacing: 3.4px; text-transform: uppercase;
        }

        /* Stat numbers — crimson gradient */
        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.1rem; line-height: 1;
          background: linear-gradient(120deg, #8B1A28, #C03050);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        h1 { perspective: 900px; }

        @media (min-width: 768px) and (max-width: 1023px) {
          .tablet-stat-num { font-size: 1.7rem !important; }
        }
      `}</style>

      <section className="relative w-full h-screen min-h-[640px] overflow-hidden grain">

        <video
          className="absolute inset-0 w-full h-full object-cover z-0 anim-video"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/hero-poster.webp"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error fetchPriority is valid but missing from React types
          fetchPriority="high"
        />

        {/* Overlays — subtle crimson tint at bottom-left instead of gold */}
        <div className="absolute inset-0 z-10 pointer-events-none anim-overlay">
          <div className="absolute inset-0 bg-[rgba(5,4,3,0.72)]" />
          <div className="absolute inset-0 bg-linear-to-r from-[rgba(5,4,3,0.88)] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[rgba(5,4,3,0.92)] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-150 h-100 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,26,40,0.12)_0%,transparent_70%)]" />
        </div>

        {/* Horizontal crimson lines */}
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 z-20 flex items-center pointer-events-none px-6 md:px-10 gap-6">
          <span className="block h-px flex-1 bg-linear-to-r from-transparent via-[rgba(139,26,40,0.35)] to-[rgba(139,26,40,0.12)] anim-line-l" />
          <span className="block h-px flex-1 bg-linear-to-l from-transparent via-[rgba(139,26,40,0.35)] to-[rgba(139,26,40,0.12)] anim-line-r" />
        </div>

        {/* Main content */}
        <div className="relative z-30 h-full max-w-screen-xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col justify-center">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 md:gap-4 pt-8 md:pt-10 mb-4 md:mb-6">
            <span className="w-6 md:w-8 h-px bg-[#8B1A28]" aria-hidden="true" />
            <p className="font-dm text-[0.55rem] md:text-[0.6rem] tracking-[0.3em] md:tracking-[0.38em] uppercase text-[#B02235] anim-tag">
              Cutting Image &nbsp;·&nbsp; Premium Barbershop &nbsp;·&nbsp; Staines
            </p>
          </div>

          {/* Headline */}
          <h1
            aria-label="Where Style Meets Precision"
            className="font-bebas text-[clamp(3.2rem,9vw,9.5rem)] leading-[0.92] tracking-[0.03em] text-white mb-4 md:mb-5 max-w-[90vw] md:max-w-[680px] lg:max-w-[820px] anim-h1"
          >
            Where{' '}
            <em className="cr-static not-italic">Style</em>
            <br />
            Meets{' '}
            <span className="text-white/90">Precision</span>
          </h1>

          {/* Sub */}
          <p
            className="italic text-[0.95rem] md:text-[1.05rem] lg:text-[1.12rem] leading-relaxed text-white/55 max-w-[90vw] md:max-w-[400px] lg:max-w-[450px] mb-7 md:mb-10 anim-sub"
            style={{ fontFamily: 'inherit' }}
          >
            Expert cuts, hot towel shaves &amp; beard sculpting — crafted for the
            modern gentleman at 173 High Street, Staines.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
            <Link
              href="/booking"
              className="btn-primary inline-flex items-center gap-2.5 font-dm text-[0.65rem] md:text-[0.7rem] font-semibold tracking-[0.22em] uppercase bg-[#8B1A28] text-white px-6 md:px-8 py-3.5 md:py-4 anim-cta-1"
            >
              Book Appointment
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <Link
              href="tel:+447444724389"
              className="btn-secondary inline-flex items-center gap-2.5 font-dm text-[0.65rem] md:text-[0.7rem] font-medium tracking-[0.22em] uppercase text-white px-6 md:px-8 py-3.5 md:py-4 anim-cta-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Call Us Now
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 md:gap-8 mt-8 md:mt-14 pt-6 md:pt-8 border-t border-white/[0.07] anim-stats">
            {[
              { num: '10K+', label: 'Clients Served'  },
              { num: '35+',  label: 'Years Experience' },
              { num: '4.9★', label: 'Google Rating'    },
            ].map(({ num, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="stat-num tablet-stat-num">{num}</span>
                <span className="font-dm text-[0.52rem] md:text-[0.58rem] tracking-[0.18em] uppercase text-white/30">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rotating badge — crimson ring text */}
        <div
          className="hidden sm:flex absolute bottom-20 md:bottom-24 right-6 md:right-10 lg:right-16 z-30 w-[90px] h-[90px] md:w-[110px] md:h-[110px] items-center justify-center anim-badge"
          aria-hidden="true"
        >
          <svg
            ref={badgeRingRef}
            viewBox="0 0 110 110"
            className="badge-ring absolute inset-0 w-full h-full"
            style={{ willChange: 'transform' }}
          >
            <defs>
              <path id="badgePath" d="M 55,55 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"/>
            </defs>
            <text className="badge-text">
              <textPath href="#badgePath">CUTTING IMAGE · STAINES · PREMIUM GROOMING · &nbsp;</textPath>
            </text>
          </svg>
          {/* Diamond icon — crimson fill */}
          <div className="w-8 h-8 md:w-9 md:h-9 border border-[rgba(139,26,40,0.6)] rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#8B1A28]" />
          </div>
        </div>

        {/* Scroll indicator — crimson dot */}
        <div
          className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 anim-scroll"
          aria-hidden="true"
        >
          <div className="w-px h-10 md:h-12 relative overflow-hidden bg-white/10">
            <span
              ref={scrollDotRef}
              className="scroll-dot absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-[#8B1A28] to-transparent"
              style={{ willChange: 'transform' }}
            />
          </div>
          <span className="font-dm text-[0.52rem] tracking-[0.28em] uppercase text-white/25">Scroll</span>
        </div>

        {/* Angled bottom cut */}
        <div className="hero-cut" aria-hidden="true" />
      </section>
    </>
  )
}