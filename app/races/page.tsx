import { getRaces, getCandidatesByRaceId } from "@/lib/data";
import RacesPageClient from "./RacesPageClient";

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

  return <RacesPageClient races={races} />;
}
