"use client";
// window.gsap + ScrollTrigger types live in gsap.d.ts at the project root.

import { JSX, useEffect, useRef, useState } from "react";

interface Review {
  id: number;
  author: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    author: "James Whitfield",
    initials: "JW",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely exceptional experience from start to finish. The hot towel shave alone is worth the trip — the attention to detail is unlike anything I've experienced at any other barbershop in Staines. Left feeling like a completely new man.",
    service: "Hot Towel Shave",
  },
  {
    id: 2,
    author: "Marcus Chen",
    initials: "MC",
    rating: 5,
    date: "1 month ago",
    text: "Been coming here for three years and the standard never drops. My barber remembers exactly how I like my fade every single time. The atmosphere is warm, the conversation is great, and the result is always immaculate.",
    service: "Skin Fade",
  },
  {
    id: 3,
    author: "Oliver Thornton",
    initials: "OT",
    rating: 5,
    date: "3 weeks ago",
    text: "Brought my son for his first proper haircut — he was nervous but the team made him feel completely at ease. Walked out grinning ear to ear. This is what a proper barbershop should feel like. Genuine craft and genuine care.",
    service: "Boys First Cut",
  },
  {
    id: 4,
    author: "Daniel Okafor",
    initials: "DO",
    rating: 5,
    date: "5 days ago",
    text: "The luxury facial is something I never thought I'd book, but a friend recommended it and now it's a monthly ritual. Skin feels incredible for weeks. The team are knowledgeable, professional and completely non-judgemental.",
    service: "Men's Luxury Facial",
  },
  {
    id: 5,
    author: "Thomas Hargreaves",
    initials: "TH",
    rating: 5,
    date: "2 months ago",
    text: "Walked in without an appointment on a Saturday afternoon and was seen within 20 minutes. The wash, cut and styling took exactly as long as it needed to — no rushing, no corners cut. Best haircut I've had in years. Highly recommend.",
    service: "Wash, Haircut & Styling",
  },
  {
    id: 6,
    author: "Ravi Sharma",
    initials: "RS",
    rating: 5,
    date: "3 months ago",
    text: "I've visited barbershops across London and nothing comes close to the level of service here in Staines. The beard sculpting is an art form — they understood exactly the shape I was going for from a brief description. Truly masterful.",
    service: "Beard Sculpting",
  },
];

const GOOGLE_RATING = 4.9;
const TOTAL_REVIEWS = 312;

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="rv-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ display: "inline-block" }}
        >
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i < Math.floor(rating) ? "#C9A227" : "rgba(201,162,39,0.2)"}
            stroke="none"
          />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewsSection(): JSX.Element {
  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const hasLoaded   = useRef(false);
  const [active, setActive] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const id = setInterval(() => {
      setActive((p) => (p + 1) % REVIEWS.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  // GSAP load gated behind IntersectionObserver
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

    const sec = sectionRef.current;
    if (!sec) return;

    // Line draw
    gsap.fromTo(sec.querySelector(".rv-line"), { scaleX: 0 }, {
      scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left",
      scrollTrigger: { trigger: sec, start: "top 76%" },
    });

    // Heading chars
    sec.querySelectorAll<HTMLElement>(".rv-hline").forEach((line) => {
      line.innerHTML = (line.textContent ?? "").split("").map((c) =>
        c.trim() === ""
          ? `<span style="display:inline-block;width:.28em">&nbsp;</span>`
          : `<span class="rv-c" style="display:inline-block">${c}</span>`
      ).join("");
    });
    gsap.fromTo(sec.querySelectorAll(".rv-c"),
      { yPercent: 110, rotationX: -40, opacity: 0 },
      { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.022, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 73%" } }
    );
    gsap.fromTo(sec.querySelector(".rv-gold-word"),
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.8, delay: 0.22, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 73%" } }
    );

    // Fade-up elements
    gsap.fromTo(sec.querySelectorAll(".rv-fadeup"),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.95, ease: "power2.out",
        scrollTrigger: { trigger: sec.querySelector(".rv-header"), start: "top 74%" } }
    );

    // Score block pop
    gsap.fromTo(sec.querySelector(".rv-score"),
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.4)",
        scrollTrigger: { trigger: sec.querySelector(".rv-score"), start: "top 82%" } }
    );

    // Gold bar parallax
    gsap.to(sec.querySelector(".rv-vbar"), {
      y: -90, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 },
    });
  };

  return (
    <>
      <style>{`
        :root {
          /* Shared palette — matches About section exactly */
          --main-1:      #1C1C1C;              /* Charcoal Black  */
          --main-2:      #F5F1E8;              /* Warm Cream      */
          --accent:      #C9A227;              /* Gold            */

          /* Derived values */
          --accent-14:   rgba(201,162,39,.14);
          --accent-35:   rgba(201,162,39,.35);
          --accent-60:   rgba(201,162,39,.60);
          --main-1-06:   rgba(28,28,28,.06);
          --main-1-10:   rgba(28,28,28,.10);
          --main-2-94:   rgba(245,241,232,.94);
          --main-2-98:   rgba(245,241,232,.98);
          --muted:       rgba(28,28,28,.55);
          --shadow-main: rgba(28,28,28,.10);
        }

        .rv-section *, .rv-section *::before, .rv-section *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        /* ── Base — cream background ── */
        .rv-section {
          background: var(--main-2); color: var(--main-1);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }

        /* Subtle grain — same as About */
        .rv-section::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: .018; pointer-events: none; z-index: 40;
        }

        /* Gold vertical accent bar — matches About */
        .rv-vbar {
          position: absolute; left: 52px; top: -8%;
          width: 2px; height: 118%;
          background: linear-gradient(to bottom, transparent, var(--accent) 25%, var(--accent) 75%, transparent);
          opacity: .2; pointer-events: none; z-index: 1;
        }

        .rv-inner {
          max-width: 1360px; margin: 0 auto; padding: 0 88px;
          position: relative; z-index: 2;
        }
        @media (max-width: 960px) { .rv-inner { padding: 0 28px; } .rv-vbar { display: none; } }

        /* ── HEADER ── */
        .rv-header {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: center;
          padding: 120px 0 80px; border-bottom: 1px solid var(--accent-14);
        }
        @media (max-width: 960px) { .rv-header { grid-template-columns: 1fr; gap: 48px; padding: 80px 0 60px; } }

        .rv-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .rv-eyebrow-label {
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.24em; text-transform: uppercase; color: var(--accent);
        }
        /* Gold draw line — matches About */
        .rv-line { width: 72px; height: 1px; background: var(--accent); transform: scaleX(0); transform-origin: left; }

        /* Charcoal heading — same as About .ci-heading-line */
        .rv-hline {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92;
          letter-spacing: 0.025em; color: var(--main-1);
        }
        /* Gold accent word — same as About .ci-heading-accent */
        .rv-gold-word {
          display: block; overflow: hidden;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem); line-height: 0.92; letter-spacing: 0.025em;
          color: var(--accent);
        }

        .rv-header-right { padding-top: 12px; }
        /* Body text — charcoal italic, matches About .ci-body-text */
        .rv-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.1rem, 1.5vw, 1.3rem);
          font-weight: 600; font-style: italic; line-height: 1.8;
          color: var(--main-1); margin-bottom: 32px;
          -webkit-font-smoothing: antialiased;
        }

        /* ── SCORE BLOCK — cream surface, charcoal border ── */
        .rv-score {
          display: inline-flex; align-items: center; gap: 24px;
          background: var(--main-2-98);
          border: 1px solid var(--accent-14);
          box-shadow: 0 4px 24px var(--shadow-main);
          padding: 20px 28px;
        }
        /* Charcoal score number — strong on cream */
        .rv-score-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3.8rem; line-height: 1;
          color: var(--main-1);
        }
        .rv-score-detail { display: flex; flex-direction: column; gap: 4px; }
        .rv-score-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
        }
        .rv-google-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted); margin-top: 4px;
        }
        .rv-google-g {
          width: 18px; height: 18px;
          background: #fff; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 1px 4px var(--shadow-main);
        }
        .rv-google-g svg { width: 12px; height: 12px; }

        .rv-stars { display: inline-flex; align-items: center; gap: 2px; }

        /* ── CAROUSEL ── */
        .rv-carousel-wrap { padding: 80px 0 0; position: relative; }

        /* Featured large card */
        .rv-featured {
          display: grid; grid-template-columns: 1fr 1.6fr;
          gap: 1px; background: var(--accent-14); margin-bottom: 1px;
        }
        @media (max-width: 860px) { .rv-featured { grid-template-columns: 1fr; } }

        /* Meta panel — slightly deeper cream */
        .rv-featured-meta {
          background: var(--main-2-98);
          padding: 52px 48px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
          transition: background 0.4s ease;
        }
        /* Ghost initial — charcoal tint */
        .rv-featured-meta::after {
          content: attr(data-initial);
          position: absolute; bottom: -20px; right: -10px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(7rem, 14vw, 12rem); line-height: 1;
          color: transparent; -webkit-text-stroke: 1px rgba(28,28,28,.07);
          pointer-events: none; user-select: none;
        }

        /* Avatar — charcoal fill, cream text, matches About .ci-badge */
        .rv-avatar {
          width: 64px; height: 64px;
          background: var(--main-1);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
          color: var(--accent);
          letter-spacing: 0.05em; margin-bottom: 24px; flex-shrink: 0;
        }
        .rv-author-name {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem;
          letter-spacing: 0.06em; color: var(--main-1); line-height: 1; margin-bottom: 4px;
        }
        .rv-author-date {
          font-size: 10px; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 16px;
        }
        /* Service pill — gold border, gold text */
        .rv-service-pill {
          display: inline-block;
          border: 1px solid var(--accent-35); padding: 5px 12px;
          font-size: 9.5px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--accent);
        }

        /* Text panel — cream base */
        .rv-featured-text {
          background: var(--main-2);
          padding: 52px 56px;
          display: flex; flex-direction: column; justify-content: center;
          position: relative; transition: opacity 0.4s ease;
          border-left: 1px solid var(--accent-14);
        }
        @media (max-width: 700px) { .rv-featured-text { padding: 40px 28px; } .rv-featured-meta { padding: 40px 28px; } }

        /* Gold quote mark */
        .rv-quote-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 7rem; line-height: 0.6; color: var(--accent);
          opacity: 0.3; display: block; margin-bottom: 8px; user-select: none;
        }
        /* Review text — charcoal on cream */
        .rv-review-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.2rem, 1.8vw, 1.5rem); font-weight: 400;
          font-style: italic; line-height: 1.85; color: var(--main-1);
          -webkit-font-smoothing: antialiased;
        }
        .rv-featured-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--accent-14);
        }
        .rv-verified {
          font-size: 9.5px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
          display: flex; align-items: center; gap: 8px;
        }
        .rv-verified::before {
          content: ''; width: 16px; height: 1px; background: var(--accent); opacity: 0.5;
        }

        /* Thumbnail strip */
        .rv-thumbs {
          display: grid; grid-template-columns: repeat(6, 1fr);
          gap: 1px; background: var(--accent-14);
        }
        @media (max-width: 960px) { .rv-thumbs { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 500px) { .rv-thumbs { grid-template-columns: repeat(2, 1fr); } }

        /* Thumb — matches About .ci-pillar pattern */
        .rv-thumb {
          background: var(--main-2); padding: 24px 20px;
          cursor: pointer; position: relative; overflow: hidden;
          transition: background 0.35s ease;
          border: none; text-align: left; color: inherit; width: 100%;
        }
        /* Gold bottom reveal bar — matches About .ci-pillar::after */
        .rv-thumb::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(to right, var(--accent), var(--main-1));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .rv-thumb:hover,
        .rv-thumb.rv-thumb--active { background: var(--main-2-98); }
        .rv-thumb:hover::after,
        .rv-thumb.rv-thumb--active::after { transform: scaleX(1); }

        /* Thumb avatar — charcoal, gold initials */
        .rv-thumb-avatar {
          width: 36px; height: 36px;
          background: var(--main-1);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 0.85rem;
          color: var(--accent); letter-spacing: 0.05em; margin-bottom: 10px;
          transition: transform 0.35s ease;
        }
        .rv-thumb:hover .rv-thumb-avatar,
        .rv-thumb.rv-thumb--active .rv-thumb-avatar { transform: scale(1.1); }

        .rv-thumb-name {
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.06em; color: var(--main-1); display: block;
          margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rv-thumb-snippet {
          font-size: 10px; color: var(--muted);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; line-height: 1.5;
        }

        /* Progress dots */
        .rv-progress {
          display: flex; align-items: center; gap: 8px;
          margin-top: 32px; justify-content: center;
        }
        .rv-dot {
          width: 24px; height: 2px; background: var(--accent-14); cursor: pointer;
          transition: background 0.3s, width 0.4s cubic-bezier(0.16,1,0.3,1);
          border: none;
        }
        .rv-dot.rv-dot--active { background: var(--accent); width: 48px; }

        /* ── CTA ── */
        .rv-cta {
          padding: 80px 0 100px; display: flex;
          align-items: center; justify-content: space-between;
          gap: 48px; border-top: 1px solid var(--accent-14);
        }
        @media (max-width: 760px) { .rv-cta { flex-direction: column; align-items: flex-start; padding: 60px 0 80px; } }

        .rv-cta-overline {
          font-size: 10px; font-weight: 500; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 10px;
        }
        /* CTA heading — charcoal, matches About heading style */
        .rv-cta-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.8rem); letter-spacing: 0.05em;
          color: var(--main-1); line-height: 1;
        }
        .rv-cta-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
        @media (max-width: 760px) { .rv-cta-right { flex-wrap: wrap; } }

        /* Primary button — gold bg, charcoal text (matches About .ci-cta style inverted) */
        .rv-btn-primary {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--main-1); color: var(--main-2);
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          padding: 18px 36px; transition: background .3s, gap .35s, transform .25s;
          white-space: nowrap;
        }
        .rv-btn-primary:hover { background: var(--accent); color: var(--main-1); gap: 22px; transform: translateY(-2px); }

        /* Ghost CTA — matches About .ci-cta exactly */
        .rv-btn-ghost {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent);
          text-decoration: none;
          border-bottom: 1px solid var(--accent-35); padding-bottom: 5px;
          transition: gap .35s, color .3s, border-color .3s; white-space: nowrap;
        }
        .rv-btn-ghost:hover { gap: 20px; color: rgba(201,162,39,.95); border-color: rgba(201,162,39,.95); }
        .rv-btn-ghost svg { transition: transform .35s; }
        .rv-btn-ghost:hover svg { transform: translateX(5px); }

        .rv-end-rule { height: 1px; background: var(--accent-14); position: relative; z-index: 2; }

        .rv-stars { display: inline-flex; align-items: center; gap: 2px; }

        .rv-featured-text { transition: opacity 0.4s ease; }
        .rv-featured-meta { transition: opacity 0.4s ease; }

        @media (prefers-reduced-motion: reduce) {
          .rv-dot { transition: none; }
          .rv-thumb::after { transition: none; }
          .rv-featured-text, .rv-featured-meta { transition: none; }
        }
      `}</style>

      <section className="rv-section" ref={sectionRef} id="reviews">
        <div className="rv-vbar" aria-hidden="true" />

        {/* HEADER */}
        <div className="rv-inner">
          <div className="rv-header">
            {/* Left — heading */}
            <div>
              <div className="rv-eyebrow">
                <span className="rv-eyebrow-label">Client Reviews</span>
                <span className="rv-line" />
              </div>
              <div>
                <span className="rv-hline">What They</span>
                <span className="rv-gold-word">Say About Us</span>
              </div>
            </div>

            {/* Right — copy + score */}
            <div className="rv-header-right">
              <p className="rv-body rv-fadeup">
                Over three decades of craft, care and conversation — our reputation
                is built one client at a time. Here&rsquo;s what the gentlemen of
                Staines say about their experience.
              </p>

              <div className="rv-score rv-fadeup">
                <span className="rv-score-num">{GOOGLE_RATING}</span>
                <div className="rv-score-detail">
                  <Stars rating={GOOGLE_RATING} size={18} />
                  <span className="rv-score-label">{TOTAL_REVIEWS} reviews</span>
                  <span className="rv-google-badge">
                    <span className="rv-google-g">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.805 10.023H12.18v3.955h5.486c-.236 1.267-.955 2.34-2.034 3.06l3.283 2.549c1.916-1.767 3.022-4.368 3.022-7.442 0-.713-.065-1.399-.131-2.122z" fill="#4285F4"/>
                        <path d="M12.18 22c2.756 0 5.07-.913 6.763-2.49l-3.283-2.548c-.912.61-2.083.978-3.48.978-2.674 0-4.94-1.806-5.75-4.237L3.064 16.25C4.736 19.664 8.188 22 12.18 22z" fill="#34A853"/>
                        <path d="M6.43 13.703a5.93 5.93 0 01-.326-1.96c0-.68.117-1.34.326-1.96V6.83H3.065A9.99 9.99 0 002 11.743c0 1.613.39 3.14 1.065 4.508l3.366-2.548z" fill="#FBBC05"/>
                        <path d="M12.18 5.545c1.505 0 2.854.52 3.917 1.527l2.937-2.937C17.241 2.49 14.936 1.5 12.18 1.5c-3.992 0-7.444 2.336-9.115 5.75l3.364 2.611c.81-2.43 3.077-4.316 5.751-4.316z" fill="#EA4335"/>
                      </svg>
                    </span>
                    Google Reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CAROUSEL */}
        <div className="rv-inner">
          <div className="rv-carousel-wrap" ref={trackRef}>

            {/* Featured large review */}
            <div className="rv-featured">
              {/* Meta panel */}
              <div
                className="rv-featured-meta"
                data-initial={REVIEWS[active].initials}
              >
                <div>
                  <div className="rv-avatar">{REVIEWS[active].initials}</div>
                  <div className="rv-author-name">{REVIEWS[active].author}</div>
                  <div className="rv-author-date">{REVIEWS[active].date}</div>
                  <Stars rating={REVIEWS[active].rating} size={15} />
                </div>
                <span className="rv-service-pill">{REVIEWS[active].service}</span>
              </div>

              {/* Text panel */}
              <div className="rv-featured-text">
                <span className="rv-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="rv-review-text">{REVIEWS[active].text}</p>
                <div className="rv-featured-footer">
                  <Stars rating={REVIEWS[active].rating} size={14} />
                  <span className="rv-verified">Verified Google Review</span>
                </div>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="rv-thumbs">
              {REVIEWS.map((r, i) => (
                <button
                  key={r.id}
                  className={`rv-thumb${i === active ? " rv-thumb--active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`View review by ${r.author}`}
                >
                  <div className="rv-thumb-avatar">{r.initials}</div>
                  <span className="rv-thumb-name">{r.author}</span>
                  <span className="rv-thumb-snippet">{r.text}</span>
                </button>
              ))}
            </div>

            {/* Progress dots */}
            <div className="rv-progress" role="tablist" aria-label="Review navigation">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  className={`rv-dot${i === active ? " rv-dot--active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Go to review ${i + 1}`}
                  role="tab"
                  aria-selected={i === active}
                />
              ))}
            </div>

          </div>
        </div>

        {/* CTA */}
        <div className="rv-inner">
          <div className="rv-cta">
            <div className="rv-cta-left">
              <span className="rv-cta-overline">Join them</span>
              <h3 className="rv-cta-heading">Experience It Yourself</h3>
            </div>
            <div className="rv-cta-right">
              <a href="/booking" className="rv-btn-primary">
                Book Appointment
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                  <path d="M1 6h18M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="https://g.co/kgs/example"
                target="_blank"
                rel="noopener noreferrer"
                className="rv-btn-ghost"
              >
                All Reviews
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 7h12M7.5 1.5L13 7l-5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="rv-end-rule" />
      </section>
    </>
  );
}