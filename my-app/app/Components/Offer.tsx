"use client";
// Types live in gsap.d.ts at the project root — no declare global needed here.

import { JSX, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  OFFERS — edit freely. `featured: true` makes that offer the hero card.
// ─────────────────────────────────────────────────────────────────────────────
interface Offer {
  id: string;
  tag: string;           // pill label e.g. "Limited Time"
  title: string;
  description: string;
  originalPrice: string;
  offerPrice: string;
  saving: string;
  includes: string[];
  cta: string;
  featured?: boolean;
  expiry?: string;       // "Ends 31 Mar" — shown as urgency badge
}

const OFFERS: Offer[] = [
  {
    id: "new-client",
    tag: "New Clients",
    title: "First Visit\nOffer",
    description: "Experience the craft — your first signature cut at a special introductory price.",
    originalPrice: "£45",
    offerPrice: "£30",
    saving: "Save £15",
    includes: ["Wash & Haircut", "Scalp massage", "Styling finish"],
    cta: "Claim Offer",
    expiry: "Ongoing",
  },
  {
    id: "gentleman",
    tag: "Best Value",
    title: "The\nGentleman\nPackage",
    description: "Our most complete grooming ritual. Cut, beard, hot shave — the full experience for the discerning man.",
    originalPrice: "£91",
    offerPrice: "£70",
    saving: "Save £21",
    includes: [
      "Signature Cut",
      "Beard Sculpt",
      "Hot Towel Shave",
      "Complimentary drink",
    ],
    cta: "Book Now",
    featured: true,
    expiry: "Ends 31 Mar",
  },
  {
    id: "father-son",
    tag: "Family",
    title: "Father &\nSon",
    description: "Bring the young gentleman along. Two cuts, same appointment, one great price.",
    originalPrice: "£61",
    offerPrice: "£48",
    saving: "Save £13",
    includes: ["Men's Haircut", "Boys Haircut", "Back-to-back booking"],
    cta: "Book Together",
    expiry: "Ends 28 Feb",
  },
  {
    id: "midweek",
    tag: "Midweek Deal",
    title: "Monday–\nWednesday\nDiscount",
    description: "Beat the weekend rush. Any service booked Monday to Wednesday gets 15% off.",
    originalPrice: "—",
    offerPrice: "15% off",
    saving: "Every week",
    includes: ["All services", "Mon–Wed only", "No code needed"],
    cta: "See Times",
  },
];

const featured = OFFERS.find((o) => o.featured)!;
const secondary = OFFERS.filter((o) => !o.featured);

export default function OffersSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const loadGSAP = async () => {
      if (!document.querySelector('script[src*="gsap.min.js"]')) {
        await new Promise<void>((res) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
          s.onload = () => res();
          document.head.appendChild(s);
        });
      } else {
        await new Promise<void>((r) => setTimeout(r, 80));
      }
      if (!document.querySelector('script[src*="ScrollTrigger.min.js"]')) {
        await new Promise<void>((res) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
          s.onload = () => res();
          document.head.appendChild(s);
        });
      } else {
        await new Promise<void>((r) => setTimeout(r, 80));
      }
      init();
    };

    const init = () => {
      const gsap = window.gsap;
      const ST = window.ScrollTrigger;
      if (!gsap || !ST || hasAnimated.current) return;
      hasAnimated.current = true;
      gsap.registerPlugin(ST);
      const sec = sectionRef.current;
      if (!sec) return;

      // ── Eyebrow line draw
      gsap.fromTo(sec.querySelector(".of-line"),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left",
          scrollTrigger: { trigger: sec, start: "top 78%" } }
      );

      // ── Heading chars
      sec.querySelectorAll<HTMLElement>(".of-hline").forEach((line) => {
        line.innerHTML = (line.textContent ?? "").split("").map((c) =>
          c.trim() === ""
            ? `<span style="display:inline-block;width:.26em">&nbsp;</span>`
            : `<span class="of-c" style="display:inline-block">${c}</span>`
        ).join("");
      });
      gsap.fromTo(sec.querySelectorAll(".of-c"),
        { yPercent: 110, rotationX: -40, opacity: 0 },
        { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.02, duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: sec, start: "top 75%" } }
      );
      gsap.fromTo(sec.querySelector(".of-head-gold"),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: sec, start: "top 75%" } }
      );

      // ── Sub + note fade-up
      gsap.fromTo(sec.querySelectorAll(".of-fadeup"),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: sec.querySelector(".of-header"), start: "top 72%" } }
      );

      // ── Featured card dramatic entrance
      const featCard = sec.querySelector<HTMLElement>(".of-feat");
      if (featCard) {
        gsap.fromTo(featCard,
          { y: 80, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: sec.querySelector(".of-grid"), start: "top 84%" } }
        );

        // Spotlight tracking on featured card
        featCard.addEventListener("mousemove", (e: MouseEvent) => {
          const r = featCard.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          mouseRef.current = { x, y };
          const spotlight = featCard.querySelector<HTMLElement>(".of-spotlight");
          if (spotlight) {
            spotlight.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(201,168,76,0.12) 0%, transparent 70%)`;
          }
          // Tilt effect
          const cx = (x / r.width - 0.5) * 10;
          const cy = (y / r.height - 0.5) * -6;
          gsap.to(featCard.querySelector(".of-feat-inner"), {
            rotateX: cy, rotateY: cx, duration: 0.5, ease: "power2.out",
            transformPerspective: 1000,
          });
        });
        featCard.addEventListener("mouseleave", () => {
          const spotlight = featCard.querySelector<HTMLElement>(".of-spotlight");
          if (spotlight) spotlight.style.background = "transparent";
          gsap.to(featCard.querySelector(".of-feat-inner"), {
            rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.6)",
          });
        });
      }

      // ── Secondary cards stagger
      gsap.fromTo(sec.querySelectorAll<HTMLElement>(".of-card"),
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.14, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sec.querySelector(".of-secondary"), start: "top 85%" } }
      );

      // ── Secondary card hover
      sec.querySelectorAll<HTMLElement>(".of-card").forEach((card) => {
        const bar = card.querySelector<HTMLElement>(".of-card-bar");
        const title = card.querySelector<HTMLElement>(".of-card-title");
        const btn = card.querySelector<HTMLElement>(".of-card-btn");

        gsap.set(bar, { scaleX: 0 });

        card.addEventListener("mouseenter", () => {
          gsap.to(bar, { scaleX: 1, duration: 0.5, ease: "expo.out", transformOrigin: "left" });
          gsap.to(title, { x: 5, color: "#F0D878", duration: 0.3 });
          gsap.to(btn, { gap: "18px", duration: 0.35 });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(bar, { scaleX: 0, duration: 0.4, ease: "power3.inOut", transformOrigin: "right" });
          gsap.to(title, { x: 0, color: "#F0EAD6", duration: 0.35 });
          gsap.to(btn, { gap: "10px", duration: 0.35 });
        });
      });

      // ── Price number count-up on scroll
      sec.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const raw = el.dataset.count ?? "";
        if (raw.startsWith("£")) {
          const num = parseInt(raw.replace("£", ""), 10);
          if (!isNaN(num)) {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: num, duration: 1.6, ease: "power2.out",
              onUpdate: () => { el.textContent = "£" + Math.round(obj.val); },
              scrollTrigger: { trigger: el, start: "top 88%" },
            });
          }
        }
      });

      // ── Pulsing urgency badges
      sec.querySelectorAll<HTMLElement>(".of-expiry").forEach((badge) => {
        gsap.to(badge, {
          scale: 1.04, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1,
        });
      });

      // ── Gold bar parallax
      gsap.to(sec.querySelector(".of-vbar"), {
        y: -80, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
      });

      // ── Diagonal stripe parallax
      gsap.to(sec.querySelector(".of-stripe"), {
        y: 60, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
    };

    loadGSAP();
    return () => { if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        /* ── Tokens — same as entire site ── */
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

        .of-section *, .of-section *::before, .of-section *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .of-section {
          background: var(--ink);
          color: var(--warm);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Grain */
        .of-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 40;
        }

        /* Decorative diagonal stripe behind the grid */
        .of-stripe {
          position: absolute;
          top: 30%; left: -10%;
          width: 130%; height: 320px;
          background: linear-gradient(to right, transparent 0%, rgba(201,168,76,0.025) 40%, rgba(201,168,76,0.025) 60%, transparent 100%);
          transform: rotate(-6deg);
          pointer-events: none; z-index: 0;
        }

        /* Gold vertical bar */
        .of-vbar {
          position: absolute; left: 52px; top: -8%;
          width: 1px; height: 118%;
          background: linear-gradient(to bottom, transparent, var(--gold) 25%, var(--gold) 75%, transparent);
          opacity: 0.28; pointer-events: none; z-index: 1;
        }

        /* Container */
        .of-inner {
          max-width: 1360px; margin: 0 auto; padding: 0 88px;
          position: relative; z-index: 2;
        }
        @media (max-width: 960px) { .of-inner { padding: 0 28px; } .of-vbar { display: none; } }

        /* ─────────────────────────────────────────
           HEADER
        ───────────────────────────────────────── */
        .of-header {
          padding: 120px 0 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: end;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 960px) { .of-header { grid-template-columns: 1fr; gap: 40px; padding: 80px 0 60px; } }

        .of-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .of-eyebrow-label {
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold);
        }
        .of-line { width: 72px; height: 1px; background: var(--gold); transform: scaleX(0); }

        .of-hline {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem);
          line-height: 0.92; letter-spacing: 0.025em; color: var(--warm);
        }
        .of-head-gold {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem);
          line-height: 0.92; letter-spacing: 0.025em;
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 28%, var(--gold-light) 50%, var(--gold) 72%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }

        .of-header-right { padding-bottom: 4px; }
        .of-header-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.15rem, 1.6vw, 1.35rem);
          font-weight: 600; font-style: italic; line-height: 1.85;
          color: var(--warm); margin-bottom: 28px;
          -webkit-font-smoothing: antialiased;
        }
        .of-header-note {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--muted); display: block;
        }

        /* ─────────────────────────────────────────
           GRID LAYOUT
           Featured (tall) left + 3 secondary right
        ───────────────────────────────────────── */
        .of-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 2px;
          background: rgba(201,168,76,0.1);
          margin: 0;
        }
        @media (max-width: 960px) { .of-grid { grid-template-columns: 1fr; } }

        /* ─────────────────────────────────────────
           FEATURED CARD
        ───────────────────────────────────────── */
        .of-feat {
          background: var(--ink2);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          min-height: 680px;
          cursor: pointer;
          transform-style: preserve-3d;
        }

        /* Spotlight layer — fills via JS on mousemove */
        .of-spotlight {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 1;
          transition: background 0.1s;
        }

        /* Animated gold shimmer on featured */
        .of-feat-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(201,168,76,0.04) 50%, transparent 60%);
          background-size: 300% 300%;
          animation: ofShimmer 6s ease infinite;
          pointer-events: none; z-index: 1;
        }
        @keyframes ofShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Large ghost "OFFER" text */
        .of-feat-ghost {
          position: absolute; bottom: -20px; right: -20px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(8rem, 16vw, 15rem);
          line-height: 0.85; color: transparent;
          -webkit-text-stroke: 1px rgba(201,168,76,0.07);
          pointer-events: none; user-select: none; z-index: 0;
          white-space: nowrap;
        }

        .of-feat-inner {
          padding: 56px 52px;
          display: flex; flex-direction: column;
          height: 100%; position: relative; z-index: 2;
          will-change: transform;
        }
        @media (max-width: 700px) { .of-feat-inner { padding: 40px 28px; } }

        /* Featured top row */
        .of-feat-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 48px;
        }

        /* Tag pill */
        .of-tag {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--ink); background: var(--gold);
          padding: 6px 14px;
          display: inline-block;
        }
        .of-tag-ghost {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.24em; text-transform: uppercase;
          color: var(--gold); border: 1px solid var(--gold);
          padding: 6px 14px;
          display: inline-block;
        }

        /* Expiry badge */
        .of-expiry {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--gold-light);
          border: 1px solid rgba(240,216,120,0.35);
          padding: 6px 12px;
          display: inline-block;
          white-space: nowrap;
        }

        /* Featured title */
        .of-feat-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.2rem, 6vw, 5.5rem);
          letter-spacing: 0.03em;
          color: var(--warm);
          line-height: 0.9;
          margin-bottom: 24px;
          white-space: pre-line;
        }
        .of-feat-title::before {
          content: '';
          display: block; width: 28px; height: 2px;
          background: var(--gold); margin-bottom: 18px;
        }

        /* Featured description */
        .of-feat-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 600; font-style: italic;
          line-height: 1.8; color: var(--warm);
          margin-bottom: 40px;
          max-width: 380px;
          -webkit-font-smoothing: antialiased;
        }

        /* Includes list */
        .of-includes {
          list-style: none; display: flex; flex-direction: column;
          gap: 10px; margin-bottom: 44px;
        }
        .of-includes li {
          display: flex; align-items: center; gap: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem; font-weight: 500;
          color: rgba(240,234,214,0.92);
          -webkit-font-smoothing: antialiased;
        }
        .of-includes li::before {
          content: '';
          width: 20px; height: 1px;
          background: linear-gradient(to right, var(--gold), var(--gold-light));
          flex-shrink: 0;
        }

        /* Price block — the hero element */
        .of-price-block {
          margin-top: auto;
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 24px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }

        .of-price-main {
          display: flex; flex-direction: column; gap: 2px;
        }
        .of-price-was {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--muted); text-decoration: line-through;
        }
        .of-price-now {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 5vw, 5rem);
          line-height: 0.9; letter-spacing: 0.02em;
          background: linear-gradient(110deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .of-saving-pill {
          display: inline-block;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.35);
          font-family: 'DM Sans', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--gold-light);
          padding: 5px 12px;
          align-self: flex-start;
          margin-top: 4px;
        }

        /* Featured CTA button */
        .of-feat-btn {
          display: inline-flex; align-items: center; gap: 12px;
          background: var(--gold); color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          text-decoration: none; padding: 18px 34px;
          white-space: nowrap;
          transition: background 0.3s, gap 0.35s, transform 0.25s;
          position: relative; overflow: hidden;
        }
        .of-feat-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: var(--gold-light);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.45s cubic-bezier(0.76,0,0.24,1);
        }
        .of-feat-btn:hover::before { transform: scaleX(1); }
        .of-feat-btn:hover { gap: 20px; transform: translateY(-2px); }
        .of-feat-btn span, .of-feat-btn svg { position: relative; z-index: 1; }

        /* ─────────────────────────────────────────
           SECONDARY CARDS COLUMN
        ───────────────────────────────────────── */
        .of-secondary {
          display: flex; flex-direction: column; gap: 2px;
        }

        .of-card {
          background: var(--ink2);
          position: relative; overflow: hidden;
          cursor: pointer; flex: 1;
          transition: background 0.45s ease;
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
        }
        .of-card:hover { background: var(--ink3); }

        /* Bottom accent line */
        .of-card-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, var(--gold), var(--gold-light));
          transform: scaleX(0); transform-origin: left; z-index: 3;
        }

        .of-card-inner {
          padding: 32px 36px 28px;
          display: flex; flex-direction: column; height: 100%;
          position: relative; z-index: 2;
        }
        @media (max-width: 700px) { .of-card-inner { padding: 28px 24px; } }

        .of-card-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }

        .of-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.7rem, 2.8vw, 2.3rem);
          letter-spacing: 0.05em; color: var(--warm);
          line-height: 0.92; margin-bottom: 10px;
          white-space: pre-line;
        }
        .of-card-title::before {
          content: ''; display: block;
          width: 20px; height: 1px;
          background: var(--gold); margin-bottom: 10px;
        }

        .of-card-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem; font-weight: 600; font-style: italic;
          line-height: 1.75; color: var(--warm);
          margin-bottom: 18px;
          -webkit-font-smoothing: antialiased;
        }

        .of-card-includes {
          list-style: none; display: flex; flex-direction: column; gap: 6px;
          margin-bottom: 20px;
        }
        .of-card-includes li {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500;
          color: rgba(240,234,214,0.88);
          display: flex; align-items: center; gap: 10px;
          -webkit-font-smoothing: antialiased;
        }
        .of-card-includes li::before {
          content: ''; width: 14px; height: 1px;
          background: var(--gold); flex-shrink: 0; opacity: 0.65;
        }

        /* Card price row */
        .of-card-footer {
          margin-top: auto;
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 18px; border-top: 1px solid var(--border);
        }

        .of-card-price {
          display: flex; flex-direction: column; gap: 1px;
        }
        .of-card-price-was {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--muted); text-decoration: line-through;
        }
        .of-card-price-now {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem; line-height: 1; letter-spacing: 0.04em;
          background: linear-gradient(120deg, var(--gold), var(--gold-light));
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .of-card-save {
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--gold-light);
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          padding: 3px 8px; align-self: flex-start; margin-top: 3px;
        }

        /* Card CTA */
        .of-card-btn {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 9.5px; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--gold); border-bottom: 1px solid rgba(201,168,76,0.35);
          padding-bottom: 4px; text-decoration: none;
          transition: color 0.3s, border-color 0.3s;
          white-space: nowrap;
        }
        .of-card:hover .of-card-btn { color: var(--gold-light); border-color: var(--gold-light); }
        .of-card-btn svg { transition: transform 0.3s; }
        .of-card:hover .of-card-btn svg { transform: translateX(5px); }

        /* ─────────────────────────────────────────
           BOTTOM BANNER
        ───────────────────────────────────────── */
        .of-banner {
          border: 1px solid var(--border);
          border-top: none;
          padding: 44px 60px;
          display: flex; align-items: center; justify-content: space-between; gap: 40px;
          background: var(--ink2);
          position: relative; overflow: hidden;
          z-index: 2;
        }
        @media (max-width: 760px) { .of-banner { flex-direction: column; align-items: flex-start; padding: 36px 28px; } }

        /* Decorative corner marks */
        .of-banner::before, .of-banner::after {
          content: '';
          position: absolute;
          width: 40px; height: 40px;
          border-color: rgba(201,168,76,0.25);
          border-style: solid;
        }
        .of-banner::before {
          top: 16px; left: 20px;
          border-width: 1px 0 0 1px;
        }
        .of-banner::after {
          bottom: 16px; right: 20px;
          border-width: 0 1px 1px 0;
        }

        .of-banner-left { display: flex; flex-direction: column; gap: 6px; }
        .of-banner-label {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.24em; text-transform: uppercase; color: var(--muted);
        }
        .of-banner-headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          letter-spacing: 0.04em; color: var(--warm); line-height: 1;
        }

        .of-banner-right {
          display: flex; align-items: center; gap: 32px;
          flex-wrap: wrap;
        }

        .of-banner-body {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 600;
          font-size: 1.05rem; line-height: 1.75; color: var(--warm);
          max-width: 280px;
          -webkit-font-smoothing: antialiased;
        }

        .of-banner-btn {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--gold); color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          text-decoration: none; padding: 17px 32px;
          transition: background 0.3s, gap 0.35s, transform 0.25s;
          white-space: nowrap; flex-shrink: 0;
        }
        .of-banner-btn:hover { background: var(--gold-light); gap: 22px; transform: translateY(-2px); }
        .of-banner-btn svg { transition: transform 0.35s; }
        .of-banner-btn:hover svg { transform: translateX(5px); }

        /* End rule */
        .of-end-rule { height: 1px; background: rgba(255,255,255,0.07); position: relative; z-index: 2; }
      `}</style>

      <section className="of-section" ref={sectionRef} id="offers">
        <div className="of-stripe" aria-hidden="true" />
        <div className="of-vbar" aria-hidden="true" />

        {/* ── HEADER ── */}
        <div className="of-inner">
          <div className="of-header">
            <div>
              <div className="of-eyebrow">
                <span className="of-eyebrow-label">Exclusive Offers</span>
                <span className="of-line" />
              </div>
              <div>
                <span className="of-hline">Deals Worth</span>
                <span className="of-head-gold">Dressing For</span>
              </div>
            </div>
            <div className="of-header-right">
              <p className="of-header-body of-fadeup">
                Handpicked offers for gentlemen who expect more. Limited-time packages,
                introductory rates, and seasonal deals — crafted to make the finest
                grooming even more rewarding.
              </p>
              <span className="of-header-note of-fadeup">All offers subject to availability · Book online or in-store</span>
            </div>
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="of-inner" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="of-grid">

            {/* FEATURED CARD */}
            <div className="of-feat">
              <div className="of-spotlight" aria-hidden="true" />
              <div className="of-feat-shimmer" aria-hidden="true" />
              <span className="of-feat-ghost" aria-hidden="true">OFFER</span>

              <div className="of-feat-inner">
                <div className="of-feat-top">
                  <span className="of-tag">{featured.tag}</span>
                  {featured.expiry && <span className="of-expiry">{featured.expiry}</span>}
                </div>

                <h3 className="of-feat-title">{featured.title}</h3>
                <p className="of-feat-desc">{featured.description}</p>

                <ul className="of-includes">
                  {featured.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <div className="of-price-block">
                  <div>
                    <div className="of-price-main">
                      <span className="of-price-was">Was {featured.originalPrice}</span>
                      <span className="of-price-now" data-count={featured.offerPrice}>
                        {featured.offerPrice}
                      </span>
                    </div>
                    <span className="of-saving-pill">{featured.saving}</span>
                  </div>
                  <a href="/booking" className="of-feat-btn">
                    <span>{featured.cta}</span>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M1 5h16M11 1l6 4-6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* SECONDARY CARDS */}
            <div className="of-secondary">
              {secondary.map((offer) => (
                <a key={offer.id} href="/booking" className="of-card" aria-label={offer.title}>
                  <div className="of-card-bar" aria-hidden="true" />
                  <div className="of-card-inner">
                    <div className="of-card-top">
                      <span className="of-tag-ghost">{offer.tag}</span>
                      {offer.expiry && <span className="of-expiry">{offer.expiry}</span>}
                    </div>
                    <h3 className="of-card-title">{offer.title}</h3>
                    <p className="of-card-desc">{offer.description}</p>
                    <ul className="of-card-includes">
                      {offer.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="of-card-footer">
                      <div className="of-card-price">
                        {offer.originalPrice !== "—" && (
                          <span className="of-card-price-was">Was {offer.originalPrice}</span>
                        )}
                        <span className="of-card-price-now" data-count={offer.offerPrice.startsWith("£") ? offer.offerPrice : undefined}>
                          {offer.offerPrice}
                        </span>
                        <span className="of-card-save">{offer.saving}</span>
                      </div>
                      <span className="of-card-btn">
                        {offer.cta}
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
                          <path d="M1 4h12M8 1l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM BANNER ── */}
        <div className="of-inner" style={{ paddingTop: 0 }}>
          <div className="of-banner">
            <div className="of-banner-left">
              <span className="of-banner-label">Loyalty Reward</span>
              <h3 className="of-banner-headline">Your 5th Visit Is On Us</h3>
            </div>
            <div className="of-banner-right">
              <p className="of-banner-body">
                Every visit earns a stamp. Five stamps and your next haircut is
                completely free — no strings attached.
              </p>
              <a href="/loyalty" className="of-banner-btn">
                Join the Club
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                  <path d="M1 5h16M11 1l6 4-6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="of-end-rule" />
      </section>
    </>
  );
}