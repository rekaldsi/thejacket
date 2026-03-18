import CandidateCard from "@/components/CandidateCard";
import { getAllCandidates } from "@/lib/data";

export const metadata = {
  title: "Running Alone — Uncontested Races | TheJacket",
  description:
    "No opponent doesn't mean no record. These incumbents appear on your ballot unopposed in the March 2026 Illinois primary.",
};

export default function UncontestedPage() {
  const allCandidates = getAllCandidates();

  const uncontested = allCandidates
    .filter((c) => c.uncontested === true)
    .sort((a, b) => b.red_flags.length - a.red_flags.length);

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="space-y-3 border-b border-jacket-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          March 17, 2026 — Cook County Primary
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
          ⚠️ Running Alone
        </h1>
        <div className="h-1 w-16 bg-jacket-amber" />
        <p className="max-w-2xl text-lg text-zinc-300">
          No opponent doesn&apos;t mean no record. These incumbents appear on your ballot unopposed.
        </p>
        <p className="max-w-2xl border-l-2 border-zinc-700 pl-3 text-sm text-zinc-500">
          Sorted by red flag count — the most documented records surface first.
        </p>
      </section>

      {/* Candidate list */}
      {uncontested.length === 0 ? (
        <p className="text-sm text-zinc-500">No uncontested candidates found.</p>
      ) : (
        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            {uncontested.length} uncontested race{uncontested.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {uncontested.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </section>
      )}

      {/* Footer note */}
      <section className="border-t border-jacket-border pt-6">
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Running unopposed is a structural advantage, not a mandate. Ballot access barriers, patronage networks, and media relationships are how incumbents stay uncontested. The absence of a challenger is itself a civic story.
        </p>
      </section>
    </div>
  );
}
