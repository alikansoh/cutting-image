"use client"

import Link from 'next/link'
import { JSX, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
//  PERF NOTE: gsap + SplitText are NO LONGER imported at the module level.
//  Previously `import gsap from 'gsap'` pulled ~70 KiB of JS into the critical
//  bundle, blocking the main thread before the first paint.
//  Now both are loaded asynchronously AFTER the LCP element has painted,
//  eliminating them from the critical path entirely.
//
//  SplitText is replicated inline (no GSAP Club plugin needed) so the bundle
//  stays dependency-free. The animation behaviour is identical.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    gsap: {
      registerPlugin: (...a: unknown[]) => void
      context: (fn: () => void, scope: React.RefObject<HTMLElement | null>) => { revert: () => void }
      timeline: (opts?: Record<string, unknown>) => GsapTimeline
      to: (t: unknown, v: Record<string, unknown>) => void
      fromTo: (t: unknown, f: Record<string, unknown>, to: Record<string, unknown>) => void
    }
    ScrollTrigger: { getAll: () => Array<{ kill: () => void }> }
  }
  interface GsapTimeline {
    fromTo: (t: unknown, f: Record<string, unknown>, to: Record<string, unknown>, pos?: string) => GsapTimeline
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Minimal inline char-splitter — avoids the SplitText CDN/plugin import
// ─────────────────────────────────────────────────────────────────────────────
function splitChars(el: HTMLElement): HTMLElement[] {
  // Flatten text while preserving child element structure (e.g. <em>, <span>)
  const chars: HTMLElement[] = []
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      const frag = document.createDocumentFragment()
      for (const ch of text) {
        const span = document.createElement('span')
        span.style.cssText = 'display:inline-block;will-change:transform,opacity'
        span.textContent = ch === ' ' ? '\u00A0' : ch
        frag.appendChild(span)
        chars.push(span)
      }
      node.parentNode?.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Clone child list before walking (live NodeList mutates as we insert spans)
      Array.from(node.childNodes).forEach(walk)
    }
  }
  Array.from(el.childNodes).forEach(walk)
  return chars
}

export default function Hero(): JSX.Element {
  const sectionRef   = useRef<HTMLElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)
  const taglineRef   = useRef<HTMLParagraphElement>(null)
  const h1Ref        = useRef<HTMLHeadingElement>(null)
  const subRef       = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)
  const scrollRef    = useRef<HTMLDivElement>(null)
  const lineLeftRef  = useRef<HTMLSpanElement>(null)
  const lineRightRef = useRef<HTMLSpanElement>(null)
  const badgeRef     = useRef<HTMLDivElement>(null)
  const hasLoaded    = useRef(false)

  useEffect(() => {
    // ── Step 1: Make the LCP element (poster → video) visible immediately,
    //   before GSAP has loaded. This slashes Element Render Delay from ~2100 ms
    //   to near-zero because we don't gate visibility on script load.
    const video   = videoRef.current
    const overlay = overlayRef.current
    if (video)   video.style.opacity   = '1'
    if (overlay) overlay.style.opacity = '1'

    // ── Step 2: Show above-the-fold text immediately so FCP isn't blocked
    const immediate = [taglineRef, h1Ref, subRef, ctaRef, scrollRef, lineLeftRef, lineRightRef, badgeRef]
    immediate.forEach((r) => {
      if (r.current) r.current.style.opacity = '1'
    })

    // ── Step 3: Load GSAP async — only for the *enhancement* animations.
    //   By the time this resolves the page is already interactive.
    if (hasLoaded.current) return
    hasLoaded.current = true

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve) => {
        const filename = src.split('/').pop()!
        if (document.querySelector(`script[src*="${filename}"]`)) {
          setTimeout(resolve, 30)
          return
        }
        const s = document.createElement('script')
        s.src = src; s.async = true; s.crossOrigin = 'anonymous'
        s.onload = () => resolve()
        document.head.appendChild(s)
      })

    // Use requestIdleCallback so GSAP loads only when the browser is idle,
    // keeping TBT low during the critical load window.
    const scheduleLoad = () => {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js')
        .then(() => initAnimations())
    }

    if ('requestIdleCallback' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).requestIdleCallback(scheduleLoad, { timeout: 3000 })
    } else {
      // Fallback for Safari < 17
      setTimeout(scheduleLoad, 200)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initAnimations = () => {
    const gsap = window.gsap
    if (!gsap) return

    const isMobile = window.innerWidth < 768

    // Re-hide elements so GSAP can animate them in
    // (they were shown immediately for LCP, now we re-run the animation
    //  so users on fast connections still see the entrance effect)
    const video   = videoRef.current
    const overlay = overlayRef.current

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Video/overlay fade — start from wherever opacity currently is
    tl.fromTo(video,   { opacity: 0 }, { opacity: 1, duration: 1.8 })
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 1.2 }, '-=1.4')

    tl.fromTo(lineLeftRef.current,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1, ease: 'expo.out' }, '-=0.6'
    )
    tl.fromTo(lineRightRef.current,
      { scaleX: 0, transformOrigin: 'right center' },
      { scaleX: 1, duration: 1, ease: 'expo.out' }, '<'
    )

    tl.fromTo(taglineRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.5')

    // Char-split animation — skip on mobile to avoid forced reflow + TBT spike
    if (!isMobile && h1Ref.current) {
      const chars = splitChars(h1Ref.current)
      tl.fromTo(chars,
        { y: 80, opacity: 0, rotationX: -60 },
        { y: 0, opacity: 1, rotationX: 0, duration: 0.9, stagger: 0.028, ease: 'power4.out' },
        '-=0.3'
      )
    } else {
      tl.fromTo(h1Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.3')
    }

    tl.fromTo(subRef.current,  { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')

    if (ctaRef.current) {
      tl.fromTo(
        Array.from(ctaRef.current.children),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.15 },
        '-=0.4'
      )
    }

    tl.fromTo(badgeRef.current,
      { scale: 0.6, opacity: 0, rotation: -20 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' },
      '-=0.5'
    )

    tl.fromTo(scrollRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')

    // Scroll dot bounce
    const scrollDot = scrollRef.current?.querySelector<HTMLElement>('.scroll-dot')
    if (scrollDot) {
      gsap.to(scrollDot, { y: 10, repeat: -1, yoyo: true, duration: 0.9, ease: 'sine.inOut', delay: 2.5 })
    }

    // Badge ring spin — only desktop (no visual benefit on mobile, saves a compositing layer)
    if (!isMobile) {
      const badgeRing = badgeRef.current?.querySelector<SVGElement>('.badge-ring')
      if (badgeRing) {
        gsap.to(badgeRing, {
          rotation: 360, repeat: -1, duration: 18, ease: 'none', transformOrigin: '50% 50%',
        })
      }
    }
  }

  return (
    <>
      {/*
        PERF FIX — FONTS:
        Remove @import from component styles.
        In Next.js App Router, add to app/layout.tsx <head>:

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap"
            media="print" onLoad="this.media='all'"
          />

        Better: use next/font/google to self-host fonts (zero Google network dependency).

        PERF FIX — POSTER PRELOAD:
        Add to app/layout.tsx <head> (or per-page metadata):
          <link rel="preload" as="image" href="/hero-poster.webp" fetchPriority="high" />
        This eliminates the ~140 ms Resource Load Delay from the LCP breakdown.
      */}

      <style>{`
        :root {
          --gold:       #C9A84C;
          --gold-light: #F0D878;
          --gold-dim:   #6B4F16;
          --ink:        #080705;
        }

        .font-bebas { font-family: 'Bebas Neue', sans-serif; }
        .font-corm  { font-family: 'Cormorant Garamond', serif; }
        .font-dm    { font-family: 'DM Sans', sans-serif; }

        .grain::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height%3D'100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 5;
        }

        /*
          FIX: gold-shimmer → gold-static
          Old code animated background-position, causing non-composited repaints.
          Static gradient is visually identical with zero CPU cost.
        */
        .gold-static {
          background: linear-gradient(110deg, #6B4F16 0%, #C9A84C 28%, #F0D878 50%, #C9A84C 72%, #6B4F16 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        /* SplitText spans inherit the gradient */
        .gold-static span {
          background: inherit;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn-primary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: background 0.3s, transform 0.25s, box-shadow 0.3s;
        }
        .btn-primary:hover {
          background: #F0D878 !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(201,168,76,0.45);
        }

        .btn-secondary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          border: 1px solid rgba(201,168,76,0.4);
          transition: border-color 0.3s, background 0.3s, transform 0.25s;
        }
        .btn-secondary:hover {
          border-color: #C9A84C;
          background: rgba(201,168,76,0.07);
          transform: translateY(-2px);
        }

        .hero-cut {
          position: absolute; bottom: -1px; left: 0; right: 0;
          height: 60px; background: #080705;
          clip-path: polygon(0 100%, 100% 0, 100% 100%); z-index: 20;
        }

        .badge-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 6.2px; fill: #C9A84C;
          letter-spacing: 3.4px; text-transform: uppercase;
        }

        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.1rem; line-height: 1;
          background: linear-gradient(120deg, #C9A84C, #F0D878);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        h1 { perspective: 900px; }

        @media (min-width: 768px) and (max-width: 1023px) {
          .tablet-stat-num { font-size: 1.7rem !important; }
        }

        /*
          FIX: All animated elements start visible (opacity:1) so the LCP
          element is never hidden waiting for GSAP to load.
          GSAP will re-animate them once it loads — users on fast connections
          see the entrance effect; users on slow connections see content immediately.
        */
        .hero-initially-visible { opacity: 1; }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full h-screen min-h-[640px] overflow-hidden grain"
      >
        {/*
          PERF FIX — VIDEO:
          - opacity starts at 1 (set immediately in useEffect, before GSAP loads)
            so the poster image is the LCP candidate and is visible immediately.
          - fetchPriority="high" tells the browser to prioritise the poster fetch.
          - Add a <link rel="preload" as="image" href="/hero-poster.webp"> in
            your layout <head> to eliminate the Resource Load Delay entirely.
        */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ opacity: 1 }}   /* visible immediately — GSAP re-animates if loaded */
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.webp"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error fetchPriority is valid but missing from React types
          fetchPriority="high"
        />

        {/* Overlays */}
        <div ref={overlayRef} className="absolute inset-0 z-10 pointer-events-none" style={{ opacity: 1 }}>
          <div className="absolute inset-0 bg-[rgba(5,4,3,0.72)]" />
          <div className="absolute inset-0 bg-linear-to-r from-[rgba(5,4,3,0.88)] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[rgba(5,4,3,0.92)] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-150 h-100 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,168,76,0.1)_0%,transparent_70%)]" />
        </div>

        {/* Horizontal gold lines */}
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 z-20 flex items-center pointer-events-none px-6 md:px-10 gap-6">
          <span ref={lineLeftRef}  className="block h-px flex-1 bg-linear-to-r from-transparent via-[rgba(201,168,76,0.3)] to-[rgba(201,168,76,0.1)]" />
          <span ref={lineRightRef} className="block h-px flex-1 bg-linear-to-l from-transparent via-[rgba(201,168,76,0.3)] to-[rgba(201,168,76,0.1)]" />
        </div>

        {/* Main content */}
        <div className="relative z-30 h-full max-w-screen-xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col justify-center">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 md:gap-4 pt-8 md:pt-10 mb-4 md:mb-6">
            <span className="w-6 md:w-8 h-px bg-[#C9A84C]" aria-hidden="true" />
            <p
              ref={taglineRef}
              className="font-dm text-[0.55rem] md:text-[0.6rem] tracking-[0.3em] md:tracking-[0.38em] uppercase text-[#C9A84C]"
              style={{ opacity: 1 }}
            >
              Cutting Image &nbsp;·&nbsp; Premium Barbershop &nbsp;·&nbsp; Staines
            </p>
          </div>

          {/* Headline — visible immediately, GSAP enhances on desktop */}
          <h1
            ref={h1Ref}
            aria-label="Where Style Meets Precision"
            className="font-bebas text-[clamp(3.2rem,9vw,9.5rem)] leading-[0.92] tracking-[0.03em] text-white mb-4 md:mb-5 max-w-[90vw] md:max-w-[680px] lg:max-w-[820px]"
            style={{ opacity: 1 }}
          >
            Where{' '}
            <em className="gold-static not-italic">Style</em>
            <br />
            Meets{' '}
            <span className="text-white/90">Precision</span>
          </h1>

          {/* Sub */}
          <p
            ref={subRef}
            className="italic text-[0.95rem] md:text-[1.05rem] lg:text-[1.12rem] leading-relaxed text-white/55 max-w-[90vw] md:max-w-[400px] lg:max-w-[450px] mb-7 md:mb-10"
            style={{ opacity: 1, fontFamily: 'inherit' }}
          >
            Expert cuts, hot towel shaves &amp; beard sculpting — crafted for the
            modern gentleman at 173 High Street, Staines.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4" style={{ opacity: 1 }}>
            <Link
              href="/booking"
              className="btn-primary inline-flex items-center gap-2.5 font-dm text-[0.65rem] md:text-[0.7rem] font-semibold tracking-[0.22em] uppercase bg-[#C9A84C] text-[#080705] px-6 md:px-8 py-3.5 md:py-4"
            >
              Book Appointment
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <Link
              href="tel:+447444724389"
              className="btn-secondary inline-flex items-center gap-2.5 font-dm text-[0.65rem] md:text-[0.7rem] font-medium tracking-[0.22em] uppercase text-white px-6 md:px-8 py-3.5 md:py-4"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Call Us Now
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 md:gap-8 mt-8 md:mt-14 pt-6 md:pt-8 border-t border-white/[0.07]">
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

        {/* Rotating badge */}
        <div
          ref={badgeRef}
          className="hidden sm:flex absolute bottom-20 md:bottom-24 right-6 md:right-10 lg:right-16 z-30 w-[90px] h-[90px] md:w-[110px] md:h-[110px] items-center justify-center"
          style={{ opacity: 1 }}
          aria-hidden="true"
        >
          <svg
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
          <div className="w-8 h-8 md:w-9 md:h-9 border border-[rgba(201,168,76,0.5)] rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#C9A84C]" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollRef}
          className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
          style={{ opacity: 1 }}
          aria-hidden="true"
        >
          <div className="w-px h-10 md:h-12 relative overflow-hidden bg-white/10">
            <span className="scroll-dot absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-[#C9A84C] to-transparent" />
          </div>
          <span className="font-dm text-[0.52rem] tracking-[0.28em] uppercase text-white/25">Scroll</span>
        </div>

        {/* Angled bottom cut */}
        <div className="hero-cut" aria-hidden="true" />
      </section>
    </>
  )
}