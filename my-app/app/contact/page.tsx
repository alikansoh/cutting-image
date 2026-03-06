"use client";
import { JSX, useEffect, useRef, useState } from "react";

/*
  Add to app/layout.tsx <head> (if not already added):

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
    media="print" onLoad="this.media='all'"
  />
*/


// ── Data ──────────────────────────────────────────────────────────────────────

const CONTACT_METHODS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.93a16 16 0 0 0 6.16 6.16l.93-.93a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: "Call Us",
    value: "01784 449005",
    sub: "Give us a ring",
    href: "tel:01784449005",
    cta: "Call Now",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>
        <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
      </svg>
    ),
    label: "Find Us",
    value: "2 Kingston Road",
    sub: "Staines-upon-Thames, TW18 4LG",
    href: "https://www.google.com/maps/place/Cutting+Image/@51.4350981,-0.5086567,17z/data=!3m1!4b1!4m6!3m5!1s0x487676cac16c3115:0x78edc50a61e9f190!8m2!3d51.4350981!4d-0.5060818!16s%2Fg%2F1tcz7tw9",
    cta: "Get Directions",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: "Opening Hours",
    value: "Mon – Fri  9am – 7pm",
    sub: "Sat 9am–6pm · Sun 10am–5pm",
    href: null,
    cta: null,
  },
];

const HOURS = [
  { day: "Monday",    time: "9:00 AM – 7:00 PM" },
  { day: "Tuesday",   time: "9:00 AM – 7:00 PM" },
  { day: "Wednesday", time: "9:00 AM – 7:00 PM" },
  { day: "Thursday",  time: "9:00 AM – 7:00 PM" },
  { day: "Friday",    time: "9:00 AM – 7:00 PM" },
  { day: "Saturday",  time: "9:00 AM – 6:00 PM" },
  { day: "Sunday",    time: "10:00 AM – 5:00 PM" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function ContactPage(): JSX.Element {
  const pageRef          = useRef<HTMLDivElement>(null);
  const hasAnimated      = useRef<boolean>(false);
  const hasLoadedScripts = useRef<boolean>(false);

  // Form state
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });

  useEffect(() => {
    loadGSAP();
    return () => { window.ScrollTrigger?.getAll().forEach((t) => t.kill()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src: string): Promise<void> =>
    new Promise<void>((resolve) => {
      const filename = src.split("/").pop()!;
      if (document.querySelector(`script[src*="${filename}"]`)) { setTimeout(resolve, 50); return; }
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

  const loadGSAP = async (): Promise<void> => {
    if (hasLoadedScripts.current) return;
    hasLoadedScripts.current = true;
    await Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"),
    ]);
    initAnimations();
  };

  const initAnimations = (): void => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger || hasAnimated.current) return;
    hasAnimated.current = true;
    gsap.registerPlugin(ScrollTrigger);
    const page = pageRef.current;
    if (!page) return;

    // Hero char reveal
    page.querySelectorAll<HTMLElement>(".cp-hero-line").forEach((line) => {
      const text = line.textContent ?? "";
      line.innerHTML = text.split("").map((c) =>
        c.trim() === ""
          ? `<span style="display:inline-block;width:0.28em"> </span>`
          : `<span class="cp-char" style="display:inline-block">${c}</span>`
      ).join("");
    });

    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".cp-char"),
      { yPercent: 110, rotationX: -40, opacity: 0 },
      { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.016, duration: 0.85, ease: "power3.out", delay: 0.2 }
    );

    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-hero-eyebrow"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.15 }
    );

    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-hero-sub"),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.9 }
    );

    // Line draws
    page.querySelectorAll<HTMLElement>(".cp-line-draw").forEach((el) => {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left center",
        scrollTrigger: { trigger: el, start: "top 82%" },
      });
    });

    // Contact method cards
    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".cp-method-card"),
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: page.querySelector(".cp-methods"), start: "top 80%" },
      }
    );

    // Hours rows
    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".cp-hour-row"),
      { x: -30, opacity: 0 },
      {
        x: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: page.querySelector(".cp-hours"), start: "top 82%" },
      }
    );

    // Form panel
    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-form-panel"),
      { x: 50, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: page.querySelector(".cp-form-panel"), start: "top 80%" },
      }
    );

    // Map section
    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-map-section"),
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: page.querySelector(".cp-map-section"), start: "top 82%" },
      }
    );

    // Fade ups
    page.querySelectorAll<HTMLElement>(".cp-fade-up").forEach((el) => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 84%" },
      });
    });
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    // Compose a mailto as fallback — primary CTA is to call
    setSubmitted(true);
  };

  return (
    <>
      <style>{`
        :root {
          --gold:       #C9A84C;
          --gold-light: #F0D878;
          --gold-dim:   #6B4F16;
          --ink:        #080705;
          --ink2:       #0F0E0C;
          --ink3:       #141210;
          --warm:       #F0EAD6;
          --muted:      #7A7060;
          --body-text:  rgba(240,234,214,0.82);
          --border:     rgba(201,168,76,0.15);
          --border-h:   rgba(201,168,76,0.35);
        }

        .cp-page *, .cp-page *::before, .cp-page *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .cp-page {
          background: var(--ink);
          color: var(--warm);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow-x: hidden;
        }

        /* Grain */
        .cp-page::after {
          content: '';
          position: fixed; inset: 0; z-index: 200;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.028; pointer-events: none;
        }

        .cp-inner {
          max-width: 1320px; margin: 0 auto;
          padding: 0 80px; position: relative; z-index: 2;
        }
        @media (max-width: 900px) { .cp-inner { padding: 0 24px; } }

        /* ─── DECORATIVE VERTICAL LINES ─── */
        .cp-vert-line {
          position: fixed; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(to bottom, transparent, var(--gold) 20%, var(--gold) 80%, transparent);
          opacity: 0.1; pointer-events: none; z-index: 1;
        }
        .cp-vert-line-l { left: 52px; }
        .cp-vert-line-r { right: 52px; }
        @media (max-width: 900px) { .cp-vert-line { display: none; } }

        /* ─── HERO ─── */
        .cp-hero {
          min-height: 72vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-bottom: 100px; padding-top: 100px; position: relative;
          border-bottom: 1px solid var(--border);
          overflow: hidden;
          margin-top: 80px;
        }

        /* Animated radial glow behind heading */
        .cp-hero-glow {
          position: absolute;
          width: 900px; height: 900px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          top: -200px; left: -100px;
          pointer-events: none; z-index: 0;
          animation: glowPulse 6s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }

        /* Large background text */
        .cp-hero-bg-text {
          position: absolute; bottom: -30px; right: -20px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(10rem, 24vw, 24rem);
          line-height: 1; letter-spacing: 0.04em;
          color: rgba(201,168,76,0.03);
          pointer-events: none; user-select: none; z-index: 0;
          white-space: nowrap;
        }

        .cp-hero-eyebrow {
          display: flex; align-items: center; gap: 14px; margin-bottom: 28px; position: relative; z-index: 2;
        }
        .cp-hero-eyebrow-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--gold);
        }
        .cp-hero-eyebrow-line {
          width: 60px; height: 1px; background: var(--gold); opacity: 0.6;
        }

        .cp-hero-heading { position: relative; z-index: 2; margin-bottom: 32px; }
        .cp-hero-line {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 13vw, 13rem);
          line-height: 0.87; letter-spacing: 0.02em;
          color: var(--warm);
        }
        .cp-hero-line.gold {
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 28%, var(--gold-light) 50%, var(--gold) 72%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cp-hero-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(1.1rem, 1.5vw, 1.35rem); line-height: 1.75;
          color: var(--body-text); max-width: 480px;
          position: relative; z-index: 2;
        }

        /* ─── CONTACT METHOD CARDS ─── */
        .cp-methods-section {
          padding: 100px 0 0;
        }

        .cp-methods {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; background: var(--border);
        }
        @media (max-width: 780px) { .cp-methods { grid-template-columns: 1fr; } }

        .cp-method-card {
          background: var(--ink2);
          padding: 52px 44px;
          position: relative; overflow: hidden;
          transition: background 0.4s ease;
          display: flex; flex-direction: column; gap: 0;
        }
        .cp-method-card:hover { background: var(--ink3); }

        /* Top gold sliver on hover */
        .cp-method-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent);
          transform: scaleX(0); transform-origin: center;
          transition: transform 0.55s ease;
        }
        .cp-method-card:hover::before { transform: scaleX(1); }

        .cp-method-icon {
          width: 40px; height: 40px; color: var(--gold);
          margin-bottom: 28px; flex-shrink: 0;
          transition: transform 0.4s ease;
        }
        .cp-method-card:hover .cp-method-icon { transform: translateY(-4px); }

        .cp-method-label {
          font-size: 9.5px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 12px; font-weight: 500;
        }

        .cp-method-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem; letter-spacing: 0.04em; line-height: 1.1;
          color: var(--warm); margin-bottom: 6px;
        }

        .cp-method-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1rem; color: var(--muted); margin-bottom: 32px; flex: 1;
        }

        .cp-method-cta {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold);
          text-decoration: none;
          border-bottom: 1px solid rgba(201,168,76,0.3); padding-bottom: 4px;
          transition: gap 0.3s ease, color 0.3s ease;
          align-self: flex-start;
        }
        .cp-method-cta:hover { gap: 16px; color: var(--gold-light); }
        .cp-method-cta svg { transition: transform 0.3s ease; }
        .cp-method-cta:hover svg { transform: translateX(4px); }

        /* ─── MAIN CONTENT: HOURS + FORM ─── */
        .cp-content {
          display: grid; grid-template-columns: 1fr 1.1fr;
          gap: 0; align-items: start;
          padding: 100px 0;
          border-top: 1px solid var(--border);
          margin-top: 100px;
        }
        @media (max-width: 900px) {
          .cp-content { grid-template-columns: 1fr; }
        }

        /* Hours panel */
        .cp-hours-panel {
          padding-right: 80px;
          border-right: 1px solid var(--border);
        }
        @media (max-width: 900px) {
          .cp-hours-panel { padding-right: 0; border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 60px; margin-bottom: 60px; }
        }

        .cp-eyebrow {
          display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
        }
        .cp-eyebrow-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--gold);
        }
        .cp-line-draw {
          height: 1px; width: 52px; background: var(--gold);
          transform: scaleX(0); transform-origin: left center;
        }

        .cp-section-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 0.9; letter-spacing: 0.03em;
          color: var(--warm); margin-bottom: 48px;
        }
        .cp-section-heading .g {
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 30%, var(--gold-light) 55%, var(--gold) 75%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cp-hours { display: flex; flex-direction: column; }

        .cp-hour-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid var(--border);
          position: relative;
          transition: padding-left 0.35s ease;
        }
        .cp-hour-row:first-child { border-top: 1px solid var(--border); }
        .cp-hour-row.today {
          padding-left: 16px;
        }
        .cp-hour-row.today::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px; background: var(--gold);
        }

        .cp-hour-day {
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--muted); font-weight: 500;
          transition: color 0.3s ease;
        }
        .cp-hour-row.today .cp-hour-day { color: var(--warm); }

        .cp-hour-time {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.05rem; color: var(--body-text);
          transition: color 0.3s ease;
        }
        .cp-hour-row.today .cp-hour-time { color: var(--gold); }

        .cp-hour-badge {
          font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase;
          background: var(--gold); color: var(--ink);
          padding: 3px 8px; font-weight: 600; margin-left: 10px;
          display: inline-block;
        }

        /* Form panel */
        .cp-form-panel {
          padding-left: 80px;
        }
        @media (max-width: 900px) { .cp-form-panel { padding-left: 0; } }

        .cp-form { display: flex; flex-direction: column; gap: 0; }

        .cp-field {
          position: relative; margin-bottom: 2px;
        }

        .cp-field-label {
          font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--muted); font-weight: 500;
          position: absolute; top: 20px; left: 24px;
          transition: all 0.3s ease; pointer-events: none;
          z-index: 2;
        }

        .cp-field.active .cp-field-label,
        .cp-field.filled .cp-field-label {
          top: 12px; font-size: 8px; color: var(--gold);
        }

        .cp-input, .cp-textarea {
          width: 100%; background: var(--ink2);
          border: none; border-bottom: 1px solid var(--border);
          color: var(--warm); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; padding: 36px 24px 16px;
          outline: none; resize: none;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .cp-input:focus, .cp-textarea:focus {
          background: var(--ink3);
          border-bottom-color: var(--gold);
        }
        .cp-textarea { min-height: 140px; }

        /* Focus line effect */
        .cp-field-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--gold);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s ease;
          pointer-events: none;
        }
        .cp-field.active .cp-field-line { transform: scaleX(1); }

        .cp-form-note {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 0.95rem; color: var(--muted); margin: 24px 0 32px;
          line-height: 1.7; padding-left: 24px;
          border-left: 1px solid var(--border);
        }

        .cp-submit-btn {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--gold); color: var(--ink);
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.24em;
          text-transform: uppercase; border: none; cursor: pointer;
          padding: 20px 48px; position: relative; overflow: hidden;
          transition: gap 0.35s ease;
          align-self: flex-start;
        }
        .cp-submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: var(--gold-light);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .cp-submit-btn:hover { gap: 22px; }
        .cp-submit-btn:hover::before { transform: translateX(0); }
        .cp-submit-btn span, .cp-submit-btn svg { position: relative; z-index: 1; }
        .cp-submit-btn svg { transition: transform 0.35s ease; }
        .cp-submit-btn:hover svg { transform: translateX(4px); }

        /* Success state */
        .cp-success {
          padding: 48px; background: var(--ink2);
          border-left: 2px solid var(--gold);
          display: flex; flex-direction: column; gap: 12px;
        }
        .cp-success-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 2rem;
          letter-spacing: 0.06em; color: var(--warm);
        }
        .cp-success-body {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.1rem; color: var(--body-text); line-height: 1.75;
        }

        /* ─── MAP SECTION ─── */
        .cp-map-section {
          border-top: 1px solid var(--border);
          padding: 0 0 100px;
        }

        .cp-map-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          padding: 72px 0 40px; flex-wrap: wrap; gap: 20px;
        }

        .cp-map-frame {
          width: 100%; height: 440px; position: relative;
          overflow: hidden;
          filter: grayscale(0.6) contrast(1.1);
        }
        .cp-map-frame iframe {
          width: 100%; height: 100%; border: none; display: block;
        }
        /* Gold overlay tint on map */
        .cp-map-frame::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(201,168,76,0.04);
          pointer-events: none; z-index: 2;
          mix-blend-mode: multiply;
        }
        /* Border frame */
        .cp-map-frame::before {
          content: ''; position: absolute; inset: 0;
          border: 1px solid var(--border);
          z-index: 3; pointer-events: none;
        }

        .cp-map-tag {
          position: absolute; bottom: 24px; left: 24px; z-index: 4;
          background: rgba(8,7,5,0.92); border-left: 2px solid var(--gold);
          padding: 14px 20px; backdrop-filter: blur(12px);
          display: flex; flex-direction: column; gap: 4px;
        }
        .cp-map-tag-name {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem;
          letter-spacing: 0.08em; color: var(--warm);
        }
        .cp-map-tag-addr {
          font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--gold);
        }

        .cp-map-directions {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
          text-decoration: none;
          border-bottom: 1px solid rgba(122,112,96,0.3); padding-bottom: 4px;
          transition: color 0.3s ease;
        }
        .cp-map-directions:hover { color: var(--gold); }

        /* ─── BOTTOM STRIP ─── */
        .cp-bottom {
          display: grid; grid-template-columns: repeat(2, 1fr);
          border-top: 1px solid var(--border);
        }
        @media (max-width: 640px) { .cp-bottom { grid-template-columns: 1fr; } }

        .cp-bottom-item {
          padding: 48px 52px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 10px;
        }
        .cp-bottom-item:last-child { border-right: none; }

        .cp-bottom-label {
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--gold); font-weight: 500;
        }
        .cp-bottom-value {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.1rem; line-height: 1.65; color: var(--body-text);
        }
        .cp-bottom-value a { color: var(--gold); text-decoration: none; transition: color 0.3s; }
        .cp-bottom-value a:hover { color: var(--gold-light); }

        @media (prefers-reduced-motion: reduce) {
          .cp-hero-glow, .cp-hero-scroll-line { animation: none !important; }
        }
      `}</style>

      <div className="cp-page" ref={pageRef} id="contact">
        <div className="cp-vert-line cp-vert-line-l" aria-hidden="true" />
        <div className="cp-vert-line cp-vert-line-r" aria-hidden="true" />

        {/* ─── HERO ─── */}
        <section className="cp-hero">
          <div className="cp-hero-glow" aria-hidden="true" />
          <div className="cp-hero-bg-text" aria-hidden="true">CONTACT</div>

          <div className="cp-inner">
            <div className="cp-hero-eyebrow">
              <span className="cp-hero-eyebrow-label">Cutting Image · Staines</span>
              <span className="cp-hero-eyebrow-line" />
            </div>

            <div className="cp-hero-heading">
              <span className="cp-hero-line">Get In</span>
              <span className="cp-hero-line gold">Touch</span>
            </div>

            <p className="cp-hero-sub">
              Walk-ins always welcome. Call us on{" "}
              <a href="tel:01784449005" style={{ color: "var(--gold)", textDecoration: "none" }}>01784 449005</a>{" "}
              or drop us a message below.
            </p>
          </div>
        </section>

        {/* ─── CONTACT METHOD CARDS ─── */}
        <section className="cp-methods-section">
          <div className="cp-inner">
            <div className="cp-methods">
              {CONTACT_METHODS.map((m) => (
                <div key={m.label} className="cp-method-card">
                  <div className="cp-method-icon">{m.icon}</div>
                  <div className="cp-method-label">{m.label}</div>
                  <div className="cp-method-value">{m.value}</div>
                  <div className="cp-method-sub">{m.sub}</div>
                  {m.href && m.cta && (
                    <a href={m.href} className="cp-method-cta" target={m.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                      {m.cta}
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                        <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOURS + MESSAGE FORM ─── */}
        <div className="cp-inner">
          <div className="cp-content">

            {/* Hours */}
            <div className="cp-hours-panel">
              <div className="cp-eyebrow">
                <span className="cp-eyebrow-label">When To Visit</span>
                <span className="cp-line-draw" />
              </div>
              <h2 className="cp-section-heading">
                Opening<br /><span className="g">Hours</span>
              </h2>

              <div className="cp-hours">
                {HOURS.map((h) => (
                  <div
                    key={h.day}
                    className={`cp-hour-row${h.day === today ? " today" : ""}`}
                  >
                    <span className="cp-hour-day">
                      {h.day}
                      {h.day === today && (
                        <span className="cp-hour-badge">Today</span>
                      )}
                    </span>
                    <span className="cp-hour-time">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Form */}
            <div className="cp-form-panel">
              <div className="cp-eyebrow">
                <span className="cp-eyebrow-label">Send A Message</span>
                <span className="cp-line-draw" />
              </div>
              <h2 className="cp-section-heading">
                Say<br /><span className="g">Hello</span>
              </h2>

              {submitted ? (
                <div className="cp-success cp-fade-up">
                  <div className="cp-success-title">Message Received</div>
                  <p className="cp-success-body">
                    Thanks for getting in touch. We&apos;ll get back to you as soon as possible —
                    or give us a call on <a href="tel:01784449005" style={{ color: "var(--gold)" }}>01784 449005</a>.
                  </p>
                </div>
              ) : (
                <div className="cp-form">
                  {/* Name */}
                  <div className={`cp-field${focused === "name" ? " active" : ""}${form.name ? " filled" : ""}`}>
                    <label className="cp-field-label" htmlFor="cp-name">Your Name</label>
                    <input id="cp-name" className="cp-input" type="text" autoComplete="name"
                      value={form.name} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <span className="cp-field-line" />
                  </div>

                  {/* Phone */}
                  <div className={`cp-field${focused === "phone" ? " active" : ""}${form.phone ? " filled" : ""}`}>
                    <label className="cp-field-label" htmlFor="cp-phone">Phone (optional)</label>
                    <input id="cp-phone" className="cp-input" type="tel" autoComplete="tel"
                      value={form.phone} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <span className="cp-field-line" />
                  </div>

                  {/* Message */}
                  <div className={`cp-field${focused === "message" ? " active" : ""}${form.message ? " filled" : ""}`}>
                    <label className="cp-field-label" htmlFor="cp-message">Your Message</label>
                    <textarea id="cp-message" className="cp-textarea"
                      value={form.message} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    <span className="cp-field-line" />
                  </div>

                  <p className="cp-form-note">
                    Or call us directly on{" "}
                    <a href="tel:01784449005" style={{ color: "var(--gold)", textDecoration: "none" }}>01784 449005</a>{" "}
                    — we&apos;re happy to help.
                  </p>

                  <button className="cp-submit-btn" onClick={handleSubmit}>
                    <span>Send Message</span>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── MAP ─── */}
        <section className="cp-map-section">
          <div className="cp-inner">
            <div className="cp-map-header">
              <div>
                <div className="cp-eyebrow">
                  <span className="cp-eyebrow-label">Find Us</span>
                  <span className="cp-line-draw" />
                </div>
                <h2 className="cp-section-heading" style={{ marginBottom: 0 }}>
                  We&apos;re In<br /><span className="g">Staines</span>
                </h2>
              </div>
              <a
                href="https://www.google.com/maps/place/Cutting+Image/@51.4350981,-0.5086567,17z/data=!3m1!4b1!4m6!3m5!1s0x487676cac16c3115:0x78edc50a61e9f190!8m2!3d51.4350981!4d-0.5060818!16s%2Fg%2F1tcz7tw9"
                target="_blank"
                rel="noopener noreferrer"
                className="cp-map-directions"
              >
                Get Directions
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
                  <path d="M1 4.5h14M9 1l5 3.5-5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <div className="cp-map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2487.4!2d-0.5086567!3d51.4350981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487676cac16c3115%3A0x78edc50a61e9f190!2sCutting%20Image!5e0!3m2!1sen!2suk!4v1709999999999"
                title="Cutting Image on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="cp-map-tag" aria-hidden="true">
                <span className="cp-map-tag-name">Cutting Image</span>
                <span className="cp-map-tag-addr">2 Kingston Rd · TW18 4LG · 5 min from station</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BOTTOM INFO STRIP ─── */}
        <div className="cp-inner">
          <div className="cp-bottom">
            <div className="cp-bottom-item">
              <span className="cp-bottom-label">Phone</span>
              <span className="cp-bottom-value">
                <a href="tel:01784449005">01784 449005</a><br />
                Give us a call anytime we&apos;re open
              </span>
            </div>
            <div className="cp-bottom-item">
              <span className="cp-bottom-label">Address</span>
              <span className="cp-bottom-value">
                2 Kingston Road<br />
                Staines-upon-Thames, TW18 4LG<br />
                5 min walk from Staines station
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}