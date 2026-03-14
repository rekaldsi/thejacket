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
  return <span className="font-mono text-jacket-amber/50 text-base pb-3">:</span>;
}

export default function HeroSection() {
  const { days, hours, minutes, seconds, total } = useCountdown();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance on mount with a tiny delay so CSS transition fires
    const id = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(id);
  }, []);

  const elapsed = total === 0;

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center gap-6 py-4 md:flex-row md:items-center md:justify-between md:gap-12 md:py-6 overflow-hidden"
    >
      {/* Background ambient glow — radiates from behind jacket */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Ambient radial glow — right side (behind jacket) */}
        <div className="absolute right-[-60px] top-[-60px] h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[80px] animate-glow-breathe" />
        {/* Subtle warm fill — center-left */}
        <div className="absolute left-[20%] bottom-[-40px] h-[280px] w-[280px] rounded-full bg-amber-500/3 blur-[100px]" />
      </div>

      {/* ── Left: Text stack ── */}
      <div
        className={`flex-1 space-y-3 md:space-y-4 transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {/* Dateline */}
        <p
          className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber transition-all duration-500 delay-[50ms]"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.5s 0.05s, transform 0.5s 0.05s" }}
        >
          Illinois Primary — March 17, 2026 — Cook County
        </p>

        {/* Wordmark */}
        <h1
          className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl md:text-7xl"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.55s 0.15s, transform 0.55s 0.15s" }}
        >
          THE<span className="text-jacket-amber">JACKET</span>
        </h1>

        {/* Amber rule */}
        <div
          className="h-1 bg-jacket-amber"
          style={{
            width: visible ? "5rem" : "0",
            opacity: visible ? 1 : 0,
            transition: "width 0.5s 0.3s ease-out, opacity 0.5s 0.3s",
          }}
        />

        {/* Tagline */}
        <p
          className="max-w-xl text-lg sm:text-xl text-zinc-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.5s 0.35s, transform 0.5s 0.35s" }}
        >
          See who they really work for.
        </p>

        {/* Pull quote */}
        <blockquote
          className="max-w-lg"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.5s 0.45s, transform 0.5s 0.45s" }}
        >
          <div className="border-l-2 border-jacket-amber/40 pl-4 py-1">
            <p className="text-sm italic text-zinc-300 leading-relaxed">
              &ldquo;Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them.&rdquo;
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">— Robin Williams</p>
          </div>
        </blockquote>

        {/* Countdown — sits above button, full row on mobile */}
        <div
          className="pt-2"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.5s 0.5s, transform 0.5s 0.5s" }}
        >
          {!elapsed ? (
            <div className="flex items-end gap-2">
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

        {/* CTA Button */}
        <div
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.5s 0.62s, transform 0.5s 0.62s" }}
        >
          <Link
            href="/races"
            className="inline-block w-full sm:w-auto text-center whitespace-nowrap rounded-sm bg-jacket-amber px-5 py-3 font-mono text-sm font-black uppercase tracking-widest text-jacket-black transition-all hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-cta-pulse"
          >
            Find your ballot →
          </Link>
        </div>
      </div>

      {/* ── Jacket visual — compact on mobile, full-size on desktop ── */}
      <div
        className="w-44 shrink-0 sm:w-52 md:w-72 lg:w-80 animate-jacket-float"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.2s" }}
      >
        {/* Glow ring behind jacket */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-[50px] scale-75 animate-glow-breathe" />
          <Image
            src="/logo.png"
            alt="The Jacket — sponsor patches on a politician's blazer"
            width={512}
            height={512}
            className="relative h-auto w-full opacity-90 drop-shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
