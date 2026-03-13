import Link from "next/link";
import { getAllJudges, getJudicialRaces } from "@/lib/data";
import { scoreJudgesByRace } from "@/lib/judgeScoring";
import type { JudgeScorecardEntry } from "@/lib/judgeScoring";
import type { Race } from "@/lib/types";

// Bar rating badge colors
function barRatingColor(rating: string): string {
  if (rating === "HR") return "bg-green-700 text-green-100";
  if (rating === "Q" || rating === "R") return "bg-green-900 text-green-300";
  if (rating === "Mixed") return "bg-yellow-900 text-yellow-300";
  if (rating === "NQ") return "bg-orange-900 text-orange-300";
  if (rating === "NR") return "bg-red-900 text-red-300";
  return "bg-zinc-800 text-zinc-400";
}

function BarRatingBadge({ rating, label }: { rating: string; label: string }) {
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${barRatingColor(rating)}`}
      title={label}
    >
      {rating}
    </span>
  );
}

function GradeBadge({ entry }: { entry: JudgeScorecardEntry }) {
  return (
    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900">
      <span className={`font-mono text-lg font-black leading-none ${entry.gradeColor}`}>
        {entry.grade}
      </span>
      <span className="font-mono text-xs text-zinc-500">{entry.score}</span>
    </div>
  );
}

function JudgeRow({ entry }: { entry: JudgeScorecardEntry }) {
  const { judge } = entry;
  const hasFlags = judge.red_flags.length > 0;

  return (
    <div className={`border-l-2 py-3 pl-4 pr-2 ${hasFlags ? "border-jacket-red" : "border-zinc-700"}`}>
      <div className="flex items-start gap-3">
        <GradeBadge entry={entry} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-jacket-white">{judge.name}</span>
            {judge.uncontested && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                UNCONTESTED
              </span>
            )}
          </div>

          {/* Bar ratings */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Alliance</span>
            <BarRatingBadge
              rating={judge.bar_ratings.alliance_rating}
              label={judge.bar_ratings.alliance_detail ?? judge.bar_ratings.alliance_rating}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">CBA</span>
            <BarRatingBadge
              rating={judge.bar_ratings.cba_rating}
              label={judge.bar_ratings.cba_rating}
            />
            {judge.years_experience > 0 && (
              <span className="font-mono text-[10px] text-zinc-500">
                {judge.years_experience} yrs exp
              </span>
            )}
            {judge.years_experience === 0 && (
              <span className="font-mono text-[10px] font-bold text-jacket-red">0 YRS EXP</span>
            )}
          </div>

          {/* Alliance detail */}
          {judge.bar_ratings.alliance_detail && (
            <p className="mt-1 text-[11px] text-zinc-500">{judge.bar_ratings.alliance_detail}</p>
          )}

          {/* Red flags */}
          {judge.red_flags.map((flag, i) => (
            <div key={i} className="mt-2 flex items-start gap-2">
              <span>{flag.confirmed ? "🚩" : "⚠️"}</span>
              <div>
                <span className="mr-2 inline-block rounded-sm bg-jacket-red px-1.5 py-0.5 font-mono text-[9px] uppercase text-white">
                  {flag.type}
                </span>
                <span className="text-xs font-semibold text-zinc-300">{flag.label}</span>
                <p className={`mt-0.5 text-[11px] leading-relaxed text-zinc-400 ${!flag.confirmed ? "italic" : ""}`}>
                  {flag.detail}
                </p>
              </div>
            </div>
          ))}

          {/* Scoring breakdown */}
          <div className="mt-2 flex flex-wrap gap-2">
            {entry.deductions.slice(0, 2).map((d) => (
              <span key={d.reason} className="text-[11px] text-jacket-red">
                −{d.points} {d.reason.split(":").pop()?.trim().split(" ").slice(0, 5).join(" ")}
              </span>
            ))}
            {entry.bonuses.map((b) => (
              <span key={b.reason} className="text-[11px] text-green-500">
                +{b.points} {b.reason.split(":").pop()?.trim().split(" ").slice(0, 5).join(" ")}
              </span>
            ))}
          </div>

          {/* Website */}
          {judge.website && (
            <a
              href={judge.website.startsWith("http") ? judge.website : `https://${judge.website}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-block text-[11px] text-zinc-500 hover:text-jacket-amber"
            >
              ↗ {judge.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function RaceCard({
  race,
  entries,
}: {
  race: Race;
  entries: JudgeScorecardEntry[];
}) {
  const hasAnyFlags = entries.some((e) => e.judge.red_flags.length > 0);
  const isUncontested = race.uncontested;
  const lowestScore = entries.length > 0 ? Math.min(...entries.map((e) => e.score)) : 100;
  const isAlarm = lowestScore < 40 || (isUncontested && entries.some((e) => e.judge.red_flags.length > 0));

  return (
    <div
      className={`border ${
        isAlarm ? "border-jacket-red/60" : hasAnyFlags ? "border-orange-800/40" : "border-jacket-border"
      } rounded-sm p-4`}
    >
      {/* Race header */}
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-black uppercase tracking-tight">{race.title}</h3>
            {isUncontested && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
                Uncontested
              </span>
            )}
            {isAlarm && (
              <span className="rounded-full bg-jacket-red/20 px-2 py-0.5 font-mono text-[10px] uppercase text-jacket-red">
                ⚠ Alarm
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">{race.jurisdiction}</p>
          <p className="mt-1 text-xs text-zinc-400">{race.description}</p>
        </div>
      </div>

      {/* Candidates */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <JudgeRow key={entry.judge.id} entry={entry} />
        ))}
        {entries.length === 0 && (
          <p className="text-xs text-zinc-600 italic">No candidate data loaded for this race.</p>
        )}
      </div>

      {/* IW link */}
      <div className="mt-3 border-t border-jacket-border pt-2">
        <a
          href="https://2026primary.injusticewatch.org/"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-zinc-500 hover:text-jacket-amber"
        >
          ↗ Full analysis: Injustice Watch 2026 Judicial Guide
        </a>
      </div>
    </div>
  );
}

export default function JudgesPage() {
  const judges = getAllJudges();
  const judicialRaces = getJudicialRaces();
  const scoredByRace = scoreJudgesByRace(judges);

  // Sort races: contested first, then uncontested with flags, then clean uncontested
  const sortedRaces = [...judicialRaces].sort((a, b) => {
    const aEntries = scoredByRace[a.id] ?? [];
    const bEntries = scoredByRace[b.id] ?? [];
    const aMin = aEntries.length > 0 ? Math.min(...aEntries.map((e) => e.score)) : 100;
    const bMin = bEntries.length > 0 ? Math.min(...bEntries.map((e) => e.score)) : 100;
    return aMin - bMin; // most alarming first
  });

  const totalJudges = judges.length;
  const flaggedCount = judges.filter((j) => j.red_flags.length > 0).length;
  const uncontestedWithFlags = judges.filter((j) => j.uncontested && j.red_flags.length > 0).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          COOK COUNTY — MARCH 17, 2026
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">Judicial Watch</h1>
        <div className="mt-2 h-1 w-16 bg-jacket-amber" />
        <p className="mt-4 max-w-2xl text-zinc-300">
          Cook County voters elect dozens of circuit and appellate court judges — but almost nobody covers these races.
          Bar associations rate every candidate; the ratings are the clearest signal voters have. Below are all contested
          and flagged races for the March 17, 2026 primary.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 border border-jacket-border p-4 md:grid-cols-3">
        <div>
          <p className="font-mono text-2xl font-black text-jacket-white">{totalJudges}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Candidates tracked</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-black text-jacket-red">{flaggedCount}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">With red flags</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-black text-orange-400">{uncontestedWithFlags}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Uncontested + flagged</p>
        </div>
      </div>

      {/* Key context callout */}
      <div className="border-l-4 border-jacket-amber bg-jacket-amber/5 p-4">
        <p className="text-sm font-bold text-jacket-amber">How to read bar ratings</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-300">
          <span><strong className="text-green-400">HR</strong> = Highly Recommended</span>
          <span><strong className="text-green-300">Q</strong> = Qualified</span>
          <span><strong className="text-green-300">R</strong> = Recommended</span>
          <span><strong className="text-yellow-400">Mixed</strong> = Split ratings across associations</span>
          <span><strong className="text-orange-400">NQ</strong> = Not Qualified</span>
          <span><strong className="text-jacket-red">NR</strong> = Not Recommended</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Ratings are from the Alliance of Bar Associations for Judicial Screening (13 bar associations) and the
          Chicago Bar Association (CBA). Sources:{" "}
          <a
            href="https://www.chicagobar.org/CBA/JEC/Judicial_Voters_Guide.aspx"
            target="_blank"
            rel="noreferrer"
            className="text-jacket-amber hover:underline"
          >
            CBA Voters Guide
          </a>{" "}
          ·{" "}
          <a
            href="https://2026primary.injusticewatch.org/"
            target="_blank"
            rel="noreferrer"
            className="text-jacket-amber hover:underline"
          >
            Injustice Watch 2026 Judicial Guide
          </a>
        </p>
      </div>

      {/* Race cards */}
      <div className="space-y-5">
        {sortedRaces.map((race) => (
          <RaceCard
            key={race.id}
            race={race}
            entries={scoredByRace[race.id] ?? []}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="border-t border-jacket-border pt-6 text-xs text-zinc-500">
        <p>
          Judicial race data sourced from the Alliance of Bar Associations for Judicial Screening, the Chicago Bar
          Association Judicial Evaluation Committee, and Injustice Watch investigative reporting. Red flags are based
          on published investigative journalism and bar association evaluation narratives. Last updated March 13, 2026.
        </p>
        <p className="mt-2">
          <a
            href="https://www.injusticewatch.org/judges/judicial-elections/2026-primary/"
            target="_blank"
            rel="noreferrer"
            className="text-jacket-amber hover:underline"
          >
            ↗ Read Injustice Watch&apos;s full 2026 judicial election coverage
          </a>
        </p>
      </div>

    </div>
  );
}
