import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology — TheJacket",
  description: "How TheJacket scores candidates, sources data, and maintains editorial standards for Cook County civic transparency.",
};

const sectionHeader = "border-l-2 border-jacket-amber pl-3 font-mono text-lg font-black uppercase tracking-widest text-zinc-200";

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 py-4">

      {/* HERO */}
      <section className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          How We <span className="text-jacket-amber">Score</span>
        </h1>
        <div className="h-1 w-16 bg-jacket-amber" />
        <p className="text-base leading-relaxed text-zinc-300">
          TheJacket is a transparency tool, not an endorsement machine. Every score, flag, and fact
          on this platform traces back to a public record. Here&apos;s exactly how it works.
        </p>
      </section>

      {/* SCORING */}
      <section className="space-y-4">
        <h2 className={sectionHeader}>The A–F Transparency Score</h2>
        <p className="leading-relaxed text-zinc-300">
          Each candidate starts at 100 and loses points for specific, documented findings.
          The score measures <strong className="text-zinc-100">what&apos;s publicly verifiable</strong> — not
          policy positions, ideology, or electability.
        </p>
        <div className="space-y-2">
          {[
            { range: "A (90–100)", desc: "Clean public record. No dark money, no ethics violations, full financial disclosure available." },
            { range: "B (80–89)", desc: "Minor issues — limited disclosure, some PAC concentration, or incomplete public record." },
            { range: "C (70–79)", desc: "Notable concerns — significant PAC concentration, ethics inquiry, or limited transparency." },
            { range: "D (60–69)", desc: "Serious flags — dark money, ethics findings, criminal record, or corporate PAC dominance." },
            { range: "F (below 60)", desc: "No public financial record, confirmed ethics violations, or criminal conviction." },
          ].map((row) => (
            <div key={row.range} className="flex gap-4 border border-jacket-border p-3">
              <span className="w-24 shrink-0 font-mono text-sm font-black text-jacket-amber">{row.range}</span>
              <span className="text-sm text-zinc-400">{row.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          Every deduction links to a specific finding with a source. No points are deducted for
          unverified allegations — only confirmed public record.
        </p>
      </section>

      {/* CONFIRMED VS ALLEGED */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Confirmed vs. Alleged</h2>
        <div className="space-y-3">
          <div className="border border-jacket-border p-4">
            <p className="font-mono text-xs font-black uppercase tracking-widest text-green-400">confirmed: true</p>
            <p className="mt-1 text-sm text-zinc-300">
              The claim has been independently verified through official records, court documents,
              government filings, or multiple credible news sources. It is treated as fact.
            </p>
          </div>
          <div className="border border-jacket-border p-4">
            <p className="font-mono text-xs font-black uppercase tracking-widest text-yellow-500">confirmed: false</p>
            <p className="mt-1 text-sm text-zinc-300">
              The claim has been reported or alleged but has not been independently verified through
              primary sources. It is flagged as an allegation. Allegations do not reduce a candidate&apos;s
              score — only confirmed findings do.
            </p>
          </div>
        </div>
      </section>

      {/* DATA SOURCES */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Data Sources</h2>
        <p className="text-sm text-zinc-400">
          All data on TheJacket comes from public sources. No anonymous tips. No unverified claims.
        </p>
        <ul className="space-y-2">
          {[
            { name: "Illinois Sunshine (ILSBE)", use: "State and county campaign finance — committee filings, donor tables, cash on hand" },
            { name: "FEC", use: "Federal campaign finance for U.S. Senate and House races" },
            { name: "Illinois State Board of Elections", use: "Candidate filing records and official ballot certification" },
            { name: "Cook County Clerk", use: "Official candidate filings and results for Cook County races" },
            { name: "Injustice Watch", use: "Judicial candidate investigations, bar ratings, ethics complaints" },
            { name: "Alliance of Bar Associations for Judicial Screening", use: "Judicial ratings: Highly Recommended / Recommended / Not Recommended / Not Rated" },
            { name: "Chicago Bar Association (CBA)", use: "Supplemental judicial candidate evaluations" },
            { name: "ProPublica Congress API", use: "Voting records and bill sponsorship for federal incumbents" },
          ].map((row) => (
            <li key={row.name} className="flex gap-3 text-sm">
              <span className="mt-0.5 shrink-0 font-mono text-jacket-amber">—</span>
              <span>
                <span className="font-black text-zinc-200">{row.name}:</span>{" "}
                <span className="text-zinc-400">{row.use}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* DATA FRESHNESS */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Data Freshness</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Candidate data was last audited in March 2026 for the Cook County Primary. Financial data
          reflects ILSBE and FEC filings available as of that date. Each candidate profile shows a
          <code className="mx-1 rounded bg-zinc-800 px-1 font-mono text-xs text-jacket-amber">last_updated</code>
          field indicating when that specific profile was last reviewed.
        </p>
        <p className="text-sm leading-relaxed text-zinc-400">
          For November 2026 general election cycles, data will be refreshed as candidates file.
          Unknown or unavailable values are left null — we do not estimate or fill gaps.
        </p>
      </section>

      {/* JUDICIAL RATINGS */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Judicial Ratings</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Judicial candidates are evaluated by the Alliance of Bar Associations for Judicial Screening,
          a coalition of Chicago-area bar associations. Their rating scale:
        </p>
        <div className="space-y-2">
          {[
            { rating: "Highly Recommended", desc: "Top rating. Candidate meets the highest standards for the bench." },
            { rating: "Recommended", desc: "Qualified for the position." },
            { rating: "Not Recommended", desc: "Does not meet bar association standards." },
            { rating: "Not Rated", desc: "Candidate did not participate in the evaluation process." },
          ].map((row) => (
            <div key={row.rating} className="flex gap-4 border border-jacket-border p-3">
              <span className="w-44 shrink-0 font-mono text-xs font-black text-jacket-amber">{row.rating}</span>
              <span className="text-sm text-zinc-400">{row.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          Bar ratings are one signal among many. TheJacket also surfaces ethics complaints,
          Injustice Watch investigations, and disciplinary records for judicial candidates.
        </p>
      </section>

      {/* WHAT WE DON'T DO */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>What TheJacket Does NOT Do</h2>
        <ul className="space-y-2">
          {[
            "Endorse candidates — we do not make voting recommendations",
            "Express editorial opinions on policy positions",
            "Advocate for or against any candidate, party, or issue",
            "Accept outside funding, advertising, or sponsored content",
            "Use anonymous sources or unverified tips to build profiles",
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 shrink-0 font-mono text-zinc-600">✕</span>
              <span className="text-zinc-400">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CORRECTIONS */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Submit a Correction</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Found an error? We take accuracy seriously. If you have a primary source document
          (court filing, official record, news article from a credible outlet) that contradicts
          something on this platform, please send it to:
        </p>
        <a
          href="mailto:corrections@thejacket.cc"
          className="inline-block font-mono text-sm text-jacket-amber underline-offset-2 hover:underline"
        >
          corrections@thejacket.cc
        </a>
        <p className="text-sm text-zinc-500">
          Include the candidate name, the specific claim, and a link to the source document.
          We review all submissions and publish corrections promptly.
        </p>
      </section>

      {/* ABOUT */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>About the Platform</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          TheJacket is a nonpartisan, independently operated civic transparency platform focused on
          Cook County, Illinois. It is not affiliated with any campaign, party, PAC, or outside
          organization. No outside funding. No ads. No monetization.
        </p>
        <p className="text-sm leading-relaxed text-zinc-400">
          Built and maintained by a Chicago-based developer as a public service.
        </p>
        <Link
          href="/about"
          className="inline-block font-mono text-xs uppercase tracking-widest text-jacket-amber underline-offset-2 hover:underline"
        >
          → More about TheJacket
        </Link>
      </section>

    </div>
  );
}
