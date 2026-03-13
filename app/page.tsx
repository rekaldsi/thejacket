import Link from "next/link";
import Image from "next/image";
import { getAllCandidates, getRaces } from "@/lib/data";
import { buildScorecard } from "@/lib/scoring";
import type { ScorecardEntry } from "@/lib/scoring";

const PRIMARY_DATE_UTC = Date.UTC(2026, 2, 17);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const FEATURED_RACE_SLUGS = [
  "us-senate-il-democratic-primary",
  "cook-county-board-president-democratic-primary",
  "cook-county-assessor-democratic-primary",
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

export default function HomePage() {
  const races = getRaces();
  const candidates = getAllCandidates();
  const scorecard = buildScorecard(candidates);
  const daysToPrimary = getDaysToPrimary();

  const featuredRaces = FEATURED_RACE_SLUGS
    .map((slug) => races.find((r) => r.slug === slug))
    .filter(Boolean) as typeof races;

  const top3 = scorecard.slice(0, 3);
  const bottom3 = scorecard.slice(-3);

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

    </div>
  );
}
