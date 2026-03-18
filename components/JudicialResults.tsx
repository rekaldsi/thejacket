"use client";

import type { Judge, JudgePrimaryResult } from "@/lib/types";

const RETENTION_THRESHOLD = 60; // Illinois retention threshold %

type Props = {
  judges: Judge[];
  showAll?: boolean;
};

type GroupedJudges = {
  appellate: Judge[];
  circuit_countywide: Judge[];
  subcircuits: Record<string, Judge[]>;
};

function groupJudges(judges: Judge[]): GroupedJudges {
  const groups: GroupedJudges = {
    appellate: [],
    circuit_countywide: [],
    subcircuits: {},
  };

  for (const judge of judges) {
    if (judge.office === "appellate") {
      groups.appellate.push(judge);
    } else if (judge.subcircuit === "countywide") {
      groups.circuit_countywide.push(judge);
    } else {
      const key = judge.subcircuit;
      if (!groups.subcircuits[key]) groups.subcircuits[key] = [];
      groups.subcircuits[key].push(judge);
    }
  }

  return groups;
}

function ResultStatus({ result }: { result: JudgePrimaryResult | undefined }) {
  if (!result || result.status === "pending") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        Awaiting certification
      </span>
    );
  }

  if (result.status === "uncontested-won") {
    return (
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-amber-400">
        <span>🏆</span> Uncontested — Advances
      </span>
    );
  }

  const pct = result.yes_pct; // for contested races yes_pct holds vote pct

  if (result.status === "won") {
    return (
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-green-400">
        <span>🏆</span> Won
        {result.votes && (
          <span className="text-zinc-400">
            {" "}· {result.votes.toLocaleString()} votes
            {pct !== null && pct !== undefined ? ` (${pct}%)` : ""}
          </span>
        )}
      </span>
    );
  }

  if (result.status === "lost") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        Did not advance
        {pct !== null && pct !== undefined ? ` · ${pct}%` : ""}
      </span>
    );
  }

  if (result.status === "retained") {
    const yes = result.yes_pct ?? 0;
    const comfortable = yes >= 70;
    const close = yes >= RETENTION_THRESHOLD && yes < 65;
    return (
      <span className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest ${comfortable ? "text-green-400" : close ? "text-amber-400" : "text-green-400"}`}>
        ✓ Retained · {yes.toFixed(1)}% YES
      </span>
    );
  }

  if (result.status === "not_retained") {
    const yes = result.yes_pct ?? 0;
    return (
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-red-400">
        ✗ NOT Retained · {yes.toFixed(1)}% YES
      </span>
    );
  }

  return null;
}

function RetentionBar({ result }: { result: JudgePrimaryResult }) {
  const yes = result.yes_pct ?? 0;
  const no = result.no_pct ?? 100 - yes;
  const pending = result.status === "pending";

  return (
    <div className="mt-2 space-y-1">
      {/* Bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-sm bg-zinc-800">
        {!pending && (
          <>
            {/* YES portion */}
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${yes >= RETENTION_THRESHOLD ? "bg-green-500/80" : "bg-red-500/80"}`}
              style={{ width: `${yes}%` }}
            />
            {/* Threshold line */}
            <div
              className="absolute top-0 z-10 h-full w-0.5 bg-jacket-amber"
              style={{ left: `${RETENTION_THRESHOLD}%` }}
              title={`${RETENTION_THRESHOLD}% retention threshold`}
            />
          </>
        )}
        {pending && (
          <div className="absolute inset-0 animate-pulse bg-zinc-700/50 rounded-sm" />
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        <span>YES {pending ? "—" : `${yes.toFixed(1)}%`}</span>
        <span className="text-jacket-amber/60">{RETENTION_THRESHOLD}% threshold</span>
        <span>NO {pending ? "—" : `${no.toFixed(1)}%`}</span>
      </div>
    </div>
  );
}

function ContestBar({ result }: { result: JudgePrimaryResult }) {
  const pct = result.yes_pct ?? 0; // For contested races, yes_pct holds the vote %
  const won = result.status === "won";
  const pending = result.status === "pending";

  return (
    <div className="mt-2">
      <div className="relative h-2 w-full overflow-hidden rounded-sm bg-zinc-800">
        {!pending && (
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${won ? "bg-green-500/70" : "bg-zinc-600/50"}`}
            style={{ width: `${pct}%` }}
          />
        )}
        {pending && <div className="absolute inset-0 animate-pulse bg-zinc-700/50" />}
      </div>
      {!pending && (
        <div className="mt-0.5 font-mono text-[9px] text-zinc-500">
          {result.votes?.toLocaleString() ?? "—"} votes · {pct > 0 ? `${pct.toFixed(1)}%` : "—"}
        </div>
      )}
    </div>
  );
}

function BarRatingBadge({ rating, label }: { rating: string; label: string }) {
  const color =
    rating === "HR"
      ? "text-green-400 border-green-400/30 bg-green-400/10"
      : rating === "Q" || rating === "R"
      ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
      : rating === "NQ" || rating === "NR"
      ? "text-red-400 border-red-400/30 bg-red-400/10"
      : "text-zinc-400 border-zinc-600 bg-zinc-800";

  return (
    <span className={`rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${color}`}>
      {label}: {rating}
    </span>
  );
}

function JudgeResultRow({ judge }: { judge: Judge }) {
  const result = judge.primary_result;
  const isRetention = false; // All judges in our data are contested primary races
  const isContested = !judge.uncontested;
  const hasResult = result && result.status !== "pending";
  const isWon = result?.status === "won" || result?.status === "uncontested-won";
  const isLost = result?.status === "lost";

  return (
    <div
      className={`border-b border-jacket-border py-4 transition-opacity ${isLost ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Name + winner badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-sm ${isWon ? "text-jacket-white" : isLost ? "text-zinc-500" : "text-jacket-white"}`}>
              {judge.name}
            </span>
            {isWon && !judge.uncontested && hasResult && (
              <span className="rounded-sm bg-green-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-green-400 border border-green-500/30">
                WINNER
              </span>
            )}
            {judge.uncontested && (
              <span className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400 border border-amber-500/20">
                Uncontested
              </span>
            )}
          </div>

          {/* Vacancy / race context */}
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {judge.vacancy_of ? `Vacancy: ${judge.vacancy_of}` : `${judge.subcircuit === "countywide" ? "Countywide" : `${judge.subcircuit} Subcircuit`}`}
          </p>

          {/* Status */}
          <div className="mt-1">
            <ResultStatus result={result} />
          </div>

          {/* Contest bar for contested races */}
          {isContested && result && result.status !== "pending" && result.status !== "uncontested-won" && (
            <ContestBar result={result as JudgePrimaryResult & { pct: number | null }} />
          )}
        </div>

        {/* Bar ratings */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <BarRatingBadge rating={judge.bar_ratings.alliance_rating} label="Alliance" />
          <BarRatingBadge rating={judge.bar_ratings.cba_rating} label="CBA" />
        </div>
      </div>
    </div>
  );
}

function JudgeGroup({ title, judges }: { title: string; judges: Judge[] }) {
  if (judges.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-3 font-mono text-xs font-black uppercase tracking-[0.22em] text-jacket-amber border-b border-jacket-amber/20 pb-2">
        {title}
      </h3>
      <div>
        {judges.map((judge) => (
          <JudgeResultRow key={judge.id} judge={judge} />
        ))}
      </div>
    </div>
  );
}

export default function JudicialResults({ judges, showAll = true }: Props) {
  const groups = groupJudges(judges);
  const sortedSubcircuits = Object.entries(groups.subcircuits).sort(([a], [b]) => {
    // Sort subcircuits numerically
    const na = parseInt(a) || 99;
    const nb = parseInt(b) || 99;
    return na - nb;
  });

  const pending = judges.filter((j) => !j.primary_result || j.primary_result.status === "pending").length;
  const total = judges.length;
  const reported = total - pending;

  return (
    <div>
      {/* Header bar */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Judicial Results</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {reported} of {total} judges reported · <span className="text-zinc-600">IL retention threshold: {RETENTION_THRESHOLD}%</span>
          </p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          Source: Cook County Clerk
        </div>
      </div>

      {/* Source note */}
      <div className="mb-6 rounded-sm border border-jacket-amber/20 bg-jacket-amber/5 px-4 py-3 text-xs text-zinc-400">
        <span className="font-bold text-jacket-amber">First in Chicago</span> — Judicial primary results with bar association ratings.
        No other major outlet is tracking this. Bar ratings: <span className="text-zinc-300">HR</span> = Highly Recommended,{" "}
        <span className="text-zinc-300">Q</span> = Qualified, <span className="text-zinc-300">NR/NQ</span> = Not Recommended.
        <br />
        <span className="text-zinc-600 mt-1 block">
          All listed judges are in contested Democratic primaries. Winners advance to November general ballot.
          For judges running uncontested, they advance automatically.
        </span>
      </div>

      {/* Appellate */}
      {groups.appellate.length > 0 && (
        <JudgeGroup title="Appellate Court — 1st District" judges={groups.appellate} />
      )}

      {/* Countywide Circuit */}
      {groups.circuit_countywide.length > 0 && (
        <JudgeGroup title="Circuit Court — Countywide" judges={groups.circuit_countywide} />
      )}

      {/* Subcircuits */}
      {sortedSubcircuits.map(([subcircuit, subcircuitJudges]) => (
        <JudgeGroup
          key={subcircuit}
          title={`Circuit Court — ${subcircuit} Subcircuit`}
          judges={subcircuitJudges}
        />
      ))}
    </div>
  );
}
