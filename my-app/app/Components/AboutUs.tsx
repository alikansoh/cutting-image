"use client";
import Image from "next/image";
import { JSX, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Stat  { value: string; label: string; }
interface Pillar { num: string; title: string; body: string; }

declare global {
  interface Window {
    gsap: {
      registerPlugin: (...args: unknown[]) => void;
      fromTo: (t: Element | Element[] | NodeListOf<Element> | null, f: Record<string,unknown>, to: Record<string,unknown>) => void;
      to: (t: Element | null | Record<string,unknown>, v: Record<string,unknown>) => void;
      set: (t: Element | Element[] | NodeListOf<Element> | null, v: Record<string,unknown>) => void;
    };
    ScrollTrigger: { getAll: () => Array<{ kill: () => void }> };
  }
}

const STATS: Stat[] = [
  { value: "35+",  label: "Years of Excellence" },
  { value: "10K+", label: "Happy Clients"        },
  { value: "8",    label: "Master Barbers"        },
  { value: "4.9★", label: "Average Rating"        },
];

const PILLARS: Pillar[] = [
  { num: "01", title: "Craft",     body: "Every cut is a signature. Our master barbers blend old-world technique with modern precision — scissors, razors, and instinct honed over decades." },
  { num: "02", title: "Comfort",   body: "Step in, sit down, cold drink in hand. Leather-and-chrome chairs, flat-screen TVs, and a welcome that feels like home from the first hello." },
  { num: "03", title: "Character", body: "Founded in 1990 in the heart of Staines, we carry the soul of the traditional barbershop — the conversation, the ritual, the result." },
];

// ── Font preload helper — called once, injects a <link> for each font file
// rather than a full Google Fonts stylesheet so the browser never render-blocks
const FONT_WOFF2 = [
  // Bebas Neue Regular
  "https://fonts.gstatic.com/s/bebasneu/v21/co3bmX5slCNuHLi8bLeY9NK_Bhs.woff2",
  // Cormorant Garamond Italic 400
  "https://fonts.gstatic.com/s/cormorantgaramond/v17/co3YmX5slCNuHLi8bLeY9NK_Bhs5eJSa.woff2",
  // DM Sans 400-500
  "https://fonts.gstatic.com/s/dmsans/v16/rP2Hp2ywxg089UriCZa4ET-DNl0.woff2",
  // DM Sans 300
  "https://fonts.gstatic.com/s/dmsans/v16/co3ZmX5slCNuHLi8bLeY.woff2",
];

function injectFontPreloads() {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-ci-fonts]')) return;
  // 1. Preconnect to gstatic so TLS handshake is done before woff2 requests
  const pc = document.createElement("link");
  pc.rel = "preconnect";
  pc.href = "https://fonts.gstatic.com";
  pc.crossOrigin = "anonymous";
  document.head.prepend(pc);

  // 2. Inline @font-face declarations — no render-blocking network round-trip
  const style = document.createElement("style");
  style.dataset.ciFonts = "1";
  style.textContent = `
    @font-face{font-family:'Bebas Neue';font-style:normal;font-weight:400;font-display:swap;
      src:url(${FONT_WOFF2[0]}) format('woff2')}
    @font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:400;font-display:swap;
      src:url(${FONT_WOFF2[1]}) format('woff2')}
    @font-face{font-family:'DM Sans';font-style:normal;font-weight:400 500;font-display:swap;
      src:url(${FONT_WOFF2[2]}) format('woff2')}
    @font-face{font-family:'DM Sans';font-style:normal;font-weight:300;font-display:swap;
      src:url(${FONT_WOFF2[3]}) format('woff2')}
  `;
  document.head.appendChild(style);
}

export default function AboutSection(): JSX.Element {
  const sectionRef      = useRef<HTMLElement>(null);
  const hasAnimated     = useRef(false);
  const hasLoadedScripts = useRef(false);

  // Inject fonts synchronously on first render (avoids the Google Fonts stylesheet round-trip)
  useEffect(() => { injectFontPreloads(); }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          loadGSAP();
        }
      },
      { rootMargin: "300px", threshold: 0.01 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
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
      // FIX: load GSAP as a module so it doesn't block the main thread
      s.src   = src;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

  const loadGSAP = async (): Promise<void> => {
    if (hasLoadedScripts.current) return;
    hasLoadedScripts.current = true;
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
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

    // Skip ALL animations on mobile — too small to notice, big TBT win
    const isMobile = window.innerWidth < 768;

    gsap.fromTo(
      sec.querySelector<HTMLElement>(".ci-line-draw"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left center",
        scrollTrigger: { trigger: sec, start: "top 75%" } }
    );

    if (!isMobile) {
      // Heading char-by-char (heavy DOM work — skip on mobile)
      sec.querySelectorAll<HTMLElement>(".ci-heading-line").forEach((line) => {
        const text = line.textContent ?? "";
        line.innerHTML = text.split("").map((c) =>
          c.trim() === ""
            ? `<span style="display:inline-block;width:0.3em"> </span>`
            : `<span class="ci-char" style="display:inline-block">${c}</span>`
        ).join("");
      });

      const headingWrap = sec.querySelector<HTMLElement>(".ci-heading-wrap");
      if (headingWrap) {
        gsap.fromTo(
          headingWrap.querySelectorAll<HTMLElement>(".ci-char"),
          { yPercent: 115, rotationX: -45, opacity: 0 },
          { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.025, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: sec, start: "top 72%" } }
        );
        gsap.fromTo(
          headingWrap.querySelector<HTMLElement>(".ci-heading-gold-word"),
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.85, delay: 0.25, ease: "power3.out",
            scrollTrigger: { trigger: sec, start: "top 72%" } }
        );
      }
    }

    gsap.fromTo(
      sec.querySelectorAll<HTMLElement>(".ci-fade-up"),
      { y: 55, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.13, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: sec.querySelector<HTMLElement>(".ci-copy"), start: "top 72%" } }
    );

    // Image wipe
    ([ ".ci-img-main", ".ci-img-accent" ] as const).forEach((sel, i) => {
      const wrap  = sec.querySelector<HTMLElement>(sel);
      if (!wrap) return;
      const cover = wrap.querySelector<HTMLElement>(".ci-img-cover");
      const img   = wrap.querySelector<HTMLImageElement>("img");
      if (cover) gsap.fromTo(cover, { scaleX: 1 },
        { scaleX: 0, duration: 1.3, delay: i * 0.2, ease: "power4.inOut", transformOrigin: "right center",
          scrollTrigger: { trigger: wrap, start: "top 78%" } });
      if (img) gsap.fromTo(img, { scale: 1.2 },
        { scale: 1, duration: 1.8, delay: i * 0.2, ease: "power2.out",
          scrollTrigger: { trigger: wrap, start: "top 78%" } });
    });

    const badge   = sec.querySelector<HTMLElement>(".ci-badge");
    const imgMain = sec.querySelector<HTMLElement>(".ci-img-main");
    if (badge) gsap.fromTo(badge, { scale: 0, rotation: -15 },
      { scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.7)", delay: 0.6,
        scrollTrigger: { trigger: imgMain ?? sec, start: "top 78%" } });

    // Stats count-up
    sec.querySelectorAll<HTMLElement>(".ci-stat-num").forEach((el) => {
      const raw  = el.dataset.val ?? "";
      const item = el.closest<HTMLElement>(".ci-stat-item");
      if (item) gsap.fromTo(item, { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" } });

      if (raw.includes("★")) { el.textContent = raw; return; }
      const match = raw.match(/[\d.]+/);
      if (!match) { el.textContent = raw; return; }
      const num = parseFloat(match[0]);
      const suffix = raw.replace(/[\d.]+/, "").replace(/K/i, "k");
      if (!isNaN(num)) {
        const obj = { val: 0 };
        const isDecimal = match[0].includes(".");
        gsap.to(obj, { val: num, duration: 2.2, ease: "power2.out",
          onUpdate: () => {
            el.textContent = isDecimal
              ? (Math.round(obj.val * 10) / 10).toFixed(1).replace(/\.0$/, "") + suffix
              : Math.round(obj.val) + suffix;
          },
          scrollTrigger: { trigger: el, start: "top 88%" } });
      } else { el.textContent = raw; }
    });

    gsap.fromTo(
      sec.querySelectorAll<HTMLElement>(".ci-pillar"),
      { x: 70, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sec.querySelector<HTMLElement>(".ci-pillars") ?? sec, start: "top 80%" } }
    );

    const goldBar = sec.querySelector<HTMLElement>(".ci-gold-bar");
    if (goldBar) gsap.to(goldBar, { y: -80, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 } });
  };

  return (
    <>
      {/*
        PERF: All @font-face injected via JS (injectFontPreloads) — no render-blocking
        Google Fonts stylesheet. The CSS below uses the same family names so the
        browser picks up the preloaded faces immediately.

        FIX: ofShimmer used background-position which triggers non-composited paint.
        Replaced with a transform:translateX shimmer so it runs on the GPU compositor.

        FIX: Removed @import from inside <style> — that caused an extra network
        round-trip before the stylesheet could be parsed.
      */}
      <style>{`
        :root {
          --gold:         #C9A84C;
          --gold-light:   #F0D878;
          --gold-dim:     #6B4F16;
          --ink:          #080705;
          --ci-ink2:      #0F0E0C;
          --ci-warm:      #F0EAD6;
          --ci-muted:     #7A7060;
          --ci-body-text: #8A8070;
          --ci-border:    rgba(201,168,76,0.18);
        }

        .ci-about *, .ci-about *::before, .ci-about *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        .ci-about {
          background: var(--ink); color: var(--ci-warm);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .ci-about::after {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 50;
        }
        .ci-gold-bar {
          position: absolute; left: 52px; top: -10%;
          width: 1px; height: 120%;
          background: linear-gradient(to bottom, transparent 0%, var(--gold) 25%, var(--gold) 75%, transparent 100%);
          opacity: 0.3; pointer-events: none; z-index: 1;
        }
        .ci-inner {
          max-width: 1360px; margin: 0 auto; padding: 0 88px;
          position: relative; z-index: 2;
        }
        @media (max-width: 960px) { .ci-inner { padding: 0 28px; } .ci-gold-bar { display: none; } }

        /* ── Marquee ── */
        .ci-marquee {
          overflow: hidden; border-top: 1px solid var(--ci-border);
          border-bottom: 1px solid var(--ci-border);
          padding: 16px 0; background: var(--ci-ink2);
        }
        .ci-marquee-track {
          display: flex; white-space: nowrap;
          animation: ciMarquee 24s linear infinite;
          /* FIX: will-change tells browser to promote this to its own layer */
          will-change: transform;
        }
        .ci-marquee-track:hover { animation-play-state: paused; }
        @keyframes ciMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ci-marquee-item {
          display: inline-flex; align-items: center; gap: 18px; padding: 0 28px;
          font-family: 'Bebas Neue', sans-serif; font-size: 1rem;
          letter-spacing: 0.14em; color: var(--ci-muted); flex-shrink: 0;
        }
        .ci-marquee-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

        /* ── Stats ── */
        .ci-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid var(--ci-border);
        }
        @media (max-width: 700px) { .ci-stats { grid-template-columns: repeat(2, 1fr); } }
        .ci-stat-item { padding: 40px 28px; text-align: center; border-right: 1px solid var(--ci-border); }
        .ci-stat-item:last-child { border-right: none; }
        .ci-stat-num {
          display: block; font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.6rem, 4vw, 3.8rem); line-height: 1; margin-bottom: 6px;
          background: linear-gradient(120deg, var(--gold), var(--gold-light));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .ci-stat-label { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ci-muted); }

        /* ── Main split ── */
        .ci-split {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: center; padding: 120px 0;
        }
        @media (max-width: 960px) { .ci-split { grid-template-columns: 1fr; gap: 60px; padding: 80px 0; } }

        /* ── Eyebrow ── */
        .ci-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 30px; }
        .ci-eyebrow-label { font-size: 10.5px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold); }
        .ci-line-draw { width: 72px; height: 1px; background: var(--gold); transform: scaleX(0); transform-origin: left center; }

        .ci-heading-wrap { margin-bottom: 36px; }
        .ci-heading-line {
          display: block; overflow: hidden; font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92; letter-spacing: 0.025em; color: var(--ci-warm);
        }
        .ci-heading-gold-word {
          display: block; overflow: hidden; font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92; letter-spacing: 0.025em;
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 28%, var(--gold-light) 50%, var(--gold) 72%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .ci-body-text {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(1.1rem, 1.5vw, 1.3rem);
          font-weight: 400; line-height: 1.8; color: rgba(240,234,214,0.90);
          max-width: 500px; margin-bottom: 24px; font-style: italic;
          -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
        }
        .ci-cta {
          display: inline-flex; align-items: center; gap: 12px; font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); text-decoration: none; border-bottom: 1px solid rgba(201,168,76,0.4);
          padding-bottom: 5px; margin-top: 16px;
          transition: gap 0.35s ease, border-color 0.35s ease, color 0.35s ease;
        }
        .ci-cta:hover { gap: 22px; color: var(--gold-light); border-color: var(--gold-light); }
        .ci-cta svg { transition: transform 0.35s ease; }
        .ci-cta:hover svg { transform: translateX(5px); }

        /* ── Image stack ── */
        .ci-img-stack { position: relative; height: 580px; }
        @media (max-width: 960px) { .ci-img-stack { height: 360px; } }
        .ci-img-main  { position: absolute; inset: 0 0 70px 70px; overflow: hidden; }
        .ci-img-accent {
          position: absolute; bottom: 0; left: 0; width: 52%; height: 46%;
          overflow: hidden; border: 4px solid var(--ink); z-index: 2;
        }
        .ci-img-cover { position: absolute; inset: 0; background: var(--gold); z-index: 3; transform-origin: right center; }
        .ci-img-main .ci-img-el, .ci-img-accent .ci-img-el { object-fit: cover; display: block; z-index: 1; }
        .ci-img-label {
          position: absolute; bottom: 16px; left: 16px;
          background: rgba(8,7,5,0.88); border-left: 2px solid var(--gold);
          padding: 9px 14px; font-family: 'DM Sans', sans-serif; font-size: 10px;
          letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold);
          z-index: 4; backdrop-filter: blur(8px);
        }
        .ci-badge {
          position: absolute; top: -10px; right: -10px;
          width: 96px; height: 96px; background: var(--gold);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          z-index: 5; transform-origin: center;
        }
        .ci-badge-since { font-family: 'DM Sans', sans-serif; font-size: 8.5px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink); font-weight: 600; margin-bottom: 1px; }
        .ci-badge-year  { font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem; color: var(--ink); line-height: 1; }

        /* ── Pillars ── */
        .ci-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--ci-border); }
        @media (max-width: 760px) { .ci-pillars { grid-template-columns: 1fr; } }
        .ci-pillar {
          background: var(--ci-ink2); padding: 52px 40px;
          position: relative; overflow: hidden; transition: background 0.45s ease;
        }
        .ci-pillar::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--gold); transform: scaleX(0); transform-origin: left;
          transition: transform 0.55s ease;
        }
        .ci-pillar:hover { background: #1a1915; }
        .ci-pillar:hover::after { transform: scaleX(1); }
        .ci-pillar-bg-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 5rem;
          color: rgba(201,168,76,0.08); line-height: 1; position: absolute;
          top: 20px; right: 24px; transition: color 0.45s ease;
          pointer-events: none; user-select: none;
        }
        .ci-pillar:hover .ci-pillar-bg-num { color: rgba(201,168,76,0.16); }
        .ci-pillar-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 2.1rem;
          letter-spacing: 0.07em; color: var(--ci-warm); margin-bottom: 18px;
        }
        .ci-pillar-title::before {
          content: ''; display: block; width: 24px; height: 1px;
          background: var(--gold); margin-bottom: 16px;
        }
        .ci-pillar-body { font-family: 'Cormorant Garamond', serif; font-size: 1.08rem; line-height: 1.85; color: rgba(240,234,214,0.90); font-weight: 400; }

        .ci-bottom-rule { height: 1px; background: rgba(255,255,255,0.07); position: relative; z-index: 2; }
      `}</style>

      <section className="ci-about" ref={sectionRef} id="about">
        <div className="ci-gold-bar" aria-hidden="true" />

        {/* Marquee */}
        <div className="ci-marquee">
          <div className="ci-marquee-track">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="ci-marquee-item">
                Traditional Barbershop<span className="ci-marquee-dot" />
                Staines Since 1990<span className="ci-marquee-dot" />
                Master Barbers<span className="ci-marquee-dot" />
                Premium Grooming<span className="ci-marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="ci-inner">
          <div className="ci-stats">
            {STATS.map((s) => (
              <div key={s.label} className="ci-stat-item">
                <span className="ci-stat-num" data-val={s.value}>{s.value}</span>
                <span className="ci-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main split */}
        <div className="ci-inner">
          <div className="ci-split">
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
                relax, and let people who genuinely love their craft take care of the rest.
              </p>
              <p className="ci-body-text ci-fade-up">
                Leather-and-chrome chairs, complimentary drinks on arrival, and a team of
                master barbers who understand that a great cut is only the beginning of a
                great experience.
              </p>
              <a href="/booking" className="ci-cta ci-fade-up">
                Book Your Visit
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                  <path d="M1 6h18M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                  sizes="(max-width: 960px) 100vw, (max-width: 1360px) 45vw, 680px"
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
                  sizes="(max-width: 960px) 50vw, 310px"
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
              <span className="ci-pillar-bg-num" aria-hidden="true">{p.num}</span>
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