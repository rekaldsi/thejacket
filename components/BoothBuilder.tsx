"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ScorecardEntry } from "@/lib/scoring";
import type { Judge } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type BoothRace = {
  id: string;
  title: string;
  entries: ScorecardEntry[];
  withdrawn?: string[];
};

export type BoothJudicialRace = {
  id: string;
  title: string;
  entries: { judge: Judge; score: number; grade: string; gradeColor: string }[];
};

export type BoothSection = {
  label: string;
  races: BoothRace[];
};

type Props = {
  sections: BoothSection[];
  judicialRaces: BoothJudicialRace[];
};

// ── Utilities ─────────────────────────────────────────────────────────────

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-400", B: "text-lime-400", C: "text-yellow-400",
  D: "text-orange-400", F: "text-red-400",
};

const GRADE_BG: Record<string, string> = {
  A: "border-green-500/50 bg-green-950/20",
  B: "border-lime-500/40 bg-lime-950/15",
  C: "border-yellow-500/40 bg-yellow-950/15",
  D: "border-orange-500/40 bg-orange-950/15",
  F: "border-red-500/40 bg-red-950/15",
};

function gradeOf(g: string) {
  return g.charAt(0);
}

// ── Main component ─────────────────────────────────────────────────────────

export default function BoothBuilder({ sections, judicialRaces }: Props) {
  // picks: raceId → candidateId (or judgeId)
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [showBallot, setShowBallot] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("thejacket-booth-picks");
      if (saved) setPicks(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("thejacket-booth-picks", JSON.stringify(picks));
    } catch {}
  }, [picks, hydrated]);

  const pick = useCallback((raceId: string, candidateId: string) => {
    setPicks((prev) => {
      // Clicking the already-selected pick clears it
      if (prev[raceId] === candidateId) {
        const next = { ...prev };
        delete next[raceId];
        return next;
      }
      return { ...prev, [raceId]: candidateId };
    });
  }, []);

  const clearAll = useCallback(() => {
    setPicks({});
    try { localStorage.removeItem("thejacket-booth-picks"); } catch {}
  }, []);

  // Count total races + picks made
  const totalRaces =
    sections.reduce((acc, s) => acc + s.races.length, 0) + judicialRaces.length;
  const pickCount = Object.keys(picks).length;

  return (
    <div className="space-y-10">

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Your ballot — {pickCount} of {totalRaces} races picked
          </p>
          <div className="flex items-center gap-3">
            {pickCount > 0 && (
              <>
                <button
                  onClick={() => setShowBallot((v) => !v)}
                  className="rounded-sm border border-jacket-amber px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black"
                >
                  {showBallot ? "Hide ballot" : "View my ballot"}
                </button>
                <button
                  onClick={clearAll}
                  className="font-mono text-xs uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>
        <div className="h-1 w-full rounded-full bg-zinc-800">
          <div
            className="h-1 rounded-full bg-jacket-amber transition-all duration-300"
            style={{ width: totalRaces > 0 ? `${(pickCount / totalRaces) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* My Ballot summary — collapsible */}
      {showBallot && pickCount > 0 && (
        <section className="rounded border border-jacket-amber/30 bg-jacket-amber/5 p-5 space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-jacket-amber">
            🗳 Your Ballot — {pickCount} pick{pickCount !== 1 ? "s" : ""}
          </h2>
          <div className="divide-y divide-jacket-border">
            {sections.flatMap((s) =>
              s.races
                .filter((r) => picks[r.id])
                .map((r) => {
                  const picked = r.entries.find((e) => e.candidate.id === picks[r.id]);
                  if (!picked) return null;
                  return (
                    <div key={r.id} className="flex items-center gap-3 py-2.5">
                      <span className={`font-mono text-sm font-black w-6 text-center ${GRADE_COLOR[gradeOf(picked.grade)] ?? "text-zinc-400"}`}>
                        {picked.grade}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-jacket-white truncate">{picked.candidate.name}</p>
                        <p className="font-mono text-[10px] text-zinc-600 truncate">{r.title}</p>
                      </div>
                      <button
                        onClick={() => pick(r.id, picks[r.id])}
                        className="font-mono text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
            )}
            {judicialRaces
              .filter((r) => picks[r.id])
              .map((r) => {
                const picked = r.entries.find((e) => e.judge.id === picks[r.id]);
                if (!picked) return null;
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2.5">
                    <span className={`font-mono text-sm font-black w-6 text-center ${GRADE_COLOR[gradeOf(picked.grade)] ?? "text-zinc-400"}`}>
                      {picked.grade}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-jacket-white truncate">{picked.judge.name}</p>
                      <p className="font-mono text-[10px] text-zinc-600 truncate">{r.title}</p>
                    </div>
                    <button
                      onClick={() => pick(r.id, picks[r.id])}
                      className="font-mono text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
          </div>
          <p className="font-mono text-[10px] text-zinc-600">
            Picks saved locally on this device. Not shared or stored.
          </p>
        </section>
      )}

      {/* Race sections */}
      {sections.map((section) => {
        const sectionRaces = section.races.filter((r) => r.entries.length > 0);
        if (sectionRaces.length === 0) return null;

        return (
          <section key={section.label} className="space-y-4">
            <h2 className="border-b border-jacket-border pb-2 font-mono text-xs uppercase tracking-widest text-jacket-amber">
              {section.label}
            </h2>

            <div className="space-y-5">
              {sectionRaces.map((race) => (
                <RaceCard
                  key={race.id}
                  race={race}
                  pickedId={picks[race.id]}
                  onPick={(cid) => pick(race.id, cid)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Judicial races */}
      {judicialRaces.length > 0 && (
        <section className="space-y-4">
          <h2 className="border-b border-jacket-border pb-2 font-mono text-xs uppercase tracking-widest text-jacket-amber">
            Judicial Races
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            Bar association ratings from Alliance of Bar Associations + Chicago Bar Association. NR = Not Recommended.
          </p>
          <div className="space-y-5">
            {judicialRaces.map((race) => (
              <JudicialRaceCard
                key={race.id}
                race={race}
                pickedId={picks[race.id]}
                onPick={(jid) => pick(race.id, jid)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer disclaimer */}
      <section className="border-t border-jacket-border pt-6">
        <p className="text-xs text-zinc-600">
          TheJacket is a civic transparency tool — not an endorsement. Picks are yours alone, stored only on this device.
          All grades sourced from FEC filings, ILSBE, court records, and named investigative journalism.
          Verify at{" "}
          <a href="https://fec.gov" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-jacket-amber underline">fec.gov</a>
          {" "}and{" "}
          <a href="https://illinoissunshine.org" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-jacket-amber underline">illinoissunshine.org</a>.
        </p>
      </section>

    </div>
  );
}

// ── RaceCard ──────────────────────────────────────────────────────────────

function RaceCard({
  race,
  pickedId,
  onPick,
}: {
  race: BoothRace;
  pickedId?: string;
  onPick: (id: string) => void;
}) {
  const isContested = race.entries.length > 1;

  return (
    <div className="space-y-2">
      {/* Race label */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{race.title}</p>

      {/* Candidate options */}
      <div className={`grid gap-2 ${race.entries.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : race.entries.length === 2 ? "sm:grid-cols-2" : ""}`}>
        {race.entries.map((entry) => {
          const isPicked = pickedId === entry.candidate.id;
          const baseGrade = gradeOf(entry.grade);
          const gradeBg = GRADE_BG[baseGrade] ?? GRADE_BG.F;

          return (
            <button
              key={entry.candidate.id}
              onClick={() => onPick(entry.candidate.id)}
              className={`
                group relative w-full rounded-sm border p-3 text-left transition-all duration-150
                ${isPicked
                  ? "border-jacket-amber bg-jacket-amber/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : `${gradeBg} hover:border-zinc-400`
                }
              `}
            >
              {/* Selected checkmark */}
              {isPicked && (
                <span className="absolute right-2 top-2 font-mono text-xs text-jacket-amber">✓</span>
              )}

              <div className="flex items-start gap-2.5">
                {/* Grade */}
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900">
                  <span className={`font-mono text-sm font-black leading-none ${GRADE_COLOR[baseGrade] ?? "text-zinc-400"}`}>
                    {entry.grade}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-600">{entry.score}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`truncate font-bold text-sm leading-tight ${isPicked ? "text-jacket-amber" : "text-jacket-white"}`}>
                    {entry.candidate.name}
                  </p>
                  {entry.candidate.red_flags.length > 0 && (
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                      🚩 {entry.candidate.red_flags.filter(f => f.confirmed).length} confirmed flag{entry.candidate.red_flags.filter(f => f.confirmed).length !== 1 ? "s" : ""}
                    </p>
                  )}
                  {entry.candidate.red_flags.length === 0 && (
                    <p className="mt-0.5 font-mono text-[10px] text-green-600">No confirmed flags</p>
                  )}
                </div>
              </div>

              {/* View profile link — doesn't trigger pick */}
              <Link
                href={`/candidate/${entry.candidate.id}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 block font-mono text-[10px] text-zinc-600 hover:text-jacket-amber transition-colors"
              >
                View full profile →
              </Link>
            </button>
          );
        })}
      </div>

      {/* Withdrawn note */}
      {(race.withdrawn ?? []).length > 0 && (
        <p className="font-mono text-[10px] text-zinc-700">
          Withdrawn: {(race.withdrawn ?? []).join(", ")}
        </p>
      )}

      {/* Uncontested note */}
      {!isContested && race.entries.length === 1 && (
        <p className="font-mono text-[10px] text-zinc-600">
          Running unopposed — only option on the ballot.
        </p>
      )}
    </div>
  );
}

// ── JudicialRaceCard ──────────────────────────────────────────────────────

function JudicialRaceCard({
  race,
  pickedId,
  onPick,
}: {
  race: BoothJudicialRace;
  pickedId?: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{race.title}</p>

      <div className={`grid gap-2 ${race.entries.length >= 2 ? "sm:grid-cols-2" : ""}`}>
        {race.entries.map((entry) => {
          const isPicked = pickedId === entry.judge.id;
          const baseGrade = gradeOf(entry.grade);
          const gradeBg = GRADE_BG[baseGrade] ?? GRADE_BG.F;
          const r = entry.judge.bar_ratings;
          const barLine = [r.alliance_rating && `Alliance: ${r.alliance_rating}`, r.cba_rating && `CBA: ${r.cba_rating}`].filter(Boolean).join(" · ");

          return (
            <button
              key={entry.judge.id}
              onClick={() => onPick(entry.judge.id)}
              className={`
                group relative w-full rounded-sm border p-3 text-left transition-all duration-150
                ${isPicked
                  ? "border-jacket-amber bg-jacket-amber/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : `${gradeBg} hover:border-zinc-400`
                }
              `}
            >
              {isPicked && (
                <span className="absolute right-2 top-2 font-mono text-xs text-jacket-amber">✓</span>
              )}

              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900">
                  <span className={`font-mono text-sm font-black leading-none ${GRADE_COLOR[baseGrade] ?? "text-zinc-400"}`}>
                    {entry.grade}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-600">{entry.score}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-bold text-sm leading-tight ${isPicked ? "text-jacket-amber" : "text-jacket-white"}`}>
                    {entry.judge.name}
                  </p>
                  {barLine && (
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{barLine}</p>
                  )}
                </div>
              </div>

              <Link
                href="/judges"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 block font-mono text-[10px] text-zinc-600 hover:text-jacket-amber transition-colors"
              >
                View judicial profiles →
              </Link>
            </button>
          );
        })}
      </div>
    </div>
  );
}
