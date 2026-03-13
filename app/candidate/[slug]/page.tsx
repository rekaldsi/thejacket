import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import TheJacket from "@/components/TheJacket";
import RedFlagBadge from "@/components/RedFlagBadge";
import MoneyAmount from "@/components/MoneyAmount";
import UncontestedBadge from "@/components/UncontestedBadge";
import JailDeathTimeline from "@/components/JailDeathTimeline";
import AccountabilityGap from "@/components/AccountabilityGap";
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
              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-4xl">{candidate.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${getPartyPillClasses(candidate.party)}`}>{candidate.party}</span>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300">{candidate.office}</span>
                {isUncontested && <UncontestedBadge />}
              </div>

              {/* Uncontested incumbency callout */}
              {isUncontested && candidate.years_in_office ? (
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
                  Year{" "}
                  <span className="text-red-400">{candidate.years_in_office}</span>{" "}
                  in office — running unopposed
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-3">
                {candidate.website ? (
                  <a
                    href={candidate.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-jacket-amber hover:underline"
                  >
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
                    href={`https://www.transparencyusa.org/il/committee/friends-of-dart-${candidate.jacket.ilsbe_id}/contributors`}
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

      {/* Uncontested lede — shown before main content */}
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

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
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

          <article className="space-y-3">
            <h2 className={sectionHeader}>Endorsements</h2>
            {candidate.endorsements.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-300">
                {candidate.endorsements.map((endorsement) => (
                  <li key={endorsement.org}>
                    <span className="font-mono text-jacket-amber">{endorsement.org}</span>: {endorsement.significance}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-400">No endorsements on file for this candidate.</p>
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

      {/* Career Timeline */}
      {candidate.career_history && candidate.career_history.length > 0 ? (
        <section className="space-y-4">
          <h2 className={sectionHeader}>Career History</h2>
          <ol className="space-y-4 border-l-2 border-zinc-800 pl-4">
            {candidate.career_history.map((entry, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.3rem] top-1 h-2.5 w-2.5 rounded-full bg-jacket-amber" />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-black text-zinc-100">
                    {entry.role}
                    {entry.org ? <span className="font-normal text-zinc-400"> — {entry.org}</span> : null}
                  </span>
                  <span className="font-mono text-xs text-jacket-amber">{entry.years}</span>
                </div>
                {entry.highlight ? (
                  <p className="mt-0.5 text-sm text-zinc-400">{entry.highlight}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* What They Stand For */}
      {candidate.policy_platform && candidate.policy_platform.length > 0 ? (
        <section className="space-y-4">
          <h2 className={sectionHeader}>What They Stand For</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {candidate.policy_platform.map((item, i) => (
              <div key={i} className="border border-jacket-border p-4 hover:bg-jacket-gray/30 transition-colors">
                <p className="mb-1 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber">{item.topic}</p>
                <p className="text-sm text-zinc-300">{item.position}</p>
                {item.source ? (
                  <a
                    href={item.source}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs text-zinc-500 hover:text-jacket-amber hover:underline"
                  >
                    ↗ Source
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Social Media Pulse */}
      {candidate.social_pulse ? (
        <section className="space-y-3">
          <h2 className={sectionHeader}>Social Media Pulse</h2>
          <div className="border border-jacket-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-mono font-black uppercase tracking-widest ${
                  candidate.social_pulse.sentiment === "positive"
                    ? "bg-green-900 text-green-300"
                    : candidate.social_pulse.sentiment === "negative"
                    ? "bg-red-900 text-red-300"
                    : candidate.social_pulse.sentiment === "mixed"
                    ? "bg-amber-900 text-jacket-amber"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {candidate.social_pulse.sentiment}
              </span>
              <span className="font-mono text-xs text-zinc-600">Updated {candidate.social_pulse.last_updated}</span>
            </div>
            <p className="text-sm text-zinc-300">{candidate.social_pulse.summary}</p>
            {candidate.social_pulse.hashtags && candidate.social_pulse.hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.social_pulse.hashtags.map((tag) => (
                  <span key={tag} className="rounded-sm bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Trust Indicators */}
      {candidate.trust_indicators && candidate.trust_indicators.length > 0 ? (
        <section className="space-y-3">
          <h2 className={sectionHeader}>Trust Indicators</h2>
          <ul className="space-y-2">
            {candidate.trust_indicators.map((indicator, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 text-base leading-snug">
                  {indicator.type === "positive" ? "✅" : indicator.type === "negative" ? "❌" : "⚪"}
                </span>
                <span className="text-zinc-300">
                  {indicator.label}
                  {typeof indicator.value === "string" && indicator.value !== "true" && indicator.value !== "false" ? (
                    <span className="ml-1 text-zinc-500">— {indicator.value}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Jail Death Timeline */}
      {candidate.jail_timeline && candidate.jail_timeline.length > 0 ? (
        <section className="space-y-4">
          <h2 className="border-l-2 border-jacket-amber pl-3 text-2xl font-black uppercase tracking-tight text-zinc-100">
            The Record
          </h2>
          <p className="text-sm text-zinc-500">A timeline of key events on this incumbent&apos;s watch.</p>
          <JailDeathTimeline events={candidate.jail_timeline} />
        </section>
      ) : null}

      {/* Accountability Gap */}
      {candidate.accountability_gap ? (
        <section className="space-y-4">
          <AccountabilityGap gap={candidate.accountability_gap} />
        </section>
      ) : null}
    </div>
  );
}
