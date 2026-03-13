const sources = [
  {
    source: "FEC API",
    use: "Federal campaign finance for U.S. Senate and U.S. House races",
    url: "https://api.open.fec.gov/v1/"
  },
  {
    source: "Illinois State Board of Elections (ILSBE)",
    use: "State and county campaign disclosure data",
    url: "https://www.elections.il.gov/CampaignDisclosure"
  },
  {
    source: "Cook County Clerk",
    use: "Official candidate filing and ballot references",
    url: "https://www.cookcountyclerkil.gov/elections"
  },
  {
    source: "WTTW / Chicago media voter guides",
    use: "Candidate field verification and election context",
    url: "https://news.wttw.com/elections/voters-guide/2026-primary"
  }
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="border border-jacket-border p-6">
        <h1 className="font-mono text-4xl uppercase">About TheJacket</h1>
        <p className="mt-4 text-sm italic text-zinc-300">
          &ldquo;Politicians should wear a jacket with all the companies and organizations that pay into them, so we can
          see who they really work for.&rdquo;
        </p>
        <p className="mt-4 max-w-4xl text-zinc-300">
          TheJacket is a civic transparency project focused on the March 17, 2026 Illinois primary in Cook County. It
          puts candidate finance context, donor categories, and public-record flags in one place.
        </p>
      </section>

      <section className="border border-jacket-border p-6">
        <h2 className="font-mono text-2xl uppercase">Mission</h2>
        <p className="mt-3 text-zinc-300">
          Make campaign money legible to regular voters by showing who funds each candidate and what public record
          issues are attached to their record.
        </p>
      </section>

      <section className="border border-jacket-border p-6">
        <h2 className="font-mono text-2xl uppercase">Data Sources</h2>
        <div className="mt-4 overflow-hidden border border-jacket-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-jacket-border bg-jacket-gray/30 text-left font-mono uppercase">
                <th className="p-3">Source</th>
                <th className="p-3">Use</th>
                <th className="p-3">URL</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((row) => (
                <tr key={row.source} className="border-b border-jacket-border/50">
                  <td className="p-3">{row.source}</td>
                  <td className="p-3">{row.use}</td>
                  <td className="p-3">
                    <a href={row.url} target="_blank" rel="noreferrer" className="text-jacket-amber">
                      {row.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-jacket-border p-6">
        <h2 className="font-mono text-2xl uppercase">Methodology</h2>
        <ul className="mt-3 space-y-2 text-zinc-300">
          <li>Only public-record sources are used for seeded candidate and race data.</li>
          <li>Unknown dollar values are set to null instead of guessed estimates.</li>
          <li>Any unconfirmed claim is marked as alleged and stored with confirmed: false.</li>
          <li>Federal and state/local finance streams are separated by FEC and ILSBE source labeling.</li>
        </ul>
      </section>

      <section className="border border-jacket-border p-6">
        <h2 className="font-mono text-2xl uppercase">Submit a Correction</h2>
        <p className="mt-3 text-zinc-300">
          Found an error or have a sourced update? Open an issue on{" "}
          <a
            href="https://github.com/rekaldsi/thejacket/issues"
            target="_blank"
            rel="noreferrer"
            className="text-jacket-amber underline"
          >
            GitHub
          </a>
          . All corrections must include a source URL.
        </p>
      </section>
    </div>
  );
}
