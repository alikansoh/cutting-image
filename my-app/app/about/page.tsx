"use client";
import Image from "next/image";
import { JSX, useEffect, useRef } from "react";

/*
  Add to app/layout.tsx <head> (fonts):

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
    media="print" onLoad="this.media='all'"
  />
*/

/* ----------------------
   Data
   ---------------------- */
const BARBERS = [
  { name: "Marcus Reid",  role: "Founder & Master Barber", since: "1990", specialty: "Classic cuts, hot shaves",      index: "01" },
  { name: "Daniel Osei",  role: "Senior Barber",           since: "2005", specialty: "Skin fades, line-ups",          index: "02" },
  { name: "Jamie Torres", role: "Senior Barber",           since: "2011", specialty: "Scissor cuts, beard sculpting", index: "03" },
  { name: "Kwame Asante", role: "Barber",                  since: "2016", specialty: "Tapered fades, afro cuts",      index: "04" },
];

const STATS = [
  { num: "35+",  label: "Years of Mastery", sub: "Est. 1990" },
  { num: "8",    label: "Master Barbers",   sub: "Hand-Selected" },
  { num: "10K+", label: "Happy Clients",    sub: "& Counting" },
];

const PILLARS = [
  { label: "Experience", value: "35+ years of mastery in traditional barbering" },
  { label: "Comfort",    value: "Cold drinks, flat-screens & leather-chrome chairs" },
  { label: "Welcome",    value: "No appointment needed — walk in any time" },
  { label: "Community",  value: "A gentleman\u2019s retreat in the heart of Staines" },
];

const MARQUEE_ITEMS = [
  "Traditional Barbershop", "Est. 1990", "Staines-upon-Thames",
  "Classic Cuts", "Hot Shaves", "Skin Fades", "Beard Sculpting", "Walk-Ins Welcome",
];

/* ----------------------
   GSAP type helpers (no `any`, no global augmentation)
   ---------------------- */
type GsapInstance = {
  registerPlugin: (...args: unknown[]) => void;
  fromTo: (
    targets: Element | Element[] | NodeListOf<Element> | null,
    from: Record<string, unknown>,
    to: Record<string, unknown>
  ) => void;
  set: (targets: unknown, vars: Record<string, unknown>) => void;
};

type ScrollTriggerInstance = {
  getAll: () => Array<{ kill: () => void }>;
};

// Typed accessors — avoid augmenting the global Window interface so we never
// conflict with declarations elsewhere in the codebase.
const getGsap = (): GsapInstance | undefined =>
  (window as unknown as Record<string, unknown>)["gsap"] as GsapInstance | undefined;

const getScrollTrigger = (): ScrollTriggerInstance | undefined =>
  (window as unknown as Record<string, unknown>)["ScrollTrigger"] as ScrollTriggerInstance | undefined;

/* ----------------------
   Component
   ---------------------- */
export default function AboutPage(): JSX.Element {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const hasAnimated = useRef<boolean>(false);
  const hasLoadedScripts = useRef<boolean>(false);

  useEffect(() => {
    void loadGSAP();
    return () => {
      getScrollTrigger()?.getAll().forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src: string): Promise<void> =>
    new Promise((resolve) => {
      const filename = src.split("/").pop()!;
      if (document.querySelector(`script[src*="${filename}"]`)) { setTimeout(resolve, 50); return; }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

  const loadGSAP = async (): Promise<void> => {
    if (hasLoadedScripts.current) return;
    hasLoadedScripts.current = true;
    await Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"),
    ]);
    initAnimations();
  };

  const initAnimations = (): void => {
    const gsap = getGsap();
    const ScrollTrigger = getScrollTrigger();
    if (!gsap || !ScrollTrigger || hasAnimated.current) return;
    hasAnimated.current = true;

    gsap.registerPlugin(ScrollTrigger);

    const page = pageRef.current;
    if (!page) return;

    // Hero char-splitting
    // FIX: For the gold gradient line (.gold), we must NOT use clearProps:"transform,opacity"
    // because that would also clear -webkit-text-fill-color:transparent which the gradient depends on.
    // Instead we split chars, animate, then manually restore only what we touched — or we avoid
    // clearProps on the chars entirely and just let GSAP leave them at their final tween state
    // (yPercent:0, rotationX:0, opacity:1), which is correct without needing clearProps.
    // THE ROOT CAUSE: background-clip:text on a parent does NOT paint through
    // display:inline-block children — each span is its own paint context so the
    // clipped gradient is invisible on the spans.
    // FIX: stamp the gradient CSS directly onto every gold char span at split time.
    const GOLD_SPAN_STYLE = [
      "display:inline-block",
      "will-change:transform,opacity",
      "background:linear-gradient(110deg,#6B4F16 0%,#C9A227 28%,#F0D878 50%,#C9A227 72%,#6B4F16 100%)",
      "-webkit-background-clip:text",
      "background-clip:text",
      "-webkit-text-fill-color:transparent",
    ].join(";");

    page.querySelectorAll<HTMLElement>(".ap-hero-line").forEach((line) => {
      const isGold = line.classList.contains("gold");
      const text = line.textContent ?? "";
      line.innerHTML = Array.from(text).map((c) =>
        c === " "
          ? `<span style="display:inline-block;width:0.28em">&nbsp;</span>`
          : isGold
            ? `<span class="ap-char ap-char-gold" style="${GOLD_SPAN_STYLE}">${escapeHtml(c)}</span>`
            : `<span class="ap-char" style="display:inline-block;will-change:transform,opacity">${escapeHtml(c)}</span>`
      ).join("");
    });

    // Animate non-gold chars with clearProps (safe — no gradient to break)
    const plainChars = page.querySelectorAll<HTMLElement>(".ap-char:not(.ap-char-gold)");
    const goldChars  = page.querySelectorAll<HTMLElement>(".ap-char-gold");

    if (plainChars.length) {
      gsap.fromTo(
        plainChars,
        { yPercent: 115, rotationX: -45, opacity: 0 },
        {
          yPercent: 0, rotationX: 0, opacity: 1,
          stagger: 0.018, duration: 0.9, ease: "power3.out", delay: 0.4,
          // Safe to clearProps here — no gradient on plain cream chars
          clearProps: "transform,opacity",
        }
      );
    }

    if (goldChars.length) {
      // No clearProps — GSAP leaves opacity:1 inline which is harmless.
      // The gradient is stamped on the span's own style so nothing can wipe it.
      gsap.fromTo(
        goldChars,
        { yPercent: 115, rotationX: -45, opacity: 0 },
        {
          yPercent: 0, rotationX: 0, opacity: 1,
          stagger: 0.018, duration: 0.9, ease: "power3.out", delay: 0.4,
        }
      );
    }

    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".ap-hero-sub"),
      { yPercent: 0, opacity: 0 } as Record<string, unknown>,
      { yPercent: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 1.1, clearProps: "opacity" } as Record<string, unknown>
    );

    gsap.fromTo(
      page.querySelector<HTMLElement>(".ap-hero-line-draw"),
      { scaleX: 0 } as Record<string, unknown>,
      { scaleX: 1, duration: 1.6, ease: "power3.out", delay: 1.2, transformOrigin: "left center" } as Record<string, unknown>
    );

    gsap.fromTo(
      page.querySelector<HTMLElement>(".ap-hero-scroll-label"),
      { opacity: 0 } as Record<string, unknown>,
      { opacity: 1, duration: 1, ease: "power2.out", delay: 1.6, clearProps: "opacity" } as Record<string, unknown>
    );

    // Scroll-triggered line draws
    page.querySelectorAll<HTMLElement>(".ap-line-draw").forEach((el) => {
      gsap.fromTo(el, { scaleX: 0 } as Record<string, unknown>, {
        scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left center",
        scrollTrigger: { trigger: el, start: "top 80%" },
      } as Record<string, unknown>);
    });

    // Fade ups
    page.querySelectorAll<HTMLElement>(".ap-fade-up").forEach((el, i) => {
      gsap.fromTo(el, { y: 48, opacity: 0 } as Record<string, unknown>, {
        y: 0, opacity: 1, duration: 1, ease: "power2.out",
        delay: (i % 3) * 0.08, clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 86%" },
      } as Record<string, unknown>);
    });

    // Stat cards
    page.querySelectorAll<HTMLElement>(".ap-stat-card").forEach((el, i) => {
      gsap.fromTo(el, { y: 60, opacity: 0 } as Record<string, unknown>, {
        y: 0, opacity: 1, duration: 1.1, ease: "power3.out",
        delay: i * 0.12, clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 84%" },
      } as Record<string, unknown>);
    });

    // Image wipe + image scale
    page.querySelectorAll<HTMLElement>(".ap-img-wrap").forEach((wrap) => {
      const cover = wrap.querySelector<HTMLElement>(".ap-img-cover");
      const img   = wrap.querySelector<HTMLImageElement>("img");
      if (cover) {
        gsap.fromTo(cover, { scaleX: 1 } as Record<string, unknown>, {
          scaleX: 0, duration: 1.4, ease: "power4.inOut", transformOrigin: "right center",
          scrollTrigger: { trigger: wrap, start: "top 80%" },
        } as Record<string, unknown>);
      }
      if (img) {
        gsap.fromTo(img, { scale: 1.14 } as Record<string, unknown>, {
          scale: 1, duration: 2, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { trigger: wrap, start: "top 80%" },
        } as Record<string, unknown>);
      }
    });

    // Barber cards reveal
    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".ap-barber-card"),
      { y: 80, opacity: 0 } as Record<string, unknown>,
      {
        y: 0, opacity: 1, stagger: 0.13, duration: 1.1, ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: page.querySelector(".ap-barbers-grid"), start: "top 78%" },
      } as Record<string, unknown>
    );

    // CTA
    gsap.fromTo(
      page.querySelector<HTMLElement>(".ap-cta-inner"),
      { y: 50, opacity: 0 } as Record<string, unknown>,
      {
        y: 0, opacity: 1, duration: 1.2, ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: page.querySelector(".ap-cta"), start: "top 80%" },
      } as Record<string, unknown>
    );
  };

  const escapeHtml = (str: string) =>
    str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));

  return (
    <>
      <style>{`
        :root {
          --cream:      #F5F1E8;
          --cream-s:    #EDE7D6;
          --cream-d:    #E3D9C5;
          --charcoal:   #1C1C1C;
          --charcoal-lt:#5A5A5A;
          --gold:       #C9A227;
          --gold-b:     #E0B83A;
          --gold-light: #F0D878;
          --gold-dim:   #6B4F16;
          --border:     rgba(201,162,39,0.18);
          --olive:      #6B7A3A;
          --olive-hi:   #8A9E4A;
          --olive-lo:   #47531F;
          --muted:      var(--charcoal-lt);
          --body-text:  rgba(28,28,28,0.82);
        }

        .ap-page *, .ap-page *::before, .ap-page *::after { box-sizing:border-box; margin:0; padding:0; }

        .ap-page {
          background: var(--cream);
          color: var(--charcoal);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow-x: hidden;
        }
        .ap-page::after {
          content:''; position:fixed; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity:.022; pointer-events:none; z-index:100;
        }

        .ap-inner { max-width:1360px; margin:0 auto; padding:0 80px; position:relative; z-index:2; }
        @media(max-width:900px){ .ap-inner{ padding:0 24px; } }

        /* HERO */
        .ap-hero { min-height:100vh; display:grid; grid-template-rows:1fr auto; position:relative; }
        .ap-hero-bg { position:absolute; inset:0; z-index:0; }
        .ap-hero-bg img { object-fit:cover; }
        .ap-hero-bg::before {
          content:''; position:absolute; inset:0; z-index:1;
          background: linear-gradient(to right, rgba(14,12,10,0.96) 0%, rgba(14,12,10,0.82) 28%, rgba(14,12,10,0.42) 58%, rgba(14,12,10,0.08) 100%);
        }
        .ap-hero-bg::after {
          content:''; position:absolute; inset:0; z-index:2;
          background: linear-gradient(to top, rgba(14,12,10,0.75) 0%, transparent 42%);
        }

        .ap-hero-content { display:flex; flex-direction:column; justify-content:flex-end; padding:0 80px 100px; position:relative; z-index:3; grid-row:1; }
        @media(max-width:900px){ .ap-hero-content{ padding:0 24px 72px; } }

        .ap-hero-eyebrow { display:flex; align-items:center; gap:16px; margin-bottom:32px; }
        .ap-hero-eyebrow-label { font-size:11px; font-weight:600; letter-spacing:0.32em; text-transform:uppercase; color:var(--olive-hi); }
        .ap-hero-line-draw { width:80px; height:1px; background:linear-gradient(90deg, var(--olive-hi), var(--gold)); transform:scaleX(0); transform-origin:left center; }

        .ap-hero-heading { margin-bottom:40px; }

        .ap-hero-line {
          display:block;
          font-family:'Bebas Neue', sans-serif;
          font-size:clamp(6.5rem, 16vw, 18rem);
          line-height:0.85; letter-spacing:0.02em;
          color:var(--cream);
        }

        /*
          The gradient is stamped directly onto each .ap-char-gold span in JS.
          background-clip:text does NOT paint through display:inline-block children,
          so it must live on the span itself, not the parent.
          The parent just stays transparent so no solid colour shows before JS runs.
        */
        .ap-hero-line.gold {
          color: transparent;
        }

        .ap-hero-bottom { display:flex; align-items:flex-end; justify-content:space-between; gap:40px; flex-wrap:wrap; }
        .ap-hero-sub {
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:clamp(1.15rem, 1.6vw, 1.45rem);
          line-height:1.95; color:rgba(245,241,232,0.90); max-width:520px;
        }
        .ap-hero-scroll-label { display:flex; align-items:center; gap:12px; flex-shrink:0; font-size:11px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(245,241,232,0.65); }
        .ap-hero-scroll-line { width:1px; height:52px; background:linear-gradient(to bottom, var(--olive-hi), transparent); animation:ap-scroll-pulse 2.5s ease-in-out infinite; }
        @keyframes ap-scroll-pulse { 0%,100%{opacity:.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.1)} }

        .ap-hero-row {
          grid-row:2; display:flex;
          border-top:1px solid rgba(138,158,74,0.2);
          position:relative; z-index:3;
          background:rgba(14,12,10,0.9); backdrop-filter:blur(14px);
        }
        .ap-hero-tag { padding:20px 40px; border-right:1px solid rgba(138,158,74,0.12); font-size:11px; letter-spacing:0.28em; text-transform:uppercase; color:rgba(245,241,232,0.62); display:flex; align-items:center; gap:10px; }
        .ap-hero-tag-dot { width:6px; height:6px; border-radius:50%; background:var(--olive-hi); flex-shrink:0; animation:ap-dot-blink 3s ease-in-out infinite; }
        @keyframes ap-dot-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @media(max-width:640px){ .ap-hero-tag:nth-child(n+3){display:none;} .ap-hero-tag{padding:16px 20px;} }

        /* MARQUEE */
        .ap-marquee { overflow:hidden; border-bottom:1px solid var(--border); background:var(--charcoal); }
        .ap-marquee-inner { display:flex; width:max-content; animation:ap-marquee-scroll 30s linear infinite; }
        @keyframes ap-marquee-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ap-marquee-track { display:flex; align-items:center; }
        .ap-marquee-item { display:flex; align-items:center; gap:32px; padding:18px 44px; font-family:'Bebas Neue', sans-serif; font-size:1.05rem; letter-spacing:0.22em; color:rgba(138,158,74,0.70); white-space:nowrap; border-right:1px solid rgba(138,158,74,0.1); }
        .ap-marquee-diamond { width:5px; height:5px; background:var(--olive-hi); opacity:.5; transform:rotate(45deg); flex-shrink:0; }

        /* ABOUT SPLIT */
        .ap-about { display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid var(--border); }
        @media(max-width:880px){ .ap-about{grid-template-columns:1fr;} }

        .ap-about-copy { padding:140px 80px; border-right:1px solid var(--border); display:flex; flex-direction:column; justify-content:center; }
        @media(max-width:880px){ .ap-about-copy{padding:72px 24px; border-right:none; border-bottom:1px solid var(--border);} }

        .ap-eyebrow { display:flex; align-items:center; gap:14px; margin-bottom:24px; }
        .ap-eyebrow-label { font-size:11px; font-weight:600; letter-spacing:.28em; text-transform:uppercase; color:var(--olive-hi); }
        .ap-line-draw { height:1px; width:56px; background:linear-gradient(90deg, var(--olive-hi), var(--gold)); transform:scaleX(0); transform-origin:left center; flex-shrink:0; }

        .ap-section-heading { font-family:'Bebas Neue', sans-serif; font-size:clamp(4rem, 7vw, 8rem); line-height:0.88; letter-spacing:0.03em; color:var(--charcoal); margin-bottom:36px; }
        .ap-section-heading .g { background:linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 30%, var(--gold-light) 55%, var(--gold) 75%, var(--gold-dim) 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

        .ap-body { font-family:'Cormorant Garamond', serif; font-style:italic; font-size:clamp(1.15rem, 1.6vw, 1.35rem); line-height:1.95; color:var(--body-text); margin-bottom:20px; }

        .ap-pillars { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:36px; }
        .ap-pillar { padding:22px 24px; border:1px solid var(--border); background:var(--cream-s); position:relative; overflow:hidden; transition:border-color .3s, background .3s; }
        .ap-pillar-label { font-size:10px; letter-spacing:0.28em; text-transform:uppercase; color:var(--olive-hi); margin-bottom:8px; }
        .ap-pillar-value { font-family:'Cormorant Garamond', serif; font-style:italic; font-size:1.02rem; color:var(--body-text); line-height:1.5; }

        .ap-about-visual { position:relative; min-height:640px; overflow:hidden; }
        .ap-about-visual-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(28,28,28,.55) 0%,transparent 50%); z-index:2; }
        .ap-about-visual-badge { position:absolute; bottom:36px; left:36px; z-index:4; }
        .ap-about-visual-year { display:block; font-family:'Bebas Neue', sans-serif; font-size:5.2rem; letter-spacing:0.04em; line-height:1; background:linear-gradient(110deg, var(--olive-hi), var(--gold), var(--gold-light)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .ap-about-visual-since { font-size:10px; letter-spacing:.32em; text-transform:uppercase; color:rgba(245,241,232,.68); }
        .ap-about-visual-addr { position:absolute; bottom:36px; right:36px; z-index:4; background:rgba(28,28,28,.9); border-left:2px solid var(--olive-hi); padding:12px 18px; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--olive-hi); backdrop-filter:blur(8px); }

        .ap-img-wrap { position:relative; overflow:hidden; width:100%; height:100%; }
        .ap-img-cover { position:absolute; inset:0; background:linear-gradient(90deg, var(--olive) 0%, var(--gold) 100%); z-index:3; transform-origin:right center; }

        /* STATS */
        .ap-stats { display:grid; grid-template-columns:repeat(3,1fr); border-bottom:1px solid var(--border); }
        @media(max-width:640px){ .ap-stats{grid-template-columns:1fr;} }

        .ap-stat-card { padding:72px 56px; border-right:1px solid var(--border); position:relative; overflow:hidden; background:var(--cream-s); transition:background .4s; }
        .ap-stat-sub { font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--olive-hi); margin-bottom:12px; display:block; }
        .ap-stat-num { font-family:'Bebas Neue', sans-serif; font-size:clamp(5rem,9vw,9rem); line-height:.9; background:linear-gradient(120deg, var(--gold-dim), var(--gold) 50%, var(--gold-light)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; display:block; margin-bottom:14px; }
        .ap-stat-label { font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--muted); font-weight:600; }

        /* BARBERS */
        .ap-barbers-section { padding:140px 0; border-bottom:1px solid var(--border); }
        .ap-barbers-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); }
        @media(max-width:1000px){ .ap-barbers-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:560px){ .ap-barbers-grid{grid-template-columns:1fr;} }
        .ap-barber-card { position:relative; overflow:hidden; background:var(--cream-s); transition:transform .5s cubic-bezier(.22,1,.36,1); }
        .ap-barber-card:hover{ transform:translateY(-4px); }
        .ap-barber-info { padding:32px 28px 40px; border-top:1px solid var(--border); position:relative; }

        /* CTA */
        .ap-cta { padding:180px 0; text-align:center; position:relative; overflow:hidden; background:var(--charcoal); }
        .ap-cta::before { content:'CUTTING IMAGE'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:'Bebas Neue', sans-serif; font-size:clamp(6rem,17vw,20rem); letter-spacing:.04em; white-space:nowrap; color:rgba(138,158,74,0.04); pointer-events:none; user-select:none; z-index:0; }
        .ap-cta-glow { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:700px; height:400px; background:radial-gradient(ellipse, rgba(138,158,74,0.07) 0%, transparent 70%); pointer-events:none; z-index:0; }
        .ap-cta-inner{ position:relative; z-index:1; }
        .ap-cta-eyebrow { display:inline-flex; align-items:center; gap:16px; font-size:11px; letter-spacing:.32em; text-transform:uppercase; color:var(--olive-hi); margin-bottom:28px; }
        .ap-cta-heading { font-family:'Bebas Neue', sans-serif; font-size:clamp(5rem,12vw,12rem); line-height:.85; letter-spacing:.03em; color:var(--cream); margin-bottom:24px; }
        .ap-cta-sub { font-family:'Cormorant Garamond', serif; font-style:italic; font-size:clamp(1.15rem,1.6vw,1.4rem); color:rgba(245,241,232,.6); max-width:520px; margin:0 auto 56px; line-height:1.95; }
        .ap-btn-primary { display:inline-flex; align-items:center; gap:14px; background:var(--gold); color:var(--charcoal); font-size:12px; font-weight:800; letter-spacing:.28em; text-transform:uppercase; text-decoration:none; padding:18px 52px; transition:background .35s, gap .3s; position:relative; overflow:hidden; }
        .ap-btn-ghost { display:inline-flex; align-items:center; gap:10px; font-size:12px; font-weight:600; letter-spacing:.24em; text-transform:uppercase; color:var(--olive-hi); text-decoration:none; border-bottom:1px solid rgba(138,158,74,.3); padding-bottom:6px; transition:color .3s, border-color .3s, gap .3s; }

        .ap-info-bar { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--border); }
        @media(max-width:640px){ .ap-info-bar{grid-template-columns:1fr;} }
        .ap-info-item { padding:56px 44px; border-right:1px solid var(--border); display:flex; flex-direction:column; gap:14px; position:relative; }
        .ap-info-label { font-size:11px; letter-spacing:.28em; text-transform:uppercase; color:var(--olive-hi); font-weight:600; }
        .ap-info-value { font-family:'Cormorant Garamond', serif; font-style:italic; font-size:1.08rem; line-height:1.7; color:var(--body-text); }

        /* CTA buttons layout */
        .ap-cta-buttons { display:flex; align-items:center; justify-content:center; gap:40px; flex-wrap:wrap; }

        @media(prefers-reduced-motion:reduce){ *{animation:none!important;transition:none!important;} }
      `}</style>

      <div className="ap-page" ref={pageRef}>

        {/* HERO */}
        <section className="ap-hero">
          <div className="ap-hero-bg">
            <Image src="/about2.jpg" alt="Cutting Image barbershop interior" fill priority style={{ objectFit: "cover" }} sizes="100vw" />
          </div>

          <div className="ap-hero-content">
            <div className="ap-hero-eyebrow">
              <span className="ap-hero-eyebrow-label">Cutting Image · Staines · Est. 1990</span>
              <span className="ap-hero-line-draw" />
            </div>

            <div className="ap-hero-heading">
              <span className="ap-hero-line">About</span>
              <span className="ap-hero-line gold">The Shop</span>
            </div>

            <div className="ap-hero-bottom">
              <p className="ap-hero-sub">
                One of the finest traditional gentlemen&apos;s barbers in Staines.
                When you walk into Cutting Image — it&apos;s all about you.
              </p>
              <div className="ap-hero-scroll-label">
                <span className="ap-hero-scroll-line" />
                Scroll
              </div>
            </div>
          </div>

          <div className="ap-hero-row">
            {["Walk-Ins Welcome", "2 Kingston Road, Staines", "Open 7 Days a Week", "Complimentary Drinks"].map((t) => (
              <div key={t} className="ap-hero-tag">
                <span className="ap-hero-tag-dot" />{t}
              </div>
            ))}
          </div>
        </section>

        {/* MARQUEE */}
        <div className="ap-marquee" aria-hidden="true">
          <div className="ap-marquee-inner">
            {[0, 1].map((pass) => (
              <div className="ap-marquee-track" key={pass}>
                {MARQUEE_ITEMS.map((item) => (
                  <div key={`${pass}-${item}`} className="ap-marquee-item">
                    <span className="ap-marquee-diamond" />{item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT SPLIT */}
        <div className="ap-about">
          <div className="ap-about-copy">
            <div className="ap-eyebrow">
              <span className="ap-eyebrow-label">Who We Are</span>
              <span className="ap-line-draw" />
            </div>
            <h2 className="ap-section-heading">
              It&apos;s Always<br /><span className="g">About You</span>
            </h2>
            <p className="ap-body ap-fade-up">
              One of the finest traditional gentlemen&apos;s barbers in Staines. Founded in 1990
              on Kingston Road, Cutting Image was built on the principals of the professional
              traditional barbershop — a vision to give every gentleman a place to call his own.
            </p>
            <p className="ap-body ap-fade-up">
              Our team of highly skilled and extremely experienced barbers take genuine pride
              in their craft. We understand exactly what our clients desire and work to accomplish
              it — leaving every man looking great and feeling very satisfied.
            </p>
            <div className="ap-pillars">
              {PILLARS.map((p) => (
                <div key={p.label} className="ap-pillar ap-fade-up">
                  <div className="ap-pillar-label">{p.label}</div>
                  <div className="ap-pillar-value">{p.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ap-about-visual">
            <div className="ap-img-wrap">
              <div className="ap-img-cover" />
              <Image src="/about.webp" alt="Inside Cutting Image barber shop, Staines" fill style={{ objectFit: "cover" }} sizes="(max-width:880px) 100vw, 50vw" />
            </div>
            <div className="ap-about-visual-overlay" />
            <div className="ap-about-visual-badge">
              <span className="ap-about-visual-year">1990</span>
              <span className="ap-about-visual-since">Est. in Staines</span>
            </div>
            <div className="ap-about-visual-addr">2 Kingston Road · TW18 4LG</div>
          </div>
        </div>

        {/* STATS */}
        <div className="ap-stats">
          {STATS.map((s) => (
            <div key={s.label} className="ap-stat-card">
              <span className="ap-stat-sub">{s.sub}</span>
              <span className="ap-stat-num">{s.num}</span>
              <span className="ap-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <section className="ap-cta">
          <div className="ap-cta-glow" aria-hidden="true" />
          <div className="ap-inner">
            <div className="ap-cta-inner">
              <div className="ap-cta-eyebrow">Book Today</div>
              <h2 className="ap-cta-heading">
                Walk In,<br /><span style={{
                  background: "linear-gradient(110deg, #6B4F16 0%, #C9A227 28%, #F0D878 50%, #C9A227 72%, #6B4F16 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Look Sharp</span>
              </h2>
              <p className="ap-cta-sub">
                No appointment needed. Walk in any time —
                five minutes from Staines station.
              </p>
              <div className="ap-cta-buttons">
                <a href="https://wa.me/447714291508" className="ap-btn-primary">
                  WhatsApp Us
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="/services" className="ap-btn-ghost">
                  View Services
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
                    <path d="M1 4h12M8 1l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}