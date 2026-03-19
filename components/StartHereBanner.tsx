"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SITE_MODE, getSiteModeConfig } from "@/lib/siteMode";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

const STORAGE_KEY = "thejacket_start_dismissed";
const NOVEMBER_DATE = new Date("2026-11-03T06:00:00Z");

function daysUntilNovember(): number {
  return Math.max(0, Math.ceil((NOVEMBER_DATE.getTime() - Date.now()) / 86_400_000));
}

// ── Translate the cfg labels based on language ────────────────────────────────

function getLocalizedCfg(lang: "en" | "es") {
  const cfg = getSiteModeConfig();
  const isEs = lang === "es";
  if (!isEs) return cfg;

  // Per-mode translations of the CTA labels
  const modeLabels: Record<string, { pill: string; header: string; primary: string; secondary: string | null }> = {
    "pre-primary": {
      pill: "17 Mar · Cuenta regresiva",
      header: "Primaria en cuenta regresiva",
      primary: "Encuentra tu boleta →",
      secondary: "Ver todas las contiendas",
    },
    "primary-results": {
      pill: "● Resultados disponibles",
      header: "Los resultados están disponibles",
      primary: "Todos los resultados →",
      secondary: "⚖️ Resultados Judiciales",
    },
    "between-elections": {
      pill: "● Inteligencia en vivo",
      header: "Inteligencia Cívica",
      primary: "Ver Proyectos →",
      secondary: "Archivo de resultados",
    },
    "pre-november": {
      pill: `● 3 Nov · Cuenta regresiva`,
      header: "General del 3 de Noviembre",
      primary: "Mi Boleta →",
      secondary: "Archivo de resultados",
    },
    "november-results": {
      pill: "● Resultados del 3 Nov",
      header: "Los resultados están disponibles",
      primary: "Todos los resultados →",
      secondary: "⚖️ Resultados Judiciales",
    },
  };

  const m = modeLabels[SITE_MODE];
  if (!m) return cfg;

  return {
    ...cfg,
    startHerePillText: m.pill,
    startHereHeader: m.header,
    startHerePrimaryLabel: m.primary,
    startHereSecondaryLabel: m.secondary,
  };
}

export default function StartHereBanner() {
  const { lang } = useLanguage();
  const d = translations[lang];
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
    setDismissed(wasDismissed);
    setDaysLeft(daysUntilNovember());
    setReady(true);
  }, []);

  // Hide entirely in between-elections mode
  if (SITE_MODE === "between-elections") return null;

  function dismiss() {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setDismissed(true);
    setExpanded(false);
  }

  const cfg = getLocalizedCfg(lang);
  const isGreen = SITE_MODE === "primary-results" || SITE_MODE === "november-results";
  const dotColor = isGreen ? "bg-green-500" : "bg-jacket-amber";
  const dotPing = isGreen ? "bg-green-400" : "bg-jacket-amber";
  const textColor = isGreen ? "text-green-400" : "text-jacket-amber";
  const borderColorMobile = isGreen ? "border-green-500/60" : "border-jacket-amber/60";
  const borderDivider = isGreen ? "border-green-500/20" : "border-jacket-amber/20";
  const borderStyle = isGreen ? "border-green-500/30" : "border-jacket-amber/30";
  const bgColor = isGreen ? "bg-green-500/5" : "bg-jacket-amber/5";

  const pillLabel = SITE_MODE === "pre-november"
    ? (lang === "es" ? `3 Nov · ${daysLeft} días` : `Nov 3 · ${daysLeft} days`)
    : cfg.startHerePillText;

  const mobileBubble = ready && !dismissed ? (
    <div className="fixed bottom-5 right-4 z-50 md:hidden">
      {expanded ? (
        <div className={`w-56 rounded-md border ${borderColorMobile} bg-jacket-black shadow-2xl shadow-black/60`}>
          <div className={`flex items-center justify-between border-b ${borderDivider} px-3 py-2`}>
            <span className={`font-mono text-[10px] font-black uppercase tracking-widest ${textColor}`}>
              {cfg.startHereHeader}
            </span>
            <button onClick={dismiss} className="font-mono text-xs text-zinc-500 hover:text-white" aria-label={lang === "es" ? "Cerrar" : "Close"}>
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            <Link href={cfg.startHerePrimaryHref} onClick={dismiss}
              className="block rounded-sm border border-jacket-amber bg-jacket-amber py-1.5 text-center font-mono text-[11px] font-black uppercase tracking-widest text-jacket-black transition-colors hover:bg-jacket-black hover:text-jacket-amber">
              {cfg.startHerePrimaryLabel}
            </Link>
            {cfg.startHereSecondaryLabel && cfg.startHereSecondaryHref && (
              <Link href={cfg.startHereSecondaryHref} onClick={dismiss}
                className="block rounded-sm border border-jacket-amber py-1.5 text-center font-mono text-[11px] font-black uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black">
                {cfg.startHereSecondaryLabel}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => setExpanded(true)}
          className={`flex items-center gap-1.5 rounded-full border ${borderColorMobile} bg-jacket-black/90 px-3 py-2 shadow-lg shadow-black/50 backdrop-blur-sm`}
          aria-label={cfg.startHereHeader}>
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotPing} opacity-75`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
          </span>
          <span className={`font-mono text-[11px] font-black uppercase tracking-widest ${textColor}`}>{pillLabel}</span>
        </button>
      )}
    </div>
  ) : null;

  const desktopBanner = (
    <div className="hidden md:block">
      {!ready ? (
        <div className="rounded-sm border border-transparent px-5 py-3 opacity-0 pointer-events-none" aria-hidden="true">
          <div className="flex items-center justify-between gap-4 h-[28px]" />
        </div>
      ) : dismissed ? null : (
        <div className={`rounded-sm border ${borderStyle} ${bgColor} px-5 py-3`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotPing} opacity-75`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
                </span>
                <p className={`font-mono text-[11px] uppercase tracking-widest ${textColor}`}>
                  {pillLabel}
                </p>
              </div>
              <p className="text-sm font-bold text-jacket-white">
                {cfg.startHereHeader}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href={cfg.startHerePrimaryHref} onClick={dismiss}
                className="whitespace-nowrap rounded-sm border border-jacket-amber bg-jacket-amber px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest text-jacket-black transition-colors hover:bg-jacket-black hover:text-jacket-amber">
                {cfg.startHerePrimaryLabel}
              </Link>
              {cfg.startHereSecondaryLabel && cfg.startHereSecondaryHref && (
                <Link href={cfg.startHereSecondaryHref} onClick={dismiss}
                  className="whitespace-nowrap rounded-sm border border-jacket-amber px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black">
                  {cfg.startHereSecondaryLabel}
                </Link>
              )}
              <button onClick={dismiss}
                className="ml-1 font-mono text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                aria-label={lang === "es" ? "Cerrar" : "Dismiss"}>
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
