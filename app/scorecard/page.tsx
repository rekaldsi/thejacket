import ScorecardSearch from "@/components/ScorecardSearch";
import { getAllCandidates } from "@/lib/data";
import { buildScorecard } from "@/lib/scoring";

export const metadata = {
  title: "Transparency Scorecard | TheJacket",
  description: "Every Cook County primary candidate ranked by public record. Who's cleanest? Who's most compromised? Every deduction sourced.",
};

export default function ScorecardPage() {
  const candidates = getAllCandidates();
  const scorecard = buildScorecard(candidates);

  return (
    <div className="space-y-10">

      {/* Header */}
      <section className="space-y-3 border-b border-jacket-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-jacket-amber">
          Cook County Primary — March 17, 2026
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
          Transparency<br />Scorecard
        </h1>
        <p className="max-w-3xl text-zinc-300">
          Every candidate ranked by public record. Scores are calculated from confirmed and alleged flags sourced
          from FEC filings, federal court records, investigative reporting, and official government disclosures.
          Higher score = cleaner record. No score is an endorsement.
        </p>
        <p className="font-mono text-xs text-zinc-500">
          ⚠️ Scores reflect currently seeded data only. Missing data = not enough information to score lower —
          not a clean record. Verify at FEC.gov and ILSBE before voting.
        </p>
      </section>

      {/* Score key */}
      <div className="grid grid-cols-2 gap-2 font-mono text-sm md:grid-cols-5">
        {[
          { grade: "A",  range: "80–100", color: "text-green-400",  bg: "bg-green-950/40",  label: "Clean record" },
          { grade: "B",  range: "70–79",  color: "text-lime-400",   bg: "bg-lime-950/40",   label: "Minor concerns" },
          { grade: "C",  range: "60–69",  color: "text-yellow-400", bg: "bg-yellow-950/40", label: "Notable flags" },
          { grade: "D",  range: "50–59",  color: "text-orange-400", bg: "bg-orange-950/40", label: "Serious concerns" },
          { grade: "F",  range: "0–49",   color: "text-jacket-red", bg: "bg-red-950/40",    label: "Heavy flags" },
        ].map(({ grade, range, color, bg, label }) => (
          <div key={grade} className={`rounded-sm ${bg} p-3 border border-jacket-border`}>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${color}`}>{grade}</span>
              <span className="text-xs text-zinc-500">{range}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Searchable + filterable scorecard */}
      <ScorecardSearch entries={scorecard} />

      {/* Methodology */}
      <section className="border-t border-jacket-border pt-8 text-sm text-zinc-400 space-y-2">
        <h3 className="font-mono uppercase tracking-widest text-zinc-300">Scoring Methodology</h3>
        <p>All candidates start at 100. Points are deducted for confirmed and alleged public-record flags:</p>
        <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
          <li>AIPAC endorsement (confirmed) — −20</li>
          <li>AIPAC-aligned donor network (confirmed) — −15</li>
          <li>Dark money / corporate PAC (confirmed) — −15</li>
          <li>Ethics violation / corruption (confirmed) — −20</li>
          <li>Federal indictment / criminal charge — −25</li>
          <li>Epstein connection (confirmed) — −30</li>
          <li>Unconfirmed / alleged flag — −8 each</li>
        </ul>
        <p className="mt-2">Bonuses: small-dollar fundraising only (+10), FEC filing on record (+5).</p>
        <p>
          Scores are a starting point for research — not a final verdict. Always verify at{" "}
          <a href="https://www.fec.gov" target="_blank" rel="noreferrer" className="text-jacket-amber hover:underline">FEC.gov</a>,{" "}
          <a href="https://www.elections.il.gov" target="_blank" rel="noreferrer" className="text-jacket-amber hover:underline">ILSBE</a>, and primary sources linked on each candidate page.
        </p>
      </section>

    </div>
  );
}
