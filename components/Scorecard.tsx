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
    <div className="h-1.5 w-full rounded-full bg-zinc-800">
      <motion.div
        className={`h-1.5 rounded-full ${color}`}
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
    <div className="divide-y divide-jacket-border">
      {visible.map((entry, idx) => {
        const { candidate, score, grade, gradeColor, deductions, bonuses } = entry;
        const rankColor =
          idx === 0 ? "text-green-400" :
          idx === 1 ? "text-lime-400" :
          idx === entries.length - 1 ? "text-jacket-red" :
          "text-zinc-500";

        return (
          <Link
            key={candidate.id}
            href={`/candidate/${candidate.id}`}
            className="group flex items-center gap-4 py-4 transition-colors hover:bg-jacket-gray/30 px-2 -mx-2"
          >
            {/* Rank */}
            <span className={`w-6 shrink-0 font-mono text-sm font-bold ${rankColor}`}>
              {idx + 1}
            </span>

            {/* Grade badge */}
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm bg-zinc-900 border border-jacket-border group-hover:border-jacket-amber transition-colors">
              <span className={`font-mono text-lg font-black leading-none ${gradeColor}`}>{grade}</span>
              <span className="font-mono text-xs text-zinc-500">{score}</span>
            </div>

            {/* Candidate info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-jacket-white group-hover:text-jacket-amber transition-colors truncate">
                  {candidate.name}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 whitespace-nowrap">
                  {candidate.office.replace("U.S. House — ", "").replace("U.S. Senate (Illinois)", "IL Senate")}
                </span>
              </div>

              <ScoreBar score={score} />

              {/* Flags summary */}
              <div className="mt-1 flex flex-wrap gap-2">
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

            {/* Arrow */}
            <span className="shrink-0 font-mono text-zinc-600 group-hover:text-jacket-amber transition-colors">→</span>
          </Link>
        );
      })}
    </div>
  );
}
