import Link from "next/link";
import { getRaces, getCandidatesByRaceId } from "@/lib/data";
import RacesClient from "@/components/RacesClient";

export const metadata = {
  title: "All Races — TheJacket",
  description: "Every primary on the March 17, 2026 Illinois ballot — Democratic, Republican, Libertarian, and more.",
};

export default function RacesPage() {
  const raw = getRaces().filter((r) => !r.note?.includes("judicial"));

  // Hydrate candidate counts from live data, pass serializable plain objects to client
  const races = raw.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    jurisdiction: r.jurisdiction,
    party: r.party ?? "Democratic",
    candidateCount: getCandidatesByRaceId(r.id).length,
    note: r.note,
  }));

  return (
    <>
      <div className="mb-6 flex items-center justify-between rounded-sm border border-jacket-amber/30 bg-jacket-amber/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-jacket-amber">Primary Results Live</span>
        </div>
        <Link href="/results" className="font-mono text-xs uppercase tracking-widest text-jacket-amber hover:underline">
          View Results →
        </Link>
      </div>
      <RacesClient races={races} />
    </>
  );
}
