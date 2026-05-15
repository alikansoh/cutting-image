"use client";

/**
 * Cutting Image — Booking Page
 * ──────────────────────────────────────────────────────────────────
 * Flow:
 *  1. Pick service (from live price list)
 *  2. Pick date & time slot
 *  3. Enter contact details
 *  4. Choose payment: Cash | Bank Transfer
 *  5a. Cash   → booking confirmed inline + confirmation email sent via Brevo
 *  5b. Bank Transfer → booking pending inline + bank-details email sent via Brevo
 *
 * Brevo (formerly Sendinblue) transactional email:
 *   POST https://api.brevo.com/v3/smtp/email
 *   Header: api-key: YOUR_BREVO_API_KEY
 *
 * Fonts — add to app/layout.tsx <head> if not already present:
 *   <link rel="preconnect" href="https://fonts.googleapis.com" />
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
 *   <link rel="stylesheet"
 *     href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
 *   />
 */

import { JSX, useState, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

/** ⚠️  Replace with your real Brevo API key (server-side env var in production) */
const BREVO_API_KEY = process.env.NEXT_PUBLIC_BREVO_API_KEY ?? "YOUR_BREVO_API_KEY";

/** Salon's "from" address — must be verified in Brevo */
const FROM_EMAIL = "hello@cuttingimage.co.uk";
const FROM_NAME  = "Cutting Image";

/** Bank transfer details shown in the email */
const BANK_DETAILS = {
  accountName: "Cutting Image",
  sortCode:    "XX-XX-XX",   // ← replace
  accountNo:   "XXXXXXXX",   // ← replace
  reference:   "Your name + service",
};

// ─── DATA (from services page) ───────────────────────────────────────────────

interface Service {
  category: string;
  name: string;
  duration: string;
  price: string;
  priceNum: number;
}

const SERVICES: Service[] = [
  // Haircuts
  { category: "Haircuts", name: "Wash, Haircut, Styling & Beard Trim", duration: "60 mins", price: "£33", priceNum: 33 },
  { category: "Haircuts", name: "Wash, Haircut & Styling",             duration: "30 mins", price: "£18", priceNum: 18 },
  { category: "Haircuts", name: "Wash & Haircut",                      duration: "30 mins", price: "£18", priceNum: 18 },
  { category: "Haircuts", name: "Skin Fade",                           duration: "30 mins", price: "£21", priceNum: 21 },
  { category: "Haircuts", name: "Dry Haircut",                         duration: "30 mins", price: "£16", priceNum: 16 },
  { category: "Haircuts", name: "Crew Cut",                            duration: "30 mins", price: "£16", priceNum: 16 },
  { category: "Haircuts", name: "Clipper Haircut",                     duration: "30 mins", price: "£13", priceNum: 13 },
  // Beard & Shave
  { category: "Beard & Shave", name: "Hot Towel Shave",          duration: "30 mins", price: "£16", priceNum: 16 },
  { category: "Beard & Shave", name: "Beard Trimming & Shaving", duration: "30 mins", price: "£16", priceNum: 16 },
  { category: "Beard & Shave", name: "Beard Trim",               duration: "20 mins", price: "£12", priceNum: 12 },
  // Colour & Styling
  { category: "Colour & Styling", name: "Brazilian Blow Dry", duration: "2 hrs",        price: "£60", priceNum: 60 },
  { category: "Colour & Styling", name: "Hair Colouring",     duration: "1 hr 15 mins", price: "£26", priceNum: 26 },
  // Children
  { category: "Children", name: "Boys — Dry Haircut",    duration: "20 mins", price: "£12", priceNum: 12 },
  { category: "Children", name: "Boys — Wash & Haircut", duration: "30 mins", price: "£14", priceNum: 14 },
  // Waxing & Facials
  { category: "Waxing & Facials", name: "Men's Facial",               duration: "45 mins", price: "£30", priceNum: 30 },
  { category: "Waxing & Facials", name: "Men's Nose and Ears Waxing", duration: "15 mins", price: "£7",  priceNum:  7 },
];

const CATEGORIES = Array.from(new Set(SERVICES.map((s) => s.category)));

// Opening hours (from contact page)
const HOURS: Record<string, { open: number; close: number } | null> = {
  Monday:    { open: 9,  close: 19 },
  Tuesday:   { open: 9,  close: 19 },
  Wednesday: { open: 9,  close: 19 },
  Thursday:  { open: 9,  close: 19 },
  Friday:    { open: 9,  close: 19 },
  Saturday:  { open: 9,  close: 18 },
  Sunday:    { open: 10, close: 17 },
};

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getSlots(dayName: string, durationMins: number): string[] {
  const h = HOURS[dayName];
  if (!h) return [];
  const slots: string[] = [];
  for (let m = h.open * 60; m + durationMins <= h.close * 60; m += 30) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`);
  }
  return slots;
}

function parseDurationMins(d: string): number {
  if (d.includes("2 hrs")) return 120;
  if (d.includes("1 hr 15")) return 75;
  if (d.includes("60")) return 60;
  if (d.includes("45")) return 45;
  if (d.includes("30")) return 30;
  if (d.includes("20")) return 20;
  if (d.includes("15")) return 15;
  return 30;
}

// ─── BREVO EMAIL ─────────────────────────────────────────────────────────────

async function sendEmail(to: string, toName: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
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

function buildCashEmail(name: string, service: Service, date: string, time: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#1C1C1C;padding:36px 48px;text-align:center;">
          <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Cutting Image · Staines</p>
          <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:42px;letter-spacing:0.08em;color:#F5F1E8;line-height:1;">BOOKING CONFIRMED</h1>
        </td></tr>
        <!-- Gold bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#6B4F16,#C9A227,#F0D878,#C9A227,#6B4F16);"></td></tr>
        <!-- Body -->
        <tr><td style="background:#EDE7D6;padding:48px 48px 36px;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Hello, ${name}</p>
          <p style="margin:0 0 32px;font-family:Georgia,serif;font-style:italic;font-size:20px;color:#1C1C1C;line-height:1.6;">Your appointment is confirmed. See you soon!</p>
          <!-- Booking box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #8A9E4A;background:#F5F1E8;margin-bottom:32px;">
            <tr><td style="padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(201,162,39,0.18);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Service</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1C1C1C;">${service.name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(201,162,39,0.18);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Date &amp; Time</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1C1C1C;">${date} at ${time}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(201,162,39,0.18);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Duration</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1C1C1C;">${service.duration}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Price</p>
                    <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#C9A227;letter-spacing:0.04em;">${service.price}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
          <!-- Payment note -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1C1C1C;margin-bottom:32px;">
            <tr><td style="padding:20px 28px;">
              <p style="margin:0;font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Payment Method</p>
              <p style="margin:6px 0 0;font-size:15px;color:#F5F1E8;font-weight:600;">💵 Cash on the day — please bring exact change if possible</p>
            </td></tr>
          </table>
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#5A5A5A;line-height:1.75;">
            If you need to reschedule or cancel, please call us on <a href="tel:01784449005" style="color:#8A9E4A;text-decoration:none;font-weight:700;">01784 449005</a> as soon as possible.
          </p>
        </td></tr>
        <!-- Location -->
        <tr><td style="background:#E3D9C5;padding:28px 48px;border-top:1px solid rgba(201,162,39,0.18);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%">
                <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Find Us</p>
                <p style="margin:6px 0 0;font-size:13px;color:#1C1C1C;line-height:1.65;">2 Kingston Road<br>Staines-upon-Thames<br>TW18 4LG</p>
              </td>
              <td width="50%" align="right">
                <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Call Us</p>
                <p style="margin:6px 0 0;font-size:13px;color:#1C1C1C;">01784 449005</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#1C1C1C;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">© Cutting Image · Staines-upon-Thames</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildBankEmail(name: string, service: Service, date: string, time: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#1C1C1C;padding:36px 48px;text-align:center;">
          <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Cutting Image · Staines</p>
          <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:38px;letter-spacing:0.08em;color:#F5F1E8;line-height:1;">BOOKING RECEIVED</h1>
          <p style="margin:10px 0 0;font-size:11px;letter-spacing:0.14em;color:#C9A227;text-transform:uppercase;">Awaiting Payment</p>
        </td></tr>
        <!-- Gold bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#6B4F16,#C9A227,#F0D878,#C9A227,#6B4F16);"></td></tr>
        <!-- Body -->
        <tr><td style="background:#EDE7D6;padding:48px 48px 36px;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Hello, ${name}</p>
          <p style="margin:0 0 32px;font-family:Georgia,serif;font-style:italic;font-size:20px;color:#1C1C1C;line-height:1.6;">
            We've received your booking request. To confirm your appointment, please complete your bank transfer using the details below.
          </p>
          <!-- Booking box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #C9A227;background:#F5F1E8;margin-bottom:32px;">
            <tr><td style="padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(201,162,39,0.18);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Service</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1C1C1C;">${service.name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(201,162,39,0.18);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Requested Date &amp; Time</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1C1C1C;">${date} at ${time}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#5A5A5A;font-weight:700;">Amount to Transfer</p>
                    <p style="margin:4px 0 0;font-size:32px;font-weight:700;color:#C9A227;letter-spacing:0.04em;">${service.price}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
          <!-- Bank details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1C1C1C;margin-bottom:24px;">
            <tr><td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A227;font-weight:700;">Bank Transfer Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">Account Name</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#F5F1E8;font-weight:700;letter-spacing:0.04em;">${BANK_DETAILS.accountName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">Sort Code</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#F5F1E8;font-weight:700;letter-spacing:0.12em;">${BANK_DETAILS.sortCode}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">Account Number</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#F5F1E8;font-weight:700;letter-spacing:0.12em;">${BANK_DETAILS.accountNo}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">Reference</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#C9A227;font-weight:700;">${name} – ${service.name.split(" ").slice(0,2).join(" ")}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #8A9E4A;padding:0;margin-bottom:28px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#1C1C1C;line-height:1.7;">
                ⚠️ <strong>Your slot is held for 24 hours.</strong> Once we receive your payment, we'll send a final confirmation. If payment isn't received in time, your booking will be released.
              </p>
            </td></tr>
          </table>
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#5A5A5A;line-height:1.75;">
            Questions? Call us on <a href="tel:01784449005" style="color:#8A9E4A;text-decoration:none;font-weight:700;">01784 449005</a>
          </p>
        </td></tr>
        <!-- Location -->
        <tr><td style="background:#E3D9C5;padding:28px 48px;border-top:1px solid rgba(201,162,39,0.18);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%">
                <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Find Us</p>
                <p style="margin:6px 0 0;font-size:13px;color:#1C1C1C;line-height:1.65;">2 Kingston Road<br>Staines-upon-Thames<br>TW18 4LG</p>
              </td>
              <td width="50%" align="right">
                <p style="margin:0;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#8A9E4A;font-weight:700;">Call Us</p>
                <p style="margin:6px 0 0;font-size:13px;color:#1C1C1C;">01784 449005</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#1C1C1C;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#5A5A5A;">© Cutting Image · Staines-upon-Thames</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── STEP TYPES ───────────────────────────────────────────────────────────────

type Step = "service" | "datetime" | "details" | "payment" | "done";
type Payment = "cash" | "bank";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function next28Days(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 1; i <= 28; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function BookingPage(): JSX.Element {
  const [step, setStep]           = useState<Step>("service");
  const [category, setCategory]   = useState<string>("Haircuts");
  const [service, setService]     = useState<Service | null>(null);
  const [date, setDate]           = useState<Date | null>(null);
  const [slot, setSlot]           = useState<string>("");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [payment, setPayment]     = useState<Payment | null>(null);
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState<string | null>(null);

  const days = next28Days();

  const dayName = date ? DAYS[date.getDay()] : "";
  const slots   = service && date ? getSlots(dayName, parseDurationMins(service.duration)) : [];

  const canGoDatetime = !!service;
  const canGoDetails  = !!service && !!date && !!slot;
  const canGoPayment  = !!name.trim() && !!email.trim() && email.includes("@");
  const canSubmit     = !!payment;

  const filteredServices = SERVICES.filter((s) => s.category === category);

  const handleConfirm = useCallback(async () => {
    if (!service || !date || !slot || !payment) return;
    setLoading(true);
    const dateStr = formatDate(date);
    const html = payment === "cash"
      ? buildCashEmail(name, service, dateStr, slot)
      : buildBankEmail(name, service, dateStr, slot);
    const subject = payment === "cash"
      ? `✅ Booking Confirmed — ${service.name} on ${dateStr}`
      : `📋 Complete Your Booking — Bank Transfer Required`;
    await sendEmail(email, name, subject, html);
    setLoading(false);
    setStep("done");
  }, [service, date, slot, payment, name, email]);

  const stepNum: Record<Step, number> = { service: 1, datetime: 2, details: 3, payment: 4, done: 5 };

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
          --gold-light: #F0D878;
          --gold-dim:   #6B4F16;
          --border:     rgba(201,162,39,0.18);
          --olive:      #6B7A3A;
          --olive-hi:   #8A9E4A;
          --olive-lo:   #47531F;
          --muted:      #5A5A5A;
          --body-text:  rgba(28,28,28,0.82);
        }

        .bk-page *, .bk-page *::before, .bk-page *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        .bk-page {
          min-height: 100vh;
          background: var(--cream);
          color: var(--charcoal);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow-x: hidden;
        }
        .bk-page::after {
          content: ''; position: fixed; inset: 0; z-index: 200;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022; pointer-events: none;
        }

        /* ── LAYOUT ── */
        .bk-inner {
          max-width: 1320px; margin: 0 auto;
          padding: 0 80px; position: relative; z-index: 2;
        }
        @media (max-width: 900px) { .bk-inner { padding: 0 24px; } }

        /* ── HERO ── */
        .bk-hero {
          padding: 100px 0 64px; border-bottom: 1px solid var(--border);
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 40px; flex-wrap: wrap;
        }
        .bk-hero-eyebrow {
          display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
        }
        .bk-hero-eyebrow-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--olive-hi);
        }
        .bk-hero-eyebrow-line {
          width: 52px; height: 1px;
          background: linear-gradient(90deg, var(--olive-hi), var(--gold));
        }
        .bk-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 10vw, 9rem);
          line-height: 0.88; letter-spacing: 0.02em; color: var(--charcoal);
          display: block;
        }
        .bk-hero-title-gold {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 10vw, 9rem);
          line-height: 0.88; letter-spacing: 0.02em;
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 30%, var(--gold-light) 55%, var(--gold) 75%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          display: block;
        }
        .bk-hero-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.15rem; color: var(--muted); line-height: 1.75; max-width: 340px;
          align-self: flex-end;
        }

        /* ── STEPPER ── */
        .bk-stepper {
          display: flex; align-items: center; gap: 0;
          padding: 32px 0; border-bottom: 1px solid var(--border);
          overflow-x: auto; scrollbar-width: none;
        }
        .bk-stepper::-webkit-scrollbar { display: none; }
        .bk-step-item {
          display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        }
        .bk-step-num {
          width: 32px; height: 32px; border-radius: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
          transition: all 0.3s;
        }
        .bk-step-num.done    { background: var(--olive-hi); color: #fff; }
        .bk-step-num.active  { background: var(--charcoal); color: var(--cream); }
        .bk-step-num.pending { background: transparent; border: 1px solid var(--border); color: var(--muted); }
        .bk-step-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase; white-space: nowrap;
          transition: color 0.3s;
        }
        .bk-step-label.active  { color: var(--charcoal); }
        .bk-step-label.done    { color: var(--olive-hi); }
        .bk-step-label.pending { color: var(--muted); }
        .bk-step-connector {
          width: 40px; height: 1px;
          background: var(--border);
          margin: 0 8px; flex-shrink: 0;
        }

        /* ── CONTENT BODY ── */
        .bk-body { padding: 64px 0 100px; }

        /* ── SECTION HEADING ── */
        .bk-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 0.9; letter-spacing: 0.03em; color: var(--charcoal);
          margin-bottom: 12px;
        }
        .bk-section-title .g {
          background: linear-gradient(110deg, var(--gold-dim) 0%, var(--gold) 40%, var(--gold-light) 60%, var(--gold) 80%, var(--gold-dim) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .bk-section-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.05rem; color: var(--muted); margin-bottom: 40px; line-height: 1.65;
        }

        /* ── CATEGORY TABS ── */
        .bk-cats {
          display: flex; flex-wrap: wrap; gap: 2px; margin-bottom: 32px;
        }
        .bk-cat-btn {
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase; background: var(--cream-s); border: none;
          color: var(--muted); cursor: pointer; padding: 12px 20px;
          transition: all 0.25s; border-bottom: 2px solid transparent;
        }
        .bk-cat-btn:hover { color: var(--charcoal); background: var(--cream-d); }
        .bk-cat-btn.active { color: var(--olive-hi); background: var(--cream-d); border-bottom-color: var(--olive-hi); }

        /* ── SERVICE LIST ── */
        .bk-svc-list { display: flex; flex-direction: column; }
        .bk-svc-row {
          display: grid; grid-template-columns: 1fr 90px 100px 44px;
          align-items: center;
          padding: 0; border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background 0.25s;
          position: relative; overflow: hidden;
        }
        .bk-svc-row:first-child { border-top: 1px solid var(--border); }
        .bk-svc-row:hover { background: rgba(107,122,58,0.05); }
        .bk-svc-row.selected { background: rgba(107,122,58,0.08); }
        .bk-svc-row::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, var(--olive-hi), var(--gold));
          transform: scaleY(0); transform-origin: center;
          transition: transform 0.35s ease;
        }
        .bk-svc-row.selected::before, .bk-svc-row:hover::before { transform: scaleY(1); }

        .bk-svc-name-wrap { padding: 18px 20px 18px 20px; }
        .bk-svc-name {
          font-weight: 700; font-size: 0.95rem; color: var(--charcoal);
          line-height: 1.3; margin-bottom: 3px;
          transition: color 0.25s;
        }
        .bk-svc-row.selected .bk-svc-name,
        .bk-svc-row:hover .bk-svc-name { color: var(--olive-hi); }
        .bk-svc-cat-tag {
          font-size: 8px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
        }
        .bk-svc-dur {
          font-size: 8.5px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--muted); text-align: center;
          border-left: 1px solid var(--border); padding: 18px 12px;
        }
        .bk-svc-price {
          font-family: 'Bebas Neue', sans-serif; font-size: 2rem;
          letter-spacing: 0.03em;
          background: linear-gradient(118deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-light) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          border-left: 1px solid var(--border); padding: 0 16px; text-align: right;
        }
        .bk-svc-check {
          width: 44px; display: flex; align-items: center; justify-content: center;
          border-left: 1px solid var(--border); align-self: stretch;
        }
        .bk-svc-check-inner {
          width: 18px; height: 18px; border: 1.5px solid var(--border);
          border-radius: 0; display: flex; align-items: center; justify-content: center;
          transition: all 0.25s;
        }
        .bk-svc-row.selected .bk-svc-check-inner {
          background: var(--olive-hi); border-color: var(--olive-hi);
        }
        @media (max-width: 640px) {
          .bk-svc-row { grid-template-columns: 1fr 80px 40px; }
          .bk-svc-dur { display: none; }
        }

        /* ── DATE PICKER ── */
        .bk-date-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 2px; margin-bottom: 40px;
        }
        .bk-date-btn {
          background: var(--cream-s); border: none; cursor: pointer;
          padding: 16px 10px; text-align: center;
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .bk-date-btn:hover { background: var(--cream-d); }
        .bk-date-btn.active { background: var(--charcoal); }
        .bk-date-btn.disabled { opacity: 0.35; cursor: not-allowed; }
        .bk-date-btn::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--olive-hi), var(--gold));
          transform: scaleX(0); transition: transform 0.35s;
        }
        .bk-date-btn.active::before { transform: scaleX(1); }
        .bk-date-dow {
          font-size: 8px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
          transition: color 0.25s;
        }
        .bk-date-btn.active .bk-date-dow { color: rgba(245,241,232,0.6); }
        .bk-date-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem; letter-spacing: 0.04em; color: var(--charcoal);
          display: block; transition: color 0.25s; line-height: 1;
        }
        .bk-date-btn.active .bk-date-num { color: var(--cream); }
        .bk-date-mon {
          font-size: 8px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--muted);
          transition: color 0.25s;
        }
        .bk-date-btn.active .bk-date-mon { color: var(--gold); }

        /* ── TIME SLOTS ── */
        .bk-time-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--olive-hi); margin-bottom: 16px;
          display: block;
        }
        .bk-time-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 2px;
        }
        .bk-time-btn {
          background: var(--cream-s); border: none; cursor: pointer;
          padding: 14px 8px; text-align: center;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1rem; color: var(--body-text);
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .bk-time-btn:hover { background: var(--cream-d); color: var(--charcoal); }
        .bk-time-btn.active {
          background: var(--charcoal); color: var(--gold);
          font-style: normal; font-weight: 700;
        }
        .bk-no-slots {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          color: var(--muted); font-size: 1rem; padding: 20px 0;
        }

        /* ── FORM FIELDS ── */
        .bk-fields { display: flex; flex-direction: column; gap: 2px; max-width: 560px; }
        .bk-field { position: relative; }
        .bk-field-label {
          font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--muted); font-weight: 700;
          position: absolute; top: 20px; left: 24px;
          transition: all 0.3s; pointer-events: none; z-index: 2;
        }
        .bk-field.active .bk-field-label,
        .bk-field.filled .bk-field-label {
          top: 11px; font-size: 8px; color: var(--olive-hi);
        }
        .bk-input {
          width: 100%; background: var(--cream-s); border: none;
          border-bottom: 1px solid var(--border);
          color: var(--charcoal); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; padding: 36px 24px 14px;
          outline: none;
          transition: background 0.3s, border-color 0.3s;
        }
        .bk-input:focus { background: var(--cream-d); border-bottom-color: var(--olive-hi); }
        .bk-field-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--olive-hi), var(--gold));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s; pointer-events: none;
        }
        .bk-field.active .bk-field-line { transform: scaleX(1); }

        /* ── PAYMENT CARDS ── */
        .bk-pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; max-width: 660px; margin-bottom: 40px; }
        @media (max-width: 580px) { .bk-pay-grid { grid-template-columns: 1fr; } }

        .bk-pay-card {
          background: var(--cream-s); border: none; cursor: pointer;
          padding: 36px 32px; text-align: left;
          position: relative; overflow: hidden;
          transition: background 0.3s;
          border-bottom: 2px solid transparent;
        }
        .bk-pay-card:hover { background: var(--cream-d); }
        .bk-pay-card.selected { background: var(--cream-d); border-bottom-color: var(--olive-hi); }
        .bk-pay-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--olive-hi), var(--gold), var(--olive-hi));
          transform: scaleX(0); transform-origin: center;
          transition: transform 0.45s;
        }
        .bk-pay-card.selected::before, .bk-pay-card:hover::before { transform: scaleX(1); }

        .bk-pay-icon {
          font-size: 2rem; margin-bottom: 16px; display: block; line-height: 1;
        }
        .bk-pay-name {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem;
          letter-spacing: 0.06em; color: var(--charcoal); margin-bottom: 8px; display: block;
        }
        .bk-pay-desc {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 0.95rem; color: var(--muted); line-height: 1.6;
        }
        .bk-pay-badge {
          position: absolute; top: 16px; right: 16px;
          width: 20px; height: 20px; border-radius: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border);
          transition: all 0.25s;
        }
        .bk-pay-card.selected .bk-pay-badge {
          background: var(--olive-hi); border-color: var(--olive-hi);
        }

        /* ── BOOKING SUMMARY ── */
        .bk-summary {
          background: var(--cream-s); border-left: 2px solid var(--border);
          padding: 32px 36px; margin-bottom: 36px; max-width: 560px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .bk-summary-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--olive-hi); margin-bottom: 4px;
        }
        .bk-summary-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 12px 0; border-bottom: 1px solid var(--border);
        }
        .bk-summary-row:last-child { border-bottom: none; }
        .bk-summary-key {
          font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted);
        }
        .bk-summary-val {
          font-size: 13px; font-weight: 700; color: var(--charcoal);
          text-align: right; max-width: 200px;
        }
        .bk-summary-price {
          font-family: 'Bebas Neue', sans-serif; font-size: 2rem;
          background: linear-gradient(118deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-light) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* ── BUTTONS ── */
        .bk-btn-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 36px; }
        .bk-btn-primary {
          display: inline-flex; align-items: center; gap: 14px;
          background: var(--charcoal); color: var(--cream);
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.24em;
          text-transform: uppercase; border: none; cursor: pointer;
          padding: 20px 48px; position: relative; overflow: hidden;
          transition: gap 0.35s;
        }
        .bk-btn-primary::before {
          content: ''; position: absolute; inset: 0; background: var(--olive);
          transform: translateX(-100%); transition: transform 0.4s;
        }
        .bk-btn-primary:hover { gap: 22px; }
        .bk-btn-primary:hover::before { transform: translateX(0); }
        .bk-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .bk-btn-primary:disabled::before { display: none; }
        .bk-btn-primary span, .bk-btn-primary svg { position: relative; z-index: 1; }
        .bk-btn-primary svg { transition: transform 0.35s; }
        .bk-btn-primary:hover:not(:disabled) svg { transform: translateX(4px); }

        .bk-btn-back {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--muted); background: none; border: none;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          padding: 0; transition: color 0.25s;
        }
        .bk-btn-back:hover { color: var(--charcoal); }

        /* ── SUCCESS ── */
        .bk-success {
          min-height: 60vh; display: flex; align-items: center; justify-content: center;
          padding: 80px 0;
        }
        .bk-success-inner {
          max-width: 640px; width: 100%;
        }
        .bk-success-icon {
          width: 64px; height: 64px; margin-bottom: 32px;
          display: flex; align-items: center; justify-content: center;
        }
        .bk-success-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 7vw, 6rem);
          line-height: 0.9; letter-spacing: 0.03em; color: var(--charcoal);
          margin-bottom: 24px;
        }
        .bk-success-body {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 1.15rem; color: var(--body-text); line-height: 1.8;
          margin-bottom: 40px;
        }
        .bk-success-box {
          background: var(--cream-s); border-left: 2px solid var(--olive-hi);
          padding: 28px 32px; margin-bottom: 32px;
        }
        .bk-success-box-title {
          font-size: 9px; font-weight: 700; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--olive-hi); margin-bottom: 16px;
        }
        .bk-success-detail {
          font-size: 13px; color: var(--body-text); line-height: 2;
        }

        /* ── BANK PENDING ── */
        .bk-bank-box {
          background: var(--charcoal); padding: 36px;
          margin-bottom: 28px;
        }
        .bk-bank-box-title {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 24px;
        }
        .bk-bank-row {
          display: flex; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .bk-bank-row:last-child { border-bottom: none; }
        .bk-bank-key {
          font-size: 8.5px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,241,232,0.4);
        }
        .bk-bank-val {
          font-size: 13px; font-weight: 700; color: var(--cream); text-align: right;
        }
        .bk-bank-val.gold { color: var(--gold); }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <div className="bk-page" id="booking">

        {/* ── HERO ── */}
        <div className="bk-inner">
          <div className="bk-hero">
            <div>
              <div className="bk-hero-eyebrow">
                <span className="bk-hero-eyebrow-label">Cutting Image · Staines</span>
                <span className="bk-hero-eyebrow-line" />
              </div>
              <span className="bk-hero-title">Book Your</span>
              <span className="bk-hero-title-gold">Appointment</span>
            </div>
            <p className="bk-hero-sub">
              Walk-ins always welcome too — or call us on{" "}
              <a href="tel:01784449005" style={{ color: "var(--olive-hi)", textDecoration: "none" }}>01784 449005</a>.
            </p>
          </div>

          {/* ── STEPPER ── */}
          {step !== "done" && (
            <div className="bk-stepper">
              {(["service","datetime","details","payment"] as Step[]).map((s, i, arr) => {
                const current = stepNum[step];
                const sn = i + 1;
                const state = sn < current ? "done" : sn === current ? "active" : "pending";
                const labels: Record<string, string> = {
                  service: "Service", datetime: "Date & Time", details: "Your Details", payment: "Payment"
                };
                return (
                  <div key={s} className="bk-step-item">
                    <div className={`bk-step-num ${state}`}>
                      {state === "done" ? (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : sn}
                    </div>
                    <span className={`bk-step-label ${state}`}>{labels[s]}</span>
                    {i < arr.length - 1 && <span className="bk-step-connector" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── BODY ── */}
          <div className="bk-body">

            {/* ── STEP 1: SERVICE ── */}
            {step === "service" && (
              <div>
                <h2 className="bk-section-title">Choose Your <span className="g">Service</span></h2>
                <p className="bk-section-sub">Select a service to see availability and pricing.</p>

                <div className="bk-cats">
                  {CATEGORIES.map((c) => (
                    <button key={c} className={`bk-cat-btn${category === c ? " active" : ""}`}
                      onClick={() => setCategory(c)}>{c}</button>
                  ))}
                </div>

                <div className="bk-svc-list">
                  {filteredServices.map((svc) => (
                    <div
                      key={svc.name}
                      className={`bk-svc-row${service?.name === svc.name ? " selected" : ""}`}
                      onClick={() => setService(svc)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setService(svc)}
                    >
                      <div className="bk-svc-name-wrap">
                        <div className="bk-svc-name">{svc.name}</div>
                        <div className="bk-svc-cat-tag">{svc.duration}</div>
                      </div>
                      <div className="bk-svc-dur">{svc.duration}</div>
                      <div className="bk-svc-price">{svc.price}</div>
                      <div className="bk-svc-check">
                        <div className="bk-svc-check-inner">
                          {service?.name === svc.name && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                              <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bk-btn-row">
                  <button
                    className="bk-btn-primary"
                    disabled={!canGoDatetime}
                    onClick={() => setStep("datetime")}
                  >
                    <span>Choose Date & Time</span>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: DATE & TIME ── */}
            {step === "datetime" && (
              <div>
                <h2 className="bk-section-title">Pick Your <span className="g">Date</span></h2>
                <p className="bk-section-sub">
                  Showing availability for <strong>{service?.name}</strong> ({service?.duration})
                </p>

                <div className="bk-date-grid">
                  {days.map((d) => {
                    const dn = DAYS[d.getDay()];
                    const hasSlots = HOURS[dn] !== null;
                    const isSelected = date?.toDateString() === d.toDateString();
                    return (
                      <button
                        key={d.toISOString()}
                        className={`bk-date-btn${isSelected ? " active" : ""}${!hasSlots ? " disabled" : ""}`}
                        onClick={() => { if (hasSlots) { setDate(d); setSlot(""); } }}
                        disabled={!hasSlots}
                      >
                        <div className="bk-date-dow">{dn.slice(0,3)}</div>
                        <span className="bk-date-num">{d.getDate()}</span>
                        <div className="bk-date-mon">{d.toLocaleDateString("en-GB",{month:"short"})}</div>
                      </button>
                    );
                  })}
                </div>

                {date && (
                  <div style={{ marginBottom: 40 }}>
                    <span className="bk-time-label">Available times — {formatDate(date)}</span>
                    {slots.length === 0 ? (
                      <p className="bk-no-slots">No available slots on this day.</p>
                    ) : (
                      <div className="bk-time-grid">
                        {slots.map((s) => (
                          <button
                            key={s}
                            className={`bk-time-btn${slot === s ? " active" : ""}`}
                            onClick={() => setSlot(s)}
                          >{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bk-btn-row">
                  <button className="bk-btn-back" onClick={() => setStep("service")}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
                      <path d="M13 4H1M7 1L1 4l6 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </button>
                  <button
                    className="bk-btn-primary"
                    disabled={!canGoDetails}
                    onClick={() => setStep("details")}
                  >
                    <span>Enter Your Details</span>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: DETAILS ── */}
            {step === "details" && (
              <div>
                <h2 className="bk-section-title">Your <span className="g">Details</span></h2>
                <p className="bk-section-sub">We&apos;ll send your confirmation to the email below.</p>

                <div className="bk-fields">
                  {[
                    { id: "name",  label: "Full Name",       type: "text",  val: name,  set: setName  },
                    { id: "email", label: "Email Address",   type: "email", val: email, set: setEmail },
                    { id: "phone", label: "Phone (optional)", type: "tel",   val: phone, set: setPhone },
                  ].map((f) => (
                    <div
                      key={f.id}
                      className={`bk-field${focused === f.id ? " active" : ""}${f.val ? " filled" : ""}`}
                    >
                      <label className="bk-field-label" htmlFor={`bk-${f.id}`}>{f.label}</label>
                      <input
                        id={`bk-${f.id}`} className="bk-input" type={f.type}
                        autoComplete={f.id === "name" ? "name" : f.id}
                        value={f.val}
                        onFocus={() => setFocused(f.id)}
                        onBlur={() => setFocused(null)}
                        onChange={(e) => f.set(e.target.value)}
                      />
                      <span className="bk-field-line" />
                    </div>
                  ))}
                </div>

                <div className="bk-btn-row">
                  <button className="bk-btn-back" onClick={() => setStep("datetime")}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
                      <path d="M13 4H1M7 1L1 4l6 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </button>
                  <button
                    className="bk-btn-primary"
                    disabled={!canGoPayment}
                    onClick={() => setStep("payment")}
                  >
                    <span>Choose Payment</span>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: PAYMENT ── */}
            {step === "payment" && service && date && (
              <div>
                <h2 className="bk-section-title">How Will You <span className="g">Pay?</span></h2>
                <p className="bk-section-sub">Choose your preferred payment method below.</p>

                {/* Summary */}
                <div className="bk-summary">
                  <span className="bk-summary-label">Booking Summary</span>
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Service</span>
                    <span className="bk-summary-val">{service.name}</span>
                  </div>
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Date</span>
                    <span className="bk-summary-val">{formatDate(date)}</span>
                  </div>
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Time</span>
                    <span className="bk-summary-val">{slot}</span>
                  </div>
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Duration</span>
                    <span className="bk-summary-val">{service.duration}</span>
                  </div>
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Name</span>
                    <span className="bk-summary-val">{name}</span>
                  </div>
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Total</span>
                    <span className="bk-summary-price">{service.price}</span>
                  </div>
                </div>

                {/* Payment options */}
                <div className="bk-pay-grid">
                  <button
                    className={`bk-pay-card${payment === "cash" ? " selected" : ""}`}
                    onClick={() => setPayment("cash")}
                  >
                    <div className="bk-pay-badge">
                      {payment === "cash" && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="bk-pay-icon">💵</span>
                    <span className="bk-pay-name">Cash</span>
                    <p className="bk-pay-desc">Pay in person on the day. Please bring the exact amount if possible.</p>
                  </button>
                  <button
                    className={`bk-pay-card${payment === "bank" ? " selected" : ""}`}
                    onClick={() => setPayment("bank")}
                  >
                    <div className="bk-pay-badge">
                      {payment === "bank" && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="bk-pay-icon">🏦</span>
                    <span className="bk-pay-name">Bank Transfer</span>
                    <p className="bk-pay-desc">We&apos;ll email you our bank details. Your slot is held for 24 hours.</p>
                  </button>
                </div>

                <div className="bk-btn-row">
                  <button className="bk-btn-back" onClick={() => setStep("details")}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
                      <path d="M13 4H1M7 1L1 4l6 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </button>
                  <button
                    className="bk-btn-primary"
                    disabled={!canSubmit || loading}
                    onClick={handleConfirm}
                  >
                    {loading ? (
                      <span>Sending…</span>
                    ) : (
                      <>
                        <span>Confirm Booking</span>
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                          <path d="M1 5h16M11 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 5: DONE ── */}
            {step === "done" && service && date && (
              <div className="bk-success">
                <div className="bk-success-inner">
                  {payment === "cash" ? (
                    <>
                      <div className="bk-success-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                          <circle cx="32" cy="32" r="31" stroke="#8A9E4A" strokeWidth="1.5"/>
                          <path d="M20 33l8 8 16-18" stroke="#8A9E4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h2 className="bk-success-title">
                        Booking<br />Confirmed ✓
                      </h2>
                      <p className="bk-success-body">
                        We&apos;ll see you on <strong>{formatDate(date)} at {slot}</strong>. A confirmation email has been sent to <strong>{email}</strong>.
                      </p>
                      <div className="bk-success-box">
                        <div className="bk-success-box-title">Your Appointment</div>
                        <div className="bk-success-detail">
                          <strong>{service.name}</strong><br/>
                          {formatDate(date)} at {slot}<br/>
                          Duration: {service.duration}<br/>
                          Payment: Cash on the day — <strong>{service.price}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bk-success-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                          <circle cx="32" cy="32" r="31" stroke="#C9A227" strokeWidth="1.5"/>
                          <path d="M32 20v14M32 38v4" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <h2 className="bk-success-title">
                        Almost<br />There!
                      </h2>
                      <p className="bk-success-body">
                        Your slot for <strong>{formatDate(date)} at {slot}</strong> is held for 24 hours.
                        Please complete your bank transfer to confirm. Details have been emailed to <strong>{email}</strong>.
                      </p>
                      <div className="bk-bank-box">
                        <div className="bk-bank-box-title">Bank Transfer Details</div>
                        <div className="bk-bank-row">
                          <span className="bk-bank-key">Account Name</span>
                          <span className="bk-bank-val">{BANK_DETAILS.accountName}</span>
                        </div>
                        <div className="bk-bank-row">
                          <span className="bk-bank-key">Sort Code</span>
                          <span className="bk-bank-val">{BANK_DETAILS.sortCode}</span>
                        </div>
                        <div className="bk-bank-row">
                          <span className="bk-bank-key">Account Number</span>
                          <span className="bk-bank-val">{BANK_DETAILS.accountNo}</span>
                        </div>
                        <div className="bk-bank-row">
                          <span className="bk-bank-key">Reference</span>
                          <span className="bk-bank-val gold">{name} – {service.name.split(" ").slice(0,2).join(" ")}</span>
                        </div>
                        <div className="bk-bank-row">
                          <span className="bk-bank-key">Amount</span>
                          <span className="bk-bank-val gold">{service.price}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <a href="tel:01784449005" style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em",
                      textTransform: "uppercase", color: "var(--olive-hi)",
                      textDecoration: "none", borderBottom: "1px solid rgba(138,158,74,0.3)",
                      paddingBottom: 4,
                    }}>
                      Call Us · 01784 449005
                    </a>
                    <button
                      onClick={() => {
                        setStep("service"); setService(null); setDate(null);
                        setSlot(""); setName(""); setEmail(""); setPhone(""); setPayment(null);
                      }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em",
                        textTransform: "uppercase", color: "var(--muted)",
                        borderBottom: "1px solid var(--border)", paddingBottom: 4,
                      }}
                    >
                      Book Another
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  );
}