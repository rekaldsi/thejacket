"use client";

import Image from "next/image";
import Link from "next/link";
import MoneyAmount from "@/components/MoneyAmount";
import ShareButton from "@/components/ShareButton";
import type { Race, Candidate } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

type Props = {
  race: Race;
  candidates: Candidate[];
};

export default function RacePageClient({ race, candidates }: Props) {
  const { lang } = useLanguage();
  const d = translations[lang];

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h1 className="font-mono text-4xl uppercase tracking-tight md:text-6xl">{race.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-block rounded-full bg-jacket-amber/20 px-3 py-1 font-mono text-xs uppercase tracking-widest text-jacket-amber">
            {race.jurisdiction}
          </span>
          <ShareButton />
        </div>
        <p className="max-w-4xl border-l-2 border-jacket-amber pl-4 text-zinc-300">{race.description}</p>
      </section>

      <section className="border border-jacket-border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-jacket-border bg-jacket-gray/30 text-left font-mono uppercase">
                <th className="p-3">{d.race_candidate_col}</th>
                <th className="p-3">{d.race_party_col}</th>
                <th className="p-3">{d.race_raised_col}</th>
                <th className="p-3">{d.race_flags_col}</th>
                <th className="w-12 p-3 text-right">&rarr;</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-jacket-border/50 transition-colors hover:bg-jacket-gray/20">
                    <td className="p-3">
                      <Link href={`/candidate/${candidate.id}`} className="flex items-center gap-3 hover:text-jacket-amber">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-jacket-gray font-mono text-[10px] text-zinc-300">
                          {candidate.photo_url ? (
                            <Image
                              src={candidate.photo_url}
                              alt={candidate.name}
                              width={32}
                              height={32}
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            getInitials(candidate.name)
                          )}
                        </div>
                        <span>{candidate.name}</span>
                      </Link>
                    </td>
                    <td className="p-3">{candidate.party}</td>
                    <td className="p-3 font-mono text-jacket-amber">
                      <MoneyAmount value={candidate.jacket.total_raised} />
                    </td>
                    <td className="p-3 text-jacket-red">🚩 {candidate.red_flags.length}</td>
                    <td className="p-3 text-right text-zinc-500">&rarr;</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-zinc-400">
                    {d.race_no_candidates}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
