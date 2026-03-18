import type { Metadata } from "next";
import { getAllJudges } from "@/lib/data";
import JudicialResults from "@/components/JudicialResults";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2026 Illinois Primary Judge Results — TheJacket.cc",
  description:
    "March 17, 2026 Cook County judicial primary results — contested races and retention votes with bar association ratings. First site in Chicago tracking all 23 judicial races.",
  openGraph: {
    title: "2026 Illinois Primary Judge Results — TheJacket.cc",
    description:
      "Cook County judicial primary results with bar association ratings. No other outlet is showing this.",
    images: [{ url: "/logo.png" }],
  },
};

export default function JudgesResultsPage() {
  const judges = getAllJudges();

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-600">
        <Link href="/" className="hover:text-jacket-amber transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/results" className="hover:text-jacket-amber transition-colors">
          Results
        </Link>
        <span>/</span>
        <span className="text-zinc-400">Judges</span>
      </nav>

      {/* Page header */}
      <div className="border-b border-jacket-border pb-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          March 17, 2026 · Cook County
        </p>
        <h1 className="text-4xl font-black uppercase leading-tight tracking-tight">
          Judicial <span className="text-jacket-amber">Results</span>
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Cook County judicial primary results — contested races with vote percentages and bar
          association ratings. Illinois requires 60% YES vote for retention. No other Chicago
          outlet is aggregating this.
        </p>

        {/* CTA to /judges for pre-election profiles */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Link
            href="/judges"
            className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-jacket-amber transition-colors"
          >
            ← Judge profiles + bar ratings
          </Link>
          <Link
            href="/results"
            className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-jacket-amber transition-colors"
          >
            All race results →
          </Link>
        </div>
      </div>

      {/* Results component */}
      <JudicialResults judges={judges} showAll />

      {/* Footer note */}
      <div className="border-t border-jacket-border pt-6 text-xs text-zinc-600 space-y-1">
        <p>
          Source:{" "}
          <a
            href="https://electionnight.cookcountyclerkil.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-jacket-amber transition-colors underline underline-offset-2"
          >
            Cook County Clerk Election Night Site
          </a>
          {" "}· Bar ratings:{" "}
          <a
            href="https://www.chicagobar.org/CBA/JEC/Judicial_Voters_Guide.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-jacket-amber transition-colors underline underline-offset-2"
          >
            Chicago Bar Association Judicial Evaluation Committee
          </a>
        </p>
        <p>
          Certified results published post-election by ILSBE. All data is non-partisan. DYOR.
        </p>
      </div>
    </div>
  );
}
