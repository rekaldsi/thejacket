import Link from "next/link";
import { getCandidatesByRaceId, getRaces } from "@/lib/data";

const OFFICE_EXPLAINERS: Record<string, string> = {
  "U.S. Senate": "Represents all of Illinois in Washington. One of the most powerful offices on the ballot.",
  "U.S. House": "Represents a congressional district in Washington. Sets federal policy on your behalf.",
  "Cook County Board President": "Runs Cook County government — health systems, criminal justice, $9B+ budget.",
  "Cook County Commissioner": "One of 17 seats that govern Cook County. Sets the county budget, oversees the sheriff, courts, and health system for 5M people.",
  "Cook County Assessor": "Determines property tax assessments for every home and business in Cook County.",
  "Cook County Clerk": "Runs elections and vital records for Cook County.",
  "Cook County Sheriff": "Oversees the Cook County Jail and county law enforcement.",
  "Cook County Treasurer": "Manages $11B+ in county funds and property tax collections.",
  "Metropolitan Water Reclamation District": "Controls sewage and stormwater for 5M people. $2B+ annual budget. Rarely covered — but it matters.",
  "Illinois State Senate": "One of 59 seats in the state senate. Sets Illinois law.",
  "Illinois State Representative": "One of 118 seats in the state house. Sets Illinois law.",
  "Illinois Governor": "The most powerful office in state government. Controls a $52B+ budget, signs or vetoes every bill the legislature passes, and sets the direction for Illinois.",
  "Illinois Attorney General": "Illinois's chief law enforcement officer. Investigates consumer fraud, enforces environmental law, and can sue the federal government on behalf of the state.",
  "Illinois Treasurer": "Manages the state's investment portfolio and oversees the I-Cash unclaimed property program. Low-profile but controls billions in state assets.",
  "Illinois Comptroller": "Pays the state's bills and audits local governments. First line of financial oversight — especially critical as federal funding to Illinois faces cuts.",
};

function getExplainer(title: string): string | null {
  for (const [key, val] of Object.entries(OFFICE_EXPLAINERS)) {
    if (title.includes(key)) return val;
  }
  return null;
}

export default function RacesPage() {
  const races = getRaces().filter((r) => !r.note?.includes("judicial"));

  const isStatewide = (title: string) =>
    title.includes("Illinois Governor") ||
    title.includes("Illinois Attorney General") ||
    title.includes("Illinois Treasurer") ||
    title.includes("Illinois Comptroller") ||
    title.includes("Illinois Secretary") ||
    title.includes("Illinois Lieutenant");

  const grouped = {
    federal: races.filter((r) => r.title.includes("U.S.")),
    statewide: races.filter((r) => isStatewide(r.title)),
    state: races.filter((r) =>
      !isStatewide(r.title) &&
      (r.title.includes("Illinois State") || r.title.includes("IL Senate") || r.title.includes("IL House"))
    ),
    county: races.filter((r) =>
      r.title.includes("Cook County") || r.title.includes("MWRD") || r.title.includes("Water Reclamation")
    ),
  };

  function RaceCard({ race }: { race: ReturnType<typeof getRaces>[0] }) {
    const candidates = getCandidatesByRaceId(race.id);
    const explainer = getExplainer(race.title);
    return (
      <Link
        key={race.id}
        href={`/race/${race.slug}`}
        className="flex flex-col gap-2 border border-jacket-border p-4 transition-colors hover:border-jacket-amber"
      >
        <h3 className="font-mono text-sm font-black uppercase leading-tight">{race.title}</h3>
        {explainer && (
          <p className="text-xs text-zinc-500">{explainer}</p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-1">
          <span className="font-mono text-xs text-jacket-amber">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
          </span>
          <span className="font-mono text-xs text-zinc-600">{race.jurisdiction}</span>
          <span className="ml-auto font-mono text-xs text-zinc-500">→</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-mono text-4xl uppercase tracking-tight">All Races</h1>
        <p className="mt-2 text-sm text-zinc-500">Every contested race on the March 17 Illinois primary ballot.</p>
      </div>

      <section>
        <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-jacket-amber">Federal</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {grouped.federal.map((race) => <RaceCard key={race.id} race={race} />)}
        </div>
      </section>

      {grouped.statewide.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-jacket-amber">Statewide — Illinois</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {grouped.statewide.map((race) => <RaceCard key={race.id} race={race} />)}
          </div>
        </section>
      )}

      {grouped.state.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-jacket-amber">State Legislature</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {grouped.state.map((race) => <RaceCard key={race.id} race={race} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-jacket-amber">Cook County</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {grouped.county.map((race) => <RaceCard key={race.id} race={race} />)}
        </div>
      </section>
    </div>
  );
}
