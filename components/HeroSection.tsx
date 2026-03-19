"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSiteModeConfig, SITE_MODE } from "@/lib/siteMode";

// ─── November countdown (pre-november mode only) ─────────────────────────────

const NOVEMBER_DATE = new Date("2026-11-03T06:00:00Z"); // midnight CST

function useCountdownTo(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
        done: diff === 0,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="font-mono text-lg font-black tabular-nums text-jacket-amber">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">{label}</span>
    </div>
  );
}

function NovemberCountdown() {
  const { days, hours, minutes, seconds, done } = useCountdownTo(NOVEMBER_DATE);
  if (done) {
    return (
      <span className="font-mono text-sm uppercase tracking-[0.22em] text-jacket-amber animate-pulse">
        Election Day — Go Vote
      </span>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <CountdownUnit value={days} label="days" />
      <span className="font-mono text-jacket-amber/40 text-base self-start mt-1">:</span>
      <CountdownUnit value={hours} label="hrs" />
      <span className="font-mono text-jacket-amber/40 text-base self-start mt-1">:</span>
      <CountdownUnit value={minutes} label="min" />
      <span className="font-mono text-jacket-amber/40 text-base self-start mt-1">:</span>
      <CountdownUnit value={seconds} label="sec" />
    </div>
  );
}

// ─── Status Pill ─────────────────────────────────────────────────────────────

function StatusPill({ label, dotColor }: { label: string; dotColor: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColor}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotColor}`} />
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.22em] text-green-400">
        {label}
      </span>
    </div>
  );
}

// ─── Hero CTA block ───────────────────────────────────────────────────────────

function HeroCTAs() {
  const cfg = getSiteModeConfig();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <Link
        href={cfg.ctaHref}
        className="inline-block rounded-sm bg-jacket-amber px-5 py-2.5 font-mono text-sm font-black uppercase tracking-widest text-jacket-black border border-jacket-amber transition-all hover:bg-jacket-black hover:text-jacket-amber animate-cta-pulse"
      >
        {cfg.ctaLabel}
      </Link>
      {cfg.ctaSecondaryLabel && (
        <Link
          href={cfg.ctaSecondaryHref as string}
          className="inline-block rounded-sm border border-jacket-amber/50 px-5 py-2.5 font-mono text-sm font-black uppercase tracking-widest text-jacket-amber/80 transition-colors hover:border-jacket-amber hover:text-jacket-amber"
        >
          {cfg.ctaSecondaryLabel}
        </Link>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const cfg = getSiteModeConfig();

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(id);
  }, []);

  const fadeIn = (delay: string) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.55s ${delay} ease-out, transform 0.55s ${delay} ease-out`,
  });

  return (
    <section className="relative flex flex-col items-center gap-8 py-6 md:flex-row md:items-center md:justify-between md:gap-12">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed -z-10 right-0 top-0"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Jacket image — mobile: top centered, desktop: right */}
      <div
        className="w-72 shrink-0 sm:w-80 md:order-last md:w-80 lg:w-96 animate-jacket-float"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.1s ease-out" }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 -z-10 rounded-full animate-glow-breathe"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          <Image
            src="/logo.png"
            alt="The Jacket — sponsor patches on a politician's blazer"
            width={512}
            height={512}
            className="relative h-auto w-full opacity-90 drop-shadow-[0_0_40px_rgba(245,158,11,0.18)]"
            priority
          />
        </div>
      </div>

      {/* Text stack */}
      <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left space-y-4">

        {/* Dateline */}
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber" style={fadeIn("0.05s")}>
          {cfg.dateline}
        </p>

        {/* Wordmark */}
        <h1
          className="text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl md:text-7xl"
          style={fadeIn("0.15s")}
        >
          THE<span className="text-jacket-amber">JACKET</span>
        </h1>

        {/* Amber rule */}
        <div
          className="h-1 bg-jacket-amber mx-auto md:mx-0"
          style={{
            width: visible ? "5rem" : "0",
            opacity: visible ? 1 : 0,
            transition: "width 0.5s 0.3s ease-out, opacity 0.4s 0.3s",
          }}
        />

        {/* Tagline */}
        <p className="max-w-xl text-xl text-zinc-300" style={fadeIn("0.35s")}>
          {cfg.heroTagline}
        </p>

        {/* Pull quote — always shown */}
        <blockquote className="max-w-lg w-full" style={fadeIn("0.45s")}>
          <div className="border-t-2 border-jacket-amber/40 pt-3 md:border-t-0 md:border-l-2 md:pt-0 md:pl-4 md:py-1">
            <p className="text-sm italic text-zinc-300 leading-relaxed">
              &ldquo;Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them.&rdquo;
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">— Robin Williams</p>
          </div>
        </blockquote>

        {/* Status pill */}
        <div style={fadeIn("0.5s")}>
          <StatusPill label={cfg.statusPillLabel} dotColor={cfg.statusDotColor} />
        </div>

        {/* Pre-november: show countdown above CTAs */}
        {SITE_MODE === "pre-november" && (
          <div style={fadeIn("0.55s")}>
            <NovemberCountdown />
          </div>
        )}

        {/* CTAs */}
        <div style={fadeIn("0.6s")} className="w-full md:w-auto">
          <HeroCTAs />
        </div>

      </div>
    </section>
  );
}
