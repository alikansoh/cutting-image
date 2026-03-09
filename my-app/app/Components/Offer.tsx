"use client";

import Image from "next/image";
import { JSX, useEffect, useRef, useState } from "react";

interface Offer {
  id: string;
  tag: string;
  title: string;
  description: string;
  price: string;
  includes: string[];
  expiry?: string;
}

const FIXED_OFFER: Offer = {
  id: "grooming-package",
  tag: "Special Offer",
  title: "The Grooming Package",
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

const FALLBACK_DYNAMIC: Offer = {
  id: "dynamic",
  tag: "Limited Time",
  title: "The Gentleman Package",
  description:
    "Our most complete grooming ritual. Cut, beard, hot shave — the full experience for the discerning man.",
  price: "£70",
  includes: [
    "Signature Cut",
    "Beard Sculpt",
    "Hot Towel Shave",
    "Complimentary Drink",
  ],
  expiry: "Ends 31 Mar",
};

export default function OffersSection(): JSX.Element {
  const sectionRef  = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const hasLoaded   = useRef(false);
  const [dynamicOffer, setDynamicOffer] = useState<Offer>(FALLBACK_DYNAMIC);

  useEffect(() => {
    // const res  = await fetch("/api/offers/current");
    // const data = await res.json();
    // setDynamicOffer(data);
  }, []);

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

  const loadGSAP = async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
    initAnimations();
  };

  const initAnimations = () => {
    const gsap = window.gsap;
    const ST   = window.ScrollTrigger;
    if (!gsap || !ST || hasAnimated.current) return;
    hasAnimated.current = true;
    gsap.registerPlugin(ST);
    const sec = sectionRef.current;
    if (!sec) return;

    gsap.fromTo(sec.querySelector(".of-line"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left",
        scrollTrigger: { trigger: sec, start: "top 78%" } }
    );

    if (window.innerWidth >= 768) {
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
    }

    gsap.fromTo(sec.querySelectorAll(".of-fadeup"),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: sec.querySelector(".of-header"), start: "top 72%" } }
    );

    gsap.fromTo(sec.querySelectorAll(".of-card-dark, .of-card-light"),
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.18, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: sec.querySelector(".of-grid"), start: "top 84%" } }
    );

    sec.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const raw = el.dataset.count ?? "";
      if (raw.startsWith("£")) {
        const num = parseInt(raw.replace("£", ""), 10);
        if (!isNaN(num)) {
          const obj = { val: 0 };
          gsap.to(obj, { val: num, duration: 1.6, ease: "power2.out",
            onUpdate: () => { el.textContent = "£" + Math.round(obj.val); },
            scrollTrigger: { trigger: el, start: "top 88%" } });
        }
      }
    });

    const card1 = sec.querySelector<HTMLElement>(".of-card-dark");
    const img1  = card1?.querySelector<HTMLImageElement>(".of-hero-img");
    if (card1 && img1) {
      card1.addEventListener("mouseenter", () => gsap.to(img1, { scale: 1.05, duration: 0.8, ease: "power2.out" }));
      card1.addEventListener("mouseleave", () => gsap.to(img1, { scale: 1,    duration: 0.8, ease: "power2.out" }));
    }

    gsap.fromTo(sec.querySelector(".of-banner"),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sec.querySelector(".of-banner"), start: "top 90%" } }
    );

    gsap.to(sec.querySelector(".of-vbar"), {
      y: -80, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
    });
  };

  return (
    <>
      <style>{`
        :root {
          --cream:       #F5F1E8;
          --cream-s:     #EDE7D6;
          --cream-d:     #E3D9C5;
          --charcoal:    #1C1C1C;
          --charcoal-lt: #5A5A5A;
          --charcoal-bd: #4A4A4A;
          --gold:        #C9A227;
          --gold-b:      #E0B83A;
          --border:      rgba(201,162,39,0.18);
        }

        .of-section *, .of-section *::before, .of-section *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .of-section {
          background: var(--cream); color: var(--charcoal);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .of-section::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.018; pointer-events: none; z-index: 40;
        }

        .of-vbar {
          position: absolute; left: 52px; top: -8%; width: 2px; height: 118%;
          background: linear-gradient(to bottom, transparent, var(--gold) 25%, var(--gold) 75%, transparent);
          opacity: 0.2; pointer-events: none; z-index: 1;
        }

        .of-inner { max-width: 1360px; margin: 0 auto; padding: 0 88px; position: relative; z-index: 2; }
        @media (max-width: 960px) { .of-inner { padding: 0 28px; } .of-vbar { display: none; } }

        /* ── HEADER ── */
        .of-header {
          padding: 120px 0 80px; display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: end; border-bottom: 1px solid var(--border);
        }
        @media (max-width: 960px) { .of-header { grid-template-columns: 1fr; gap: 40px; padding: 80px 0 60px; } }

        .of-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .of-eyebrow-label { font-size: 10.5px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold); }
        .of-line { width: 72px; height: 1px; background: var(--gold); transform: scaleX(0); }

        .of-hline {
          display: block; overflow: hidden; font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92;
          letter-spacing: 0.025em; color: var(--charcoal);
        }
        .of-head-gold {
          display: block; overflow: hidden; font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92; letter-spacing: 0.025em;
          color: var(--gold);
        }
        .of-header-right { padding-bottom: 4px; }
        .of-header-body {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(1.15rem, 1.6vw, 1.35rem);
          font-weight: 600; font-style: italic; line-height: 1.85; color: var(--charcoal-bd);
          margin-bottom: 28px; -webkit-font-smoothing: antialiased;
        }
        .of-header-note { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--charcoal-lt); display: block; }

        /* ── CARD GRID ── */
        .of-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 60px 0 0; }
        @media (max-width: 860px) { .of-grid { grid-template-columns: 1fr; gap: 20px; } }

        /* ═══════════════════════════════════════════
           CARD 1 — DARK HERO CARD (charcoal)
        ═══════════════════════════════════════════ */
        .of-card-dark {
          background: var(--charcoal); position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          transition: box-shadow 0.4s;
        }
        .of-card-dark:hover { box-shadow: 0 28px 80px rgba(28,28,28,0.28); }

        /* Full-bleed photo */
        .of-dark-img { position: relative; width: 100%; height: 300px; overflow: hidden; flex-shrink: 0; }
        .of-hero-img { object-fit: cover; transition: transform 0.8s ease !important; }
        .of-dark-img::after {
          content: ''; position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom, transparent 20%, rgba(28,28,28,0.4) 60%, var(--charcoal) 100%);
        }

        /* Gold price chip at photo/body junction */
        .of-dark-price-chip {
          position: absolute; bottom: -1px; right: 40px; z-index: 3;
          background: var(--gold); padding: 12px 24px 10px;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .of-dpc-label { font-size: 7.5px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(28,28,28,0.5); }
        .of-dpc-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; line-height: 0.88; color: var(--charcoal); }

        /* Dark body */
        .of-dark-body { padding: 36px 40px 44px; display: flex; flex-direction: column; flex: 1; position: relative; z-index: 2; }
        @media (max-width: 700px) { .of-dark-body { padding: 28px 24px 36px; } }

        .of-dark-tag-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .of-tag-solid { font-size: 8.5px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: var(--charcoal); background: var(--gold); padding: 5px 12px; display: inline-block; }
        .of-expiry-light { font-size: 8.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(201,162,39,0.7); border: 1px solid rgba(201,162,39,0.28); padding: 5px 12px; display: inline-block; }

        .of-dark-title {
          font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.4rem, 4vw, 3.8rem);
          letter-spacing: 0.04em; color: var(--cream); line-height: 0.95; margin-bottom: 16px;
        }
        .of-dark-title::before { content: ''; display: block; width: 28px; height: 2px; background: var(--gold); margin-bottom: 14px; }

        .of-dark-desc {
          font-family: 'Cormorant Garamond', serif; font-size: 1.08rem; font-weight: 600;
          font-style: italic; line-height: 1.8; color: rgba(245,241,232,0.6);
          margin-bottom: 28px; -webkit-font-smoothing: antialiased;
        }

        .of-dark-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
        .of-dark-list li { display: flex; align-items: center; gap: 12px; font-size: 0.88rem; font-weight: 500; color: rgba(245,241,232,0.78); -webkit-font-smoothing: antialiased; }
        .of-dark-list li::before { content: ''; width: 18px; height: 1px; background: linear-gradient(to right, var(--gold), var(--gold-b)); flex-shrink: 0; }

        .of-dark-footer {
          margin-top: auto; padding-top: 28px; border-top: 1px solid rgba(201,162,39,0.14);
          display: flex; align-items: center; justify-content: space-between;
        }
        .of-walkin { display: flex; align-items: center; gap: 8px; font-size: 9.5px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(245,241,232,0.3); }
        .of-walkin::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; animation: walkinPulse 2s ease-in-out infinite; }
        @keyframes walkinPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } }

        .of-dark-cta {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); text-decoration: none;
          border-bottom: 1px solid rgba(201,162,39,0.3); padding-bottom: 4px;
          transition: gap 0.3s, color 0.3s, border-color 0.3s;
        }
        .of-dark-cta:hover { gap: 16px; color: var(--gold-b); border-color: var(--gold-b); }
        .of-dark-cta svg { transition: transform 0.3s; }
        .of-dark-cta:hover svg { transform: translateX(4px); }

        /* ═══════════════════════════════════════════
           CARD 2 — LIGHT CREAM CARD
        ═══════════════════════════════════════════ */
        .of-card-light {
          background: var(--cream-s); position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          border: 1px solid var(--border);
          transition: background 0.4s, box-shadow 0.4s;
        }
        .of-card-light:hover { background: var(--cream-d); box-shadow: 0 28px 80px rgba(28,28,28,0.07); }

        /* Gold top accent bar */
        .of-light-top-bar { height: 3px; background: linear-gradient(to right, var(--gold), var(--gold-b), var(--charcoal)); }

        .of-light-body { padding: 40px 40px 44px; display: flex; flex-direction: column; flex: 1; }
        @media (max-width: 700px) { .of-light-body { padding: 30px 24px 36px; } }

        .of-light-tag-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .of-tag-outline { font-size: 8.5px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold); border: 1px solid var(--gold); padding: 5px 12px; display: inline-block; }
        .of-expiry-dark { font-size: 8.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--charcoal-lt); border: 1px solid rgba(28,28,28,0.18); padding: 5px 12px; display: inline-block; }

        /* Ghost price as large decorative background */
        .of-light-price-ghost {
          font-family: 'Bebas Neue', sans-serif; font-size: clamp(5.5rem, 11vw, 9rem);
          line-height: 0.85; color: transparent;
          -webkit-text-stroke: 1.5px rgba(201,162,39,0.22);
          margin-bottom: 8px; user-select: none; pointer-events: none;
        }

        .of-light-title {
          font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.2rem, 3.5vw, 3.2rem);
          letter-spacing: 0.04em; color: var(--charcoal); line-height: 0.95; margin-bottom: 16px;
        }
        .of-light-title::before { content: ''; display: block; width: 28px; height: 2px; background: var(--gold); margin-bottom: 14px; }

        .of-light-desc {
          font-family: 'Cormorant Garamond', serif; font-size: 1.08rem; font-weight: 600;
          font-style: italic; line-height: 1.8; color: var(--charcoal-bd);
          margin-bottom: 28px; -webkit-font-smoothing: antialiased;
        }

        .of-light-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }
        .of-light-list li { display: flex; align-items: center; gap: 12px; font-size: 0.88rem; font-weight: 500; color: var(--charcoal-bd); -webkit-font-smoothing: antialiased; }
        .of-light-list li::before { content: ''; width: 18px; height: 1px; background: var(--gold); flex-shrink: 0; }

        .of-light-footer {
          margin-top: auto; padding-top: 28px; border-top: 1px solid var(--border);
          display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
        }
        .of-price-stack { display: flex; flex-direction: column; gap: 3px; }
        .of-price-label { font-size: 9.5px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--charcoal-lt); }
        .of-price-big { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 4.5vw, 4.2rem); line-height: 0.9; color: var(--gold); }

        /* Charcoal → gold on hover button */
        .of-light-btn {
          display: inline-flex; align-items: center; gap: 12px;
          background: var(--charcoal); color: var(--cream);
          font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          padding: 15px 28px; flex-shrink: 0;
          transition: background 0.3s, color 0.3s, box-shadow 0.3s, gap 0.35s, transform 0.25s;
        }
        .of-light-btn:hover { background: var(--gold); color: var(--charcoal); box-shadow: 0 8px 28px rgba(201,162,39,0.3); gap: 18px; transform: translateY(-1px); }
        .of-light-btn svg { transition: transform 0.35s; }
        .of-light-btn:hover svg { transform: translateX(4px); }

        /* ── LOYALTY BANNER ── */
        .of-banner-wrap { padding-top: 24px; padding-bottom: 100px; }
        .of-banner {
          background: var(--charcoal); padding: 52px 60px;
          display: flex; align-items: center; justify-content: space-between; gap: 48px;
          position: relative; overflow: hidden;
        }
        @media (max-width: 760px) { .of-banner { flex-direction: column; align-items: flex-start; padding: 40px 32px; gap: 32px; } }
        .of-banner::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold) 20%, var(--gold-b) 50%, var(--gold) 80%, transparent);
        }
        .of-banner::after {
          content: ''; position: absolute; bottom: 20px; right: 28px;
          width: 32px; height: 32px;
          border-bottom: 1px solid rgba(201,162,39,0.22); border-right: 1px solid rgba(201,162,39,0.22);
        }
        .of-banner-left { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
        .of-banner-label { font-size: 10px; font-weight: 500; letter-spacing: 0.26em; text-transform: uppercase; color: var(--gold); }
        .of-banner-headline { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem, 3.5vw, 3.2rem); letter-spacing: 0.04em; color: var(--cream); line-height: 1; }
        .of-banner-right { display: flex; align-items: center; gap: 40px; flex-wrap: wrap; }
        .of-banner-body { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 600; font-size: 1.05rem; line-height: 1.75; color: rgba(245,241,232,0.58); max-width: 300px; -webkit-font-smoothing: antialiased; }
        .of-banner-btn {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--gold); color: var(--charcoal);
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          padding: 17px 34px; flex-shrink: 0;
          transition: background 0.3s, box-shadow 0.3s, gap 0.35s, transform 0.25s;
        }
        .of-banner-btn:hover { background: var(--gold-b); box-shadow: 0 10px 36px rgba(201,162,39,0.4); gap: 22px; transform: translateY(-2px); }
        .of-banner-btn svg { transition: transform 0.35s; }
        .of-banner-btn:hover svg { transform: translateX(5px); }

        .of-end-rule { height: 1px; background: var(--border); position: relative; z-index: 2; }

        @media (prefers-reduced-motion: reduce) { .of-walkin::before { animation: none; } }
      `}</style>

      <section className="of-section" ref={sectionRef} id="offers">
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
                Handpicked offers for gentlemen who expect more. Special packages
                and seasonal rates — crafted to make the finest grooming even more
                rewarding. No booking needed, just walk in.
              </p>
              <span className="of-header-note of-fadeup">
                All offers subject to availability · Walk-ins always welcome
              </span>
            </div>
          </div>
        </div>

        {/* ── CARDS ── */}
        <div className="of-inner">
          <div className="of-grid">

            {/* CARD 1 — Dark charcoal hero card */}
            <div className="of-card-dark">
              <div className="of-dark-img">
                <Image
                  src="/offer.jpg"
                  alt="Barber performing a signature grooming service"
                  fill className="of-hero-img"
                  sizes="(max-width: 860px) 100vw, 50vw"
                  style={{ objectFit: "cover", objectPosition: "center 30%" }}
                  quality={70} priority
                />
                <div className="of-dark-price-chip">
                  <span className="of-dpc-label">Our Price</span>
                  <span className="of-dpc-num" data-count={FIXED_OFFER.price}>{FIXED_OFFER.price}</span>
                </div>
              </div>

              <div className="of-dark-body">
                <div className="of-dark-tag-row">
                  <span className="of-tag-solid">{FIXED_OFFER.tag}</span>
                  {FIXED_OFFER.expiry && <span className="of-expiry-light">{FIXED_OFFER.expiry}</span>}
                </div>
                <h3 className="of-dark-title">{FIXED_OFFER.title}</h3>
                <p className="of-dark-desc">{FIXED_OFFER.description}</p>
                <ul className="of-dark-list">
                  {FIXED_OFFER.includes.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className="of-dark-footer">
                  <span className="of-walkin">Walk-ins welcome</span>
                  <a href="/booking" className="of-dark-cta">
                    Book Now
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
                      <path d="M1 5h14M9 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* CARD 2 — Light cream card */}
            <div className="of-card-light">
              <div className="of-light-top-bar" aria-hidden="true" />
              <div className="of-light-body">
                <div className="of-light-tag-row">
                  <span className="of-tag-outline">{dynamicOffer.tag}</span>
                  {dynamicOffer.expiry && <span className="of-expiry-dark">{dynamicOffer.expiry}</span>}
                </div>
                <div className="of-light-price-ghost" aria-hidden="true">{dynamicOffer.price}</div>
                <h3 className="of-light-title">{dynamicOffer.title}</h3>
                <p className="of-light-desc">{dynamicOffer.description}</p>
                <ul className="of-light-list">
                  {dynamicOffer.includes.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className="of-light-footer">
                  <div className="of-price-stack">
                    <span className="of-price-label">Our price</span>
                    <span className="of-price-big"
                      data-count={dynamicOffer.price.startsWith("£") ? dynamicOffer.price : undefined}>
                      {dynamicOffer.price}
                    </span>
                  </div>
                  <a href="/booking" className="of-light-btn">
                    Book Now
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
                      <path d="M1 5h14M9 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── LOYALTY BANNER ── */}
        <div className="of-inner of-banner-wrap">
          <div className="of-banner">
            <div className="of-banner-left">
              <span className="of-banner-label">Loyalty Reward</span>
              <h3 className="of-banner-headline">Your 5th Visit Is On Us</h3>
            </div>
            <div className="of-banner-right">
              <p className="of-banner-body">
                Every visit earns a stamp. Five stamps and your next haircut is completely free — no strings attached.
              </p>
              <a href="/loyalty" className="of-banner-btn">
                Join the Club
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                  <path d="M1 5h16M11 1l6 4-6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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