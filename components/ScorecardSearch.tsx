"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ScorecardEntry } from "@/lib/scoring";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

const GRADE_COLOR: Record<string, string> = {
  "A+": "text-green-300", A: "text-green-400", "A-": "text-green-500",
  "B+": "text-lime-300",  B: "text-lime-400",  "B-": "text-lime-500",
  "C+": "text-yellow-300",C: "text-yellow-400","C-": "text-yellow-500",
  "D+": "text-orange-300",D: "text-orange-400","D-": "text-orange-500",
  F:    "text-red-400",
};

type Props = {
  entries: ScorecardEntry[];
};

export default function ScorecardSearch({ entries }: Props) {
  const { lang } = useLanguage();
  const d = translations[lang];
  const [query, setQuery] = useState("");
  const [raceFilter, setRaceFilter] = useState("all");

  // Build unique race options from entries
  const raceOptions = useMemo(() => {
    const offices = Array.from(new Set(entries.map((e) => e.candidate.office ?? "Unknown"))).sort();
    return offices;
  }, [entries]);

  // Filter + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const matchesQuery =
        !q ||
        e.candidate.name.toLowerCase().includes(q) ||
        (e.candidate.office ?? "").toLowerCase().includes(q) ||
        (e.candidate.party ?? "").toLowerCase().includes(q);
      const matchesRace =
        raceFilter === "all" || e.candidate.office === raceFilter;
      return matchesQuery && matchesRace;
    });
  }, [entries, query, raceFilter]);

  // Group filtered results by grade tier
  const clean   = filtered.filter((e) => e.score >= 80);
  const mid     = filtered.filter((e) => e.score >= 50 && e.score < 80);
  const flagged = filtered.filter((e) => e.score < 50);

  const isFiltering = query.trim().length > 0 || raceFilter !== "all";

  return (
    <div className="space-y-8">
      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-600">
            🔍
          </span>
          <input
            type="search"
            placeholder={d.scorecard_search_placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-sm border border-jacket-border bg-zinc-900 py-2.5 pl-8 pr-4 font-mono text-sm text-jacket-white placeholder-zinc-600 outline-none focus:border-jacket-amber focus:ring-1 focus:ring-jacket-amber"
          />
        </div>

        {/* Race filter */}
        <select
          value={raceFilter}
          onChange={(e) => setRaceFilter(e.target.value)}
          className="rounded-sm border border-jacket-border bg-zinc-900 px-3 py-2.5 font-mono text-sm text-jacket-white outline-none focus:border-jacket-amber focus:ring-1 focus:ring-jacket-amber sm:w-64"
        >
          <option value="all">{d.scorecard_all_races_option}</option>
          {raceOptions.map((o) => (
            <option key={o} value={o}>
              {o.replace("Cook County ", "").replace("U.S. House — ", "IL-").replace("U.S. Senate (Illinois)", "IL Senate")}
            </option>
          ))}
        </select>

        {/* Clear */}
        {isFiltering && (
          <button
            onClick={() => { setQuery(""); setRaceFilter("all"); }}
            className="whitespace-nowrap rounded-sm border border-zinc-700 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:border-jacket-amber hover:text-jacket-amber"
          >
            {d.scorecard_clear_button}
          </button>
        )}
      </div>

      {/* Results count */}
      {isFiltering && (
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">
          {filtered.length} {filtered.length !== 1 ? d.scorecard_result_plural : d.scorecard_result_singular} — {entries.length} {d.scorecard_results_of}
        </p>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <div className="border border-jacket-border py-12 text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">{d.scorecard_no_results}</p>
          <button
            onClick={() => { setQuery(""); setRaceFilter("all"); }}
            className="mt-4 font-mono text-xs text-jacket-amber hover:underline"
          >
            {d.scorecard_clear_filters}
          </button>
        </div>
      )}

      {/* Grades — only show sections that have results */}
      {clean.length > 0 && (
        <section>
          {!isFiltering && (
            <h2 className="mb-3 border-l-4 border-green-500 pl-3 text-lg font-black uppercase tracking-tight text-green-400">
              {d.scorecard_clean_header}
            </h2>
          )}
          <ScorecardTable entries={clean} showGradeHeader={isFiltering} />
        </section>
      )}

      {mid.length > 0 && (
        <section>
          {!isFiltering && (
            <h2 className="mb-3 border-l-4 border-yellow-400 pl-3 text-lg font-black uppercase tracking-tight text-yellow-400">
              {d.scorecard_mid_header}
            </h2>
          )}
          <ScorecardTable entries={mid} showGradeHeader={isFiltering} />
        </section>
      )}

      {flagged.length > 0 && (
        <section>
          {!isFiltering && (
            <h2 className="mb-3 border-l-4 border-jacket-red pl-3 text-lg font-black uppercase tracking-tight text-jacket-red">
              {d.scorecard_flagged_header}
            </h2>
          )}
          <ScorecardTable entries={flagged} showGradeHeader={isFiltering} />
        </section>
      )}
    </div>
  );
}

function ScorecardTable({ entries, showGradeHeader }: { entries: ScorecardEntry[]; showGradeHeader: boolean }) {
  return (
    <div className="divide-y divide-jacket-border border border-jacket-border">
      {entries.map((entry) => {
        const gradeColor = GRADE_COLOR[entry.grade] ?? "text-zinc-400";
        return (
          <Link
            key={entry.candidate.id}
            href={`/candidate/${entry.candidate.id}`}
            className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-jacket-gray/30"
          >
            {/* Grade box */}
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900 transition-colors group-hover:border-jacket-amber">
              <span className={`font-mono text-base font-black leading-none ${gradeColor}`}>{entry.grade}</span>
              <span className="font-mono text-[10px] text-zinc-500">{entry.score}</span>
            </div>

            {/* Name + office */}
            <div className="min-w-0 flex-1">
              <span className="block truncate font-bold text-jacket-white transition-colors group-hover:text-jacket-amber">
                {entry.candidate.name}
              </span>
              <span className="block truncate font-mono text-[11px] text-zinc-500">
                {(entry.candidate.office ?? "").replace("U.S. House — ", "IL-").replace("U.S. Senate (Illinois)", "IL Senate").replace("Cook County ", "")}
                {entry.candidate.party ? ` · ${entry.candidate.party}` : ""}
              </span>
            </div>

            {/* Flag count */}
            {entry.candidate.red_flags.length > 0 && (
              <span className="shrink-0 font-mono text-xs text-zinc-600">
                🚩 {entry.candidate.red_flags.length}
              </span>
            )}

            <span className="shrink-0 font-mono text-zinc-600 transition-colors group-hover:text-jacket-amber">→</span>
          </Link>
        );
      })}
    </div>
  );
}
