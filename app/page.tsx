import Link from "next/link";
import Image from "next/image";
import { getAllCandidates, getAllJudges, getRaces } from "@/lib/data";
import { buildScorecard } from "@/lib/scoring";
import { scoreJudge } from "@/lib/judgeScoring";
import HotBoard, { extractSignals } from "@/components/HotBoard";
import type { ScorecardEntry } from "@/lib/scoring";
import type { Judge } from "@/lib/types";

const PRIMARY_DATE_UTC = Date.UTC(2026, 2, 17);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const FEATURED_RACE_SLUGS = [
  "il-governor-republican-primary",
  "us-senate-il-democratic-primary",
  "il-comptroller-democratic-primary",
  "cook-county-board-president-democratic-primary",
];

function getDaysToPrimary() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = Math.ceil((PRIMARY_DATE_UTC - todayUtc) / MS_PER_DAY);
  return Math.max(diff, 0);
}

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
          {entry.candidate.office.replace("U.S. House — ", "").replace("U.S. Senate (Illinois)", "IL Senate")}
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
  const daysToPrimary = getDaysToPrimary();

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
  const activeCandidates = candidates.filter((c) => c.status !== "withdrawn");
  const allSignals = activeCandidates.flatMap(extractSignals);

  return (
    <div className="space-y-24">

      {/* ── HERO ── */}
      <section className="flex flex-col-reverse items-center gap-8 py-6 md:flex-row md:items-center md:justify-between md:gap-12">

        {/* Text */}
        <div className="flex-1 space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
            ILLINOIS PRIMARY — MARCH 17, 2026 — COOK COUNTY
          </p>
          <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">THEJACKET</h1>
          <div className="h-1 w-20 bg-jacket-amber" />
          <p className="max-w-xl text-xl text-zinc-300">See who they really work for.</p>
          <p className="max-w-lg border-l-2 border-zinc-700 pl-3 text-sm italic text-zinc-500">
            &ldquo;Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them.&rdquo; — Robin Williams
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/races"
              className="inline-block whitespace-nowrap rounded-sm bg-jacket-amber px-5 py-2.5 font-mono text-sm font-black uppercase tracking-widest text-jacket-black transition-opacity hover:opacity-90"
            >
              Find your ballot →
            </Link>
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
              PRIMARY IN {daysToPrimary} DAY{daysToPrimary !== 1 ? "S" : ""}
            </span>
          </div>
        </div>

        {/* Jacket visual */}
        <div className="w-72 shrink-0 sm:w-64 md:w-72 lg:w-80">
          <Image
            src="/logo.png"
            alt="The Jacket — sponsor patches on a politician's blazer"
            width={512}
            height={512}
            className="h-auto w-full opacity-90 drop-shadow-[0_0_40px_rgba(245,158,11,0.15)]"
            priority
          />
        </div>

      </section>

      {/* ── HOT BOARD ── */}
      {allSignals.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="pb-1 pt-4 text-2xl font-black uppercase tracking-tight">
                🔥 Hot Board
              </h2>
              <p className="text-sm text-zinc-500 max-w-lg">
                Notable signals bubbling up across all {activeCandidates.length} candidates — late donations, confirmed flags, breaking coverage. Updated as data lands.
              </p>
            </div>
            <Link href="/scorecard" className="shrink-0 text-xs uppercase tracking-widest text-jacket-amber">
              Full scorecard →
            </Link>
          </div>
          <HotBoard signals={allSignals} limit={8} />
        </section>
      )}

      {/* ── FEATURED RACES ── */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="pb-2 pt-4 text-2xl font-black uppercase tracking-tight">Featured Races</h2>
          <Link href="/races" className="text-xs uppercase tracking-widest text-jacket-amber">
            See all {races.length} races →
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

      {/* ── JUDICIAL WATCH ── */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="pb-1 pt-4 text-2xl font-black uppercase tracking-tight">Judicial Watch</h2>
          <Link href="/judges" className="shrink-0 text-xs uppercase tracking-widest text-jacket-amber">
            All judges →
          </Link>
        </div>
        <p className="mb-4 text-sm text-zinc-400 max-w-lg">
          Nobody covers judicial races. We do. Here are the 4 most alarming Cook County judge candidates on your March 17 ballot.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {alarmJudges.map((judge) => (
            <JudicialAlarmCard key={judge.id} judge={judge} />
          ))}
        </div>
        <p className="mt-3 text-[11px] text-zinc-600">
          Scores based on Alliance of Bar Associations ratings · CBA Voters Guide · Injustice Watch investigative reporting
        </p>
      </section>

      {/* ── TRANSPARENCY SNAPSHOT ── */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="pb-2 pt-4 text-2xl font-black uppercase tracking-tight">Transparency Snapshot</h2>
          <Link href="/scorecard" className="text-xs uppercase tracking-widest text-jacket-amber">
            Full scorecard →
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-green-400">Cleanest Record</p>
            <div className="divide-y divide-jacket-border">
              {top3.map((entry) => <SnapshotRow key={entry.candidate.id} entry={entry} />)}
            </div>
          </div>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-jacket-red">Most Red Flags</p>
            <div className="divide-y divide-jacket-border">
              {bottom3.map((entry) => <SnapshotRow key={entry.candidate.id} entry={entry} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── FIND YOUR FULL BALLOT ── */}
      <section className="rounded-sm border border-jacket-amber/30 bg-jacket-amber/5 px-6 py-8 text-center">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">Illinois Primary — March 17, 2026</p>
        <h2 className="mb-2 text-2xl font-black uppercase tracking-tight">See Your Full Ballot</h2>
        <p className="mx-auto mb-6 max-w-lg text-sm text-zinc-400">
          TheJacket covers the contested races. Your actual ballot also includes Cook County commissioners, water reclamation district seats, state legislative races, and more — all by your address.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://www.elections.il.gov/ElectionInformation/GetElectionSampleBallot.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block whitespace-nowrap rounded-sm bg-jacket-amber px-6 py-3 font-mono text-sm font-black uppercase tracking-widest text-jacket-black transition-opacity hover:opacity-90"
          >
            My Full Ballot (ILSOS) →
          </a>
          <a
            href="https://chicagoelections.gov/voting/my-voter-information"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block whitespace-nowrap rounded-sm border border-jacket-amber px-6 py-3 font-mono text-sm font-black uppercase tracking-widest text-jacket-amber transition-opacity hover:opacity-90"
          >
            Chicago Voters →
          </a>
        </div>
      </section>

    </div>
  );
}
