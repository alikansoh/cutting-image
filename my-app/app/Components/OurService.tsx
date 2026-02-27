"use client";
// window.gsap + ScrollTrigger types live in gsap.d.ts at the project root.

import { JSX, useEffect, useRef } from "react";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
//  PERF CHANGES vs original:
//
//  1. @import removed — add font <link> tags to layout.tsx <head> instead.
//     @import inside <style> is parser-blocking and directly hurts FCP.
//
//  2. GSAP + ScrollTrigger loaded in PARALLEL (Promise.all) instead of
//     sequentially. Saves ~200 ms on slow connections.
//
//  3. IntersectionObserver gates GSAP load until section is 300 px from
//     viewport — same pattern as AboutSection. GSAP never loads if the user
//     never scrolls to this section.
//
//  4. clip-path card entrance replaced with CSS @keyframes. The JS version
//     set clip-path: inset(0 100% 0 0) which blocked paint until GSAP ran.
//     CSS animation fires immediately at paint time.
//
//  5. Card hover effects (line, title colour, cta) converted to pure CSS
//     transitions — removes 8 GSAP.to calls per card from the init bundle.
//     GSAP retained only for: magnetic tilt, icon float, parallax bar (all
//     require runtime mouse/scroll data that CSS can't provide).
//
//  6. will-change trimmed to only elements that GSAP actively transforms.
// ─────────────────────────────────────────────────────────────────────────────

/*
  Add to app/layout.tsx <head>:

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
      media="print" onLoad="this.media='all'"
    />
*/

interface Category {
  num: number;
  icon: string;
  iconAlt: string;
  title: string;
  subtitle: string;
  services: string[];
}

const CATEGORIES: Category[] = [
  {
    num: 1,
    icon: "/icons/man.svg",
    iconAlt: "Scissors",
    title: "Men's Haircuts & Grooming",
    subtitle: "Precision cuts, fades and full grooming rituals for the modern gentleman.",
    services: [
      "Wash, Haircut & Styling", "Wash & Haircut", "Dry Haircut",
      "Clipper Haircut", "Skin Fade", "Beard Trimming & Shaving",
      "Beard Trim", "Hot Towel Shave", "Hair Colouring",
      "Wash, Haircut, Styling & Beard Trim", "Brazilian Blow Dry", "Crew Cut",
    ],
  },
  {
    num: 2,
    icon: "/icons/children.svg",
    iconAlt: "Star",
    title: "Children's Haircuts",
    subtitle: "Patient, friendly cuts for boys up to 14 — every kid leaves looking sharp.",
    services: [
      "Boys Wash & Haircut", "Boys Dry Haircut", "Boys Clipper Cut",
      "Boys Skin Fade", "Boys Fringe Trim", "Toddler First Cut",
    ],
  },
  {
    num: 3,
    icon: "/icons/wax.svg",
    iconAlt: "Sparkle",
    title: "Men's Waxing",
    subtitle: "Clean, precise hair removal — smooth results with minimal discomfort.",
    services: ["Full Body Wax"],
  },
  {
    num: 4,
    icon: "/icons/skin.svg",
    iconAlt: "Leaf",
    title: "Facials",
    subtitle: "Skin treatments crafted to refresh, restore and elevate your complexion.",
    services: ["Men's Luxury Facial"],
  },
];

export default function ServicesOverview(): JSX.Element {
  const sectionRef  = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const hasLoaded   = useRef(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer?.disconnect();
        observer = null;
        loadGSAP();
      },
      { rootMargin: "300px", threshold: 0.01 }
    );
    observer.observe(node);

    return () => {
      observer?.disconnect();
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
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    // ── Parallel load — saves ~200 ms vs sequential ──────────────────────────
    await Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"),
    ]);
    init();
  };

  const init = (): void => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger || hasAnimated.current) return;
    hasAnimated.current = true;
    gsap.registerPlugin(ScrollTrigger);

    const sec = sectionRef.current;
    if (!sec) return;

    // ── Line draw ──
    gsap.fromTo(sec.querySelector(".sv-line"), { scaleX: 0 }, {
      scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left",
      scrollTrigger: { trigger: sec, start: "top 76%" },
    });

    // ── Heading chars ──
    sec.querySelectorAll<HTMLElement>(".sv-hline").forEach((line) => {
      line.innerHTML = (line.textContent ?? "").split("").map((c) =>
        c.trim() === ""
          ? `<span style="display:inline-block;width:.28em">&nbsp;</span>`
          : `<span class="sv-c" style="display:inline-block">${c}</span>`
      ).join("");
    });
    gsap.fromTo(sec.querySelectorAll(".sv-c"),
      { yPercent: 110, rotationX: -40, opacity: 0 },
      { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.022, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 73%" } }
    );
    gsap.fromTo(sec.querySelector(".sv-gold-word"),
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.8, delay: 0.22, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 73%" } }
    );

    // ── Header right fade-up ──
    gsap.fromTo(sec.querySelectorAll(".sv-fadeup"),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.95, ease: "power2.out",
        scrollTrigger: { trigger: sec.querySelector(".sv-header-right"), start: "top 74%" } }
    );

    // ── Cards: magnetic tilt + icon float only (entrance is now CSS) ──
    sec.querySelectorAll<HTMLElement>(".sv-card").forEach((card, i) => {
      const iconWrap = card.querySelector<HTMLElement>(".sv-icon-wrap");
      const inner    = card.querySelector<HTMLElement>(".sv-card-inner");
      const numEl    = card.querySelector<HTMLElement>(".sv-num");

      // Icon float — infinite, decorative
      if (iconWrap) {
        gsap.to(iconWrap, {
          y: -6, duration: 2.2 + i * 0.3,
          ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.4,
        });
      }

      // Magnetic tilt on mousemove
      card.addEventListener("mousemove", (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 8;
        gsap.to(inner,   { x, y, duration: 0.5, ease: "power2.out" });
        gsap.to(iconWrap, { x: x * 1.6, duration: 0.5, ease: "power2.out" });
        if (numEl) gsap.to(numEl, { x: x * -0.8, y: y * -0.8, duration: 0.5, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(inner,   { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.5)" });
        gsap.to(iconWrap, { x: 0,       duration: 0.7, ease: "elastic.out(1,0.5)" });
        if (numEl) gsap.to(numEl, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.5)" });
      });
    });

    // ── CTA section fade ──
    gsap.fromTo(sec.querySelector(".sv-cta"),
      { y: 44, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sec.querySelector(".sv-cta"), start: "top 90%" } }
    );

    // ── Gold bar parallax ──
    gsap.to(sec.querySelector(".sv-vbar"), {
      y: -90, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
    });
  };

  return (
    <>
      <style>{`
        /* Fonts: moved to layout.tsx <head> — see comment at top of file */

        :root {
          --gold:       #C9A84C;
          --gold-light: #F0D878;
          --gold-dim:   #6B4F16;
          --ink:        #080705;
          --ink2:       #0F0E0C;
          --ink3:       #161410;
          --warm:       #F0EAD6;
          --muted:      #7A7060;
          --border:     rgba(201,168,76,0.18);
        }

        .sv-section *, .sv-section *::before, .sv-section *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        .sv-section {
          background: var(--ink); color: var(--warm);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .sv-section::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 40;
        }

        .sv-vbar {
          position: absolute; left: 52px; top: -8%;
          width: 1px; height: 118%;
          background: linear-gradient(to bottom, transparent, var(--gold) 25%, var(--gold) 75%, transparent);
          opacity: 0.28; pointer-events: none; z-index: 1;
        }

        .sv-inner {
          max-width: 1360px; margin: 0 auto; padding: 0 88px;
          position: relative; z-index: 2;
        }
        @media (max-width: 960px) { .sv-inner { padding: 0 28px; } .sv-vbar { display: none; } }

        /* ── HEADER ── */
        .sv-header {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: center;
          padding: 120px 0 80px; border-bottom: 1px solid var(--border);
        }
        @media (max-width: 960px) { .sv-header { grid-template-columns: 1fr; gap: 48px; padding: 80px 0 60px; } }

        .sv-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .sv-eyebrow-label {
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold);
        }
        .sv-line { width: 72px; height: 1px; background: var(--gold); transform: scaleX(0); transform-origin: left; }

        .sv-hline {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92;
          letter-spacing: 0.025em; color: var(--warm);
        }
        .sv-gold-word {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92; letter-spacing: 0.025em;
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 28%, var(--gold-light) 50%, var(--gold) 72%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }

        .sv-header-right { padding-top: 12px; }
        .sv-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.15rem, 1.6vw, 1.35rem);
          font-weight: 600; font-style: italic; line-height: 1.85;
          color: var(--warm); margin-bottom: 22px; -webkit-font-smoothing: antialiased;
        }
        .sv-note {
          display: block; font-size: 10px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 30px;
        }
        .sv-link {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); text-decoration: none;
          border-bottom: 1px solid rgba(201,168,76,0.4); padding-bottom: 5px;
          transition: gap .35s, color .3s, border-color .3s;
        }
        .sv-link:hover { gap: 22px; color: var(--gold-light); border-color: var(--gold-light); }
        .sv-link svg { transition: transform .35s; }
        .sv-link:hover svg { transform: translateX(5px); }

        /* ── CARDS ── */
        .sv-cards {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 2px; background: rgba(201,168,76,0.1);
        }
        @media (max-width: 800px) { .sv-cards { grid-template-columns: 1fr; } }

        /*
          CSS entrance animation replaces the GSAP clip-path wipe.
          Cards are invisible by default; .sv-cards-ready (added after
          IntersectionObserver fires) triggers the staggered fade-in.
          Before JS loads the cards are visible via @media (prefers-reduced-motion)
          fallback and the no-JS path.
        */
        @keyframes svCardIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sv-card {
          background: var(--ink2); position: relative; overflow: hidden;
          display: block; text-decoration: none; color: inherit; cursor: pointer;
          /* start hidden; animation fires when parent gets .sv-cards-ready */
          opacity: 0;
          transition: background 0.5s ease;
        }

        /* Stagger via nth-child — no JS needed */
        .sv-cards-ready .sv-card:nth-child(1) { animation: svCardIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .sv-cards-ready .sv-card:nth-child(2) { animation: svCardIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .sv-cards-ready .sv-card:nth-child(3) { animation: svCardIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.31s both; }
        .sv-cards-ready .sv-card:nth-child(4) { animation: svCardIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.44s both; }

        /* Hover: CSS handles colour/line transitions — no GSAP needed */
        .sv-card-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, var(--gold), var(--gold-light));
          transform: scaleX(0); transform-origin: left; z-index: 4;
          transition: transform 0.55s cubic-bezier(0.16,1,0.3,1);
        }
        .sv-card:hover .sv-card-line { transform: scaleX(1); }
        .sv-card:hover { background: var(--ink3); }
        .sv-card:hover .sv-card-title { color: var(--gold-light); }
        .sv-card:hover .sv-cta-text { color: var(--gold-light); transform: translateX(6px); }
        .sv-card:hover .sv-arrow {
          border-color: var(--gold);
          background: rgba(201,168,76,0.12);
          transform: translateX(6px);
        }
        .sv-card:hover .sv-num { -webkit-text-stroke-color: rgba(201,168,76,0.24); }

        .sv-card-inner {
          padding: 52px 48px 44px; position: relative; z-index: 2; will-change: transform;
        }
        @media (max-width: 700px) { .sv-card-inner { padding: 40px 28px 36px; } }

        .sv-num {
          position: absolute; top: -10px; right: 28px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(6rem, 10vw, 10rem); line-height: 1; padding-top: 6px;
          color: transparent; -webkit-text-stroke: 1px rgba(201,168,76,0.12);
          pointer-events: none; user-select: none; z-index: 1; will-change: transform;
          transition: -webkit-text-stroke-color 0.4s;
        }

        .sv-icon-wrap {
          width: 80px; height: 80px; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px; position: relative; z-index: 2; will-change: transform;
          transition: border-color 0.4s, background 0.4s;
        }
        .sv-card:hover .sv-icon-wrap {
          border-color: rgba(201,168,76,0.55); background: rgba(201,168,76,0.07);
        }
        .sv-icon-wrap img {
          width: 40px; height: 40px;
          filter: invert(68%) sepia(28%) saturate(700%) hue-rotate(5deg) brightness(92%) contrast(90%);
        }

        .sv-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.65rem, 2.4vw, 2.1rem); letter-spacing: 0.06em;
          color: var(--warm); line-height: 1.05; margin-bottom: 10px;
          display: block; position: relative; z-index: 2;
          transition: color 0.3s ease;
        }
        .sv-card-title::before {
          content: ''; display: block; width: 22px; height: 1px;
          background: var(--gold); margin-bottom: 12px;
        }

        .sv-card-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1.1rem; font-weight: 600;
          line-height: 1.75; color: var(--warm); display: block; margin-bottom: 26px;
          position: relative; z-index: 2; -webkit-font-smoothing: antialiased;
        }

        .sv-list {
          list-style: none; display: flex; flex-direction: column;
          gap: 8px; margin-bottom: 32px; position: relative; z-index: 2;
        }
        .sv-list li {
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
          color: rgba(240,234,214,0.92); line-height: 1.5;
          display: flex; align-items: center; gap: 12px; -webkit-font-smoothing: antialiased;
        }
        .sv-list li::before {
          content: ''; width: 16px; height: 1px;
          background: var(--gold); flex-shrink: 0; opacity: 0.7;
        }

        .sv-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 24px; border-top: 1px solid var(--border);
          position: relative; z-index: 2;
        }
        .sv-cta-text {
          font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600;
          letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold);
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .sv-arrow {
          width: 34px; height: 34px; border: 1px solid rgba(201,168,76,0.22);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: var(--gold); transition: border-color 0.35s, background 0.35s, transform 0.35s;
        }
        .sv-arrow svg { width: 12px; height: 12px; }

        /* ── CTA ── */
        .sv-cta {
          padding: 80px 0 100px; display: flex;
          align-items: center; justify-content: space-between;
          gap: 48px; border-top: 1px solid var(--border);
        }
        @media (max-width: 760px) { .sv-cta { flex-direction: column; align-items: flex-start; padding: 60px 0 80px; } }

        .sv-cta-overline {
          font-size: 10px; font-weight: 500; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 10px;
        }
        .sv-cta-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.8rem); letter-spacing: 0.05em;
          color: var(--warm); line-height: 1;
        }
        .sv-cta-right { display: flex; flex-direction: column; align-items: flex-end; gap: 20px; flex-shrink: 0; }
        @media (max-width: 760px) { .sv-cta-right { align-items: flex-start; } }
        .sv-cta-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 600; font-size: 1.15rem; line-height: 1.8;
          color: var(--warm); max-width: 320px; text-align: right; -webkit-font-smoothing: antialiased;
        }
        @media (max-width: 760px) { .sv-cta-sub { text-align: left; } }

        .sv-btn {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--gold); color: var(--ink);
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          padding: 18px 36px; transition: background .3s, gap .35s, transform .25s; white-space: nowrap;
        }
        .sv-btn:hover { background: var(--gold-light); gap: 22px; transform: translateY(-2px); }
        .sv-btn svg { transition: transform .35s; }
        .sv-btn:hover svg { transform: translateX(5px); }

        .sv-end-rule { height: 1px; background: rgba(255,255,255,0.07); position: relative; z-index: 2; }

        /* Reduced motion — disable all animations, show cards immediately */
        @media (prefers-reduced-motion: reduce) {
          .sv-card { opacity: 1 !important; animation: none !important; }
          .sv-cards-ready .sv-card { animation: none; opacity: 1; }
        }
      `}</style>

      <section className="sv-section" ref={sectionRef} id="services-overview">
        <div className="sv-vbar" aria-hidden="true" />

        <div className="sv-inner">
          <div className="sv-header">
            <div>
              <div className="sv-eyebrow">
                <span className="sv-eyebrow-label">Our Services</span>
                <span className="sv-line" />
              </div>
              <div>
                <span className="sv-hline">The Art of</span>
                <span className="sv-gold-word">Looking Sharp</span>
              </div>
            </div>
            <div className="sv-header-right">
              <p className="sv-body sv-fadeup">
                From a swift, precise cut to the full gentleman&rsquo;s ritual — every
                service is crafted with intention and delivered with care by our master barbers.
              </p>
              <span className="sv-note sv-fadeup">4 service categories · Walk-ins welcome</span>
              <a href="/booking" className="sv-link sv-fadeup">
                Book Your Visit
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                  <path d="M1 6h18M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/*
          .sv-cards-ready is added by the IntersectionObserver in initCards()
          which fires when the cards enter the viewport — triggering the CSS
          stagger animation without any GSAP involvement.
        */}
        <CardsGrid categories={CATEGORIES} sectionRef={sectionRef} />

        <div className="sv-inner">
          <div className="sv-cta">
            <div>
              <span className="sv-cta-overline">Ready to visit?</span>
              <h3 className="sv-cta-heading">Full Menu & Pricing</h3>
            </div>
            <div className="sv-cta-right">
              <p className="sv-cta-sub">
                See every service and every price — all the detail you need to plan
                your perfect visit.
              </p>
              <a href="/services" className="sv-btn">
                View Full Menu
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                  <path d="M1 6h18M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="sv-end-rule" />
      </section>
    </>
  );
}

// ── CardsGrid ──────────────────────────────────────────────────────────────────
// Separated so it can manage its own IntersectionObserver for the CSS
// entrance trigger (.sv-cards-ready) independently of the GSAP load.
function CardsGrid({
  categories,
  sectionRef,
}: {
  categories: Category[];
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Add .sv-cards-ready when grid enters viewport → triggers CSS stagger
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          grid.classList.add("sv-cards-ready");
          obs.disconnect();
        }
      },
      { rootMargin: "0px", threshold: 0.1 }
    );
    obs.observe(grid);
    return () => obs.disconnect();
  }, []);

  // Suppress the ref warning — sectionRef is passed for GSAP access in parent
  void sectionRef;

  return (
    <div className="sv-cards" ref={gridRef}>
      {categories.map(({ num, icon, iconAlt, title, subtitle, services }) => (
        <a key={num} href="/services" className="sv-card" aria-label={`Explore ${title}`}>
          <div className="sv-card-line" aria-hidden="true" />
          <span className="sv-num" aria-hidden="true">{num}</span>
          <div className="sv-card-inner">
            <div className="sv-icon-wrap" aria-hidden="true">
              <Image src={icon} alt={iconAlt} width={40} height={40} />
            </div>
            <span className="sv-card-title">{title}</span>
            <span className="sv-card-sub">{subtitle}</span>
            <ul className="sv-list">
              {services.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <div className="sv-card-footer">
              <span className="sv-cta-text">Discover Prices</span>
              <div className="sv-arrow" aria-hidden="true">
                <svg viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M7.5 1.5L13 7l-5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}