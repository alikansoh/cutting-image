"use client"
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const links = [
    { label: 'Services', href: '/services', num: '01' },
    { label: 'Gallery',  href: '/gallery',  num: '02' },
    { label: 'About',    href: '/about',    num: '03' },
    { label: 'Contact',  href: '/contact',  num: '04' },
  ]

  return (
    <>
      <style>{`
        :root {
          --gold:       #C9A84C;
          --gold-light: #E8C96A;
          --gold-dark:  #A07828;
          --gold-dim:   #6B4F16;
          --ink:        #080705;
        }

        .font-bebas { font-family: 'Bebas Neue', sans-serif; }
        .font-corm  { font-family: 'Cormorant Garamond', serif; }
        .font-dm    { font-family: 'DM Sans', sans-serif; }

        .gold-shimmer {
          display: inline-block;
          background: linear-gradient(160deg, #C9A84C, #F0D060);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        .gold-topbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1.5px;
          background: linear-gradient(
            90deg, transparent 0%, #6B4F16 10%, #C9A84C 30%,
            #F5E07A 50%, #C9A84C 70%, #6B4F16 90%, transparent 100%
          );
          opacity: 0;
          transition: opacity 0.5s;
        }
        .gold-topbar.scrolled::before { opacity: 1; }

        .book-btn {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
        }

        .nav-underline::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 0;
          height: 1px; width: 0;
          background: #C9A84C;
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-underline:hover::after,
        .nav-underline:focus-visible::after { width: 100%; }

        .hline {
          display: block;
          width: 24px; height: 1.5px;
          background: rgba(255,255,255,0.85);
          transform-origin: center;
          transition: transform 0.42s cubic-bezier(0.16,1,0.3,1),
                      opacity  0.3s,
                      width    0.3s,
                      background 0.3s;
        }
        .hline-mid { width: 16px; }
        button:hover .hline-mid { width: 24px; }
        .hline-1-open { transform: translateY(6.5px) rotate(45deg);  background: #C9A84C; width: 24px; }
        .hline-2-open { opacity: 0; transform: scaleX(0); }
        .hline-3-open { transform: translateY(-6.5px) rotate(-45deg); background: #C9A84C; }

        .drawer {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%; height: 100dvh;
          background-color: #080705;
          transform: translateX(100%);
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
          z-index: 200;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          will-change: transform;
          isolation: isolate;
        }
        .drawer.is-open { transform: translateX(0); }

        .drawer-accent {
          position: absolute;
          left: 0; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(
            to bottom, transparent 0%, #6B4F16 15%, #C9A84C 50%, #6B4F16 85%, transparent 100%
          );
          opacity: 0.5;
        }

        .m-link-wrap {
          opacity: 0;
          transform: translateX(32px);
          transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1),
                      transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .is-open .m-link-wrap { opacity: 1; transform: translateX(0); }
        .is-open .m-link-wrap:nth-child(1) { transition-delay: 0.12s; }
        .is-open .m-link-wrap:nth-child(2) { transition-delay: 0.18s; }
        .is-open .m-link-wrap:nth-child(3) { transition-delay: 0.24s; }
        .is-open .m-link-wrap:nth-child(4) { transition-delay: 0.30s; }

        .m-link {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 10vw, 4rem);
          letter-spacing: 0.04em;
          color: rgba(220, 214, 200, 0.85);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 14px 0;
          border-bottom: 1px solid rgba(201,168,76,0.07);
          transition: color 0.25s, gap 0.35s cubic-bezier(0.16,1,0.3,1);
          -webkit-tap-highlight-color: transparent;
          min-height: 64px;
        }
        .m-link:hover, .m-link:focus-visible {
          color: #C9A84C;
          gap: 1.5rem;
          outline: none;
        }
        .m-link-num {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.62rem; font-weight: 500;
          letter-spacing: 0.2em;
          color: #C9A84C; opacity: 0.5;
          align-self: flex-end;
          padding-bottom: 0.5em;
          transition: opacity 0.25s;
        }
        .m-link:hover .m-link-num { opacity: 1; }
        .m-link-arrow {
          margin-left: auto;
          color: #C9A84C; opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.25s, transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .m-link:hover .m-link-arrow,
        .m-link:focus-visible .m-link-arrow { opacity: 0.7; transform: translateX(0); }

        .m-cta {
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s 0.38s cubic-bezier(0.16,1,0.3,1),
                      transform 0.5s 0.38s cubic-bezier(0.16,1,0.3,1);
        }
        .is-open .m-cta { opacity: 1; transform: translateY(0); }

        .m-footer {
          opacity: 0; transform: translateY(12px);
          transition: opacity 0.5s 0.45s cubic-bezier(0.16,1,0.3,1),
                      transform 0.5s 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .is-open .m-footer { opacity: 1; transform: translateY(0); }

        .diamond {
          display: inline-block;
          width: 5px; height: 5px;
          background: #C9A84C;
          transform: rotate(45deg);
          opacity: 0.7;
          flex-shrink: 0;
        }

        .v-divider {
          width: 1px; height: 26px;
          background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.3), transparent);
        }
      `}</style>

      {/* ── Overlay ── */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
        className={`fixed inset-0 z-[190] backdrop-blur-sm transition-opacity duration-500
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ── Mobile Drawer ── */}
      <div
        ref={drawerRef}
        className={`drawer md:hidden ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal={true}
        aria-label="Site navigation"
      >
        <div className="drawer-accent" aria-hidden />

        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
          <Link href="/" onClick={() => setOpen(false)} className="flex flex-col leading-none">
            <span className="gold-shimmer font-bebas text-[1.4rem] tracking-widest">
              Cutting Image
            </span>
          </Link>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{ borderColor: 'rgba(201,168,76,0.2)', color: 'rgba(201,168,76,0.6)' }}
            className="w-11 h-11 flex items-center justify-center rounded-full border
              hover:border-[rgba(201,168,76,0.5)] hover:text-[#C9A84C]
              transition-all duration-300 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="relative z-10 mx-6 mt-4 mb-6 h-px"
             style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.4), rgba(201,168,76,0.15), transparent)' }}
             aria-hidden />

        <nav className="relative z-10 flex flex-col px-6 flex-1">
          {links.map(({ label, href, num }) => (
            <div className="m-link-wrap" key={label}>
              <Link href={href} className="m-link" onClick={() => setOpen(false)}>
                <span className="m-link-num">{num}</span>
                {label}
                <svg className="m-link-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10h12M11 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          ))}

          <div className="m-cta mt-8">
            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="book-btn w-full flex items-center justify-center gap-3
                font-dm text-[0.78rem] font-semibold tracking-[0.2em] uppercase
                px-8 py-5 transition-all duration-300 active:scale-[0.98]"
              style={{ background: '#C9A84C', color: '#080705' }}
            >
              Book Appointment
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <a
              href="tel:+10000000000"
              className="mt-3 w-full flex items-center justify-center gap-2.5
                font-dm text-[0.72rem] tracking-[0.15em] py-4
                border transition-all duration-300 active:scale-[0.98]"
              style={{ color: 'rgba(201,168,76,0.5)', borderColor: 'rgba(201,168,76,0.12)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.27 1.1l-2.18 2.12z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              (000) 000-0000
            </a>
          </div>
        </nav>

        <div className="m-footer relative z-10 mt-auto px-6 pb-8 pt-6">
          <div className="flex items-center gap-3 mb-3" aria-hidden>
            <span className="diamond" />
            <span className="block h-px flex-1"
                  style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.25), transparent)' }} />
            <span className="diamond" style={{ opacity: 0.3 }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-corm italic text-[0.65rem] tracking-[0.22em]"
               style={{ color: 'rgba(201,168,76,0.3)' }}>
              Est. 2015 — Precision craft, every cut.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram"
                 style={{ color: 'rgba(201,168,76,0.3)' }}
                 className="hover:text-[#C9A84C] transition-colors duration-300 active:scale-95">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook"
                 style={{ color: 'rgba(201,168,76,0.3)' }}
                 className="hover:text-[#C9A84C] transition-colors duration-300 active:scale-95">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header
        className={`gold-topbar fixed top-0 inset-x-0 z-[100] transition-all duration-500
          ${scrolled ? 'scrolled' : ''}`}
        style={{
          backgroundColor: 'rgba(8,7,5,0.97)',
          boxShadow: scrolled ? '0 2px 60px rgba(0,0,0,0.65)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(201,168,76,0.1)' : '1px solid transparent',
        }}
      >
        <div className="max-w-[1320px] mx-auto px-5 lg:px-12 h-[72px] flex items-center justify-between gap-8">

          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <span className="gold-shimmer font-bebas text-[1.45rem] tracking-[0.1em]">
              Cutting Image
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {links.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="nav-underline relative font-dm text-[0.68rem] font-medium tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors duration-300"
              >
                {label}
              </Link>
            ))}

            <span className="v-divider" aria-hidden />

            <a
              href="tel:+10000000000"
              className="hidden lg:flex items-center gap-2 font-dm text-[0.65rem] tracking-[0.12em] transition-colors duration-300"
              style={{ color: 'rgba(201,168,76,0.7)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.27 1.1l-2.18 2.12z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              (000) 000-0000
            </a>

            <Link
              href="/booking"
              className="book-btn group inline-flex items-center gap-2.5
                font-dm text-[0.68rem] font-semibold tracking-[0.2em] uppercase
                px-7 py-[11px] transition-all duration-300 hover:-translate-y-px"
              style={{ background: '#C9A84C', color: '#080705' }}
            >
              Book Now
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 14 14" fill="none" aria-hidden
              >
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </nav>

          <button
            className="md:hidden flex flex-col gap-[5px] p-2.5 -mr-1 z-[210] rounded-sm
              focus-visible:outline focus-visible:outline-2"
            style={{ outlineColor: 'rgba(201,168,76,0.5)' }}
            onClick={() => setOpen(s => !s)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className={`hline ${open ? 'hline-1-open' : ''}`} />
            <span className={`hline hline-mid ${open ? 'hline-2-open' : ''}`} />
            <span className={`hline ${open ? 'hline-3-open' : ''}`} />
          </button>
        </div>
      </header>

      <div className="h-[72px]" aria-hidden />
    </>
  )
}