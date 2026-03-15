"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() { setOpen(false); }

  return (
    <>
      {/* Hamburger / X toggle */}
      <button
        className="flex items-center justify-center p-1 text-zinc-300 md:hidden"
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

      {/* Full-screen overlay menu */}
      {open && (
        <>
          {/* Backdrop — taps outside close the menu */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={close}
            aria-hidden="true"
          />

          {/* Menu panel — slides down from top, solid background */}
          <div className="fixed left-0 right-0 top-0 z-50 border-b border-jacket-border bg-jacket-black md:hidden">
            {/* Header row with logo + close */}
            <div className="flex items-center justify-between border-b border-jacket-border px-4 py-4">
              <Link href="/" onClick={close} className="text-xl font-extrabold uppercase tracking-tight text-jacket-white">
                THE<span className="text-jacket-amber">JACKET</span>
              </Link>
              <button
                onClick={close}
                className="flex items-center justify-center p-1 text-zinc-300"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-4 py-2">
              {[
                { href: "/races", label: "Races" },
                { href: "/judges", label: "Judges" },
                { href: "/scorecard", label: "Scorecard" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="border-b border-jacket-border/40 py-4 font-mono text-sm uppercase tracking-widest text-zinc-300 transition-colors hover:text-jacket-amber"
                >
                  {label}
                </Link>
              ))}

              {/* Booth Mode CTA */}
              <div className="pb-4 pt-5">
                <Link
                  href="/booth"
                  onClick={close}
                  className="block rounded-sm border border-jacket-amber bg-jacket-amber py-3 text-center font-mono text-sm font-black uppercase tracking-widest text-jacket-black transition-colors hover:bg-jacket-black hover:text-jacket-amber"
                >
                  🗳 Booth Mode — Build Your Ballot
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
