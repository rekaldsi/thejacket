const sources = [
  // ── Official Records ──
  {
    source: "Illinois Sunshine (ILSBE)",
    use: "Primary source for all state and county campaign finance — committee filings, donor tables, cash on hand, expenditures for every candidate in Illinois",
    url: "https://illinoissunshine.org/",
    label: "illinoissunshine.org",
    category: "Official Records",
  },
  {
    source: "FEC — Federal Election Commission",
    use: "Federal campaign finance for U.S. Senate and U.S. House races — receipts, disbursements, donor itemization",
    url: "https://www.fec.gov/data/",
    label: "fec.gov",
    category: "Official Records",
  },
  {
    source: "Illinois State Board of Elections",
    use: "Candidate filing records, official ballot certification, and supplemental disclosure data",
    url: "https://www.elections.il.gov/CampaignDisclosure",
    label: "elections.il.gov",
    category: "Official Records",
  },
  {
    source: "Cook County Clerk",
    use: "Official candidate filing records and ballot verification for Cook County races",
    url: "https://www.cookcountyclerkil.gov/elections",
    label: "cookcountyclerkil.gov",
    category: "Official Records",
  },
  {
    source: "ProPublica Congress API",
    use: "Voting records, bill sponsorship, and attendance records for federal incumbents",
    url: "https://projects.propublica.org/api-docs/congress-api/",
    label: "propublica.org",
    category: "Official Records",
  },
  // ── Investigative Journalism ──
  {
    source: "Chicago Tribune",
    use: "Race coverage, endorsements, candidate investigations, and editorial board ratings used throughout candidate profiles",
    url: "https://www.chicagotribune.com/",
    label: "chicagotribune.com",
    category: "Journalism",
  },
  {
    source: "Chicago Sun-Times",
    use: "Candidate coverage, finance investigations, and endorsement records",
    url: "https://chicago.suntimes.com/",
    label: "chicago.suntimes.com",
    category: "Journalism",
  },
  {
    source: "Injustice Watch",
    use: "Primary source for judicial candidate investigations — bar ratings, ethics complaints, disciplinary records",
    url: "https://www.injusticewatch.org/",
    label: "injusticewatch.org",
    category: "Journalism",
  },
  {
    source: "WTTW Chicago Tonight",
    use: "Voter guide, candidate field verification, and election context for primary races",
    url: "https://news.wttw.com/elections/voters-guide/2026-primary",
    label: "news.wttw.com",
    category: "Journalism",
  },
  {
    source: "Block Club Chicago",
    use: "Neighborhood-level candidate coverage and community impact reporting",
    url: "https://blockclubchicago.org/",
    label: "blockclubchicago.org",
    category: "Journalism",
  },
  {
    source: "The Intercept",
    use: "National donor network investigations — AIPAC, Hindu nationalist networks, and outside spending",
    url: "https://theintercept.com/",
    label: "theintercept.com",
    category: "Journalism",
  },
  {
    source: "The Real Deal Chicago",
    use: "Real estate and finance donor investigations for Cook County races",
    url: "https://therealdeal.com/chicago/",
    label: "therealdeal.com/chicago",
    category: "Journalism",
  },
  {
    source: "Capitol Fax",
    use: "Illinois political intelligence, Springfield insider reporting, and campaign finance analysis",
    url: "https://capitolfax.com/",
    label: "capitolfax.com",
    category: "Journalism",
  },
  // ── Reference & Bar Ratings ──
  {
    source: "Alliance of Bar Associations for Judicial Screening",
    use: "Judicial candidate ratings (Qualified / Not Recommended / Highly Qualified) used in all judge scoring",
    url: "https://www.chicagobar.org/judicial-evaluations/",
    label: "chicagobar.org",
    category: "Reference",
  },
  {
    source: "Chicago Bar Association (CBA) Voters Guide",
    use: "Supplemental bar ratings and judicial candidate evaluations",
    url: "https://www.chicagobar.org/",
    label: "chicagobar.org",
    category: "Reference",
  },
  {
    source: "Wikipedia / Ballotpedia",
    use: "Candidate biography, prior office history, and race field verification — used for baseline facts only, always cross-referenced",
    url: "https://ballotpedia.org/",
    label: "ballotpedia.org",
    category: "Reference",
  },
];

const sectionHeader = "border-l-2 border-jacket-amber pl-3 font-mono text-lg font-black uppercase tracking-widest text-zinc-200";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 py-4">

      {/* HERO */}
      <section className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          About The<span className="text-jacket-amber">Jacket</span>
        </h1>
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
      <section className="space-y-6">
        <div>
          <h2 className={sectionHeader}>Data Sources</h2>
          <p className="mt-2 text-sm text-zinc-500">
            {sources.length} sources across official records, investigative journalism, and reference databases.
            Every fact in a candidate profile traces back to at least one of these.
          </p>
        </div>
        {(["Official Records", "Journalism", "Reference"] as const).map((cat) => {
          const catSources = sources.filter((s) => s.category === cat);
          return (
            <div key={cat} className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">{cat}</p>
              <div className="space-y-2">
                {catSources.map((row) => (
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
            </div>
          );
        })}
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
