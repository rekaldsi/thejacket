import type { Metadata } from "next";
import { getAllCandidates, getAllJudges, getRaces } from "@/lib/data";
import type { Candidate, Race } from "@/lib/types";
import ResultsClient from "@/components/ResultsClient";

export const metadata: Metadata = {
  title: "2026 Illinois Primary Results — TheJacket.cc",
  description:
    "March 17, 2026 Illinois & Cook County primary results — all races: federal, statewide, Cook County offices, and judicial. Non-partisan, direct from official sources.",
  openGraph: {
    title: "2026 Illinois Primary Results — TheJacket.cc",
    description:
      "All March 17, 2026 primary results in one place. Winners, vote percentages, judges.",
    images: [{ url: "/logo.png" }],
  },
};

// ─── Grouping ─────────────────────────────────────────────────────────────────

const RACE_GROUPS: Array<{ label: string; slugPattern: string | RegExp }> = [
  { label: "Federal", slugPattern: /^(us-senate|il-\d+-us-house)/ },
  { label: "Statewide", slugPattern: /^il-(governor|attorney-general|treasurer|comptroller|secretary-of-state)/ },
  { label: "Cook County", slugPattern: /^cook-county/ },
  { label: "MWRD", slugPattern: /^mwrd/ },
  { label: "Judicial", slugPattern: /^judicial/ },
];

function assignGroup(slug: string): string {
  for (const group of RACE_GROUPS) {
    if (typeof group.slugPattern === "string") {
      if (slug.startsWith(group.slugPattern)) return group.label;
    } else {
      if (group.slugPattern.test(slug)) return group.label;
    }
  }
  return "Other";
}

// ─── Page (server component — data only) ─────────────────────────────────────

export default function ResultsPage() {
  const races = getRaces();
  const candidates = getAllCandidates();
  const judges = getAllJudges();

  // Only include non-judicial races on this page (judges have their own page)
  const nonJudicialRaces = races.filter((r) => !r.id.startsWith("judicial"));

  // Build race → candidates map
  const raceData = nonJudicialRaces.map((race) => ({
    race,
    candidates: candidates.filter((c) => c.race_id === race.id),
  }));

  // Group races
  const grouped: Record<string, Array<{ race: Race; candidates: Candidate[] }>> = {};
  for (const item of raceData) {
    const group = assignGroup(item.race.id);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
  }

  // Compute summary stats
  const totalRaces = races.length;
  const totalCandidates = candidates.length;
  const calledRaces = races.filter((r) => {
    const raceCandidates = candidates.filter((c) => c.race_id === r.id);
    return raceCandidates.some(
      (c) =>
        c.primary_result?.status === "won" ||
        c.primary_result?.status === "uncontested-won"
    );
  }).length;

  const lastUpdated = (() => {
    const timestamps = candidates
      .map((c) => c.primary_result?.updated)
      .filter(Boolean) as string[];
    if (timestamps.length === 0) return null;
    return timestamps.sort().reverse()[0];
  })();

  const groupOrder = ["Federal", "Statewide", "Cook County", "MWRD"];

  return (
    <ResultsClient
      raceData={raceData}
      groupOrder={groupOrder}
      grouped={grouped}
      judges={judges}
      totalRaces={totalRaces}
      totalCandidates={totalCandidates}
      calledRaces={calledRaces}
      lastUpdated={lastUpdated}
    />
  );
}
