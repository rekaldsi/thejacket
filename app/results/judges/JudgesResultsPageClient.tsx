"use client";

import Link from "next/link";
import type { Judge } from "@/lib/types";
import JudicialResults from "@/components/JudicialResults";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

export default function JudgesResultsPageClient({ judges }: { judges: Judge[] }) {
  const { lang } = useLanguage();
  const d = translations[lang];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-600">
        <Link href="/" className="hover:text-jacket-amber transition-colors">
          {d.judges_results_breadcrumb_home}
        </Link>
        <span>/</span>
        <Link href="/results" className="hover:text-jacket-amber transition-colors">
          {d.judges_results_breadcrumb_results}
        </Link>
        <span>/</span>
        <span className="text-zinc-400">{d.judges_results_breadcrumb_judges}</span>
      </nav>

      {/* Page header */}
      <div className="border-b border-jacket-border pb-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          {d.judges_results_dateline}
        </p>
        <h1 className="text-4xl font-black uppercase leading-tight tracking-tight">
          {lang === "es" ? "Resultados" : "Judicial"}{" "}
          <span className="text-jacket-amber">{lang === "es" ? "Judiciales" : "Results"}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          {d.judges_results_desc}
        </p>

        {/* CTA to /judges for pre-election profiles */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Link
            href="/judges"
            className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-jacket-amber transition-colors"
          >
            {d.judges_results_profiles_link}
          </Link>
          <Link
            href="/results"
            className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-jacket-amber transition-colors"
          >
            {d.judges_results_all_races_link}
          </Link>
        </div>
      </div>

      {/* Results component */}
      <JudicialResults judges={judges} showAll />

      {/* Footer note */}
      <div className="border-t border-jacket-border pt-6 text-xs text-zinc-600 space-y-1">
        <p>
          {d.judges_results_source_label}{" "}
          <a
            href="https://electionnight.cookcountyclerkil.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-jacket-amber transition-colors underline underline-offset-2"
          >
            Cook County Clerk Election Night Site
          </a>
          {" "}· {d.judges_results_bar_assoc_label}{" "}
          <a
            href="https://www.chicagobar.org/CBA/JEC/Judicial_Voters_Guide.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-jacket-amber transition-colors underline underline-offset-2"
          >
            Chicago Bar Association Judicial Evaluation Committee
          </a>
        </p>
        <p>{d.judges_results_certified_note}</p>
      </div>
    </div>
  );
}
