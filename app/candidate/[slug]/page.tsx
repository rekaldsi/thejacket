import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import TheJacket from "@/components/TheJacket";
import RedFlagBadge from "@/components/RedFlagBadge";
import MoneyAmount from "@/components/MoneyAmount";
import UncontestedBadge from "@/components/UncontestedBadge";
import JailDeathTimeline from "@/components/JailDeathTimeline";
import CandidateSecondary from "@/components/CandidateSecondary";
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

const sectionHeader = "border-l-2 border-jacket-amber pl-3 text-sm font-black uppercase tracking-widest text-zinc-200";

export default function CandidatePage({ params }: { params: { slug: string } }) {
  const candidate = getCandidateBySlug(params.slug);
  if (!candidate) notFound();

  const initials = getInitials(candidate.name);
  const isUncontested = candidate.uncontested === true;
  const isWithdrawn = candidate.status === "withdrawn";

  return (
    <div className="space-y-12">

      {/* ── WITHDRAWN BANNER ── */}
      {isWithdrawn && (
        <div className="border border-zinc-600 bg-zinc-900 px-5 py-4">
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-zinc-300">
            ⚠️ This candidate has withdrawn from the race
          </p>
          {candidate.withdrawal_note && (
            <p className="mt-1 text-xs text-zinc-500">{candidate.withdrawal_note}</p>
          )}
          <p className="mt-2 text-xs text-zinc-600">
            They will not appear on the March 17, 2026 ballot. Profile is preserved for historical reference.
          </p>
        </div>
      )}

      {/* ── 1. CANDIDATE HEADER ── */}
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
              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-4xl">{candidate.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${getPartyPillClasses(candidate.party)}`}>{candidate.party}</span>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300">{candidate.office}</span>
                {isUncontested && <UncontestedBadge />}
                {candidate.data_status === "limited" && (
                  <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">Limited Data</span>
                )}
              </div>

              {isUncontested && candidate.years_in_office ? (
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
                  Year{" "}
                  <span className="text-red-400">{candidate.years_in_office}</span>{" "}
                  in office — running unopposed
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-3">
                {candidate.website ? (
                  <a href={candidate.website} target="_blank" rel="noreferrer" className="text-xs text-jacket-amber hover:underline">
                    ↗ Campaign site
                  </a>
                ) : null}
                {candidate.jacket.fec_id ? (
                  <a
                    href={`https://www.fec.gov/data/candidate/${candidate.jacket.fec_id}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-jacket-amber hover:underline"
                  >
                    ↗ FEC filing ({candidate.jacket.fec_id})
                  </a>
                ) : null}
                {candidate.jacket.ilsbe_id ? (
                  <a
                    href={`https://www.illinoissunshine.org/committees/${candidate.jacket.ilsbe_id}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-jacket-amber hover:underline"
                  >
                    ↗ ILSBE filing ({candidate.jacket.ilsbe_id})
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="text-left lg:text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Raised</p>
            <MoneyAmount value={candidate.jacket.total_raised} className="text-3xl" />
          </div>
        </div>
      </section>

      {/* ── 2. LIMITED DATA BANNER ── */}
      {candidate.data_status === "limited" ? (
        <section className="border-l-4 border-zinc-600 bg-zinc-900/50 px-5 py-4">
          <p className="text-sm text-zinc-400">
            <span className="font-mono font-bold text-zinc-300">Limited public data.</span>{" "}
            {candidate.data_note || "Check your county clerk's office or the Illinois State Board of Elections for filing info."}
          </p>
        </section>
      ) : null}

      {/* ── 3. UNCONTESTED LEDE ── */}
      {isUncontested ? (
        <section className="border-l-4 border-red-700 bg-red-950/20 px-5 py-4">
          <p className="text-base italic leading-relaxed text-zinc-300">
            {candidate.id === "thomas-dart" ? (
              <>
                Thomas Dart has run Cook County&apos;s jail for 20 years. In 2023, 18 people died inside it — the deadliest year in three decades. In 2026, he faces no primary opponent. This is his record.
              </>
            ) : (
              <>
                {candidate.name} is running unopposed in the {candidate.office} race.{" "}
                {candidate.years_in_office ? `${candidate.years_in_office} years in office. ` : ""}
                No challenger doesn&apos;t mean no record.
              </>
            )}
          </p>
        </section>
      ) : null}

      {/* ── 4. THE JACKET — hero feature, full width ── */}
      <section>
        <TheJacket
          candidateName={candidate.name}
          totalRaised={candidate.jacket.total_raised}
          donors={candidate.jacket.donors}
          sourceCitation={candidate.jacket.source}
          donorsNote={candidate.jacket.donors_note}
        />
      </section>

      {/* ── 5. RED FLAGS ── */}
      {candidate.red_flags.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-black uppercase text-jacket-red">Red Flags</h2>
          {candidate.red_flags.map((flag) => (
            <RedFlagBadge key={`${flag.type}-${flag.label}`} flag={flag} />
          ))}
        </section>
      ) : null}

      {/* ── 6. BIO + KEY VOTES — side by side on desktop ── */}
      <section className="grid gap-8 md:grid-cols-2">
        <article className="space-y-3">
          <h2 className={sectionHeader}>Bio</h2>
          <p className="text-sm leading-relaxed text-zinc-300">{candidate.bio}</p>
          <p className="text-xs text-zinc-400">Prior office: {candidate.prior_office || "n/a"}</p>
        </article>

        <article className="space-y-3">
          <h2 className={sectionHeader}>Key Votes</h2>
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
            <p className="text-sm text-zinc-400">No public vote records on file for this candidate.</p>
          )}
        </article>
      </section>

      {/* ── 7. JAIL DEATH TIMELINE — always visible (Thomas Dart only) ── */}
      {candidate.jail_timeline && candidate.jail_timeline.length > 0 ? (
        <section className="space-y-4">
          <h2 className="border-l-2 border-jacket-amber pl-3 text-2xl font-black uppercase tracking-tight text-zinc-100">
            The Record
          </h2>
          <p className="text-sm text-zinc-500">A timeline of key events on this incumbent&apos;s watch.</p>
          <JailDeathTimeline events={candidate.jail_timeline} />
        </section>
      ) : null}

      {/* ── 8. SECONDARY CONTENT — collapsible on mobile ── */}
      <CandidateSecondary candidate={candidate} />

    </div>
  );
}
