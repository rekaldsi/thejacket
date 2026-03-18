import type { Metadata } from "next";
import Link from "next/link";
import { getAllCandidates, getAllJudges, getRaces } from "@/lib/data";
import type { Candidate, Race } from "@/lib/types";

export const metadata: Metadata = {
  title: "2026 Illinois Primary Results — TheJacket.cc",
  description:
    "March 17, 2026 Illinois & Cook County primary results — all races: federal, statewide, Cook County offices, and judicial. Non-partisan, direct from official sources.",
  openGraph: {
    title: "2026 Illinois Primary Results — TheJacket.cc",
    description: "All March 17, 2026 primary results in one place. Winners, vote percentages, judges.",
    images: [{ url: "/logo.png" }],
  },
};

// ─── Grouping ─────────────────────────────────────────────────────────────────

type RaceGroup = {
  label: string;
  races: Array<{ race: Race; candidates: Candidate[] }>;
};

const RACE_GROUPS: Array<{ label: string; slugPattern: string | RegExp }> = [
  { label: "Federal", slugPattern: /^(us-senate|il-\d+-us-house)/ },
  { label: "Statewide", slugPattern: /^il-(governor|attorney-general|treasurer|comptroller|secretary-of-state)/ },
  { label: "Cook County", slugPattern: /^cook-county/ },
  { label: "MWRD", slugPattern: /^mwrd/ },
  { label: "Judicial", slugPattern: /^judicial/ },
];

function assignGroup(slug: string): string {
  for (const group of RACE_GROUPS) {
    if (typeof group.slugPattern === "string") {
      if (slug.startsWith(group.slugPattern)) return group.label;
    } else {
      if (group.slugPattern.test(slug)) return group.label;
    }
  }
  return "Other";
}

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
    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
      Awaiting results
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
      {/* Rank / vote bar background */}
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
        {candidate.party === "Democratic" ? "D" : candidate.party === "Republican" ? "R" : candidate.party.slice(0, 3)}
      </span>
    </div>
  );
}

// ─── Race card ────────────────────────────────────────────────────────────────

function RaceCard({ race, candidates }: { race: Race; candidates: Candidate[] }) {
  const hasSomeResult = candidates.some(
    (c) => c.primary_result && c.primary_result.status !== "pending"
  );
  const winner = candidates.find(
    (c) => c.primary_result?.status === "won" || c.primary_result?.status === "uncontested-won"
  );

  // Sort: winner first, then by pct desc
  const sorted = [...candidates].sort((a, b) => {
    const aWon = a.primary_result?.status === "won" || a.primary_result?.status === "uncontested-won";
    const bWon = b.primary_result?.status === "won" || b.primary_result?.status === "uncontested-won";
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
        </div>
        {!hasSomeResult && <PendingBadge />}
        {hasSomeResult && winner && (
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-green-400">
            Called
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

function ResultsSection({ label, items }: { label: string; items: Array<{ race: Race; candidates: Candidate[] }> }) {
  if (items.length === 0) return null;

  const calledCount = items.filter((r) =>
    r.candidates.some(
      (c) => c.primary_result?.status === "won" || c.primary_result?.status === "uncontested-won"
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
          <RaceCard key={race.id} race={race} candidates={candidates} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const races = getRaces();
  const candidates = getAllCandidates();
  const judges = getAllJudges();

  // Only include non-judicial races on this page (judges have their own page)
  const nonJudicialRaces = races.filter((r) => !r.id.startsWith("judicial"));

  // Build race → candidates map
  const raceData = nonJudicialRaces.map((race) => ({
    race,
    candidates: candidates.filter((c) => c.race_id === race.id),
  }));

  // Group races
  const grouped: Record<string, Array<{ race: Race; candidates: Candidate[] }>> = {};
  for (const item of raceData) {
    const group = assignGroup(item.race.id);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
  }

  // Compute summary stats
  const totalRaces = races.length;
  const totalCandidates = candidates.length;
  const calledRaces = races.filter((r) => {
    const raceCandidates = candidates.filter((c) => c.race_id === r.id);
    return raceCandidates.some(
      (c) => c.primary_result?.status === "won" || c.primary_result?.status === "uncontested-won"
    );
  }).length;

  const lastUpdated = (() => {
    const timestamps = candidates
      .map((c) => c.primary_result?.updated)
      .filter(Boolean) as string[];
    if (timestamps.length === 0) return null;
    return timestamps.sort().reverse()[0];
  })();

  const groupOrder = ["Federal", "Statewide", "Cook County", "MWRD"];

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
          All Cook County and Illinois primary results — {totalRaces} races, {totalCandidates} candidates.
          Non-partisan. Direct from official sources.
        </p>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="rounded-sm border border-jacket-border px-3 py-2 text-center">
            <p className="font-mono text-2xl font-black text-jacket-amber">{calledRaces}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Races Called</p>
          </div>
          <div className="rounded-sm border border-jacket-border px-3 py-2 text-center">
            <p className="font-mono text-2xl font-black text-jacket-white">{totalRaces - calledRaces}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Pending</p>
          </div>
          <div className="rounded-sm border border-jacket-border px-3 py-2 text-center">
            <p className="font-mono text-2xl font-black text-jacket-white">{totalCandidates}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Candidates</p>
          </div>
        </div>

        {lastUpdated && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Last updated: {new Date(lastUpdated).toLocaleString("en-US", { timeZone: "America/Chicago" })} CST
          </p>
        )}

        {/* Navigation */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/results/judges"
            className="inline-flex items-center gap-1.5 rounded-sm border border-jacket-amber bg-jacket-amber/10 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-jacket-amber hover:bg-jacket-amber hover:text-jacket-black transition-all"
          >
            <span>⚖️</span> Judicial Results
            <span className="font-normal text-jacket-amber/60">→ {judges.length} judges</span>
          </Link>
          <Link
            href="/races"
            className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:border-jacket-amber hover:text-jacket-amber transition-colors"
          >
            Candidate profiles →
          </Link>
        </div>
      </div>

      {/* Results groups */}
      {groupOrder.map((label) => (
        <ResultsSection
          key={label}
          label={label}
          items={grouped[label] ?? []}
        />
      ))}

      {/* Judicial callout */}
      <section className="rounded-sm border border-jacket-amber/30 bg-jacket-amber/5 px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber mb-1">
              Exclusive
            </p>
            <h2 className="text-xl font-black uppercase tracking-tight">
              Judicial Results
            </h2>
            <p className="mt-1 text-sm text-zinc-400 max-w-lg">
              {judges.length} judges tracked with bar association ratings. No other Chicago outlet is showing this.
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
        <p>Results are unofficial until certified by the Illinois State Board of Elections. All data is non-partisan. DYOR.</p>
      </div>
    </div>
  );
}
