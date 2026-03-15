"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "thejacket_start_dismissed";

export default function StartHereBanner() {
  // null = not yet read from storage (avoids flash)
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setDismissed(true);
    setExpanded(false);
  }

  // Not yet hydrated — render nothing to avoid layout shift
  if (dismissed === null) return null;
  // Already dismissed this session
  if (dismissed) return null;

  return (
    <>
      {/* ── MOBILE: floating bubble ── */}
      <div className="fixed bottom-5 right-4 z-40 md:hidden">
        {expanded ? (
          <div className="w-72 rounded-md border border-jacket-amber/60 bg-jacket-black shadow-xl">
            <div className="flex items-center justify-between border-b border-jacket-amber/30 px-4 py-2.5">
              <span className="font-mono text-[11px] font-black uppercase tracking-widest text-jacket-amber">
                March 17 Primary
              </span>
              <button
                onClick={dismiss}
                className="ml-2 font-mono text-xs text-zinc-500 hover:text-white"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 text-sm text-zinc-300">
              New here? Start with your ballot — then follow the money.
            </div>
            <div className="flex flex-col gap-2 px-4 pb-4">
              <Link
                href="/booth"
                onClick={dismiss}
                className="block rounded-sm bg-jacket-amber py-2 text-center font-mono text-xs font-black uppercase tracking-widest text-jacket-black"
              >
                🗳 Build My Ballot
              </Link>
              <Link
                href="/races"
                onClick={dismiss}
                className="block rounded-sm border border-jacket-amber py-2 text-center font-mono text-xs font-black uppercase tracking-widest text-jacket-amber"
              >
                Browse All Races →
              </Link>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 rounded-full border border-jacket-amber bg-jacket-black px-4 py-2.5 shadow-lg shadow-black/40"
            aria-label="New here? Start here"
          >
            <span className="text-base">🗳</span>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-jacket-amber">
              New here?
            </span>
          </button>
        )}
      </div>

      {/* ── DESKTOP: slim top banner ── */}
      <div className="hidden md:block">
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
              <Link
                href="/booth"
                onClick={dismiss}
                className="whitespace-nowrap rounded-sm bg-jacket-amber px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest text-jacket-black transition-colors hover:bg-amber-400"
              >
                🗳 Build My Ballot
              </Link>
              <Link
                href="/races"
                onClick={dismiss}
                className="whitespace-nowrap rounded-sm border border-jacket-amber px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black"
              >
                Browse Races →
              </Link>
              <button
                onClick={dismiss}
                className="ml-1 font-mono text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
