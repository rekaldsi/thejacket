import { notFound } from "next/navigation";
import TheJacket from "@/components/TheJacket";
import RedFlagBadge from "@/components/RedFlagBadge";
import { getAllCandidates, getCandidateBySlug } from "@/lib/data";

export function generateStaticParams() {
  return getAllCandidates().map((candidate) => ({ slug: candidate.id }));
}

export default function CandidatePage({ params }: { params: { slug: string } }) {
  const candidate = getCandidateBySlug(params.slug);
  if (!candidate) notFound();

  return (
    <div className="space-y-6">
      <section className="border border-jacket-border p-5">
        <h1 className="font-mono text-4xl uppercase">{candidate.name}</h1>
        <p className="mt-2 text-zinc-300">{candidate.office}</p>
        <p className="text-sm text-zinc-500">{candidate.party}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <article className="border border-jacket-border p-4">
            <h2 className="font-mono text-xl uppercase">Bio</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{candidate.bio}</p>
            <p className="mt-3 text-xs text-zinc-500">Prior office: {candidate.prior_office || "n/a"}</p>
          </article>

          <article className="border border-jacket-border p-4">
            <h2 className="font-mono text-xl uppercase">Key Votes</h2>
            {candidate.key_votes.length > 0 ? (
              <ul className="mt-3 space-y-3 text-sm">
                {candidate.key_votes.map((vote) => (
                  <li key={`${vote.bill}-${vote.vote}`}>
                    <p className="font-mono text-jacket-amber">{vote.bill}</p>
                    <p>{vote.vote}</p>
                    <p className="text-zinc-400">{vote.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">No vote records seeded yet.</p>
            )}
          </article>

          <article className="border border-jacket-border p-4">
            <h2 className="font-mono text-xl uppercase">Endorsements</h2>
            {candidate.endorsements.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {candidate.endorsements.map((endorsement) => (
                  <li key={endorsement.org}>
                    <span className="font-mono text-jacket-amber">{endorsement.org}</span>: {endorsement.significance}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">No endorsements seeded yet.</p>
            )}
          </article>
        </div>

        <div>
          <TheJacket totalRaised={candidate.jacket.total_raised} donors={candidate.jacket.donors} />
        </div>
      </section>

      <section className="space-y-3 border border-jacket-border p-4">
        <h2 className="font-mono text-2xl uppercase text-jacket-red">Red Flags</h2>
        {candidate.red_flags.length > 0 ? (
          candidate.red_flags.map((flag) => <RedFlagBadge key={`${flag.type}-${flag.label}`} flag={flag} />)
        ) : (
          <p className="text-sm text-zinc-400">No confirmed or alleged red flags seeded.</p>
        )}
      </section>
    </div>
  );
}
