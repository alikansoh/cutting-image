"use client";
import Image from "next/image";
import { useEffect, useRef, useState, JSX, useMemo } from "react";

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
  label: string;
  aspect: "portrait" | "landscape" | "square";
}

// ── Add / remove items here — categories & stats update automatically ──────────
const ITEMS: GalleryItem[] = [
  { id: 1,  src: "/cut1.webp",  alt: "Mid-skin fade with a textured pompadour and a hard part",               category: "haircuts", label: "Mid-Skin Fade Pompadour",  aspect: "portrait"  },
  { id: 2,  src: "/cut2.webp",  alt: "High skin fade with a textured quiff and groomed beard",                category: "haircuts", label: "High Fade Quiff",           aspect: "square"    },
  { id: 3,  src: "/cut3.webp",  alt: "Textured crop top with a low skin fade and double-line hair design",    category: "haircuts", label: "Crop with Hair Design",      aspect: "square"    },
  { id: 4,  src: "/cut4.webp",  alt: "High drop fade with a short textured top and stubble beard",            category: "haircuts", label: "High Drop Fade",             aspect: "landscape" },
  { id: 5,  src: "/cut5.webp",  alt: "Classic slicked-back hairstyle with a clean neck taper",                category: "haircuts", label: "Slicked Back Taper",         aspect: "portrait"  },
  { id: 6,  src: "/cut6.webp",  alt: "Burst fade around the ear with textured length on top and back",        category: "haircuts", label: "Burst Fade Taper",           aspect: "square"    },
  { id: 7,  src: "/cut7.webp",  alt: "Mid skin fade with textured top and sharp beard line-up",               category: "haircuts", label: "Mid Fade & Beard Shape",     aspect: "portrait"  },
  { id: 8,  src: "/cut8.webp",  alt: "Junior side-part haircut with a clean taper and textured fringe",       category: "haircuts", label: "Junior Side-Part",           aspect: "landscape" },
  { id: 9,  src: "/cut9.webp",  alt: "Slicked side-part with a curved surgical line design and drop fade",    category: "haircuts", label: "Creative Hair Design",       aspect: "square"    },
  { id: 10, src: "/ex1.webp",   alt: "Exterior storefront of Cutting Image Gents Grooming on High Street",    category: "shop",     label: "Our Location",               aspect: "landscape" },
  { id: 11, src: "/cut10.webp", alt: "Tapered curly fringe with a double surgical line design on the neckline", category: "haircuts", label: "Curly Taper with Design", aspect: "square"    },
];

// Pretty labels for category keys — extend as you add new categories
const CAT_LABELS: Record<string, string> = {
  haircuts: "Haircuts",
  shaves:   "Shaves",
  beards:   "Beards",
  shop:     "The Shop",
};

const TICKER_WORDS = ["Precision","Craft","Heritage","Excellence","Tradition","Mastery","Detail","Style"];

export default function GalleryPage(): JSX.Element {
  const pageRef    = useRef<HTMLDivElement>(null);
  const scriptsRef = useRef(false);
  const animRef    = useRef(false);

  const [cat,           setCat]           = useState("all");
  const [lb,            setLb]            = useState<GalleryItem | null>(null);
  const [lbIdx,         setLbIdx]         = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPos,     setCursorPos]     = useState({ x: 0, y: 0 });

  // ── Categories derived from ITEMS — no empty tabs ever ────────────────────
  const CATS = useMemo(() => {
    const seen = new Set<string>();
    ITEMS.forEach(i => seen.add(i.category));
    const dynamic = Array.from(seen).map(key => ({
      key,
      label: CAT_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
    }));
    return [{ key: "all", label: "All Work" }, ...dynamic];
  }, []);

  const shown = cat === "all" ? ITEMS : ITEMS.filter(i => i.category === cat);

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Keyboard nav in lightbox
  useEffect(() => {
    if (!lb) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")     closeLb();
      if (e.key === "ArrowRight") nav(1);
      if (e.key === "ArrowLeft")  nav(-1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lb, lbIdx]);

  // GSAP
  useEffect(() => {
    const node = pageRef.current;
    if (!node) return;
    let obs: IntersectionObserver | null = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs?.disconnect(); obs = null; loadGSAP();
    }, { rootMargin: "200px", threshold: 0.01 });
    obs.observe(node);
    return () => { obs?.disconnect(); window.ScrollTrigger?.getAll().forEach(t => t.kill()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src: string): Promise<void> =>
    new Promise(resolve => {
      const f = src.split("/").pop()!;
      if (document.querySelector(`script[src*="${f}"]`)) { setTimeout(resolve, 50); return; }
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

  const loadGSAP = async () => {
    if (scriptsRef.current) return;
    scriptsRef.current = true;
    await Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"),
    ]);
    initAnim();
  };

  const initAnim = () => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger || animRef.current) return;
    animRef.current = true;
    gsap.registerPlugin(ScrollTrigger);
    const p = pageRef.current;
    if (!p) return;

    gsap.fromTo(p.querySelectorAll<HTMLElement>(".g-hd-line"),
      { yPercent: 105, skewY: 2 },
      { yPercent: 0, skewY: 0, stagger: 0.1, duration: 1.1, ease: "power4.out",
        scrollTrigger: { trigger: p.querySelector(".g-header"), start: "top 84%" } });

    gsap.fromTo(p.querySelector<HTMLElement>(".g-rule"), { scaleX: 0 },
      { scaleX: 1, duration: 1.4, ease: "expo.out", transformOrigin: "left",
        scrollTrigger: { trigger: p.querySelector(".g-header"), start: "top 82%" } });

    gsap.fromTo(p.querySelector<HTMLElement>(".g-sub"), { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power2.out",
        scrollTrigger: { trigger: p.querySelector(".g-header"), start: "top 82%" } });

    p.querySelectorAll<HTMLElement>(".g-card").forEach((el, i) => {
      gsap.fromTo(el, { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, delay: (i % 3) * 0.08, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" } });
    });

    // Count-up only for numeric stat values (skips "35+" correctly)
    p.querySelectorAll<HTMLElement>(".g-stat-val").forEach(el => {
      const raw = el.dataset.n ?? "";
      const num = parseFloat(raw);
      if (isNaN(num)) return; // leaves "35+" as-is
      const suffix = raw.replace(/[\d.]+/, "");
      const obj = { v: 0 };
      gsap.to(obj, {
        v: num, duration: 2.2, ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    gsap.to(p.querySelector<HTMLElement>(".g-side-txt"), {
      y: -70, ease: "none",
      scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: 1.5 },
    });
  };

  const openLb  = (item: GalleryItem, idx: number) => { setLb(item); setLbIdx(idx); document.body.style.overflow = "hidden"; };
  const closeLb = () => { setLb(null); document.body.style.overflow = ""; };
  const nav     = (d: 1 | -1) => { const n = (lbIdx + d + shown.length) % shown.length; setLbIdx(n); setLb(shown[n]); };
  const aCls    = (a: GalleryItem["aspect"]) => a === "portrait" ? "g-card--portrait" : a === "landscape" ? "g-card--landscape" : "g-card--square";
  const catLbl  = (key: string) => CAT_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <>
      <style>{`
        :root {
          --nav-h:   72px;
          --gold:    #C9A84C; --gold-lt: #F0D878; --gold-dk: #6B4F16;
          --ink:     #080705; --ink2:    #0F0E0C; --ink3:    #161410;
          --warm:    #F0EAD6; --muted:   #7A7060;
          --border:  rgba(201,168,76,0.15);
          --body:    rgba(240,234,214,0.82);
          --ease:    cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .gp*,.gp*::before,.gp*::after{box-sizing:border-box;margin:0;padding:0}
        .gp{background:var(--ink);color:var(--warm);font-family:'DM Sans',sans-serif;padding-top:var(--nav-h);min-height:100vh;position:relative;overflow-x:hidden}
        .gp::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:200;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");opacity:0.038}

        .g-cursor{position:fixed;z-index:9000;pointer-events:none;top:0;left:0;width:52px;height:52px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;background:rgba(201,168,76,0.07);backdrop-filter:blur(4px);transform:translate(-50%,-50%);transition:opacity 0.25s}
        .g-cursor svg{color:var(--gold)}
        @media(hover:none){.g-cursor{display:none}}

        .g-ticker{overflow:hidden;background:var(--ink2);border-bottom:1px solid var(--border);padding:13px 0}
        .g-ticker-track{display:flex;white-space:nowrap;animation:tickerRoll 30s linear infinite}
        .g-ticker-track:hover{animation-play-state:paused}
        @keyframes tickerRoll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .g-ticker-word{display:inline-flex;align-items:center;gap:20px;padding:0 20px;flex-shrink:0;font-family:'Bebas Neue',sans-serif;font-size:0.82rem;letter-spacing:0.22em;color:var(--muted)}
        .g-ticker-gem{width:4px;height:4px;background:var(--gold);transform:rotate(45deg);flex-shrink:0}

        .g-side-txt{position:fixed;left:20px;top:50%;transform:translateY(-50%) rotate(-90deg);transform-origin:center;font-family:'Bebas Neue',sans-serif;font-size:0.68rem;letter-spacing:0.38em;color:rgba(201,168,76,0.22);white-space:nowrap;pointer-events:none;z-index:3}
        @media(max-width:960px){.g-side-txt{display:none}}

        .g-wrap{max-width:1380px;margin:0 auto;padding:0 80px;position:relative;z-index:2}
        @media(max-width:960px){.g-wrap{padding:0 28px}}
        @media(max-width:560px){.g-wrap{padding:0 18px}}

        .g-header{padding:90px 0 72px;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:end;border-bottom:1px solid var(--border)}
        @media(max-width:760px){.g-header{grid-template-columns:1fr;gap:36px;padding:60px 0 48px}}

        .g-eyebrow{display:flex;align-items:center;gap:14px;margin-bottom:24px}
        .g-eyebrow-tag{font-size:9.5px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold)}
        .g-rule{height:1px;width:64px;background:var(--gold);transform-origin:left;transform:scaleX(0)}

        .g-hd-clip{overflow:hidden}
        .g-hd-line{display:block;font-family:'Bebas Neue',sans-serif;font-size:clamp(4rem,10.5vw,9.6rem);line-height:0.88;letter-spacing:0.025em;color:var(--warm)}
        .g-hd-line.gold{background:linear-gradient(110deg,var(--gold-dk) 0%,var(--gold) 30%,var(--gold-lt) 55%,var(--gold) 75%,var(--gold-dk) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}

        .g-sub{margin-top:28px;max-width:400px;font-family:'Cormorant Garamond',serif;font-size:clamp(1rem,1.35vw,1.22rem);font-style:italic;line-height:1.8;color:var(--body)}

        .g-stats{display:flex;flex-direction:column;gap:28px;align-items:flex-end}
        @media(max-width:760px){.g-stats{flex-direction:row;align-items:flex-start;gap:32px}}
        .g-stat{text-align:right}
        @media(max-width:760px){.g-stat{text-align:left}}
        .g-stat-val{display:block;font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,3.4vw,3rem);line-height:1;background:linear-gradient(120deg,var(--gold),var(--gold-lt));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .g-stat-lbl{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--muted);font-weight:500}

        .g-filters{display:flex;align-items:stretch;gap:0;padding:26px 0;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
        .g-filters::-webkit-scrollbar{display:none}
        .g-filter{position:relative;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:var(--muted);background:transparent;border:none;cursor:pointer;padding:10px 22px;white-space:nowrap;transition:color 0.3s}
        .g-filter::after{content:'';position:absolute;bottom:0;left:22px;right:22px;height:1px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform 0.4s var(--ease)}
        .g-filter:hover{color:var(--warm)}
        .g-filter.active{color:var(--gold)}
        .g-filter.active::after{transform:scaleX(1)}
        .g-filter-sup{font-size:7.5px;opacity:0.45;margin-left:3px;vertical-align:super;line-height:0}
        .g-filter-sep{width:1px;background:var(--border);align-self:stretch}

        .g-grid{padding:52px 0 96px;columns:3;column-gap:12px}
        @media(max-width:900px){.g-grid{columns:2}}
        @media(max-width:500px){.g-grid{columns:1}}

        .g-card{break-inside:avoid;margin-bottom:12px;position:relative;overflow:hidden;cursor:none;display:block;background:var(--ink3)}
        .g-card--portrait  .g-card-img{aspect-ratio:3/4}
        .g-card--landscape .g-card-img{aspect-ratio:4/3}
        .g-card--square    .g-card-img{aspect-ratio:1/1}
        .g-card-img{position:relative;overflow:hidden;width:100%}
        .g-card-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.9s var(--ease);will-change:transform}
        .g-card:hover .g-card-img img{transform:scale(1.065)}
        .g-veil{position:absolute;inset:0;z-index:2;background:linear-gradient(170deg,transparent 35%,rgba(8,7,5,0.55) 68%,rgba(8,7,5,0.9) 100%);opacity:0;transition:opacity 0.5s ease}
        .g-card:hover .g-veil{opacity:1}
        .g-card-info{position:absolute;bottom:0;left:0;right:0;z-index:3;padding:14px 16px;display:flex;align-items:flex-end;justify-content:space-between;transform:translateY(6px);opacity:0;transition:transform 0.42s var(--ease),opacity 0.42s ease}
        .g-card:hover .g-card-info{transform:translateY(0);opacity:1}
        .g-card-label{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:0.07em;color:var(--warm);line-height:1.1}
        .g-card-tag{font-size:8px;letter-spacing:0.22em;text-transform:uppercase;color:var(--gold);margin-top:3px;display:block}
        .g-card-bracket{width:24px;height:24px;flex-shrink:0;border-top:1px solid rgba(201,168,76,0.7);border-right:1px solid rgba(201,168,76,0.7)}
        .g-card-idx{position:absolute;top:12px;right:14px;z-index:4;font-family:'Bebas Neue',sans-serif;font-size:0.72rem;letter-spacing:0.2em;color:rgba(201,168,76,0.45);opacity:0;transition:opacity 0.35s ease}
        .g-card:hover .g-card-idx{opacity:1}
        .g-card-pip{position:absolute;top:14px;left:14px;z-index:4;width:5px;height:5px;background:var(--gold);transform:rotate(45deg);opacity:0;transition:opacity 0.35s ease}
        .g-card:hover .g-card-pip{opacity:1}

        .g-empty{padding:80px 0;text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem;color:var(--muted)}

        .g-lb{position:fixed;inset:0;z-index:8000;background:rgba(8,7,5,0.97);display:flex;align-items:center;justify-content:center;animation:lbFade 0.3s ease;backdrop-filter:blur(14px)}
        @keyframes lbFade{from{opacity:0}to{opacity:1}}
        .g-lb-box{position:relative;width:min(90vw,1020px);animation:lbRise 0.32s ease}
        @keyframes lbRise{from{transform:translateY(22px) scale(0.98);opacity:0}to{transform:none;opacity:1}}
        .g-lb-grid{display:grid;grid-template-columns:1fr 210px;border:1px solid var(--border)}
        @media(max-width:600px){.g-lb-grid{grid-template-columns:1fr}}
        .g-lb-img{position:relative;aspect-ratio:4/3;overflow:hidden}
        .g-lb-img img{object-fit:cover}
        .g-lb-aside{background:var(--ink2);border-left:1px solid var(--border);padding:32px 24px;display:flex;flex-direction:column;justify-content:space-between}
        @media(max-width:600px){.g-lb-aside{border-left:none;border-top:1px solid var(--border);padding:22px 18px}}
        .g-lb-cat{font-size:8.5px;letter-spacing:0.28em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;display:block}
        .g-lb-name{font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:0.06em;color:var(--warm);line-height:1;margin-bottom:24px}
        .g-lb-hr{width:28px;height:1px;background:var(--gold);margin-bottom:24px}
        .g-lb-num{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;line-height:1;letter-spacing:0.04em;background:linear-gradient(120deg,var(--gold),var(--gold-lt));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .g-lb-total{font-size:8.5px;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);display:block;margin-top:3px}
        .g-lb-navs{display:flex;gap:8px;margin-top:24px}
        .g-lb-btn{width:40px;height:40px;border:1px solid var(--border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:border-color 0.3s,color 0.3s,background 0.3s}
        .g-lb-btn:hover{border-color:var(--gold);color:var(--gold);background:rgba(201,168,76,0.05)}
        .g-lb-close{position:absolute;top:-42px;right:0;width:34px;height:34px;border:1px solid var(--border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:border-color 0.3s,color 0.3s}
        .g-lb-close:hover{border-color:var(--gold);color:var(--gold)}

        .g-cta{border-top:1px solid var(--border);padding:72px 0;display:grid;grid-template-columns:1fr auto;align-items:center;gap:40px}
        @media(max-width:640px){.g-cta{grid-template-columns:1fr}}
        .g-cta-hed{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,5vw,4.2rem);line-height:0.92;letter-spacing:0.04em;color:var(--warm)}
        .g-cta-hed em{font-style:normal;background:linear-gradient(110deg,var(--gold),var(--gold-lt));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .g-cta-btns{display:flex;gap:12px;flex-wrap:wrap}
        .g-btn{display:inline-flex;align-items:center;gap:12px;font-family:'DM Sans',sans-serif;font-size:10.5px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;padding:14px 28px;text-decoration:none;cursor:pointer;transition:gap 0.35s,background 0.3s,border-color 0.3s,color 0.3s;white-space:nowrap;border:1px solid transparent}
        .g-btn--solid{background:var(--gold);color:var(--ink);border-color:var(--gold)}
        .g-btn--solid:hover{background:var(--gold-lt);border-color:var(--gold-lt);gap:20px}
        .g-btn--ghost{background:transparent;color:var(--gold);border-color:rgba(201,168,76,0.3)}
        .g-btn--ghost:hover{border-color:var(--gold);color:var(--gold-lt);gap:20px}
        .g-foot{height:1px;background:rgba(255,255,255,0.06)}

        @media(prefers-reduced-motion:reduce){
          .g-ticker-track{animation:none}
          .g-card-img img{transition:none}
          .g-lb,.g-lb-box{animation:none}
        }
      `}</style>

      {/* Custom cursor */}
      <div
        className="g-cursor"
        style={{ left: cursorPos.x, top: cursorPos.y, opacity: cursorVisible ? 1 : 0 }}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M1 7h12M7 1l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Lightbox */}
      {lb && (
        <div className="g-lb" onClick={closeLb} role="dialog" aria-modal aria-label="Gallery image viewer">
          <div className="g-lb-box" onClick={e => e.stopPropagation()}>
            <button className="g-lb-close" onClick={closeLb} aria-label="Close lightbox">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M1 1l11 11M12 1L1 12" />
              </svg>
            </button>
            <div className="g-lb-grid">
              <div className="g-lb-img">
                <Image src={lb.src} alt={lb.alt} fill sizes="70vw" priority />
              </div>
              <div className="g-lb-aside">
                <div>
                  <span className="g-lb-cat">{catLbl(lb.category)}</span>
                  <p className="g-lb-name">{lb.label}</p>
                  <div className="g-lb-hr" />
                </div>
                <div>
                  <span className="g-lb-num">{String(lbIdx + 1).padStart(2, "0")}</span>
                  <span className="g-lb-total">of {String(shown.length).padStart(2, "0")} works</span>
                  <div className="g-lb-navs">
                    <button className="g-lb-btn" onClick={() => nav(-1)} aria-label="Previous image">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button className="g-lb-btn" onClick={() => nav(1)} aria-label="Next image">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M5 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page */}
      <div className="gp" ref={pageRef}>
        <span className="g-side-txt" aria-hidden="true">Cutting Image · Est 1990 · Our Gallery</span>

        {/* Ticker */}
        <div className="g-ticker" aria-hidden="true">
          <div className="g-ticker-track">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="g-ticker-word">
                {TICKER_WORDS.map((w, j) => (
                  <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: "20px" }}>
                    {w}<span className="g-ticker-gem" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div className="g-wrap">
          {/* Header */}
          <header className="g-header">
            <div>
              <div className="g-eyebrow">
                <span className="g-eyebrow-tag">Our Portfolio</span>
                <span className="g-rule" />
              </div>
              <div>
                <div className="g-hd-clip"><span className="g-hd-line">The</span></div>
                <div className="g-hd-clip"><span className="g-hd-line gold">Gallery</span></div>
              </div>
              <p className="g-sub">
                Decades of craft in every frame. From timeless fades to sculpted
                beards — this is what mastery looks like.
              </p>
            </div>

            {/* Stats */}
            <div className="g-stats" aria-label="Key figures">
              {[
                { n: "35+",   lbl: "Years Open"    },
                { n: "4.8★",  lbl: "Average Rating" },
                { n: "10K+",  lbl: "Happy Clients"  },
              ].map(s => (
                <div key={s.lbl} className="g-stat">
                  <span className="g-stat-val" data-n={s.n}>{s.n}</span>
                  <span className="g-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </header>

          {/* Filters — only categories that have at least 1 item */}
          <nav className="g-filters" aria-label="Filter gallery by category">
            {CATS.map((c, i) => {
              const count = c.key === "all"
                ? ITEMS.length
                : ITEMS.filter(g => g.category === c.key).length;
              return (
                <div key={c.key} style={{ display: "contents" }}>
                  {i > 0 && <div className="g-filter-sep" aria-hidden="true" />}
                  <button
                    className={`g-filter${cat === c.key ? " active" : ""}`}
                    onClick={() => setCat(c.key)}
                    aria-pressed={cat === c.key}
                  >
                    {c.label}<sup className="g-filter-sup">{count}</sup>
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Grid */}
          <div className="g-grid" role="list" aria-label="Gallery images">
            {shown.length === 0
              ? <p className="g-empty">No works in this category yet.</p>
              : shown.map((item, idx) => (
                <div
                  key={item.id}
                  className={`g-card ${aCls(item.aspect)}`}
                  role="listitem"
                  onClick={() => openLb(item, idx)}
                  onMouseEnter={() => setCursorVisible(true)}
                  onMouseLeave={() => setCursorVisible(false)}
                  tabIndex={0}
                  aria-label={`View ${item.label}`}
                  onKeyDown={e => e.key === "Enter" && openLb(item, idx)}
                >
                  <div className="g-card-img">
                    <Image src={item.src} alt={item.alt} fill sizes="(max-width:500px) 100vw,(max-width:900px) 50vw,33vw" />
                    <div className="g-veil" />
                    <span className="g-card-pip" aria-hidden="true" />
                    <span className="g-card-idx" aria-hidden="true">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="g-card-info">
                      <div>
                        <span className="g-card-label">{item.label}</span>
                        <span className="g-card-tag">{catLbl(item.category)}</span>
                      </div>
                      <div className="g-card-bracket" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* CTA */}
          <div className="g-cta">
            <h2 className="g-cta-hed">Ready For Your<br /><em>Signature Look?</em></h2>
            <div className="g-cta-btns">
              <a href="/booking" className="g-btn g-btn--solid">
                Book Now
                <svg width="15" height="9" viewBox="0 0 15 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4.5h13M9 1l4.5 3.5L9 8" />
                </svg>
              </a>
              <a href="/services" className="g-btn g-btn--ghost">Our Services</a>
            </div>
          </div>
        </div>
        <div className="g-foot" />
      </div>
    </>
  );
}