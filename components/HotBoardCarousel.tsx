"use client";

/**
 * HotBoardCarousel — Animated live signal feed for TheJacket homepage.
 *
 * Auto-scrolling horizontal carousel of hot signals.
 * Client component (motion requires browser).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HotSignal } from "./HotBoard";

const SEVERITY_CONFIG = {
  critical: {
    dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]",
    card: "border-red-500/50 bg-red-950/20",
    badge: "text-red-400 bg-red-950/40",
    name: "text-red-300",
    pulse: "animate-pulse",
  },
  high: {
    dot: "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.7)]",
    card: "border-orange-400/40 bg-orange-950/15",
    badge: "text-orange-400 bg-orange-950/30",
    name: "text-jacket-amber",
    pulse: "",
  },
  medium: {
    dot: "bg-yellow-400",
    card: "border-zinc-600/50 bg-zinc-900/60",
    badge: "text-yellow-400 bg-zinc-800",
    name: "text-zinc-200",
    pulse: "",
  },
};

function typeIcon(type: HotSignal["type"]) {
  if (type === "red_flag") return "🚩";
  if (type === "donor") return "💰";
  return "📰";
}

function typeLabel(type: HotSignal["type"]) {
  if (type === "red_flag") return "FLAG";
  if (type === "donor") return "DONOR";
  return "NEWS";
}

function formatOffice(office: string) {
  return (office ?? "")
    .replace("Cook County ", "")
    .replace("Illinois ", "IL ")
    .replace("U.S. House — ", "")
    .replace("U.S. Senate (Illinois)", "IL Senate")
    .replace(" Democratic Primary", "");
}

type Props = {
  signals: HotSignal[];
};

/** Seeded pseudo-random — deterministic within a 5-minute window, different each visit */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(Math.sin(seed + i) * 10000) % (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function HotBoardCarousel({ signals }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);

  // Shuffle on client — seed changes every 5 minutes so each visit feels fresh.
  // Split signals: top 1/3 by severity stay weighted front, rest shuffled freely.
  const [shuffled, setShuffled] = useState<HotSignal[]>(signals);
  useEffect(() => {
    const seed = Math.floor(Date.now() / (1000 * 60 * 5)); // new seed every 5 min
    const topCount = Math.max(1, Math.floor(signals.length / 3));
    const top = signals.slice(0, topCount);       // keep critical/high at front
    const rest = seededShuffle(signals.slice(topCount), seed);
    setShuffled([...top, ...rest]);
  }, [signals]);

  // Duplicate signals so the loop is seamless
  const items = shuffled.length > 0 ? [...shuffled, ...shuffled] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || shuffled.length === 0) return;

    const SPEED = 0.5; // px per frame — slow, readable

    function step() {
      if (!track) return;
      if (!paused) {
        posRef.current += SPEED;
        // Reset when we've scrolled exactly one half (the duplicate)
        const halfWidth = track.scrollWidth / 2;
        if (posRef.current >= halfWidth) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [paused, shuffled.length]);

  if (shuffled.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Left/right fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex gap-3 will-change-transform"
        style={{ width: "max-content" }}
      >
        {items.map((signal, i) => {
          const cfg = SEVERITY_CONFIG[signal.severity] ?? SEVERITY_CONFIG.medium;
          return (
            <Link
              key={`${signal.candidateId}-${signal.type}-${i}`}
              href={`/candidate/${signal.candidateId}`}
              className={`group flex w-72 shrink-0 flex-col gap-2 rounded-sm border p-3 transition-colors hover:border-jacket-amber ${cfg.card}`}
              tabIndex={i >= signals.length ? -1 : 0}
              aria-hidden={i >= signals.length}
            >
              {/* Header row */}
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot} ${cfg.pulse}`} />
                <span className={`truncate font-mono text-[10px] font-bold uppercase tracking-widest ${cfg.name} group-hover:text-jacket-amber`}>
                  {signal.candidateName}
                </span>
                <span className={`ml-auto shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${cfg.badge}`}>
                  {typeIcon(signal.type)} {typeLabel(signal.type)}
                </span>
              </div>

              {/* Office */}
              <p className="font-mono text-[9px] uppercase tracking-wide text-zinc-600">
                {formatOffice(signal.office)}
              </p>

              {/* Label */}
              <p className="line-clamp-2 text-xs font-bold leading-snug text-zinc-100 group-hover:text-jacket-amber">
                {(signal.label ?? "").length > 80
                  ? (signal.label ?? "").slice(0, 80) + "…"
                  : (signal.label ?? "")}
              </p>

              {/* Detail */}
              <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
                {signal.detail}
              </p>

              <span className="mt-auto font-mono text-[10px] text-zinc-700 group-hover:text-jacket-amber">
                View profile →
              </span>
            </Link>
          );
        })}
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="pointer-events-none absolute bottom-2 right-20 z-20">
          <span className="rounded bg-zinc-900/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
            ⏸ paused
          </span>
        </div>
      )}
    </div>
  );
}
