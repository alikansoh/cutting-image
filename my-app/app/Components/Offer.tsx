"use client";

import Image from "next/image";
import { JSX, useEffect, useRef } from "react";

interface Offer {
  id: string;
  tag: string;
  title: string;
  description: string;
  price: string;
  img: string;
  imgAlt: string;
  imgPosition?: string;
  includes: string[];
}

const OFFERS: Offer[] = [
  {
    id: "new-client",
    tag: "First Visit Only",
    title: "Spend £30, Choose Free",
    description:
      "Spend £30 on any service and take home any product from our premium shelf — absolutely free. The perfect introduction to our curated collection.",
    price: "£30",
    img: "/offer.jpg",
    imgAlt: "New client enjoying a premium grooming service",
    imgPosition: "center 30%",
    includes: [
      "Any Service Worth £30+",
      "Premium Product of Your Choice",
      "Expert Consultation",
      "New Customer Welcome Gift",
    ],
  },
  {
    id: "dad-and-son",
    tag: "First Visit Only",
    title: "Dad & Son Cuts",
    description:
      "Father and son both get a premium haircut together on their very first visit. A special bonding experience at an exclusive introductory price.",
    price: "£25",
    img: "/children.jpg",
    imgAlt: "Father and son enjoying haircuts together",
    imgPosition: "center center",
    includes: [
      "Two Signature Haircuts",
      "Professional Styling",
      "First-Visit Family Discount",
      "Walk-ins Welcome",
    ],
  },
  {
    id: "colour-service",
    tag: "First Visit Only",
    title: "Colour, Perms & Highlights",
    description:
      "New customers receive 20% off any colour service, perm, or highlight treatment. Transform your look with our expert colourists at an exclusive rate.",
    price: "20% Off",
    img: "/coloring.jpg",
    imgAlt: "Client receiving a professional colour treatment",
    imgPosition: "center 40%",
    includes: [
      "All Colour Services",
      "Perms & Relaxers",
      "Full & Partial Highlights",
      "Balayage & Ombré",
    ],
  },
];

export default function OffersSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAnimated = useRef(false);
  const hasLoaded = useRef(false);

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
      // safely attempt to kill existing ScrollTriggers if any
      window.ScrollTrigger?.getAll?.()?.forEach((t: { kill?: () => void }) => t.kill?.());
    };
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src: string): Promise<void> =>
    new Promise<void>((resolve) => {
      const filename = src.split("/").pop()!;
      // avoid injecting duplicate scripts by filename
      if (document.querySelector(`script[src*="${filename}"]`)) {
        setTimeout(resolve, 50);
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

  const loadGSAP = async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    // load GSAP and ScrollTrigger from CDN
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");

    initAnimations();
  };

  const initAnimations = () => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;

    if (!gsap || !ST || hasAnimated.current) return;
    hasAnimated.current = true;

    gsap.registerPlugin(ST);

    const sec = sectionRef.current;
    if (!sec) return;

    // Eyebrow line
    gsap.fromTo(
      sec.querySelector(".of-line"),
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: "power3.out",
        transformOrigin: "left",
        scrollTrigger: { trigger: sec, start: "top 78%" },
      }
    );

    // Headline letter-by-letter
    if (window.innerWidth >= 768) {
      sec.querySelectorAll<HTMLElement>(".of-hline").forEach((line) => {
        line.innerHTML = (line.textContent ?? "")
          .split("")
          .map((c) =>
            c.trim() === ""
              ? `<span style="display:inline-block;width:.26em">&nbsp;</span>`
              : `<span class="of-c" style="display:inline-block">${c}</span>`
          )
          .join("");
      });

      gsap.fromTo(
        sec.querySelectorAll(".of-c"),
        { yPercent: 110, rotationX: -40, opacity: 0 },
        {
          yPercent: 0,
          rotationX: 0,
          opacity: 1,
          stagger: 0.02,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: sec, start: "top 75%" },
        }
      );

      gsap.fromTo(
        sec.querySelector(".of-head-gold"),
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: { trigger: sec, start: "top 75%" },
        }
      );
    }

    // Header fade-ups
    gsap.fromTo(
      sec.querySelectorAll(".of-fadeup"),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: sec.querySelector(".of-header"), start: "top 72%" },
      }
    );

    // Cards stagger in
    gsap.fromTo(
      sec.querySelectorAll(".of-card"),
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: sec.querySelector(".of-grid"), start: "top 84%" },
      }
    );

    // Image zoom on hover
    sec.querySelectorAll<HTMLElement>(".of-card").forEach((card) => {
      const img = card.querySelector<HTMLElement>(".of-hero-img");
      if (!img) return;
      card.addEventListener("mouseenter", () => gsap.to(img, { scale: 1.07, duration: 0.9, ease: "power2.out" }));
      card.addEventListener("mouseleave", () => gsap.to(img, { scale: 1, duration: 0.9, ease: "power2.out" }));
    });

    // Parallax vbar
    gsap.to(sec.querySelector(".of-vbar"), {
      y: -80,
      ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
    });
  };

  // Card 1 & 3 = dark charcoal style, Card 2 = cream style
  const isDark = (idx: number) => idx !== 1;

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
          --olive-hi:    #8A9E4A;
        }
        .of-section *, .of-section *::before, .of-section *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
          background: linear-gradient(to bottom, transparent, var(--gold) 30%, var(--olive-hi) 52%, var(--gold) 74%, transparent);
          opacity: 0.2; pointer-events: none; z-index: 1;
        }

        .of-inner { max-width: 1400px; margin: 0 auto; padding: 0 88px; position: relative; z-index: 2; }
        @media (max-width: 960px)  { .of-inner { padding: 0 28px; } .of-vbar { display: none; } }

        /* ── HEADER ── */
        .of-header {
          padding: 120px 0 72px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: end;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 860px) { .of-header { grid-template-columns: 1fr; gap: 36px; padding: 72px 0 52px; } }

        .of-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .of-eyebrow-label { font-size: 10.5px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold); }
        .of-line { width: 72px; height: 1px; background: var(--gold); transform: scaleX(0); }

        .of-hline {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 7.5vw, 8rem); line-height: 0.92; letter-spacing: 0.025em; color: var(--charcoal);
        }
        .of-head-gold {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 7.5vw, 8rem); line-height: 0.92; letter-spacing: 0.025em; color: var(--gold);
        }
        .of-header-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.1rem, 1.4vw, 1.28rem); font-weight: 600; font-style: italic;
          line-height: 1.85; color: var(--charcoal-bd); margin-bottom: 22px; -webkit-font-smoothing: antialiased;
        }
        .of-header-note { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--charcoal-lt); display: block; }

        /* ══════════════════════════
           THREE-COLUMN CARD GRID
        ══════════════════════════ */
        .of-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 56px 0 100px;
          align-items: stretch;
        }
        @media (max-width: 1020px) { .of-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px)  { .of-grid { grid-template-columns: 1fr; gap: 16px; } }

        /* ══════════════════════════
           SHARED CARD BASE
        ══════════════════════════ */
        .of-card {
          display: flex; flex-direction: column;
          overflow: hidden; position: relative;
          transition: box-shadow 0.4s, transform 0.4s;
        }
        .of-card:hover { transform: translateY(-4px); }

        /* dark variant (cards 1 & 3) */
        .of-card--dark { background: var(--charcoal); }
        .of-card--dark:hover { box-shadow: 0 32px 72px rgba(28,28,28,0.32); }

        /* cream variant (card 2) */
        .of-card--cream { background: var(--cream-s); border: 1px solid var(--border); }
        .of-card--cream:hover { background: var(--cream-d); box-shadow: 0 32px 72px rgba(28,28,28,0.08); }

        /* ── HERO IMAGE (all cards) ── */
        .of-img-wrap {
          position: relative; width: 100%; height: 220px;
          overflow: hidden; flex-shrink: 0;
        }
        .of-hero-img { object-fit: cover; }

        /* dark-card image gradient fades into charcoal */
        .of-card--dark .of-img-wrap::after {
          content: ''; position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom, transparent 20%, rgba(28,28,28,0.3) 58%, var(--charcoal) 100%);
        }
        /* cream-card image gradient fades into cream */
        .of-card--cream .of-img-wrap::after {
          content: ''; position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom, transparent 20%, rgba(237,231,214,0.25) 58%, var(--cream-s) 100%);
        }

        /* gold price chip sits at image/body join */
        .of-price-chip {
          position: absolute; bottom: -1px; right: 28px; z-index: 3;
          background: var(--gold); padding: 9px 18px 7px;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .of-chip-label { font-size: 7px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(28,28,28,0.6); }
        .of-chip-num   { font-family: 'Bebas Neue', sans-serif; font-size: 1.9rem; line-height: 0.88; color: var(--charcoal); }

        /* cream card top accent bar */
        .of-cream-top { height: 3px; background: linear-gradient(to right, var(--gold), var(--olive-hi), var(--charcoal)); flex-shrink: 0; }

        /* ══════════════════════════
           SHARED BODY
        ══════════════════════════ */
        .of-body { padding: 28px 30px 32px; display: flex; flex-direction: column; flex: 1; }
        @media (max-width: 700px) { .of-body { padding: 22px 20px 26px; } }

        /* tags */
        .of-tag-row { display: flex; align-items: center; gap: 9px; margin-bottom: 16px; flex-wrap: wrap; }
        .of-tag { font-size: 7.5px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; padding: 5px 11px; display: inline-block; }
        .of-tag--gold          { background: var(--gold); color: var(--charcoal); }
        .of-tag--olive-outline { color: var(--olive-hi); border: 1px solid var(--olive-hi); }
        .of-tag--dark-outline  { color: var(--charcoal-lt); border: 1px solid rgba(28,28,28,0.2); }
        .of-tag--cream-outline { color: rgba(201,162,39,0.7); border: 1px solid rgba(201,162,39,0.3); }

        /* titles */
        .of-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.9rem, 2.5vw, 2.6rem);
          letter-spacing: 0.04em; line-height: 0.95; margin-bottom: 11px;
        }
        .of-title::before { content: ''; display: block; width: 22px; height: 2px; background: var(--gold); margin-bottom: 11px; }
        .of-title--light { color: var(--cream); }
        .of-title--dark  { color: var(--charcoal); }

        /* descriptions */
        .of-desc {
          font-family: 'Cormorant Garamond', serif; font-size: 0.97rem; font-weight: 600;
          font-style: italic; line-height: 1.8; margin-bottom: 18px; -webkit-font-smoothing: antialiased;
        }
        .of-desc--light { color: rgba(245,241,232,0.56); }
        .of-desc--dark  { color: var(--charcoal-bd); }

        /* lists */
        .of-list { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
        .of-list li { display: flex; align-items: center; gap: 11px; font-size: 0.84rem; font-weight: 500; -webkit-font-smoothing: antialiased; }
        .of-list li::before { content: ''; width: 16px; height: 1px; flex-shrink: 0; }
        .of-list--light li { color: rgba(245,241,232,0.74); }
        .of-list--light li::before { background: linear-gradient(to right, var(--gold), var(--olive-hi)); }
        .of-list--dark  li { color: var(--charcoal-bd); }
        .of-list--dark  li::before { background: var(--gold); }

        /* footers */
        .of-footer { margin-top: auto; padding-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .of-footer--light { border-top: 1px solid rgba(201,162,39,0.13); }
        .of-footer--dark  { border-top: 1px solid var(--border); }

        /* walk-in pulse dot */
        .of-walkin { display: flex; align-items: center; gap: 8px; font-size: 8.5px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
        .of-walkin--light { color: rgba(245,241,232,0.26); }
        .of-walkin--dark  { color: var(--charcoal-lt); }
        .of-walkin::before { content: ''; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; animation: pulse 2s ease-in-out infinite; }
        .of-walkin--light::before { background: var(--gold); }
        .of-walkin--dark::before  { background: var(--olive-hi); }
        @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1);} 50%{opacity:.4;transform:scale(1.5);} }

        /* CTA link (dark cards) */
        .of-cta-link {
          display: inline-flex; align-items: center; gap: 9px;
          font-size: 9.5px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); text-decoration: none;
          border-bottom: 1px solid rgba(201,162,39,0.3); padding-bottom: 3px;
          transition: gap 0.3s, color 0.3s, border-color 0.3s;
        }
        .of-cta-link:hover { gap: 15px; color: var(--gold-b); border-color: var(--gold-b); }
        .of-cta-link svg { transition: transform 0.3s; }
        .of-cta-link:hover svg { transform: translateX(4px); }

        /* CTA button (cream card) */
        .of-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--charcoal); color: var(--cream);
          font-family: 'DM Sans', sans-serif; font-size: 9.5px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          padding: 12px 20px; flex-shrink: 0;
          transition: background 0.3s, color 0.3s, gap 0.35s, transform 0.25s;
        }
        .of-cta-btn:hover { background: var(--gold); color: var(--charcoal); gap: 15px; transform: translateY(-1px); }
        .of-cta-btn svg { transition: transform 0.35s; }
        .of-cta-btn:hover svg { transform: translateX(4px); }

        /* price stack (cream card footer) */
        .of-price-stack { display: flex; flex-direction: column; gap: 2px; }
        .of-price-lbl { font-size: 8.5px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--charcoal-lt); }
        .of-price-big { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.4rem, 3.5vw, 3rem); line-height: 0.9; color: var(--gold); }

        /* 20% off display block (card 3) */
        .of-discount-box {
          display: inline-flex; flex-direction: column; align-items: flex-start;
          background: rgba(201,162,39,0.09); border: 1px solid rgba(201,162,39,0.24);
          padding: 12px 18px 10px; margin-bottom: 18px; width: fit-content;
        }
        .of-discount-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 5vw, 4.8rem);
          line-height: 0.85; color: var(--gold); letter-spacing: 0.02em;
        }
        .of-discount-sub { font-size: 7.5px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(201,162,39,0.6); margin-top: 4px; }

        .of-end-rule { height: 1px; background: var(--border); position: relative; z-index: 2; }
        @media (prefers-reduced-motion: reduce) { .of-walkin::before { animation: none; } }
      `}</style>

      <section className="of-section" ref={sectionRef} id="offers">
        <div className="of-vbar" aria-hidden="true" />

        <div className="of-inner">
          {/* ── HEADER ── */}
          <div className="of-header">
            <div>
              <div className="of-eyebrow">
                <span className="of-eyebrow-label">Exclusive Offers</span>
                <span className="of-line" />
              </div>
              <div>
                <span className="of-hline">Special</span>
                <span className="of-head-gold">Promotions</span>
              </div>
            </div>
            <div>
              <p className="of-header-body of-fadeup">
                Three exclusive introductory offers crafted for new customers on their very first visit.
                Walk in, enjoy the experience, and leave knowing you got something truly special.
              </p>
              <span className="of-header-note of-fadeup">
                First visit only · New customers only · Walk-ins always welcome
              </span>
            </div>
          </div>

          {/* ── 3 CARDS SIDE BY SIDE ── */}
          <div className="of-grid">
            {OFFERS.map((offer, idx) => {
              const dark = isDark(idx);
              return (
                <div key={offer.id} className={`of-card ${dark ? "of-card--dark" : "of-card--cream"}`}>

                  {/* cream card top gold bar */}
                  {!dark && <div className="of-cream-top" aria-hidden="true" />}

                  {/* HERO IMAGE — every card */}
                  <div className="of-img-wrap">
                    <Image
                      src={offer.img}
                      alt={offer.imgAlt}
                      fill
                      className="of-hero-img"
                      sizes="(max-width: 600px) 100vw, (max-width: 1020px) 50vw, 33vw"
                      style={{ objectFit: "cover", objectPosition: offer.imgPosition ?? "center center" }}
                      quality={75}
                      priority={idx === 0}
                    />
                    {/* price chip on images (shows price for £-offers, hidden for % offer) */}
                    {offer.price.startsWith("£") && (
                      <div className="of-price-chip">
                        <span className="of-chip-label">From</span>
                        <span className="of-chip-num">{offer.price}</span>
                      </div>
                    )}
                  </div>

                  {/* CARD BODY */}
                  <div className="of-body">
                    <div className="of-tag-row">
                      <span className="of-tag of-tag--gold">{offer.tag}</span>
                      <span className={`of-tag ${dark ? "of-tag--cream-outline" : "of-tag--dark-outline"}`}>
                        New Customers Only
                      </span>
                    </div>

                    {/* For the colour/perm card show the big discount display */}
                    {offer.id === "colour-service" && (
                      <div className="of-discount-box" aria-label="20 percent off">
                        <span className="of-discount-num">20%</span>
                        <span className="of-discount-sub">Off · First Visit</span>
                      </div>
                    )}

                    <h3 className={`of-title ${dark ? "of-title--light" : "of-title--dark"}`}>
                      {offer.title}
                    </h3>
                    <p className={`of-desc ${dark ? "of-desc--light" : "of-desc--dark"}`}>
                      {offer.description}
                    </p>
                    <ul className={`of-list ${dark ? "of-list--light" : "of-list--dark"}`}>
                      {offer.includes.map((item) => <li key={item}>{item}</li>)}
                    </ul>

                    <div className={`of-footer ${dark ? "of-footer--light" : "of-footer--dark"}`}>
                      <span className={`of-walkin ${dark ? "of-walkin--light" : "of-walkin--dark"}`}>
                        Walk-ins welcome
                      </span>

                      {/* cream card gets a solid button, dark cards get a text link */}
                      {!dark ? (
                        <a href="/booking" className="of-cta-btn">
                          Book Now
                          <svg width="15" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
                            <path d="M1 5h14M9 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      ) : (
                        <a href="/booking" className="of-cta-link">
                          Book Now
                          <svg width="15" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
                            <path d="M1 5h14M9 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        <div className="of-end-rule" />
      </section>
    </>
  );
}