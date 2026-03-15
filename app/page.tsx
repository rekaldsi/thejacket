import Link from "next/link";
import { getAllCandidates, getAllJudges, getRaces } from "@/lib/data";
import { buildScorecard } from "@/lib/scoring";
import { scoreJudge } from "@/lib/judgeScoring";
import HotBoardCarousel from "@/components/HotBoardCarousel";
import { extractSignals } from "@/components/HotBoard";
import HeroSection from "@/components/HeroSection";
import ScrollReveal from "@/components/ScrollReveal";
import StartHereBanner from "@/components/StartHereBanner";
import { T } from "@/components/T";
import type { ScorecardEntry } from "@/lib/scoring";
import type { Judge } from "@/lib/types";

const FEATURED_RACE_SLUGS = [
  "il-governor-republican-primary",
  "us-senate-il-democratic-primary",
  "il-comptroller-democratic-primary",
  "cook-county-board-president-democratic-primary",
];

function SnapshotRow({ entry }: { entry: ScorecardEntry }) {
  return (
    <Link
      href={`/candidate/${entry.candidate.id}`}
      className="group flex items-center gap-3 py-2.5 px-2 -mx-2 transition-colors hover:bg-jacket-gray/30"
    >
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900 transition-colors group-hover:border-jacket-amber">
        <span className={`font-mono text-base font-black leading-none ${entry.gradeColor}`}>{entry.grade}</span>
        <span className="font-mono text-[10px] text-zinc-500">{entry.score}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate font-bold text-jacket-white transition-colors group-hover:text-jacket-amber">
          {entry.candidate.name}
        </span>
        <span className="text-xs text-zinc-500">
          {(entry.candidate.office ?? "").replace("U.S. House — ", "").replace("U.S. Senate (Illinois)", "IL Senate")}
        </span>
      </div>
      <span className="shrink-0 font-mono text-zinc-600 transition-colors group-hover:text-jacket-amber">→</span>
    </Link>
  );
}

// The 4 most alarming judicial candidates for the home page callout
const JUDICIAL_WATCH_IDS = [
  "natalie-l-howse",       // Unanimous NR, wins uncontested
  "john-harkins",          // Zero experience, patronage pick
  "brittany-michelle-pedersen", // 3 DUIs, venue-shopping
  "michael-cabonargi",     // Appointed, ethics/campaign finance questions
];

function JudicialAlarmCard({ judge }: { judge: Judge }) {
  const entry = scoreJudge(judge);
  const topFlag = judge.red_flags[0];
  return (
    <Link
      href="/judges"
      className="group border border-jacket-red/40 p-4 transition-colors hover:border-jacket-red hover:bg-red-950/10"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900 group-hover:border-jacket-red">
          <span className={`font-mono text-sm font-black leading-none ${entry.gradeColor}`}>{entry.grade}</span>
          <span className="font-mono text-[9px] text-zinc-500">{entry.score}</span>
        </div>
        <div>
          <p className="font-bold leading-tight text-jacket-white group-hover:text-jacket-amber">{judge.name}</p>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide">
            {judge.subcircuit === "countywide" ? "Countywide" : `${judge.subcircuit} Subcircuit`}
            {judge.uncontested ? " · Uncontested" : ""}
          </p>
        </div>
      </div>
      {topFlag && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
          <span className="mr-1">{topFlag.confirmed ? "🚩" : "⚠️"}</span>
          {topFlag.label}
        </p>
      )}
    </Link>
  );
}

export default function HomePage() {
  const races = getRaces();
  const candidates = getAllCandidates();
  const judges = getAllJudges();
  const scorecard = buildScorecard(candidates);

  const alarmJudges = JUDICIAL_WATCH_IDS
    .map((id) => judges.find((j) => j.id === id))
    .filter(Boolean) as Judge[];

  const featuredRaces = FEATURED_RACE_SLUGS
    .map((slug) => races.find((r) => r.slug === slug))
    .filter(Boolean) as typeof races;

  // Shuffle tied top-scorers so the snapshot isn't always alphabetical Commissioner picks.
  // Seed by calendar date so it's stable within a day but rotates daily.
  const topScore = scorecard[0]?.score ?? 100;
  const topTier = scorecard.filter((e) => e.score === topScore);
  const restTop = scorecard.filter((e) => e.score < topScore);
  const daySeed = Math.floor(Date.now() / 86_400_000);
  const shuffledTop = [...topTier].sort((a, b) => {
    const ha = Math.sin(daySeed + a.candidate.id.length * 31) * 10000;
    const hb = Math.sin(daySeed + b.candidate.id.length * 31 + 1) * 10000;
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb));
  });
  const top3 = [...shuffledTop, ...restTop].slice(0, 3);
  const bottom3 = scorecard.slice(-3);

  // HotBoard — collect notable signals from all active candidates
  // Interleaved so no candidate dominates: round-robin across candidates by signal score
  const activeCandidates = candidates.filter((c) => c.status !== "withdrawn");

  // Group signals by candidate, each group sorted best-first
  const signalsByCand: Record<string, ReturnType<typeof extractSignals>> = {};
  for (const c of activeCandidates) {
    const sigs = extractSignals(c);
    if (sigs.length > 0) signalsByCand[c.id] = sigs;
  }

  // Sort candidate groups by their top signal score (most newsworthy candidate leads)
  function rankSignalScore(s: { severity: string; confirmed: boolean; type: string; label?: string; detail?: string; date?: string }): number {
    let score = 0;
    if (s.severity === "critical") score += 300;
    else if (s.severity === "high") score += 200;
    else score += 100;
    if (s.confirmed) score += 50;
    if (s.type === "red_flag") score += 30;
    if (s.type === "news") score += 20;
    const label = s.label ?? "";
    const detail = s.detail ?? "";
    if (label.includes("2026") || detail.includes("2026")) score += 25;
    if (label.includes("March") || detail.includes("March 2026")) score += 40;
    return score;
  }

  const sortedGroups = Object.values(signalsByCand)
    .map((sigs) => [...sigs].sort((a, b) => rankSignalScore(b) - rankSignalScore(a)))
    .sort((a, b) => rankSignalScore(b[0]) - rankSignalScore(a[0]));

  // Round-robin interleave: take one from each candidate group in order, cycle
  const allSignals: ReturnType<typeof extractSignals> = [];
  const maxLen = Math.max(...sortedGroups.map((g) => g.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const group of sortedGroups) {
      if (i < group.length) allSignals.push(group[i]);
    }
  }

  return (
    <>
      {/* ── START HERE: position:fixed on mobile, in-flow on desktop — MUST be outside space-y-24 ── */}
      <StartHereBanner />

    <div className="space-y-12 md:space-y-24">

      {/* ── HERO ── */}
      <HeroSection />

      {/* ── HOT BOARD ── */}
      {allSignals.length > 0 && (
        <section className="-mx-4 sm:-mx-6 lg:-mx-8">
          {/* Header — full width inset */}
          <div className="mb-4 flex items-center gap-3 px-4 sm:px-6 lg:px-8">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <h2 className="font-mono text-xs font-black uppercase tracking-[0.22em] text-jacket-amber">
              <T k="live_intel_feed" />
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              {allSignals.length} <T k="signals" />
            </span>
          </div>

          {/* Full-bleed carousel */}
          <HotBoardCarousel signals={allSignals} />
        </section>
      )}

      {/* ── FEATURED RACES ── */}
      <ScrollReveal>
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="pb-2 pt-4 text-2xl font-black uppercase tracking-tight"><T k="featured_races" /></h2>
            <Link href="/races" className="text-xs uppercase tracking-widest text-jacket-amber">
              <T k="see_all_races_prefix" /> {races.length} <T k="see_all_races_suffix" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {featuredRaces.map((race) => (
              <Link
                key={race.id}
                href={`/race/${race.slug}`}
                className="border-l-2 border-jacket-amber px-4 py-3 transition-colors hover:bg-jacket-gray/40"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="whitespace-nowrap rounded-full bg-jacket-amber/20 px-2 py-0.5 font-mono text-xs text-jacket-amber">
                    {race.candidateCount} CAND.
                  </span>
                  <span className="truncate font-mono text-xs uppercase tracking-widest text-zinc-500">
                    {race.jurisdiction}
                  </span>
                </div>
                <h3 className="text-base font-black uppercase leading-snug">{race.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{race.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ── JUDICIAL WATCH ── */}
      <ScrollReveal delay={80}>
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="pb-1 pt-4 text-2xl font-black uppercase tracking-tight"><T k="judicial_watch" /></h2>
            <Link href="/judges" className="shrink-0 text-xs uppercase tracking-widest text-jacket-amber">
              <T k="all_judges_link" />
            </Link>
          </div>
          <p className="mb-4 text-sm text-zinc-400 max-w-lg">
            <T k="judicial_watch_desc" />
          </p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {alarmJudges.map((judge) => (
              <JudicialAlarmCard key={judge.id} judge={judge} />
            ))}
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">
            <T k="scores_based_on" />
          </p>
        </section>
      </ScrollReveal>

      {/* ── TRANSPARENCY SNAPSHOT ── */}
      <ScrollReveal delay={80}>
        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="pb-2 pt-4 text-2xl font-black uppercase tracking-tight"><T k="transparency_snapshot" /></h2>
            <Link href="/scorecard" className="text-xs uppercase tracking-widest text-jacket-amber">
              <T k="full_scorecard" />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-green-400"><T k="cleanest_record" /></p>
              <div className="divide-y divide-jacket-border">
                {top3.map((entry) => <SnapshotRow key={entry.candidate.id} entry={entry} />)}
              </div>
            </div>
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-jacket-red"><T k="most_red_flags" /></p>
              <div className="divide-y divide-jacket-border">
                {bottom3.map((entry) => <SnapshotRow key={entry.candidate.id} entry={entry} />)}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── FIND YOUR FULL BALLOT ── */}
      <section className="rounded-sm border border-jacket-amber/30 bg-jacket-amber/5 px-6 py-8 text-center">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber"><T k="illinois_primary_date" /></p>
        <h2 className="mb-2 text-2xl font-black uppercase tracking-tight"><T k="see_your_full_ballot" /></h2>
        <p className="mx-auto mb-6 max-w-lg text-sm text-zinc-400">
          <T k="ballot_body_text" />
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://www.elections.il.gov/ElectionInformation/GetElectionSampleBallot.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block whitespace-nowrap rounded-sm bg-jacket-amber px-6 py-3 font-mono text-sm font-black uppercase tracking-widest text-jacket-black transition-colors hover:bg-jacket-black hover:text-jacket-amber border border-jacket-amber"
          >
            <T k="my_full_ballot_ilsos" />
          </a>
          <a
            href="https://chicagoelections.gov/voting/my-voter-information"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block whitespace-nowrap rounded-sm border border-jacket-amber px-6 py-3 font-mono text-sm font-black uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black"
          >
            <T k="chicago_voters" />
          </a>
        </div>
      </section>

    </div>
    </>
  );
}
