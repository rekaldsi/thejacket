"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const PRIMARY_DATE = new Date("2026-03-17T06:00:00Z"); // 12:00 AM CST = 06:00 UTC

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    function tick() {
      const now = Date.now();
      const diff = Math.max(0, PRIMARY_DATE.getTime() - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, total: diff });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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

function Divider() {
  return <span className="font-mono text-jacket-amber/40 text-base self-start mt-1">:</span>;
}

export default function HeroSection() {
  const { days, hours, minutes, seconds, total } = useCountdown();
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(id);
  }, []);

  const elapsed = total === 0;

  const fadeIn = (delay: string) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.55s ${delay} ease-out, transform 0.55s ${delay} ease-out`,
  });

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center gap-8 py-6 md:flex-row md:items-center md:justify-between md:gap-12"
    >
      {/*
        Glow — fixed to viewport so it never causes horizontal scroll.
        Positioned behind the right side of the page near the jacket.
        Very low opacity + massive blur = atmospheric, not a shape.
      */}
      <div
        className="pointer-events-none fixed -z-10 right-0 top-0"
        style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* ── MOBILE: Jacket on top, centered ── */}
      {/* ── DESKTOP: Jacket on right (order-last) ── */}
      <div
        className="w-64 shrink-0 sm:w-72 md:order-last md:w-72 lg:w-80 animate-jacket-float"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.1s ease-out" }}
      >
        <div className="relative">
          {/* Soft glow halo directly behind jacket image */}
          <div
            className="absolute inset-0 -z-10 rounded-full animate-glow-breathe"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)", filter: "blur(30px)" }}
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

      {/* ── Text stack — centered on mobile, left-aligned on desktop ── */}
      <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left space-y-4">

        {/* Dateline */}
        <p
          className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber"
          style={fadeIn("0.05s")}
        >
          Illinois Primary — March 17, 2026 — Cook County
        </p>

        {/* Wordmark */}
        <h1
          className="text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl md:text-7xl"
          style={fadeIn("0.15s")}
        >
          THE<span className="text-jacket-amber">JACKET</span>
        </h1>

        {/* Amber rule — centered on mobile, left on desktop */}
        <div
          className="h-1 bg-jacket-amber mx-auto md:mx-0"
          style={{
            width: visible ? "5rem" : "0",
            opacity: visible ? 1 : 0,
            transition: "width 0.5s 0.3s ease-out, opacity 0.4s 0.3s",
          }}
        />

        {/* Tagline */}
        <p
          className="max-w-xl text-xl text-zinc-300"
          style={fadeIn("0.35s")}
        >
          See who they really work for.
        </p>

        {/* Pull quote */}
        <blockquote
          className="max-w-lg w-full"
          style={fadeIn("0.45s")}
        >
          {/* Border shifts to top on mobile (centered), left on desktop */}
          <div className="border-t-2 border-jacket-amber/40 pt-3 md:border-t-0 md:border-l-2 md:pt-0 md:pl-4 md:py-1">
            <p className="text-sm italic text-zinc-300 leading-relaxed">
              &ldquo;Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them.&rdquo;
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">— Robin Williams</p>
          </div>
        </blockquote>

        {/* Countdown */}
        <div style={fadeIn("0.5s")}>
          {!elapsed ? (
            <div className="flex items-start gap-2">
              <CountdownUnit value={days} label="days" />
              <Divider />
              <CountdownUnit value={hours} label="hrs" />
              <Divider />
              <CountdownUnit value={minutes} label="min" />
              <Divider />
              <CountdownUnit value={seconds} label="sec" />
            </div>
          ) : (
            <span className="font-mono text-sm uppercase tracking-[0.22em] text-jacket-amber animate-pulse">
              Primary Day — Go Vote
            </span>
          )}
        </div>

        {/* CTA — full width on mobile, auto on desktop */}
        <div style={fadeIn("0.62s")} className="w-full md:w-auto">
          <Link
            href="/races"
            className="
              inline-block w-full md:w-auto text-center whitespace-nowrap rounded-sm
              border border-jacket-amber
              bg-jacket-amber px-6 py-3
              font-mono text-sm font-black uppercase tracking-widest
              text-jacket-black
              transition-all duration-200
              hover:bg-jacket-black hover:text-jacket-amber
              focus:outline-none focus:ring-2 focus:ring-jacket-amber focus:ring-offset-2 focus:ring-offset-jacket-black
              animate-cta-pulse
            "
          >
            Find your ballot →
          </Link>
        </div>

      </div>
    </section>
  );
}
