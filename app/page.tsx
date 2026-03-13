import Link from "next/link";
import CandidateCard from "@/components/CandidateCard";
import { getAllCandidates, getRaces } from "@/lib/data";

export default function HomePage() {
  const races = getRaces();
  const candidates = getAllCandidates();
  const flagged = candidates.filter((candidate) => candidate.red_flags.length > 0);

  return (
    <div className="space-y-10">
      <section className="border border-jacket-border p-6">
        <p className="mb-4 text-xs italic text-zinc-400">
          &ldquo;Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them.&rdquo; &mdash; Robin Williams
        </p>
        <h1 className="font-mono text-5xl uppercase tracking-[0.2em] md:text-7xl">THEJACKET</h1>
        <p className="mt-4 max-w-3xl text-zinc-300">
          Civic transparency for Cook County. Every race. Every candidate. Every donor trail we can verify from public
          records.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-2xl uppercase">Priority Races</h2>
          <Link href="/races" className="text-sm uppercase text-jacket-amber">
            View All
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {races.map((race) => (
            <Link
              key={race.id}
              href={`/race/${race.slug}`}
              className="border border-jacket-border p-4 transition-colors hover:border-jacket-amber"
            >
              <h3 className="font-mono text-lg uppercase">{race.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{race.jurisdiction}</p>
              <p className="mt-3 text-sm text-zinc-300">{race.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-mono text-2xl uppercase">Flagged Candidates</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {flagged.length > 0 ? (
            flagged.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)
          ) : (
            <p className="text-zinc-400">No confirmed or alleged flags currently seeded.</p>
          )}
        </div>
      </section>
    </div>
  );
}
