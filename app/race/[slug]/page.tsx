import { notFound } from "next/navigation";
import { getCandidatesByRaceId, getRaceBySlug, getRaces } from "@/lib/data";
import RacePageClient from "./RacePageClient";

export function generateStaticParams() {
  return getRaces().map((race) => ({ slug: race.slug }));
}

export default function RacePage({ params }: { params: { slug: string } }) {
  const race = getRaceBySlug(params.slug);
  if (!race) notFound();
  const candidates = getCandidatesByRaceId(race.id);
  return <RacePageClient race={race} candidates={candidates} />;
}
