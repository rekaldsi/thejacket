"use client";

import Link from "next/link";
import RacesClient, { type RaceData } from "@/components/RacesClient";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

export default function RacesPageClient({ races }: { races: RaceData[] }) {
  const { lang } = useLanguage();
  const d = translations[lang];

  return (
    <>
      <div className="mb-6 flex items-center justify-between rounded-sm border border-jacket-amber/30 bg-jacket-amber/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-jacket-amber">{d.races_live_results_pill}</span>
        </div>
        <Link href="/results" className="font-mono text-xs uppercase tracking-widest text-jacket-amber hover:underline">
          {d.races_view_results_link}
        </Link>
      </div>
      <RacesClient races={races} />
    </>
  );
}
