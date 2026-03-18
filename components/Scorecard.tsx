"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ScorecardEntry } from "@/lib/scoring";

type ScorecardProps = {
  entries: ScorecardEntry[];
  limit?: number;
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-500" :
    score >= 60 ? "bg-yellow-400" :
    score >= 40 ? "bg-orange-400" :
    "bg-jacket-red";

  return (
    <div className="h-2 w-full rounded-full bg-zinc-800">
      <motion.div
        className={`h-2 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
}

export default function Scorecard({ entries, limit }: ScorecardProps) {
  const visible = limit ? entries.slice(0, limit) : entries;

  return (
    <div className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-jacket-border">
      {visible.map((entry, idx) => {
        const { candidate, score, grade, gradeColor, deductions, bonuses, gradeDataLimited } = entry;
        const rankColor =
          idx === 0 ? "text-green-400" :
          idx === 1 ? "text-lime-400" :
          idx === entries.length - 1 ? "text-jacket-red" :
          "text-zinc-500";

        return (
          <Link
            key={candidate.id}
            href={`/candidate/${candidate.id}`}
            className="group block border border-jacket-border p-3 transition-colors hover:bg-jacket-gray/30
                       sm:flex sm:items-center sm:gap-4 sm:border-0 sm:py-4 sm:px-2 sm:-mx-2"
          >
            <div className="flex items-center gap-3 sm:contents">
              {/* Rank — desktop only */}
              <span className={`hidden sm:block w-6 shrink-0 font-mono text-sm font-bold ${rankColor}`}>
                {idx + 1}
              </span>

              {/* Grade badge */}
              <div className="relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm border border-jacket-border bg-zinc-900 transition-colors group-hover:border-jacket-amber">
                <span className={`font-mono text-lg font-black leading-none ${gradeColor}`}>{grade}</span>
                <span className="font-mono text-xs text-zinc-500">{score}</span>
                {gradeDataLimited && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white"
                    title="Grade based on available public data — limited info"
                  >
                    ?
                  </span>
                )}
              </div>

              {/* Candidate info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-jacket-white transition-colors group-hover:text-jacket-amber truncate">
                    {candidate.name}
                  </span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 whitespace-nowrap">
                    {candidate.office.replace("U.S. House — ", "").replace("U.S. Senate (Illinois)", "IL Senate")}
                  </span>
                </div>

                <ScoreBar score={score} />

                {/* Mobile: show 1 deduction only */}
                <div className="sm:hidden mt-1 flex flex-wrap gap-2">
                  {deductions.slice(0, 1).map((d) => (
                    <span key={d.reason} className="text-xs text-jacket-red">
                      −{d.points} {d.reason.split(":").pop()?.trim().split(" ").slice(0, 4).join(" ")}
                    </span>
                  ))}
                  {deductions.length === 0 && bonuses.length === 0 && (
                    <span className="text-xs text-zinc-500">No flags — data may be incomplete</span>
                  )}
                  {bonuses.slice(0, 1).map((b) => (
                    <span key={b.reason} className="text-xs text-green-500">
                      +{b.points} {b.reason}
                    </span>
                  ))}
                </div>

                {/* Desktop: show up to 3 deductions + all bonuses */}
                <div className="hidden sm:flex mt-1 flex-wrap gap-2">
                  {deductions.slice(0, 3).map((d) => (
                    <span key={d.reason} className="text-xs text-jacket-red">
                      −{d.points} {d.reason.split(":").pop()?.trim().split(" ").slice(0, 4).join(" ")}
                    </span>
                  ))}
                  {deductions.length > 3 && (
                    <span className="text-xs text-zinc-500">+{deductions.length - 3} more</span>
                  )}
                  {bonuses.map((b) => (
                    <span key={b.reason} className="text-xs text-green-500">
                      +{b.points} {b.reason}
                    </span>
                  ))}
                  {deductions.length === 0 && bonuses.length === 0 && (
                    <span className="text-xs text-zinc-500">No flags found — data may be incomplete</span>
                  )}
                </div>
              </div>
            </div>

            {/* Arrow — desktop only */}
            <span className="hidden sm:block shrink-0 font-mono text-zinc-600 transition-colors group-hover:text-jacket-amber">→</span>
          </Link>
        );
      })}
    </div>
  );
}
