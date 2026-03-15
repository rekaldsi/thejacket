"use client";

import { useState } from "react";
import AccountabilityGap from "@/components/AccountabilityGap";
import type { Candidate } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { useTranslateStr } from "@/lib/useTranslate";

const sectionHeader =
  "border-l-2 border-jacket-amber pl-3 text-sm font-black uppercase tracking-widest text-zinc-200";

// Translatable section label component
function SectionLabel({ en, es }: { en: string; es: string }) {
  const { lang } = useLanguage();
  return <h2 className={sectionHeader}>{lang === "es" ? es : en}</h2>;
}

// Translatable text span
function Tx({ children }: { children: string }) {
  const translated = useTranslateStr(children ?? "");
  return <>{translated}</>;
}

export default function CandidateSecondary({ candidate }: { candidate: Candidate }) {
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLanguage();

  const hasCareer = candidate.career_history && candidate.career_history.length > 0;
  const hasPlatform = candidate.policy_platform && candidate.policy_platform.length > 0;
  const hasEndorsements = candidate.endorsements.length > 0;
  const hasSocial = !!candidate.social_pulse;
  const hasTrust = candidate.trust_indicators && candidate.trust_indicators.length > 0;
  const hasAccountability = !!candidate.accountability_gap;

  if (!hasCareer && !hasPlatform && !hasEndorsements && !hasSocial && !hasTrust && !hasAccountability) {
    return null;
  }

  const collapseLabel = lang === "es" ? "Colapsar ↑" : "Collapse ↑";
  const expandLabel = lang === "es" ? "Historial completo ↓" : "Full Record ↓";
  const sourceLabel = lang === "es" ? "↗ Fuente" : "↗ Source";

  return (
    <div className="space-y-12">
      {/* Mobile toggle — hidden on desktop */}
      <div className="sm:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full border border-jacket-border px-4 py-3 font-mono text-sm font-black uppercase tracking-widest text-zinc-300 transition-colors hover:border-jacket-amber hover:text-jacket-amber"
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      </div>

      {/* Content: collapsed on mobile by default, always visible on desktop */}
      <div className={`space-y-12 ${expanded ? "block" : "hidden"} sm:block`}>

        {/* Career History */}
        {hasCareer && (
          <section className="space-y-4">
            <SectionLabel en="Career History" es="Trayectoria Profesional" />
            <ol className="space-y-4 border-l-2 border-zinc-800 pl-4">
              {candidate.career_history!.map((entry, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.3rem] top-1 h-2.5 w-2.5 rounded-full bg-jacket-amber" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-black text-zinc-100">
                      <Tx>{entry.role}</Tx>
                      {entry.org ? <span className="font-normal text-zinc-400"> — <Tx>{entry.org}</Tx></span> : null}
                    </span>
                    <span className="font-mono text-xs text-jacket-amber">{entry.years}</span>
                  </div>
                  {entry.highlight ? (
                    <p className="mt-0.5 text-sm text-zinc-400"><Tx>{entry.highlight}</Tx></p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Policy Platform */}
        {hasPlatform && (
          <section className="space-y-4">
            <SectionLabel en="What They Stand For" es="Lo Que Defienden" />
            <div className="grid gap-3 sm:grid-cols-2">
              {candidate.policy_platform!.map((item, i) => {
                const topic = typeof item === "string" ? null : item.topic;
                const position = typeof item === "string" ? item : item.position;
                const source = typeof item === "string" ? null : item.source;
                if (!position) return null;
                return (
                  <div key={i} className="border border-jacket-border p-4 transition-colors hover:bg-jacket-gray/30">
                    {topic && (
                      <p className="mb-1 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber">
                        <Tx>{topic}</Tx>
                      </p>
                    )}
                    <p className="text-sm text-zinc-300"><Tx>{position}</Tx></p>
                    {source ? (
                      <a
                        href={source}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block text-xs text-zinc-500 hover:text-jacket-amber hover:underline"
                      >
                        {sourceLabel}
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
            <SectionLabel en="Endorsements" es="Respaldos" />
            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-300">
              {candidate.endorsements.map((endorsement) => (
                <li key={endorsement.org}>
                  <span className="font-mono text-jacket-amber">{endorsement.org}</span>:{" "}
                  <Tx>{endorsement.significance}</Tx>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Social Media Pulse */}
        {hasSocial && (
          <section className="space-y-3">
            <SectionLabel en="Social Media Pulse" es="Pulso en Redes Sociales" />
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
                    ? (lang === "es" ? "perfil bajo" : "low profile")
                    : candidate.social_pulse!.sentiment === "positive"
                    ? (lang === "es" ? "positivo" : "positive")
                    : candidate.social_pulse!.sentiment === "negative"
                    ? (lang === "es" ? "negativo" : "negative")
                    : (lang === "es" ? "mixto" : "mixed")}
                </span>
                <span className="font-mono text-xs text-zinc-600">
                  {lang === "es" ? "Actualizado" : "Updated"} {candidate.social_pulse!.last_updated}
                </span>
              </div>
              <p className="text-sm text-zinc-300"><Tx>{candidate.social_pulse!.summary}</Tx></p>
              {candidate.social_pulse!.sentiment === "low-profile" && (
                <p className="text-xs italic text-zinc-500">
                  {lang === "es"
                    ? "Perfil bajo significa presencia pública limitada — no es una señal de alerta en sí misma."
                    : "Low profile means limited public presence — not a red flag on its own."}
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
            <SectionLabel en="Trust Indicators" es="Indicadores de Confianza" />
            <ul className="space-y-2">
              {candidate.trust_indicators!.map((indicator, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 text-base leading-snug">
                    {indicator.type === "positive" ? "✅" : indicator.type === "negative" ? "❌" : "⚪"}
                  </span>
                  <span className="text-zinc-300">
                    <Tx>{indicator.label}</Tx>
                    {typeof indicator.value === "string" &&
                    indicator.value !== "true" &&
                    indicator.value !== "false" ? (
                      <span className="ml-1 text-zinc-500">— <Tx>{indicator.value}</Tx></span>
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
