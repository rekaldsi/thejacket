"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { translations } from "@/lib/translations";
import ShareButton from "@/components/ShareButton";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  const d = translations[lang];

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
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={close}
            aria-hidden="true"
          />

          {/* Menu panel — z-[60] ensures it covers the fixed StartHereBanner pill (z-50) */}
          <div className="fixed left-0 right-0 top-0 z-[60] border-b border-jacket-border bg-jacket-black md:hidden">
            {/* Header row with logo + lang toggle + close */}
            <div className="flex items-center justify-between border-b border-jacket-border px-4 py-4">
              <Link href="/" onClick={close} className="text-xl font-extrabold uppercase tracking-tight text-jacket-white">
                THE<span className="text-jacket-amber">JACKET</span>
              </Link>
              <div className="flex items-center gap-3">
                <LangToggle />
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
            </div>

            {/* Nav links — centered, generous tap targets */}
            <nav className="flex flex-col items-center px-6 py-4 gap-1">
              {/* Results — highlighted post-primary */}
              <Link
                href="/results"
                onClick={close}
                className="w-full rounded-sm py-4 text-center font-mono text-base font-bold uppercase tracking-widest text-green-400 transition-colors active:bg-green-400/10 hover:text-green-300 border-b border-jacket-border/30 flex items-center justify-center gap-2"
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Results
              </Link>
              {[
                { href: "/races", label: d.nav_races },
                { href: "/judges", label: d.nav_judges },
                { href: "/scorecard", label: d.nav_scorecard },
                { href: "/about", label: d.nav_about },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="w-full rounded-sm py-5 text-center font-mono text-base uppercase tracking-widest text-zinc-200 transition-colors active:bg-jacket-amber/10 hover:text-jacket-amber border-b border-jacket-border/30"
                >
                  {label}
                </Link>
              ))}

              {/* Bills — live now */}
              <Link
                href="/bills"
                onClick={close}
                className="w-full rounded-sm py-5 text-center font-mono text-base uppercase tracking-widest text-jacket-white border-b border-jacket-border/30 hover:text-jacket-amber transition-colors"
              >
                Bills
              </Link>

              {/* My Ballot — coming November 2026 */}
              <Link
                href="/my-ballot"
                onClick={close}
                className="w-full rounded-sm py-5 text-center font-mono text-base uppercase tracking-widest text-zinc-600 opacity-40 border-b border-jacket-border/30"
                title="Coming November 2026"
              >
                My Ballot
              </Link>

              {/* Booth Mode */}
              <Link
                href="/booth"
                onClick={close}
                className="w-full rounded-sm py-5 text-center font-mono text-base font-bold uppercase tracking-widest text-jacket-amber border-b border-jacket-border/30 hover:text-white transition-colors"
              >
                {d.nav_booth_mode}
              </Link>

              {/* Share button — bottom of menu, subtle */}
              <div className="w-full pt-4 pb-2 flex justify-center">
                <ShareButton className="w-full justify-center" />
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
