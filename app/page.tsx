import Link from "next/link";
import CandidateCard from "@/components/CandidateCard";
import { getAllCandidates, getRaces } from "@/lib/data";

const PRIMARY_DATE_UTC = Date.UTC(2026, 2, 17);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getDaysToPrimary() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = Math.ceil((PRIMARY_DATE_UTC - todayUtc) / MS_PER_DAY);
  return Math.max(diff, 0);
}

export default function HomePage() {
  const races = getRaces();
  const candidates = getAllCandidates();
  const flagged = candidates.filter((candidate) => candidate.red_flags.length > 0);
  const daysToPrimary = getDaysToPrimary();

  return (
    <div className="space-y-12">
      <section className="space-y-4 py-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          ILLINOIS PRIMARY - MARCH 17, 2026 - COOK COUNTY
        </p>
        <h1 className="text-8xl font-black uppercase leading-none tracking-tight md:text-9xl">THEJACKET</h1>
        <div className="h-1 w-20 bg-jacket-amber" />
        <p className="max-w-3xl text-xl text-zinc-300">See who they really work for.</p>
        <p className="my-4 max-w-2xl border-l-2 border-zinc-700 pl-3 text-sm italic text-zinc-500">
          &ldquo;Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them.&rdquo; - Robin
          Williams
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">PRIMARY IN {daysToPrimary} DAYS</p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">Priority Races</h2>
          <Link href="/races" className="text-xs uppercase tracking-widest text-jacket-amber">
            View All
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {races.map((race) => (
            <Link
              key={race.id}
              href={`/race/${race.slug}`}
              className="border-l-2 border-jacket-amber px-4 py-3 transition-colors hover:bg-jacket-gray/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black uppercase">{race.title}</h3>
                <span className="rounded-full bg-jacket-amber/20 px-2 py-1 text-xs font-mono text-jacket-amber">
                  {race.candidateCount} CANDIDATES
                </span>
              </div>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-500">{race.jurisdiction}</p>
              <p className="mt-3 text-sm text-zinc-300">{race.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black uppercase tracking-tight">Flagged Candidates</h2>
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
