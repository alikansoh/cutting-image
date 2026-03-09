"use client";

import { JSX, useEffect, useRef } from "react";
import Image from "next/image";

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
        observer?.disconnect(); observer = null; loadGSAP();
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
      if (document.querySelector(`script[src*="${filename}"]`)) { setTimeout(resolve, 50); return; }
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

  const loadGSAP = async (): Promise<void> => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
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

    gsap.fromTo(sec.querySelector(".sv-line"), { scaleX: 0 }, {
      scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left",
      scrollTrigger: { trigger: sec, start: "top 76%" },
    });

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
    gsap.fromTo(sec.querySelector(".sv-accent-word"),
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.8, delay: 0.22, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 73%" } }
    );

    gsap.fromTo(sec.querySelectorAll(".sv-fadeup"),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.95, ease: "power2.out",
        scrollTrigger: { trigger: sec.querySelector(".sv-header-right"), start: "top 74%" } }
    );

    gsap.fromTo(sec.querySelector(".sv-cta"),
      { y: 44, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sec.querySelector(".sv-cta"), start: "top 90%" } }
    );

    gsap.to(sec.querySelector(".sv-vbar"), {
      y: -90, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
    });
  };

  return (
    <>
      <style>{`
        :root {
          --cream:      #F5F1E8;
          --cream-s:    #EDE7D6;
          --cream-card: #EFEAD9;
          --charcoal:   #1C1C1C;
          --charcoal-lt:#5A5A5A;
          --charcoal-bd:#4A4A4A;
          --gold:       #C9A227;
          --gold-b:     #E0B83A;
          --gold-dim:   rgba(201,162,39,.10);
          --gold-glow:  rgba(201,162,39,.22);
          --border:     rgba(201,162,39,.18);
        }

        .sv-section *, .sv-section *::before, .sv-section *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .sv-section {
          background: var(--cream); color: var(--charcoal);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .sv-section::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.018; pointer-events: none; z-index: 40;
        }

        .sv-vbar {
          position: absolute; left: 52px; top: -8%;
          width: 2px; height: 118%;
          background: linear-gradient(to bottom, transparent, var(--gold) 25%, var(--gold) 75%, transparent);
          opacity: 0.22; pointer-events: none; z-index: 1;
        }

        .sv-inner { max-width: 1360px; margin: 0 auto; padding: 0 88px; position: relative; z-index: 2; }
        @media (max-width: 960px) { .sv-inner { padding: 0 28px; } .sv-vbar { display: none; } }

        /* ── HEADER ── */
        .sv-header {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: center;
          padding: 120px 0 80px; border-bottom: 1px solid var(--border);
        }
        @media (max-width: 960px) { .sv-header { grid-template-columns: 1fr; gap: 48px; padding: 80px 0 60px; } }

        .sv-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .sv-eyebrow-label { font-size: 10.5px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold); }
        .sv-line { width: 72px; height: 1px; background: var(--gold); transform: scaleX(0); transform-origin: left; }

        .sv-hline {
          display: block; overflow: hidden; font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92;
          letter-spacing: 0.025em; color: var(--charcoal);
        }
        .sv-accent-word {
          display: block; overflow: hidden; font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92;
          letter-spacing: 0.025em; color: var(--gold);
        }

        .sv-header-right { padding-top: 12px; }
        .sv-body {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(1.15rem, 1.6vw, 1.35rem);
          font-weight: 600; font-style: italic; line-height: 1.85;
          color: var(--charcoal-bd); margin-bottom: 22px; -webkit-font-smoothing: antialiased;
        }
        .sv-note { display: block; font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--charcoal-lt); margin-bottom: 30px; }
        .sv-link {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); text-decoration: none;
          border-bottom: 1px solid rgba(201,162,39,0.38); padding-bottom: 5px;
          transition: gap .35s, color .3s, border-color .3s;
        }
        .sv-link:hover { gap: 22px; color: var(--gold-b); border-color: var(--gold-b); }
        .sv-link svg { transition: transform .35s; }
        .sv-link:hover svg { transform: translateX(5px); }

        /* ══════════════════════════════════════════════
           CARDS GRID
        ══════════════════════════════════════════════ */
        .sv-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: var(--border);
          margin: 0;
        }
        @media (max-width: 800px) { .sv-cards { grid-template-columns: 1fr; } }

        /* ── CARD BASE ── */
        .sv-card {
          background: var(--cream-card);
          position: relative;
          overflow: hidden;
          display: block;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          opacity: 0;
          transition:
            background 0.45s ease,
            box-shadow  0.45s ease,
            transform   0.45s ease;
          will-change: transform;
        }

        /* Hover: lift + subtle warm darken */
        .sv-card:hover {
          background: #E8E0CB;
          box-shadow:
            0 16px 56px rgba(0,0,0,0.09),
            0  4px 16px rgba(0,0,0,0.05),
            inset 0 0 0 1px rgba(201,162,39,0.28);
          transform: translateY(-4px);
          z-index: 2;
        }

        /* Ambient gold gradient that blooms on hover (top-left) */
        .sv-card::after {
          content: '';
          position: absolute;
          top: -60px; left: -60px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(201,162,39,0.13) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.55s ease;
          pointer-events: none;
          z-index: 0;
        }
        .sv-card:hover::after { opacity: 1; }

        /* Entry animations */
        .sv-cards-ready .sv-card:nth-child(1) { animation: svCardIn 0.85s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .sv-cards-ready .sv-card:nth-child(2) { animation: svCardIn 0.85s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .sv-cards-ready .sv-card:nth-child(3) { animation: svCardIn 0.85s cubic-bezier(0.16,1,0.3,1) 0.31s both; }
        .sv-cards-ready .sv-card:nth-child(4) { animation: svCardIn 0.85s cubic-bezier(0.16,1,0.3,1) 0.44s both; }

        @keyframes svCardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        /* ── BORDER DRAW ── */
        .sv-bl { position: absolute; top: 0; left: 0; width: 2px; height: 0; background: linear-gradient(to bottom, var(--gold-b), var(--gold)); z-index: 10; pointer-events: none; }
        .sv-bt { position: absolute; top: 0; left: 0; height: 2px; width:  0; background: linear-gradient(to right,  var(--gold-b), var(--gold)); z-index: 10; pointer-events: none; }
        .sv-br { position: absolute; top: 0; right: 0; width: 2px; height: 0; background: linear-gradient(to bottom, var(--gold), var(--gold-b)); z-index: 10; pointer-events: none; }
        .sv-bb { position: absolute; bottom: 0; right: 0; height: 2px; width: 0; background: linear-gradient(to left, var(--gold), var(--gold-b)); z-index: 10; pointer-events: none; }

        .sv-cards-ready .sv-card:nth-child(1) .sv-bl { animation: drawH 0.38s ease-out 0.55s forwards; }
        .sv-cards-ready .sv-card:nth-child(1) .sv-bt { animation: drawW 0.38s ease-out 0.93s forwards; }
        .sv-cards-ready .sv-card:nth-child(1) .sv-br { animation: drawH 0.38s ease-out 1.31s forwards; }
        .sv-cards-ready .sv-card:nth-child(1) .sv-bb { animation: drawW 0.38s ease-out 1.69s forwards; }

        .sv-cards-ready .sv-card:nth-child(2) .sv-bl { animation: drawH 0.38s ease-out 0.68s forwards; }
        .sv-cards-ready .sv-card:nth-child(2) .sv-bt { animation: drawW 0.38s ease-out 1.06s forwards; }
        .sv-cards-ready .sv-card:nth-child(2) .sv-br { animation: drawH 0.38s ease-out 1.44s forwards; }
        .sv-cards-ready .sv-card:nth-child(2) .sv-bb { animation: drawW 0.38s ease-out 1.82s forwards; }

        .sv-cards-ready .sv-card:nth-child(3) .sv-bl { animation: drawH 0.38s ease-out 0.81s forwards; }
        .sv-cards-ready .sv-card:nth-child(3) .sv-bt { animation: drawW 0.38s ease-out 1.19s forwards; }
        .sv-cards-ready .sv-card:nth-child(3) .sv-br { animation: drawH 0.38s ease-out 1.57s forwards; }
        .sv-cards-ready .sv-card:nth-child(3) .sv-bb { animation: drawW 0.38s ease-out 1.95s forwards; }

        .sv-cards-ready .sv-card:nth-child(4) .sv-bl { animation: drawH 0.38s ease-out 0.94s forwards; }
        .sv-cards-ready .sv-card:nth-child(4) .sv-bt { animation: drawW 0.38s ease-out 1.32s forwards; }
        .sv-cards-ready .sv-card:nth-child(4) .sv-br { animation: drawH 0.38s ease-out 1.70s forwards; }
        .sv-cards-ready .sv-card:nth-child(4) .sv-bb { animation: drawW 0.38s ease-out 2.08s forwards; }

        @keyframes drawH { from { height: 0; } to { height: 100%; } }
        @keyframes drawW { from { width:  0; } to { width:  100%; } }

        /* Corner dot */
        .sv-corner-dot {
          position: absolute; top: 0; left: 0; width: 5px; height: 5px;
          background: var(--gold-b); border-radius: 50%;
          z-index: 11; pointer-events: none; opacity: 0;
        }
        .sv-cards-ready .sv-card:nth-child(1) .sv-corner-dot { animation: dotFlash 2.2s ease-out 0.55s forwards; }
        .sv-cards-ready .sv-card:nth-child(2) .sv-corner-dot { animation: dotFlash 2.2s ease-out 0.68s forwards; }
        .sv-cards-ready .sv-card:nth-child(3) .sv-corner-dot { animation: dotFlash 2.2s ease-out 0.81s forwards; }
        .sv-cards-ready .sv-card:nth-child(4) .sv-corner-dot { animation: dotFlash 2.2s ease-out 0.94s forwards; }

        @keyframes dotFlash { 0% { opacity: 0; } 5% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }

        /* Shimmer sweep */
        .sv-shimmer { position: absolute; inset: 0; pointer-events: none; z-index: 3; overflow: hidden; }
        .sv-shimmer::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
          background: linear-gradient(105deg, transparent, rgba(201,162,39,0.07) 50%, transparent);
          opacity: 0;
        }
        .sv-cards-ready .sv-card:nth-child(1) .sv-shimmer::after { animation: shimmerSweep 1s ease-out 1.9s forwards; }
        .sv-cards-ready .sv-card:nth-child(2) .sv-shimmer::after { animation: shimmerSweep 1s ease-out 2.0s forwards; }
        .sv-cards-ready .sv-card:nth-child(3) .sv-shimmer::after { animation: shimmerSweep 1s ease-out 2.1s forwards; }
        .sv-cards-ready .sv-card:nth-child(4) .sv-shimmer::after { animation: shimmerSweep 1s ease-out 2.2s forwards; }

        @keyframes shimmerSweep { 0% { left: -100%; opacity: 1; } 100% { left: 150%; opacity: 1; } }

        /* ── CARD INTERIOR ── */
        .sv-card-inner {
          padding: 56px 52px 48px;
          position: relative; z-index: 2;
          display: flex; flex-direction: column; height: 100%;
        }
        @media (max-width: 700px) { .sv-card-inner { padding: 40px 28px 36px; } }

        /* Ghost number — larger, more dramatic */
        .sv-num {
          position: absolute; top: -18px; right: 24px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(7rem, 12vw, 12rem); line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px rgba(28,28,28,0.055);
          pointer-events: none; user-select: none; z-index: 1;
          transition: -webkit-text-stroke-color 0.4s;
        }
        .sv-card:hover .sv-num {
          -webkit-text-stroke-color: rgba(201,162,39,0.12);
        }

        /* ── ICON WRAP — improved ── */
        .sv-icon-wrap {
          width: 72px; height: 72px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.45);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 32px; position: relative; z-index: 2;
          transition: border-color 0.4s, background 0.4s, box-shadow 0.4s, transform 0.4s;
          backdrop-filter: blur(4px);
        }
        .sv-card:hover .sv-icon-wrap {
          border-color: rgba(201,162,39,0.6);
          background: rgba(201,162,39,0.08);
          box-shadow: 0 0 0 6px rgba(201,162,39,0.06), 0 8px 24px rgba(201,162,39,0.12);
          transform: translateY(-3px) rotate(-2deg);
        }
        .sv-icon-wrap img {
          width: 36px; height: 36px;
          filter: invert(62%) sepia(55%) saturate(600%) hue-rotate(5deg) brightness(88%) contrast(90%);
          transition: filter 0.4s, transform 0.4s;
        }
        .sv-card:hover .sv-icon-wrap img {
          filter: invert(72%) sepia(65%) saturate(700%) hue-rotate(5deg) brightness(95%) contrast(95%);
          transform: scale(1.08);
        }

        /* ── CATEGORY BADGE ── */
        .sv-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 9.5px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 14px;
          background: rgba(201,162,39,0.08);
          border: 1px solid rgba(201,162,39,0.2);
          padding: 5px 12px 4px;
          position: relative; z-index: 2;
          width: fit-content;
          transition: background 0.35s, border-color 0.35s;
        }
        .sv-badge::before { content: ''; width: 14px; height: 1px; background: var(--gold); opacity: 0.8; }
        .sv-card:hover .sv-badge { background: rgba(201,162,39,0.14); border-color: rgba(201,162,39,0.4); }

        /* ── TITLE ── */
        .sv-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.7rem, 2.5vw, 2.2rem);
          letter-spacing: 0.06em;
          color: var(--charcoal);
          line-height: 1.05;
          margin-bottom: 12px;
          display: block;
          position: relative; z-index: 2;
          transition: color 0.35s;
        }
        .sv-card:hover .sv-card-title { color: var(--gold); }

        /* Gold underline that expands on hover */
        .sv-title-rule {
          display: block;
          height: 1px;
          background: linear-gradient(to right, var(--gold), transparent);
          width: 28px;
          margin-bottom: 14px;
          transition: width 0.45s ease;
          position: relative; z-index: 2;
        }
        .sv-card:hover .sv-title-rule { width: 64px; }

        /* ── SUBTITLE ── */
        .sv-card-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1.08rem;
          font-weight: 600; line-height: 1.8;
          color: var(--charcoal-bd);
          display: block; margin-bottom: 28px;
          position: relative; z-index: 2;
          -webkit-font-smoothing: antialiased;
          transition: color 0.35s;
        }
        .sv-card:hover .sv-card-sub { color: #3a3a3a; }

        /* ── SERVICE LIST ── */
        .sv-list {
          list-style: none;
          display: flex; flex-direction: column; gap: 7px;
          margin-bottom: 32px;
          position: relative; z-index: 2;
          flex: 1;
        }
        .sv-list li {
          font-size: 0.875rem; font-weight: 500;
          color: var(--charcoal-bd); line-height: 1.5;
          display: flex; align-items: center; gap: 10px;
          padding: 5px 0;
          border-bottom: 1px solid rgba(201,162,39,0.07);
          transition: color 0.25s, padding-left 0.3s;
          -webkit-font-smoothing: antialiased;
        }
        .sv-list li:last-child { border-bottom: none; }
        .sv-list li::before {
          content: '';
          width: 14px; height: 1px;
          background: var(--gold);
          flex-shrink: 0; opacity: 0.65;
          transition: width 0.3s, opacity 0.3s;
        }
        .sv-card:hover .sv-list li { color: #333; padding-left: 2px; }
        .sv-card:hover .sv-list li::before { width: 18px; opacity: 1; }

        /* ── CARD FOOTER ── */
        .sv-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 22px;
          border-top: 1px solid var(--border);
          position: relative; z-index: 2;
          margin-top: auto;
          transition: border-color 0.35s;
        }
        .sv-card:hover .sv-card-footer { border-color: rgba(201,162,39,0.35); }

        .sv-cta-text {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.24em; text-transform: uppercase;
          color: var(--gold);
          transition: color 0.3s, transform 0.35s, letter-spacing 0.35s;
        }
        .sv-card:hover .sv-cta-text {
          color: var(--gold-b);
          transform: translateX(4px);
          letter-spacing: 0.28em;
        }

        /* Arrow button — improved */
        .sv-arrow {
          width: 38px; height: 38px;
          border: 1px solid rgba(201,162,39,0.35);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--gold);
          background: transparent;
          transition: border-color 0.35s, background 0.35s, transform 0.4s, box-shadow 0.4s;
        }
        .sv-card:hover .sv-arrow {
          border-color: var(--gold);
          background: var(--gold);
          color: var(--charcoal);
          transform: translateX(4px) scale(1.08);
          box-shadow: 0 4px 18px rgba(201,162,39,0.35);
        }
        .sv-arrow svg { width: 12px; height: 12px; transition: transform 0.35s; }
        .sv-card:hover .sv-arrow svg { transform: translateX(2px); }

        /* ── CTA SECTION ── */
        .sv-cta { padding: 80px 0 100px; display: flex; align-items: center; justify-content: space-between; gap: 48px; border-top: 1px solid var(--border); }
        @media (max-width: 760px) { .sv-cta { flex-direction: column; align-items: flex-start; padding: 60px 0 80px; } }
        .sv-cta-overline { font-size: 10px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--charcoal-lt); display: block; margin-bottom: 10px; }
        .sv-cta-heading { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.2rem, 4vw, 3.8rem); letter-spacing: 0.05em; color: var(--charcoal); line-height: 1; }
        .sv-cta-right { display: flex; flex-direction: column; align-items: flex-end; gap: 20px; flex-shrink: 0; }
        @media (max-width: 760px) { .sv-cta-right { align-items: flex-start; } }
        .sv-cta-sub { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 600; font-size: 1.15rem; line-height: 1.8; color: var(--charcoal-bd); max-width: 320px; text-align: right; -webkit-font-smoothing: antialiased; }
        @media (max-width: 760px) { .sv-cta-sub { text-align: left; } }

        .sv-btn {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--gold); color: var(--charcoal);
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          padding: 18px 36px; transition: background .3s, box-shadow .3s, gap .35s, transform .25s; white-space: nowrap;
        }
        .sv-btn:hover { background: var(--gold-b); box-shadow: 0 10px 32px rgba(201,162,39,0.38); gap: 22px; transform: translateY(-2px); }
        .sv-btn svg { transition: transform .35s; }
        .sv-btn:hover svg { transform: translateX(5px); }

        .sv-end-rule { height: 1px; background: var(--border); position: relative; z-index: 2; }

        @media (prefers-reduced-motion: reduce) {
          .sv-card { opacity: 1 !important; animation: none !important; transform: none !important; }
          .sv-bl, .sv-bt, .sv-br, .sv-bb { animation: none !important; height: 100%; width: 100%; }
          .sv-shimmer::after, .sv-corner-dot { animation: none !important; opacity: 0; }
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
                <span className="sv-accent-word">Looking Sharp</span>
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
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) { grid.classList.add("sv-cards-ready"); obs.disconnect(); }
      },
      { rootMargin: "0px", threshold: 0.1 }
    );
    obs.observe(grid);
    return () => obs.disconnect();
  }, []);

  void sectionRef;

  return (
    <div className="sv-cards" ref={gridRef}>
      {categories.map(({ num, icon, iconAlt, title, subtitle, services }) => (
        <a key={num} href="/services" className="sv-card" aria-label={`Explore ${title}`}>
          {/* Border draw lines */}
          <span className="sv-bl" aria-hidden="true" />
          <span className="sv-bt" aria-hidden="true" />
          <span className="sv-br" aria-hidden="true" />
          <span className="sv-bb" aria-hidden="true" />
          {/* Corner dot */}
          <span className="sv-corner-dot" aria-hidden="true" />
          {/* Shimmer sweep */}
          <span className="sv-shimmer" aria-hidden="true" />

          <span className="sv-num" aria-hidden="true">{num}</span>
          <div className="sv-card-inner">
            <div className="sv-icon-wrap" aria-hidden="true">
              <Image src={icon} alt={iconAlt} width={36} height={36} />
            </div>

            {/* New: category badge */}
            <span className="sv-badge">Category {num < 10 ? `0${num}` : num}</span>

            <span className="sv-card-title">{title}</span>
            {/* Animated underline rule */}
            <span className="sv-title-rule" aria-hidden="true" />

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