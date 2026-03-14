/**
 * HotBoard — Live signal feed for TheJacket
 *
 * Surfaces the most notable recent signals across all candidates:
 * - Confirmed red flags with recent dates
 * - Notable late-breaking donations
 * - news_hits entries (added by enrichment agent)
 *
 * Sorted by recency/severity. Auto-updates as candidate JSONs are enriched.
 */

import Link from "next/link";
import type { Candidate } from "@/lib/types";

export type HotSignal = {
  candidateId: string;
  candidateName: string;
  office: string;
  type: "red_flag" | "donor" | "news";
  label: string;
  detail: string;
  source?: string;
  confirmed: boolean;
  severity: "critical" | "high" | "medium";
  /** ISO date string or partial date for sort/display */
  date?: string;
};

// Severity mapping by red flag type keywords
function flagSeverity(label: string | undefined, detail: string | undefined): "critical" | "high" | "medium" {
  const text = ((label ?? "") + " " + (detail ?? "")).toLowerCase();
  if (text.includes("criminal") || text.includes("indicted") || text.includes("convicted") || text.includes("fraud") || text.includes("bribery")) return "critical";
  if (text.includes("ethics") || text.includes("fec violation") || text.includes("campaign finance violation") || text.includes("perjury") || text.includes("insider")) return "high";
  return "medium";
}

function donorSeverity(amount: number | null): "critical" | "high" | "medium" {
  if (!amount) return "medium";
  if (amount >= 50000) return "high";
  return "medium";
}

const SEVERITY_CONFIG = {
  critical: { dot: "bg-red-500", border: "border-red-500/40", badge: "text-red-400", badgeBg: "bg-red-950/30", icon: "🔴" },
  high:     { dot: "bg-orange-400", border: "border-orange-400/30", badge: "text-orange-400", badgeBg: "bg-orange-950/20", icon: "🟠" },
  medium:   { dot: "bg-yellow-400", border: "border-yellow-400/20", badge: "text-yellow-400", badgeBg: "bg-yellow-950/10", icon: "🟡" },
};

function typeLabel(type: HotSignal["type"]) {
  if (type === "red_flag") return "🚩 FLAG";
  if (type === "donor") return "💰 DONOR";
  return "📰 NEWS";
}

function formatAmount(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/**
 * Extract hot signals from a candidate's data.
 * Focuses on confirmed red flags + notable late-breaking donors + news hits.
 */
export function extractSignals(candidate: Candidate): HotSignal[] {
  const signals: HotSignal[] = [];

  // Red flags — all confirmed ones, unconfirmed only if label mentions recent date
  for (const flag of candidate.red_flags ?? []) {
    const flagLabel = flag.label ?? "";
    const flagDetail = flag.detail ?? "";
    if (!flag.confirmed && !flagLabel.includes("2026") && !flagDetail.includes("2026")) continue;
    signals.push({
      candidateId: candidate.id,
      candidateName: candidate.name,
      office: candidate.office,
      type: "red_flag",
      label: flagLabel,
      detail: flagDetail,
      source: flag.source,
      confirmed: flag.confirmed,
      severity: flagSeverity(flagLabel, flagDetail),
    });
  }

  // Notable donors — $25K+ or crypto/unusual category
  for (const donor of candidate.jacket?.donors ?? []) {
    const isNotable =
      (donor.amount ?? 0) >= 25000 ||
      donor.category === "crypto" ||
      donor.name.toLowerCase().includes("ethereum") ||
      donor.name.toLowerCase().includes("bitcoin") ||
      (donor.amount ?? 0) >= 10000 && donor.category === "labor-pac";

    if (!isNotable) continue;
    const amtStr = donor.amount ? formatAmount(donor.amount) : "";
    signals.push({
      candidateId: candidate.id,
      candidateName: candidate.name,
      office: candidate.office,
      type: "donor",
      label: `${donor.name}${amtStr ? ` — ${amtStr}` : ""}`,
      detail: `${(donor.category ?? "").replace(/-/g, " ")} donation${donor.amount ? ` of ${amtStr}` : ""} to ${candidate.name}`,
      source: candidate.jacket?.source ?? undefined,
      confirmed: donor.confirmed,
      severity: donorSeverity(donor.amount),
    });
  }

  // news_hits — injected by enrichment agent
  const newsHits = (candidate as unknown as { news_hits?: Array<{ headline: string; summary: string; url: string; date: string; severity?: string }> }).news_hits ?? [];
  for (const hit of newsHits) {
    signals.push({
      candidateId: candidate.id,
      candidateName: candidate.name,
      office: candidate.office,
      type: "news",
      label: hit.headline,
      detail: hit.summary,
      source: hit.url,
      confirmed: true,
      severity: (hit.severity as "critical" | "high" | "medium") ?? "medium",
      date: hit.date,
    });
  }

  return signals;
}

/**
 * Score a signal for ranking (higher = more prominent placement).
 * Critical confirmed flags rank highest; unconfirmed medium donors rank lowest.
 */
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
  // Recency boost for 2026 signals
  if (label.includes("2026") || detail.includes("2026") || s.date?.includes("2026")) score += 25;
  // Extra boost for very recent (March 2026)
  if (label.includes("March") || detail.includes("March 2026") || s.date?.includes("2026-03")) score += 40;
  return score;
}

type HotBoardProps = {
  signals: HotSignal[];
  limit?: number;
};

export default function HotBoard({ signals, limit = 8 }: HotBoardProps) {
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
                  {typeLabel(signal.type)}
                </span>
                {!signal.confirmed && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
                    Unverified
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
