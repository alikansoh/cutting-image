"use client";

import { JSX } from "react";
import Link from "next/link";

const HOURS = [
  { day: "Monday",    open: "9 am", close: "7 pm" },
  { day: "Tuesday",   open: "9 am", close: "7 pm" },
  { day: "Wednesday", open: "9 am", close: "7 pm" },
  { day: "Thursday",  open: "9 am", close: "7 pm" },
  { day: "Friday",    open: "9 am", close: "7 pm" },
  { day: "Saturday",  open: "9 am", close: "6 pm" },
  { day: "Sunday",    open: "10 am", close: "5 pm" },
];

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Services", href: "/services" },
  { label: "About",    href: "/about" },
  { label: "contact us",  href: "/contact" },
];

function getTodayName(): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(new Date());
}

export default function Footer(): JSX.Element {
  const today = getTodayName();

  return (
    <>
      {/* Google Fonts + Material Symbols */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0"
      />

      <style>{`
        :root {
          --gold:        #C9A84C;
          --gold-light:  #F0D878;
          --gold-dim:    #7A5C1E;
          --ink:         #080705;
          --ink2:        #0D0C0A;
          --ink3:        #131210;
          --warm:        #F0EAD6;
          --muted:       #7A7060;
          --border:      rgba(201,168,76,0.15);
          --border-soft: rgba(201,168,76,0.07);
        }

        .ft-root *, .ft-root *::before, .ft-root *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .ft-root {
          background: var(--ink2);
          color: var(--warm);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          border-top: 1px solid var(--border);
          width: 100%;
        }

        /* Grain */
        .ft-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.035;
          pointer-events: none;
          z-index: 0;
        }

        /* Radial glows */
        .ft-glow-br {
          position: absolute; bottom: 0; right: 0;
          width: 600px; height: 400px;
          background: radial-gradient(ellipse at bottom right, rgba(201,168,76,0.055) 0%, transparent 68%);
          pointer-events: none; z-index: 0;
        }
        .ft-glow-tl {
          position: absolute; top: 0; left: 0;
          width: 500px; height: 300px;
          background: radial-gradient(ellipse at top left, rgba(201,168,76,0.04) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }

        /* ─── WRAPPER ─── */
        .ft-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 60px;
          position: relative;
          z-index: 1;
          width: 100%;
        }
        @media (max-width: 1024px) { .ft-inner { padding: 0 40px; } }
        @media (max-width: 640px)  { .ft-inner { padding: 0 24px; } }

        /* ─── TOP BAND ─── */
        .ft-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          padding: 60px 0 48px;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 600px) {
          .ft-top {
            flex-direction: column;
            align-items: flex-start;
            padding: 44px 0 36px;
            gap: 24px;
          }
        }

        .ft-wordmark { display: flex; flex-direction: column; gap: 6px; }
        .ft-wordmark-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 4.5vw, 3rem);
          letter-spacing: 0.06em;
          line-height: 1;
          background: linear-gradient(
            115deg,
            var(--gold-dim) 0%,
            var(--gold) 30%,
            var(--gold-light) 52%,
            var(--gold) 72%,
            var(--gold-dim) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ft-wordmark-sub {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .ft-book-btn {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: var(--gold);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 15px 30px;
          white-space: nowrap;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: background 0.3s, gap 0.35s, transform 0.25s;
        }
        .ft-book-btn:hover {
          background: var(--gold-light);
          gap: 20px;
          transform: translateY(-2px);
        }
        .ft-book-btn .material-symbols-outlined {
          font-size: 18px;
          transition: transform 0.35s;
        }
        .ft-book-btn:hover .material-symbols-outlined {
          transform: translateX(4px);
        }

        /* ─── DIVIDER LINE ─── */
        .ft-divider {
          width: 100%;
          height: 1px;
          background: var(--border);
        }

        /* ─── MAIN GRID ─── */
        .ft-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.9fr 1.4fr;
          gap: 0;
          padding: 0;
        }
        @media (max-width: 900px) {
          .ft-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 560px) {
          .ft-grid {
            grid-template-columns: 1fr;
          }
        }

        .ft-col {
          padding: 52px 48px 52px 0;
          border-right: 1px solid var(--border-soft);
        }
        .ft-col:last-child {
          border-right: none;
          padding-right: 0;
        }
        .ft-col:not(:first-child) {
          padding-left: 48px;
        }
        @media (max-width: 900px) {
          .ft-col { padding: 40px 32px 40px 0; }
          .ft-col:not(:first-child) { padding-left: 32px; }
          /* Hours col full width on 2-col layout */
          .ft-col:last-child {
            grid-column: 1 / -1;
            border-top: 1px solid var(--border-soft);
            border-right: none;
            padding-left: 0;
            padding-right: 0;
          }
        }
        @media (max-width: 560px) {
          .ft-col { padding: 36px 0; border-right: none; border-bottom: 1px solid var(--border-soft); }
          .ft-col:last-child { border-bottom: none; }
          .ft-col:not(:first-child) { padding-left: 0; }
        }

        .ft-col-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }
        .ft-col-label::before {
          content: '';
          width: 22px;
          height: 1px;
          background: var(--gold);
          opacity: 0.55;
          flex-shrink: 0;
        }

        /* ─── CONTACT ─── */
        .ft-contact-list { display: flex; flex-direction: column; gap: 22px; }
        .ft-contact-item { display: flex; flex-direction: column; gap: 5px; }
        .ft-contact-item-label {
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .ft-contact-link {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 400;
          font-style: italic;
          color: var(--warm);
          text-decoration: none;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          display: inline-flex;
          align-items: flex-start;
          gap: 9px;
          transition: color 0.3s;
        }
        .ft-contact-link:hover { color: var(--gold-light); }
        .ft-contact-link .material-symbols-outlined {
          font-size: 15px;
          opacity: 0.5;
          flex-shrink: 0;
          margin-top: 2px;
          transition: opacity 0.3s;
          font-style: normal;
        }
        .ft-contact-link:hover .material-symbols-outlined { opacity: 1; }

        .ft-contact-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-style: italic;
          color: var(--warm);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .ft-contact-value .material-symbols-outlined {
          font-size: 15px;
          opacity: 0.4;
          flex-shrink: 0;
          font-style: normal;
        }

        /* ─── NAV ─── */
        .ft-nav { display: flex; flex-direction: column; gap: 4px; }

        .ft-nav-link {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.55rem;
          letter-spacing: 0.08em;
          color: rgba(240,234,214,0.75);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0;
          padding: 6px 0;
          position: relative;
          transition: color 0.3s, gap 0.35s;
          overflow: hidden;
        }
        .ft-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 1px;
          width: 0%;
          background: linear-gradient(90deg, var(--gold), transparent);
          transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .ft-nav-link:hover { color: var(--warm); }
        .ft-nav-link:hover::after { width: 100%; }
        .ft-nav-link .material-symbols-outlined {
          font-size: 14px;
          opacity: 0;
          margin-right: -14px;
          transition: opacity 0.3s, margin 0.35s;
          color: var(--gold);
          font-style: normal;
        }
        .ft-nav-link:hover .material-symbols-outlined {
          opacity: 1;
          margin-right: 8px;
        }

        /* ─── HOURS ─── */
        .ft-hours { display: flex; flex-direction: column; }

        .ft-hour-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 0;
          border-bottom: 1px solid var(--border-soft);
          transition: padding 0.25s;
          position: relative;
        }
        .ft-hour-row:last-child { border-bottom: none; }
        .ft-hour-row.ft-today {
          padding-left: 10px;
          padding-right: 10px;
          margin: 0 -10px;
        }
        .ft-hour-row.ft-today::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(201,168,76,0.06);
          border-left: 2px solid var(--gold);
        }

        .ft-hour-day {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: color 0.25s;
        }
        .ft-today .ft-hour-day { color: var(--gold); }

        .ft-hour-time {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.9rem;
          font-style: italic;
          color: rgba(240,234,214,0.55);
          white-space: nowrap;
          position: relative;
          z-index: 1;
          transition: color 0.25s;
        }
        .ft-today .ft-hour-time { color: rgba(240,234,214,0.9); }

        .ft-today-pill {
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: var(--gold);
          color: var(--ink);
          padding: 3px 8px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        /* ─── BOTTOM BAR ─── */
        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 26px 0;
          border-top: 1px solid var(--border);
        }
        @media (max-width: 640px) {
          .ft-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }

        .ft-copy {
          font-size: 9.5px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: var(--muted);
          line-height: 1.7;
        }
        .ft-copy a {
          color: rgba(201,168,76,0.7);
          text-decoration: none;
          transition: color 0.3s;
        }
        .ft-copy a:hover { color: var(--gold); }

        /* ─── SOCIAL ─── */
        .ft-social {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .ft-social-link {
          width: 36px;
          height: 36px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          text-decoration: none;
          transition: border-color 0.3s, color 0.3s, background 0.3s, transform 0.25s;
          position: relative;
          overflow: hidden;
        }
        .ft-social-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(201,168,76,0.08);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ft-social-link:hover::before { opacity: 1; }
        .ft-social-link:hover {
          border-color: var(--gold);
          color: var(--gold);
          transform: translateY(-2px);
        }
        .ft-social-link .material-symbols-outlined,
        .ft-social-link svg {
          font-size: 16px;
          width: 16px;
          height: 16px;
          position: relative;
          z-index: 1;
        }
      `}</style>

      <footer className="ft-root" role="contentinfo">
        <div className="ft-glow-br" aria-hidden="true" />
        <div className="ft-glow-tl" aria-hidden="true" />

        {/* ── TOP BAND ── */}
        <div className="ft-inner">
          <div className="ft-top">
            <div className="ft-wordmark">
              <span className="ft-wordmark-name">Cutting Image</span>
              <span className="ft-wordmark-sub">Premium Barbershop · Est. 1990</span>
            </div>
           
           
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="ft-inner">
          <div className="ft-grid">

            {/* Col 1 — Contact */}
            <div className="ft-col">
              <p className="ft-col-label">Contact</p>
              <div className="ft-contact-list">

                <div className="ft-contact-item">
                  <span className="ft-contact-item-label">Address</span>
                  <a
                    href="https://maps.google.com/?q=2+Kingston+Rd,+Staines-upon-Thames+TW18+4LG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-contact-link"
                    aria-label="Open address in Google Maps"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                    <span>2 Kingston Rd,<br />Staines-upon-Thames<br />TW18 4LG</span>
                  </a>
                </div>

                <div className="ft-contact-item">
                  <span className="ft-contact-item-label">Phone</span>
                  <a href="tel:+441784449005" className="ft-contact-link" aria-label="Call us">
                    <span className="material-symbols-outlined" aria-hidden="true">call</span>
                    01784 449005
                  </a>
                </div>

                <div className="ft-contact-item">
                  <span className="ft-contact-item-label">Walk-ins</span>
                  <span className="ft-contact-value">
                    <span className="material-symbols-outlined" aria-hidden="true">how_to_reg</span>
                    Always welcome
                  </span>
                </div>

              </div>
            </div>

            {/* Col 2 — Navigation */}
            <div className="ft-col">
              <p className="ft-col-label">Navigate</p>
              <nav className="ft-nav" aria-label="Footer navigation">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link key={label} href={href} className="ft-nav-link">
                    <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Col 3 — Hours */}
            <div className="ft-col">
              <p className="ft-col-label">Opening Hours</p>
              <div className="ft-hours">
                {HOURS.map(({ day, open, close }) => {
                  const isToday = day === today;
                  return (
                    <div key={day} className={`ft-hour-row${isToday ? " ft-today" : ""}`}>
                      <span className="ft-hour-day">{day.slice(0, 3)}</span>
                      <span className="ft-hour-time">{open} – {close}</span>
                      {isToday && <span className="ft-today-pill">Today</span>}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="ft-inner">
          <div className="ft-bottom">
            <p className="ft-copy">
              © {new Date().getFullYear()} Cutting Image. All rights reserved.
              &nbsp;·&nbsp;
              <a
                href="https://maps.google.com/?q=2+Kingston+Rd,+Staines-upon-Thames+TW18+4LG"
                target="_blank"
                rel="noopener noreferrer"
              >
                2 Kingston Rd, Staines TW18 4LG
              </a>
            </p>

            <div className="ft-social" aria-label="Social media links">

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-social-link"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-social-link"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>

              {/* Google Maps — using Material Symbol */}
              <a
                href="https://maps.google.com/?q=2+Kingston+Rd,+Staines-upon-Thames+TW18+4LG"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-social-link"
                aria-label="Find us on Google Maps"
              >
                <span className="material-symbols-outlined" aria-hidden="true">map</span>
              </a>

              {/* WhatsApp / Phone */}
              <a
                href="tel:+441784449005"
                className="ft-social-link"
                aria-label="Call us"
              >
                <span className="material-symbols-outlined" aria-hidden="true">call</span>
              </a>

            </div>
          </div>
        </div>
      </footer>
    </>
  );
}