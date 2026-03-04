"use client";

import { JSX, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Service {
  name: string;
  detail: string;
  duration: string;
  price: string;
  featured?: boolean;
  featuredTag?: string;
}

interface ServiceCategory {
  id: string;
  title: string;
  image: string;
  services: Service[];
}

const CATEGORIES: ServiceCategory[] = [
  {
    id: "haircuts",
    title: "Haircuts",
    image: "/haircuts.jpg",
    services: [
      {
        name: "Wash, Haircut, Styling & Beard Trim",
        detail: "The complete gentleman's experience — clean, cut, styled and shaped",
        duration: "60 mins",
        price: "£33",
        featured: true,
        featuredTag: "Most Popular",
      },
      {
        name: "Wash, Haircut & Styling",
        detail: "A full wash-and-style experience, tailored to your look",
        duration: "30 mins",
        price: "£18",
      },
      {
        name: "Wash & Haircut",
        detail: "Clean start, sharp finish",
        duration: "30 mins",
        price: "£18",
      },
      {
        name: "Skin Fade",
        detail: "Precision fade blended seamlessly from skin to length",
        duration: "30 mins",
        price: "£21",
      },
      {
        name: "Dry Haircut",
        detail: "Clean and precise — no wash required",
        duration: "30 mins",
        price: "£16",
      },
      {
        name: "Crew Cut",
        detail: "The timeless gentleman's cut, sharp and clean",
        duration: "30 mins",
        price: "£16",
      },
      {
        name: "Clipper Haircut",
        detail: "Quick, clean and consistently precise",
        duration: "30 mins",
        price: "£13",
      },
    ],
  },
  {
    id: "beard",
    title: "Beard & Shave",
    image: "/beard.jpg",
    services: [
      {
        name: "Hot Towel Shave",
        detail: "The classic ritual — warm towel, precise blade, flawless finish",
        duration: "30 mins",
        price: "£16",
        featured: true,
        featuredTag: "Signature Service",
      },
      {
        name: "Beard Trimming & Shaving",
        detail: "Sculpt, define and line up your beard to perfection",
        duration: "30 mins",
        price: "£16",
      },
      {
        name: "Beard Trim",
        detail: "A sharp tidy-up to keep your beard in shape",
        duration: "20 mins",
        price: "£12",
      },
    ],
  },
  {
    id: "colour",
    title: "Colour & Styling",
    image: "/coloring.webp",
    services: [
      {
        name: "Brazilian Blow Dry",
        detail: "Smooth, frizz-free finish that lasts — professional-grade treatment",
        duration: "2 hrs",
        price: "£60",
      },
      {
        name: "Hair Colouring",
        detail: "From subtle tones to bold transformation, applied with precision",
        duration: "1 hr 15 mins",
        price: "£26",
      },
    ],
  },
  {
    id: "children",
    title: "Children",
    image: "/children.jpg",
    services: [
      {
        name: "Boys — Dry Haircut",
        detail: "Sharp, age-appropriate cuts for boys of all ages",
        duration: "20 mins",
        price: "£12",
      },
      {
        name: "Boys — Wash & Haircut",
        detail: "A full wash-and-style for younger gentlemen",
        duration: "30 mins",
        price: "£14",
      },
    ],
  },
  {
    id: "waxing",
    title: "Waxing & Facials",
    image: "/waxing.jpg",
    services: [
      {
        name: "Men's Facial",
        detail: "A deep-cleansing facial treatment to refresh and restore",
        duration: "45 mins",
        price: "£30",
      },
      {
        name: "Men's Waxing",
        detail: "Clean, precise and professionally done",
        duration: "30 mins",
        price: "POA",
      },
    ],
  },
];

const TABS = [
  { id: "all",      label: "All" },
  { id: "haircuts", label: "Haircuts" },
  { id: "beard",    label: "Beard & Shave" },
  { id: "colour",   label: "Colour & Styling" },
  { id: "children", label: "Children" },
  { id: "waxing",   label: "Waxing & Facials" },
];

export default function ServicesSection(): JSX.Element {
  const sectionRef  = useRef<HTMLElement>(null);
  const heroRef     = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const hasLoaded   = useRef(false);

  const [activeTab, setActiveTab] = useState<string>("all");

  const visible = activeTab === "all"
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.id === activeTab);

  const loadScript = (src: string): Promise<void> =>
    new Promise<void>((resolve) => {
      const filename = src.split("/").pop()!;
      if (document.querySelector(`script[src*="${filename}"]`)) { setTimeout(resolve, 50); return; }
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

  const initAnimations = () => {
    const gsap = window.gsap;
    const ST   = window.ScrollTrigger;
    if (!gsap || !ST || hasAnimated.current) return;
    hasAnimated.current = true;
    gsap.registerPlugin(ST);

    const sec  = sectionRef.current;
    const hero = heroRef.current;
    if (!sec || !hero) return;
    const isMobile = window.innerWidth < 768;

    gsap.fromTo(sec.querySelector(".sv-line"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.6, ease: "expo.out", transformOrigin: "left",
        scrollTrigger: { trigger: hero, start: "top 82%" } }
    );

    if (!isMobile) {
      sec.querySelectorAll<HTMLElement>(".sv-hline").forEach((line) => {
        line.innerHTML = (line.textContent ?? "").split("").map((c) =>
          c.trim() === ""
            ? `<span style="display:inline-block;width:.26em">&nbsp;</span>`
            : `<span class="sv-c" style="display:inline-block">${c}</span>`
        ).join("");
      });
      gsap.fromTo(sec.querySelectorAll(".sv-c"),
        { yPercent: 120, rotationX: -50, opacity: 0 },
        { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.016, duration: 0.72, ease: "expo.out",
          scrollTrigger: { trigger: hero, start: "top 80%" } }
      );
      gsap.fromTo(sec.querySelector(".sv-head-gold"),
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, delay: 0.14, ease: "expo.out",
          scrollTrigger: { trigger: hero, start: "top 80%" } }
      );
    }

    gsap.fromTo(sec.querySelectorAll(".sv-fadeup"),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: hero, start: "top 72%" } }
    );

    gsap.fromTo(sec.querySelectorAll(".sv-section-head"),
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.15, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 88%" } }
    );

    gsap.fromTo(sec.querySelectorAll(".sv-card"),
      { y: 55, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.04, duration: 0.85, ease: "expo.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 85%" } }
    );

    gsap.fromTo(sec.querySelector(".sv-cta"),
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: sec.querySelector(".sv-cta"), start: "top 90%" } }
    );

    if (!isMobile) {
      gsap.to(sec.querySelector(".sv-vbar"), {
        y: -100, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
      });
      gsap.to(sec.querySelector(".sv-ghost"), {
        x: -70, ease: "none",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 3 },
      });
    }
  };

  const loadGSAP = async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
    initAnimations();
  };

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { observer.disconnect(); loadGSAP(); } },
      { rootMargin: "300px", threshold: 0.01 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    if (!hasAnimated.current) return;
    const gsap = window.gsap;
    if (!gsap) return;
    const cards = gridRef.current?.querySelectorAll<HTMLElement>(".sv-card");
    if (!cards?.length) return;
    gsap.fromTo(cards,
      { y: 44, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.045, duration: 0.75, ease: "expo.out" }
    );
  }, [activeTab]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap');

        :root {
          --gold:        #C9A84C;
          --gold-light:  #F0D878;
          --gold-dim:    #6B4F16;
          --ink:         #070604;
          --ink2:        #0C0B09;
          --warm:        #F0EAD6;
          --muted:       #635A47;
          --muted2:      #8C7F68;
          --border:      rgba(201,168,76,0.16);
          --border2:     rgba(201,168,76,0.07);
        }

        .sv-section *, .sv-section *::before, .sv-section *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        .sv-section {
          background: var(--ink);
          color: var(--warm);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .sv-section::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 40;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.038;
        }

        .sv-vbar {
          position: absolute; left: 48px; top: -5%;
          width: 1px; height: 115%;
          background: linear-gradient(to bottom, transparent 5%, var(--gold) 30%, var(--gold) 70%, transparent 95%);
          opacity: 0.18; pointer-events: none; z-index: 1;
        }
        .sv-ghost {
          position: absolute; right: -1%; bottom: -3%;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(10rem, 22vw, 24rem);
          line-height: 0.8; color: transparent;
          -webkit-text-stroke: 1px rgba(201,168,76,0.035);
          pointer-events: none; user-select: none; z-index: 0; white-space: nowrap;
        }

        .sv-inner { max-width: 1400px; margin: 0 auto; padding: 0 92px; position: relative; z-index: 2; }
        @media (max-width: 1024px) { .sv-inner { padding: 0 32px; } }
        @media (max-width: 768px)  { .sv-inner { padding: 0 20px; } .sv-vbar { display: none; } }

        /* ── HERO ── */
        .sv-hero {
          padding: 130px 0 88px;
          display: grid; grid-template-columns: 1.1fr 1fr;
          gap: 80px; align-items: end;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 900px) { .sv-hero { grid-template-columns: 1fr; gap: 40px; padding: 90px 0 56px; } }

        .sv-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .sv-eyebrow-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--gold);
        }
        .sv-line {
          width: 80px; height: 1px;
          background: linear-gradient(to right, var(--gold), rgba(201,168,76,0.1));
          transform-origin: left;
        }

        .sv-hline {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4.2rem, 10vw, 9.5rem);
          line-height: 0.88; letter-spacing: 0.02em; color: var(--warm);
        }
        .sv-head-gold {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4.2rem, 10vw, 9.5rem);
          line-height: 0.88; letter-spacing: 0.02em;
          background: linear-gradient(118deg, var(--gold-dim) 0%, var(--gold) 28%, var(--gold-light) 52%, var(--gold) 76%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }

        .sv-hero-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.22rem, 1.75vw, 1.46rem);
          font-weight: 700; font-style: italic;
          line-height: 1.86; color: var(--warm);
          margin-bottom: 30px; -webkit-font-smoothing: antialiased;
        }
        .sv-hero-note {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--muted); display: block;
          padding-left: 16px; border-left: 2px solid rgba(201,168,76,0.3);
        }

        /* ── TABS ── */
        .sv-tabs-wrap {
          position: sticky; top: 0; z-index: 100;
          background: rgba(7,6,4,0.97);
          backdrop-filter: blur(18px) saturate(1.5);
          border-bottom: 1px solid var(--border);
        }
        .sv-tabs {
          max-width: 1400px; margin: 0 auto; padding: 0 92px;
          display: flex; overflow-x: auto; scrollbar-width: none;
        }
        .sv-tabs::-webkit-scrollbar { display: none; }
        @media (max-width: 1024px) { .sv-tabs { padding: 0 32px; } }
        @media (max-width: 768px)  { .sv-tabs { padding: 0 20px; } }

        .sv-tab {
          flex-shrink: 0; background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.24em; text-transform: uppercase; color: var(--muted);
          padding: 20px 20px; position: relative; transition: color 0.22s;
        }
        .sv-tab::after {
          content: ''; position: absolute; bottom: 0; left: 10px; right: 10px; height: 2px;
          background: linear-gradient(to right, var(--gold), var(--gold-light), var(--gold));
          transform: scaleX(0); transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .sv-tab:hover { color: rgba(240,234,214,0.7); }
        .sv-tab[data-active="true"] { color: var(--gold); }
        .sv-tab[data-active="true"]::after { transform: scaleX(1); }

        /* ── GRID ── */
        .sv-grid { padding: 72px 0 0; display: flex; flex-direction: column; gap: 80px; }

        /* ── CATEGORY HEADER ── */
        .sv-section-head {
          display: flex; align-items: center; gap: 22px; margin-bottom: 20px;
        }

        /* ── CATEGORY THUMBNAIL (96×96) ── */
        .sv-cat-thumb {
          position: relative;
          width: 96px;
          height: 96px;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .sv-cat-thumb img {
          object-fit: cover;
          filter: grayscale(30%) brightness(0.6) sepia(18%);
          transition: filter 0.5s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .sv-cat-thumb::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .sv-section-head:hover .sv-cat-thumb img {
          filter: grayscale(10%) brightness(0.78) sepia(10%);
          transform: scale(1.08);
        }

        .sv-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.6rem);
          letter-spacing: 0.04em; color: var(--warm); line-height: 1; flex-shrink: 0;
        }
        .sv-section-count {
          font-size: 8px; font-weight: 800; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--muted);
          border: 1px solid var(--border); padding: 4px 10px; flex-shrink: 0;
        }
        .sv-section-rule {
          flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(201,168,76,0.2), transparent);
        }

        /* ── SERVICE CARDS (no thumbnail) ── */
        .sv-cards { display: flex; flex-direction: column; }

        .sv-card {
          display: grid;
          grid-template-columns: 1fr 110px 130px;
          align-items: stretch;
          position: relative; overflow: hidden;
          cursor: default;
          border-bottom: 1px solid var(--border2);
          transition: background 0.4s ease;
        }
        .sv-card:first-child { border-top: 1px solid var(--border2); }
        .sv-card:hover { background: rgba(201,168,76,0.038); }

        .sv-card::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, transparent, var(--gold-light), var(--gold), transparent);
          transform: scaleY(0); transform-origin: center;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .sv-card:hover::before { transform: scaleY(1); }

        .sv-card-featured {
          background: linear-gradient(100deg, rgba(201,168,76,0.07) 0%, rgba(201,168,76,0.02) 60%, transparent);
          border-top: 1px solid rgba(201,168,76,0.16) !important;
          border-bottom: 1px solid rgba(201,168,76,0.16) !important;
          margin: 5px 0;
        }
        .sv-card-featured::before { transform: scaleY(1); opacity: 0.75; }
        .sv-card-featured:hover { background: rgba(201,168,76,0.1) !important; }

        /* ── NAME + DESC ── */
        .sv-name-wrap {
          display: flex; flex-direction: column; gap: 7px;
          padding: 22px 28px 22px 22px;
          justify-content: center;
        }
        .sv-name {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(0.95rem, 1.15vw, 1.08rem);
          font-weight: 700;
          color: var(--warm);
          letter-spacing: -0.01em;
          line-height: 1.25;
          transition: color 0.28s;
        }
        .sv-card:hover .sv-name { color: var(--gold-light); }
        .sv-card-featured .sv-name { color: #f5e8bc; }

        .sv-detail {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.02rem;
          font-style: italic;
          font-weight: 700;
          color: var(--muted2);
          line-height: 1.45;
          transition: color 0.28s;
        }
        .sv-card:hover .sv-detail { color: rgba(201,168,76,0.6); }

        .sv-featured-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: linear-gradient(110deg, var(--gold-dim), var(--gold), var(--gold-light));
          font-size: 7.5px; font-weight: 800; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--ink);
          padding: 3px 10px; margin-top: 4px; width: fit-content;
        }
        .sv-featured-tag::before { content: '★'; font-size: 7px; }

        /* ── DURATION ── */
        .sv-duration-wrap {
          display: flex; align-items: center; justify-content: center;
          border-left: 1px solid var(--border2);
          padding: 0 16px;
        }
        .sv-duration {
          font-size: 8px; font-weight: 800; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--muted);
          transition: color 0.28s; text-align: center;
        }
        .sv-card:hover .sv-duration { color: var(--muted2); }

        /* ── PRICE ── */
        .sv-price-wrap {
          display: flex; align-items: center; justify-content: flex-end;
          border-left: 1px solid var(--border2);
          padding: 0 28px 0 20px;
        }
        .sv-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 2.8vw, 2.7rem);
          letter-spacing: 0.03em;
          background: linear-gradient(118deg, var(--gold) 0%, var(--gold-light) 55%, var(--gold) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          white-space: nowrap; line-height: 1;
          transition: filter 0.28s;
        }
        .sv-card:hover .sv-price { filter: brightness(1.14); }

        @media (max-width: 640px) {
          .sv-card { grid-template-columns: 1fr auto; }
          .sv-name-wrap { padding: 16px 14px; }
          .sv-duration-wrap { display: none; }
          .sv-price-wrap { border-left: none; padding: 0 16px 0 8px; }
          .sv-cat-thumb { width: 68px; height: 68px; }
        }

        /* ── CTA ── */
        .sv-cta {
          margin: 96px 0 0;
          display: grid; grid-template-columns: 1fr 1fr;
          border: 1px solid var(--border);
          overflow: hidden;
        }
        @media (max-width: 860px) { .sv-cta { grid-template-columns: 1fr; } }

        .sv-cta-img { position: relative; overflow: hidden; min-height: 400px; }
        .sv-cta-img img {
          object-fit: cover;
          filter: grayscale(25%) brightness(0.5) sepia(20%);
          transition: transform 8s ease;
        }
        .sv-cta:hover .sv-cta-img img { transform: scale(1.05); }
        .sv-cta-img::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(7,6,4,0.1) 0%, rgba(7,6,4,0.6) 80%, var(--ink2) 100%);
        }

        .sv-cta-content {
          background: var(--ink2); padding: 72px 60px;
          display: flex; flex-direction: column; justify-content: center;
          position: relative; overflow: hidden;
        }
        @media (max-width: 860px) { .sv-cta-content { padding: 48px 32px; } .sv-cta-img { min-height: 260px; } }

        .sv-cta-content::before, .sv-cta-content::after {
          content: ''; position: absolute;
          width: 52px; height: 52px;
          border-color: rgba(201,168,76,0.2); border-style: solid;
        }
        .sv-cta-content::before { top: 22px; right: 22px; border-width: 1px 1px 0 0; }
        .sv-cta-content::after  { bottom: 22px; left: 22px; border-width: 0 0 1px 1px; }

        .sv-cta-shimmer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .sv-cta-shimmer::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(108deg, transparent 30%, rgba(201,168,76,0.055) 50%, transparent 70%);
          animation: svShimmer 8s ease infinite;
        }
        @keyframes svShimmer { 0%,100% { transform: translateX(-120%); } 50% { transform: translateX(120%); } }

        .sv-cta-label {
          font-size: 9.5px; font-weight: 800; letter-spacing: 0.3em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 16px; display: block;
        }
        .sv-cta-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.2rem, 5.5vw, 5.8rem);
          letter-spacing: 0.025em; line-height: 0.88; color: var(--warm);
          margin-bottom: 26px; position: relative; z-index: 1;
        }
        .sv-cta-desc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 700;
          font-size: 1.15rem; line-height: 1.86;
          color: rgba(240,234,214,0.78);
          margin-bottom: 36px; position: relative; z-index: 1;
          -webkit-font-smoothing: antialiased;
        }
        .sv-cta-btn {
          display: inline-flex; align-items: center; gap: 16px;
          background: var(--gold); color: var(--ink);
          font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 800;
          letter-spacing: 0.22em; text-transform: uppercase; text-decoration: none;
          padding: 17px 34px; width: fit-content;
          transition: background 0.3s, gap 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.28s;
          position: relative; overflow: hidden; z-index: 1;
        }
        .sv-cta-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent);
          transform: translateX(-100%); transition: transform 0.55s ease;
        }
        .sv-cta-btn:hover { background: var(--gold-light); gap: 24px; transform: translateY(-2px); }
        .sv-cta-btn:hover::before { transform: translateX(100%); }
        .sv-cta-btn svg { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .sv-cta-btn:hover svg { transform: translateX(6px); }

        .sv-end-rule { height: 1px; background: rgba(255,255,255,0.055); position: relative; z-index: 2; }
      `}</style>

      <section className="sv-section" ref={sectionRef} id="services">
        <div className="sv-vbar" aria-hidden="true" />

        {/* ── HERO ── */}
        <div className="sv-inner">
          <div className="sv-hero" ref={heroRef}>
            <div>
              <div className="sv-eyebrow">
                <span className="sv-eyebrow-label">Cutting Image</span>
                <span className="sv-line" />
              </div>
              <div>
                <span className="sv-hline">The Art of</span>
                <span className="sv-head-gold">Grooming</span>
              </div>
            </div>
            <div>
              <p className="sv-hero-body sv-fadeup">
                The full range of precision grooming — from signature cuts to hot
                towel shaves. Every service delivered with craft, character and care
                by our experienced team.
              </p>
              <span className="sv-hero-note sv-fadeup">
                All services available as walk-in · No appointment necessary
              </span>
            </div>
          </div>
        </div>

        {/* ── STICKY TABS ── */}
        <nav className="sv-tabs-wrap" aria-label="Service categories">
          <div className="sv-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className="sv-tab"
                data-active={activeTab === tab.id ? "true" : "false"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── SERVICE GRID ── */}
        <div className="sv-inner">
          <div className="sv-grid" ref={gridRef}>
            {visible.map((cat) => (
              <div key={cat.id}>

                {/* ── CATEGORY HEADER: 96×96 thumb + title + count + rule ── */}
                <div className="sv-section-head">
                  <div className="sv-cat-thumb">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      style={{ objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                  <h2 className="sv-section-title">{cat.title}</h2>
                  <span className="sv-section-count">{cat.services.length} Services</span>
                  <div className="sv-section-rule" />
                </div>

                {/* ── SERVICE ROWS ── */}
                <div className="sv-cards">
                  {cat.services.map((svc) => (
                    <div
                      key={svc.name}
                      className={`sv-card${svc.featured ? " sv-card-featured" : ""}`}
                    >
                      <div className="sv-name-wrap">
                        <span className="sv-name">{svc.name}</span>
                        <span className="sv-detail">{svc.detail}</span>
                        {svc.featured && svc.featuredTag && (
                          <span className="sv-featured-tag">{svc.featuredTag}</span>
                        )}
                      </div>
                      <div className="sv-duration-wrap">
                        <span className="sv-duration">{svc.duration}</span>
                      </div>
                      <div className="sv-price-wrap">
                        <span className="sv-price">{svc.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className="sv-cta">
            <div className="sv-cta-img">
              <Image
                src="/about.webp"
                alt="Barber at work"
                fill
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </div>
            <div className="sv-cta-content">
              <div className="sv-cta-shimmer" aria-hidden="true" />
              <span className="sv-cta-label">Walk-ins Always Welcome</span>
              <h3 className="sv-cta-title">Ready for<br />Your Visit?</h3>
              <p className="sv-cta-desc">
                No appointment needed — simply walk in. Or book your slot online
                and skip the wait. Our doors are always open.
              </p>
              <a href="/book" className="sv-cta-btn">
                Book Now
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                  <path d="M1 5h16M11 1l6 4-6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="sv-end-rule" />
        <span className="sv-ghost" aria-hidden="true">SERVICES</span>
      </section>
    </>
  );
}