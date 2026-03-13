import Link from "next/link";
import Scorecard from "@/components/Scorecard";
import UncontestedBanner from "@/components/UncontestedBanner";
import { getAllCandidates, getRaces } from "@/lib/data";
import { buildScorecard } from "@/lib/scoring";

const PRIMARY_DATE_UTC = Date.UTC(2026, 2, 17);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getDaysToPrimary() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = Math.ceil((PRIMARY_DATE_UTC - todayUtc) / MS_PER_DAY);
  return Math.max(diff, 0);
}

export default function HomePage() {
  const races = getRaces();
  const candidates = getAllCandidates();
  const scorecard = buildScorecard(candidates);
  const daysToPrimary = getDaysToPrimary();
  const uncontested = candidates.filter((c) => c.uncontested);

  return (
    <div className="space-y-16">

      {/* ── HERO ── */}
      <section className="space-y-4 py-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          ILLINOIS PRIMARY — MARCH 17, 2026 — COOK COUNTY
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl md:text-9xl">THEJACKET</h1>
        <div className="h-1 w-20 bg-jacket-amber" />
        <p className="max-w-3xl text-xl text-zinc-300">See who they really work for.</p>
        <p className="my-4 max-w-2xl border-l-2 border-zinc-700 pl-3 text-sm italic text-zinc-500">
          &ldquo;Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them.&rdquo; — Robin Williams
        </p>
        <p className="font-mono text-sm font-bold uppercase tracking-[0.22em] text-jacket-amber">
          PRIMARY IN {daysToPrimary} DAY{daysToPrimary !== 1 ? "S" : ""}
        </p>
      </section>

      {/* ── RUNNING ALONE BANNER ── */}
      {uncontested.length > 0 ? (
        <UncontestedBanner count={uncontested.length} topCandidate="Thomas Dart" />
      ) : null}

      {/* ── TRANSPARENCY SCORECARD ── */}
      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">Transparency Scorecard</h2>
          <Link href="/scorecard" className="text-xs uppercase tracking-widest text-jacket-amber">
            Full Ranking →
          </Link>
        </div>
        <p className="mb-5 text-sm text-zinc-500">
          Ranked by public record. Every deduction is sourced.{" "}
          <span className="text-green-400">Higher = cleaner.</span>{" "}
          <span className="text-jacket-red">Lower = more flags.</span>
        </p>

        {/* Score key */}
        <div className="mb-4 flex flex-wrap gap-4 font-mono text-xs">
          {[
            { grade: "A", label: "80–100", color: "text-green-400" },
            { grade: "B", label: "70–79",  color: "text-lime-400" },
            { grade: "C", label: "60–69",  color: "text-yellow-400" },
            { grade: "D", label: "50–59",  color: "text-orange-400" },
            { grade: "F", label: "0–49",   color: "text-jacket-red" },
          ].map(({ grade, label, color }) => (
            <span key={grade} className="flex items-center gap-1">
              <span className={`font-black ${color}`}>{grade}</span>
              <span className="text-zinc-600">{label}</span>
            </span>
          ))}
          <span className="text-zinc-600">— Score based on confirmed public-record flags only</span>
        </div>

        <Scorecard entries={scorecard} limit={10} />

        <div className="mt-4 border-t border-jacket-border pt-4">
          <Link
            href="/scorecard"
            className="font-mono text-xs uppercase tracking-widest text-jacket-amber hover:underline"
          >
            View all {scorecard.length} candidates →
          </Link>
        </div>
      </section>

      {/* ── PRIORITY RACES ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">Priority Races</h2>
          <Link href="/races" className="text-xs uppercase tracking-widest text-jacket-amber">
            View All →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {races.map((race) => (
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

    </div>
  );
}
