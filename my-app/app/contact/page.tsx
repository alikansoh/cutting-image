"use client";
import { JSX, useEffect, useRef, useState } from "react";

/*
  Add to app/layout.tsx <head> (if not already added):

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
    media="print" onLoad="this.media='all'"
  />
*/

// ── GSAP type helpers ──────────────────────────────────────────────────────────
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

const getGsap = (): GsapInstance | undefined =>
  (window as unknown as Record<string, unknown>)["gsap"] as GsapInstance | undefined;

const getScrollTrigger = (): ScrollTriggerInstance | undefined =>
  (window as unknown as Record<string, unknown>)["ScrollTrigger"] as ScrollTriggerInstance | undefined;

// ── CONFIG ────────────────────────────────────────────────────────────────────

/** ⚠️  Replace with your real Brevo API key (server-side env var in production) */
const BREVO_API_KEY = process.env.NEXT_PUBLIC_BREVO_API_KEY!;

/** Salon's "from" address — must be verified in Brevo */
const FROM_EMAIL = "cutting.image.staines@gmail.com";
const FROM_NAME  = "Cutting Image";

/** Admin email — receives all contact form messages */
const ADMIN_EMAIL = "newcuttingimage@gmail.com";
const ADMIN_NAME  = "Cutting Image Admin";

// ── Brevo email sender ────────────────────────────────────────────────────────

async function sendEmail(
  to: string,
  toName: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent: html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Admin contact email builder ───────────────────────────────────────────────

function buildContactEmail(
  name: string,
  email: string,
  phone: string,
  message: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1C1C1C;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1C1C1C;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#111111;padding:28px 40px;text-align:center;border-bottom:2px solid #8A9E4A;">
          <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Cutting Image · Website Contact</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;letter-spacing:0.06em;color:#F5F1E8;line-height:1.2;">NEW MESSAGE</h1>
        </td></tr>
        <!-- Gold bar -->
        <tr><td style="height:2px;background:linear-gradient(90deg,#6B4F16,#C9A227,#F0D878,#C9A227,#6B4F16);"></td></tr>
        <!-- Body -->
        <tr><td style="background:#1E1E1E;padding:36px 40px;">
          <!-- Sender details -->
          <p style="margin:0 0 16px;font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:#C9A227;font-weight:700;">From</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;margin-bottom:28px;">
            <tr><td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">Name</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#F5F1E8;font-weight:700;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">Email</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#8A9E4A;font-weight:600;">
                      <a href="mailto:${email}" style="color:#8A9E4A;text-decoration:none;">${email}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">Phone</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#F5F1E8;font-weight:600;">
                      ${phone
                        ? `<a href="tel:${phone}" style="color:#F5F1E8;text-decoration:none;">${phone}</a>`
                        : '<span style="color:#5A5A5A;font-style:italic;">Not provided</span>'
                      }
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
          <!-- Message -->
          <p style="margin:0 0 16px;font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:#C9A227;font-weight:700;">Message</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;margin-bottom:20px;">
            <tr><td style="padding:24px 28px;">
              <p style="margin:0;font-size:15px;color:rgba(245,241,232,0.85);line-height:1.8;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </td></tr>
          </table>
          <!-- Reply hint -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #8A9E4A;background:#111111;">
            <tr><td style="padding:14px 20px;">
              <p style="margin:0;font-size:13px;color:rgba(245,241,232,0.6);line-height:1.7;">
                Reply directly to this email to respond to ${name}.
              </p>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#111111;padding:16px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#3A3A3A;">Cutting Image · Website Contact Form · Do not reply</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CONTACT_METHODS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.93a16 16 0 0 0 6.16 6.16l.93-.93a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: "Call Us",
    value: "01784 449005",
    sub: "Give us a ring",
    href: "tel:01784449005",
    cta: "Call Now",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>
        <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
      </svg>
    ),
    label: "Find Us",
    value: "2 Kingston Road",
    sub: "Staines-upon-Thames, TW18 4LG",
    href: "https://www.google.com/maps/place/Cutting+Image/@51.4350981,-0.5086567,17z/data=!3m1!4b1!4m6!3m5!1s0x487676cac16c3115:0x78edc50a61e9f190!8m2!3d51.4350981!4d-0.5060818!16s%2Fg%2F1tcz7tw9",
    cta: "Get Directions",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: "Opening Hours",
    value: "Mon – Fri  9am – 7pm",
    sub: "Sat 9am–6pm · Sun 10am–5pm",
    href: null,
    cta: null,
  },
];

const HOURS = [
  { day: "Monday",    time: "9:00 AM – 7:00 PM" },
  { day: "Tuesday",   time: "9:00 AM – 7:00 PM" },
  { day: "Wednesday", time: "9:00 AM – 7:00 PM" },
  { day: "Thursday",  time: "9:00 AM – 7:00 PM" },
  { day: "Friday",    time: "9:00 AM – 7:00 PM" },
  { day: "Saturday",  time: "9:00 AM – 6:00 PM" },
  { day: "Sunday",    time: "10:00 AM – 5:00 PM" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function ContactPage(): JSX.Element {
  const pageRef          = useRef<HTMLDivElement>(null);
  const hasAnimated      = useRef<boolean>(false);
  const hasLoadedScripts = useRef<boolean>(false);

  const [form, setForm]       = useState({ name: "", email: "", phone: "", message: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]   = useState(false);
  const [sendError, setSendError] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });

  useEffect(() => {
    void loadGSAP();
    return () => { getScrollTrigger()?.getAll().forEach((t) => t.kill()); };
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
    if (hasLoadedScripts.current) return;
    hasLoadedScripts.current = true;
    await Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"),
    ]);
    initAnimations();
  };

  const GOLD_SPAN_STYLE = [
    "display:inline-block",
    "will-change:transform,opacity",
    "background:linear-gradient(110deg,#6B4F16 0%,#C9A227 28%,#F0D878 50%,#C9A227 72%,#6B4F16 100%)",
    "-webkit-background-clip:text",
    "background-clip:text",
    "-webkit-text-fill-color:transparent",
  ].join(";");

  const escapeHtml = (str: string) =>
    str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));

  const initAnimations = (): void => {
    const gsap = getGsap();
    const ScrollTrigger = getScrollTrigger();
    if (!gsap || !ScrollTrigger || hasAnimated.current) return;
    hasAnimated.current = true;
    gsap.registerPlugin(ScrollTrigger);
    const page = pageRef.current;
    if (!page) return;

    page.querySelectorAll<HTMLElement>(".cp-hero-line").forEach((line) => {
      const isGold = line.classList.contains("gold");
      const text = line.textContent ?? "";
      line.innerHTML = Array.from(text).map((c) =>
        c === " "
          ? `<span style="display:inline-block;width:0.28em">&nbsp;</span>`
          : isGold
            ? `<span class="cp-char cp-char-gold" style="${GOLD_SPAN_STYLE}">${escapeHtml(c)}</span>`
            : `<span class="cp-char" style="display:inline-block;will-change:transform,opacity">${escapeHtml(c)}</span>`
      ).join("");
    });

    const plainChars = page.querySelectorAll<HTMLElement>(".cp-char:not(.cp-char-gold)");
    const goldChars  = page.querySelectorAll<HTMLElement>(".cp-char-gold");

    if (plainChars.length) {
      gsap.fromTo(
        plainChars,
        { yPercent: 110, rotationX: -40, opacity: 0 } as Record<string, unknown>,
        { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.016, duration: 0.85, ease: "power3.out", delay: 0.2, clearProps: "transform,opacity" } as Record<string, unknown>
      );
    }
    if (goldChars.length) {
      gsap.fromTo(
        goldChars,
        { yPercent: 110, rotationX: -40, opacity: 0 } as Record<string, unknown>,
        { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.016, duration: 0.85, ease: "power3.out", delay: 0.2 } as Record<string, unknown>
      );
    }

    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-hero-eyebrow"),
      { y: 20, opacity: 0 } as Record<string, unknown>,
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.15, clearProps: "transform,opacity" } as Record<string, unknown>
    );
    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-hero-sub"),
      { y: 24, opacity: 0 } as Record<string, unknown>,
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.9, clearProps: "transform,opacity" } as Record<string, unknown>
    );

    page.querySelectorAll<HTMLElement>(".cp-line-draw").forEach((el) => {
      gsap.fromTo(el, { scaleX: 0 } as Record<string, unknown>, {
        scaleX: 1, duration: 1.4, ease: "power3.out", transformOrigin: "left center",
        scrollTrigger: { trigger: el, start: "top 82%" },
      } as Record<string, unknown>);
    });

    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".cp-method-card"),
      { y: 60, opacity: 0 } as Record<string, unknown>,
      {
        y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: page.querySelector(".cp-methods"), start: "top 80%" },
      } as Record<string, unknown>
    );

    gsap.fromTo(
      page.querySelectorAll<HTMLElement>(".cp-hour-row"),
      { x: -30, opacity: 0 } as Record<string, unknown>,
      {
        x: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: page.querySelector(".cp-hours"), start: "top 82%" },
      } as Record<string, unknown>
    );

    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-form-panel"),
      { x: 50, opacity: 0 } as Record<string, unknown>,
      {
        x: 0, opacity: 1, duration: 1.1, ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: page.querySelector(".cp-form-panel"), start: "top 80%" },
      } as Record<string, unknown>
    );

    gsap.fromTo(
      page.querySelector<HTMLElement>(".cp-map-section"),
      { y: 40, opacity: 0 } as Record<string, unknown>,
      {
        y: 0, opacity: 1, duration: 1, ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: page.querySelector(".cp-map-section"), start: "top 82%" },
      } as Record<string, unknown>
    );

    page.querySelectorAll<HTMLElement>(".cp-fade-up").forEach((el) => {
      gsap.fromTo(el, { y: 40, opacity: 0 } as Record<string, unknown>, {
        y: 0, opacity: 1, duration: 0.9, ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 84%" },
      } as Record<string, unknown>);
    });
  };

  const canSubmit = !!form.name.trim() && !!form.email.trim() && form.email.includes("@") && !!form.message.trim();

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canSubmit || sending) return;
    setSending(true);
    setSendError(false);

    const subject = `💬 New Message from ${form.name} — Cutting Image Website`;
    const html = buildContactEmail(form.name, form.email, form.phone, form.message);
    const ok = await sendEmail(ADMIN_EMAIL, ADMIN_NAME, subject, html);

    setSending(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setSendError(true);
    }
  };

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

        .cp-page *, .cp-page *::before, .cp-page *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        .cp-page {
          background: var(--cream);
          color: var(--charcoal);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow-x: hidden;
        }
        .cp-page::after {
          content: '';
          position: fixed; inset: 0; z-index: 200;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022; pointer-events: none;
        }

        .cp-inner {
          max-width: 1360px; margin: 0 auto;
          padding: 0 80px; position: relative; z-index: 2;
        }
        @media (max-width: 900px) { .cp-inner { padding: 0 24px; } }

        /* ─── HERO ─── */
        .cp-hero {
          min-height: 72vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-bottom: 100px; padding-top: 100px;
          position: relative;
          border-bottom: 1px solid var(--border);
          overflow: hidden;
          margin-top: 80px;
        }
        .cp-hero-glow {
          position: absolute;
          width: 900px; height: 900px; border-radius: 50%;
          background: radial-gradient(circle, rgba(138,158,74,0.07) 0%, transparent 70%);
          top: -200px; left: -100px;
          pointer-events: none; z-index: 0;
          animation: cpGlowPulse 6s ease-in-out infinite;
        }
        @keyframes cpGlowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        .cp-hero-bg-text {
          position: absolute; bottom: -30px; right: -20px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(10rem, 24vw, 24rem);
          line-height: 1; letter-spacing: 0.04em;
          color: rgba(107,122,58,0.05);
          pointer-events: none; user-select: none; z-index: 0;
          white-space: nowrap;
        }
        .cp-hero-eyebrow {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px; position: relative; z-index: 2;
        }
        .cp-hero-eyebrow-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--olive-hi);
        }
        .cp-hero-eyebrow-line {
          width: 60px; height: 1px;
          background: linear-gradient(90deg, var(--olive-hi), var(--gold));
          opacity: 0.8;
        }
        .cp-hero-heading { position: relative; z-index: 2; margin-bottom: 32px; }
        .cp-hero-line {
          display: block;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 13vw, 13rem);
          line-height: 0.87; letter-spacing: 0.02em;
          color: var(--charcoal);
        }
        .cp-hero-line.gold { color: transparent; }
        .cp-hero-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(1.1rem, 1.5vw, 1.35rem); line-height: 1.75;
          color: var(--body-text); max-width: 480px;
          position: relative; z-index: 2;
        }

        /* ─── CONTACT METHOD CARDS ─── */
        .cp-methods-section { padding: 100px 0 0; }
        .cp-methods {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; background: var(--border);
        }
        @media (max-width: 780px) { .cp-methods { grid-template-columns: 1fr; } }

        .cp-method-card {
          background: var(--cream-s);
          padding: 52px 44px;
          position: relative; overflow: hidden;
          transition: background 0.4s ease;
          display: flex; flex-direction: column; gap: 0;
        }
        .cp-method-card:hover { background: var(--cream-d); }
        .cp-method-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--olive-hi), var(--gold), transparent);
          transform: scaleX(0); transform-origin: center;
          transition: transform 0.55s ease;
        }
        .cp-method-card:hover::before { transform: scaleX(1); }
        .cp-method-icon {
          width: 40px; height: 40px; color: var(--olive-hi);
          margin-bottom: 28px; flex-shrink: 0;
          transition: transform 0.4s ease;
        }
        .cp-method-card:hover .cp-method-icon { transform: translateY(-4px); }
        .cp-method-label {
          font-size: 9.5px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 12px; font-weight: 600;
        }
        .cp-method-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem; letter-spacing: 0.04em; line-height: 1.1;
          color: var(--charcoal); margin-bottom: 6px;
        }
        .cp-method-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1rem; color: var(--muted); margin-bottom: 32px; flex: 1;
        }
        .cp-method-cta {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--olive-hi);
          text-decoration: none;
          border-bottom: 1px solid rgba(138,158,74,0.3); padding-bottom: 4px;
          transition: gap 0.3s ease, color 0.3s ease;
          align-self: flex-start;
        }
        .cp-method-cta:hover { gap: 16px; color: var(--gold); }
        .cp-method-cta svg { transition: transform 0.3s ease; }
        .cp-method-cta:hover svg { transform: translateX(4px); }

        /* ─── HOURS + FORM ─── */
        .cp-content {
          display: grid; grid-template-columns: 1fr 1.1fr;
          gap: 0; align-items: start;
          padding: 100px 0;
          border-top: 1px solid var(--border);
          margin-top: 100px;
        }
        @media (max-width: 900px) { .cp-content { grid-template-columns: 1fr; } }

        .cp-hours-panel {
          padding-right: 80px;
          border-right: 1px solid var(--border);
        }
        @media (max-width: 900px) {
          .cp-hours-panel { padding-right: 0; border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 60px; margin-bottom: 60px; }
        }

        .cp-eyebrow {
          display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
        }
        .cp-eyebrow-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--olive-hi);
        }
        .cp-line-draw {
          height: 1px; width: 52px;
          background: linear-gradient(90deg, var(--olive-hi), var(--gold));
          transform: scaleX(0); transform-origin: left center; flex-shrink: 0;
        }

        .cp-section-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 0.9; letter-spacing: 0.03em;
          color: var(--charcoal); margin-bottom: 48px;
        }
        .cp-section-heading .g {
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 30%, var(--gold-light) 55%, var(--gold) 75%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cp-hours { display: flex; flex-direction: column; }
        .cp-hour-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid var(--border);
          position: relative;
          transition: padding-left 0.35s ease;
        }
        .cp-hour-row:first-child { border-top: 1px solid var(--border); }
        .cp-hour-row.today { padding-left: 16px; }
        .cp-hour-row.today::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px; background: var(--olive-hi);
        }
        .cp-hour-day {
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--muted); font-weight: 600;
          transition: color 0.3s ease;
        }
        .cp-hour-row.today .cp-hour-day { color: var(--charcoal); }
        .cp-hour-time {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.05rem; color: var(--body-text);
          transition: color 0.3s ease;
        }
        .cp-hour-row.today .cp-hour-time { color: var(--olive-hi); }
        .cp-hour-badge {
          font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase;
          background: var(--olive-hi); color: #fff;
          padding: 3px 8px; font-weight: 600; margin-left: 10px;
          display: inline-block;
        }

        /* ─── FORM ─── */
        .cp-form-panel { padding-left: 80px; }
        @media (max-width: 900px) { .cp-form-panel { padding-left: 0; } }

        .cp-form { display: flex; flex-direction: column; gap: 0; }

        .cp-field { position: relative; margin-bottom: 2px; }
        .cp-field-label {
          font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--muted); font-weight: 600;
          position: absolute; top: 20px; left: 24px;
          transition: all 0.3s ease; pointer-events: none; z-index: 2;
        }
        .cp-field.active .cp-field-label,
        .cp-field.filled .cp-field-label {
          top: 12px; font-size: 8px; color: var(--olive-hi);
        }

        .cp-input, .cp-textarea {
          width: 100%; background: var(--cream-s);
          border: none; border-bottom: 1px solid var(--border);
          color: var(--charcoal); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; padding: 36px 24px 16px;
          outline: none; resize: none;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .cp-input:focus, .cp-textarea:focus {
          background: var(--cream-d);
          border-bottom-color: var(--olive-hi);
        }
        .cp-textarea { min-height: 140px; }

        .cp-field-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--olive-hi), var(--gold));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s ease; pointer-events: none;
        }
        .cp-field.active .cp-field-line { transform: scaleX(1); }

        .cp-form-note {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 0.95rem; color: var(--muted); margin: 24px 0 32px;
          line-height: 1.7; padding-left: 24px;
          border-left: 1px solid var(--border);
        }

        .cp-submit-btn {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--charcoal); color: var(--cream);
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.24em;
          text-transform: uppercase; border: none; cursor: pointer;
          padding: 20px 48px; position: relative; overflow: hidden;
          transition: gap 0.35s ease;
          align-self: flex-start;
        }
        .cp-submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: var(--olive);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .cp-submit-btn:hover:not(:disabled) { gap: 22px; }
        .cp-submit-btn:hover:not(:disabled)::before { transform: translateX(0); }
        .cp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cp-submit-btn span, .cp-submit-btn svg { position: relative; z-index: 1; }
        .cp-submit-btn svg { transition: transform 0.35s ease; }
        .cp-submit-btn:hover:not(:disabled) svg { transform: translateX(4px); }

        .cp-error-note {
          margin-top: 16px;
          font-size: 13px; color: #c0392b;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
        }

        /* Success */
        .cp-success {
          padding: 48px; background: var(--cream-s);
          border-left: 2px solid var(--olive-hi);
          display: flex; flex-direction: column; gap: 12px;
        }
        .cp-success-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 2rem;
          letter-spacing: 0.06em; color: var(--charcoal);
        }
        .cp-success-body {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.1rem; color: var(--body-text); line-height: 1.75;
        }

        /* ─── MAP ─── */
        .cp-map-section {
          border-top: 1px solid var(--border);
          padding: 0 0 100px;
        }
        .cp-map-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          padding: 72px 0 40px; flex-wrap: wrap; gap: 20px;
        }
        .cp-map-frame {
          width: 100%; height: 440px; position: relative;
          overflow: hidden;
          filter: grayscale(0.5) contrast(1.05);
        }
        .cp-map-frame iframe { width: 100%; height: 100%; border: none; display: block; }
        .cp-map-frame::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(107,122,58,0.04);
          pointer-events: none; z-index: 2;
        }
        .cp-map-frame::before {
          content: ''; position: absolute; inset: 0;
          border: 1px solid var(--border);
          z-index: 3; pointer-events: none;
        }
        .cp-map-tag {
          position: absolute; bottom: 24px; left: 24px; z-index: 4;
          background: rgba(245,241,232,0.95);
          border-left: 2px solid var(--olive-hi);
          padding: 14px 20px; backdrop-filter: blur(12px);
          display: flex; flex-direction: column; gap: 4px;
        }
        .cp-map-tag-name {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem;
          letter-spacing: 0.08em; color: var(--charcoal);
        }
        .cp-map-tag-addr {
          font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--olive-hi);
        }
        .cp-map-directions {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
          text-decoration: none;
          border-bottom: 1px solid rgba(90,90,90,0.25); padding-bottom: 4px;
          transition: color 0.3s ease, border-color 0.3s ease;
        }
        .cp-map-directions:hover { color: var(--olive-hi); border-bottom-color: var(--olive-hi); }

        /* ─── BOTTOM STRIP ─── */
        .cp-bottom {
          display: grid; grid-template-columns: repeat(2, 1fr);
          border-top: 1px solid var(--border);
        }
        @media (max-width: 640px) { .cp-bottom { grid-template-columns: 1fr; } }
        .cp-bottom-item {
          padding: 48px 52px;
          border-right: 1px solid var(--border);
          background: var(--cream-s);
          display: flex; flex-direction: column; gap: 10px;
        }
        .cp-bottom-item:last-child { border-right: none; }
        .cp-bottom-label {
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--olive-hi); font-weight: 600;
        }
        .cp-bottom-value {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.1rem; line-height: 1.65; color: var(--body-text);
        }
        .cp-bottom-value a { color: var(--olive-hi); text-decoration: none; transition: color 0.3s; }
        .cp-bottom-value a:hover { color: var(--gold); }

        @media (prefers-reduced-motion: reduce) {
          .cp-hero-glow { animation: none !important; }
          * { transition: none !important; }
        }
      `}</style>

      <div className="cp-page" ref={pageRef} id="contact">

        {/* ─── HERO ─── */}
        <section className="cp-hero">
          <div className="cp-hero-glow" aria-hidden="true" />
          <div className="cp-hero-bg-text" aria-hidden="true">CONTACT</div>

          <div className="cp-inner">
            <div className="cp-hero-eyebrow">
              <span className="cp-hero-eyebrow-label">Cutting Image · Staines</span>
              <span className="cp-hero-eyebrow-line" />
            </div>

            <div className="cp-hero-heading">
              <span className="cp-hero-line">Get In</span>
              <span className="cp-hero-line gold">Touch</span>
            </div>

            <p className="cp-hero-sub">
              Walk-ins always welcome. Call us on{" "}
              <a href="tel:01784449005" style={{ color: "var(--olive-hi)", textDecoration: "none" }}>01784 449005</a>{" "}
              or drop us a message below.
            </p>
          </div>
        </section>

        {/* ─── CONTACT METHOD CARDS ─── */}
        <section className="cp-methods-section">
          <div className="cp-inner">
            <div className="cp-methods">
              {CONTACT_METHODS.map((m) => (
                <div key={m.label} className="cp-method-card">
                  <div className="cp-method-icon">{m.icon}</div>
                  <div className="cp-method-label">{m.label}</div>
                  <div className="cp-method-value">{m.value}</div>
                  <div className="cp-method-sub">{m.sub}</div>
                  {m.href && m.cta && (
                    <a
                      href={m.href}
                      className="cp-method-cta"
                      target={m.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      {m.cta}
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                        <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOURS + FORM ─── */}
        <div className="cp-inner">
          <div className="cp-content">

            {/* Hours */}
            <div className="cp-hours-panel">
              <div className="cp-eyebrow">
                <span className="cp-eyebrow-label">When To Visit</span>
                <span className="cp-line-draw" />
              </div>
              <h2 className="cp-section-heading">
                Opening<br /><span className="g">Hours</span>
              </h2>

              <div className="cp-hours">
                {HOURS.map((h) => (
                  <div key={h.day} className={`cp-hour-row${h.day === today ? " today" : ""}`}>
                    <span className="cp-hour-day">
                      {h.day}
                      {h.day === today && <span className="cp-hour-badge">Today</span>}
                    </span>
                    <span className="cp-hour-time">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="cp-form-panel">
              <div className="cp-eyebrow">
                <span className="cp-eyebrow-label">Send A Message</span>
                <span className="cp-line-draw" />
              </div>
              <h2 className="cp-section-heading">
                Say<br /><span className="g">Hello</span>
              </h2>

              {submitted ? (
                <div className="cp-success cp-fade-up">
                  <div className="cp-success-title">Message Received</div>
                  <p className="cp-success-body">
                    Thanks for getting in touch. We&apos;ll get back to you as soon as possible —
                    or give us a call on{" "}
                    <a href="tel:01784449005" style={{ color: "var(--olive-hi)" }}>01784 449005</a>.
                  </p>
                </div>
              ) : (
                <div className="cp-form">
                  {/* Name */}
                  <div className={`cp-field${focused === "name" ? " active" : ""}${form.name ? " filled" : ""}`}>
                    <label className="cp-field-label" htmlFor="cp-name">Your Name</label>
                    <input id="cp-name" className="cp-input" type="text" autoComplete="name"
                      value={form.name} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <span className="cp-field-line" />
                  </div>

                  {/* Email */}
                  <div className={`cp-field${focused === "email" ? " active" : ""}${form.email ? " filled" : ""}`}>
                    <label className="cp-field-label" htmlFor="cp-email">Email Address</label>
                    <input id="cp-email" className="cp-input" type="email" autoComplete="email"
                      value={form.email} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <span className="cp-field-line" />
                  </div>

                  {/* Phone */}
                  <div className={`cp-field${focused === "phone" ? " active" : ""}${form.phone ? " filled" : ""}`}>
                    <label className="cp-field-label" htmlFor="cp-phone">Phone (optional)</label>
                    <input id="cp-phone" className="cp-input" type="tel" autoComplete="tel"
                      value={form.phone} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <span className="cp-field-line" />
                  </div>

                  {/* Message */}
                  <div className={`cp-field${focused === "message" ? " active" : ""}${form.message ? " filled" : ""}`}>
                    <label className="cp-field-label" htmlFor="cp-message">Your Message</label>
                    <textarea id="cp-message" className="cp-textarea"
                      value={form.message} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                      onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    <span className="cp-field-line" />
                  </div>

                  <p className="cp-form-note">
                    Or call us directly on{" "}
                    <a href="tel:01784449005" style={{ color: "var(--olive-hi)", textDecoration: "none" }}>01784 449005</a>{" "}
                    — we&apos;re happy to help.
                  </p>

                  <button
                    className="cp-submit-btn"
                    onClick={handleSubmit}
                    disabled={!canSubmit || sending}
                  >
                    {sending ? (
                      <span>Sending…</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                          <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>

                  {sendError && (
                    <p className="cp-error-note">
                      Something went wrong — please try again or call us on{" "}
                      <a href="tel:01784449005" style={{ color: "var(--olive-hi)" }}>01784 449005</a>.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── MAP ─── */}
        <section className="cp-map-section">
          <div className="cp-inner">
            <div className="cp-map-header">
              <div>
                <div className="cp-eyebrow">
                  <span className="cp-eyebrow-label">Find Us</span>
                  <span className="cp-line-draw" />
                </div>
                <h2 className="cp-section-heading" style={{ marginBottom: 0 }}>
                  We&apos;re In<br /><span className="g">Staines</span>
                </h2>
              </div>
              <a
                href="https://www.google.com/maps/place/Cutting+Image/@51.4350981,-0.5086567,17z/data=!3m1!4b1!4m6!3m5!1s0x487676cac16c3115:0x78edc50a61e9f190!8m2!3d51.4350981!4d-0.5060818!16s%2Fg%2F1tcz7tw9"
                target="_blank"
                rel="noopener noreferrer"
                className="cp-map-directions"
              >
                Get Directions
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
                  <path d="M1 4.5h14M9 1l5 3.5-5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <div className="cp-map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2487.4!2d-0.5086567!3d51.4350981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487676cac16c3115%3A0x78edc50a61e9f190!2sCutting%20Image!5e0!3m2!1sen!2suk!4v1709999999999"
                title="Cutting Image on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="cp-map-tag" aria-hidden="true">
                <span className="cp-map-tag-name">Cutting Image</span>
                <span className="cp-map-tag-addr">2 Kingston Rd · TW18 4LG · 5 min from station</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BOTTOM INFO STRIP ─── */}
        <div className="cp-inner">
          <div className="cp-bottom">
            <div className="cp-bottom-item">
              <span className="cp-bottom-label">Phone</span>
              <span className="cp-bottom-value">
                <a href="tel:01784449005">01784 449005</a><br />
                Give us a call anytime we&apos;re open
              </span>
            </div>
            <div className="cp-bottom-item">
              <span className="cp-bottom-label">Address</span>
              <span className="cp-bottom-value">
                2 Kingston Road<br />
                Staines-upon-Thames, TW18 4LG<br />
                5 min walk from Staines station
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}