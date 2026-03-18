import { getAllCandidates, getAllJudges, getRaces } from "@/lib/data";
import { scoreCandidate } from "@/lib/scoring";
import { scoreJudge } from "@/lib/judgeScoring";
import BoothBuilder from "@/components/BoothBuilder";
import type { BoothSection, BoothJudicialRace } from "@/components/BoothBuilder";

export const metadata = {
  title: "Booth Mode — Build Your Ballot | TheJacket",
  description:
    "Build your personal ballot card. See every candidate's grade and red flags side-by-side, pick who you want, and walk into the booth ready.",
};

// ── Ballot sections in Cook County primary order ──
const BALLOT_SECTION_DEFS = [
  {
    label: "Federal — Democratic",
    raceIds: [
      "us-senate-il-d-2026",
      "il-02-us-house-d-2026",
      "il-04-us-house-open-2026",
      "il-07-us-house-d-2026",
      "il-09-us-house-d-2026",
    ],
  },
  {
    label: "Federal — Republican",
    raceIds: ["us-senate-il-r-2026"],
  },
  {
    label: "Illinois Statewide — Democratic",
    raceIds: [
      "il-governor-d-2026",
      "il-attorney-general-d-2026",
      "il-treasurer-d-2026",
      "il-comptroller-d-2026",
    ],
  },
  {
    label: "Illinois Statewide — Republican",
    raceIds: [
      "il-governor-r-2026",
      "il-comptroller-r-2026",
      "il-attorney-general-r-2026",
      "il-treasurer-r-2026",
    ],
  },
  {
    label: "Cook County",
    raceIds: [
      "cook-county-board-president-d-2026",
      "cook-county-assessor-d-2026",
      "cook-county-sheriff-d-2026",
      "cook-county-commissioner-dist-2",
      "cook-county-commissioner-dist-5",
      "cook-county-commissioner-dist-6",
      "cook-county-commissioner-dist-8",
      "cook-county-commissioner-dist-9",
      "cook-county-commissioner-dist-10",
      "cook-county-commissioner-dist-12",
      "cook-county-commissioner-dist-15",
      "cook-county-commissioner-dist-16",
      "cook-county-commissioner-dist-17",
    ],
  },
  {
    label: "MWRD",
    raceIds: ["mwrd-6yr-2026", "mwrd-2yr-2026"],
  },
];

export default function BoothPage() {
  const allCandidates = getAllCandidates();
  const allJudges = getAllJudges();
  const races = getRaces();

  // Build race title lookup
  const raceTitle: Record<string, string> = {};
  for (const r of races) raceTitle[r.id] = r.title;

  // Score + group active candidates by race
  const byRace: Record<string, ReturnType<typeof scoreCandidate>[]> = {};
  const withdrawnByRace: Record<string, string[]> = {};

  for (const c of allCandidates) {
    if (!c.race_id) continue;
    if (c.status === "withdrawn") {
      if (!withdrawnByRace[c.race_id]) withdrawnByRace[c.race_id] = [];
      withdrawnByRace[c.race_id].push(c.name);
      continue;
    }
    if (!byRace[c.race_id]) byRace[c.race_id] = [];
    byRace[c.race_id].push(scoreCandidate(c));
  }
  // Sort each race by score desc
  for (const id of Object.keys(byRace)) {
    byRace[id].sort((a, b) => b.score - a.score);
  }

  // Build sections for BoothBuilder
  const sections: BoothSection[] = BALLOT_SECTION_DEFS.map((def) => ({
    label: def.label,
    races: def.raceIds
      .map((id) => ({
        id,
        title: raceTitle[id] ?? id,
        entries: byRace[id] ?? [],
        withdrawn: withdrawnByRace[id],
      }))
      .filter((r) => r.entries.length > 0),
  })).filter((s) => s.races.length > 0);

  // Judicial races
  const judgesByRace: Record<string, ReturnType<typeof scoreJudge>[]> = {};
  for (const j of allJudges) {
    if (!judgesByRace[j.race_id]) judgesByRace[j.race_id] = [];
    judgesByRace[j.race_id].push(scoreJudge(j));
  }
  for (const id of Object.keys(judgesByRace)) {
    judgesByRace[id].sort((a, b) => b.score - a.score);
  }

  const judicialRaces: BoothJudicialRace[] = races
    .filter((r) => r.note === "judicial" && judgesByRace[r.id]?.length > 0)
    .map((r) => ({
      id: r.id,
      title: r.title,
      entries: judgesByRace[r.id],
    }));

  return (
    <div className="space-y-10 pb-16">

      {/* Header */}
      <section className="space-y-3 border-b border-jacket-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-jacket-amber">
          🗳 Cook County Primary — March 17, 2026
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
          Booth Mode
        </h1>
        <p className="text-zinc-300">
          Build your personal ballot. See every candidate&apos;s transparency grade and red flags side-by-side.
          Tap who you want — your picks are yours alone, saved only on this device.
        </p>
        <p className="font-mono text-xs text-zinc-500">
          ⚠️ Grades reflect documented public record — not an endorsement. Tap any candidate to read the full sourced profile before deciding. Verify at FEC.gov and ILSBE before voting.
        </p>
      </section>

      {/* Interactive ballot builder */}
      <BoothBuilder sections={sections} judicialRaces={judicialRaces} />

    </div>
  );
}
