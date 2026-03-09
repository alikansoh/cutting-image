"use client";
import Image from "next/image";
import { JSX, useEffect, useRef } from "react";

declare global {
  interface Window {
    gsap: {
      set(arg0: unknown, arg1: { scaleX: number }): unknown;
      registerPlugin: (...args: unknown[]) => void;
      fromTo: (targets: Element | Element[] | NodeListOf<Element> | null, from: Record<string, unknown>, to: Record<string, unknown>) => void;
      to: (targets: Element | Element[] | null | Record<string, unknown>, vars: Record<string, unknown>) => void;
    };
    ScrollTrigger: { getAll: () => Array<{ kill: () => void }> };
  }
}

interface Stat   { value: string; label: string }
interface Pillar { num: string; title: string; body: string }

const STATS: Stat[] = [
  { value: "35+",  label: "Years of Excellence" },
  { value: "10K+", label: "Happy Clients"        },
  { value: "8",    label: "Master Barbers"       },
  { value: "4.9★", label: "Average Rating"       },
];

const PILLARS: Pillar[] = [
  { num: "01", title: "Craft",
    body: "Every cut is a signature. Our master barbers blend old-world technique with modern precision — scissors, razors, and instinct honed over decades." },
  { num: "02", title: "Comfort",
    body: "Step in, sit down, cold drink in hand. Leather-and-chrome chairs, flat-screen TVs, and a welcome that feels like home from the first hello." },
  { num: "03", title: "Character",
    body: "Founded in 1990 in the heart of Staines, we carry the soul of the traditional barbershop — the conversation, the ritual, the result." },
];

export default function AboutSection(): JSX.Element {
  const sectionRef       = useRef<HTMLElement>(null);
  const hasAnimated      = useRef(false);
  const hasLoadedScripts = useRef(false);

  useEffect(() => {
    const node = sectionRef.current; if (!node) return;
    let obs: IntersectionObserver | null = new IntersectionObserver(
      (entries) => { if (!entries[0].isIntersecting) return; obs?.disconnect(); obs = null; loadGSAP(); },
      { rootMargin: "300px", threshold: 0.01 }
    );
    obs.observe(node);
    return () => { obs?.disconnect(); window.ScrollTrigger?.getAll().forEach(t => t.kill()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src: string): Promise<void> =>
    new Promise<void>((res) => {
      const fn = src.split("/").pop()!;
      if (document.querySelector(`script[src*="${fn}"]`)) { setTimeout(res, 50); return; }
      const s = document.createElement("script"); s.src = src; s.async = true;
      s.crossOrigin = "anonymous"; s.onload = () => res(); document.head.appendChild(s);
    });

  const loadGSAP = async () => {
    if (hasLoadedScripts.current) return; hasLoadedScripts.current = true;
    await Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"),
    ]);
    initAnimations();
  };

  const initAnimations = () => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger || hasAnimated.current) return;
    hasAnimated.current = true; gsap.registerPlugin(ScrollTrigger);
    const sec = sectionRef.current; if (!sec) return;

    gsap.fromTo(sec.querySelector<HTMLElement>(".ci-line-draw"), { scaleX: 0 }, {
      scaleX:1, duration:1.4, ease:"power3.out", transformOrigin:"left center",
      scrollTrigger:{ trigger:sec, start:"top 75%" },
    });

    sec.querySelectorAll<HTMLElement>(".ci-heading-line").forEach(line => {
      const text = line.textContent ?? "";
      line.innerHTML = text.split("").map(c =>
        c.trim()==="" ? `<span style="display:inline-block;width:.3em"> </span>`
                      : `<span class="ci-char" style="display:inline-block">${c}</span>`
      ).join("");
    });

    const hw = sec.querySelector<HTMLElement>(".ci-heading-wrap");
    if (hw) {
      gsap.fromTo(hw.querySelectorAll<HTMLElement>(".ci-char"),
        { yPercent:115, rotationX:-45, opacity:0 },
        { yPercent:0, rotationX:0, opacity:1, stagger:.025, duration:.85, ease:"power3.out",
          scrollTrigger:{ trigger:sec, start:"top 72%" } });
      gsap.fromTo(hw.querySelector<HTMLElement>(".ci-heading-accent"),
        { yPercent:115, opacity:0 },
        { yPercent:0, opacity:1, duration:.85, delay:.25, ease:"power3.out",
          scrollTrigger:{ trigger:sec, start:"top 72%" } });
    }

    gsap.fromTo(sec.querySelectorAll<HTMLElement>(".ci-fade-up"), { y:55, opacity:0 }, {
      y:0, opacity:1, stagger:.13, duration:1, ease:"power2.out",
      scrollTrigger:{ trigger:sec.querySelector<HTMLElement>(".ci-copy"), start:"top 72%" },
    });

    ([".ci-img-main", ".ci-img-accent"] as const).forEach((sel, i) => {
      const wrap = sec.querySelector<HTMLElement>(sel); if (!wrap) return;
      const cover = wrap.querySelector<HTMLElement>(".ci-img-cover");
      const img   = wrap.querySelector<HTMLImageElement>("img");
      if (cover) gsap.fromTo(cover, { scaleX:1 }, {
        scaleX:0, duration:1.3, delay:i*.2, ease:"power4.inOut", transformOrigin:"right center",
        scrollTrigger:{ trigger:wrap, start:"top 78%" } });
      if (img) gsap.fromTo(img, { scale:1.2 }, {
        scale:1, duration:1.8, delay:i*.2, ease:"power2.out",
        scrollTrigger:{ trigger:wrap, start:"top 78%" } });
    });

    const badge = sec.querySelector<HTMLElement>(".ci-badge");
    const imgM  = sec.querySelector<HTMLElement>(".ci-img-main");
    if (badge) gsap.fromTo(badge, { scale:0, rotation:-15 }, {
      scale:1, rotation:0, duration:.7, ease:"back.out(1.7)", delay:.6,
      scrollTrigger:{ trigger:imgM??sec, start:"top 78%" } });

    sec.querySelectorAll<HTMLElement>(".ci-stat-num").forEach(el => {
      const raw = el.dataset.val ?? "";
      const item = el.closest<HTMLElement>(".ci-stat-item");
      if (item) gsap.fromTo(item, { y:40, opacity:0 }, {
        y:0, opacity:1, duration:.8, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 88%" } });
      if (raw.includes("★")) { el.textContent = raw; return; }
      const match = raw.match(/[\d.]+/); if (!match) { el.textContent = raw; return; }
      const num = parseFloat(match[0]);
      const suffix = raw.replace(/[\d.]+/,"").replace(/K/i,"k");
      const isDec = match[0].includes(".");
      if (!isNaN(num)) {
        const obj = { val:0 };
        gsap.to(obj, { val:num, duration:2.2, ease:"power2.out",
          onUpdate:() => { el.textContent = isDec
            ? (Math.round(obj.val*10)/10).toFixed(1).replace(/\.0$/,"")+suffix
            : Math.round(obj.val)+suffix; },
          scrollTrigger:{ trigger:el, start:"top 88%" } });
      } else { el.textContent = raw; }
    });

    gsap.fromTo(sec.querySelectorAll<HTMLElement>(".ci-pillar"), { x:70, opacity:0 }, {
      x:0, opacity:1, stagger:.15, duration:1, ease:"power3.out",
      scrollTrigger:{ trigger:sec.querySelector<HTMLElement>(".ci-pillars")??sec, start:"top 80%" } });

    const bar = sec.querySelector<HTMLElement>(".ci-side-bar");
    if (bar) gsap.to(bar, { y:-80, ease:"none",
      scrollTrigger:{ trigger:sec, start:"top bottom", end:"bottom top", scrub:2 } });
  };

  return (
    <>
      <style>{`
        :root {
          --ivory:    #FAF7F2;
          --ivory-s:  #F0EBE1;
          --ivory-d:  #E6DDD0;
          --ink:      #1A1208;
          --ink-m:    #3D2E1A;
          --ink-lt:   #5C4A36;
          --ink-body: #4A3828;
          --cr:       #8B1A28;
          --cr-b:     #B02235;
          --cr-dim:   rgba(139,26,40,.12);
          --nv:       #0E1E30;
          --nv-b:     #1A3050;
          --border:   rgba(139,26,40,.14);
        }

        .ci-about *,.ci-about *::before,.ci-about *::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── Light ivory base ── */
        .ci-about {
          background:var(--ivory); color:var(--ink);
          font-family:'DM Sans',sans-serif; position:relative; overflow:hidden;
        }

        /* Subtle grain on ivory */
        .ci-about::after {
          content:''; position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity:.018; pointer-events:none; z-index:50;
        }

        /* Crimson side bar — parallaxes */
        .ci-side-bar {
          position:absolute; left:52px; top:-10%; width:2px; height:120%;
          background:linear-gradient(to bottom,transparent 0%,var(--cr) 25%,var(--cr) 75%,transparent 100%);
          opacity:.2; pointer-events:none; z-index:1;
        }

        .ci-inner { max-width:1360px; margin:0 auto; padding:0 88px; position:relative; z-index:2; }
        @media (max-width:960px) { .ci-inner { padding:0 28px; } .ci-side-bar { display:none; } }

        /* ── Marquee — ivory-s surface ── */
        .ci-marquee {
          overflow:hidden;
          border-top:1px solid var(--border); border-bottom:1px solid var(--border);
          padding:16px 0; background:var(--ivory-s);
        }
        .ci-marquee-track { display:flex; white-space:nowrap; animation:ciMq 24s linear infinite; }
        .ci-marquee-track:hover { animation-play-state:paused; }
        @keyframes ciMq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ci-marquee-item {
          display:inline-flex; align-items:center; gap:18px; padding:0 28px; flex-shrink:0;
          font-family:'Bebas Neue',sans-serif; font-size:1rem; letter-spacing:.14em;
          color:var(--ink-lt);
        }
        /* Alternating crimson / navy dots */
        .ci-mq-dot-cr { width:4px; height:4px; border-radius:50%; background:var(--cr); flex-shrink:0; }
        .ci-mq-dot-nv { width:4px; height:4px; border-radius:50%; background:var(--nv); flex-shrink:0; }

        /* ── Stats ── */
        .ci-stats { display:grid; grid-template-columns:repeat(4,1fr); border-bottom:1px solid var(--border); }
        @media (max-width:700px) { .ci-stats { grid-template-columns:repeat(2,1fr); } }
        .ci-stat-item {
          padding:40px 28px; text-align:center; border-right:1px solid var(--border);
          background:var(--ivory); transition:background .3s;
        }
        .ci-stat-item:hover { background:var(--ivory-s); }
        .ci-stat-item:last-child { border-right:none; }
        /* Navy stat numbers — readable on ivory */
        .ci-stat-num {
          display:block; font-family:'Bebas Neue',sans-serif;
          font-size:clamp(2.6rem,4vw,3.8rem); line-height:1; margin-bottom:6px;
          background:linear-gradient(120deg,#0E1E30,#1A3050);
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
        }
        .ci-stat-label { font-size:10px; font-weight:500; letter-spacing:.2em; text-transform:uppercase; color:var(--ink-lt); }

        /* ── Split ── */
        .ci-split { display:grid; grid-template-columns:1fr 1fr; gap:100px; align-items:center; padding:120px 0; }
        @media (max-width:960px) { .ci-split { grid-template-columns:1fr; gap:60px; padding:80px 0; } }

        .ci-eyebrow { display:flex; align-items:center; gap:14px; margin-bottom:30px; }
        .ci-eyebrow-label { font-size:10.5px; font-weight:500; letter-spacing:.24em; text-transform:uppercase; color:var(--cr); font-family:'DM Sans',sans-serif; }
        /* Crimson draw line */
        .ci-line-draw { width:72px; height:1px; background:var(--cr); transform:scaleX(0); transform-origin:left center; }

        .ci-heading-wrap { margin-bottom:36px; }
        /* Dark ink heading — navy contrast on ivory */
        .ci-heading-line {
          display:block; overflow:hidden;
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(3.8rem,9vw,8.5rem); line-height:.92; letter-spacing:.025em;
          color:var(--nv);
        }
        /* Crimson-to-navy gradient accent word */
        .ci-heading-accent {
          display:block; overflow:hidden;
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(3.8rem,9vw,8.5rem); line-height:.92; letter-spacing:.025em;
          background:linear-gradient(110deg,#6E1020 0%,#8B1A28 28%,#C03050 50%,#8B1A28 72%,#6E1020 100%);
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
        }

        /* Body text — warm dark brown, very readable on ivory */
        .ci-body-text {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(1.1rem,1.5vw,1.3rem); font-weight:400; line-height:1.8;
          color:var(--ink-body); max-width:500px; margin-bottom:24px; font-style:italic;
          -webkit-font-smoothing:antialiased;
        }

        /* CTA link — crimson */
        .ci-cta {
          display:inline-flex; align-items:center; gap:12px;
          font-family:'DM Sans',sans-serif; font-size:11px; font-weight:500;
          letter-spacing:.2em; text-transform:uppercase; color:var(--cr);
          text-decoration:none; border-bottom:1px solid rgba(139,26,40,.35);
          padding-bottom:5px; margin-top:16px;
          transition:gap .35s,border-color .35s,color .35s;
        }
        .ci-cta:hover { gap:22px; color:#6E1020; border-color:#6E1020; }
        .ci-cta svg { transition:transform .35s; }
        .ci-cta:hover svg { transform:translateX(5px); }

        /* Image stack */
        .ci-img-stack { position:relative; height:580px; }
        @media (max-width:960px) { .ci-img-stack { height:360px; } }
        .ci-img-main { position:absolute; inset:0 0 70px 70px; overflow:hidden; }
        .ci-img-accent {
          position:absolute; bottom:0; left:0; width:52%; height:46%;
          overflow:hidden; border:4px solid var(--ivory); z-index:2;
          box-shadow:0 8px 40px rgba(26,18,8,.14);
        }
        /* Crimson wipe reveal */
        .ci-img-cover { position:absolute; inset:0; background:var(--cr); z-index:3; transform-origin:right center; }
        .ci-img-main .ci-img-el,.ci-img-accent .ci-img-el { object-fit:cover; display:block; z-index:1; }

        /* Image label — ivory bg, crimson accent */
        .ci-img-label {
          position:absolute; bottom:16px; left:16px;
          background:rgba(250,247,242,.94); border-left:2px solid var(--cr);
          padding:9px 14px; font-family:'DM Sans',sans-serif; font-size:10px;
          letter-spacing:.16em; text-transform:uppercase; color:var(--cr);
          z-index:4; backdrop-filter:blur(8px);
        }

        /* Badge — navy fill with ivory text + crimson year */
        .ci-badge {
          position:absolute; top:-10px; right:-10px;
          width:96px; height:96px; background:var(--nv);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          z-index:5; box-shadow:0 4px 24px rgba(14,30,48,.3);
        }
        .ci-badge-since {
          font-family:'DM Sans',sans-serif; font-size:8.5px; letter-spacing:.22em;
          text-transform:uppercase; color:rgba(250,247,242,.6); font-weight:600; margin-bottom:1px;
        }
        .ci-badge-year { font-family:'Bebas Neue',sans-serif; font-size:1.7rem; color:var(--ivory); line-height:1; }

        /* ── Pillars — ivory-s surface ── */
        .ci-pillars { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); }
        @media (max-width:760px) { .ci-pillars { grid-template-columns:1fr; } }
        .ci-pillar {
          background:var(--ivory-s); padding:52px 40px;
          position:relative; overflow:hidden; transition:background .45s;
        }
        /* Crimson bottom reveal bar */
        .ci-pillar::after {
          content:''; position:absolute; bottom:0; left:0; right:0;
          height:3px;
          background:linear-gradient(to right,var(--cr),var(--nv));
          transform:scaleX(0); transform-origin:left; transition:transform .55s;
        }
        .ci-pillar:hover { background:var(--ivory-d); }
        .ci-pillar:hover::after { transform:scaleX(1); }

        /* Large ghost number — navy tint */
        .ci-pillar-bg-num {
          font-family:'Bebas Neue',sans-serif; font-size:5rem;
          color:rgba(14,30,48,.07); line-height:1;
          position:absolute; top:20px; right:24px;
          transition:color .45s; pointer-events:none; user-select:none;
        }
        .ci-pillar:hover .ci-pillar-bg-num { color:rgba(14,30,48,.14); }

        /* Pillar title — navy */
        .ci-pillar-title {
          font-family:'Bebas Neue',sans-serif; font-size:2.1rem;
          letter-spacing:.07em; color:var(--nv); margin-bottom:18px;
        }
        .ci-pillar-title::before {
          content:''; display:block; width:24px; height:1px;
          background:var(--cr); margin-bottom:16px;
        }
        /* Body — warm dark brown */
        .ci-pillar-body {
          font-family:'Cormorant Garamond',serif; font-size:1.08rem;
          line-height:1.85; color:var(--ink-body); font-weight:400;
        }

        .ci-bottom-rule { height:1px; background:var(--border); position:relative; z-index:2; }

        @media (prefers-reduced-motion:reduce) { .ci-marquee-track { animation:none; } }
      `}</style>

      <section className="ci-about" ref={sectionRef} id="about">
        <div className="ci-side-bar" aria-hidden="true" />

        {/* Marquee */}
        <div className="ci-marquee">
          <div className="ci-marquee-track">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="ci-marquee-item">
                Traditional Barbershop<span className="ci-mq-dot-cr" />
                Staines Since 1990<span className="ci-mq-dot-nv" />
                Master Barbers<span className="ci-mq-dot-cr" />
                Premium Grooming<span className="ci-mq-dot-nv" />
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="ci-inner">
          <div className="ci-stats">
            {STATS.map(s => (
              <div key={s.label} className="ci-stat-item">
                <span className="ci-stat-num" data-val={s.value}>{s.value}</span>
                <span className="ci-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Split */}
        <div className="ci-inner">
          <div className="ci-split">
            <div className="ci-copy">
              <div className="ci-eyebrow">
                <span className="ci-eyebrow-label">Our Story</span>
                <span className="ci-line-draw" />
              </div>
              <div className="ci-heading-wrap">
                <span className="ci-heading-line">Where Every</span>
                <span className="ci-heading-accent">Gentleman</span>
                <span className="ci-heading-line">Belongs</span>
              </div>
              <p className="ci-body-text ci-fade-up">
                One of Staines&apos; finest traditional barbershops since 1990.
                When you walk through our doors, it&apos;s about you — sit back,
                relax, and let people who genuinely love their craft take care of the rest.
              </p>
              <p className="ci-body-text ci-fade-up">
                Leather-and-chrome chairs, complimentary drinks on arrival, and a team
                of master barbers who understand that a great cut is only the beginning
                of a great experience.
              </p>
              <a href="/booking" className="ci-cta ci-fade-up">
                Book Your Visit
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                  <path d="M1 6h18M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <div className="ci-img-stack">
              <div className="ci-img-main">
                <div className="ci-img-cover" />
                <Image src="/about2.jpg" alt="Barber giving a precision haircut"
                  fill className="ci-img-el" style={{ objectFit:"cover" }} priority
                  sizes="(max-width:960px) 100vw,(max-width:1360px) 45vw,680px" />
                <div className="ci-badge">
                  <span className="ci-badge-since">Since</span>
                  <span className="ci-badge-year">1990</span>
                </div>
              </div>
              <div className="ci-img-accent">
                <div className="ci-img-cover" />
                <Image src="/about1.jpg" alt="Classic barbershop interior"
                  fill className="ci-img-el" style={{ objectFit:"cover" }}
                  sizes="(max-width:960px) 50vw,310px" />
                <div className="ci-img-label">Kingston Rd · Staines</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="ci-pillars">
          {PILLARS.map(p => (
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