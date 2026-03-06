"use client";
import Image from "next/image";
import { JSX, useEffect, useRef } from "react";

/*
  Add to app/layout.tsx <head>:

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
    media="print" onLoad="this.media='all'"
  />
*/

declare global {
  interface Window {
    gsap: {
      set(arg0: unknown, arg1: { scaleX: number }): unknown;
      registerPlugin: (...args: unknown[]) => void;
      fromTo: (
        targets: Element | Element[] | NodeListOf<Element> | null,
        from: Record<string, unknown>,
        to: Record<string, unknown>
      ) => void;
      to: (
        targets: Element | Element[] | null | Record<string, unknown>,
        vars: Record<string, unknown>
      ) => void;
    };
    ScrollTrigger: {
      getAll: () => Array<{ kill: () => void }>;
    };
  }
}

// ── Data ──────────────────────────────────────────────────────────────────────

const BARBERS = [
  {
    name: "Marcus Reid",
    role: "Founder & Master Barber",
    since: "1990",
    specialty: "Classic cuts, hot shaves",
    img: "/barber-1.jpg", // Replace with actual image paths
  },
  {
    name: "Daniel Osei",
    role: "Senior Barber",
    since: "2005",
    specialty: "Skin fades, line-ups",
    img: "/barber-2.jpg",
  },
  {
    name: "Jamie Torres",
    role: "Senior Barber",
    since: "2011",
    specialty: "Scissor cuts, beard sculpting",
    img: "/barber-3.jpg",
  },
  {
    name: "Kwame Asante",
    role: "Barber",
    since: "2016",
    specialty: "Tapered fades, afro cuts",
    img: "/barber-4.jpg",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function AboutPage(): JSX.Element {
  const pageRef          = useRef<HTMLDivElement>(null);
  const hasAnimated      = useRef<boolean>(false);
  const hasLoadedScripts = useRef<boolean>(false);

  useEffect(() => {
    loadGSAP();
    return () => {
      window.ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src: string): Promise<void> =>
    new Promise<void>((resolve) => {
      const filename = src.split("/").pop()!;
      if (document.querySelector(`script[src*="${filename}"]`)) {
        setTimeout(resolve, 50);
        return;
      }
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
    page.querySelectorAll<HTMLElement>(".ap-hero-line").forEach((line) => {
      const text = line.textContent ?? "";
      line.innerHTML = text.split("").map((c) =>
        c.trim() === ""
          ? `<span style="display:inline-block;width:0.28em"> </span>`
          : `<span class="ap-char" style="display:inline-block">${c}</span>`
      ).join("");
    });

    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".ap-char"),
      { yPercent: 115, rotationX: -45, opacity: 0 },
      { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.018, duration: 0.9, ease: "power3.out", delay: 0.3 }
    );

    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".ap-hero-sub"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 1 }
    );

    gsap.fromTo(
      page.querySelector<HTMLElement>(".ap-hero-line-draw"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.6, ease: "power3.out", delay: 1.1, transformOrigin: "left center" }
    );

    // Line draws on scroll
    page.querySelectorAll<HTMLElement>(".ap-line-draw").forEach((el) => {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left center",
        scrollTrigger: { trigger: el, start: "top 80%" },
      });
    });

    // Fade ups
    page.querySelectorAll<HTMLElement>(".ap-fade-up").forEach((el) => {
      gsap.fromTo(el, { y: 48, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 84%" },
      });
    });

    // Image wipe
    page.querySelectorAll<HTMLElement>(".ap-img-wrap").forEach((wrap) => {
      const cover = wrap.querySelector<HTMLElement>(".ap-img-cover");
      const img   = wrap.querySelector<HTMLImageElement>("img");
      if (cover) {
        gsap.fromTo(cover, { scaleX: 1 }, {
          scaleX: 0, duration: 1.3, ease: "power4.inOut",
          transformOrigin: "right center",
          scrollTrigger: { trigger: wrap, start: "top 80%" },
        });
      }
      if (img) {
        gsap.fromTo(img, { scale: 1.12 }, {
          scale: 1, duration: 1.8, ease: "power2.out",
          scrollTrigger: { trigger: wrap, start: "top 80%" },
        });
      }
    });

    // Barber cards stagger
    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".ap-barber-card"),
      { y: 70, opacity: 0 },
      {
        y: 0, opacity: 1, stagger: 0.14, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: page.querySelector(".ap-barbers-grid"), start: "top 78%" },
      }
    );

    // CTA reveal
    gsap.fromTo(
      page.querySelector<HTMLElement>(".ap-cta-inner"),
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: page.querySelector(".ap-cta"), start: "top 80%" },
      }
    );
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
          --warm:       #F0EAD6;
          --muted:      #7A7060;
          --body-text:  rgba(240,234,214,0.82);
          --border:     rgba(201,168,76,0.15);
        }

        .ap-page *, .ap-page *::before, .ap-page *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .ap-page {
          background: var(--ink);
          color: var(--warm);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }

        /* Noise texture */
        .ap-page::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.03; pointer-events: none; z-index: 100;
        }

        .ap-inner {
          max-width: 1320px; margin: 0 auto; padding: 0 80px; position: relative; z-index: 2;
        }
        @media (max-width: 900px) { .ap-inner { padding: 0 24px; } }

        /* ─── HERO ─── */
        .ap-hero {
          min-height: 94vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-bottom: 88px; position: relative;
          border-bottom: 1px solid var(--border);
        }

        .ap-hero-bg { position: absolute; inset: 0; z-index: 0; }
        .ap-hero-bg img { object-fit: cover; }
        .ap-hero-bg::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to top, var(--ink) 28%, rgba(8,7,5,0.5) 62%, rgba(8,7,5,0.25) 100%);
        }

        .ap-hero-eyebrow {
          display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
        }
        .ap-hero-eyebrow-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--gold);
        }
        .ap-hero-line-draw {
          width: 72px; height: 1px; background: var(--gold);
          transform: scaleX(0); transform-origin: left center;
        }

        .ap-hero-heading { margin-bottom: 36px; }
        .ap-hero-line {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 13vw, 13rem);
          line-height: 0.87; letter-spacing: 0.02em;
          color: var(--warm);
        }
        .ap-hero-line.gold {
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 28%, var(--gold-light) 50%, var(--gold) 72%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ap-hero-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(1.1rem, 1.5vw, 1.35rem); line-height: 1.75;
          color: var(--body-text); max-width: 520px;
        }



        /* ─── ABOUT SPLIT ─── */
        .ap-about {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: center;
          padding: 140px 0;
        }
        @media (max-width: 880px) {
          .ap-about { grid-template-columns: 1fr; gap: 56px; padding: 80px 0; }
        }

        .ap-eyebrow {
          display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
        }
        .ap-eyebrow-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--gold);
        }
        .ap-line-draw {
          height: 1px; width: 56px; background: var(--gold);
          transform: scaleX(0); transform-origin: left center;
        }

        .ap-section-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 6.5vw, 6rem);
          line-height: 0.91; letter-spacing: 0.03em;
          color: var(--warm); margin-bottom: 32px;
        }
        .ap-section-heading .g {
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 30%, var(--gold-light) 55%, var(--gold) 75%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ap-body {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(1.05rem, 1.3vw, 1.2rem); line-height: 1.9;
          color: var(--body-text); margin-bottom: 20px;
        }

        .ap-text-link {
          display: inline-flex; align-items: center; gap: 10px; margin-top: 16px;
          font-size: 10.5px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold); text-decoration: none;
          border-bottom: 1px solid rgba(201,168,76,0.35); padding-bottom: 5px;
          transition: gap 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .ap-text-link:hover { gap: 18px; color: var(--gold-light); border-color: var(--gold-light); }
        .ap-text-link svg { transition: transform 0.3s ease; }
        .ap-text-link:hover svg { transform: translateX(4px); }

        /* Image */
        .ap-img-wrap { position: relative; overflow: hidden; }
        .ap-img-cover {
          position: absolute; inset: 0; background: var(--gold);
          z-index: 3; transform-origin: right center;
        }
        .ap-img-wrap img { object-fit: cover; display: block; z-index: 1; }
        .ap-img-label {
          position: absolute; bottom: 16px; left: 16px; z-index: 4;
          background: rgba(8,7,5,0.85); border-left: 2px solid var(--gold);
          padding: 9px 14px; font-size: 9.5px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--gold); backdrop-filter: blur(8px);
        }

        .ap-salon-img {
          height: 580px; position: relative;
        }

        /* ─── STATS STRIP ─── */
        .ap-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--ink2);
        }
        @media (max-width: 640px) { .ap-stats { grid-template-columns: 1fr; } }

        .ap-stat {
          padding: 52px 44px;
          border-right: 1px solid var(--border);
          position: relative; overflow: hidden;
        }
        .ap-stat:last-child { border-right: none; }
        .ap-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 7vw, 6rem);
          line-height: 1;
          background: linear-gradient(120deg, var(--gold-dim), var(--gold) 50%, var(--gold-light));
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block; margin-bottom: 8px;
        }
        .ap-stat-label {
          font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--muted); font-weight: 500;
        }

        /* ─── BARBERS ─── */
        .ap-barbers-section { padding: 140px 0; }

        .ap-barbers-header { margin-bottom: 72px; }

        .ap-barbers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        @media (max-width: 1000px) { .ap-barbers-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px)  { .ap-barbers-grid { grid-template-columns: 1fr; } }

        .ap-barber-card {
          position: relative; overflow: hidden;
          background: var(--ink2);
          cursor: default;
        }

        .ap-barber-photo {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
        }
        .ap-barber-photo img { object-fit: cover; object-position: top center; display: block; }
        .ap-barber-photo::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(8,7,5,0.92) 0%, rgba(8,7,5,0.2) 55%, transparent 100%);
          z-index: 2;
        }

        /* Placeholder for when no real image is provided */
        .ap-barber-placeholder {
          width: 100%; aspect-ratio: 3/4;
          background: linear-gradient(160deg, #1a1812 0%, #111008 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .ap-barber-placeholder::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(8,7,5,0.95) 0%, transparent 60%);
        }
        .ap-barber-placeholder svg {
          width: 80px; height: 80px; opacity: 0.12;
          color: var(--gold); position: relative; z-index: 1;
        }

        .ap-barber-info {
          padding: 24px 28px 32px;
          position: relative;
          border-top: 1px solid var(--border);
        }

        .ap-barber-since {
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 10px; display: block;
        }

        .ap-barber-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.7rem; letter-spacing: 0.05em;
          color: var(--warm); line-height: 1.05; margin-bottom: 6px;
        }

        .ap-barber-role {
          font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 14px;
        }

        .ap-barber-specialty {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 0.95rem; color: var(--body-text);
        }
        .ap-barber-specialty::before {
          content: ''; display: inline-block;
          width: 16px; height: 1px; background: var(--gold); flex-shrink: 0;
        }

        /* Bottom gold accent on card hover */
        .ap-barber-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: var(--gold);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.5s ease;
        }
        .ap-barber-card:hover::after { transform: scaleX(1); }

        /* ─── CTA ─── */
        .ap-cta {
          padding: 160px 0;
          border-top: 1px solid var(--border);
          text-align: center; position: relative; overflow: hidden;
        }
        .ap-cta::before {
          content: 'CUTTING IMAGE';
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 16vw, 16rem);
          letter-spacing: 0.04em; white-space: nowrap;
          color: rgba(201,168,76,0.035);
          pointer-events: none; user-select: none; z-index: 0;
        }

        .ap-cta-inner { position: relative; z-index: 1; }

        .ap-cta-eyebrow {
          display: inline-flex; align-items: center; gap: 14px;
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 24px;
        }
        .ap-cta-eyebrow::before, .ap-cta-eyebrow::after {
          content: ''; display: block; width: 36px; height: 1px; background: var(--gold);
        }

        .ap-cta-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 9vw, 9rem); line-height: 0.88;
          letter-spacing: 0.03em; color: var(--warm); margin-bottom: 20px;
        }

        .ap-cta-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(1.05rem, 1.4vw, 1.25rem); color: var(--body-text);
          max-width: 440px; margin: 0 auto 48px; line-height: 1.8;
        }

        .ap-cta-buttons { display: flex; align-items: center; justify-content: center; gap: 28px; flex-wrap: wrap; }

        .ap-btn-primary {
          display: inline-flex; align-items: center; gap: 12px;
          background: var(--gold); color: var(--ink);
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.24em;
          text-transform: uppercase; text-decoration: none;
          padding: 18px 44px;
          transition: background 0.3s ease, gap 0.3s ease;
        }
        .ap-btn-primary:hover { background: var(--gold-light); gap: 20px; }
        .ap-btn-primary svg { transition: transform 0.3s ease; }
        .ap-btn-primary:hover svg { transform: translateX(4px); }

        .ap-btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10.5px; font-weight: 500; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--muted); text-decoration: none;
          border-bottom: 1px solid rgba(122,112,96,0.35); padding-bottom: 4px;
          transition: color 0.3s ease;
        }
        .ap-btn-ghost:hover { color: var(--gold); }

        /* ─── INFO BAR ─── */
        .ap-info-bar {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--border);
        }
        @media (max-width: 640px) { .ap-info-bar { grid-template-columns: 1fr; } }

        .ap-info-item {
          padding: 48px 40px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 10px;
        }
        .ap-info-item:last-child { border-right: none; }

        .ap-info-label {
          font-size: 9.5px; letter-spacing: 0.24em; text-transform: uppercase;
          color: var(--gold); font-weight: 500;
        }
        .ap-info-value {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.05rem; line-height: 1.65; color: var(--body-text);
        }
        .ap-info-value a { color: var(--gold); text-decoration: none; }
        .ap-info-value a:hover { color: var(--gold-light); }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>

      <div className="ap-page" ref={pageRef}>

        {/* ─── HERO ─── */}
        <section className="ap-hero">
          <div className="ap-hero-bg">
            <Image
              src="/about2.jpg"
              alt="Cutting Image barbershop interior"
              fill
              priority
              style={{ objectFit: "cover" }}
              sizes="100vw"
            />
          </div>

          <div className="ap-inner">
            <div className="ap-hero-eyebrow">
              <span className="ap-hero-eyebrow-label">Cutting Image · Staines Since 1990</span>
              <span className="ap-hero-line-draw" />
            </div>

            <div className="ap-hero-heading">
              <span className="ap-hero-line">About</span>
              <span className="ap-hero-line gold">The Shop</span>
            </div>

            <p className="ap-hero-sub">
              One of the finest traditional gentlemen&apos;s barbers in Staines.
              When you walk into Cutting Image — it&apos;s all about you.
            </p>
          </div>


        </section>

        {/* ─── WHO WE ARE ─── */}
        <div className="ap-inner">
          <div className="ap-about">
            {/* Copy */}
            <div>
              <div className="ap-eyebrow">
                <span className="ap-eyebrow-label">Who We Are</span>
                <span className="ap-line-draw" />
              </div>

              <h2 className="ap-section-heading">
                It&apos;s Always<br />
                <span className="g">About You</span>
              </h2>

              <p className="ap-body ap-fade-up">
                One of the finest traditional gentlemen&apos;s barbers in Staines. Founded in 1990
                on Kingston Road, Cutting Image was built on the principals of the professional
                traditional barbershop — a vision to give every gentleman a place to call his own.
              </p>

              <p className="ap-body ap-fade-up">
                Our team of highly skilled and extremely experienced barbers take genuine pride
                in their craft. We understand exactly what our clients desire and work to accomplish
                it — leaving every man looking great and feeling very satisfied.
              </p>

              <p className="ap-body ap-fade-up">
                A complimentary drink awaits on arrival. Cold drinks, flat-screen TVs,
                leather-and-chrome chairs. We give you the chance to escape everyday life —
                the traditions of yesterday, the comforts of today.
              </p>

              <p className="ap-body ap-fade-up">
                No appointment needed — walk-ins are always welcome.
                Come as you are, any time we&apos;re open.
              </p>
            </div>

            {/* Salon image */}
            <div className="ap-img-wrap ap-salon-img">
              <div className="ap-img-cover" />
              <Image
                src="/about.webp"
                alt="Inside Cutting Image barber shop, Staines"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 880px) 100vw, 50vw"
              />
              <div className="ap-img-label">2 Kingston Road · Staines TW18 4LG</div>
            </div>
          </div>
        </div>

        {/* ─── STATS STRIP ─── */}
        <div className="ap-stats">
          <div className="ap-stat ap-fade-up">
            <span className="ap-stat-num">35+</span>
            <span className="ap-stat-label">Years in Business</span>
          </div>
          <div className="ap-stat ap-fade-up">
            <span className="ap-stat-num">8</span>
            <span className="ap-stat-label">Master Barbers</span>
          </div>
          <div className="ap-stat ap-fade-up">
            <span className="ap-stat-num">10000</span>
            <span className="ap-stat-label">Of Happy Clients</span>
          </div>
        </div>

        {/* ─── MEET THE BARBERS ─── */}
        <section className="ap-barbers-section">
          <div className="ap-inner">
            <div className="ap-barbers-header">
              <div className="ap-eyebrow">
                <span className="ap-eyebrow-label">The Team</span>
                <span className="ap-line-draw" />
              </div>
              <h2 className="ap-section-heading">
                Meet Your<br />
                <span className="g">Barbers</span>
              </h2>
            </div>

            <div className="ap-barbers-grid">
              {BARBERS.map((barber) => (
                <div key={barber.name} className="ap-barber-card">
                  {/* Swap ap-barber-placeholder for ap-barber-photo + Image once you have photos */}
                  <div className="ap-barber-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="ap-barber-info">
                    <span className="ap-barber-since">With us since {barber.since}</span>
                    <div className="ap-barber-name">{barber.name}</div>
                    <div className="ap-barber-role">{barber.role}</div>
                    <div className="ap-barber-specialty">{barber.specialty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="ap-cta">
          <div className="ap-inner">
            <div className="ap-cta-inner">
              <div className="ap-cta-eyebrow">Book Today</div>
              <h2 className="ap-cta-heading">
                Walk In,<br />Look Sharp
              </h2>
              <p className="ap-cta-sub">
                No appointment needed. Walk in any time —
                five minutes from Staines station.
              </p>
              <div className="ap-cta-buttons">
                <a href="https://wa.me/447714291508" className="ap-btn-primary">
                  WhatsApp Us
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── INFO BAR ─── */}
        <div className="ap-inner">
          <div className="ap-info-bar">
            <div className="ap-info-item">
              <span className="ap-info-label">Address</span>
              <span className="ap-info-value">
                2 Kingston Road<br />
                Staines-upon-Thames, TW18 4LG
              </span>
            </div>
            <div className="ap-info-item">
              <span className="ap-info-label">Opening Hours</span>
              <span className="ap-info-value">
                Mon – Fri: 9:00 AM – 7:00 PM<br />
                Sat: 9:00 AM – 6:00 PM<br />
                Sun: 10:00 AM – 5:00 PM
              </span>
            </div>
            <div className="ap-info-item">
              <span className="ap-info-label">Contact</span>
              <span className="ap-info-value">
                <a href="https://wa.me/447714291508">WhatsApp: +44 7714 291508</a><br />
                5 min walk from Staines station
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}