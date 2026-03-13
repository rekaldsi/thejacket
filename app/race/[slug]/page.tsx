import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidatesByRaceId, getRaceBySlug, getRaces } from "@/lib/data";

export function generateStaticParams() {
  return getRaces().map((race) => ({ slug: race.slug }));
}

export default function RacePage({ params }: { params: { slug: string } }) {
  const race = getRaceBySlug(params.slug);
  if (!race) notFound();

  const candidates = getCandidatesByRaceId(race.id);

  return (
    <div className="space-y-6">
      <section className="border border-jacket-border p-5">
        <h1 className="font-mono text-3xl uppercase">{race.title}</h1>
        <p className="mt-2 text-zinc-400">{race.jurisdiction}</p>
        <p className="mt-4 max-w-4xl text-zinc-300">{race.description}</p>
      </section>

      <section className="overflow-hidden border border-jacket-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-jacket-border bg-jacket-gray/30 text-left font-mono uppercase">
              <th className="p-3">Candidate</th>
              <th className="p-3">Party</th>
              <th className="p-3">Top Donor Category</th>
              <th className="p-3">Flag Count</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const topDonor = candidate.jacket.donors.find((d) => typeof d.amount === "number" && d.amount > 0);
              return (
                <tr key={candidate.id} className="border-b border-jacket-border/50 hover:bg-jacket-gray/20">
                  <td className="p-3">
                    <Link href={`/candidate/${candidate.id}`} className="hover:text-jacket-amber">
                      {candidate.name}
                    </Link>
                  </td>
                  <td className="p-3">{candidate.party}</td>
                  <td className="p-3 uppercase text-zinc-300">{topDonor?.category ?? "n/a"}</td>
                  <td className="p-3">{candidate.red_flags.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
