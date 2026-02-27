"use client";

import Image from "next/image";
import { JSX, useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Offer {
  id: string;
  tag: string;
  title: string;
  description: string;
  price: string;
  includes: string[];
  expiry?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  FIXED OFFER — permanent, never changes
// ─────────────────────────────────────────────────────────────────────────────
const FIXED_OFFER: Offer = {
  id: "grooming-package",
  tag: "Special Offer",
  title: "The\nGrooming\nPackage",
  description:
    "Everything a gentleman needs in one appointment. Our signature all-in grooming ritual — looking and feeling your absolute best.",
  price: "£44",
  includes: [
    "Signature Haircut",
    "Beard Trim & Line-up",
    "Hot Towel Scalp Treatment",
    "Styling Finish",
  ],
  expiry: "Ongoing",
};

// ─────────────────────────────────────────────────────────────────────────────
//  DYNAMIC OFFER — driven by your internal system
//  Update the useEffect below to fetch from your endpoint
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_DYNAMIC: Offer = {
  id: "dynamic",
  tag: "Limited Time",
  title: "The\nGentleman\nPackage",
  description:
    "Our most complete grooming ritual. Cut, beard, hot shave — the full experience for the discerning man.",
  price: "£70",
  includes: [
    "Signature Cut",
    "Beard Sculpt",
    "Hot Towel Shave",
    "Complimentary drink",
  ],
  expiry: "Ends 31 Mar",
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function OffersSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [dynamicOffer, setDynamicOffer] = useState<Offer>(FALLBACK_DYNAMIC);

  useEffect(() => {
    // ── Connect your internal system here ──
    // const res  = await fetch("/api/offers/current");
    // const data = await res.json();
    // setDynamicOffer(data);
  }, []);

  // ── GSAP ─────────────────────────────────────────────────────────────────
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

      // Line draw
      gsap.fromTo(sec.querySelector(".of-line"),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left",
          scrollTrigger: { trigger: sec, start: "top 78%" } }
      );

      // Heading chars
      sec.querySelectorAll<HTMLElement>(".of-hline").forEach((line) => {
        line.innerHTML = (line.textContent ?? "").split("").map((c) =>
          c.trim() === ""
            ? `<span style="display:inline-block;width:.26em">&nbsp;</span>`
            : `<span class="of-c" style="display:inline-block">${c}</span>`
        ).join("");
      });
      gsap.fromTo(sec.querySelectorAll(".of-c"),
        { yPercent: 110, rotationX: -40, opacity: 0 },
        { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.02, duration: 0.75,
          ease: "power3.out", scrollTrigger: { trigger: sec, start: "top 75%" } }
      );
      gsap.fromTo(sec.querySelector(".of-head-gold"),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: sec, start: "top 75%" } }
      );

      // Sub text
      gsap.fromTo(sec.querySelectorAll(".of-fadeup"),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: sec.querySelector(".of-header"), start: "top 72%" } }
      );

      // Cards entrance
      gsap.fromTo(sec.querySelectorAll(".of-card"),
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: sec.querySelector(".of-grid"), start: "top 84%" } }
      );

      // Card hover bar + title colour
      sec.querySelectorAll<HTMLElement>(".of-card").forEach((card) => {
        const bar   = card.querySelector<HTMLElement>(".of-card-bar");
        const title = card.querySelector<HTMLElement>(".of-card-title");
        gsap.set(bar, { scaleX: 0 });
        card.addEventListener("mouseenter", () => {
          gsap.to(bar,   { scaleX: 1, duration: 0.55, ease: "expo.out", transformOrigin: "left" });
          gsap.to(title, { x: 5, color: "#F0D878", duration: 0.3 });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(bar,   { scaleX: 0, duration: 0.4, ease: "power3.inOut", transformOrigin: "right" });
          gsap.to(title, { x: 0, color: "#F0EAD6", duration: 0.35 });
        });
      });

      // Tilt + spotlight on fixed card
      const fixedCard = sec.querySelector<HTMLElement>(".of-card-fixed");
      if (fixedCard) {
        fixedCard.addEventListener("mousemove", (e: MouseEvent) => {
          const r = fixedCard.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          const spot = fixedCard.querySelector<HTMLElement>(".of-spotlight");
          if (spot) spot.style.background = `radial-gradient(380px circle at ${x}px ${y}px, rgba(201,168,76,0.10) 0%, transparent 70%)`;
          gsap.to(fixedCard, {
            rotateX: (y / r.height - 0.5) * -5,
            rotateY: (x / r.width  - 0.5) *  8,
            duration: 0.5, ease: "power2.out", transformPerspective: 1000,
          });
        });
        fixedCard.addEventListener("mouseleave", () => {
          const spot = fixedCard.querySelector<HTMLElement>(".of-spotlight");
          if (spot) spot.style.background = "transparent";
          gsap.to(fixedCard, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.6)" });
        });
      }

      // Price count-up
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

      // Pulsing expiry badges
      sec.querySelectorAll<HTMLElement>(".of-expiry").forEach((b) =>
        gsap.to(b, { scale: 1.04, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 })
      );

      // Parallax decorations
      gsap.to(sec.querySelector(".of-vbar"), {
        y: -80, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
      });
      gsap.to(sec.querySelector(".of-stripe"), {
        y: 60, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
    };

    loadGSAP();
    return () => {
      if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

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
          background: var(--ink); color: var(--warm);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .of-section::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 40;
        }
        .of-stripe {
          position: absolute; top: 30%; left: -10%;
          width: 130%; height: 320px;
          background: linear-gradient(to right, transparent 0%, rgba(201,168,76,0.025) 40%, rgba(201,168,76,0.025) 60%, transparent 100%);
          transform: rotate(-6deg); pointer-events: none; z-index: 0;
        }
        .of-vbar {
          position: absolute; left: 52px; top: -8%;
          width: 1px; height: 118%;
          background: linear-gradient(to bottom, transparent, var(--gold) 25%, var(--gold) 75%, transparent);
          opacity: 0.28; pointer-events: none; z-index: 1;
        }
        .of-inner {
          max-width: 1360px; margin: 0 auto; padding: 0 88px;
          position: relative; z-index: 2;
        }
        @media (max-width: 960px) { .of-inner { padding: 0 28px; } .of-vbar { display: none; } }

        /* ── HEADER ── */
        .of-header {
          padding: 120px 0 80px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: end;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 960px) {
          .of-header { grid-template-columns: 1fr; gap: 40px; padding: 80px 0 60px; }
        }
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
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
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

        /* ── TWO-CARD GRID ── */
        .of-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2px; background: rgba(201,168,76,0.1);
        }
        @media (max-width: 860px) { .of-grid { grid-template-columns: 1fr; } }

        /* ── SHARED CARD ── */
        .of-card {
          background: var(--ink2);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          min-height: 700px;
          transform-style: preserve-3d;
          transition: background 0.4s;
        }
        .of-card:hover { background: var(--ink3); }
        .of-card-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, var(--gold), var(--gold-light));
          transform: scaleX(0); transform-origin: left; z-index: 3;
        }
        .of-spotlight {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          transition: background 0.1s;
        }
        .of-shimmer {
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
        .of-ghost {
          position: absolute; bottom: -20px; right: -16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(7rem, 14vw, 13rem);
          line-height: 0.85; color: transparent;
          -webkit-text-stroke: 1px rgba(201,168,76,0.07);
          pointer-events: none; user-select: none; z-index: 0;
          white-space: nowrap;
        }

        /* ── HERO IMAGE (fixed card only) ── */
        .of-image-wrap {
          position: relative; width: 100%; height: 280px;
          overflow: hidden; flex-shrink: 0;
        }
        /* Next/Image fill container */
        .of-image-wrap > span,
        .of-image-wrap img {
          transition: transform 0.8s ease !important;
        }
        .of-card:hover .of-image-wrap img {
          transform: scale(1.04) !important;
        }
        .of-image-wrap::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 30%, rgba(15,14,12,0.55) 65%, var(--ink2) 100%);
          z-index: 1;
        }
        .of-image-wrap::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(201,168,76,0.05); z-index: 2; pointer-events: none;
        }
        /* Floating price badge over image */
        .of-price-badge {
          position: absolute; bottom: -1px; left: 48px;
          z-index: 3; background: var(--gold);
          padding: 10px 22px;
          display: flex; flex-direction: column; gap: 0;
        }
        .of-price-badge-from {
          font-size: 8px; font-weight: 700;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(8,7,5,0.6);
        }
        .of-price-badge-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem; line-height: 0.9; color: var(--ink);
        }

        /* ── CARD BODY ── */
        .of-card-body {
          padding: 40px 48px 48px;
          display: flex; flex-direction: column;
          flex: 1; position: relative; z-index: 2;
        }
        @media (max-width: 700px) { .of-card-body { padding: 32px 26px 40px; } }

        .of-card-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 28px;
        }
        .of-tag {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--ink); background: var(--gold);
          padding: 6px 14px; display: inline-block;
        }
        .of-tag-outline {
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.24em; text-transform: uppercase;
          color: var(--gold); border: 1px solid var(--gold);
          padding: 6px 14px; display: inline-block;
        }
        .of-expiry {
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--gold-light); border: 1px solid rgba(240,216,120,0.35);
          padding: 6px 12px; display: inline-block; white-space: nowrap;
        }

        .of-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 5.5vw, 5rem);
          letter-spacing: 0.03em; color: var(--warm);
          line-height: 0.9; margin-bottom: 20px; white-space: pre-line;
        }
        .of-card-title::before {
          content: ''; display: block; width: 26px; height: 2px;
          background: var(--gold); margin-bottom: 16px;
        }
        .of-card-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 600; font-style: italic;
          line-height: 1.8; color: var(--warm); margin-bottom: 32px;
          max-width: 380px; -webkit-font-smoothing: antialiased;
        }
        .of-includes {
          list-style: none; display: flex; flex-direction: column; gap: 10px;
        }
        .of-includes li {
          display: flex; align-items: center; gap: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem; font-weight: 500;
          color: rgba(240,234,214,0.92); -webkit-font-smoothing: antialiased;
        }
        .of-includes li::before {
          content: ''; width: 20px; height: 1px;
          background: linear-gradient(to right, var(--gold), var(--gold-light));
          flex-shrink: 0;
        }

        /* ── PRICE FOOTER ── */
        .of-price-footer {
          margin-top: auto; padding-top: 32px;
          border-top: 1px solid var(--border);
          display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
        }
        .of-price-stack { display: flex; flex-direction: column; gap: 2px; }
        .of-price-label {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted);
        }
        .of-price-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.2rem, 4.5vw, 4.5rem);
          line-height: 0.9; letter-spacing: 0.02em;
          background: linear-gradient(110deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .of-price-pill {
          display: inline-block;
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.3);
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold-light); padding: 5px 12px; margin-top: 4px;
          align-self: flex-start;
        }
        /* Pulsing walk-in dot */
        .of-walkin {
          display: flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--muted);
        }
        .of-walkin::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold); flex-shrink: 0;
          animation: walkinPulse 2s ease-in-out infinite;
        }
        @keyframes walkinPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(1.5); }
        }

        /* ── LOYALTY BANNER ── */
        .of-banner {
          border: 1px solid var(--border); border-top: none;
          padding: 44px 60px;
          display: flex; align-items: center; justify-content: space-between; gap: 40px;
          background: var(--ink2); position: relative; overflow: hidden; z-index: 2;
        }
        @media (max-width: 760px) {
          .of-banner { flex-direction: column; align-items: flex-start; padding: 36px 28px; }
        }
        .of-banner::before, .of-banner::after {
          content: ''; position: absolute;
          width: 40px; height: 40px;
          border-color: rgba(201,168,76,0.25); border-style: solid;
        }
        .of-banner::before { top: 16px; left: 20px; border-width: 1px 0 0 1px; }
        .of-banner::after  { bottom: 16px; right: 20px; border-width: 0 1px 1px 0; }
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
        .of-banner-right { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
        .of-banner-body {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 600;
          font-size: 1.05rem; line-height: 1.75; color: var(--warm);
          max-width: 280px; -webkit-font-smoothing: antialiased;
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

        .of-end-rule { height: 1px; background: rgba(255,255,255,0.07); position: relative; z-index: 2; }
      `}</style>

      <section className="of-section" ref={sectionRef} id="offers">
        <div className="of-stripe" aria-hidden="true" />
        <div className="of-vbar"   aria-hidden="true" />

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
                Handpicked offers for gentlemen who expect more. Special packages
                and seasonal rates — crafted to make the finest grooming even
                more rewarding. No booking needed, just walk in.
              </p>
              <span className="of-header-note of-fadeup">
                All offers subject to availability · Walk-ins always welcome
              </span>
            </div>
          </div>
        </div>

        {/* ── TWO-CARD GRID ── */}
        <div className="of-inner" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="of-grid">

            {/* ── CARD 1 — fixed £44 Grooming Package ── */}
            <div className="of-card of-card-fixed">
              <div className="of-spotlight" aria-hidden="true" />
              <div className="of-shimmer"   aria-hidden="true" />
              <span className="of-ghost"    aria-hidden="true">GROOM</span>
              <div className="of-card-bar"  aria-hidden="true" />

              {/* Hero image — swap src for your own asset */}
              <div className="of-image-wrap">
                <Image
                  src="/offer.jpg"
                  alt="Barber performing a signature grooming service"
                  fill
                  sizes="(max-width: 860px) 100vw, 50vw"
                  style={{ objectFit: "cover", objectPosition: "center 30%" }}
                  priority
                />
                <div className="of-price-badge">
                  <span className="of-price-badge-from">Our Price</span>
                  <span className="of-price-badge-num">£44</span>
                </div>
              </div>

              <div className="of-card-body">
                <div className="of-card-top">
                  <span className="of-tag">{FIXED_OFFER.tag}</span>
                  {FIXED_OFFER.expiry && (
                    <span className="of-expiry">{FIXED_OFFER.expiry}</span>
                  )}
                </div>
                <h3 className="of-card-title">{FIXED_OFFER.title}</h3>
                <p className="of-card-desc">{FIXED_OFFER.description}</p>
                <ul className="of-includes">
                  {FIXED_OFFER.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="of-price-footer">
                  <div className="of-price-stack">
                    <span className="of-price-label">Our price</span>
                    <span className="of-price-num" data-count={FIXED_OFFER.price}>
                      {FIXED_OFFER.price}
                    </span>
                    <span className="of-price-pill">Our Price</span>
                  </div>
                  <span className="of-walkin">Walk-ins welcome</span>
                </div>
              </div>
            </div>

            {/* ── CARD 2 — dynamic offer ── */}
            <div className="of-card">
              <div className="of-shimmer"  aria-hidden="true" />
              <span className="of-ghost"   aria-hidden="true">OFFER</span>
              <div className="of-card-bar" aria-hidden="true" />

              <div className="of-card-body">
                <div className="of-card-top">
                  <span className="of-tag-outline">{dynamicOffer.tag}</span>
                  {dynamicOffer.expiry && (
                    <span className="of-expiry">{dynamicOffer.expiry}</span>
                  )}
                </div>
                <h3 className="of-card-title">{dynamicOffer.title}</h3>
                <p className="of-card-desc">{dynamicOffer.description}</p>
                <ul className="of-includes">
                  {dynamicOffer.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="of-price-footer">
                  <div className="of-price-stack">
                    <span className="of-price-label">Our price</span>
                    <span
                      className="of-price-num"
                      data-count={dynamicOffer.price.startsWith("£") ? dynamicOffer.price : undefined}
                    >
                      {dynamicOffer.price}
                    </span>
                    <span className="of-price-pill">Our Price</span>
                  </div>
                  <span className="of-walkin">Walk-ins welcome</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── LOYALTY BANNER ── */}
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