"use client";
import Image from "next/image";
import { JSX, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Stat {
  value: string;
  label: string;
}

interface Pillar {
  num: string;
  title: string;
  body: string;
}

// Minimal ambient types so we can call the CDN-loaded GSAP without installing
// @types/gsap — keeps the file dependency-free while still satisfying TS.
declare global {
  interface Window {
    gsap: {
      registerPlugin: (...args: unknown[]) => void;
      fromTo: (
        targets: Element | Element[] | NodeListOf<Element> | null,
        from: Record<string, unknown>,
        to: Record<string, unknown>
      ) => void;
      to: (
        targets: Element | null | Record<string, unknown>,
        vars: Record<string, unknown>
      ) => void;
    };
    ScrollTrigger: {
      getAll: () => Array<{ kill: () => void }>;
    };
  }
}

// ── Data ───────────────────────────────────────────────────────────────────────
const STATS: Stat[] = [
  { value: "35+", label: "Years of Excellence" },
  { value: "10K+", label: "Happy Clients" },
  { value: "8", label: "Master Barbers" },
  { value: "4.9★", label: "Average Rating" },
];

const PILLARS: Pillar[] = [
  {
    num: "01",
    title: "Craft",
    body: "Every cut is a signature. Our master barbers blend old-world technique with modern precision — scissors, razors, and instinct honed over decades.",
  },
  {
    num: "02",
    title: "Comfort",
    body: "Step in, sit down, cold drink in hand. Leather-and-chrome chairs, flat-screen TVs, and a welcome that feels like home from the first hello.",
  },
  {
    num: "03",
    title: "Character",
    body: "Founded in 1990 in the heart of Staines, we carry the soul of the traditional barbershop — the conversation, the ritual, the result.",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function AboutSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef<boolean>(false);

  useEffect(() => {
    const loadGSAP = async (): Promise<void> => {
      // Load GSAP core
      if (!document.querySelector('script[src*="gsap.min.js"]')) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src =
            "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      } else {
        await new Promise<void>((r) => setTimeout(r, 100));
      }

      // Load ScrollTrigger
      if (!document.querySelector('script[src*="ScrollTrigger.min.js"]')) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src =
            "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      } else {
        await new Promise<void>((r) => setTimeout(r, 100));
      }

      initAnimations();
    };

    const initAnimations = (): void => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      if (!gsap || !ScrollTrigger || hasAnimated.current) return;
      hasAnimated.current = true;
      gsap.registerPlugin(ScrollTrigger);

      const sec = sectionRef.current;
      if (!sec) return;

      // ── Line draw
      gsap.fromTo(
        sec.querySelector<HTMLElement>(".ci-line-draw"),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: "power3.out",
          transformOrigin: "left center",
          scrollTrigger: { trigger: sec, start: "top 75%" },
        }
      );

      // ── Heading char-by-char reveal
      // Only animate .ci-heading-line elements (plain text), never the gold word element
      sec.querySelectorAll<HTMLElement>(".ci-heading-line").forEach((line) => {
        const text = line.textContent ?? "";
        line.innerHTML = text
          .split("")
          .map((c) =>
            c.trim() === ""
              ? `<span style="display:inline-block;width:0.3em"> </span>`
              : `<span class="ci-char" style="display:inline-block">${c}</span>`
          )
          .join("");
      });

      const headingWrap = sec.querySelector<HTMLElement>(".ci-heading-wrap");
      if (headingWrap) {
        gsap.fromTo(
          headingWrap.querySelectorAll<HTMLElement>(".ci-char"),
          { yPercent: 115, rotationX: -45, opacity: 0 },
          {
            yPercent: 0,
            rotationX: 0,
            opacity: 1,
            stagger: 0.025,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: sec, start: "top 72%" },
          }
        );

        gsap.fromTo(
          headingWrap.querySelector<HTMLElement>(".ci-heading-gold-word"),
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.85,
            delay: 0.25,
            ease: "power3.out",
            scrollTrigger: { trigger: sec, start: "top 72%" },
          }
        );
      }

      // ── Fade-up copy elements
      gsap.fromTo(
        sec.querySelectorAll<HTMLElement>(".ci-fade-up"),
        { y: 55, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.13,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sec.querySelector<HTMLElement>(".ci-copy"),
            start: "top 72%",
          },
        }
      );

      // ── Image wipe reveal
      ([".ci-img-main", ".ci-img-accent"] as const).forEach((sel, i) => {
        const wrap = sec.querySelector<HTMLElement>(sel);
        if (!wrap) return;

        const cover = wrap.querySelector<HTMLElement>(".ci-img-cover");
        // Image from next/image renders an <img> internally — select it for animation
        const img = wrap.querySelector<HTMLImageElement>("img");

        if (cover) {
          gsap.fromTo(
            cover,
            { scaleX: 1 },
            {
              scaleX: 0,
              duration: 1.3,
              delay: i * 0.2,
              ease: "power4.inOut",
              transformOrigin: "right center",
              scrollTrigger: { trigger: wrap, start: "top 78%" },
            }
          );
        }

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.2 },
            {
              scale: 1,
              duration: 1.8,
              delay: i * 0.2,
              ease: "power2.out",
              scrollTrigger: { trigger: wrap, start: "top 78%" },
            }
          );
        }
      });

      // ── Year badge pop
      const badge = sec.querySelector<HTMLElement>(".ci-badge");
      const imgMain = sec.querySelector<HTMLElement>(".ci-img-main");
      if (badge) {
        gsap.fromTo(
          badge,
          { scale: 0, rotation: -15 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.7,
            ease: "back.out(1.7)",
            delay: 0.6,
            scrollTrigger: { trigger: imgMain ?? sec, start: "top 78%" },
          }
        );
      }

      // ── Stats count-up
      sec.querySelectorAll<HTMLElement>(".ci-stat-num").forEach((el) => {
        // data-val now holds the original display string (e.g. "10K+", "4.9★", "35+")
        const raw = el.dataset.val ?? "";
        const item = el.closest<HTMLElement>(".ci-stat-item");

        if (item) {
          gsap.fromTo(
            item,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%" },
            }
          );
        }

        // If the stat includes a star (Google rating), do NOT animate — leave it static
        if (raw.includes("★")) {
          el.textContent = raw;
          return;
        }

        // Extract numeric portion (e.g. "10" from "10K+") and the suffix ("K+")
        const match = raw.match(/[\d.]+/);
        if (!match) {
          el.textContent = raw;
          return;
        }
        const num = parseFloat(match[0]);
        let suffix = raw.replace(/[\d.]+/, "");
        // Normalise 'K' to lowercase 'k' (user requested "k" next to 10)
        suffix = suffix.replace(/K/i, "k");

        if (!isNaN(num)) {
          const obj: { val: number } = { val: 0 };
          const isDecimal = match[0].includes(".");

          gsap.to(obj, {
            val: num,
            duration: 2.2,
            ease: "power2.out",
            onUpdate: () => {
              if (isDecimal) {
                // preserve a single decimal place for decimals (if any)
                const displayed = (Math.round(obj.val * 10) / 10)
                  .toFixed(1)
                  .replace(/\.0$/, "");
                el.textContent = displayed + suffix;
              } else {
                el.textContent = Math.round(obj.val) + suffix;
              }
            },
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        } else {
          el.textContent = raw;
        }
      });

      // ── Pillar cards stagger slide
      const pillarsContainer = sec.querySelector<HTMLElement>(".ci-pillars");
      gsap.fromTo(
        sec.querySelectorAll<HTMLElement>(".ci-pillar"),
        { x: 70, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pillarsContainer ?? sec,
            start: "top 80%",
          },
        }
      );

      // ── Gold vertical bar parallax
      const goldBar = sec.querySelector<HTMLElement>(".ci-gold-bar");
      if (goldBar) {
        gsap.to(goldBar, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }
    };

    loadGSAP();

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((t) => t.kill());
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        /*
          Token system aligned 1-to-1 with Hero:
            --gold       #C9A84C  (hero: --gold)
            --gold-light #F0D878  (hero: --gold-light)
            --gold-dim   #6B4F16  (hero: --gold-dim)
            --ink        #080705  (hero: --ink)
          Additional tones derived from the same palette:
            --ci-gold-border  rgba(201,168,76,0.18)
            --ci-warm         #F0EAD6  (parchment — complements the gold)
            --ci-muted        #7A7060
            --ci-body-text    #8A8070
        */
        :root {
          --gold:            #C9A84C;
          --gold-light:      #F0D878;
          --gold-dim:        #6B4F16;
          --ink:             #080705;
          --ci-ink2:         #0F0E0C;
          --ci-warm:         #F0EAD6;
          --ci-muted:        #7A7060;
          --ci-body-text:    #8A8070;
          --ci-border:       rgba(201,168,76,0.18);
        }

        .ci-about *, .ci-about *::before, .ci-about *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .ci-about {
          background: var(--ink);
          color: var(--ci-warm);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Grain texture — same opacity as Hero */
        .ci-about::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.04;
          pointer-events: none;
          z-index: 50;
        }

        /* ── Gold vertical accent bar ── */
        .ci-gold-bar {
          position: absolute;
          left: 52px;
          top: -10%;
          width: 1px;
          height: 120%;
          background: linear-gradient(to bottom, transparent 0%, var(--gold) 25%, var(--gold) 75%, transparent 100%);
          opacity: 0.3;
          pointer-events: none;
          z-index: 1;
        }

        /* ── Container ── */
        .ci-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 88px;
          position: relative;
          z-index: 2;
        }
        @media (max-width: 960px) {
          .ci-inner { padding: 0 28px; }
          .ci-gold-bar { display: none; }
        }

        /* ── Marquee ── */
        .ci-marquee {
          overflow: hidden;
          border-top: 1px solid var(--ci-border);
          border-bottom: 1px solid var(--ci-border);
          padding: 16px 0;
          background: var(--ci-ink2);
        }
        .ci-marquee-track {
          display: flex;
          white-space: nowrap;
          animation: ciMarquee 24s linear infinite;
        }
        .ci-marquee-track:hover { animation-play-state: paused; }
        @keyframes ciMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ci-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 0 28px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.14em;
          color: var(--ci-muted);
          flex-shrink: 0;
        }
        .ci-marquee-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--gold);
          flex-shrink: 0;
        }

        /* ── Stats ── */
        .ci-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid var(--ci-border);
        }
        @media (max-width: 700px) { .ci-stats { grid-template-columns: repeat(2, 1fr); } }

        .ci-stat-item {
          padding: 40px 28px;
          text-align: center;
          border-right: 1px solid var(--ci-border);
        }
        .ci-stat-item:last-child { border-right: none; }

        /* Gold gradient on numbers — matches Hero .stat-num */
        .ci-stat-num {
          display: block;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.6rem, 4vw, 3.8rem);
          line-height: 1;
          margin-bottom: 6px;
          background: linear-gradient(120deg, var(--gold), var(--gold-light));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ci-stat-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ci-muted);
        }

        /* ── Main split ── */
        .ci-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: center;
          padding: 120px 0;
        }
        @media (max-width: 960px) {
          .ci-split {
            grid-template-columns: 1fr;
            gap: 60px;
            padding: 80px 0;
          }
        }

        /* ── Eyebrow — matches Hero tagline style ── */
        .ci-eyebrow {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 30px;
        }
        .ci-eyebrow-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold);
          font-family: 'DM Sans', sans-serif;
        }
        .ci-line-draw {
          width: 72px;
          height: 1px;
          background: var(--gold);
          transform: scaleX(0);
          transform-origin: left center;
        }

        /* ── Heading wrapper ── */
        .ci-heading-wrap {
          margin-bottom: 36px;
        }

        /* Each plain-text line — overflow:hidden clips the char rise animation */
        .ci-heading-line {
          display: block;
          overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem);
          line-height: 0.92;
          letter-spacing: 0.025em;
          color: var(--ci-warm);
        }

        /* Gold word — own overflow container, same gradient as Hero .gold-static */
        .ci-heading-gold-word {
          display: block;
          overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem);
          line-height: 0.92;
          letter-spacing: 0.025em;
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 28%, var(--gold-light) 50%, var(--gold) 72%, var(--gold-dim) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Updated body text: slightly bolder and darker for better contrast on dark bg */
        .ci-body-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.1rem, 1.5vw, 1.3rem);
          /* increase weight from 300 to 400 to appear thicker */
          font-weight: 400;
          line-height: 1.8;
          /* increase opacity so it reads better on the dark background */
          color: rgba(240, 234, 214, 0.90);
          max-width: 500px;
          margin-bottom: 24px;
          font-style: italic;
          /* subtle smoothing for crisper rendering on some displays */
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        /* ── CTA — aligned with Hero .btn-secondary feel ── */
        .ci-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          text-decoration: none;
          border-bottom: 1px solid rgba(201,168,76,0.4);
          padding-bottom: 5px;
          margin-top: 16px;
          transition: gap 0.35s ease, border-color 0.35s ease, color 0.35s ease;
        }
        .ci-cta:hover { gap: 22px; color: var(--gold-light); border-color: var(--gold-light); }
        .ci-cta svg { transition: transform 0.35s ease; }
        .ci-cta:hover svg { transform: translateX(5px); }

        /* ── Image stack ── */
        .ci-img-stack {
          position: relative;
          height: 580px;
        }
        @media (max-width: 960px) { .ci-img-stack { height: 360px; } }

        .ci-img-main {
          position: absolute;
          inset: 0 0 70px 70px;
          overflow: hidden;
        }
        .ci-img-accent {
          position: absolute;
          bottom: 0; left: 0;
          width: 52%;
          height: 46%;
          overflow: hidden;
          border: 4px solid var(--ink);
          z-index: 2;
        }

        .ci-img-cover {
          position: absolute;
          inset: 0;
          background: var(--gold);
          z-index: 3;
          transform-origin: right center;
        }

        /* Next.js Image element styling (used with fill) */
        .ci-img-main .ci-img-el,
        .ci-img-accent .ci-img-el {
          object-fit: cover;
          display: block;
          z-index: 1;
        }

        .ci-img-label {
          position: absolute;
          bottom: 16px; left: 16px;
          background: rgba(8,7,5,0.88);
          border-left: 2px solid var(--gold);
          padding: 9px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gold);
          z-index: 4;
          backdrop-filter: blur(8px);
        }

        /* ── Year badge — mirrors Hero rotating badge geometry ── */
        .ci-badge {
          position: absolute;
          top: -10px; right: -10px;
          width: 96px; height: 96px;
          background: var(--gold);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 5;
          transform-origin: center;
          /* same diamond motif as Hero badge centre */
          clip-path: none;
        }
        .ci-badge-since {
          font-family: 'DM Sans', sans-serif;
          font-size: 8.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink);
          font-weight: 600;
          margin-bottom: 1px;
        }
        .ci-badge-year {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.7rem;
          color: var(--ink);
          line-height: 1;
        }

        /* ── Pillars ── */
        .ci-pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--ci-border);
        }
        @media (max-width: 760px) { .ci-pillars { grid-template-columns: 1fr; } }

        .ci-pillar {
          background: var(--ci-ink2);
          padding: 52px 40px;
          position: relative;
          overflow: hidden;
          transition: background 0.45s ease;
        }
        .ci-pillar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--gold);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.55s ease;
        }
        .ci-pillar:hover { background: #1a1915; }
        .ci-pillar:hover::after { transform: scaleX(1); }

        .ci-pillar-bg-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 5rem;
          color: rgba(201,168,76,0.08);
          line-height: 1;
          position: absolute;
          top: 20px; right: 24px;
          transition: color 0.45s ease;
          pointer-events: none;
          user-select: none;
        }
        .ci-pillar:hover .ci-pillar-bg-num { color: rgba(201,168,76,0.16); }

        .ci-pillar-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.1rem;
          letter-spacing: 0.07em;
          color: var(--ci-warm);
          margin-bottom: 18px;
        }
        .ci-pillar-title::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--gold);
          margin-bottom: 16px;
        }

        /* Updated pillar body: match the increased weight and contrast of .ci-body-text */
        .ci-pillar-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.08rem;
          line-height: 1.85;
          color: rgba(240, 234, 214, 0.90); /* darker for legibility on dark bg */
          font-weight: 400; /* thicker than before */
        }

        /* ── Bottom divider — matches Hero border-t style ── */
        .ci-bottom-rule {
          height: 1px;
          background: rgba(255,255,255,0.07);
          position: relative;
          z-index: 2;
        }
      `}</style>

      <section className="ci-about" ref={sectionRef} id="about">
        <div className="ci-gold-bar" aria-hidden="true" />

        {/* Marquee */}
        <div className="ci-marquee">
          <div className="ci-marquee-track">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="ci-marquee-item">
                Traditional Barbershop
                <span className="ci-marquee-dot" />
                Staines Since 1990
                <span className="ci-marquee-dot" />
                Master Barbers
                <span className="ci-marquee-dot" />
                Premium Grooming
                <span className="ci-marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="ci-inner">
          <div className="ci-stats">
            {STATS.map((s) => (
              <div key={s.label} className="ci-stat-item">
                <span
                  className="ci-stat-num"
                  // keep the original string so we can parse numeric part + suffix correctly
                  data-val={s.value}
                >
                  {s.value}
                </span>
                <span className="ci-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main split */}
        <div className="ci-inner">
          <div className="ci-split">
            {/* Copy */}
            <div className="ci-copy">
              <div className="ci-eyebrow">
                <span className="ci-eyebrow-label">Our Story</span>
                <span className="ci-line-draw" />
              </div>

              <div className="ci-heading-wrap">
                <span className="ci-heading-line">Where Every</span>
                <span className="ci-heading-gold-word">Gentleman</span>
                <span className="ci-heading-line">Belongs</span>
              </div>

              <p className="ci-body-text ci-fade-up">
                One of Staines&apos; finest traditional barbershops since 1990.
                When you walk through our doors, it&apos;s about you — sit back,
                relax, and let people who genuinely love their craft take care
                of the rest.
              </p>
              <p className="ci-body-text ci-fade-up">
                Leather-and-chrome chairs, complimentary drinks on arrival, and
                a team of master barbers who understand that a great cut is only
                the beginning of a great experience.
              </p>

              <a href="/booking" className="ci-cta ci-fade-up">
                Book Your Visit
                <svg
                  width="20"
                  height="12"
                  viewBox="0 0 20 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 6h18M13 1l6 5-6 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            {/* Image stack */}
            <div className="ci-img-stack">
              <div className="ci-img-main">
                <div className="ci-img-cover" />
                <Image
                  src="/about2.jpg"
                  alt="Barber giving a precision haircut"
                  fill
                  className="ci-img-el"
                  style={{ objectFit: "cover" }}
                  priority
                />
                <div className="ci-badge">
                  <span className="ci-badge-since">Since</span>
                  <span className="ci-badge-year">1990</span>
                </div>
              </div>

              <div className="ci-img-accent">
                <div className="ci-img-cover" />
                <Image
                  src="/about1.jpg"
                  alt="Classic barbershop interior"
                  fill
                  className="ci-img-el"
                  style={{ objectFit: "cover" }}
                />
                <div className="ci-img-label">Kingston Rd · Staines</div>
              </div>
            </div>
          </div>
        </div>

        {/* Three pillars */}
        <div className="ci-pillars">
          {PILLARS.map((p) => (
            <div key={p.num} className="ci-pillar">
              <span className="ci-pillar-bg-num" aria-hidden="true">
                {p.num}
              </span>
              <h3 className="ci-pillar-title">{p.title}</h3>
              <p className="ci-pillar-body">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="ci-bottom-rule" />
      </section>
    </>
  );
}
