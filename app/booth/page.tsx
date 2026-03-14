import Link from "next/link";
import { getAllCandidates, getAllJudges, getRaces } from "@/lib/data";
import { scoreCandidate } from "@/lib/scoring";
import { scoreJudge } from "@/lib/judgeScoring";
import type { Candidate } from "@/lib/types";

export const metadata = {
  title: "Booth Mode — Your Ballot Card | TheJacket",
  description:
    "Walk into the booth knowing who to vote for. Best choice in every Cook County race, based on transparency scores, red flags, and public record.",
};

// ── Ballot sections in the order they appear on a Cook County Democratic ballot ──
const BALLOT_SECTIONS = [
  {
    label: "Federal",
    raceIds: [
      "us-senate-il-d-2026",
      "il-02-us-house-d-2026",
      "il-04-us-house-open-2026",
      "il-07-us-house-d-2026",
      "il-09-us-house-d-2026",
    ],
  },
  {
    label: "Illinois Statewide",
    raceIds: [
      "il-governor-d-2026",
      "il-attorney-general-d-2026",
      "il-treasurer-d-2026",
      "il-comptroller-d-2026",
    ],
  },
  {
    label: "Cook County",
    raceIds: [
      "cook-county-board-president-d-2026",
      "cook-county-assessor-d-2026",
      "cook-county-sheriff-d-2026",
      "cook-county-commissioner-dist-2",
      "cook-county-commissioner-dist-5",
      "cook-county-commissioner-dist-6",
      "cook-county-commissioner-dist-8",
      "cook-county-commissioner-dist-10",
      "cook-county-commissioner-dist-12",
      "cook-county-commissioner-dist-15",
    ],
  },
  {
    label: "MWRD",
    raceIds: ["mwrd-6yr-2026", "mwrd-2yr-2026"],
  },
];

// Derive a one-line "why" from the top scorer
function whyLine(candidate: Candidate, score: number, totalInRace: number): string {
  const flags = candidate.red_flags ?? [];
  const confirmedFlags = flags.filter((f) => f.confirmed).length;
  const allegedFlags = flags.filter((f) => !f.confirmed).length;
  const hasFinance = (candidate.jacket?.total_raised ?? 0) > 0;
  const isUncontested = candidate.uncontested;

  if (isUncontested) return "Running unopposed — no alternative on this ballot.";
  if (totalInRace === 1) return "Only candidate in this race.";

  if (confirmedFlags === 0 && allegedFlags === 0) {
    if (hasFinance) return "No confirmed red flags. Finance disclosed.";
    return "No confirmed red flags on public record.";
  }
  if (confirmedFlags === 0 && allegedFlags > 0) {
    return `No confirmed violations. ${allegedFlags} allegation${allegedFlags > 1 ? "s" : ""} pending — unverified.`;
  }
  if (score >= 70) {
    return `Best available in this race. ${confirmedFlags} confirmed issue${confirmedFlags > 1 ? "s" : ""} on record.`;
  }
  return `Fewest confirmed issues in this race (${confirmedFlags} confirmed, ${allegedFlags} alleged).`;
}

// Grade color utility (inline for server component)
function gradeColor(grade: string): string {
  if (grade === "A") return "text-green-400";
  if (grade === "B") return "text-lime-400";
  if (grade === "C") return "text-yellow-400";
  if (grade === "D") return "text-orange-400";
  return "text-red-500";
}

function gradeBg(grade: string): string {
  if (grade === "A") return "border-green-500/40 bg-green-950/20";
  if (grade === "B") return "border-lime-500/40 bg-lime-950/20";
  if (grade === "C") return "border-yellow-500/40 bg-yellow-950/20";
  if (grade === "D") return "border-orange-500/40 bg-orange-950/20";
  return "border-red-500/40 bg-red-950/20";
}

export default function BoothPage() {
  const allCandidates = getAllCandidates();
  const allJudges = getAllJudges();
  const races = getRaces();

  // Build a map: race_id → scored candidates (sorted best first)
  const byRace: Record<string, ReturnType<typeof scoreCandidate>[]> = {};
  for (const c of allCandidates) {
    if (!c.race_id) continue;
    if (!byRace[c.race_id]) byRace[c.race_id] = [];
    byRace[c.race_id].push(scoreCandidate(c));
  }
  for (const raceId of Object.keys(byRace)) {
    byRace[raceId].sort((a, b) => b.score - a.score);
  }

  // Build race title lookup
  const raceTitle: Record<string, string> = {};
  for (const r of races) {
    raceTitle[r.id] = r.title;
  }

  // Score judges by race
  const judgesByRace: Record<string, ReturnType<typeof scoreJudge>[]> = {};
  for (const j of allJudges) {
    if (!judgesByRace[j.race_id]) judgesByRace[j.race_id] = [];
    judgesByRace[j.race_id].push(scoreJudge(j));
  }
  for (const raceId of Object.keys(judgesByRace)) {
    judgesByRace[raceId].sort((a, b) => b.score - a.score);
  }

  const judicialRaces = races.filter((r) => r.note === "judicial");

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <section className="space-y-3 border-b border-jacket-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-jacket-amber">
          🗳 Cook County Primary — March 17, 2026
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
          Booth<br />Mode
        </h1>
        <p className="max-w-2xl text-zinc-300">
          The best available choice in every race on your ballot — ranked by transparency score, confirmed red flags,
          and public record. No spin. No endorsements. Just the data.
        </p>
        <p className="font-mono text-xs text-zinc-500">
          ⚠️ Scores are computed from seeded public data. A high score means fewer documented problems —
          not a guarantee of good governance. Verify at FEC.gov and ILSBE before voting.
        </p>
        <p className="font-mono text-xs text-zinc-500">
          Tap any candidate to see the full profile and sourced reasoning.
        </p>
      </section>

      {/* Non-judicial sections */}
      {BALLOT_SECTIONS.map((section) => {
        const sectionRaces = section.raceIds
          .map((id) => ({ id, title: raceTitle[id] ?? id, entries: byRace[id] ?? [] }))
          .filter((r) => r.entries.length > 0);

        if (sectionRaces.length === 0) return null;

        return (
          <section key={section.label} className="space-y-4">
            <h2 className="border-b border-jacket-border pb-2 font-mono text-xs uppercase tracking-widest text-jacket-amber">
              {section.label}
            </h2>

            <div className="space-y-3">
              {sectionRaces.map(({ id, title, entries }) => {
                const top = entries[0];
                const why = whyLine(top.candidate, top.score, entries.length);
                const isAllBad = entries.every((e) => e.score < 40);
                const isUncontested = top.candidate.uncontested || entries.length === 1;

                return (
                  <div
                    key={id}
                    className={`rounded border p-4 ${gradeBg(top.grade)}`}
                  >
                    {/* Race label */}
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      {title}
                    </p>

                    {isAllBad && entries.length > 1 && (
                      <p className="mb-2 font-mono text-xs text-jacket-red">
                        ⚠️ No strong choice in this race — all candidates have significant issues.
                      </p>
                    )}

                    {/* Top pick */}
                    <Link
                      href={`/candidate/${top.candidate.id}`}
                      className="group flex items-start gap-3"
                    >
                      {/* Grade badge */}
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900 transition-colors group-hover:border-jacket-amber">
                        <span className={`font-mono text-lg font-black leading-none ${gradeColor(top.grade)}`}>
                          {top.grade}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-600">{top.score}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-jacket-white transition-colors group-hover:text-jacket-amber">
                            {top.candidate.name}
                          </span>
                          {isUncontested && (
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                              Unopposed
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">{why}</p>

                        {/* Runner-up note if contested */}
                        {entries.length > 1 && (
                          <p className="mt-1 font-mono text-[10px] text-zinc-600">
                            vs.{" "}
                            {entries
                              .slice(1)
                              .map((e) => e.candidate.name)
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 self-center font-mono text-zinc-600 transition-colors group-hover:text-jacket-amber">
                        →
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Judicial Section */}
      {judicialRaces.length > 0 && (
        <section className="space-y-4">
          <h2 className="border-b border-jacket-border pb-2 font-mono text-xs uppercase tracking-widest text-jacket-amber">
            Judicial Races
          </h2>
          <p className="text-xs text-zinc-500">
            Judicial scores are based on bar association ratings from the Alliance of Bar Associations and Chicago Bar Association.
            NR (Not Recommended) is a serious disqualifier. Vote for the highest-rated candidate in each race.
          </p>

          <div className="space-y-3">
            {judicialRaces.map((race) => {
              const entries = judgesByRace[race.id] ?? [];
              if (entries.length === 0) return null;
              const top = entries[0];
              const isUncontested = entries.length === 1;

              const barSummary = (() => {
                const r = top.judge.bar_ratings;
                const parts: string[] = [];
                if (r.alliance_rating) parts.push(`Alliance: ${r.alliance_detail ?? r.alliance_rating}`);
                if (r.cba_rating) parts.push(`CBA: ${r.cba_rating}`);
                return parts.join(" · ") || "Bar rating unavailable";
              })();

              return (
                <div
                  key={race.id}
                  className={`rounded border p-4 ${gradeBg(top.grade)}`}
                >
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {race.title}
                  </p>

                  <Link
                    href={`/judges`}
                    className="group flex items-start gap-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900 transition-colors group-hover:border-jacket-amber">
                      <span className={`font-mono text-lg font-black leading-none ${gradeColor(top.grade)}`}>
                        {top.grade}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-600">{top.score}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-jacket-white transition-colors group-hover:text-jacket-amber">
                          {top.judge.name}
                        </span>
                        {isUncontested && (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                            Unopposed
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400">{barSummary}</p>
                      {entries.length > 1 && (
                        <p className="mt-1 font-mono text-[10px] text-zinc-600">
                          vs.{" "}
                          {entries
                            .slice(1)
                            .map((e) => e.judge.name)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 self-center font-mono text-zinc-600 transition-colors group-hover:text-jacket-amber">
                      →
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer disclaimer */}
      <section className="border-t border-jacket-border pt-6">
        <p className="text-xs text-zinc-600">
          TheJacket is a civic transparency tool, not a political endorsement. All data sourced from FEC filings,
          Illinois State Board of Elections, court records, and named investigative journalism. No score is a
          guarantee — do your own research at{" "}
          <a
            href="https://fec.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline hover:text-jacket-amber"
          >
            fec.gov
          </a>{" "}
          and{" "}
          <a
            href="https://illinoissunshine.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline hover:text-jacket-amber"
          >
            illinoissunshine.org
          </a>
          .
        </p>
      </section>
    </div>
  );
}
