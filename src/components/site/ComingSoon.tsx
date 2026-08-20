/**
 * ComingSoon.tsx
 *
 * Matches the approved screenshot exactly:
 *   - Dark teal (#003633) full-screen background
 *   - Logo centred at top
 *   - French headline + English sub-headline in orange
 *   - Countdown tiles (Days / Hours / Mins / Secs)
 *   - Single CTA button (tel / mailto / url)
 *
 * Accepts ComingSoonSettings so the admin preview reuses this component
 * directly — no separate mockup needed.
 */

import { useEffect, useState } from "react";
import type { ComingSoonSettings } from "@/lib/settings-api";

const brandLogo = "/brand-logo.png";

// ---------------------------------------------------------------------------
// Countdown logic
// ---------------------------------------------------------------------------

type Countdown = { days: number; hours: number; mins: number; secs: number; done: boolean };

function computeCountdown(targetDate: string): Countdown {
  const target = new Date(targetDate).getTime();
  const diff = target - Date.now();

  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, done: true };

  const totalSecs = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    mins: Math.floor((totalSecs % 3600) / 60),
    secs: totalSecs % 60,
    done: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ---------------------------------------------------------------------------
// Countdown tile
// ---------------------------------------------------------------------------

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex min-w-[72px] items-center justify-center rounded-2xl bg-white px-4 py-4 shadow-lg sm:min-w-[88px] sm:px-6 sm:py-5">
        <span className="font-display text-3xl font-extrabold tabular-nums text-[#003633] sm:text-4xl">
          {pad(value)}
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CTA href builder
// ---------------------------------------------------------------------------

function buildCtaHref(type: ComingSoonSettings["ctaType"], value: string): string {
  if (type === "tel") return `tel:${value.replace(/\s/g, "")}`;
  if (type === "mailto") return `mailto:${value}`;
  return value.startsWith("http") ? value : `https://${value}`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ComingSoon({ settings }: { settings: ComingSoonSettings }) {
  const [cd, setCd] = useState<Countdown>(() => computeCountdown(settings.targetDate));

  useEffect(() => {
    // Recompute when targetDate changes (admin live preview)
    setCd(computeCountdown(settings.targetDate));
    const id = setInterval(() => setCd(computeCountdown(settings.targetDate)), 1000);
    return () => clearInterval(id);
  }, [settings.targetDate]);

  const ctaHref = buildCtaHref(settings.ctaType, settings.ctaValue);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: "#003633" }}
    >
      {/* Subtle radial glow matching brand */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,84,80,0.6) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        {/* Logo */}
        <img
          src={brandLogo}
          alt="Co.meet Space"
          className="h-14 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />

        {/* Headlines */}
        <h1 className="mt-10 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          {settings.headlineFr}
        </h1>
        <p className="mt-2 font-display text-lg font-semibold text-[#fd761a]">
          {settings.headlineEn}
        </p>

        {/* Supporting line */}
        <p className="mt-5 text-base text-white/70">
          {settings.supportingLine}
        </p>

        {/* Countdown */}
        {!cd.done && (
          <div className="mt-10 flex flex-wrap justify-center gap-4 sm:gap-6">
            <Tile value={cd.days} label="Jours" />
            <Tile value={cd.hours} label="Heures" />
            <Tile value={cd.mins} label="Mins" />
            <Tile value={cd.secs} label="Secs" />
          </div>
        )}

        {cd.done && (
          <p className="mt-10 font-display text-2xl font-bold text-[#fd761a]">
            Nous sommes ouverts !
          </p>
        )}

        {/* CTA */}
        <a
          href={ctaHref}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#fd761a] px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e86810] hover:shadow-xl"
        >
          {settings.ctaType === "tel" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          )}
          {settings.ctaType === "mailto" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          )}
          {settings.ctaLabel}
        </a>

        {/* Footer note */}
        <p className="mt-8 text-xs text-white/30">
          Co.meet Space · Sfax, Tunisie
        </p>
      </div>
    </div>
  );
}
