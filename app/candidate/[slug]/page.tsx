import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import TheJacket from "@/components/TheJacket";
import RedFlagBadge from "@/components/RedFlagBadge";
import MoneyAmount from "@/components/MoneyAmount";
import { getAllCandidates, getCandidateBySlug } from "@/lib/data";

export function generateStaticParams() {
  return getAllCandidates().map((candidate) => ({ slug: candidate.id }));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function getPartyPillClasses(party: string) {
  const upper = party.trim().toUpperCase();
  if (upper.startsWith("D")) return "bg-blue-900 text-blue-200";
  if (upper.startsWith("R")) return "bg-red-900 text-red-200";
  return "bg-zinc-800 text-zinc-200";
}

function getVoteTone(vote: string) {
  const upper = vote.toUpperCase();
  if (upper.includes("YES")) return "bg-green-900 text-green-200";
  if (upper.includes("NO")) return "bg-red-900 text-red-200";
  if (upper.includes("ABSENT")) return "bg-zinc-800 text-zinc-200";
  return "bg-zinc-800 text-zinc-200";
}

export default function CandidatePage({ params }: { params: { slug: string } }) {
  const candidate = getCandidateBySlug(params.slug);
  if (!candidate) notFound();

  const initials = getInitials(candidate.name);

  return (
    <div className="space-y-8">
      <section className="bg-jacket-gray px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-zinc-800 font-mono text-xl text-zinc-300">
              {candidate.photo_url ? (
                <Image src={candidate.photo_url} alt={candidate.name} width={80} height={80} className="h-20 w-20 object-cover" />
              ) : (
                initials
              )}
            </div>

            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">{candidate.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${getPartyPillClasses(candidate.party)}`}>{candidate.party}</span>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300">{candidate.office}</span>
              </div>
              {candidate.website ? (
                <Link
                  href={candidate.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-jacket-amber hover:underline"
                >
                  Official website
                </Link>
              ) : null}
            </div>
          </div>

          <div className="text-left lg:text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Raised</p>
            <MoneyAmount value={candidate.jacket.total_raised} className="text-3xl" />
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <article className="space-y-3">
            <h2 className="border-l-2 border-jacket-amber pl-3 text-sm font-black uppercase tracking-widest text-zinc-200">Bio</h2>
            <p className="text-sm leading-relaxed text-zinc-300">{candidate.bio}</p>
            <p className="text-xs text-zinc-400">Prior office: {candidate.prior_office || "n/a"}</p>
          </article>

          <article className="space-y-3">
            <h2 className="border-l-2 border-jacket-amber pl-3 text-sm font-black uppercase tracking-widest text-zinc-200">
              Key Votes
            </h2>
            {candidate.key_votes.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {candidate.key_votes.map((vote) => (
                  <li key={`${vote.bill}-${vote.vote}`} className="border-b border-jacket-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-mono ${getVoteTone(vote.vote)}`}>{vote.vote}</span>
                      <span className="font-mono text-jacket-amber">{vote.bill}</span>
                    </div>
                    <p className="mt-1 text-zinc-400">{vote.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-400">No vote records seeded yet.</p>
            )}
          </article>

          <article className="space-y-3">
            <h2 className="border-l-2 border-jacket-amber pl-3 text-sm font-black uppercase tracking-widest text-zinc-200">
              Endorsements
            </h2>
            {candidate.endorsements.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-300">
                {candidate.endorsements.map((endorsement) => (
                  <li key={endorsement.org}>
                    <span className="font-mono text-jacket-amber">{endorsement.org}</span>: {endorsement.significance}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-400">No endorsements seeded yet.</p>
            )}
          </article>
        </div>

        <div className="lg:col-span-3">
          <TheJacket
            candidateName={candidate.name}
            totalRaised={candidate.jacket.total_raised}
            donors={candidate.jacket.donors}
            sourceCitation={candidate.jacket.source}
          />
        </div>
      </section>

      {candidate.red_flags.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-black uppercase text-jacket-red">Red Flags</h2>
          {candidate.red_flags.map((flag) => (
            <RedFlagBadge key={`${flag.type}-${flag.label}`} flag={flag} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
