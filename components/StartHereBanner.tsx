"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "thejacket_start_dismissed";

export default function StartHereBanner() {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
    setDismissed(wasDismissed);
    setReady(true);
  }, []);

  function dismiss() {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setDismissed(true);
    setExpanded(false);
  }

  // ── MOBILE: fixed bubble, purely out of flow ──
  // Only renders after hydration — position:fixed so zero layout impact
  const mobileBubble = ready && !dismissed ? (
    <div className="fixed bottom-5 right-4 z-50 md:hidden">
      {expanded ? (
        <div className="w-56 rounded-md border border-jacket-amber/60 bg-jacket-black shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-jacket-amber/20 px-3 py-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-jacket-amber">
              Mar 17 Primary
            </span>
            <button onClick={dismiss} className="font-mono text-xs text-zinc-500 hover:text-white" aria-label="Close">
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            <Link href="/booth" onClick={dismiss}
              className="block rounded-sm border border-jacket-amber bg-jacket-amber py-1.5 text-center font-mono text-[11px] font-black uppercase tracking-widest text-jacket-black transition-colors hover:bg-jacket-black hover:text-jacket-amber">
              🗳 Build My Ballot
            </Link>
            <Link href="/races" onClick={dismiss}
              className="block rounded-sm border border-jacket-amber py-1.5 text-center font-mono text-[11px] font-black uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black">
              Browse Races →
            </Link>
          </div>
        </div>
      ) : (
        <button onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 rounded-full border border-jacket-amber/70 bg-jacket-black/90 px-3 py-2 shadow-lg shadow-black/50 backdrop-blur-sm"
          aria-label="New here?">
          <span className="text-sm">🗳</span>
          <span className="font-mono text-[11px] font-black uppercase tracking-widest text-jacket-amber">New here?</span>
        </button>
      )}
    </div>
  ) : null;

  // ── DESKTOP: in-flow banner (md+ only) ──
  // Before hydration: render invisible placeholder with same height → no layout shift
  // After hydration: show real banner OR nothing (if dismissed)
  const desktopBanner = (
    <div className="hidden md:block">
      {!ready ? (
        // Skeleton — exact same height as the real banner, invisible
        // Prevents layout shift between SSR and client render
        <div className="rounded-sm border border-transparent px-5 py-3 opacity-0 pointer-events-none" aria-hidden="true">
          <div className="flex items-center justify-between gap-4 h-[28px]" />
        </div>
      ) : dismissed ? null : (
        <div className="rounded-sm border border-jacket-amber/40 bg-jacket-amber/5 px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-jacket-amber">
                IL Primary — Mar 17
              </p>
              <p className="text-sm font-bold text-jacket-white">
                New here? Start with your ballot — then follow the money.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/booth" onClick={dismiss}
                className="whitespace-nowrap rounded-sm border border-jacket-amber bg-jacket-amber px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest text-jacket-black transition-colors hover:bg-jacket-black hover:text-jacket-amber">
                🗳 Build My Ballot
              </Link>
              <Link href="/races" onClick={dismiss}
                className="whitespace-nowrap rounded-sm border border-jacket-amber px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black">
                Browse Races →
              </Link>
              <button onClick={dismiss}
                className="ml-1 font-mono text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                aria-label="Dismiss">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {mobileBubble}
      {desktopBanner}
    </>
  );
}
