import Link from "next/link";
import type { Candidate } from "@/lib/types";
import MoneyAmount from "@/components/MoneyAmount";

type CandidateCardProps = {
  candidate: Candidate;
};

export default function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Link
      href={`/candidate/${candidate.id}`}
      className="block border border-jacket-border p-4 transition-colors hover:border-jacket-amber"
    >
      <h3 className="font-mono text-lg uppercase tracking-wide">{candidate.name}</h3>
      <p className="mt-1 text-sm text-zinc-300">{candidate.party}</p>
      <p className="mt-2 text-sm text-zinc-400">{candidate.office}</p>
      <div className="mt-3 text-sm">
        Raised: <MoneyAmount value={candidate.jacket.total_raised} />
      </div>
      <div className="mt-2 text-xs text-zinc-500">Flags: {candidate.red_flags.length}</div>
    </Link>
  );
}
