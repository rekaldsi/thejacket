const sources = [
  {
    source: "FEC API",
    use: "Federal campaign finance for U.S. Senate and U.S. House races",
    url: "https://api.open.fec.gov/v1/",
    label: "open.fec.gov",
  },
  {
    source: "Illinois State Board of Elections",
    use: "State and county campaign disclosure data",
    url: "https://www.elections.il.gov/CampaignDisclosure",
    label: "elections.il.gov",
  },
  {
    source: "Cook County Clerk",
    use: "Official candidate filing and ballot references",
    url: "https://www.cookcountyclerkil.gov/elections",
    label: "cookcountyclerkil.gov",
  },
  {
    source: "WTTW Chicago",
    use: "Candidate field verification and election context",
    url: "https://news.wttw.com/elections/voters-guide/2026-primary",
    label: "news.wttw.com",
  },
  {
    source: "ProPublica Congress API",
    use: "Voting records and bill sponsorship for federal incumbents",
    url: "https://projects.propublica.org/api-docs/congress-api/",
    label: "propublica.org",
  },
];

const sectionHeader = "border-l-2 border-jacket-amber pl-3 font-mono text-lg font-black uppercase tracking-widest text-zinc-200";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 py-4">

      {/* HERO */}
      <section className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">About TheJacket</h1>
        <div className="h-1 w-16 bg-jacket-amber" />
        <blockquote className="border-l-2 border-zinc-700 pl-4 text-base italic text-zinc-400">
          &ldquo;Politicians should wear a jacket with all the companies and organizations that pay into them,
          so we can see who they really work for.&rdquo;
          <span className="mt-1 block not-italic text-zinc-500">— Robin Williams</span>
        </blockquote>
        <p className="text-base leading-relaxed text-zinc-300">
          TheJacket is a nonpartisan civic transparency project built for Cook County voters heading into
          the March 17, 2026 Illinois primary. Every candidate. Every donor. Every red flag. No spin.
        </p>
      </section>

      {/* MISSION */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Mission</h2>
        <p className="leading-relaxed text-zinc-300">
          Campaign finance data exists — it&apos;s just scattered, dense, and designed for lawyers, not voters.
          TheJacket pulls that data into one place and makes it legible: who funds each candidate,
          what industry money they take, and what their public record looks like.
        </p>
        <p className="leading-relaxed text-zinc-300">
          The Transparency Score isn&apos;t a grade on policy. It&apos;s a grade on what&apos;s
          publicly verifiable — dark money, ethics findings, criminal record, corporate PAC
          concentration. Higher score = cleaner record. Lower = more flags. Every deduction is sourced.
        </p>
      </section>

      {/* DATA SOURCES */}
      <section className="space-y-4">
        <h2 className={sectionHeader}>Data Sources</h2>
        <div className="space-y-3">
          {sources.map((row) => (
            <div key={row.source} className="border border-jacket-border p-4 transition-colors hover:bg-jacket-gray/30">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="font-mono text-sm font-black uppercase tracking-wide text-jacket-amber">
                  {row.source}
                </span>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-zinc-500 underline-offset-2 hover:text-jacket-amber hover:underline"
                >
                  ↗ {row.label}
                </a>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{row.use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Methodology</h2>
        <ul className="space-y-3 text-zinc-300">
          {[
            "Only public-record sources are used. No anonymous tips, no unverified claims.",
            "Unknown dollar values are left null — we don't estimate or guess.",
            "Any unconfirmed claim is marked as alleged. Confirmed: false means it hasn't been independently verified.",
            "Federal and state/local finance data are tracked separately — FEC handles federal races, ILSBE handles state and county.",
            "Scores are deduction-based from a baseline of 100. Every point deducted links to a specific finding.",
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 shrink-0 font-mono text-jacket-amber">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* BUILT BY */}
      <section className="space-y-3">
        <h2 className={sectionHeader}>Built By</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          TheJacket is an independent civic project. Not affiliated with any campaign, party, or PAC.
          Built in Chicago. Launched March 2026.
        </p>
      </section>

    </div>
  );
}
