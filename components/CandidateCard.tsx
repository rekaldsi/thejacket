"use client";

import Image from "next/image";
import Link from "next/link";
import type { Candidate } from "@/lib/types";
import MoneyAmount from "@/components/MoneyAmount";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

type CandidateCardProps = {
  candidate: Candidate;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function getPartyPillClasses(party: string) {
  const upper = party.trim().toUpperCase();
  if (upper.startsWith("D")) return "bg-blue-900 text-blue-200";
  if (upper.startsWith("R")) return "bg-red-900 text-red-200";
  return "bg-zinc-800 text-zinc-200";
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const { lang } = useLanguage();
  const d = translations[lang];
  const initials = getInitials(candidate.name);
  const flagCount = candidate.red_flags.length;
  const isWithdrawn = candidate.status === "withdrawn";

  return (
    <Link
      href={`/candidate/${candidate.id}`}
      className={`block border p-4 transition-colors hover:border-jacket-amber ${isWithdrawn ? "border-zinc-700 opacity-60" : "border-jacket-border"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-jacket-gray font-mono text-xs text-zinc-300">
          {candidate.photo_url ? (
            <Image src={candidate.photo_url} alt={candidate.name} width={48} height={48} className="h-12 w-12 object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-base font-bold ${isWithdrawn ? "line-through text-zinc-500" : ""}`}>{candidate.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs ${getPartyPillClasses(candidate.party)}`}>{candidate.party}</span>
            {isWithdrawn && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-zinc-400">{d.card_withdrawn_label}</span>
            )}
            {!isWithdrawn && candidate.data_status === "limited" && (
              <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">{d.card_limited_data_label}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-400">{candidate.office}</p>

          {isWithdrawn ? (
            <p className="mt-2 text-xs text-zinc-600 italic">
              {candidate.withdrawal_note ?? d.card_withdrew_default}
            </p>
          ) : (
            <div className="mt-2 border-t border-jacket-border/50 pt-2">
              <div className="flex items-center justify-between font-mono text-sm">
                <span className="text-zinc-400">{d.card_raised_label}</span>
                <MoneyAmount value={candidate.jacket.total_raised} />
              </div>
              <p className={`mt-2 text-xs ${flagCount > 0 ? "text-jacket-red" : "text-zinc-600"}`}>
                {flagCount > 0 ? `🚩 ${flagCount}` : d.card_no_flags}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
