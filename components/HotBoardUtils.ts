/**
 * HotBoard utility functions — pure data transformations.
 * No "use client" — safe to import from server components.
 */

import type { Candidate } from "@/lib/types";
import type { Bill } from "@/lib/bills";

/** A bill surfaced in the live intel feed */
export type BillSignal = {
  type: "bill";
  billId: string;
  bill_number: string;
  chamber: string;
  label: string;
  detail: string;
  severity: "critical" | "high" | "medium";
  next_hearing_date?: string;
};

/** Convert featured bills into feed-ready BillSignals */
export function extractBillSignals(bills: Bill[]): BillSignal[] {
  return bills
    .filter((b) => b.featured && b.status !== "dead" && b.status !== "signed" && b.status !== "vetoed")
    .map((b) => {
      // Urgency: hearing within 7 days = high, within 14 = medium
      let severity: BillSignal["severity"] = "medium";
      if (b.next_hearing) {
        const daysOut = Math.ceil((new Date(b.next_hearing.date).getTime() - Date.now()) / 86_400_000);
        if (daysOut >= 0 && daysOut <= 7) severity = "high";
        if (daysOut >= 0 && daysOut <= 2) severity = "critical";
      }
      const hearingNote = b.next_hearing
        ? ` · Hearing ${new Date(b.next_hearing.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : "";
      return {
        type: "bill" as const,
        billId: b.id,
        bill_number: b.bill_number,
        chamber: b.chamber,
        label: b.plain_english_title,
        detail: `${b.status_label}${hearingNote} · ${b.sponsor.name}`,
        severity,
        next_hearing_date: b.next_hearing?.date,
      };
    });
}

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
