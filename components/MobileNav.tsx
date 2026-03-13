"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="flex items-center justify-center p-1 text-zinc-300 sm:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? (
            <>
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 w-full border-b border-jacket-border bg-jacket-black px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-4 text-xs uppercase tracking-widest text-zinc-300">
            <Link href="/races" className="hover:text-jacket-amber" onClick={() => setOpen(false)}>
              Races
            </Link>
            <Link href="/judges" className="hover:text-jacket-amber" onClick={() => setOpen(false)}>
              Judges
            </Link>
            <Link href="/scorecard" className="hover:text-jacket-amber" onClick={() => setOpen(false)}>
              Scorecard
            </Link>
            <Link href="/about" className="hover:text-jacket-amber" onClick={() => setOpen(false)}>
              About
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
