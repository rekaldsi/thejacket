"use client";

/**
 * HotBoard — Live signal feed render component.
 * Pure functions and types are in HotBoardUtils.ts
 */

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";
import type { HotSignal } from "./HotBoardUtils";

// Re-export utilities so existing import paths still work
export type { HotSignal, BillSignal } from "./HotBoardUtils";
export { extractSignals, extractBillSignals } from "./HotBoardUtils";

const SEVERITY_CONFIG = {
  critical: { dot: "bg-red-500", border: "border-red-500/40", badge: "text-red-400", badgeBg: "bg-red-950/30", icon: "🔴" },
  high:     { dot: "bg-orange-400", border: "border-orange-400/30", badge: "text-orange-400", badgeBg: "bg-orange-950/20", icon: "🟠" },
  medium:   { dot: "bg-yellow-400", border: "border-yellow-400/20", badge: "text-yellow-400", badgeBg: "bg-yellow-950/10", icon: "🟡" },
};

function typeLabel(type: HotSignal["type"], lang: "en" | "es" = "en") {
  const labels = {
    en: { red_flag: "🚩 FLAG", donor: "💰 DONOR", news: "📰 NEWS" },
    es: { red_flag: "🚩 ALERTA", donor: "💰 DONANTE", news: "📰 NOTICIA" },
  };
  if (type === "red_flag") return labels[lang].red_flag;
  if (type === "donor") return labels[lang].donor;
  return labels[lang].news;
}

function rankSignal(s: HotSignal): number {
  let score = 0;
  if (s.severity === "critical") score += 300;
  if (s.severity === "high") score += 200;
  if (s.severity === "medium") score += 100;
  if (s.confirmed) score += 50;
  if (s.type === "red_flag") score += 30;
  if (s.type === "news") score += 20;
  if (s.type === "donor") score += 10;
  const label = s.label ?? "";
  const detail = s.detail ?? "";
  if (label.includes("2026") || detail.includes("2026") || s.date?.includes("2026")) score += 25;
  if (label.includes("March") || detail.includes("March 2026") || s.date?.includes("2026-03")) score += 40;
  return score;
}

type HotBoardProps = {
  signals: HotSignal[];
  limit?: number;
};

export default function HotBoard({ signals, limit = 8 }: HotBoardProps) {
  const { lang } = useLanguage();
  const d = translations[lang];
  const sorted = [...signals].sort((a, b) => rankSignal(b) - rankSignal(a)).slice(0, limit);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      {sorted.map((signal, i) => {
        const cfg = SEVERITY_CONFIG[signal.severity];
        return (
          <Link
            key={`${signal.candidateId}-${signal.type}-${i}`}
            href={`/candidate/${signal.candidateId}`}
            className={`group flex items-start gap-3 rounded-sm border p-3 transition-colors hover:border-jacket-amber ${cfg.border} bg-zinc-950/60`}
          >
            {/* Severity dot */}
            <div className="mt-1 flex shrink-0 flex-col items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${cfg.dot} shrink-0`} />
            </div>

            <div className="min-w-0 flex-1">
              {/* Candidate + type badges */}
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-jacket-amber group-hover:underline">
                  {signal.candidateName}
                </span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
                  {(signal.office ?? "").replace("Cook County ", "").replace("Illinois ", "IL ").replace("U.S. ", "")}
                </span>
                <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${cfg.badgeBg} ${cfg.badge}`}>
                  {typeLabel(signal.type, lang)}
                </span>
                {!signal.confirmed && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
                    {d.signal_unverified}
                  </span>
                )}
              </div>

              {/* Label */}
              <p className="text-sm font-bold leading-snug text-jacket-white group-hover:text-jacket-amber">
                {(signal.label ?? "").length > 90 ? (signal.label ?? "").slice(0, 90) + "…" : (signal.label ?? "")}
              </p>

              {/* Detail */}
              <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                {signal.detail}
              </p>
            </div>

            <span className="shrink-0 self-center font-mono text-zinc-700 transition-colors group-hover:text-jacket-amber">→</span>
          </Link>
        );
      })}
    </div>
  );
}
