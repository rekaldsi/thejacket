"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Candidate, Race } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RaceItem = { race: Race; candidates: Candidate[] };

type Props = {
  raceData: RaceItem[];
  groupOrder: string[];
  grouped: Record<string, RaceItem[]>;
  judges: { length: number };
  totalRaces: number;
  totalCandidates: number;
  calledRaces: number;
  lastUpdated: string | null;
};

// ─── Result Badge ─────────────────────────────────────────────────────────────

function WinnerBadge() {
  return (
    <span className="rounded-sm bg-green-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-green-400 border border-green-500/30">
      ✓ Won
    </span>
  );
}

function PendingBadge() {
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-widest text-zinc-500"
      title="Results pending official canvass — minor party and local races are certified on a slower timeline"
    >
      Pending canvass
    </span>
  );
}

// ─── Candidate result row ─────────────────────────────────────────────────────

function CandidateRow({ candidate, isWinner }: { candidate: Candidate; isWinner: boolean }) {
  const result = candidate.primary_result;
  const hasResult = result && result.status !== "pending" && result.pct !== null;
  const status = result?.status;
  const isLost = status === "lost";
  const isUncontested = status === "uncontested-won" || candidate.uncontested;

  return (
    <div
      className={`flex items-center gap-3 py-2 text-sm transition-opacity ${isLost ? "opacity-50" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/candidate/${candidate.id}`}
            className={`font-semibold hover:text-jacket-amber transition-colors truncate ${isLost ? "text-zinc-500" : "text-jacket-white"}`}
          >
            {candidate.name}
          </Link>
          {isWinner && !isLost && hasResult && <WinnerBadge />}
          {isUncontested && (
            <span className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Uncontested
            </span>
          )}
        </div>

        {/* Vote bar */}
        {hasResult && result.pct !== null && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 max-w-[180px] rounded-sm bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${isWinner ? "bg-green-500/70" : "bg-zinc-600/40"}`}
                style={{ width: `${result.pct}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-zinc-500">
              {result.pct.toFixed(1)}%
              {result.votes ? ` · ${result.votes.toLocaleString()} votes` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Party pill */}
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
          candidate.party === "Democratic"
            ? "bg-blue-900/40 text-blue-400"
            : candidate.party === "Republican"
            ? "bg-red-900/40 text-red-400"
            : "bg-zinc-800 text-zinc-400"
        }`}
      >
        {candidate.party === "Democratic"
          ? "D"
          : candidate.party === "Republican"
          ? "R"
          : candidate.party.slice(0, 3)}
      </span>
    </div>
  );
}

// ─── Race card ────────────────────────────────────────────────────────────────

function RaceCard({
  race,
  candidates,
  activeParty,
}: {
  race: Race;
  candidates: Candidate[];
  activeParty: string;
}) {
  // When a party filter is active, show only matching candidates
  const displayCandidates =
    activeParty === "All"
      ? candidates
      : candidates.filter((c) => c.party === activeParty);

  const hasSomeResult = candidates.some(
    (c) => c.primary_result && c.primary_result.status !== "pending"
  );
  const winners = candidates.filter(
    (c) =>
      c.primary_result?.status === "won" ||
      c.primary_result?.status === "uncontested-won"
  );
  const winner = winners[0];
  const isMultiPartyRace = race.party === "Multi-party" || winners.length > 1;

  // Sort: winners first, then by pct desc
  const sorted = [...displayCandidates].sort((a, b) => {
    const aWon =
      a.primary_result?.status === "won" ||
      a.primary_result?.status === "uncontested-won";
    const bWon =
      b.primary_result?.status === "won" ||
      b.primary_result?.status === "uncontested-won";
    if (aWon !== bWon) return aWon ? -1 : 1;
    return (b.primary_result?.pct ?? 0) - (a.primary_result?.pct ?? 0);
  });

  return (
    <div className="border border-jacket-border bg-zinc-900/20 p-4">
      {/* Race header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/race/${race.slug}`}
            className="font-bold text-sm uppercase tracking-tight hover:text-jacket-amber transition-colors leading-snug"
          >
            {race.title}
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mt-0.5">
            {race.jurisdiction}
          </p>
          {isMultiPartyRace && (
            <p className="font-mono text-[9px] uppercase tracking-widest text-amber-500/70 mt-0.5">
              Each party advances its own nominee to November
            </p>
          )}
        </div>
        {!hasSomeResult && <PendingBadge />}
        {hasSomeResult && winner && !isMultiPartyRace && (
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-green-400">
            Called
          </span>
        )}
        {hasSomeResult && isMultiPartyRace && winners.length > 0 && (
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-green-400">
            {winners.length} Nominees Set
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-jacket-border mb-3" />

      {/* Candidates */}
      <div className="divide-y divide-jacket-border/50">
        {sorted.map((c) => (
          <CandidateRow
            key={c.id}
            candidate={c}
            isWinner={
              c.primary_result?.status === "won" ||
              c.primary_result?.status === "uncontested-won"
            }
          />
        ))}
      </div>
    </div>
  );
}

// ─── Results Group Section ────────────────────────────────────────────────────

function ResultsSection({
  label,
  items,
  activeParty,
}: {
  label: string;
  items: RaceItem[];
  activeParty: string;
}) {
  if (items.length === 0) return null;

  const calledCount = items.filter((r) =>
    r.candidates.some(
      (c) =>
        c.primary_result?.status === "won" ||
        c.primary_result?.status === "uncontested-won"
    )
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tight">
          <span className="text-jacket-amber">{label}</span>
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          {calledCount}/{items.length} called
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(({ race, candidates }) => (
          <RaceCard
            key={race.id}
            race={race}
            candidates={candidates}
            activeParty={activeParty}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Party pill styling ───────────────────────────────────────────────────────

function partyPillClass(party: string, active: boolean): string {
  const base =
    "cursor-pointer rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors border select-none";

  if (active) {
    if (party === "All")
      return `${base} bg-jacket-amber/10 border-jacket-amber text-jacket-amber`;
    if (party === "Democratic")
      return `${base} bg-blue-900/40 border-blue-700 text-blue-300`;
    if (party === "Republican")
      return `${base} bg-red-900/40 border-red-700 text-red-300`;
    return `${base} bg-zinc-700 border-zinc-500 text-zinc-200`;
  }

  // Inactive
  return `${base} border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300`;
}

// ─── Main ResultsClient component ────────────────────────────────────────────

export default function ResultsClient({
  raceData,
  groupOrder,
  grouped,
  judges,
  totalRaces,
  totalCandidates,
  calledRaces,
  lastUpdated,
}: Props) {
  const [activeParty, setActiveParty] = useState("All");

  // Compute party counts from all candidates with primary_result data
  const partyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const { candidates } of raceData) {
      for (const c of candidates) {
        if (c.party) {
          counts[c.party] = (counts[c.party] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [raceData]);

  // Determine which parties to show as pills (only parties with at least 1 candidate)
  const partyOrder = ["Democratic", "Republican"];
  const otherParties = Object.keys(partyCounts)
    .filter((p) => !partyOrder.includes(p))
    .sort();
  const allParties = [...partyOrder, ...otherParties].filter(
    (p) => (partyCounts[p] ?? 0) > 0
  );
  const pills = ["All", ...allParties];

  // Filter grouped races by active party
  const filteredGrouped = useMemo(() => {
    if (activeParty === "All") return grouped;

    const result: Record<string, RaceItem[]> = {};
    for (const [group, items] of Object.entries(grouped)) {
      const filtered = items.filter((item) =>
        item.candidates.some((c) => c.party === activeParty)
      );
      result[group] = filtered;
    }
    return result;
  }, [grouped, activeParty]);

  return (
    <div className="space-y-12">
      {/* Page header */}
      <div className="border-b border-jacket-border pb-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          March 17, 2026 · Illinois Gubernatorial Primary
        </p>
        <h1 className="text-4xl font-black uppercase leading-tight tracking-tight">
          Primary <span className="text-jacket-amber">Results</span>
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400 text-sm">
          All Cook County and Illinois primary results — {totalRaces} races,{" "}
          {totalCandidates} candidates. Non-partisan. Direct from official sources.
        </p>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="rounded-sm border border-jacket-border px-3 py-2 text-center">
            <p className="font-mono text-2xl font-black text-jacket-amber">{calledRaces}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Races Called
            </p>
          </div>
          <div className="rounded-sm border border-jacket-border px-3 py-2 text-center">
            <p className="font-mono text-2xl font-black text-jacket-white">
              {totalRaces - calledRaces}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Pending</p>
          </div>
          <div className="rounded-sm border border-jacket-border px-3 py-2 text-center">
            <p className="font-mono text-2xl font-black text-jacket-white">{totalCandidates}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Candidates
            </p>
          </div>
        </div>

        {lastUpdated && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Last updated:{" "}
            {new Date(lastUpdated).toLocaleString("en-US", {
              timeZone: "America/Chicago",
            })}{" "}
            CST
          </p>
        )}

        {/* Navigation */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/results/judges"
            className="inline-flex items-center gap-1.5 rounded-sm border border-jacket-amber bg-jacket-amber/10 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-jacket-amber hover:bg-jacket-amber hover:text-jacket-black transition-all"
          >
            <span>⚖️</span> Judicial Results
            <span className="font-normal text-jacket-amber/60">
              → {judges.length} judges
            </span>
          </Link>
          <Link
            href="/races"
            className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:border-jacket-amber hover:text-jacket-amber transition-colors"
          >
            Candidate profiles →
          </Link>
        </div>
      </div>

      {/* ── Party filter pills (sticky below header) ── */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-jacket-black/95 backdrop-blur-sm border-b border-jacket-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mr-1">
            Filter:
          </span>
          {pills.map((party) => (
            <button
              key={party}
              onClick={() => setActiveParty(party)}
              className={partyPillClass(party, activeParty === party)}
            >
              {party === "All"
                ? `All · ${raceData.reduce((n, r) => n + r.candidates.length, 0)}`
                : `${party} · ${partyCounts[party] ?? 0}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results groups */}
      <div className="space-y-12">
        {groupOrder.map((label) => {
          const items = filteredGrouped[label] ?? [];
          return (
            <ResultsSection
              key={label}
              label={label}
              items={items}
              activeParty={activeParty}
            />
          );
        })}
      </div>

      {/* Judicial callout */}
      <section className="rounded-sm border border-jacket-amber/30 bg-jacket-amber/5 px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber mb-1">
              Exclusive
            </p>
            <h2 className="text-xl font-black uppercase tracking-tight">Judicial Results</h2>
            <p className="mt-1 text-sm text-zinc-400 max-w-lg">
              {judges.length} judges tracked with bar association ratings. No other Chicago outlet
              is showing this.
            </p>
          </div>
          <Link
            href="/results/judges"
            className="shrink-0 rounded-sm border border-jacket-amber bg-jacket-amber px-5 py-2.5 font-mono text-sm font-black uppercase tracking-widest text-jacket-black hover:bg-jacket-black hover:text-jacket-amber transition-all"
          >
            View Judge Results →
          </Link>
        </div>
      </section>

      {/* Source attribution */}
      <div className="border-t border-jacket-border pt-6 text-xs text-zinc-600 space-y-1">
        <p className="font-mono uppercase tracking-widest">Data Sources</p>
        <p>
          <a
            href="https://electionnight.cookcountyclerkil.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-jacket-amber transition-colors underline underline-offset-2"
          >
            Cook County Clerk — Election Night Results
          </a>
          {" · "}
          <a
            href="https://www.elections.il.gov/electionoperations/DownloadVoteTotals.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-jacket-amber transition-colors underline underline-offset-2"
          >
            ILSBE — Certified Results
          </a>
        </p>
        <p>
          Results are unofficial until certified by the Illinois State Board of Elections. All data
          is non-partisan. DYOR.
        </p>
      </div>
    </div>
  );
}
