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
          --ivory:   #FAF7F2;
          --ivory-s: #F0EBE1;
          --ink:     #1A1208;
          --ink-m:   #3D2E1A;
          --ink-lt:  #6B5A46;
          --cr:      #8B1A28;
          --cr-b:    #B02235;
          --cr-dim:  rgba(139,26,40,0.12);
          --nv:      #0E1E30;
          --nv-b:    #1A3050;
          --border:  rgba(139,26,40,0.15);
        }

        .font-bebas { font-family:'Bebas Neue',sans-serif; }
        .font-corm  { font-family:'Cormorant Garamond',serif; }
        .font-dm    { font-family:'DM Sans',sans-serif; }

        /* Logo — navy-to-crimson shimmer on light */
        .brand-shimmer {
          background: linear-gradient(130deg, #0E1E30 0%, #8B1A28 40%, #1A3050 65%, #0E1E30 100%);
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
        }

        /* Crimson top rule on scroll */
        .nav-wrap::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent 0%,#8B1A28 15%,#B02235 50%,#8B1A28 85%,transparent 100%);
          opacity:0; transition:opacity .5s;
        }
        .nav-wrap.scrolled::before { opacity:1; }

        /* Book button — navy fill, ivory text */
        .book-btn {
          clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);
          background:var(--nv); color:var(--ivory);
          transition:background .3s,transform .25s,box-shadow .3s;
        }
        .book-btn:hover {
          background:var(--cr) !important;
          transform:translateY(-1px);
          box-shadow:0 8px 28px rgba(139,26,40,.35);
        }

        /* Desktop nav links — dark ink, crimson hover */
        .nav-lnk {
          position:relative; color:var(--ink-lt);
          transition:color .3s;
        }
        .nav-lnk::after {
          content:''; position:absolute; bottom:-3px; left:0;
          height:1px; width:0; background:var(--cr-b);
          transition:width .35s cubic-bezier(.16,1,.3,1);
        }
        .nav-lnk:hover { color:var(--cr); }
        .nav-lnk:hover::after { width:100%; }

        /* Hamburger — dark lines on light bg */
        .hline {
          display:block; width:24px; height:1.5px;
          background:rgba(26,18,8,.65);
          transform-origin:center;
          transition:transform .42s cubic-bezier(.16,1,.3,1),opacity .3s,width .3s,background .3s;
        }
        .hline-mid { width:16px; }
        button:hover .hline-mid { width:24px; }
        .open-1 { transform:translateY(6.5px) rotate(45deg);  background:var(--cr-b); width:24px; }
        .open-2 { opacity:0; transform:scaleX(0); }
        .open-3 { transform:translateY(-6.5px) rotate(-45deg); background:var(--cr-b); }

        /* Drawer — ivory bg */
        .drawer {
          position:fixed; inset:0; width:100%; height:100dvh;
          background:var(--ivory);
          transform:translateX(100%);
          transition:transform .6s cubic-bezier(.16,1,.3,1);
          z-index:200; display:flex; flex-direction:column;
          overflow-y:auto; -webkit-overflow-scrolling:touch;
          will-change:transform; isolation:isolate;
        }
        .drawer.is-open { transform:translateX(0); }

        /* Navy left stripe */
        .d-stripe {
          position:absolute; left:0; top:0; bottom:0; width:3px;
          background:linear-gradient(to bottom,transparent,#0E1E30 25%,#1A3050 50%,#0E1E30 85%,transparent);
          opacity:.7;
        }

        /* Corner accent brackets */
        .d-corner { position:absolute; width:20px; height:20px; opacity:.18; }
        .d-tr { top:82px; right:24px; border-top:1px solid var(--nv); border-right:1px solid var(--nv); }
        .d-bl { bottom:82px; left:24px; border-bottom:1px solid var(--cr); border-left:1px solid var(--cr); }

        /* Animated link rows */
        .m-row {
          opacity:0; transform:translateX(32px);
          transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);
        }
        .is-open .m-row { opacity:1; transform:translateX(0); }
        .is-open .m-row:nth-child(1) { transition-delay:.12s; }
        .is-open .m-row:nth-child(2) { transition-delay:.18s; }
        .is-open .m-row:nth-child(3) { transition-delay:.24s; }
        .is-open .m-row:nth-child(4) { transition-delay:.30s; }

        /* Mobile nav links — dark ink on ivory */
        .m-link {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(2.8rem,10vw,4rem); letter-spacing:.04em;
          color:rgba(26,18,8,.7); text-decoration:none;
          display:flex; align-items:center; gap:1rem;
          padding:14px 0; border-bottom:1px solid rgba(139,26,40,.1);
          transition:color .25s,gap .35s cubic-bezier(.16,1,.3,1);
          -webkit-tap-highlight-color:transparent; min-height:64px;
        }
        .m-link:hover,.m-link:focus-visible { color:var(--cr); gap:1.5rem; outline:none; }

        .m-num {
          font-family:'DM Sans',sans-serif; font-size:.62rem; font-weight:500;
          letter-spacing:.2em; color:var(--cr); opacity:.45;
          align-self:flex-end; padding-bottom:.5em; transition:opacity .25s;
        }
        .m-link:hover .m-num { opacity:1; }
        .m-arr {
          margin-left:auto; color:var(--cr-b); opacity:0; transform:translateX(-8px);
          transition:opacity .25s,transform .35s cubic-bezier(.16,1,.3,1);
        }
        .m-link:hover .m-arr { opacity:.7; transform:translateX(0); }

        .m-cta { opacity:0; transform:translateY(16px); transition:opacity .5s .38s cubic-bezier(.16,1,.3,1),transform .5s .38s cubic-bezier(.16,1,.3,1); }
        .is-open .m-cta { opacity:1; transform:translateY(0); }

        .m-footer { opacity:0; transform:translateY(12px); transition:opacity .5s .45s cubic-bezier(.16,1,.3,1),transform .5s .45s cubic-bezier(.16,1,.3,1); }
        .is-open .m-footer { opacity:1; transform:translateY(0); }

        /* Crimson diamond */
        .diamond { display:inline-block; width:5px; height:5px; background:var(--cr); transform:rotate(45deg); opacity:.5; flex-shrink:0; }

        /* Vertical divider */
        .vdiv { width:1px; height:26px; background:linear-gradient(to bottom,transparent,rgba(139,26,40,.3),transparent); }

        /* Phone link */
        .phone-lnk { color:var(--ink-lt); transition:color .3s; }
        .phone-lnk:hover { color:var(--cr); }
      `}</style>

      {/* Overlay — ivory-tinted */}
      <div aria-hidden onClick={() => setOpen(false)}
        style={{ backgroundColor: 'rgba(240,235,225,.82)' }}
        className={`fixed inset-0 z-[190] backdrop-blur-sm transition-opacity duration-500
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Mobile Drawer */}
      <div ref={drawerRef} className={`drawer md:hidden ${open ? 'is-open' : ''}`}
           role="dialog" aria-modal aria-label="Site navigation">
        <div className="d-stripe" aria-hidden />
        <div className="d-corner d-tr" aria-hidden />
        <div className="d-corner d-bl" aria-hidden />

        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
          <Link href="/" onClick={() => setOpen(false)}>
            <span className="brand-shimmer font-bebas text-[1.4rem] tracking-widest">Cutting Image</span>
          </Link>
          <button onClick={() => setOpen(false)} aria-label="Close menu"
            style={{ borderColor: 'rgba(139,26,40,.2)', color: 'rgba(26,18,8,.45)' }}
            className="w-11 h-11 flex items-center justify-center rounded-full border
              hover:border-[#8B1A28] hover:text-[#8B1A28] transition-all duration-300 active:scale-95">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Divider line — crimson */}
        <div className="relative z-10 mx-6 mt-4 mb-6 h-px"
             style={{ background: 'linear-gradient(to right,rgba(139,26,40,.5),rgba(139,26,40,.15),transparent)' }}
             aria-hidden />

        <nav className="relative z-10 flex flex-col px-6 flex-1">
          {links.map(({ label, href, num }) => (
            <div className="m-row" key={label}>
              <Link href={href} className="m-link" onClick={() => setOpen(false)}>
                <span className="m-num">{num}</span>
                {label}
                <svg className="m-arr" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10h12M11 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          ))}

          <div className="m-cta mt-8">
            {/* Book — navy fill */}
            <Link href="/booking" onClick={() => setOpen(false)}
              className="book-btn w-full flex items-center justify-center gap-3
                font-dm text-[.78rem] font-semibold tracking-[.2em] uppercase px-8 py-5
                transition-all duration-300 active:scale-[.98]">
              Book Appointment
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            {/* Phone — outlined crimson */}
            <a href="tel:+10000000000"
              className="mt-3 w-full flex items-center justify-center gap-2.5
                font-dm text-[.72rem] tracking-[.15em] py-4 border
                transition-all duration-300 active:scale-[.98]"
              style={{ borderColor: 'rgba(139,26,40,.22)', color: 'rgba(139,26,40,.6)' }}>
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
            <span className="block h-px flex-1" style={{ background: 'linear-gradient(to right,rgba(139,26,40,.3),transparent)' }} />
            <span className="diamond" style={{ opacity:.18 }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-corm italic text-[.65rem] tracking-[.22em]"
               style={{ color: 'rgba(26,18,8,.3)' }}>Est. 2015 — Precision craft, every cut.</p>
            <div className="flex items-center gap-3">
              {['instagram','facebook'].map(name => (
                <a key={name} href="#" aria-label={name}
                   style={{ color: 'rgba(26,18,8,.28)' }}
                   className="hover:text-[#8B1A28] transition-colors duration-300">
                  {name === 'instagram' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header — ivory bg */}
      <header className={`nav-wrap fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled ? 'scrolled' : ''}`}
        style={{
          backgroundColor: scrolled ? 'rgba(250,247,242,.97)' : 'rgba(250,247,242,.92)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          boxShadow: scrolled ? '0 2px 40px rgba(26,18,8,.1),0 1px 0 rgba(139,26,40,.12)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(139,26,40,.1)' : '1px solid transparent',
        }}>
        <div className="max-w-[1320px] mx-auto px-5 lg:px-12 h-[72px] flex items-center justify-between gap-8">

          <Link href="/" className="shrink-0">
            <span className="brand-shimmer font-bebas text-[1.45rem] tracking-[.1em]">Cutting Image</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {links.map(({ label, href }) => (
              <Link key={label} href={href}
                className="nav-lnk font-dm text-[.68rem] font-medium tracking-[.2em] uppercase">
                {label}
              </Link>
            ))}
            <span className="vdiv" aria-hidden />
            <a href="tel:+10000000000"
               className="phone-lnk hidden lg:flex items-center gap-2 font-dm text-[.65rem] tracking-[.12em]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.27 1.1l-2.18 2.12z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              (000) 000-0000
            </a>
            <Link href="/booking"
              className="book-btn group inline-flex items-center gap-2.5
                font-dm text-[.68rem] font-semibold tracking-[.2em] uppercase px-7 py-[11px]">
              Book Now
              <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                   viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </nav>

          <button className="md:hidden flex flex-col gap-[5px] p-2.5 -mr-1 z-[210] rounded-sm
              focus-visible:outline focus-visible:outline-2"
            style={{ outlineColor: 'rgba(139,26,40,.5)' }}
            onClick={() => setOpen(s => !s)} aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}>
            <span className={`hline ${open ? 'open-1' : ''}`} />
            <span className={`hline hline-mid ${open ? 'open-2' : ''}`} />
            <span className={`hline ${open ? 'open-3' : ''}`} />
          </button>
        </div>
      </header>

      <div className="h-[72px]" aria-hidden />
    </>
  )
}