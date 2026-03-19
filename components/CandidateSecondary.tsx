"use client";

import { useState } from "react";
import AccountabilityGap from "@/components/AccountabilityGap";
import type { Candidate } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

const sectionHeader =
  "border-l-2 border-jacket-amber pl-3 text-sm font-black uppercase tracking-widest text-zinc-200";

export default function CandidateSecondary({ candidate }: { candidate: Candidate }) {
  const { lang } = useLanguage();
  const d = translations[lang];
  const [expanded, setExpanded] = useState(false);

  const hasCareer = candidate.career_history && candidate.career_history.length > 0;
  const hasPlatform = candidate.policy_platform && candidate.policy_platform.length > 0;
  const hasEndorsements = candidate.endorsements.length > 0;
  const hasSocial = !!candidate.social_pulse;
  const hasTrust = candidate.trust_indicators && candidate.trust_indicators.length > 0;
  const hasAccountability = !!candidate.accountability_gap;

  if (!hasCareer && !hasPlatform && !hasEndorsements && !hasSocial && !hasTrust && !hasAccountability) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Mobile toggle — hidden on desktop */}
      <div className="sm:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full border border-jacket-border px-4 py-3 font-mono text-sm font-black uppercase tracking-widest text-zinc-300 transition-colors hover:border-jacket-amber hover:text-jacket-amber"
        >
          {expanded ? d.secondary_collapse : d.secondary_expand}
        </button>
      </div>

      {/* Content: collapsed on mobile by default, always visible on desktop */}
      <div className={`space-y-12 ${expanded ? "block" : "hidden"} sm:block`}>

        {/* Career History */}
        {hasCareer && (
          <section className="space-y-4">
            <h2 className={sectionHeader}>{d.secondary_career_header}</h2>
            <ol className="space-y-4 border-l-2 border-zinc-800 pl-4">
              {candidate.career_history!.map((entry, i) => (
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
        )}

        {/* Policy Platform */}
        {hasPlatform && (
          <section className="space-y-4">
            <h2 className={sectionHeader}>{d.secondary_platform_header}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {candidate.policy_platform!.map((item, i) => {
                // Handle both string and object formats gracefully
                const topic = typeof item === "string" ? null : item.topic;
                const position = typeof item === "string" ? item : item.position;
                const source = typeof item === "string" ? null : item.source;
                if (!position) return null;
                return (
                <div key={i} className="border border-jacket-border p-4 transition-colors hover:bg-jacket-gray/30">
                  {topic && (
                    <p className="mb-1 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber">
                      {topic}
                    </p>
                  )}
                  <p className="text-sm text-zinc-300">{position}</p>
                  {source ? (
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-xs text-zinc-500 hover:text-jacket-amber hover:underline"
                    >
                      {d.secondary_source}
                    </a>
                  ) : null}
                </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Endorsements */}
        {hasEndorsements && (
          <section className="space-y-3">
            <h2 className={sectionHeader}>{d.secondary_endorsements_header}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-300">
              {candidate.endorsements.map((endorsement) => (
                <li key={endorsement.org}>
                  <span className="font-mono text-jacket-amber">{endorsement.org}</span>:{" "}
                  {endorsement.significance}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Social Media Pulse */}
        {hasSocial && (
          <section className="space-y-3">
            <h2 className={sectionHeader}>{d.secondary_social_header}</h2>
            <div className="space-y-3 border border-jacket-border p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-xs font-black uppercase tracking-widest ${
                    candidate.social_pulse!.sentiment === "positive"
                      ? "bg-green-900 text-green-300"
                      : candidate.social_pulse!.sentiment === "negative"
                      ? "bg-red-900 text-red-300"
                      : candidate.social_pulse!.sentiment === "mixed"
                      ? "bg-amber-900 text-jacket-amber"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {candidate.social_pulse!.sentiment === "low-profile"
                    ? d.secondary_low_profile
                    : candidate.social_pulse!.sentiment}
                </span>
                <span className="font-mono text-xs text-zinc-600">
                  {d.secondary_updated} {candidate.social_pulse!.last_updated}
                </span>
              </div>
              <p className="text-sm text-zinc-300">{candidate.social_pulse!.summary}</p>
              {candidate.social_pulse!.sentiment === "low-profile" && (
                <p className="text-xs italic text-zinc-500">
                  {d.secondary_low_profile_note}
                </p>
              )}
              {candidate.social_pulse!.hashtags && candidate.social_pulse!.hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.social_pulse!.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* Trust Indicators */}
        {hasTrust && (
          <section className="space-y-3">
            <h2 className={sectionHeader}>{d.secondary_trust_header}</h2>
            <ul className="space-y-2">
              {candidate.trust_indicators!.map((indicator, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 text-base leading-snug">
                    {indicator.type === "positive" ? "✅" : indicator.type === "negative" ? "❌" : "⚪"}
                  </span>
                  <span className="text-zinc-300">
                    {indicator.label}
                    {typeof indicator.value === "string" &&
                    indicator.value !== "true" &&
                    indicator.value !== "false" ? (
                      <span className="ml-1 text-zinc-500">— {indicator.value}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Accountability Gap */}
        {hasAccountability && (
          <section className="space-y-4">
            <AccountabilityGap gap={candidate.accountability_gap!} />
          </section>
        )}
      </div>
    </div>
  );
}
